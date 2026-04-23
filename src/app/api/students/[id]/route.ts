import { prisma } from "@/utils/prisma";
import { serializePrisma } from "@/utils/serialize";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const teacherId = req.nextUrl.searchParams.get("teacherId");

  try {
    const student = await prisma.profile.findUnique({
      where: { id },
      include: {
        assigned_teacher: { select: { id: true, full_name: true, email: true } },
        user_packages: {
          include: { package: true },
          orderBy: { purchased_at: "desc" },
        },
        student_lessons: {
          include: { teacher: { select: { id: true, full_name: true } } },
          orderBy: { scheduled_at: "desc" },
          take: 30,
        },
        student_notes: {
          include: { teacher: { select: { id: true, full_name: true } } },
          orderBy: { created_at: "desc" },
          take: 30,
        },
      },
    });

    if (!student || student.role !== "STUDENT" || !student.is_active) {
      return NextResponse.json({ error: "Öğrenci bulunamadı" }, { status: 404 });
    }

    if (teacherId && student.assigned_teacher_id !== teacherId) {
      return NextResponse.json({ error: "Bu öğrenciye erişim yetkiniz yok" }, { status: 403 });
    }

    return NextResponse.json({ data: serializePrisma(student) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
