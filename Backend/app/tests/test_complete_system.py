#!/usr/bin/env python3
"""
Test the complete AI image editing system
"""

import asyncio
from main import _edit_with_ai
from PIL import Image
from io import BytesIO

async def test_ai_editing():
    """Test the complete AI editing pipeline"""
    
    print("🧪 Testing Complete AI Editing System")
    print("=" * 50)
    
    # Create test images
    test_images = {
        'red_square': Image.new('RGB', (200, 200), color='red'),
        'blue_circle': Image.new('RGB', (200, 200), color='blue'),
        'green_triangle': Image.new('RGB', (200, 200), color='green')
    }
    
    # Test prompts
    test_prompts = [
        "make this into a colored heart shape Logo for my shop",
        "transform this into a watercolor painting",
        "change the color to purple",
        "add sparkles and make it magical",
        "convert to black and white",
        "make it look vintage and aged"
    ]
    
    for img_name, img in test_images.items():
        print(f"\n🖼️ Testing with {img_name}")
        
        # Convert to bytes
        buf = BytesIO()
        img.save(buf, format='PNG')
        img_data = buf.getvalue()
        
        for i, prompt in enumerate(test_prompts[:2]):  # Test first 2 prompts per image
            print(f"\n   📝 Prompt {i+1}: '{prompt}'")
            
            try:
                edited_data, analysis = await _edit_with_ai(img_data, prompt, "image/png")
                
                # Check if we got a different image back
                if len(edited_data) != len(img_data):
                    print(f"   ✅ Image modified (size changed: {len(img_data)} → {len(edited_data)})")
                else:
                    print(f"   📊 Image processed (same size, likely programmatic edit)")
                
                # Check analysis
                if analysis and len(analysis) > 50:
                    print(f"   📋 Analysis: {analysis[:100]}...")
                else:
                    print(f"   📋 Analysis: {analysis}")
                    
                # Try to load the result to verify it's valid
                try:
                    result_img = Image.open(BytesIO(edited_data))
                    print(f"   ✅ Result is valid image: {result_img.size} {result_img.mode}")
                except Exception as e:
                    print(f"   ❌ Result is not valid image: {e}")
                    
            except Exception as e:
                print(f"   ❌ Editing failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_ai_editing())