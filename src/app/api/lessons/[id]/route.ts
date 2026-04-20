import { prisma } from "@/utils/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lessonId = parseInt(id);
  if (isNaN(lessonId)) return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 });

  try {
    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) return NextResponse.json({ error: "Ders bulunamadı" }, { status: 404 });
    if (lesson.status === "COMPLETED") {
      return NextResponse.json({ error: "Tamamlanmış ders iptal edilemez" }, { status: 400 });
    }

    await prisma.lesson.update({
      where: { id: lessonId },
      data: { status: "CANCELLED" },
    });
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
