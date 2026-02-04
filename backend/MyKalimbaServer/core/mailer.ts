import nodemailer, { type SendMailOptions } from "nodemailer";
import config from "./config";

function buildTransport() {
  const user = config.mail && config.mail.gmailUser;
  const pass = config.mail && config.mail.gmailAppPassword;

  if (!user || !pass) {
    const err: any = new Error(
      "Email is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD",
    );
    err.status = 500;
    throw err;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export async function sendMail(opts: SendMailOptions) {
  const transport = buildTransport();
  return transport.sendMail(opts);
}
