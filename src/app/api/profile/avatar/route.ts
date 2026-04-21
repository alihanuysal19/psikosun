import { prisma } from "@/utils/prisma";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "avatars";
const MAX_BYTES = 3 * 1024 * 1024; // 3 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

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
      return NextResponse.json({ error: "Sadece JPG/PNG/WebP/GIF destekleniyor" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Dosya 3 MB'den küçük olmalı" }, { status: 400 });
    }

    const admin = getAdmin();
    await ensureBucket(admin);

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const safeExt = /^[a-z0-9]+$/.test(ext) ? ext : "jpg";
    const path = `${userId}/${Date.now()}.${safeExt}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const upload = await admin.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: true });
    if (upload.error) {
      console.error(upload.error);
      return NextResponse.json({ error: upload.error.message }, { status: 500 });
    }

    const { data: publicUrl } = admin.storage.from(BUCKET).getPublicUrl(path);
    const avatar_url = publicUrl.publicUrl;

    await prisma.profile.update({
      where: { id: userId },
      data: { avatar_url },
    });

    return NextResponse.json({ data: { avatar_url } });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message ?? "Sunucu hatası" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("user_id");
    if (!userId) return NextResponse.json({ error: "user_id gerekli" }, { status: 400 });

    const admin = getAdmin();
    // Kullanıcının klasöründeki tüm dosyaları listele ve sil
    const { data: list } = await admin.storage.from(BUCKET).list(userId);
    if (list && list.length) {
      await admin.storage
        .from(BUCKET)
        .remove(list.map((f) => `${userId}/${f.name}`));
    }

    await prisma.profile.update({
      where: { id: userId },
      data: { avatar_url: null },
    });

    return NextResponse.json({ data: { success: true } });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message ?? "Sunucu hatası" }, { status: 500 });
  }
}
