import Stripe from "stripe";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../lib/supabaseAdmin";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!stripeSecretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY environment variable");
}

if (!webhookSecret) {
    throw new Error("Missing STRIPE_WEBHOOK_SECRET environment variable");
}

const stripe = new Stripe(stripeSecretKey);

export async function POST(request: Request) {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
        return NextResponse.json(
            { error: "Missing Stripe signature" },
            { status: 400 }
        );
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            webhookSecret!
        );
    } catch (error) {
        console.error("Stripe webhook signature verification failed:", error);

        return NextResponse.json(
            { error: "Invalid webhook signature" },
            { status: 400 }
        );
    }

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;

                // Only process sessions Stripe confirms as paid.
                if (session.payment_status !== "paid") {
                    console.log("Checkout completed, but payment is not paid:", session.id);
                    break;
                }

                const userId = session.metadata?.userId;
                const packageId = session.metadata?.packageId;
                const packageName = session.metadata?.packageName;

                if (!userId || !packageId || !packageName) {
                    console.error("Paid session is missing required metadata:", {
                        sessionId: session.id,
                        userId,
                        packageId,
                        packageName,
                    });

                    return NextResponse.json(
                        { error: "Missing required checkout metadata" },
                        { status: 400 }
                    );
                }

                if (session.amount_total === null || !session.currency) {
                    console.error("Paid session is missing amount or currency:", session.id);

                    return NextResponse.json(
                        { error: "Missing payment amount or currency" },
                        { status: 400 }
                    );
                }

                // Store the verified payment in Supabase.
                // stripe_session_id is unique, so repeated webhook events won't
                // create duplicate orders.
                const { error: databaseError } = await supabaseAdmin
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
                            amount_total: session.amount_total,
                            currency: session.currency,
                            payment_status: "paid",
                            delivery_status: "queued",
                        },
                        {
                            onConflict: "stripe_session_id",
                        }
                    );

                if (databaseError) {
                    console.error("Failed to save paid order:", databaseError);

                    return NextResponse.json(
                        { error: "Unable to record paid order" },
                        { status: 500 }
                    );
                }

                console.log("Verified payment recorded in Supabase:", {
                    sessionId: session.id,
                    userId,
                    packageId,
                    amountTotal: session.amount_total,
                    currency: session.currency,
                });

                // TODO: Queue secure in-game delivery after order recording
                // is tested and the RSPS delivery system is connected.

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