# 🚀 BrushWeaver Quick Start

## ✅ Current Status

**Frontend**: ✅ Running on http://localhost:3000/
**Backend**: ✅ Running on http://localhost:8000/

## ⚠️ Next Step: Download AI Model

The app is running but needs an AI model to generate images.

### Download Qwen Image Edit Model (Recommended)

```bash
cd qwen
pip install -r requirements.txt
python setup_qwen.py
```

Choose **option 1** (qwen-image-edit) - specifically designed for image editing!

This will download ~10GB. Takes 10-15 minutes depending on your internet.

### After Download

Restart the backend:
```bash
cd Backend/app
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Look for: `✅ Model loaded successfully on cuda`

## 🎨 Using the App

1. Visit http://localhost:3000/
2. Click "Get Started Free" or "Sign In"
3. Enter any email/password (mock auth)
4. Start drawing!
5. Use AI panel to transform your drawings

## 📊 Available Models

| Model | Speed | Quality | Size | Best For |
|-------|-------|---------|------|----------|
| **qwen-image-edit** 🎯 | 5-8s | ⭐⭐⭐⭐⭐ | 10GB | **Image Editing** |
| sdxl-turbo ⚡ | 1-2s | ⭐⭐⭐⭐⭐ | 7GB | Speed |
| sd-turbo | 2-3s | ⭐⭐⭐⭐ | 5GB | Lower VRAM |
| stable-diffusion-xl | 10-15s | ⭐⭐⭐⭐⭐ | 7GB | Quality |
| realistic-vision | 8-12s | ⭐⭐⭐⭐⭐ | 5GB | Photorealistic |

## 💡 AI Prompt Examples

- "watercolor painting of mountains"
- "anime style character"
- "photorealistic portrait"
- "oil painting landscape"
- "vibrant cartoon style"

## 🔧 Troubleshooting

### "Model not found"
Run: `python qwen/setup_qwen.py`

### Slow generation
- GPU: 1-15 seconds (normal)
- CPU: 30-120 seconds (expected, GPU recommended)

### Out of memory
- Use smaller model (sdxl-turbo or sd-turbo instead of qwen-image-edit)
- Close other GPU applications
- Qwen model requires 12GB+ VRAM

## 📚 More Info

- Full guide: `LOCAL_MODELS_GUIDE.md`
- Model details: `qwen/MODELS.md`
- Setup complete: `SETUP_COMPLETE.md`

---

**Ready to create?** Download a model and start transforming your drawings with AI! 🎨✨
