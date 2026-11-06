import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../lib/supabaseServer";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY environment variable");
}

const stripe = new Stripe(stripeSecretKey);

// Prices are set server-side so a browser cannot change the amount charged.
const packages: Record<string, { name: string; price: number; bonds: number }> = {
    starter: { name: "Vyre Starter Bond", price: 500, bonds: 1 },
    adventurer: { name: "Vyre Adventurer Pack", price: 1000, bonds: 2 },
    champion: { name: "Vyre Champion Pack", price: 2500, bonds: 5 },
    elite: { name: "Vyre Elite Pack", price: 5000, bonds: 10 },
    legend: { name: "Vyre Legend Pack", price: 10000, bonds: 20 },
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
        const selectedPackage = packages[packageId];

        if (!selectedPackage) {
            return NextResponse.json(
                { error: "Invalid bond package selected." },
                { status: 400 }
            );
        }

        const origin = request.headers.get("origin");
        if (!origin) {
            return NextResponse.json(
                { error: "Missing request origin." },
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
                            description: `${selectedPackage.bonds} Vyre bond${selectedPackage.bonds === 1 ? "" : "s"}`,
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
                bonds: String(selectedPackage.bonds),
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
