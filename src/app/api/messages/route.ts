import { prisma } from "@/utils/prisma";
import { NextRequest, NextResponse } from "next/server";

async function isAllowed(userA: string, userB: string): Promise<boolean> {
  if (userA === userB) return false;
  const [a, b] = await Promise.all([
    prisma.profile.findUnique({
      where: { id: userA },
      select: { id: true, role: true, assigned_teacher_id: true },
    }),
    prisma.profile.findUnique({
      where: { id: userB },
      select: { id: true, role: true, assigned_teacher_id: true },
    }),
  ]);
  if (!a || !b) return false;
  if (a.role === "ADMIN" || b.role === "ADMIN") return true;
  if (a.role === "STUDENT" && b.role === "TEACHER") return a.assigned_teacher_id === b.id;
  if (a.role === "TEACHER" && b.role === "STUDENT") return b.assigned_teacher_id === a.id;
  return false;
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  const partnerId = req.nextUrl.searchParams.get("partnerId");
  if (!userId || !partnerId) {
    return NextResponse.json({ error: "Eksik parametre" }, { status: 400 });
  }

  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { sender_id: userId, receiver_id: partnerId },
          { sender_id: partnerId, receiver_id: userId },
        ],
      },
      orderBy: { created_at: "asc" },
      take: 500,
    });

    await prisma.message.updateMany({
      where: { sender_id: partnerId, receiver_id: userId, read_at: null },
      data: { read_at: new Date() },
    });

    return NextResponse.json({ data: messages });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { sender_id, receiver_id, content } = await req.json();
    if (!sender_id || !receiver_id || !content?.trim()) {
      return NextResponse.json({ error: "Eksik alan" }, { status: 400 });
    }
    if (content.length > 2000) {
      return NextResponse.json({ error: "Mesaj çok uzun" }, { status: 400 });
    }

    const allowed = await isAllowed(sender_id, receiver_id);
    if (!allowed) {
      return NextResponse.json(
        { error: "Bu kullanıcıya mesaj gönderme yetkiniz yok" },
        { status: 403 },
      );
    }

    const message = await prisma.message.create({
      data: { sender_id, receiver_id, content: content.trim() },
    });
    return NextResponse.json({ data: message }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
