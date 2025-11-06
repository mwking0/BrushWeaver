#!/usr/bin/env python3
"""
Test if Gemini 2.5 models can generate images
"""

import os
from dotenv import load_dotenv
import google.generativeai as genai
from PIL import Image
from io import BytesIO
import base64

load_dotenv()

def test_gemini_25_image_generation():
    """Test all Gemini 2.5 models for image generation capability"""
    
    print("🔍 Testing Gemini 2.5 Models for Image Generation")
    print("=" * 60)
    
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    
    # All Gemini 2.5 models
    gemini_25_models = [
        'gemini-2.5-flash',
        'gemini-2.5-pro',
        'gemini-2.5-flash-preview-05-20',
        'gemini-2.5-flash-lite',
        'gemini-2.5-pro-preview-03-25',
        'gemini-2.5-pro-preview-05-06',
        'gemini-2.5-pro-preview-06-05',
        'gemini-2.5-flash-image-preview',
        'gemini-2.5-flash-image'
    ]
    
    # Create test image
    test_img = Image.new('RGB', (100, 100), color='red')
    
    for model_name in gemini_25_models:
        print(f"\n🔬 Testing: {model_name}")
        try:
            model = genai.GenerativeModel(model_name)
            
            # Test 1: Text-to-image generation
            try:
                print("   📝 Testing text-to-image...")
                response = model.generate_content("Generate a blue circle")
                
                # Check for image in response
                if hasattr(response, 'candidates') and response.candidates:
                    for candidate in response.candidates:
                        if hasattr(candidate, 'content') and candidate.content.parts:
                            for part in candidate.content.parts:
                                if hasattr(part, 'inline_data') and part.inline_data:
                                    print("   ✅ CAN GENERATE IMAGES!")
                                    return model_name
                
                print("   📄 Text response only")
                
            except Exception as e:
                print(f"   ❌ Text-to-image failed: {e}")
            
            # Test 2: Image-to-image editing
            try:
                print("   🖼️ Testing image-to-image editing...")
                response = model.generate_content([
                    "Transform this red square into a blue heart", 
                    test_img
                ])
                
                # Check for image in response
                if hasattr(response, 'candidates') and response.candidates:
                    for candidate in response.candidates:
                        if hasattr(candidate, 'content') and candidate.content.parts:
                            for part in candidate.content.parts:
                                if hasattr(part, 'inline_data') and part.inline_data:
                                    print("   ✅ CAN EDIT IMAGES!")
                                    return model_name
                
                print("   📄 Analysis response only")
                
            except Exception as e:
                print(f"   ❌ Image-to-image failed: {e}")
                
        except Exception as e:
            print(f"   ❌ Model not available: {e}")
    
    print(f"\n❌ NO GEMINI 2.5 MODELS CAN GENERATE IMAGES")
    return None

def test_what_gemini_25_can_do():
    """Show what Gemini 2.5 actually does"""
    
    print("\n" + "=" * 60)
    print("📋 What Gemini 2.5 Actually Does")
    print("=" * 60)
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        test_img = Image.new('RGB', (100, 100), color='green')
        
        response = model.generate_content([
            "I want to turn this into a red heart. Please help me edit this image.",
            test_img
        ])
        
        print("🤖 Gemini 2.5 Response:")
        print("-" * 40)
        print(response.text[:500] + "..." if len(response.text) > 500 else response.text)
        print("-" * 40)
        print("\n💡 As you can see, Gemini 2.5 provides TEXT INSTRUCTIONS, not actual edited images.")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")

if __name__ == "__main__":
    can_generate = test_gemini_25_image_generation()
    
    if can_generate:
        print(f"\n🎉 FOUND: {can_generate} can generate images!")
    else:
        print(f"\n⚠️ LIMITATION: Gemini 2.5 models can only ANALYZE images, not GENERATE them")
        test_what_gemini_25_can_do()
        
        print(f"\n🔧 SOLUTION OPTIONS:")
        print(f"1. Keep current system: Gemini 2.5 analyzes → Python PIL edits")
        print(f"2. Use Gemini 2.0 experimental for generation")
        print(f"3. Use Imagen models for generation")
        print(f"4. Accept text-only responses from Gemini 2.5")