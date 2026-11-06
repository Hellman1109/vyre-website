import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../lib/supabaseServer";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY environment variable");
}

const stripe = new Stripe(stripeSecretKey);

// One purchase creates one of the matching in-game bond item IDs.
// Item IDs are from the source owner's supplied product catalogue.
const bondProducts: Record<string, { name: string; price: number; itemId: number }> = {
    bond_5: { name: "$5 Bond", price: 500, itemId: 13190 },
    bond_10: { name: "$10 Bond", price: 1000, itemId: 2403 },
    bond_25: { name: "$25 Bond", price: 2500, itemId: 2396 },
    bond_50: { name: "$50 Bond", price: 5000, itemId: 786 },
    bond_100: { name: "$100 Bond", price: 10000, itemId: 761 },
};

export async function POST(request: Request) {
    try {
        const supabase = await createSupabaseServerClient();
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Please log in to your Vyre account before purchasing." },
                { status: 401 }
            );
        }

        const body = await request.json();
        const packageId = typeof body.packageId === "string" ? body.packageId : "";
        const selectedProduct = bondProducts[packageId];

        if (!selectedProduct) {
            return NextResponse.json(
                { error: "Invalid bond item selected." },
                { status: 400 }
            );
        }

        const origin = request.headers.get("origin");
        if (!origin) {
            return NextResponse.json({ error: "Missing request origin." }, { status: 400 });
        }

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            line_items: [{
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: selectedProduct.name,
                        description: "One in-game Vyre bond item",
                    },
                    unit_amount: selectedProduct.price,
                },
                quantity: 1,
            }],
            success_url: `${origin}/store/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/store`,
            metadata: {
                packageId,
                userId: user.id,
                packageName: selectedProduct.name,
                itemId: String(selectedProduct.itemId),
                itemQuantity: "1",
            },
        });

        if (!session.url) {
            return NextResponse.json(
                { error: "Stripe did not return a checkout URL." },
                { status: 502 }
            );
        }

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error("Stripe checkout error:", error);
        return NextResponse.json(
            { error: "Unable to create checkout session. Please try again." },
            { status: 500 }
        );
    }
}
