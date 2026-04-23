import { prisma } from "@/utils/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const viewerId = req.nextUrl.searchParams.get("viewerId");
  const anonToken = req.nextUrl.searchParams.get("anonToken");
  const id = parseInt(idStr);
  if (!id) return NextResponse.json({ error: "Geçersiz id" }, { status: 400 });

  try {
    const likeFilter = viewerId
      ? { user_id: viewerId }
      : anonToken
        ? { anon_token: anonToken }
        : null;

    const post = await prisma.discoveryPost.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, full_name: true, role: true, avatar_url: true } },
        _count: { select: { comments: true, likes: true } },
        ...(likeFilter
          ? {
              likes: {
                where: likeFilter,
                select: { id: true },
                take: 1,
              },
            }
          : {}),
      },
    });
    if (!post) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

    return NextResponse.json({
      data: {
        ...post,
        comment_count: (post as any)._count.comments,
        like_count: (post as any)._count.likes,
        liked_by_me: likeFilter ? ((post as any).likes?.length ?? 0) > 0 : false,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const userId = req.nextUrl.searchParams.get("userId");
  const id = parseInt(idStr);
  if (!id || !userId)
    return NextResponse.json({ error: "Eksik parametre" }, { status: 400 });

  try {
    const [post, user] = await Promise.all([
      prisma.discoveryPost.findUnique({ where: { id }, select: { author_id: true } }),
      prisma.profile.findUnique({ where: { id: userId }, select: { role: true } }),
    ]);
    if (!post) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    if (post.author_id !== userId && user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkiniz yok" }, { status: 403 });
    }

    await prisma.discoveryPost.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = parseInt(idStr);
  if (!id) return NextResponse.json({ error: "Geçersiz id" }, { status: 400 });

  try {
    const body = await req.json();
    const { user_id, title, content, media_urls } = body;
    if (!user_id) return NextResponse.json({ error: "Eksik parametre" }, { status: 400 });

    const [post, user] = await Promise.all([
      prisma.discoveryPost.findUnique({ where: { id }, select: { author_id: true } }),
      prisma.profile.findUnique({ where: { id: user_id }, select: { role: true } }),
    ]);
    if (!post) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    if (post.author_id !== user_id && user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkiniz yok" }, { status: 403 });
    }

    const updated = await prisma.discoveryPost.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title: String(title).trim() } : {}),
        ...(content !== undefined ? { content: String(content).trim() } : {}),
        ...(Array.isArray(media_urls) ? { media_urls: media_urls.slice(0, 10) } : {}),
      },
    });
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
