import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { createClient } from "@supabase/supabase-js";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase server environment variables");
}

const supabase = createClient(supabaseUrl, serviceRoleKey);
export async function POST(request: Request) {
    try {
        const serverSecret = process.env.VYRE_LINK_SECRET;
        const providedSecret = request.headers.get("x-vyre-server-secret");

        if (!serverSecret || providedSecret !== serverSecret) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();

        const username = String(body.username ?? "").trim();
        const code = String(body.code ?? "").trim();

        if (!/^[a-zA-Z0-9 ]{1,12}$/.test(username)) {
            return NextResponse.json(
                { error: "Invalid RSPS username." },
                { status: 400 }
            );
        }

        if (!/^\d{6}$/.test(code)) {
            return NextResponse.json(
                { error: "Invalid verification code." },
                { status: 400 }
            );
        }

        const codeHash = createHash("sha256")
            .update(code)
            .digest("hex");

        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

        const { error } = await supabase
            .from("account_link_codes")
            .insert({
                code_hash: codeHash,
                rsps_username: username,
                expires_at: expiresAt
            });

        if (error) {
            console.error("Code storage error:", error);

            return NextResponse.json(
                { error: "Unable to save verification code." },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Verification code saved.",
            expiresInMinutes: 10
        });

    } catch (error) {
        console.error("Link creation error:", error);

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}