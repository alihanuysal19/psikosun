import { prisma } from "@/utils/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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
          include: { teacher: { select: { full_name: true } } },
          orderBy: { scheduled_at: "desc" },
          take: 20,
        },
      },
    });
    if (!student || student.role !== "STUDENT") {
      return NextResponse.json({ error: "Öğrenci bulunamadı" }, { status: 404 });
    }
    return NextResponse.json({ data: student });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const student = await prisma.profile.findUnique({
      where: { id },
      select: { role: true },
    });
    if (!student || student.role !== "STUDENT") {
      return NextResponse.json({ error: "Öğrenci bulunamadı" }, { status: 404 });
    }
    await prisma.profile.update({
      where: { id },
      data: { is_active: false },
    });
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
