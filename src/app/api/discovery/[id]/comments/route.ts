import { prisma } from "@/utils/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const postId = parseInt(idStr);
  if (!postId) return NextResponse.json({ error: "Geçersiz id" }, { status: 400 });

  try {
    const comments = await prisma.discoveryComment.findMany({
      where: { post_id: postId },
      orderBy: { created_at: "asc" },
      include: {
        user: { select: { id: true, full_name: true, role: true, avatar_url: true } },
      },
    });
    return NextResponse.json({ data: comments });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const postId = parseInt(idStr);
  if (!postId) return NextResponse.json({ error: "Geçersiz id" }, { status: 400 });

  try {
    const body = await req.json();
    const { user_id, content } = body;
    if (!user_id || !content?.trim())
      return NextResponse.json({ error: "Eksik alan" }, { status: 400 });

    const post = await prisma.discoveryPost.findUnique({
      where: { id: postId },
      select: { id: true, author_id: true },
    });
    if (!post) return NextResponse.json({ error: "Gönderi bulunamadı" }, { status: 404 });

    const comment = await prisma.discoveryComment.create({
      data: { post_id: postId, user_id, content: content.trim() },
      include: {
        user: { select: { id: true, full_name: true, role: true, avatar_url: true } },
      },
    });

    if (post.author_id !== user_id) {
      await prisma.notification
        .create({
          data: {
            user_id: post.author_id,
            actor_id: user_id,
            type: "DISCOVERY_COMMENT",
            post_id: postId,
            comment_id: comment.id,
          },
        })
        .catch((e) => console.error("notification create failed:", e));
    }

    return NextResponse.json({ data: comment }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const commentId = req.nextUrl.searchParams.get("commentId");
  const userId = req.nextUrl.searchParams.get("userId");
  const postId = parseInt(idStr);
  if (!postId || !commentId || !userId)
    return NextResponse.json({ error: "Eksik parametre" }, { status: 400 });

  try {
    const cid = parseInt(commentId);
    const [comment, user] = await Promise.all([
      prisma.discoveryComment.findUnique({
        where: { id: cid },
        select: { user_id: true, post_id: true },
      }),
      prisma.profile.findUnique({ where: { id: userId }, select: { role: true } }),
    ]);
    if (!comment || comment.post_id !== postId)
      return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    if (comment.user_id !== userId && user?.role !== "ADMIN")
      return NextResponse.json({ error: "Yetkiniz yok" }, { status: 403 });

    await prisma.discoveryComment.delete({ where: { id: cid } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
