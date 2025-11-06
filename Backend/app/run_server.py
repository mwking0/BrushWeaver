#!/usr/bin/env python3
"""
Simple script to run the PaintWeaver backend server
"""
import uvicorn

if __name__ == "__main__":
    print("🎨 Starting PaintWeaver Backend Server...")
    print("📡 Server will be available at: http://localhost:8000")
    print("📚 API docs available at: http://localhost:8000/docs")
    print("🧪 Test Gemini at: http://localhost:8000/test-gemini")
    print("❤️ Health check at: http://localhost:8000/healthz")
    print("\n🚀 Starting server...")
    
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )