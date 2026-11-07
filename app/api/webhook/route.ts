
import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
        return NextResponse.json(
            { error: "Missing Stripe signature" },
            { status: 400 }
        );
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!stripeSecretKey || !webhookSecret) {
        return NextResponse.json(
            { error: "Webhook service is temporarily unavailable" },
            { status: 503 }
        );
    }
    const stripe = new Stripe(stripeSecretKey);

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            webhookSecret
        );
    } catch (error) {
        console.error("Stripe webhook signature verification failed:", error);

        return NextResponse.json(
            { error: "Invalid webhook signature" },
            { status: 400 }
        );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
        return NextResponse.json(
            { error: "Webhook database is temporarily unavailable" },
            { status: 503 }
        );
    }
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    });

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;

                // Only process payments confirmed as paid by Stripe.
                if (session.payment_status !== "paid") {
                    console.log(
                        "Checkout completed, but payment is not paid:",
                        session.id
                    );
                    break;
                }

                // Read checkout metadata.
                const userId = session.metadata?.userId;
                const packageId = session.metadata?.packageId;
                const packageName = session.metadata?.packageName;
                const itemId = session.metadata?.itemId;
                const itemQuantity = session.metadata?.itemQuantity;

                // Validate required metadata.
                if (
                    !userId ||
                    !packageId ||
                    !packageName ||
                    !itemId ||
                    !itemQuantity
                ) {
                    console.error(
                        "Paid session is missing required metadata:",
                        { sessionId: session.id }
                    );

                    return NextResponse.json(
                        { error: "Missing required checkout metadata" },
                        { status: 400 }
                    );
                }

                // Validate item ID and quantity.
                const parsedItemId = Number(itemId);
                const parsedItemQuantity = Number(itemQuantity);

                if (
                    !Number.isSafeInteger(parsedItemId) ||
                    parsedItemId <= 0 ||
                    !Number.isSafeInteger(parsedItemQuantity) ||
                    parsedItemQuantity <= 0
                ) {
                    console.error("Invalid item metadata:", session.id);

                    return NextResponse.json(
                        { error: "Invalid item metadata" },
                        { status: 400 }
                    );
                }

                // Validate payment amount and currency.
                if (
                    session.amount_total === null ||
                    !session.currency
                ) {
                    console.error(
                        "Paid session is missing amount or currency:",
                        session.id
                    );

                    return NextResponse.json(
                        { error: "Missing payment amount or currency" },
                        { status: 400 }
                    );
                }

                // Record the verified payment in Supabase.
                // Existing Stripe sessions are not overwritten on retries.
                const { data, error: databaseError } = await supabaseAdmin
                    .from("orders")
                    .upsert(
                        {
                            user_id: userId,
                            stripe_session_id: session.id,
                            stripe_payment_intent_id:
                                typeof session.payment_intent === "string"
                                    ? session.payment_intent
                                    : null,
                            package_id: packageId,
                            package_name: packageName,
                            item_id: parsedItemId,
                            item_quantity: parsedItemQuantity,
                            amount_total: session.amount_total,
                            currency: session.currency,
                            payment_status: "paid",
                            delivery_status: "queued",
                        },
                        {
                            onConflict: "stripe_session_id",
                            ignoreDuplicates: true,
                        }
                    )
                    .select("id");

                if (databaseError) {
                    console.error(
                        "Failed to save paid order:",
                        databaseError
                    );

                    return NextResponse.json(
                        { error: "Unable to record paid order" },
                        { status: 500 }
                    );
                }

                console.log("Verified payment processed:", {
                    sessionId: session.id,
                    userId,
                    packageId,
                    itemId: parsedItemId,
                    itemQuantity: parsedItemQuantity,
                    amountTotal: session.amount_total,
                    currency: session.currency,
                    newOrderInserted: Boolean(data?.length),
                });

                // In-game delivery will be connected separately.
                // Do not deliver items directly from the Stripe webhook.

                break;
            }

            default:
                console.log(`Unhandled Stripe event: ${event.type}`);
        }

        return NextResponse.json({ received: true });

    } catch (error) {
        console.error("Webhook processing error:", error);

        return NextResponse.json(
            { error: "Webhook processing failed" },
            { status: 500 }
        );
    }
}
