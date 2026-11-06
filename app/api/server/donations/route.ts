
import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

const allowedProducts: Record<
    string,
    { itemId: number; amount: number; name: string }
> = {
    bond_5: { itemId: 13190, amount: 500, name: "$5 Bond" },
    bond_10: { itemId: 2403, amount: 1000, name: "$10 Bond" },
    bond_25: { itemId: 2396, amount: 2500, name: "$25 Bond" },
    bond_50: { itemId: 786, amount: 5000, name: "$50 Bond" },
    bond_100: { itemId: 761, amount: 10000, name: "$100 Bond" },
};

function isAuthorized(request: Request): boolean {
    const expected = process.env.VYRE_DONATION_SECRET;
    const supplied = request.headers.get("x-vyre-donation-secret");

    if (!expected || !supplied) return false;

    const expectedBuffer = Buffer.from(expected);
    const suppliedBuffer = Buffer.from(supplied);

    if (expectedBuffer.length !== suppliedBuffer.length) return false;

    return timingSafeEqual(expectedBuffer, suppliedBuffer);
}

export async function GET(request: Request) {
    if (!isAuthorized(request)) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const { data: orders, error: ordersError } = await supabaseAdmin
            .from("orders")
            .select(
                "stripe_session_id, user_id, package_id, package_name, item_id, item_quantity, amount_total, currency, payment_status, delivery_status"
            )
            .eq("payment_status", "paid")
            .eq("delivery_status", "queued")
            .not("stripe_session_id", "is", null)
            .order("created_at", { ascending: true })
            .limit(25);

        if (ordersError) {
            console.error("[VYRE DONATIONS] Order lookup failed:", ordersError);

            return NextResponse.json(
                { error: "Unable to retrieve donations." },
                { status: 500 }
            );
        }

        if (!orders || orders.length === 0) {
            return NextResponse.json({ donations: [] });
        }

        const userIds = [...new Set(orders.map(order => order.user_id))];

        const { data: profiles, error: profilesError } = await supabaseAdmin
            .from("profiles")
            .select("id, rsps_username")
            .in("id", userIds);

        if (profilesError) {
            console.error("[VYRE DONATIONS] Profile lookup failed:", profilesError);

            return NextResponse.json(
                { error: "Unable to retrieve linked accounts." },
                { status: 500 }
            );
        }

        const profileMap = new Map(
            (profiles ?? []).map(profile => [profile.id, profile.rsps_username])
        );

        const donations = orders.flatMap(order => {
            const product = allowedProducts[order.package_id];
            const username = profileMap.get(order.user_id);

            if (
                !product ||
                !username ||
                order.item_id !== product.itemId ||
                order.amount_total !== product.amount ||
                order.currency?.toLowerCase() !== "usd" ||
                !Number.isSafeInteger(order.item_quantity) ||
                order.item_quantity !== 1 ||
                !order.stripe_session_id
            ) {
                console.error(
                    "[VYRE DONATIONS] Skipping invalid order:",
                    order.stripe_session_id
                );
                return [];
            }

            return [{
                stripeSessionId: order.stripe_session_id,
                username: username.toLowerCase(),
                productName: product.name,
                itemId: product.itemId,
                itemQuantity: order.item_quantity,
                price: product.amount / 100
            }];
        });

        return NextResponse.json({ donations });

    } catch (error) {
        console.error("[VYRE DONATIONS] Unexpected error:", error);

        return NextResponse.json(
            { error: "Donation endpoint failed." },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    if (!isAuthorized(request)) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const body = await request.json();

        const stripeSessionId =
            typeof body.stripeSessionId === "string"
                ? body.stripeSessionId
                : "";

        if (
            !stripeSessionId.startsWith("cs_") ||
            stripeSessionId.length > 128
        ) {
            return NextResponse.json(
                { error: "Invalid Stripe session ID." },
                { status: 400 }
            );
        }

        const { data: order, error: lookupError } = await supabaseAdmin
            .from("orders")
            .select("id, payment_status, delivery_status")
            .eq("stripe_session_id", stripeSessionId)
            .maybeSingle();

        if (lookupError) {
            console.error("[VYRE DONATIONS] Acknowledgement lookup failed:", lookupError);

            return NextResponse.json(
                { error: "Unable to verify order." },
                { status: 500 }
            );
        }

        if (!order) {
            return NextResponse.json(
                { error: "Order not found." },
                { status: 404 }
            );
        }

        if (order.payment_status !== "paid") {
            return NextResponse.json(
                { error: "Order is not paid." },
                { status: 409 }
            );
        }

        if (order.delivery_status === "delivered") {
            return NextResponse.json({
                success: true,
                alreadyDelivered: true
            });
        }

        if (order.delivery_status !== "queued") {
            return NextResponse.json(
                { error: "Order is not queued." },
                { status: 409 }
            );
        }

        const { data: updatedOrders, error: updateError } =
            await supabaseAdmin
                .from("orders")
                .update({
                    delivery_status: "delivered",
                    updated_at: new Date().toISOString()
                })
                .eq("id", order.id)
                .eq("payment_status", "paid")
                .eq("delivery_status", "queued")
                .select("id");

        if (updateError) {
            console.error("[VYRE DONATIONS] Acknowledgement update failed:", updateError);

            return NextResponse.json(
                { error: "Unable to acknowledge donation." },
                { status: 500 }
            );
        }

        if (!updatedOrders || updatedOrders.length === 0) {
            return NextResponse.json(
                { error: "Order status changed. Retry acknowledgement." },
                { status: 409 }
            );
        }

        console.log(
            "[VYRE DONATIONS] Delivery acknowledged:",
            stripeSessionId
        );

        return NextResponse.json({
            success: true,
            delivered: true
        });

    } catch (error) {
        console.error("[VYRE DONATIONS] Acknowledgement error:", error);

        return NextResponse.json(
            { error: "Unable to process acknowledgement." },
            { status: 500 }
        );
    }
}
