import { prisma } from "@/utils/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const postId = parseInt(idStr);
  if (!postId) return NextResponse.json({ error: "Geçersiz id" }, { status: 400 });

  try {
    const body = await req.json();
    const { user_id } = body;
    if (!user_id) return NextResponse.json({ error: "Eksik parametre" }, { status: 400 });

    const existing = await prisma.discoveryLike.findUnique({
      where: { post_id_user_id: { post_id: postId, user_id } },
    });

    if (existing) {
      await prisma.discoveryLike.delete({
        where: { post_id_user_id: { post_id: postId, user_id } },
      });
    } else {
      await prisma.discoveryLike.create({
        data: { post_id: postId, user_id },
      });
    }

    const count = await prisma.discoveryLike.count({ where: { post_id: postId } });
    return NextResponse.json({ liked: !existing, like_count: count });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
