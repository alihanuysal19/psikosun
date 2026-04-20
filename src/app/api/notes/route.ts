import { prisma } from "@/utils/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const studentId = req.nextUrl.searchParams.get("studentId");
  const teacherId = req.nextUrl.searchParams.get("teacherId");

  const where: any = {};
  if (studentId) where.student_id = studentId;
  if (teacherId) where.teacher_id = teacherId;

  try {
    const notes = await prisma.note.findMany({
      where,
      include: {
        student: { select: { id: true, full_name: true, avatar_url: true } },
        teacher: { select: { id: true, full_name: true } },
        lesson: { select: { id: true, scheduled_at: true } },
      },
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json({ data: notes });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { student_id, teacher_id, lesson_id, content } = body;
    if (!student_id || !teacher_id || !content)
      return NextResponse.json({ error: "Eksik alan" }, { status: 400 });

    const note = await prisma.note.create({
      data: { student_id, teacher_id, lesson_id: lesson_id ?? null, content },
      include: {
        student: { select: { id: true, full_name: true } },
        teacher: { select: { id: true, full_name: true } },
      },
    });
    return NextResponse.json({ data: note }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, content } = body;
    if (!id || !content) return NextResponse.json({ error: "Eksik alan" }, { status: 400 });

    const note = await prisma.note.update({ where: { id }, data: { content } });
    return NextResponse.json({ data: note });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
