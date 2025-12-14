# 🚀 BrushWeaver Quick Start

## ✅ Current Status

**Frontend**: ✅ Running on http://localhost:3000/
**Backend**: ✅ Running on http://localhost:8000/

## ⚠️ Next Step: Download AI Model

The app is running but needs an AI model to generate images.

### Download Qwen Image Edit Model (Recommended)

1. **Create models directory:**
```bash
mkdir Backend/models
```

2. **Download the model:**
Visit: https://huggingface.co/Qwen/Qwen-Image-Edit-2509

Or use git-lfs:
```bash
cd Backend/models
git lfs clone https://huggingface.co/Qwen/Qwen-Image-Edit-2509 qwen-image-edit
```

3. **Install dependencies:**
```bash
pip install diffusers transformers torch torchvision accelerate rembg[gpu]
```

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

## 💡 AI Features

### Image Editing Prompts
- "watercolor painting of mountains"
- "anime style character"
- "photorealistic portrait"
- "oil painting landscape"
- "vibrant cartoon style"

### Background Removal
- Automatic background removal with AI
- Multiple models available (u2net, u2netp, silueta, isnet-general-use)
- Alpha matting for smoother edges
- PNG output with transparency

## 🔧 Troubleshooting

### "Model not found"
- Create `Backend/models/` directory
- Download model to `Backend/models/qwen-image-edit/`

### Slow generation
- GPU: 5-8 seconds (normal for Qwen)
- CPU: 60-90 seconds (expected, GPU recommended)

### Out of memory
- Qwen model requires 12GB+ VRAM
- Use smaller model (sdxl-turbo) for 8GB GPUs
- Close other GPU applications

## 📚 More Info

- Model details: https://huggingface.co/Qwen/Qwen-Image-Edit-2509
- Diffusers docs: https://huggingface.co/docs/diffusers

---

**Ready to create?** Download a model and start transforming your drawings with AI! 🎨✨