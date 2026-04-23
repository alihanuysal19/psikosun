import { prisma } from "@/utils/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const postId = parseInt(idStr);
  if (!postId) return NextResponse.json({ error: "Geçersiz id" }, { status: 400 });

  try {
    const body = await req.json().catch(() => ({}));
    const userId: string | null = body.user_id || null;
    const anonToken: string | null = body.anon_token || null;

    if (!userId && !anonToken) {
      return NextResponse.json({ error: "Eksik parametre" }, { status: 400 });
    }

    let liked: boolean;

    if (userId) {
      const existing = await prisma.discoveryLike.findUnique({
        where: { post_id_user_id: { post_id: postId, user_id: userId } },
      });

      if (existing) {
        await prisma.discoveryLike.delete({ where: { id: existing.id } });
        liked = false;
      } else {
        await prisma.discoveryLike.create({
          data: { post_id: postId, user_id: userId },
        });
        liked = true;

        if (anonToken) {
          await prisma.discoveryLike
            .delete({
              where: { post_id_anon_token: { post_id: postId, anon_token: anonToken } },
            })
            .catch(() => {});
        }

        const post = await prisma.discoveryPost.findUnique({
          where: { id: postId },
          select: { author_id: true },
        });
        if (post && post.author_id !== userId) {
          await prisma.notification
            .create({
              data: {
                user_id: post.author_id,
                actor_id: userId,
                type: "DISCOVERY_LIKE",
                post_id: postId,
              },
            })
            .catch((e) => console.error("notification create failed:", e));
        }
      }
    } else {
      const existing = await prisma.discoveryLike.findUnique({
        where: { post_id_anon_token: { post_id: postId, anon_token: anonToken! } },
      });

      if (existing) {
        await prisma.discoveryLike.delete({ where: { id: existing.id } });
        liked = false;
      } else {
        await prisma.discoveryLike.create({
          data: { post_id: postId, anon_token: anonToken },
        });
        liked = true;
      }
    }

    const count = await prisma.discoveryLike.count({ where: { post_id: postId } });
    return NextResponse.json({ liked, like_count: count });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
