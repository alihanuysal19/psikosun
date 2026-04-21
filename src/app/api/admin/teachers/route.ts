import { prisma } from "@/utils/prisma";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function GET() {
  try {
    const teachers = await prisma.profile.findMany({
      where: { role: "TEACHER", is_active: true },
      include: { my_students: { where: { is_active: true }, select: { id: true } } },
      orderBy: { full_name: "asc" },
    });
    return NextResponse.json({ data: teachers });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, full_name, password } = await req.json();
    if (!email || !full_name || !password)
      return NextResponse.json({ error: "Eksik alan" }, { status: 400 });

    const { data, error } = await getAdminClient().auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name },
      email_confirm: true,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const profile = await prisma.profile.create({
      data: { id: data.user.id, email, full_name, role: "TEACHER" },
    });

    return NextResponse.json({ data: profile }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
