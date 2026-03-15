import nodemailer from "nodemailer";

const MAIL_USER = (process.env.MAIL_USER || "").trim();
const RAW_MAIL_PASS = process.env.MAIL_PASS || "";
const MAIL_FROM_NAME = process.env.MAIL_FROM_NAME || "UniSphere";
const MAIL_CONNECTION_TIMEOUT_MS = 10_000;
const MAIL_SOCKET_TIMEOUT_MS = 20_000;
const MAIL_SEND_TIMEOUT_MS = 15_000;
const GMAIL_SMTP_HOST = "smtp.gmail.com";

function normalizeMailPassword(password: string) {
  return password.replace(/\s+/g, "");
}

const MAIL_PASS = normalizeMailPassword(RAW_MAIL_PASS);

function maskEmail(email: string) {
  const [localPart = "", domain = ""] = email.split("@");
  if (!localPart || !domain) return "[invalid-email]";
  if (localPart.length <= 2) return `${localPart[0] || "*"}*@${domain}`;
  return `${localPart[0]}***${localPart[localPart.length - 1]}@${domain}`;
}

function getMailerFailureDetails(error: unknown) {
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
      logMessage: "[MAILER_ERROR] Gmail authentication failed",
      publicMessage:
        "Unable to send OTP email because the mail account authentication failed. Please check Railway mail configuration.",
      metadata,
    };
  }

  if (
    metadata.code === "ETIMEDOUT" ||
    metadata.code === "ESOCKET" ||
    metadata.code === "ECONNECTION"
  ) {
    return {
      logMessage: "[MAILER_ERROR] Gmail SMTP connection failed",
      publicMessage:
        "Unable to send OTP email because the mail server connection failed. Please try again later.",
      metadata,
    };
  }

  return {
    logMessage: "[MAILER_ERROR] OTP email send failed",
    publicMessage:
      "Unable to send OTP email right now. Please try again later.",
    metadata,
  };
}

function isConnectionFailure(error: unknown) {
  const mailError = error as {
    code?: string;
    responseCode?: number;
  };

  return (
    mailError?.code === "ETIMEDOUT" ||
    mailError?.code === "ESOCKET" ||
    mailError?.code === "ECONNECTION"
  );
}

function createTransporter(config: {
  port: number;
  secure: boolean;
  requireTLS: boolean;
}) {
  if (!MAIL_USER || !MAIL_PASS) {
    console.error("[MAILER] Missing MAIL_USER or MAIL_PASS");
    return null;
  }

  if (RAW_MAIL_PASS !== MAIL_PASS) {
    console.warn("[MAILER] Normalized MAIL_PASS by removing whitespace");
  }

  console.log("[MAILER] Using Gmail SMTP transporter", {
    host: GMAIL_SMTP_HOST,
    port: config.port,
    secure: config.secure,
    user: maskEmail(MAIL_USER),
  });

  return nodemailer.createTransport({
    host: GMAIL_SMTP_HOST,
    port: config.port,
    secure: config.secure,
    requireTLS: config.requireTLS,
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASS,
    },
    authMethod: "LOGIN",
    connectionTimeout: MAIL_CONNECTION_TIMEOUT_MS,
    greetingTimeout: MAIL_CONNECTION_TIMEOUT_MS,
    socketTimeout: MAIL_SOCKET_TIMEOUT_MS,
    tls: {
      servername: GMAIL_SMTP_HOST,
    },
  });
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

type OtpMailResult =
  | {
      success: true;
      messageId: string;
    }
  | {
      success: false;
      error: string;
    };

const GMAIL_TRANSPORT_OPTIONS = [
  {
    label: "gmail-smtps-465",
    port: 465,
    secure: true,
    requireTLS: false,
  },
  {
    label: "gmail-starttls-587",
    port: 587,
    secure: false,
    requireTLS: true,
  },
] as const;

export async function sendOtpMail(params: {
  to: string;
  otp: string;
  purpose: "signup" | "forgot_password";
}): Promise<OtpMailResult> {
  if (!MAIL_USER || !MAIL_PASS) {
    console.error("[MAILER_DISABLED] OTP mail not sent because mail config is missing");
    return {
      success: false,
      error:
        "Unable to send OTP email because the server mail configuration is missing. Please check Railway mail settings.",
    };
  }

  const subject =
    params.purpose === "signup"
      ? "UniSphere Signup OTP"
      : "UniSphere Password Reset OTP";

  const actionText =
    params.purpose === "signup"
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
            ${params.otp}
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

  for (let index = 0; index < GMAIL_TRANSPORT_OPTIONS.length; index += 1) {
    const option = GMAIL_TRANSPORT_OPTIONS[index];
    const transporter = createTransporter(option);

    if (!transporter) {
      break;
    }

    try {
      const info = await withTimeout(
        transporter.sendMail({
          from: `"${MAIL_FROM_NAME}" <${MAIL_USER}>`,
          to: params.to,
          subject,
          html,
        }),
        MAIL_SEND_TIMEOUT_MS,
        `OTP mail send via ${option.label}`
      );

      console.log("[MAILER] OTP mail sent:", {
        messageId: info.messageId,
        transport: option.label,
      });

      return { success: true, messageId: info.messageId };
    } catch (error) {
      const failure = getMailerFailureDetails(error);
      console.error(failure.logMessage, {
        ...failure.metadata,
        transport: option.label,
      });

      const hasNextOption = index < GMAIL_TRANSPORT_OPTIONS.length - 1;
      if (!hasNextOption || !isConnectionFailure(error)) {
        return {
          success: false,
          error: failure.publicMessage,
        };
      }

      console.warn("[MAILER] Retrying OTP mail with alternate Gmail SMTP transport", {
        fromTransport: option.label,
        toTransport: GMAIL_TRANSPORT_OPTIONS[index + 1].label,
      });
    }
  }

  return {
    success: false,
    error: "Unable to send OTP email right now. Please try again later.",
  };
}
