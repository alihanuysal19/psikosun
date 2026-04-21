import { prisma } from "@/utils/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const teacher = await prisma.profile.findUnique({
      where: { id },
      include: {
        my_students: {
          where: { is_active: true },
          select: { id: true, full_name: true, email: true },
        },
      },
    });
    if (!teacher || teacher.role !== "TEACHER") {
      return NextResponse.json({ error: "Öğretmen bulunamadı" }, { status: 404 });
    }
    return NextResponse.json({ data: teacher });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const data: Record<string, any> = {};
    for (const key of ["full_name", "phone", "city", "district"] as const) {
      if (key in body) data[key] = body[key] || null;
    }
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Güncellenecek alan yok" }, { status: 400 });
    }
    const updated = await prisma.profile.update({ where: { id }, data });
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const teacher = await prisma.profile.findUnique({
      where: { id },
      select: { role: true, _count: { select: { my_students: true } } },
    });
    if (!teacher || teacher.role !== "TEACHER") {
      return NextResponse.json({ error: "Öğretmen bulunamadı" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // Öğrencilerin atamalarını kaldır — "atanmamış" havuza düşsünler
      await tx.profile.updateMany({
        where: { assigned_teacher_id: id },
        data: { assigned_teacher_id: null },
      });
      await tx.profile.update({
        where: { id },
        data: { is_active: false },
      });
    });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
