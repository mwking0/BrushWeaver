# app/main.py
"""BrushWeaver AI Backend - Main application entry point"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from routers import health_router, image_router, auth_router
from database import create_tables


# Initialize FastAPI app
app = FastAPI(
    title="BrushWeaver AI Image Edit API",
    description="AI-powered image editing with Google Gemini",
    version="2.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-AI-Analysis"]
)

# Include routers
app.include_router(health_router.router)
app.include_router(image_router.router)
app.include_router(auth_router.router)


@app.on_event("startup")
async def startup_event():
    """Application startup"""
    print("🚀 BrushWeaver AI Backend starting up...")
    print(f"📊 Max file size: {settings.MAX_FILE_SIZE / 1024 / 1024:.1f} MB")
    print(f"🖼️ Max image dimension: {settings.MAX_IMAGE_DIMENSION}px")
    
    # Initialize database
    create_tables()
    print("🗄️ Database tables created/verified")
    
    print("✅ Backend ready!")
app.include_router(auth_router.router)


# Run server directly
if __name__ == "__main__":
    import uvicorn
    
    print("🎨 BrushWeaver Backend Server Starting...")
    print(f"📡 Server: http://{settings.HOST}:{settings.PORT}")
    print(f"📚 API Docs: http://{settings.HOST}:{settings.PORT}/docs")
    print(f"🧪 Test Gemini: http://{settings.HOST}:{settings.PORT}/test-gemini")
    
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.RELOAD
    )
