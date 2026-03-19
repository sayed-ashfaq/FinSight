import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import statements
from dotenv import load_dotenv
from models.database import engine, Base
from utils.logger import log

load_dotenv()

# Pre-populate SQLite tables if they do not exist
try:
    log.info("Booting FinSight API & initializing database schemas...")
    Base.metadata.create_all(bind=engine)
    log.info("Database schemas confirmed.")
except Exception as e:
    log.error(f"Failed to generate DB Schema: {str(e)}")

app = FastAPI(title="FinSight API")

# Update CORS for frontend
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(statements.router, prefix="/api/statements", tags=["Statements"])

@app.get("/")
def health_check():
    return {"status": "ok", "message": "FinSight API is running"}
