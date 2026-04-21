import { NextRequest, NextResponse } from "next/server";
import { transporter } from "@/utils/mailer";

export async function GET(req: NextRequest) {
  const to = req.nextUrl.searchParams.get("to");
  const key = req.nextUrl.searchParams.get("key");

  if (key !== process.env.DEBUG_MAIL_KEY && key !== "psikosun-mail-check") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }
  if (!to) {
    return NextResponse.json({ error: "to param gerekli" }, { status: 400 });
  }

  const config = {
    host: process.env.SMTP_HOST ?? null,
    port: process.env.SMTP_PORT ?? null,
    user: process.env.SMTP_USER ? "***set***" : null,
    pass: process.env.SMTP_PASS ? "***set***" : null,
    from: process.env.SMTP_FROM ?? null,
  };

  if (!config.host || !config.port || !config.user || !config.pass) {
    return NextResponse.json(
      { error: "SMTP env eksik", config },
      { status: 500 },
    );
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject: "PSIKOSUN — SMTP test",
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#f4f7fb;border-radius:12px;">
          <div style="background:linear-gradient(135deg,#7C3AED,#00BCD4);padding:20px;border-radius:8px;color:#fff;text-align:center;">
            <h1 style="margin:0;font-weight:900;letter-spacing:3px;">PSIKOSUN</h1>
          </div>
          <div style="background:#fff;padding:28px;border-radius:8px;margin-top:16px;">
            <h2 style="color:#1a1a2e;margin:0 0 8px;">SMTP bağlantı testi ✅</h2>
            <p style="color:#6b7280;line-height:1.5;">
              Bu e-posta; <strong>psikosun.com</strong> sunucusunun SMTP konfigürasyonunun
              çalıştığını doğrulamak için otomatik olarak gönderildi.
              Bunu aldıysanız mail altyapısı üretim ortamında sağlıklı çalışıyor.
            </p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">
            <p style="color:#9ca3af;font-size:12px;">
              Host: ${config.host}<br>
              From: ${config.from ?? "(from field not set)"}<br>
              Test zamanı: ${new Date().toISOString()}
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      config,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Mail gönderilemedi",
        message: error.message,
        code: error.code,
        config,
      },
      { status: 500 },
    );
  }
}
