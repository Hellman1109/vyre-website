"use client";

import { useState } from "react";

const packages = [
  { id: "bond_5", name: "$5 Bond", price: "$5", description: "One $5 Bond item for your Vyre account." },
  { id: "bond_10", name: "$10 Bond", price: "$10", description: "One $10 Bond item for your Vyre account." },
  { id: "bond_25", name: "$25 Bond", price: "$25", description: "One $25 Bond item for your Vyre account.", featured: true },
  { id: "bond_50", name: "$50 Bond", price: "$50", description: "One $50 Bond item for your Vyre account." },
  { id: "bond_100", name: "$100 Bond", price: "$100", description: "One $100 Bond item for your Vyre account." },
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

      if (!response.ok) throw new Error(data.error || "Unable to start checkout.");
      if (!data.url) throw new Error("Stripe did not return a checkout link.");

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
          <h1 className="mt-5 text-5xl font-black tracking-tight md:text-7xl"><span className="text-violet-400">STORE</span></h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-gray-400">Choose the exact bond item you want. Each purchase gives you <span className="font-semibold text-white">one matching bond item</span> in-game.</p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((item) => (
            <article key={item.id} className={`relative flex flex-col rounded-2xl border p-7 ${item.featured ? "border-violet-400 bg-violet-950/30 shadow-[0_0_45px_rgba(139,92,246,0.13)]" : "border-white/10 bg-white/[0.035]"}`}>
              {item.featured && <span className="absolute -top-3 left-6 rounded-full bg-violet-500 px-3 py-1 text-[10px] font-black uppercase tracking-widest">Popular</span>}
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300">{item.name}</div>
              <p className="mt-6 min-h-12 text-sm leading-6 text-gray-400">{item.description}</p>
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
          <p role="alert" className="mx-auto mt-6 max-w-3xl rounded-lg border border-red-500/30 bg-red-950/30 p-4 text-center text-sm text-red-200">{checkoutError}</p>
        )}

        <div className="mx-auto mt-12 max-w-3xl rounded-xl border border-white/10 bg-white/[0.025] p-6 text-center">
          <h2 className="font-bold text-white">Secure checkout</h2>
          <p className="mt-2 text-sm leading-6 text-gray-400">Payments are processed securely by Stripe. Each product is a single, specifically priced bond item. In-game delivery is not automated yet, so do not enable live purchases until delivery has been connected and tested.</p>
        </div>

        <p className="mt-10 text-center text-xs text-gray-600">Vyre is a community-run private game server. Bond purchases are optional.</p>
        <div className="mt-8 text-center"><a href="/" className="text-sm text-gray-400 transition hover:text-violet-300">← Back to Home</a></div>
      </section>
    </main>
  );
}
