import { createTransport } from "nodemailer";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return {
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  };
}

export async function sendEmail(input: SendEmailInput): Promise<void> {
  const from =
    process.env.EMAIL_FROM ??
    process.env.SMTP_FROM ??
    "noreply@jkmanpower.local";
  const smtpConfig = getSmtpConfig();

  if (!smtpConfig) {
    if (process.env.NODE_ENV === "development") {
      console.info(
        "[email:dev] SMTP not configured — logging email to console",
      );
      console.info(`To: ${input.to}`);
      console.info(`Subject: ${input.subject}`);
      console.info(input.text);
      return;
    }

    throw new Error("Email service is not configured");
  }

  const transporter = createTransport(smtpConfig);
  await transporter.sendMail({
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });
}
