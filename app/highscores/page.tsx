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

const modes = ["All", "Normal", "Iron Man", "Hardcore Iron Man", "Ultimate Iron Man", "Group Ironman", "Extreme", "Rogue", "Rogue Ironman", "Rogue HC Ironman"];
const skills = ["Overall", "Attack", "Defence", "Strength", "Hitpoints", "Ranged", "Prayer", "Magic", "Cooking", "Woodcutting", "Fletching", "Fishing", "Firemaking", "Crafting", "Smithing", "Mining", "Herblore", "Agility", "Thieving", "Slayer", "Farming", "Runecrafting", "Hunter", "Construction"];
const skillIcons: Record<string, string> = {
  Overall: "🏆", Attack: "⚔️", Defence: "🛡️", Strength: "💪", Hitpoints: "❤️",
  Ranged: "🏹", Prayer: "✨", Magic: "🪄", Cooking: "🍳", Woodcutting: "🪓",
  Fletching: "🎯", Fishing: "🎣", Firemaking: "🔥", Crafting: "💎",
  Smithing: "🔨", Mining: "⛏️", Herblore: "🧪", Agility: "🏃",
  Thieving: "🗝️", Slayer: "💀", Farming: "🌱", Runecrafting: "🔮",
  Hunter: "🐾", Construction: "🏠"
};
const modeIcons: Record<string, string> = {
  Normal: "◆", "Iron Man": "⛨", "Hardcore Iron Man": "☠",
  "Ultimate Iron Man": "♜", "Group Ironman": "⚒", Extreme: "✦",
  Rogue: "⚔", "Rogue Ironman": "⛨", "Rogue HC Ironman": "☠"
};
const format = (n: number) => Number(n || 0).toLocaleString("en-US");

export default function HighscoresPage() {
  const [mode, setMode] = useState("All");
  const [skill, setSkill] = useState("Overall");
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
        const query = new URLSearchParams({ mode, sort: skill.toLowerCase(), search });
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
  }, [mode, skill, search]);

  const maxXp = Math.max(1, ...players.map(p => skill === "Overall" ? p.totalXp : p.skillXp));

  return (
    <main className="min-h-screen bg-[#100b18] px-3 py-8 text-[#f6f0fc] sm:px-8 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm font-semibold text-[#d3b7eb] transition hover:text-white">← Back to Vyre</Link>
        <header className="relative my-8 overflow-hidden rounded-2xl border border-[#503455] bg-gradient-to-br from-[#31182e] via-[#21162e] to-[#15101e] px-6 py-9 sm:px-10">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[#a83b49]/10 blur-3xl" />
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.35em] text-[#e3ad64]">Vyre RSPS · Live Rankings</p>
          <h1 className="text-4xl font-black uppercase tracking-wide sm:text-6xl">Vyre <span className="text-[#e4b657]">Highscores</span></h1>
          <p className="mt-3 max-w-2xl text-sm text-[#c4b5cb] sm:text-base">Rise through the ranks. Track your skills, challenge the best, and forge your legacy.</p>
        </header>

        <section className="mb-5 grid gap-4 rounded-xl border border-[#3e2a4b] bg-[#21182d] p-5 sm:grid-cols-[1fr_1fr]">
          <div>
            <label htmlFor="mode" className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#d5b6de]">Game mode</label>
            <select id="mode" value={mode} onChange={e => setMode(e.target.value)} className="w-full rounded-lg border border-[#574064] bg-[#130f1e] px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#b88b4d]">
              {modes.map(item => <option key={item} value={item}>{item === "All" ? "All game modes" : item}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="player-search" className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#d5b6de]">Find a player</label>
            <input id="player-search" type="search" value={search} onChange={e => setSearch(e.target.value)} maxLength={32} placeholder="Search username..." className="w-full rounded-lg border border-[#574064] bg-[#130f1e] px-4 py-3 text-white placeholder:text-[#887b92] focus:outline-none focus:ring-2 focus:ring-[#b88b4d]" />
          </div>
        </section>

        <div aria-label="Skill rankings" className="mb-5 flex flex-wrap gap-2">
          {skills.map(item => <button key={item} type="button" onClick={() => setSkill(item)} aria-pressed={skill === item} className={`rounded-lg border px-3 py-2 text-xs font-bold transition sm:text-sm ${skill === item ? "border-[#e0b65a] bg-[#e0b65a] text-[#21152b]" : "border-[#48304f] bg-[#23192e] text-[#d1bdd9] hover:border-[#bd945c] hover:text-white"}`}><span aria-hidden="true" className="mr-1.5">{skillIcons[item]}</span>{item}</button>)}
        </div>

        <section className="overflow-hidden rounded-xl border border-[#49324f] bg-[#21192d]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#46304d] bg-gradient-to-r from-[#382642] to-[#251a32] px-5 py-5">
            <div>
              <h2 className="text-xl font-black uppercase tracking-wider text-[#e5b85b]"><span aria-hidden="true" className="mr-2">{skillIcons[skill]}</span>{skill} Rankings</h2>
              <p className="mt-1 text-xs text-[#b4a3be]">{loading ? "Updating rankings..." : `${format(players.length)} players shown`}</p>
            </div>
            <span className="rounded-full border border-[#725a47] bg-[#352b32] px-3 py-1 text-xs font-semibold text-[#e6c891]">Vyre Leaderboard</span>
          </div>
          {error && <p role="alert" className="border-b border-red-900/40 px-5 py-4 text-sm text-red-300">{error}</p>}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[580px] text-left">
              <thead className="bg-[#2b2037] text-[11px] font-bold uppercase tracking-widest text-[#b8a4c3]">
                <tr><th className="w-20 px-4 py-4">Rank</th><th className="px-4 py-4">Player</th><th className="w-28 px-4 py-4 text-right">Level</th><th className="w-[40%] px-4 py-4 text-right">Experience</th></tr>
              </thead>
              <tbody>
                {!loading && players.map(player => {
                  const xp = skill === "Overall" ? player.totalXp : player.skillXp;
                  const top = player.rank <= 3;
                  const medal = player.rank === 1 ? "bg-gradient-to-br from-[#ffe38d] to-[#e4a92c] text-[#382308]" : player.rank === 2 ? "bg-gradient-to-br from-white to-[#b9bdcc] text-[#282c39]" : player.rank === 3 ? "bg-gradient-to-br from-[#f6b276] to-[#bb6e3c] text-[#381c12]" : "border border-[#483654] bg-[#1a1425] text-[#b3a2be]";
                  return (
                    <tr key={player.username} className={`border-t border-[#44314e] transition hover:bg-[#3a2b46] ${top ? "bg-[#30233a]" : "bg-[#271d33]"}`}>
                      <td className="px-4 py-3"><span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black shadow-sm ${medal}`}>{player.rank}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 font-bold text-[#f5edf9]"><span aria-hidden="true" title={player.mode} className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-[#6c4c64] bg-[#3b2946] text-[#e7bd68]">{modeIcons[player.mode] || "◆"}</span>{player.username}</div>
                        <div className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-[#e4c36f]"><span className="h-2 w-2 rounded-full bg-[#e6b74b]" />{player.mode}</div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-extrabold">{format(player.totalLevel)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="text-sm font-bold tabular-nums">{format(xp)}</div>
                        <div className="mt-3 h-[3px] overflow-hidden rounded-full bg-[#463750]"><div className="h-full rounded-full bg-gradient-to-r from-[#9b6b52] to-[#e5b953]" style={{ width: `${Math.max(0, Math.min(100, xp / maxXp * 100))}%` }} /></div>
                      </td>
                    </tr>
                  );
                })}
                {loading && <tr><td colSpan={4} className="px-5 py-14 text-center text-[#c7b5d0]">Loading Vyre rankings...</td></tr>}
                {!loading && players.length === 0 && <tr><td colSpan={4} className="px-5 py-14 text-center text-[#c7b5d0]">{error ? "Please try again shortly." : "No players found."}</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
        <p className="mt-5 text-center text-xs text-[#9c89a8]">Rankings update automatically as players save their progress · Vyre RSPS</p>
      </div>
    </main>
  );
}
