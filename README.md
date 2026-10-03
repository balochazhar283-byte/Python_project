# Snake Arena

Browser Snake game with a global leaderboard. Three containers:

| Service  | Tech                  | Port | Role                              |
|----------|-----------------------|------|-----------------------------------|
| frontend | Flask + canvas JS     | 3000 | Serves and runs the game          |
| backend  | FastAPI               | 8000 | `GET/POST /api/scores`            |
| db       | PostgreSQL 16         | -    | Stores scores (internal network)  |

## Run
```bash
cp .env.example .env   # set a real password
docker compose up --build
```
Play at http://localhost:3000. API docs: http://localhost:8000/docs.
Reset scores: `docker compose down -v`.
