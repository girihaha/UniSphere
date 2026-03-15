import nodemailer, { type Transporter } from "nodemailer";

const MAIL_CONNECTION_TIMEOUT_MS = 10_000;
const MAIL_SOCKET_TIMEOUT_MS = 20_000;
const MAIL_SEND_TIMEOUT_MS = 15_000;
const MAIL_VERIFY_CACHE_MS = 10 * 60 * 1000;

type MailPurpose = "signup" | "forgot_password";

type MailerConfig = {
  host: string;
  port: number;
  secure: boolean;
  requireTLS: boolean;
  authMethod?: string;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
  transportLabel: string;
};

type MailerState =
  | "uninitialized"
  | "ready"
  | "verify_ok"
  | "verify_failed"
  | "disabled";

type MailerInitResult =
  | {
      success: true;
      errorCode: null;
      message: string;
      transportLabel: string;
    }
  | {
      success: false;
      errorCode: string;
      message: string;
      transportLabel: "disabled";
    };

export type MailSendResult =
  | {
      success: true;
      errorCode: null;
      message: string;
      transportLabel: string;
      messageId: string;
    }
  | {
      success: false;
      errorCode: string;
      message: string;
      transportLabel: string;
      messageId?: undefined;
    };

type MailerFailureDetails = {
  errorCode: string;
  publicMessage: string;
  metadata: {
    code: string;
    command: string;
    responseCode: number | null;
    response: string | null;
    message: string;
  };
};

let cachedTransporter: Transporter | null = null;
let cachedConfig: MailerConfig | null = null;
let cachedConfigKey: string | null = null;
let mailerState: MailerState = "uninitialized";
let verifyPromise: Promise<void> | null = null;
let lastVerifiedAt: number | null = null;

function normalizeMailPassword(password: string) {
  return password.replace(/\s+/g, "");
}

function parseBoolean(value: string | undefined) {
  if (!value) return null;

  const normalized = value.trim().toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;

  return null;
}

function maskEmail(email: string) {
  const [localPart = "", domain = ""] = email.split("@");
  if (!localPart || !domain) return "[invalid-email]";
  if (localPart.length <= 2) return `${localPart[0] || "*"}*@${domain}`;
  return `${localPart[0]}***${localPart[localPart.length - 1]}@${domain}`;
}

function readMailerConfig():
  | {
      success: true;
      config: MailerConfig;
    }
  | {
      success: false;
      errorCode: string;
      message: string;
      invalidFields: string[];
    } {
  const rawHost = process.env.MAIL_HOST?.trim() || "";
  const rawPort = process.env.MAIL_PORT?.trim() || "";
  const rawSecure = process.env.MAIL_SECURE?.trim() || "";
  const rawRequireTLS = process.env.MAIL_REQUIRE_TLS?.trim() || "";
  const rawUser = process.env.MAIL_USER?.trim() || "";
  const rawPass = process.env.MAIL_PASS || "";
  const rawFromName = process.env.MAIL_FROM_NAME?.trim() || "UniSphere";
  const rawFromEmail = process.env.MAIL_FROM_EMAIL?.trim() || rawUser;
  const rawAuthMethod = process.env.MAIL_AUTH_METHOD?.trim() || "";

  const invalidFields: string[] = [];

  if (!rawHost) invalidFields.push("MAIL_HOST");
  if (!rawPort) invalidFields.push("MAIL_PORT");
  if (!rawSecure) invalidFields.push("MAIL_SECURE");
  if (!rawUser) invalidFields.push("MAIL_USER");
  if (!rawPass.trim()) invalidFields.push("MAIL_PASS");
  if (!rawFromEmail) invalidFields.push("MAIL_FROM_EMAIL");

  const parsedPort = Number(rawPort);
  if (!Number.isInteger(parsedPort) || parsedPort <= 0) {
    invalidFields.push("MAIL_PORT");
  }

  const parsedSecure = parseBoolean(rawSecure);
  if (parsedSecure === null) {
    invalidFields.push("MAIL_SECURE");
  }

  const parsedRequireTLS =
    rawRequireTLS === "" ? null : parseBoolean(rawRequireTLS);
  if (rawRequireTLS !== "" && parsedRequireTLS === null) {
    invalidFields.push("MAIL_REQUIRE_TLS");
  }

  if (invalidFields.length > 0) {
    return {
      success: false,
      errorCode: "MAIL_CONFIG_INVALID",
      message:
        "Mailer configuration is missing or malformed. Check Railway mail env vars.",
      invalidFields: [...new Set(invalidFields)],
    };
  }

  const normalizedPass = normalizeMailPassword(rawPass);

  return {
    success: true,
    config: {
      host: rawHost,
      port: parsedPort,
      secure: parsedSecure as boolean,
      requireTLS:
        parsedRequireTLS === null ? !(parsedSecure as boolean) : parsedRequireTLS,
      authMethod: rawAuthMethod || undefined,
      user: rawUser,
      pass: normalizedPass,
      fromName: rawFromName,
      fromEmail: rawFromEmail,
      transportLabel: `${rawHost}:${parsedPort}`,
    },
  };
}

function getConfigKey(config: MailerConfig) {
  return JSON.stringify({
    host: config.host,
    port: config.port,
    secure: config.secure,
    requireTLS: config.requireTLS,
    authMethod: config.authMethod || "",
    user: config.user,
    pass: config.pass,
    fromName: config.fromName,
    fromEmail: config.fromEmail,
  });
}

function getMailerFailureDetails(error: unknown): MailerFailureDetails {
  const mailError = error as {
    code?: string;
    command?: string;
    responseCode?: number;
    response?: string;
    message?: string;
  };

  const metadata = {
    code: mailError?.code || "UNKNOWN",
    command: mailError?.command || "unknown",
    responseCode: mailError?.responseCode || null,
    response: mailError?.response || null,
    message: mailError?.message || "Unknown mailer error",
  };

  if (metadata.code === "EAUTH" || metadata.responseCode === 535) {
    return {
      errorCode: "SMTP_AUTH_FAILED",
      publicMessage:
        "Unable to send OTP email because SMTP authentication failed. Please check Railway mail configuration.",
      metadata,
    };
  }

  if (
    metadata.code === "ETIMEDOUT" ||
    metadata.code === "ESOCKET" ||
    metadata.code === "ECONNECTION"
  ) {
    return {
      errorCode: "SMTP_CONNECTION_FAILED",
      publicMessage:
        "Unable to send OTP email because the mail server connection failed. Please try again later.",
      metadata,
    };
  }

  return {
    errorCode: "SMTP_SEND_FAILED",
    publicMessage:
      "Unable to send OTP email right now. Please try again later.",
    metadata,
  };
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string) {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`${label} timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise.then(
      (value) => {
        clearTimeout(timeoutId);
        resolve(value);
      },
      (error) => {
        clearTimeout(timeoutId);
        reject(error);
      }
    );
  });
}

function createReusableTransporter(config: MailerConfig) {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    requireTLS: config.requireTLS,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    ...(config.authMethod ? { authMethod: config.authMethod } : {}),
    connectionTimeout: MAIL_CONNECTION_TIMEOUT_MS,
    greetingTimeout: MAIL_CONNECTION_TIMEOUT_MS,
    socketTimeout: MAIL_SOCKET_TIMEOUT_MS,
    tls: {
      servername: config.host,
    },
    pool: true,
    maxConnections: 2,
    maxMessages: 25,
  });
}

function ensureMailer():
  | {
      success: true;
      transporter: Transporter;
      config: MailerConfig;
    }
  | {
      success: false;
      errorCode: string;
      message: string;
      transportLabel: "disabled";
    } {
  const configResult = readMailerConfig();

  if (configResult.success === false) {
    cachedTransporter = null;
    cachedConfig = null;
    cachedConfigKey = null;
    mailerState = "disabled";

    console.error("[MAILER_INIT_ERROR]", {
      errorCode: configResult.errorCode,
      message: configResult.message,
      invalidFields: configResult.invalidFields,
    });

    return {
      success: false,
      errorCode: configResult.errorCode,
      message: configResult.message,
      transportLabel: "disabled",
    };
  }

  const nextConfig = configResult.config;
  const nextConfigKey = getConfigKey(nextConfig);

  if (cachedTransporter && cachedConfigKey === nextConfigKey && cachedConfig) {
    return {
      success: true,
      transporter: cachedTransporter,
      config: cachedConfig,
    };
  }

  cachedTransporter = createReusableTransporter(nextConfig);
  cachedConfig = nextConfig;
  cachedConfigKey = nextConfigKey;
  verifyPromise = null;
  lastVerifiedAt = null;
  mailerState = "ready";

  console.log("[MAILER] SMTP transporter created", {
    transport: nextConfig.transportLabel,
    host: nextConfig.host,
    port: nextConfig.port,
    secure: nextConfig.secure,
    requireTLS: nextConfig.requireTLS,
    authMethod: nextConfig.authMethod || "default",
    user: maskEmail(nextConfig.user),
    from: `"${nextConfig.fromName}" <${nextConfig.fromEmail}>`,
  });

  if ((process.env.MAIL_PASS || "") !== nextConfig.pass) {
    console.warn("[MAILER] Normalized MAIL_PASS by removing whitespace");
  }

  return {
    success: true,
    transporter: cachedTransporter,
    config: nextConfig,
  };
}

function maybeVerifyMailer(force = false) {
  const mailer = ensureMailer();
  if (mailer.success === false) {
    return;
  }

  const verificationStillFresh =
    !force &&
    mailerState === "verify_ok" &&
    lastVerifiedAt !== null &&
    Date.now() - lastVerifiedAt < MAIL_VERIFY_CACHE_MS;

  if (verificationStillFresh || verifyPromise) {
    return;
  }

  verifyPromise = mailer.transporter
    .verify()
    .then(() => {
      mailerState = "verify_ok";
      lastVerifiedAt = Date.now();
      console.log("[MAILER] SMTP verification succeeded", {
        transport: mailer.config.transportLabel,
      });
    })
    .catch((error) => {
      const failure = getMailerFailureDetails(error);
      mailerState = "verify_failed";
      lastVerifiedAt = Date.now();
      console.error("[MAILER_VERIFY_ERROR]", {
        errorCode: failure.errorCode,
        transport: mailer.config.transportLabel,
        ...failure.metadata,
      });
    })
    .finally(() => {
      verifyPromise = null;
    });
}

function buildOtpMailContent(purpose: MailPurpose, otp: string) {
  const subject =
    purpose === "signup"
      ? "UniSphere Signup OTP"
      : "UniSphere Password Reset OTP";

  const actionText =
    purpose === "signup"
      ? "complete your UniSphere signup"
      : "reset your UniSphere password";

  const html = `
    <div style="font-family: Arial, sans-serif; background: #0b1020; color: #ffffff; padding: 24px;">
      <div style="max-width: 520px; margin: 0 auto; background: #121a2f; border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 28px;">
        <h2 style="margin: 0 0 8px; font-size: 24px;">UniSphere</h2>
        <p style="margin: 0 0 20px; color: #cbd5e1; font-size: 14px;">
          Use the OTP below to ${actionText}.
        </p>

        <div style="margin: 24px 0; text-align: center;">
          <div style="display: inline-block; font-size: 32px; font-weight: 800; letter-spacing: 8px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff; padding: 16px 24px; border-radius: 16px;">
            ${otp}
          </div>
        </div>

        <p style="margin: 0 0 8px; color: #cbd5e1; font-size: 13px;">
          This OTP will expire in 10 minutes.
        </p>
        <p style="margin: 0; color: #94a3b8; font-size: 12px;">
          If you did not request this, you can ignore this email.
        </p>
      </div>
    </div>
  `;

  return { subject, html };
}

export function initializeMailer(): MailerInitResult {
  const mailer = ensureMailer();

  if (mailer.success === false) {
    return {
      success: false,
      errorCode: mailer.errorCode,
      message: mailer.message,
      transportLabel: "disabled",
    };
  }

  maybeVerifyMailer(true);

  return {
    success: true,
    errorCode: null,
    message: "Mailer initialized.",
    transportLabel: mailer.config.transportLabel,
  };
}

export async function sendOtpMail(params: {
  to: string;
  otp: string;
  purpose: MailPurpose;
}): Promise<MailSendResult> {
  const mailer = ensureMailer();

  if (mailer.success === false) {
    return {
      success: false,
      errorCode: mailer.errorCode,
      message: mailer.message,
      transportLabel: "disabled",
    };
  }

  maybeVerifyMailer();

  const content = buildOtpMailContent(params.purpose, params.otp);

  try {
    const info = await withTimeout(
      mailer.transporter.sendMail({
        from: `"${mailer.config.fromName}" <${mailer.config.fromEmail}>`,
        to: params.to,
        subject: content.subject,
        html: content.html,
      }),
      MAIL_SEND_TIMEOUT_MS,
      `OTP mail send via ${mailer.config.transportLabel}`
    );

    console.log("[MAILER] sendMail succeeded", {
      transport: mailer.config.transportLabel,
      messageId: info.messageId,
      accepted: info.accepted?.length || 0,
      rejected: info.rejected?.length || 0,
      response: info.response || null,
    });

    return {
      success: true,
      errorCode: null,
      message: "OTP email sent successfully.",
      transportLabel: mailer.config.transportLabel,
      messageId: info.messageId,
    };
  } catch (error) {
    const failure = getMailerFailureDetails(error);

    console.error("[MAILER_SEND_ERROR]", {
      errorCode: failure.errorCode,
      transport: mailer.config.transportLabel,
      ...failure.metadata,
    });

    return {
      success: false,
      errorCode: failure.errorCode,
      message: failure.publicMessage,
      transportLabel: mailer.config.transportLabel,
    };
  }
}
