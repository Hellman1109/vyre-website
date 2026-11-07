// Run this private sync worker on the machine that can access MySQL.
// npm install mysql2 dotenv
// Never deploy this worker to the browser or expose its credentials.
require("dotenv").config();
const mysql = require("mysql2/promise");

const required = ["MYSQL_HOST", "MYSQL_PORT", "MYSQL_USER", "MYSQL_PASSWORD",
  "MYSQL_DATABASE", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
for (const name of required) if (!process.env[name]) throw new Error("Missing " + name);

const baseUrl = process.env.SUPABASE_URL.replace(/\/$/, "");
const apiKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const intervalMinutes = Math.max(1, Number(process.env.SYNC_INTERVAL_MINUTES || 5));
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  connectionLimit: 1
});

let syncing = false;
async function sync() {
  if (syncing) return;
  syncing = true;
  try {
    const [rows] = await pool.query("SELECT * FROM highscores");
    const payload = rows.map((row) => {
      const skill_xp = {};
      for (const [key, value] of Object.entries(row)) {
        if (key.endsWith("_exp") && key !== "overall_exp" && value != null) {
          skill_xp[key.slice(0, -4)] = Number(value);
        }
      }
      return {
        username: String(row.username).toLowerCase(),
        gamemode: String(row.gamemode || "Normal"),
        combat_level: Number(row.combat_level || 3),
        overall_level: Number(row.overall_level || 32),
        overall_exp: Number(row.overall_exp || 0),
        skill_xp,
        updated_at: new Date().toISOString()
      };
    });
    for (let i = 0; i < payload.length; i += 250) {
      const response = await fetch(baseUrl + "/rest/v1/vyre_highscores?on_conflict=username", {
        method: "POST",
        headers: {
          apikey: apiKey,
          Authorization: "Bearer " + apiKey,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=minimal"
        },
        body: JSON.stringify(payload.slice(i, i + 250))
      });
      if (!response.ok) throw new Error("Supabase sync failed (" + response.status + "): " + (await response.text()).slice(0, 300));
    }
    console.log(new Date().toISOString(), "Synced", payload.length, "Vyre highscores");
  } catch (error) {
    console.error(new Date().toISOString(), error.message);
  } finally {
    syncing = false;
  }
}
sync();
setInterval(sync, intervalMinutes * 60 * 1000);
