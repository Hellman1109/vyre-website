"use client";

import { useState } from "react";

const packages = [
  { id: "starter", bonds: 1, price: "$5", name: "Starter Bond", description: "A small boost to get your Vyre adventure moving." },
  { id: "adventurer", bonds: 2, price: "$10", name: "Adventurer Pack", description: "A little extra for your next adventure." },
  { id: "champion", bonds: 5, price: "$25", name: "Champion Pack", description: "More bonds for your in-game goals.", featured: true },
  { id: "elite", bonds: 10, price: "$50", name: "Elite Pack", description: "A larger bond package for dedicated players." },
  { id: "legend", bonds: 20, price: "$100", name: "Legend Pack", description: "The largest Vyre bond package." },
];

export default function StorePage() {
  const [loadingPackage, setLoadingPackage] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState("");

  async function startCheckout(packageId: string) {
    setLoadingPackage(packageId);
    setCheckoutError("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to start checkout.");
      }
      if (!data.url) {
        throw new Error("Stripe did not return a checkout link.");
      }

      window.location.assign(data.url);
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
      setLoadingPackage(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#080711] text-white">
      <nav className="flex items-center justify-between border-b border-violet-900/40 px-6 py-5 md:px-10">
        <a href="/" className="text-2xl font-black tracking-[0.28em] text-violet-300">VYRE</a>
        <a href="https://discord.gg/vyrersps" target="_blank" rel="noopener noreferrer" className="rounded-lg border border-violet-500/40 px-4 py-2 text-sm font-semibold text-violet-200 transition hover:bg-violet-500/10">Discord Support</a>
      </nav>

      <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.45em] text-violet-400">The official Vyre store</p>
          <h1 className="mt-5 text-5xl font-black tracking-tight md:text-7xl">BOND <span className="text-violet-400">STORE</span></h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-gray-400">Choose your bond package and support the world of Vyre. Every package follows the same rate: <span className="font-semibold text-white">1 bond per $5.</span></p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((item) => (
            <article key={item.id} className={`relative flex flex-col rounded-2xl border p-7 ${item.featured ? "border-violet-400 bg-violet-950/30 shadow-[0_0_45px_rgba(139,92,246,0.13)]" : "border-white/10 bg-white/[0.035]"}`}>
              {item.featured && <span className="absolute -top-3 left-6 rounded-full bg-violet-500 px-3 py-1 text-[10px] font-black uppercase tracking-widest">Popular</span>}
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300">{item.name}</div>
              <div className="mt-6 flex items-end gap-2">
                <span className="text-5xl font-black">{item.bonds}</span>
                <span className="pb-1 text-lg font-bold text-gray-300">Bonds</span>
              </div>
              <p className="mt-3 min-h-12 text-sm leading-6 text-gray-400">{item.description}</p>
              <div className="mt-7 border-t border-white/10 pt-5">
                <div className="text-3xl font-black">{item.price}<span className="ml-2 text-xs font-medium text-gray-500">USD</span></div>
                <button
                  type="button"
                  onClick={() => startCheckout(item.id)}
                  disabled={loadingPackage !== null}
                  className={`mt-6 block w-full rounded-lg px-5 py-3 text-center text-sm font-extrabold transition disabled:cursor-not-allowed disabled:opacity-60 ${item.featured ? "bg-violet-500 text-white hover:bg-violet-400" : "bg-white/10 text-white hover:bg-violet-500"}`}
                >
                  {loadingPackage === item.id ? "Opening secure checkout..." : "Buy Now"}
                </button>
              </div>
            </article>
          ))}
        </div>

        {checkoutError && (
          <p role="alert" className="mx-auto mt-6 max-w-3xl rounded-lg border border-red-500/30 bg-red-950/30 p-4 text-center text-sm text-red-200">
            {checkoutError}
          </p>
        )}

        <div className="mx-auto mt-12 max-w-3xl rounded-xl border border-white/10 bg-white/[0.025] p-6 text-center">
          <h2 className="font-bold text-white">Secure checkout</h2>
          <p className="mt-2 text-sm leading-6 text-gray-400">Select a package to continue to Stripe's secure payment page. Purchases are recorded after Stripe confirms payment. In-game bond delivery is not automatic yet; please follow the delivery instructions after checkout.</p>
        </div>

        <p className="mt-10 text-center text-xs text-gray-600">Vyre is a community-run private game server. Bond purchases are optional.</p>
        <div className="mt-8 text-center"><a href="/" className="text-sm text-gray-400 transition hover:text-violet-300">← Back to Home</a></div>
      </section>
    </main>
  );
}
