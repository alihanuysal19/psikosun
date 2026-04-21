import { prisma } from "@/utils/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const upId = parseInt(id);
  if (isNaN(upId)) return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 });

  try {
    const body = await req.json();
    const data: Record<string, any> = {};

    if (typeof body.remaining === "number") {
      if (body.remaining < 0) {
        return NextResponse.json({ error: "Kalan ders negatif olamaz" }, { status: 400 });
      }
      data.remaining = body.remaining;
    }
    if (typeof body.total === "number") {
      if (body.total < 0) {
        return NextResponse.json({ error: "Toplam ders negatif olamaz" }, { status: 400 });
      }
      data.total = body.total;
    }
    if ("expires_at" in body) {
      data.expires_at = body.expires_at ? new Date(body.expires_at) : null;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Güncellenecek alan yok" }, { status: 400 });
    }

    const updated = await prisma.userPackage.update({
      where: { id: upId },
      data,
      include: { package: true },
    });
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const upId = parseInt(id);
  if (isNaN(upId)) return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 });

  try {
    // Derslerden user_package_id'yi kaldır, sonra sil
    await prisma.$transaction([
      prisma.lesson.updateMany({
        where: { user_package_id: upId },
        data: { user_package_id: null },
      }),
      prisma.userPackage.delete({ where: { id: upId } }),
    ]);
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
