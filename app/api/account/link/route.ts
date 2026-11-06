
import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { createSupabaseServerClient } from "../../../lib/supabaseServer";

export async function POST(request: Request) {
    try {
        const supabase = await createSupabaseServerClient();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Please log in first." },
                { status: 401 }
            );
        }

        const body = await request.json();
        const code = String(body.code ?? "").trim();

        if (!/^\d{6}$/.test(code)) {
            return NextResponse.json(
                { error: "Enter a valid six-digit code." },
                { status: 400 }
            );
        }

        const codeHash = createHash("sha256")
            .update(code)
            .digest("hex");

        const { data, error } = await supabase.rpc(
            "redeem_account_link_code",
            { p_code_hash: codeHash }
        );

        if (error) {
            console.error("Account linking error:", error);
            return NextResponse.json(
                { error: "Unable to verify your code." },
                { status: 500 }
            );
        }

        if (data !== "success") {
            const messages: Record<string, string> = {
                not_authenticated: "Please log in first.",
                invalid_or_expired: "That code is invalid or expired.",
                invalid_username: "Unable to identify your RSPS account.",
                profile_already_linked: "Your website account already has another RSPS account linked.",
                username_already_linked: "That RSPS account is already linked to another website account.",
            };

            return NextResponse.json(
                { error: messages[data] ?? "Account linking failed." },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Your Vyre RSPS account has been linked!",
        });
    } catch (error) {
        console.error("Account linking error:", error);

        return NextResponse.json(
            { error: "An unexpected error occurred." },
            { status: 500 }
        );
    }
}
