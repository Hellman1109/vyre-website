import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type HighscoreRow = {
  username: string;
  gamemode: string;
  combat: number;
  totalLevel: number;
  totalXp: number;
};

function getPoolConfig() {
  const host = process.env.HIGHSCORES_DB_HOST;
  const user = process.env.HIGHSCORES_DB_USER;
  const password = process.env.HIGHSCORES_DB_PASSWORD;
  const database = process.env.HIGHSCORES_DB_NAME || "rsps";
  if (!host || !user || !password) return null;
  return {
    host,
    port: Number(process.env.HIGHSCORES_DB_PORT || 3306),
    user,
    password,
    database,
    connectTimeout: 5000,
    waitForConnections: true,
    connectionLimit: 2,
    enableKeepAlive: true,
    ssl: process.env.HIGHSCORES_DB_SSL === "true" ? { rejectUnauthorized: true } : undefined,
  };
}

export async function GET(request: Request) {
  const config = getPoolConfig();
  if (!config) {
    return NextResponse.json({ error: "Highscores database is not configured yet.", players: [] }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const gamemode = (searchParams.get("mode") || "All").slice(0, 40);
  const name = (searchParams.get("search") || "").trim().slice(0, 32);
  const sort = searchParams.get("sort") || "overall";
  const sortColumns: Record<string, string> = {
    overall: "overall_exp",
    attack: "attack_exp",
    defence: "defence_exp",
    strength: "strength_exp",
    hitpoints: "hitpoints_exp",
    ranged: "ranged_exp",
    mining: "mining_exp",
    agility: "agility_exp",
    herblore: "herblore_exp",
    thieving: "thieving_exp",
    slayer: "slayer_exp",
    farming: "farming_exp",
    runecrafting: "runecrafting_exp",
    hunter: "hunter_exp",
    construction: "construction_exp",
  };
  const column = sortColumns[sort] || "overall_exp";
  const modeFilter = gamemode !== "All" ? "AND gamemode = ?" : "";
  const nameFilter = name ? "AND username LIKE ?" : "";
  const params: Array<string> = [];
  if (gamemode !== "All") params.push(gamemode);
  if (name) params.push("%" + name.replace(/[\\%_]/g, "\\$&") + "%");

  const db = mysql.createPool(config);
  try {
    const [rows] = await db.execute<mysql.RowDataPacket[]>(
      `SELECT username, gamemode, combat_level AS combat, overall_level AS totalLevel,
              overall_exp AS totalXp, ${column} AS skillXp
       FROM highscores WHERE 1=1 ${modeFilter} ${nameFilter}
       ORDER BY ${column} DESC, overall_exp DESC, username ASC LIMIT 100`,
      params
    );
    const players = rows.map((row, index) => ({
      rank: index + 1,
      username: String(row.username),
      mode: String(row.gamemode),
      combat: Number(row.combat),
      totalLevel: Number(row.totalLevel),
      totalXp: Number(row.totalXp),
      skillXp: Number(row.skillXp),
    }));
    return NextResponse.json({ players, sort }, { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } });
  } catch {
    // Never return SQL errors or credentials to the browser.
    return NextResponse.json({ error: "Highscores are temporarily unavailable.", players: [] }, { status: 503 });
  } finally {
    await db.end();
  }
}
