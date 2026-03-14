# FinSight

Upload your Kotak bank statement PDF and chat with your finances.

## Stack

- **Frontend** — React + Vite → deployed on Vercel
- **Backend** — FastAPI + Python → deployed on Railway
- **AI** — LangChain + Groq (Llama 3.3 70B)
- **Auth** — Supabase
- **PDF** — pikepdf (unlock) + pdfplumber (parse)

## Project Structure

```
FinSight/
├── backend/
│   ├── main.py
│   ├── routers/        # auth, statements, chat
│   ├── services/       # pdf_parser, ai_chat, categorizer, llm_provider
│   ├── models/         # database, schemas
│   ├── pyproject.toml
│   └── .env            # never commit this
└── frontend/
    ├── src/
    │   ├── pages/
    │   └── components/
    └── package.json
```

## Local Setup

### Backend

```bash
cd backend
uv sync
cp .env.example .env    # fill in your keys
uv run uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev             # runs on http://localhost:5173
```

## Environment Variables

```bash
# backend/.env
LLM_PROVIDER=groq
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile
FRONTEND_URL=http://localhost:5173
```

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/` | Health check |
| POST | `/api/statements/upload` | Upload + parse PDF |
| POST | `/api/chat` | Chat with transactions |

## Free vs Paid

| Feature | Free | Paid (₹299/mo) |
|---------|------|----------------|
| Upload statement | 1 | Unlimited |
| Basic charts | ✅ | ✅ |
| AI chat | ❌ | ✅ |
| Multi-month compare | ❌ | ✅ |
| Export CSV | ❌ | ✅ |

## Deploy

- Frontend → push to GitHub → connect on [vercel.com](https://vercel.com)
- Backend → push to GitHub → connect on [railway.app](https://railway.app)

---

*V1 is stateless — transactions are not stored in a DB. Persistence comes in V2.*