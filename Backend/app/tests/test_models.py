#!/usr/bin/env python3
"""
Test script to demonstrate the difference between Gemini models and image generation
"""

import os
from dotenv import load_dotenv
import google.generativeai as genai
from PIL import Image
from io import BytesIO

load_dotenv()

def test_gemini_capabilities():
    """Test what Gemini can and cannot do"""
    
    print("🔍 Testing Gemini Model Capabilities")
    print("=" * 50)
    
    # Configure Gemini
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    
    # Test different models
    models_to_test = [
        'gemini-2.5-flash',
        'gemini-2.0-flash', 
        'gemini-pro-vision',
        'gemini-pro'
    ]
    
    for model_name in models_to_test:
        try:
            model = genai.GenerativeModel(model_name)
            print(f"\n✅ {model_name} - Available")
            
            # Test text generation
            try:
                response = model.generate_content("Hello, can you see images?")
                print(f"   📝 Text generation: ✅ Works")
                print(f"   Response: {response.text[:100]}...")
            except Exception as e:
                print(f"   📝 Text generation: ❌ Failed - {e}")
            
            # Test image analysis (if supported)
            try:
                # Create a simple test image
                test_img = Image.new('RGB', (100, 100), color='red')
                response = model.generate_content(["Describe this image", test_img])
                print(f"   👁️ Image analysis: ✅ Works")
                print(f"   Analysis: {response.text[:100]}...")
            except Exception as e:
                print(f"   👁️ Image analysis: ❌ Failed - {e}")
                
        except Exception as e:
            print(f"\n❌ {model_name} - Not available: {e}")
    
    print("\n" + "=" * 50)
    print("📋 SUMMARY:")
    print("• Gemini models can ANALYZE images and provide text descriptions")
    print("• Gemini models CANNOT generate or edit images")
    print("• For actual image editing, you need:")
    print("  - OpenAI DALL-E (image generation/editing)")
    print("  - Stability AI (image generation)")
    print("  - Or programmatic editing with PIL/OpenCV")
    print("\n🔧 Current setup: Gemini analyzes → Python PIL edits")

if __name__ == "__main__":
    test_gemini_capabilities()