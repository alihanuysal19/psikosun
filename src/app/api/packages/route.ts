import { prisma } from "@/utils/prisma";
import { serializePrisma } from "@/utils/serialize";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const packages = await prisma.package.findMany({
      where: { is_active: true },
      orderBy: { price: "asc" },
    });
    return NextResponse.json({ data: serializePrisma(packages) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, lesson_count, price } = body;
    if (!name || !lesson_count || !price)
      return NextResponse.json({ error: "Eksik alan" }, { status: 400 });

    const pkg = await prisma.package.create({
      data: {
        name,
        description,
        lesson_count: parseInt(lesson_count),
        price: parseFloat(price),
      },
    });
    return NextResponse.json({ data: serializePrisma(pkg) }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
