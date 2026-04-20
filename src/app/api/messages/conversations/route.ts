import { prisma } from "@/utils/prisma";
import { NextRequest, NextResponse } from "next/server";

type PartnerInfo = { id: string; full_name: string; role: string; avatar_url: string | null };

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Eksik parametre" }, { status: 400 });

  try {
    const me = await prisma.profile.findUnique({
      where: { id: userId },
      select: { id: true, role: true, assigned_teacher_id: true },
    });
    if (!me) return NextResponse.json({ error: "Profil bulunamadı" }, { status: 404 });

    let partners: PartnerInfo[] = [];
    if (me.role === "STUDENT" && me.assigned_teacher_id) {
      const t = await prisma.profile.findUnique({
        where: { id: me.assigned_teacher_id },
        select: { id: true, full_name: true, role: true, avatar_url: true },
      });
      if (t) partners = [t];
    } else if (me.role === "TEACHER") {
      partners = await prisma.profile.findMany({
        where: { assigned_teacher_id: me.id },
        select: { id: true, full_name: true, role: true, avatar_url: true },
        orderBy: { full_name: "asc" },
      });
    } else if (me.role === "ADMIN") {
      partners = await prisma.profile.findMany({
        where: { id: { not: me.id } },
        select: { id: true, full_name: true, role: true, avatar_url: true },
        orderBy: { full_name: "asc" },
        take: 100,
      });
    }

    if (partners.length === 0) return NextResponse.json({ data: [] });

    const partnerIds = partners.map((p) => p.id);

    const [lastMessages, unreadCounts] = await Promise.all([
      Promise.all(
        partnerIds.map((pid) =>
          prisma.message.findFirst({
            where: {
              OR: [
                { sender_id: userId, receiver_id: pid },
                { sender_id: pid, receiver_id: userId },
              ],
            },
            orderBy: { created_at: "desc" },
            select: { id: true, content: true, created_at: true, sender_id: true },
          }),
        ),
      ),
      prisma.message.groupBy({
        by: ["sender_id"],
        where: { receiver_id: userId, read_at: null, sender_id: { in: partnerIds } },
        _count: { _all: true },
      }),
    ]);

    const unreadMap = new Map(unreadCounts.map((u) => [u.sender_id, u._count._all]));

    const conversations = partners
      .map((p, i) => ({
        partner: p,
        last_message: lastMessages[i],
        unread_count: unreadMap.get(p.id) ?? 0,
      }))
      .sort((a, b) => {
        const at = a.last_message?.created_at?.getTime() ?? 0;
        const bt = b.last_message?.created_at?.getTime() ?? 0;
        return bt - at;
      });

    return NextResponse.json({ data: conversations });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
