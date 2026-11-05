"use client";

import { useMemo, useState } from "react";

type Mode =
    | "Normal"
    | "Ironman"
    | "Hardcore Ironman"
    | "Ultimate Ironman"
    | "Group Ironman"
    | "Rogue";

type Player = {
    rank: number;
    username: string;
    mode: Mode;
    combat: number;
    totalLevel: number;
    totalXp: number;
};

const modes: Mode[] = [
    "Normal",
    "Ironman",
    "Hardcore Ironman",
    "Ultimate Ironman",
    "Group Ironman",
    "Rogue",
];

const demoPlayers: Player[] = [
    {
        rank: 1,
        username: "VyreLegend",
        mode: "Normal",
        combat: 126,
        totalLevel: 2277,
        totalXp: 450000000,
    },
    {
        rank: 2,
        username: "IronVyre",
        mode: "Ironman",
        combat: 126,
        totalLevel: 2201,
        totalXp: 312000000,
    },
    {
        rank: 3,
        username: "ShadowHC",
        mode: "Hardcore Ironman",
        combat: 126,
        totalLevel: 2184,
        totalXp: 285000000,
    },
    {
        rank: 4,
        username: "SoloGrind",
        mode: "Ultimate Ironman",
        combat: 126,
        totalLevel: 2100,
        totalXp: 190000000,
    },
    {
        rank: 5,
        username: "VyreGroup",
        mode: "Group Ironman",
        combat: 124,
        totalLevel: 2050,
        totalXp: 155000000,
    },
    {
        rank: 6,
        username: "RogueSlayer",
        mode: "Rogue",
        combat: 126,
        totalLevel: 1998,
        totalXp: 130000000,
    },
];

const tabs = ["Overall", "Skills", "Boss KCs", "Clues", "Activities"];

export default function HighscoresPage() {
    const [selectedMode, setSelectedMode] = useState<Mode>("Normal");
    const [selectedTab, setSelectedTab] = useState("Overall");
    const [search, setSearch] = useState("");

    const filteredPlayers = useMemo(() => {
        return demoPlayers.filter(
            (player) =>
                player.mode === selectedMode &&
                player.username.toLowerCase().includes(search.toLowerCase())
        );
    }, [selectedMode, search]);

    return (
        <main className="min-h-screen bg-[#080611] px-4 py-12 text-white sm:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-10">
                    <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-purple-400">
                        Vyre RSPS
                    </p>
                    <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
                        High Scores
                    </h1>
                    <p className="mt-4 max-w-2xl text-gray-400">
                        Track your progress, compare your stats, and climb the Vyre
                        leaderboards.
                    </p>
                </div>

                <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-purple-900/50 bg-[#110d20] p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <label
                            htmlFor="mode"
                            className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-400"
                        >
                            Game Mode
                        </label>
                        <select
                            id="mode"
                            value={selectedMode}
                            onChange={(event) =>
                                setSelectedMode(event.target.value as Mode)
                            }
                            className="w-full rounded-lg border border-purple-800 bg-[#080611] px-4 py-3 text-white outline-none focus:border-purple-400 sm:w-64"
                        >
                            {modes.map((mode) => (
                                <option key={mode} value={mode}>
                                    {mode}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="w-full sm:max-w-sm">
                        <label
                            htmlFor="player-search"
                            className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-400"
                        >
                            Find a Player
                        </label>
                        <input
                            id="player-search"
                            type="text"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Enter username..."
                            className="w-full rounded-lg border border-purple-800 bg-[#080611] px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-purple-400"
                        />
                    </div>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setSelectedTab(tab)}
                            className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
                                selectedTab === tab
                                    ? "bg-purple-600 text-white"
                                    : "border border-purple-900/50 bg-[#110d20] text-gray-400 hover:text-white"
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="overflow-hidden rounded-2xl border border-purple-900/50 bg-[#110d20]">
                    <div className="flex flex-col gap-2 border-b border-purple-900/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-lg font-bold">{selectedTab}</h2>
                        <span className="text-xs text-yellow-400">
              DEMO DATA — database connection coming next
            </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[650px] text-left text-sm">
                            <thead className="bg-[#0c0917] text-xs uppercase tracking-wider text-gray-500">
                            <tr>
                                <th className="px-5 py-4">Rank</th>
                                <th className="px-5 py-4">Player</th>
                                <th className="px-5 py-4">Combat</th>
                                <th className="px-5 py-4">Total Level</th>
                                <th className="px-5 py-4">Total XP</th>
                            </tr>
                            </thead>

                            <tbody>
                            {filteredPlayers.map((player) => (
                                <tr
                                    key={player.username}
                                    className="border-t border-purple-950/70 transition hover:bg-purple-950/30"
                                >
                                    <td className="px-5 py-4 font-bold text-purple-300">
                                        #{player.rank}
                                    </td>
                                    <td className="px-5 py-4 font-semibold text-white">
                                        {player.username}
                                    </td>
                                    <td className="px-5 py-4 text-gray-300">
                                        {player.combat}
                                    </td>
                                    <td className="px-5 py-4 text-gray-300">
                                        {player.totalLevel.toLocaleString()}
                                    </td>
                                    <td className="px-5 py-4 text-gray-300">
                                        {player.totalXp.toLocaleString()}
                                    </td>
                                </tr>
                            ))}

                            {filteredPlayers.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-5 py-12 text-center text-gray-500"
                                    >
                                        No demo players found for this mode.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <p className="mt-4 text-center text-xs text-gray-600">
                    Vyre RSPS · High Scores
                </p>
            </div>
        </main>
    );
}