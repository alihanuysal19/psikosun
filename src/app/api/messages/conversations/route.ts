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

    const partnerIdSet = new Set<string>();

    if (me.role === "STUDENT" && me.assigned_teacher_id) {
      partnerIdSet.add(me.assigned_teacher_id);
    } else if (me.role === "TEACHER") {
      const students = await prisma.profile.findMany({
        where: { assigned_teacher_id: me.id },
        select: { id: true },
      });
      students.forEach((s) => partnerIdSet.add(s.id));
    } else if (me.role === "ADMIN") {
      const all = await prisma.profile.findMany({
        where: { id: { not: me.id } },
        select: { id: true },
        take: 200,
      });
      all.forEach((p) => partnerIdSet.add(p.id));
    }

    const messaged = await prisma.message.findMany({
      where: { OR: [{ sender_id: userId }, { receiver_id: userId }] },
      select: { sender_id: true, receiver_id: true },
    });
    messaged.forEach((m) => {
      if (m.sender_id !== userId) partnerIdSet.add(m.sender_id);
      if (m.receiver_id !== userId) partnerIdSet.add(m.receiver_id);
    });

    if (partnerIdSet.size === 0) return NextResponse.json({ data: [] });

    const partnerIds = Array.from(partnerIdSet);

    const partners: PartnerInfo[] = await prisma.profile.findMany({
      where: { id: { in: partnerIds } },
      select: { id: true, full_name: true, role: true, avatar_url: true },
    });

    const [lastMessages, unreadCounts] = await Promise.all([
      Promise.all(
        partners.map((p) =>
          prisma.message.findFirst({
            where: {
              OR: [
                { sender_id: userId, receiver_id: p.id },
                { sender_id: p.id, receiver_id: userId },
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
        if (bt !== at) return bt - at;
        return a.partner.full_name.localeCompare(b.partner.full_name, "tr");
      });

    return NextResponse.json({ data: conversations });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
