# backend/app/main.py
import time
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.limiter import limiter
from app.api.v1 import analyze, history, dashboard
from app.auth.router import router as auth_router
from app.db.session import engine
from app.db.base import Base

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("sentinel")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Sentinel starting up...")
    
    # # Initialize heavy ML models in background to avoid blocking the first request
    # from app.explainability.engine import ExplainabilityEngine
    # import threading
    # 
    # def init_detectors():
    #     try:
    #         logger.info("Pre-loading detectors and indexing datasets...")
    #         engine = ExplainabilityEngine()
    #         # This will trigger LFW download and indexing if missing
    #         if "image_impersonation" in engine._detectors:
    #             engine._detectors["image_impersonation"].warmup()
    #         logger.info("All detectors initialized successfully.")
    #     except Exception as e:
    #         logger.error(f"Detector initialization failed: {e}")
    # 
    # # Run in a separate thread so startup doesn't hang for 2 hours
    # threading.Thread(target=init_detectors, daemon=True).start()
    
    logger.info("Database tables verified via Alembic.")
    yield
    logger.info("Sentinel shutting down.")


app = FastAPI(
    title="Sentinel — Fraud Detection Engine",
    description="Multi-signal fraud, scam, phishing, and disinformation detection API.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    response.headers["X-Process-Time"] = f"{time.perf_counter() - start:.4f}s"
    return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url}: {exc}", exc_info=True)
    return JSONResponse(status_code=500, content={"detail": "Internal server error."})


app.include_router(auth_router,       prefix="/auth",    tags=["Auth"])
app.include_router(analyze.router,    prefix="/api/v1",  tags=["Analyze"])
app.include_router(history.router,    prefix="/api/v1",  tags=["History"])
app.include_router(dashboard.router,  prefix="/api/v1",  tags=["Dashboard"])


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "version": "1.0.0"}
