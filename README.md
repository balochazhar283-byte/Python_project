# Snake Arena

Browser Snake game with a global leaderboard. Three containers:

| Service  | Tech                  | Port | Role                              |
|----------|-----------------------|------|-----------------------------------|
| frontend | Flask + canvas JS     | 3000 | Serves and runs the game          |
| backend  | FastAPI               | 8000 | `GET/POST /api/scores`            |
| db       | PostgreSQL 16         | -    | Stores scores (internal network)  |

## Run
```bash
cp .env.example .env   # optional; set a non-default password if you use it
docker compose up --build
```

The project can also be started directly with `docker compose up --build`.
For anything beyond local development, create `.env` from `.env.example` and
replace `POSTGRES_PASSWORD` with a strong password before starting the stack.
If you change any `POSTGRES_*` value after the database has already been
initialized, reset the local volume with `docker compose down -v` first.
Play at http://localhost:3000. API docs: http://localhost:8000/docs.
Reset scores: `docker compose down -v`.
