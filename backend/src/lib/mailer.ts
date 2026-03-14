import nodemailer from "nodemailer";

const MAIL_USER = process.env.MAIL_USER || "";
const MAIL_PASS = process.env.MAIL_PASS || "";
const MAIL_FROM_NAME = process.env.MAIL_FROM_NAME || "UniSphere";

function createTransporter() {
  if (!MAIL_USER || !MAIL_PASS) {
    console.log("[MAILER] Missing MAIL_USER or MAIL_PASS");
    return null;
  }

  console.log("[MAILER] Using Gmail transporter for:", MAIL_USER);

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASS,
    },
  });
}

export async function sendOtpMail(params: {
  to: string;
  otp: string;
  purpose: "signup" | "forgot_password";
}) {
  const transporter = createTransporter();

  if (!transporter) {
    console.log(
      `[MAILER_DISABLED] OTP for ${params.to}: ${params.otp} (${params.purpose})`
    );
    return { success: true, fallback: true };
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

  try {
    await transporter.verify();
    console.log("[MAILER] Transport verified successfully");

    const info = await transporter.sendMail({
      from: `"${MAIL_FROM_NAME}" <${MAIL_USER}>`,
      to: params.to,
      subject,
      html,
    });

    console.log("[MAILER] OTP mail sent:", info.messageId);

    return { success: true, fallback: false };
  } catch (error) {
    console.error("[MAILER_ERROR]", error);
    console.log(
      `[MAILER_FALLBACK_OTP] OTP for ${params.to}: ${params.otp} (${params.purpose})`
    );
    return { success: true, fallback: true };
  }
}
