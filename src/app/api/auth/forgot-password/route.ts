import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/guards/supabase/supabaseClient";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "E-posta gerekli" }, { status: 400 });

    const origin = req.headers.get("origin") || "https://psikosun.com";

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/reset-password`,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
