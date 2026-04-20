import { prisma } from "@/utils/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lessonId = parseInt(id);
  if (isNaN(lessonId)) return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 });

  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { user_package: true },
    });

    if (!lesson) return NextResponse.json({ error: "Ders bulunamadı" }, { status: 404 });
    if (lesson.status === "COMPLETED") return NextResponse.json({ error: "Ders zaten tamamlandı" }, { status: 400 });

    await prisma.$transaction(async (tx) => {
      await tx.lesson.update({
        where: { id: lessonId },
        data: { status: "COMPLETED", deducted: true },
      });

      if (lesson.user_package_id && lesson.user_package && !lesson.deducted) {
        await tx.userPackage.update({
          where: { id: lesson.user_package_id },
          data: { remaining: { decrement: 1 } },
        });
      }
    });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
