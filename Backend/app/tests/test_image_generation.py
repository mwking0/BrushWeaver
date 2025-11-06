#!/usr/bin/env python3
"""
Test Google's image generation capabilities
"""

import os
from dotenv import load_dotenv
import google.generativeai as genai
from PIL import Image
from io import BytesIO
import base64

load_dotenv()

def test_image_generation_models():
    """Test which models can actually generate images"""
    
    print("🧪 Testing Image Generation Models")
    print("=" * 50)
    
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    
    # Models that might generate images
    generation_models = [
        'gemini-2.0-flash-exp-image-generation',
        'gemini-2.5-flash-image-preview', 
        'gemini-2.5-flash-image',
        'imagen-4.0-fast-generate-001',
        'imagen-4.0-generate-001',
        'imagen-3.0-generate-002'
    ]
    
    # Create a simple test image
    test_img = Image.new('RGB', (100, 100), color='blue')
    
    for model_name in generation_models:
        print(f"\n🔬 Testing: {model_name}")
        try:
            model = genai.GenerativeModel(model_name)
            
            # Test 1: Simple text-to-image
            try:
                response = model.generate_content("Generate a red circle")
                
                # Check if response has image data
                if hasattr(response, 'parts') and response.parts:
                    for part in response.parts:
                        if hasattr(part, 'inline_data'):
                            print(f"   ✅ Text-to-image: SUCCESS - Generated image data")
                            return True
                        elif hasattr(part, 'text'):
                            print(f"   📝 Text-to-image: Text response only")
                else:
                    print(f"   ❌ Text-to-image: No image generated")
                    
            except Exception as e:
                print(f"   ❌ Text-to-image failed: {e}")
            
            # Test 2: Image-to-image editing
            try:
                response = model.generate_content([
                    "Transform this blue square into a red circle", 
                    test_img
                ])
                
                # Check for image output
                if hasattr(response, 'parts') and response.parts:
                    for part in response.parts:
                        if hasattr(part, 'inline_data'):
                            print(f"   ✅ Image-to-image: SUCCESS - Generated edited image")
                            return True
                        elif hasattr(part, 'text'):
                            print(f"   📝 Image-to-image: Text response only")
                else:
                    print(f"   ❌ Image-to-image: No image generated")
                    
            except Exception as e:
                print(f"   ❌ Image-to-image failed: {e}")
                
        except Exception as e:
            print(f"   ❌ Model not available: {e}")
    
    print(f"\n❌ No models found that can generate images")
    return False

def test_analysis_vs_generation():
    """Compare analysis vs generation capabilities"""
    
    print("\n" + "=" * 50)
    print("🔍 Analysis vs Generation Test")
    print("=" * 50)
    
    # Test image
    test_img = Image.new('RGB', (100, 100), color='green')
    
    # Analysis models
    analysis_models = ['gemini-2.5-flash', 'gemini-2.5-pro']
    
    for model_name in analysis_models:
        try:
            print(f"\n📊 Testing analysis: {model_name}")
            model = genai.GenerativeModel(model_name)
            
            response = model.generate_content([
                "Describe this image and suggest how to make it red instead of green",
                test_img
            ])
            
            print(f"   ✅ Analysis response: {response.text[:100]}...")
            
        except Exception as e:
            print(f"   ❌ Analysis failed: {e}")

if __name__ == "__main__":
    can_generate = test_image_generation_models()
    test_analysis_vs_generation()
    
    print("\n" + "=" * 50)
    print("📋 CONCLUSION:")
    if can_generate:
        print("✅ Found models that can generate images!")
    else:
        print("❌ No image generation models available")
        print("💡 Current setup: Gemini analyzes → Python PIL edits")
        print("🔧 This is actually working as intended!")