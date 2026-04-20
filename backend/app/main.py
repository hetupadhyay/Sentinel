# backend/app/main.py
import time
import uuid
import logging
import sys
from contextlib import asynccontextmanager
from pythonjsonlogger import jsonlogger

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.limiter import limiter
from app.api.v1 import analyze, history, dashboard, profile
from app.auth.router import router as auth_router
from app.db.session import engine
from app.db.base import Base

logHandler = logging.StreamHandler(sys.stdout)
formatter = jsonlogger.JsonFormatter('%(asctime)s %(levelname)s %(name)s %(message)s')
logHandler.setFormatter(formatter)
logging.basicConfig(level=logging.INFO, handlers=[logHandler])
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
    request_id = str(uuid.uuid4())[:8]
    start = time.perf_counter()
    request.state.request_id = request_id
    response = await call_next(request)
    elapsed = time.perf_counter() - start
    response.headers["X-Process-Time"] = f"{elapsed:.4f}s"
    response.headers["X-Request-ID"] = request_id
    if elapsed > 2.0:
        logger.warning(f"Slow request [{request_id}] {request.method} {request.url.path} took {elapsed:.2f}s")
    return response


from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    req_id = getattr(request.state, "request_id", "unknown")
    logger.error("Validation error", extra={"request_id": req_id, "errors": exc.errors()})
    return JSONResponse(
        status_code=422,
        content={"error": {"code": "VALIDATION_ERROR", "message": "Invalid request payload.", "details": exc.errors(), "request_id": req_id}}
    )

@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    req_id = getattr(request.state, "request_id", "unknown")
    logger.error("Database error", extra={"request_id": req_id, "error": str(exc)})
    return JSONResponse(
        status_code=500,
        content={"error": {"code": "DATABASE_ERROR", "message": "Internal database error.", "request_id": req_id}}
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    req_id = getattr(request.state, "request_id", "unknown")
    logger.error("Unhandled exception", extra={"request_id": req_id, "error": str(exc)}, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": {"code": "INTERNAL_SERVER_ERROR", "message": "An unexpected error occurred.", "request_id": req_id}}
    )


app.include_router(auth_router,       prefix="/auth",    tags=["Auth"])
app.include_router(analyze.router,    prefix="/api/v1",  tags=["Analyze"])
app.include_router(history.router,    prefix="/api/v1",  tags=["History"])
app.include_router(dashboard.router,  prefix="/api/v1",  tags=["Dashboard"])
app.include_router(profile.router,    prefix="/api/v1",  tags=["Profile"])


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "version": "1.0.0"}
