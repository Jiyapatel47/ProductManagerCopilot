from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.auth import router as auth_router
from app.database.mongodb import test_mongodb_connection
from app.routes.workspace import router as workspace_router
from app.routes.ingestion import router as ingestion_router
from app.routes.insights import router as insights_router
from app.routes.features import router as features_router
from app.routes.prioritization import router as prioritization_router
from app.routes.prd import router as prd_router
from app.routes.assistant import router as assistant_router
from app.routes.roadmap import router as roadmap_router
from app.routes.reports import router as reports_router
from app.routes.strategy import router as strategy_router
from app.routes.analysis import router as analysis_router
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
app.include_router(prioritization_router)
app.include_router(prd_router)
app.include_router(assistant_router)
app.include_router(roadmap_router)
app.include_router(
    reports_router
)
app.include_router(strategy_router)
app.include_router(analysis_router)
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