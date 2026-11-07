import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Top100Arena's documented postback has no signature or shared secret.
// This endpoint records an UNVERIFIED callback signal only. Never grant rewards here.
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(request: Request) {
    const url = new URL(request.url);
    const incentiveId = url.searchParams.get("postback");

    if (!incentiveId || !UUID_PATTERN.test(incentiveId)) {
        return NextResponse.json({ error: "Invalid postback ID." }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
        return NextResponse.json({ error: "Service unavailable." }, { status: 503 });
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
    });

    // Only transition existing, pending Top100Arena attempts. The incentive ID
    // is not evidence that the caller is Top100Arena.
    const { data, error } = await supabase
        .from("vote_attempts")
        .update({
            status: "callback_received",
            callback_received_at: new Date().toISOString(),
        })
        .eq("incentive_id", incentiveId)
        .eq("site_id", 1)
        .eq("status", "pending")
        .select("id");

    if (error) {
        console.error("Vote callback storage error:", error.code);
        return NextResponse.json({ error: "Could not record callback." }, { status: 500 });
    }

    // A duplicate callback is harmless. Avoid exposing account details.
    return new NextResponse(data && data.length > 0 ? "OK" : "OK", {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
}
