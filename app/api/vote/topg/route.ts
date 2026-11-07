import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// TopG documents IP-based callback authentication, but Vercel request headers
// alone do not establish the true source IP. Record only an UNVERIFIED signal.
// Do not award votes or mark them verified from this endpoint.
const TOKEN_PATTERN = /^[0-9a-f]{32}$/i;

export async function GET(request: Request) {
    const token = new URL(request.url).searchParams.get("p_resp");
    if (!token || !TOKEN_PATTERN.test(token)) {
        return NextResponse.json({ error: "Invalid vote identifier." }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
        return NextResponse.json({ error: "Service unavailable." }, { status: 503 });
    }

    const id = token.toLowerCase().replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, "$1-$2-$3-$4-$5");
    const supabase = createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
    });

    const { error } = await supabase.from("vote_attempts")
        .update({ status: "callback_received", callback_received_at: new Date().toISOString() })
        .eq("site_id", 2)
        .eq("incentive_id", id)
        .eq("status", "pending");

    if (error) {
        console.error("TopG callback storage error:", error.code);
        return NextResponse.json({ error: "Could not record callback." }, { status: 500 });
    }

    return new NextResponse("OK", {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
}
