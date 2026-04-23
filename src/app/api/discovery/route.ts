import { prisma } from "@/utils/prisma";
import { NextRequest, NextResponse } from "next/server";

const PAGE_SIZE = 10;

export async function GET(req: NextRequest) {
  const viewerId = req.nextUrl.searchParams.get("viewerId");
  const anonToken = req.nextUrl.searchParams.get("anonToken");
  const cursorParam = req.nextUrl.searchParams.get("cursor");
  const cursor = cursorParam ? parseInt(cursorParam) : undefined;

  try {
    const likeFilter = viewerId
      ? { user_id: viewerId }
      : anonToken
        ? { anon_token: anonToken }
        : null;

    const posts = await prisma.discoveryPost.findMany({
      take: PAGE_SIZE + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { created_at: "desc" },
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

    const hasMore = posts.length > PAGE_SIZE;
    const items = (hasMore ? posts.slice(0, PAGE_SIZE) : posts).map((p: any) => ({
      id: p.id,
      author: p.author,
      title: p.title,
      content: p.content,
      media_urls: p.media_urls,
      created_at: p.created_at,
      updated_at: p.updated_at,
      comment_count: p._count.comments,
      like_count: p._count.likes,
      liked_by_me: likeFilter ? (p.likes?.length ?? 0) > 0 : false,
    }));

    return NextResponse.json({
      data: items,
      nextCursor: hasMore ? items[items.length - 1].id : null,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { author_id, title, content, media_urls } = body;

    if (!author_id || !title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: "Eksik alan" }, { status: 400 });
    }

    const author = await prisma.profile.findUnique({
      where: { id: author_id },
      select: { role: true },
    });
    if (!author || author.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Sadece yönetim paylaşım yapabilir" },
        { status: 403 },
      );
    }

    const post = await prisma.discoveryPost.create({
      data: {
        author_id,
        title: title.trim(),
        content: content.trim(),
        media_urls: Array.isArray(media_urls) ? media_urls.slice(0, 10) : [],
      },
      include: {
        author: { select: { id: true, full_name: true, role: true, avatar_url: true } },
      },
    });

    return NextResponse.json(
      {
        data: {
          ...post,
          comment_count: 0,
          like_count: 0,
          liked_by_me: false,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
