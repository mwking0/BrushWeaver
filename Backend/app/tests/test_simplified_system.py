#!/usr/bin/env python3
"""
Test the simplified Gemini 2.5 only system
"""

import asyncio
from main import _edit_with_ai
from PIL import Image
from io import BytesIO

async def test_gemini_25_system():
    """Test the Gemini 2.5 Flash only system"""
    
    print("🧪 Testing Simplified Gemini 2.5 Flash System")
    print("=" * 50)
    
    # Create a test image (flower-like shape)
    from PIL import ImageDraw
    img = Image.new('RGB', (300, 300), color='white')
    draw = ImageDraw.Draw(img)
    
    # Draw a simple flower shape
    # Petals
    draw.ellipse([100, 120, 200, 180], fill='pink')
    draw.ellipse([120, 100, 180, 200], fill='pink')
    draw.ellipse([110, 110, 190, 190], fill='red')
    # Center
    draw.ellipse([140, 140, 160, 160], fill='yellow')
    
    # Convert to bytes
    buf = BytesIO()
    img.save(buf, format='PNG')
    img_data = buf.getvalue()
    
    # Test the exact prompt from your logs
    test_prompt = "turn this into a logo, photorealistic style, detailed, lifelike"
    
    print(f"📝 Testing prompt: '{test_prompt}'")
    print("🖼️ Input: Simple flower drawing")
    
    try:
        edited_data, analysis = await _edit_with_ai(img_data, test_prompt, "image/png")
        
        print(f"\n✅ SUCCESS!")
        print(f"📊 Original size: {len(img_data)} bytes")
        print(f"📊 Edited size: {len(edited_data)} bytes")
        print(f"📋 Analysis preview: {analysis[:200]}...")
        
        # Verify the result is a valid image
        try:
            result_img = Image.open(BytesIO(edited_data))
            print(f"🖼️ Result: {result_img.size} {result_img.mode} image")
            
            # Save for inspection
            result_img.save("test_result.png")
            print("💾 Saved result as 'test_result.png'")
            
        except Exception as e:
            print(f"❌ Result is not valid image: {e}")
            
    except Exception as e:
        print(f"❌ Test failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_gemini_25_system())