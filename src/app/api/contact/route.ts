import { NextRequest, NextResponse } from "next/server";
import { transporter } from "@/utils/mailer";

function escape(str: string) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const subject = String(body.subject ?? "").trim();
    const message = String(body.message ?? "").trim();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Tüm alanlar zorunlu" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Geçersiz e-posta" }, { status: 400 });
    }
    if (message.length > 5000) {
      return NextResponse.json({ error: "Mesaj çok uzun" }, { status: 400 });
    }

    const to = process.env.CONTACT_INBOX || "info@psikosun.com";

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      replyTo: `${name} <${email}>`,
      subject: `[İletişim] ${subject}`,
      html: `
        <div style="font-family:sans-serif;max-width:540px;margin:0 auto;padding:24px;background:#f4f7fb;">
          <div style="background:linear-gradient(135deg,#7C3AED,#00BCD4);padding:16px;border-radius:8px;color:#fff;text-align:center;">
            <div style="font-weight:900;letter-spacing:3px;font-size:18px;">PSIKOSUN</div>
            <div style="font-size:12px;opacity:.9;margin-top:4px;">Yeni iletişim formu mesajı</div>
          </div>
          <div style="background:#fff;padding:24px;border-radius:8px;margin-top:12px;">
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr><td style="padding:6px 0;color:#6b7280;width:90px;">Ad Soyad:</td><td><strong>${escape(name)}</strong></td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;">E-posta:</td><td><a href="mailto:${escape(email)}">${escape(email)}</a></td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;">Konu:</td><td>${escape(subject)}</td></tr>
            </table>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;">
            <div style="color:#111;white-space:pre-wrap;line-height:1.55;">${escape(message)}</div>
          </div>
          <p style="color:#9ca3af;font-size:11px;text-align:center;margin-top:12px;">
            psikosun.com iletişim formu · ${new Date().toLocaleString("tr-TR")}
          </p>
        </div>
      `,
      text: `Yeni iletişim formu mesajı\n\nAd: ${name}\nE-posta: ${email}\nKonu: ${subject}\n\n${message}`,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("contact mail error:", error);
    return NextResponse.json(
      { error: "Mesaj gönderilemedi", detail: error.message },
      { status: 500 },
    );
  }
}
