import { prisma } from "@/utils/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, package_id, expires_at } = body;
    if (!user_id || !package_id) return NextResponse.json({ error: "Eksik alan" }, { status: 400 });

    const pkg = await prisma.package.findUnique({ where: { id: parseInt(package_id) } });
    if (!pkg) return NextResponse.json({ error: "Paket bulunamadı" }, { status: 404 });

    const [userPackage] = await prisma.$transaction([
      prisma.userPackage.create({
        data: {
          user_id,
          package_id: pkg.id,
          remaining: pkg.lesson_count,
          total: pkg.lesson_count,
          expires_at: expires_at ? new Date(expires_at) : null,
        },
        include: { package: true },
      }),
      prisma.purchaseHistory.create({
        data: { user_id, package_id: pkg.id, amount: pkg.price },
      }),
    ]);

    return NextResponse.json({ data: userPackage }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
