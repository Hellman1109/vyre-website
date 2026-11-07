export default function VotePage() {
    const voteSites = [
        {
            name: "Top100Arena",
            description: "Support Vyre RSPS by voting on Top100Arena.",
            url: "https://www.top100arena.com/listing/102890/vote",
        },
        {
            name: "Vote Site 2",
            description: "Help Vyre grow by voting every day.",
            url: "#",
        },
        {
            name: "Vote Site 3",
            description: "Earn rewards by supporting the community.",
            url: "#",
        },
    ];

    return (
        <main className="min-h-screen bg-[#090711] text-white">
            <nav className="flex items-center justify-between border-b border-purple-900/40 px-8 py-5">
                <a href="/" className="text-2xl font-black tracking-[0.25em] text-purple-300">
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
                <div className="mx-auto max-w-4xl text-center">
                    <p className="text-sm font-bold uppercase tracking-[0.4em] text-purple-400">
                        Support the server
                    </p>

                    <h1 className="mt-4 text-5xl font-black">
                        VOTE FOR <span className="text-purple-400">VYRE</span>
                    </h1>

                    <p className="mx-auto mt-6 max-w-2xl leading-7 text-gray-400">
                        Help Vyre grow by voting for the server. Voting links are being added. In-game vote rewards are not enabled yet.
                    </p>

                    <div className="mt-12 grid gap-5 md:grid-cols-3">
                        {voteSites.map((site) => (
                            <div
                                key={site.name}
                                className="rounded-xl border border-purple-900/40 bg-white/[0.03] p-6"
                            >
                                <h2 className="text-xl font-bold text-purple-300">{site.name}</h2>
                                <p className="mt-3 text-sm leading-6 text-gray-400">
                                    {site.description}
                                </p>

                                {site.url !== "#" ? (
                                    <a
                                        href={site.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-6 inline-block w-full rounded-lg bg-purple-600 px-5 py-3 font-bold text-white transition hover:bg-purple-500"
                                    >
                                        Vote Now
                                    </a>
                                ) : (
                                    <button
                                        disabled
                                        className="mt-6 w-full cursor-not-allowed rounded-lg bg-purple-900/40 px-5 py-3 font-bold text-gray-400"
                                    >
                                        Coming Soon
                                    </button>
                                )}
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