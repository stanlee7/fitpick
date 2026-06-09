// FitPick 제안서 열람 추적 API (Railway + Postgres)
// - POST /api/opens   { pid, client, title }  → 열람 1건 기록
// - GET  /api/opens?pids=a,b,c                 → pid별 열람수/마지막열람 집계
// 프론트(Vercel 정적앱)에서 CORS로 호출. 인증 없음(공개 집계만).

import express from "express";
import cors from "cors";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Railway 내부 연결은 SSL 불필요할 수 있음. 문제가 있으면 PGSSL=disable 로 끔.
  ssl: process.env.PGSSL === "disable" ? false : { rejectUnauthorized: false },
});

const app = express();
app.use(cors()); // 모든 오리진 허용(자격증명 없는 단순 집계 API)
app.use(express.json());

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS proposal_opens (
      id BIGSERIAL PRIMARY KEY,
      pid TEXT NOT NULL,
      client TEXT,
      title TEXT,
      user_agent TEXT,
      opened_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_proposal_opens_pid ON proposal_opens (pid);
  `);
}

app.get("/", (_req, res) => res.json({ ok: true, service: "fitpick-tracking" }));

// 열람 기록
app.post("/api/opens", async (req, res) => {
  try {
    const { pid, client, title } = req.body || {};
    if (!pid || typeof pid !== "string") {
      return res.status(400).json({ error: "pid required" });
    }
    const ua = (req.headers["user-agent"] || "").toString().slice(0, 300) || null;
    await pool.query(
      "INSERT INTO proposal_opens (pid, client, title, user_agent) VALUES ($1, $2, $3, $4)",
      [pid.slice(0, 64), (client || "").slice(0, 200), (title || "").slice(0, 200), ua]
    );
    res.json({ ok: true });
  } catch (e) {
    console.error("insert failed", e);
    res.status(500).json({ error: "insert failed" });
  }
});

// pid 목록별 집계
app.get("/api/opens", async (req, res) => {
  try {
    const pids = (req.query.pids || "")
      .toString()
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 200);
    if (pids.length === 0) return res.json([]);
    const result = await pool.query(
      `SELECT pid, COUNT(*)::int AS count, MAX(opened_at) AS last_opened_at
       FROM proposal_opens
       WHERE pid = ANY($1)
       GROUP BY pid`,
      [pids]
    );
    res.json(
      result.rows.map((r) => ({
        pid: r.pid,
        count: r.count,
        lastOpenedAt: r.last_opened_at,
      }))
    );
  } catch (e) {
    console.error("query failed", e);
    res.status(500).json({ error: "query failed" });
  }
});

const port = process.env.PORT || 3001;
init()
  .then(() => app.listen(port, () => console.log(`fitpick-tracking on :${port}`)))
  .catch((e) => {
    console.error("init failed", e);
    process.exit(1);
  });
