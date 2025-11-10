# app/main.py
"""PaintWeaver AI Backend - Main application entry point"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from routers import health_router, image_router


# Initialize FastAPI app
app = FastAPI(
    title="PaintWeaver AI Image Edit API",
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


# Run server directly
if __name__ == "__main__":
    import uvicorn
    
    print("🎨 PaintWeaver Backend Server Starting...")
    print(f"📡 Server: http://{settings.HOST}:{settings.PORT}")
    print(f"📚 API Docs: http://{settings.HOST}:{settings.PORT}/docs")
    print(f"🧪 Test Gemini: http://{settings.HOST}:{settings.PORT}/test-gemini")
    
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.RELOAD
    )
