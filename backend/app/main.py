import os
import time

import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="Snake Arena API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_conn(retries: int = 10):
    """Connect to Postgres, retrying while the db container warms up."""
    for attempt in range(retries):
        try:
            return psycopg2.connect(
                host=os.getenv("DB_HOST", "db"),
                dbname=os.getenv("POSTGRES_DB", "arena"),
                user=os.getenv("POSTGRES_USER", "arena"),
                password=os.getenv("POSTGRES_PASSWORD", "arena"),
                cursor_factory=RealDictCursor,
            )
        except psycopg2.OperationalError:
            if attempt == retries - 1:
                raise
            time.sleep(2)


def query(sql, params=(), fetch="all"):
    conn = get_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(sql, params)
            return cur.fetchall() if fetch == "all" else cur.fetchone()
    finally:
        conn.close()


class ScoreIn(BaseModel):
    player: str = Field(min_length=1, max_length=20)
    score: int = Field(ge=0, le=100_000)


@app.get("/health")
def health():
    query("SELECT 1", fetch="one")
    return {"status": "ok"}


@app.get("/api/scores")
def top_scores(limit: int = 10):
    return query(
        "SELECT id, player, score, created_at FROM scores "
        "ORDER BY score DESC, created_at ASC LIMIT %s",
        (max(1, min(limit, 50)),),
    )


@app.post("/api/scores", status_code=201)
def add_score(body: ScoreIn):
    row = query(
        "INSERT INTO scores (player, score) VALUES (%s, %s) "
        "RETURNING id, player, score",
        (body.player.strip(), body.score), fetch="one",
    )
    rank = query(
        "SELECT COUNT(*) + 1 AS rank FROM scores WHERE score > %s",
        (body.score,), fetch="one",
    )["rank"]
    return {**row, "rank": rank}
