import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const skillNames = new Set([
  "attack", "defence", "strength", "hitpoints", "ranged", "prayer",
  "magic", "cooking", "woodcutting", "fletching", "fishing", "firemaking",
  "crafting", "smithing", "mining", "herblore", "agility", "thieving",
  "slayer", "farming", "runecrafting", "hunter", "construction"
]);

type Highscore = {
  username: string;
  gamemode: string;
  combat_level: number;
  overall_level: number;
  overall_exp: number;
  skill_xp: Record<string, number> | null;
};

export async function GET(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: "Highscores are not configured yet.", players: [] }, { status: 503 });
  }

  const params = new URL(request.url).searchParams;
  const mode = (params.get("mode") || "All").slice(0, 40);
  const search = (params.get("search") || "").trim().slice(0, 32);
  const requestedSort = (params.get("sort") || "overall").toLowerCase();
  const sort = skillNames.has(requestedSort) ? requestedSort : "overall";

  try {
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    let query = supabase.from("vyre_highscores")
      .select("username,gamemode,combat_level,overall_level,overall_exp,skill_xp");
    if (mode !== "All") query = query.eq("gamemode", mode);
    if (search) query = query.ilike("username", `%${search.replace(/[%_,]/g, "")}%`);

    // Skill rankings are sorted in memory because skill XP is stored as JSONB.
    // Fetch up to 10k records to avoid sorting only a pre-ranked subset.
    const { data, error } = await query.limit(10000);
    if (error) throw error;
    const rows = (data || []) as Highscore[];
    const xpFor = (p: Highscore) => sort === "overall"
      ? Number(p.overall_exp || 0)
      : Number(p.skill_xp?.[sort] || 0);
    rows.sort((a, b) => xpFor(b) - xpFor(a)
      || Number(b.overall_exp || 0) - Number(a.overall_exp || 0)
      || a.username.localeCompare(b.username));
    const players = rows.slice(0, 100).map((p, i) => ({
      rank: i + 1,
      username: p.username,
      mode: p.gamemode,
      combat: Number(p.combat_level),
      totalLevel: Number(p.overall_level),
      totalXp: Number(p.overall_exp),
      skillXp: xpFor(p)
    }));
    return NextResponse.json({ players, sort }, {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" }
    });
  } catch {
    return NextResponse.json({ error: "Highscores are temporarily unavailable.", players: [] }, { status: 503 });
  }
}
