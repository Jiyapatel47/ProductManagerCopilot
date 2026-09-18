from fastapi import FastAPI

from backend.app.routes.auth import router as auth_router
from backend.app.database.mongodb import test_mongodb_connection
from backend.app.routes.workspace import router as workspace_router
from fastapi.middleware.cors import CORSMiddleware
from backend.app.routes.ingestion import router as ingestion_router
from backend.app.routes.insights import router as insights_router
from backend.app.routes.features import router as features_router

app = FastAPI(
    title="AI Product Assistant",
    description="AI-Driven Product Manager Copilot",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(workspace_router)
app.include_router(ingestion_router)
app.include_router(insights_router)
app.include_router(features_router)

@app.get("/")
def root():
    return {
        "message": "AI Product Assistant API is running",
        "status": "success",
    }


@app.get("/health")
def health_check():
    mongodb_status = test_mongodb_connection()

    return {
        "status": "healthy",
        "mongodb": "connected" if mongodb_status else "disconnected",
    }