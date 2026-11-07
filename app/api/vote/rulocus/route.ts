import { createClient } from "@supabase/supabase-js";
import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const reply = (message: string, status = 200) =>
    new NextResponse(message, { status, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });

async function callback(request: Request) {
    const expected = process.env.RULOCUS_CALLBACK_SECRET;
    if (!expected || expected.length < 32) return reply("Unavailable", 503);

    const params = new URL(request.url).searchParams;
    if (request.method === "POST") {
        const type = request.headers.get("content-type") || "";
        if (!type.includes("application/x-www-form-urlencoded")) return reply("Unsupported format", 415);
        const body = await request.text();
        if (body.length > 8192) return reply("Invalid request", 400);
        const form = new URLSearchParams(body);
        for (const key of ["callback", "secret", "ip", "testmode"]) {
            const fromBody = form.get(key);
            const fromQuery = params.get(key);
            if (fromBody !== null && fromQuery !== null && fromBody !== fromQuery) return reply("Conflicting parameters", 400);
            if (fromBody !== null) params.set(key, fromBody);
        }
    }

    const supplied = params.get("secret") || "";
    const a = createHash("sha256").update(supplied).digest();
    const b = createHash("sha256").update(expected).digest();
    if (!supplied || !timingSafeEqual(a, b)) return reply("Forbidden", 403);

    // RULOCUS tester requests must never mark a vote as verified.\n    if (params.has("testmode")) return reply("TEST OK");\n\n    const id = params.get("callback");
    if (!id || !UUID.test(id)) return reply("Invalid callback ID", 400);

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return reply("Unavailable", 503);
    const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

    const { error } = await db.from("vote_attempts")
        .update({ status: "verified", callback_received_at: new Date().toISOString(), verified_at: new Date().toISOString() })
        .eq("site_id", 4)
        .eq("incentive_id", id.toLowerCase())
        .eq("status", "pending");
    if (error) {
        console.error("RULOCUS callback database error:", error.code);
        return reply("Database error", 500);
    }
    return reply("OK");
}

export async function GET(request: Request) { return callback(request); }
export async function POST(request: Request) { return callback(request); }
