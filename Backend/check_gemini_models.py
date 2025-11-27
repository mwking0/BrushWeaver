#!/usr/bin/env python3
"""
Check available Gemini models and their capabilities
"""
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv("app/.env")

# Configure API
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("❌ No GEMINI_API_KEY found in .env file")
    exit(1)

genai.configure(api_key=api_key)

print("=" * 80)
print("AVAILABLE GEMINI MODELS")
print("=" * 80)

try:
    models = genai.list_models()
    
    print(f"\n📋 Total models found: {len(list(models))}\n")
    
    for model in genai.list_models():
        print(f"\n{'='*80}")
        print(f"Model: {model.name}")
        print(f"Display Name: {model.display_name}")
        print(f"Description: {model.description}")
        print(f"Supported Methods: {model.supported_generation_methods}")
        
        # Check for specific capabilities
        if hasattr(model, 'input_token_limit'):
            print(f"Input Token Limit: {model.input_token_limit}")
        if hasattr(model, 'output_token_limit'):
            print(f"Output Token Limit: {model.output_token_limit}")
        
        # Check if it supports image generation
        supports_images = False
        if hasattr(model, 'supported_generation_methods'):
            methods = model.supported_generation_methods
            if 'generateContent' in methods:
                print("✅ Supports generateContent")
            if 'generateImage' in methods:
                print("✅ Supports generateImage")
                supports_images = True
        
        print(f"Image Generation: {'✅ YES' if supports_images else '❌ NO'}")
        
except Exception as e:
    print(f"❌ Error listing models: {e}")
    print(f"Error type: {type(e).__name__}")

print("\n" + "=" * 80)
print("TESTING IMAGE GENERATION CAPABILITY")
print("=" * 80)

# Test if any model supports image generation
test_models = [
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
    'gemini-1.5-pro-latest',
    'gemini-1.5-pro',
    'gemini-2.0-flash-exp',
]

for model_name in test_models:
    try:
        print(f"\n🧪 Testing: {model_name}")
        model = genai.GenerativeModel(model_name)
        print(f"   ✅ Model initialized successfully")
        
        # Try to check if it has image generation config
        try:
            model_with_config = genai.GenerativeModel(
                model_name=model_name,
                generation_config={"response_modalities": ["IMAGE"]}
            )
            print(f"   ✅ Supports IMAGE response modality")
        except Exception as e:
            print(f"   ❌ IMAGE modality not supported: {type(e).__name__}")
            
    except Exception as e:
        print(f"   ❌ Model not available: {type(e).__name__}: {e}")

print("\n" + "=" * 80)
print("RECOMMENDATION")
print("=" * 80)
print("""
Based on the results above:
1. If you see models with 'generateImage' support → Use those for image generation
2. If no models support image generation → You need to use alternative APIs:
   - Stable Diffusion (Replicate, Stability AI)
   - DALL-E 3 (OpenAI)
   - Imagen 3 (Google Cloud Vertex AI)
""")
