import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../lib/supabaseServer";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY environment variable");
}

const stripe = new Stripe(stripeSecretKey);

export async function POST(request: Request) {
    try {
        const supabase = await createSupabaseServerClient();

        // Require the buyer to be signed in.
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Please log in before purchasing." },
                { status: 401 }
            );
        }

        const { packageId } = await request.json();

        // Temporary test package.
        const packages: Record<string, { name: string; price: number }> = {
            starter: {
                name: "Vyre Starter Package",
                price: 500,
            },
        };

        const selectedPackage = packages[packageId];

        if (!selectedPackage) {
            return NextResponse.json(
                { error: "Invalid package selected" },
                { status: 400 }
            );
        }

        const origin = request.headers.get("origin");

        if (!origin) {
            return NextResponse.json(
                { error: "Missing request origin" },
                { status: 400 }
            );
        }

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: selectedPackage.name,
                        },
                        unit_amount: selectedPackage.price,
                    },
                    quantity: 1,
                },
            ],
            success_url: `${origin}/store/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/store`,
            metadata: {
                packageId,
                userId: user.id,
                packageName: selectedPackage.name,
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error("Stripe checkout error:", error);

        return NextResponse.json(
            { error: "Unable to create checkout session" },
            { status: 500 }
        );
    }
}