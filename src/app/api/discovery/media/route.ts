import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/utils/prisma";

const BUCKET = "discovery";
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

async function ensureBucket(admin: ReturnType<typeof getAdmin>) {
  const { data } = await admin.storage.getBucket(BUCKET);
  if (!data) {
    await admin.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: MAX_BYTES,
      allowedMimeTypes: ALLOWED,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const userId = formData.get("user_id");
    const file = formData.get("file");

    if (typeof userId !== "string" || !userId) {
      return NextResponse.json({ error: "user_id gerekli" }, { status: 400 });
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file gerekli" }, { status: 400 });
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json(
        { error: "Sadece görsel (JPG/PNG/WebP/GIF) veya PDF yükleyebilirsiniz" },
        { status: 400 },
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Dosya 10 MB'den küçük olmalı" }, { status: 400 });
    }

    const author = await prisma.profile.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!author || (author.role !== "TEACHER" && author.role !== "ADMIN")) {
      return NextResponse.json({ error: "Yükleme yetkiniz yok" }, { status: 403 });
    }

    const admin = getAdmin();
    await ensureBucket(admin);

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
    const safeExt = /^[a-z0-9]+$/.test(ext) ? ext : "bin";
    const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const upload = await admin.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: false });
    if (upload.error) {
      console.error(upload.error);
      return NextResponse.json({ error: upload.error.message }, { status: 500 });
    }

    const { data: publicUrl } = admin.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({
      data: { url: publicUrl.publicUrl, type: file.type, name: file.name },
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message ?? "Sunucu hatası" }, { status: 500 });
  }
}
