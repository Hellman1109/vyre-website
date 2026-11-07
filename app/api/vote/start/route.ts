import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const USERNAME_PATTERN = /^[a-zA-Z0-9 _-]{1,12}$/;
const TOP100ARENA_URL = "https://www.top100arena.com/listing/102890/vote";

export async function POST(request: Request) {
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");
    if (origin && (!host || new URL(origin).host !== host)) {
        return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const rawUsername = (body as { username?: unknown } | null)?.username;
    const username = typeof rawUsername === "string" ? rawUsername.trim().replace(/ +/g, " ") : "";
    if (!USERNAME_PATTERN.test(username)) {
        return NextResponse.json({ error: "Enter a valid Vyre username (1–12 characters)." }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
        return NextResponse.json({ error: "Voting is temporarily unavailable." }, { status: 503 });
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
    });

    const incentiveId = crypto.randomUUID();
    const { error } = await supabase.from("vote_attempts").insert({
        username,
        site_id: 1,
        incentive_id: incentiveId,
        status: "pending",
    });

    if (error) {
        console.error("Unable to create vote attempt:", error.code);
        return NextResponse.json({ error: "Could not start your vote. Please try again." }, { status: 500 });
    }

    const voteUrl = new URL(TOP100ARENA_URL);
    voteUrl.searchParams.set("incentive", incentiveId);
    return NextResponse.json({ url: voteUrl.toString() }, {
        headers: { "Cache-Control": "no-store" },
    });
}
