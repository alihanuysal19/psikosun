import { prisma } from "@/utils/prisma";
import { serializePrisma } from "@/utils/serialize";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const pkgId = parseInt(id);
    if (Number.isNaN(pkgId)) {
      return NextResponse.json({ error: "Geçersiz paket id" }, { status: 400 });
    }

    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
    if (typeof body.description === "string") data.description = body.description;
    if (body.lesson_count !== undefined) {
      const n = parseInt(body.lesson_count);
      if (Number.isNaN(n) || n < 1) {
        return NextResponse.json({ error: "Geçersiz ders sayısı" }, { status: 400 });
      }
      data.lesson_count = n;
    }
    if (body.price !== undefined) {
      const p = parseFloat(body.price);
      if (Number.isNaN(p) || p < 0) {
        return NextResponse.json({ error: "Geçersiz fiyat" }, { status: 400 });
      }
      data.price = p;
    }
    if (typeof body.is_active === "boolean") data.is_active = body.is_active;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Güncellenecek alan yok" }, { status: 400 });
    }

    const pkg = await prisma.package.update({ where: { id: pkgId }, data });
    return NextResponse.json({ data: serializePrisma(pkg) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const pkgId = parseInt(id);
    if (Number.isNaN(pkgId)) {
      return NextResponse.json({ error: "Geçersiz paket id" }, { status: 400 });
    }

    const inUse = await prisma.userPackage.count({ where: { package_id: pkgId } });
    if (inUse > 0) {
      const pkg = await prisma.package.update({
        where: { id: pkgId },
        data: { is_active: false },
      });
      return NextResponse.json({
        data: serializePrisma(pkg),
        soft: true,
        message: `${inUse} öğrenci bu pakete sahip; paket pasifleştirildi.`,
      });
    }

    await prisma.package.delete({ where: { id: pkgId } });
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
