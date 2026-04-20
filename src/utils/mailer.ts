import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendPasswordResetEmail(to: string, resetLink: string) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: "Şifre Sıfırlama — psikosun",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fff;">
        <h2 style="color:#1a1a2e;margin-bottom:8px;">Şifre Sıfırlama</h2>
        <p style="color:#6b7280;margin-bottom:24px;">
          Şifrenizi sıfırlamak için aşağıdaki butona tıklayın.
          Bu bağlantı <strong>1 saat</strong> geçerlidir.
        </p>
        <a href="${resetLink}" style="display:inline-block;background:#5d87ff;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;">
          Şifremi Sıfırla
        </a>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px;">
          Bu isteği siz yapmadıysanız bu e-postayı görmezden gelebilirsiniz.
        </p>
      </div>
    `,
  });
}
