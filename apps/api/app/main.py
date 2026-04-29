from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.quiz_sessions import router as quiz_sessions_router
from app.api.quizzes import router as quizzes_router
from app.api.settings import router as settings_router
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.parsed_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check() -> dict[str, str]:
    return {
        "status": "ok",
        "environment": settings.app_env,
    }


app.include_router(auth_router, prefix="/api")
app.include_router(settings_router, prefix="/api")
app.include_router(quizzes_router, prefix="/api")
app.include_router(quiz_sessions_router, prefix="/api")