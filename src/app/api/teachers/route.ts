import { prisma } from "@/utils/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const teachers = await prisma.profile.findMany({
      where: { role: "TEACHER", is_active: true },
      select: {
        id: true,
        full_name: true,
        avatar_url: true,
        _count: { select: { my_students: true } },
      },
      orderBy: { full_name: "asc" },
    });
    return NextResponse.json({ data: teachers });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
