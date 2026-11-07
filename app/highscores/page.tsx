"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Player = {
  rank: number;
  username: string;
  mode: string;
  combat: number;
  totalLevel: number;
  totalXp: number;
  skillXp: number;
};

const modes = ["All", "Normal", "Ironman", "Hardcore Ironman", "Ultimate Ironman", "Group Ironman", "Rogue"];
const skills = ["Overall", "Attack", "Defence", "Strength", "Hitpoints", "Ranged", "Mining", "Agility", "Herblore", "Thieving", "Slayer", "Farming", "Runecrafting", "Hunter", "Construction"];

export default function HighscoresPage() {
  const [selectedMode, setSelectedMode] = useState("All");
  const [selectedSkill, setSelectedSkill] = useState("Overall");
  const [search, setSearch] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const query = new URLSearchParams({ mode: selectedMode, sort: selectedSkill.toLowerCase(), search });
        const response = await fetch("/api/highscores?" + query, { signal: controller.signal });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Unable to load highscores.");
        setPlayers(result.players || []);
      } catch (err) {
        if (!controller.signal.aborted) {
          setPlayers([]);
          setError(err instanceof Error ? err.message : "Unable to load highscores.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => { clearTimeout(timeout); controller.abort(); };
  }, [selectedMode, selectedSkill, search]);

  return (
    <main className="min-h-screen bg-[#080611] px-4 py-12 text-white sm:px-8">
      <div className="mx-auto max-w-7xl">
        <Link href="/" className="text-sm text-purple-300 hover:text-purple-200">← Back to Vyre</Link>
        <header className="mb-10 mt-8">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-purple-400">Vyre RSPS</p>
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">High Scores</h1>
          <p className="mt-4 text-gray-400">Track your progress, compare your stats, and climb the Vyre leaderboards.</p>
        </header>

        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-purple-900/50 bg-[#110d20] p-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <label htmlFor="mode" className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-400">Game Mode</label>
            <select id="mode" value={selectedMode} onChange={(event) => setSelectedMode(event.target.value)} className="w-full rounded-lg border border-purple-800 bg-[#080611] px-4 py-3 text-white sm:w-64">
              {modes.map((mode) => <option key={mode} value={mode}>{mode}</option>)}
            </select>
          </div>
          <div className="w-full sm:max-w-sm">
            <label htmlFor="player-search" className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-400">Find a Player</label>
            <input id="player-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Enter username..." maxLength={32} className="w-full rounded-lg border border-purple-800 bg-[#080611] px-4 py-3 text-white placeholder:text-gray-600 sm:w-full"/>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {skills.map((skill) => <button key={skill} onClick={() => setSelectedSkill(skill)} className={`rounded-lg px-4 py-2 text-sm font-bold transition ${selectedSkill === skill ? "bg-purple-600 text-white" : "border border-purple-900/50 bg-[#110d20] text-gray-400 hover:text-white"}`}>{skill}</button>)}
        </div>
        <div className="overflow-hidden rounded-2xl border border-purple-900/50 bg-[#110d20]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-900/50 px-5 py-4">
            <h2 className="text-lg font-bold">{selectedSkill} Rankings</h2>
            <span className="text-xs text-purple-300">MySQL Highscores</span>
          </div>
          {error && <p role="alert" className="border-b border-red-900/40 px-5 py-4 text-sm text-red-300">{error}</p>}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-[#0c0917] text-xs uppercase tracking-wider text-gray-500"><tr>
                <th className="px-5 py-4">Rank</th><th className="px-5 py-4">Player</th><th className="px-5 py-4">Mode</th><th className="px-5 py-4">Combat</th><th className="px-5 py-4">Total Level</th><th className="px-5 py-4">{selectedSkill === "Overall" ? "Total XP" : selectedSkill + " XP"}</th>
              </tr></thead>
              <tbody>
                {players.map((player) => <tr key={player.username} className="border-t border-purple-950/70 hover:bg-purple-950/30">
                  <td className="px-5 py-4 font-bold text-purple-300">#{player.rank}</td>
                  <td className="px-5 py-4 font-semibold">{player.username}</td>
                  <td className="px-5 py-4 text-gray-400">{player.mode}</td>
                  <td className="px-5 py-4 text-gray-300">{player.combat}</td>
                  <td className="px-5 py-4 text-gray-300">{player.totalLevel.toLocaleString()}</td>
                  <td className="px-5 py-4 text-gray-300">{(selectedSkill === "Overall" ? player.totalXp : player.skillXp).toLocaleString()}</td>
                </tr>)}
                {!loading && players.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-500">{error ? "Please try again later." : "No players found."}</td></tr>}
                {loading && <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400">Loading rankings...</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-gray-600">Vyre RSPS · High Scores</p>
      </div>
    </main>
  );
}
