import { prisma } from "@/utils/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Eksik parametre" }, { status: 400 });

  try {
    const [items, unread] = await Promise.all([
      prisma.notification.findMany({
        where: { user_id: userId },
        orderBy: { created_at: "desc" },
        take: 30,
        include: {
          actor: { select: { id: true, full_name: true, avatar_url: true, role: true } },
        },
      }),
      prisma.notification.count({
        where: { user_id: userId, read_at: null },
      }),
    ]);

    return NextResponse.json({ data: items, unread_count: unread });
  } catch (error: any) {
    // Notification tablosu henüz DB'de oluşturulmamışsa uygulamayı
    // crash ettirme — sessiz şekilde boş feed dön.
    const msg = String(error?.message ?? "");
    if (msg.includes("does not exist") || msg.includes("relation") || error?.code === "P2021") {
      return NextResponse.json({ data: [], unread_count: 0 });
    }
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, notification_id } = body;
    if (!user_id) return NextResponse.json({ error: "Eksik parametre" }, { status: 400 });

    if (notification_id) {
      await prisma.notification.updateMany({
        where: { id: notification_id, user_id },
        data: { read_at: new Date() },
      });
    } else {
      await prisma.notification.updateMany({
        where: { user_id, read_at: null },
        data: { read_at: new Date() },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
