from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import parcels, payments, tracking, users
from app.database import engine
from app import models
from datetime import datetime

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Consignment Tracking API",
    description="API for parcel tracking and border payments",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(parcels.router, prefix="/api/parcels", tags=["parcels"])
app.include_router(payments.router, prefix="/api/payments", tags=["payments"])
app.include_router(tracking.router, prefix="/api/track", tags=["tracking"])
app.include_router(users.router, prefix="/api/auth", tags=["auth"])


@app.get("/")
async def root():
    return {"message": "Consignment Tracking API", "status": "running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
