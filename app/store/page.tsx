const storeCategories = [
    {
        name: "Starter Packages",
        description: "Get your adventure started with helpful extras.",
    },
    {
        name: "Cosmetic Items",
        description: "Customize your character with unique cosmetics.",
    },
    {
        name: "Supporter Ranks",
        description: "Support Vyre and unlock special perks.",
    },
];

export default function StorePage() {
    return (
        <main className="min-h-screen bg-[#090711] text-white">
            <nav className="flex items-center justify-between border-b border-purple-900/40 px-8 py-5">
                <a
                    href="/"
                    className="text-2xl font-black tracking-[0.25em] text-purple-300"
                >
                    VYRE
                </a>

                <a
                    href="https://discord.gg/vyrersps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-300 transition hover:text-purple-300"
                >
                    Join Discord
                </a>
            </nav>

            <section className="px-6 py-20">
                <div className="mx-auto max-w-5xl text-center">
                    <p className="text-sm font-bold uppercase tracking-[0.4em] text-purple-400">
                        Support your adventure
                    </p>

                    <h1 className="mt-4 text-5xl font-black">
                        VYRE <span className="text-purple-400">STORE</span>
                    </h1>

                    <p className="mx-auto mt-6 max-w-2xl leading-7 text-gray-400">
                        Browse packages, cosmetics, and supporter rewards. The store is
                        currently under development.
                    </p>

                    <div className="mt-12 grid gap-5 md:grid-cols-3">
                        {storeCategories.map((category) => (
                            <div
                                key={category.name}
                                className="rounded-xl border border-purple-900/40 bg-white/[0.03] p-6"
                            >
                                <h2 className="text-xl font-bold text-purple-300">
                                    {category.name}
                                </h2>

                                <p className="mt-3 text-sm leading-6 text-gray-400">
                                    {category.description}
                                </p>

                                <button
                                    disabled
                                    className="mt-6 w-full cursor-not-allowed rounded-lg bg-purple-900/40 px-5 py-3 font-bold text-gray-400"
                                >
                                    Coming Soon
                                </button>
                            </div>
                        ))}
                    </div>

                    <a
                        href="/"
                        className="mt-10 inline-block text-sm text-gray-400 hover:text-purple-300"
                    >
                        ← Back to Home
                    </a>
                </div>
            </section>
        </main>
    );
}