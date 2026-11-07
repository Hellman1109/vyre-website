"use client";

import { useState } from "react";

export default function VotePage() {
    const [username, setUsername] = useState("");
    const [voteError, setVoteError] = useState("");
    const [startingVote, setStartingVote] = useState(false);

    async function startVote() {
        if (startingVote) return;
        setVoteError("");
        const cleanedUsername = username.trim().replace(/ +/g, " ");
        if (!/^[a-zA-Z0-9 _-]{1,12}$/.test(cleanedUsername)) {
            setVoteError("Enter a valid Vyre username (1–12 characters).");
            return;
        }

        const voteWindow = window.open("about:blank", "_blank");
        setStartingVote(true);
        try {
            const response = await fetch("/api/vote/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: cleanedUsername }),
            });
            const data = await response.json();
            if (!response.ok || typeof data.url !== "string") {
                throw new Error(data.error || "Unable to start voting.");
            }
            if (voteWindow && !voteWindow.closed) {
                voteWindow.opener = null;
                voteWindow.location.replace(data.url);
            } else {
                window.location.assign(data.url);
            }
        } catch (error) {
            voteWindow?.close();
            setVoteError(error instanceof Error ? error.message : "Unable to start voting.");
        } finally {
            setStartingVote(false);
        }
    }
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

                    <div className="mx-auto mt-10 max-w-md rounded-xl border border-purple-900/40 bg-white/[0.03] p-6 text-left">
                        <label htmlFor="vote-username" className="block text-sm font-bold text-purple-200">
                            RuneScape Username
                        </label>
                        <input
                            id="vote-username"
                            type="text"
                            autoComplete="off"
                            maxLength={12}
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}
                            placeholder="Enter your Vyre character name"
                            className="mt-3 w-full rounded-lg border border-purple-800 bg-[#140f22] px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-purple-400"
                        />
                        <p className="mt-3 text-xs leading-5 text-gray-400">
                            Your username will be saved with a unique vote ID. Vote rewards are not enabled yet.
                        </p>
                    </div>

                    {voteError && <p role="alert" className="mx-auto mt-4 max-w-md text-sm text-red-300">{voteError}</p>}

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
                                    <button
                                        type="button"
                                        onClick={startVote}
                                        disabled={startingVote}
                                        className="mt-6 w-full rounded-lg bg-purple-600 px-5 py-3 font-bold text-white transition hover:bg-purple-500 disabled:cursor-wait disabled:opacity-60"
                                    >
                                        {startingVote ? "Opening..." : "Vote Now"}
                                    </button>
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