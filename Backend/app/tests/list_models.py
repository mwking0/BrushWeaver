#!/usr/bin/env python3
"""
List all available Google Gemini models and their capabilities
"""

import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

def list_gemini_models():
    """List all available Gemini models with their capabilities"""
    
    print("🔍 Available Google Gemini Models")
    print("=" * 60)
    
    try:
        # Configure Gemini
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        
        # List all models
        models = list(genai.list_models())
        
        print(f"Found {len(models)} total models\n")
        
        # Filter models that support generateContent
        content_models = []
        vision_models = []
        other_models = []
        
        for model in models:
            model_info = {
                'name': model.name,
                'display_name': model.display_name,
                'description': model.description,
                'methods': model.supported_generation_methods,
                'input_token_limit': getattr(model, 'input_token_limit', 'Unknown'),
                'output_token_limit': getattr(model, 'output_token_limit', 'Unknown')
            }
            
            if 'generateContent' in model.supported_generation_methods:
                # Check if it's a vision model
                if 'vision' in model.name.lower() or 'pro' in model.name.lower() or 'flash' in model.name.lower():
                    vision_models.append(model_info)
                else:
                    content_models.append(model_info)
            else:
                other_models.append(model_info)
        
        # Display Vision/Multimodal Models (can handle images)
        print("🖼️  VISION/MULTIMODAL MODELS (Can analyze images)")
        print("-" * 60)
        for model in vision_models:
            print(f"📷 {model['name']}")
            print(f"   Display Name: {model['display_name']}")
            print(f"   Description: {model['description']}")
            print(f"   Methods: {', '.join(model['methods'])}")
            print(f"   Input Tokens: {model['input_token_limit']}")
            print(f"   Output Tokens: {model['output_token_limit']}")
            print()
        
        # Display Text-Only Models
        print("📝 TEXT-ONLY MODELS")
        print("-" * 60)
        for model in content_models:
            print(f"📄 {model['name']}")
            print(f"   Display Name: {model['display_name']}")
            print(f"   Description: {model['description']}")
            print(f"   Methods: {', '.join(model['methods'])}")
            print(f"   Input Tokens: {model['input_token_limit']}")
            print(f"   Output Tokens: {model['output_token_limit']}")
            print()
        
        # Display Other Models
        if other_models:
            print("🔧 OTHER MODELS")
            print("-" * 60)
            for model in other_models:
                print(f"⚙️  {model['name']}")
                print(f"   Display Name: {model['display_name']}")
                print(f"   Description: {model['description']}")
                print(f"   Methods: {', '.join(model['methods'])}")
                print()
        
        # Summary
        print("=" * 60)
        print("📊 SUMMARY:")
        print(f"• Vision/Multimodal Models: {len(vision_models)}")
        print(f"• Text-Only Models: {len(content_models)}")
        print(f"• Other Models: {len(other_models)}")
        print(f"• Total Models: {len(models)}")
        
        print("\n🎯 RECOMMENDED FOR IMAGE EDITING:")
        recommended = [m for m in vision_models if 'flash' in m['name'] or 'pro' in m['name']]
        for model in recommended[:3]:  # Top 3
            print(f"   ✅ {model['name']} - {model['display_name']}")
        
        print("\n⚠️  IMPORTANT NOTE:")
        print("   Gemini models can ANALYZE images but CANNOT generate/edit images")
        print("   They provide text descriptions and editing suggestions only")
        
        return vision_models, content_models, other_models
        
    except Exception as e:
        print(f"❌ Error listing models: {e}")
        return [], [], []

def test_specific_models():
    """Test specific models to see what they can do"""
    
    print("\n" + "=" * 60)
    print("🧪 TESTING SPECIFIC MODELS")
    print("=" * 60)
    
    models_to_test = [
        'gemini-2.5-flash',
        'gemini-2.0-flash-exp',
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-pro-vision'
    ]
    
    for model_name in models_to_test:
        try:
            print(f"\n🔬 Testing: {model_name}")
            model = genai.GenerativeModel(model_name)
            
            # Test text generation
            response = model.generate_content("Say 'Hello from " + model_name + "'")
            print(f"   ✅ Text: {response.text}")
            
            # Test image analysis capability
            try:
                from PIL import Image
                test_img = Image.new('RGB', (50, 50), color='red')
                response = model.generate_content(["What color is this?", test_img])
                print(f"   ✅ Vision: Can analyze images")
                print(f"   Response: {response.text[:50]}...")
            except Exception as vision_error:
                print(f"   ❌ Vision: Cannot analyze images - {vision_error}")
                
        except Exception as e:
            print(f"   ❌ Model not available: {e}")

if __name__ == "__main__":
    vision_models, content_models, other_models = list_gemini_models()
    test_specific_models()