"""Google Gemini image generation and editing service"""
from io import BytesIO
from typing import Optional, Tuple

from PIL import Image

from config import settings


STYLE_INSTRUCTIONS = {
    "realistic": "in a photorealistic style with high detail and natural lighting",
    "cartoon": "in a vibrant cartoon style with bold outlines and bright colors",
    "artistic": "in an artistic style with creative interpretation and expressive brushwork",
    "sketch": "in a hand-drawn sketch style with pencil-like strokes",
    "watercolor": "in a watercolor painting style with soft edges and color bleeding",
    "oil-painting": "in an oil painting style with rich colors and visible brushstrokes",
    "anime": "in an anime/manga style with characteristic features and vibrant colors",
}


class GeminiService:
    """Service for image generation and editing via Google Gemini."""

    def __init__(self):
        self.client = None
        self.model_name = settings.GEMINI_MODEL
        self._initialize_client()

    def _initialize_client(self):
        try:
            from google import genai
            self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
            print(f"✅ Gemini client ready (model: {self.model_name})")
        except ImportError:
            print("❌ google-genai not installed. Run: pip install google-genai")
            self.client = None
        except Exception as e:
            print(f"❌ Failed to initialize Gemini client: {e}")
            self.client = None

    async def edit_image_with_ai(
        self,
        image_data: bytes,
        prompt: str,
        content_type: str,
        style: str = "none",
    ) -> Tuple[bytes, str]:
        """Edit an input image conditioned on a text prompt."""
        if not self.client:
            raise RuntimeError("Gemini client not initialized")

        from google.genai import types

        enhanced_prompt = self._enhance_prompt(prompt, style, has_image=True)
        print(f"🤖 Gemini edit: '{enhanced_prompt}'")

        response = self.client.models.generate_content(
            model=self.model_name,
            contents=[
                types.Part.from_bytes(data=image_data, mime_type=content_type or "image/png"),
                enhanced_prompt,
            ],
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE", "TEXT"],
            ),
        )

        return self._extract_image(response)

    async def generate_image(self, prompt: str, style: str = "none") -> Tuple[bytes, str]:
        """Generate an image from a text prompt only."""
        if not self.client:
            raise RuntimeError("Gemini client not initialized")

        from google.genai import types

        enhanced_prompt = self._enhance_prompt(prompt, style, has_image=False)
        print(f"🤖 Gemini generate: '{enhanced_prompt}'")

        response = self.client.models.generate_content(
            model=self.model_name,
            contents=[enhanced_prompt],
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE", "TEXT"],
            ),
        )

        return self._extract_image(response)

    def _enhance_prompt(self, user_prompt: str, style: str, has_image: bool) -> str:
        prompt = user_prompt.strip()
        suffix = ""
        if style != "none" and style in STYLE_INSTRUCTIONS:
            suffix = f" {STYLE_INSTRUCTIONS[style]}"

        if has_image:
            return f"Based on this image, {prompt}{suffix}. Maintain the composition and make changes look natural."
        return f"{prompt}{suffix}."

    def _extract_image(self, response) -> Tuple[bytes, str]:
        """Pull the first inline_data image out of a Gemini response.

        Raises RuntimeError if Gemini didn't return an image — callers in the
        router catch this and refund the user's credit.
        """
        text_parts = []
        image_bytes = None

        candidates = getattr(response, "candidates", None) or []
        for candidate in candidates:
            content = getattr(candidate, "content", None)
            if not content:
                continue
            for part in getattr(content, "parts", None) or []:
                inline = getattr(part, "inline_data", None)
                if inline and getattr(inline, "data", None):
                    image_bytes = inline.data
                    break
                if getattr(part, "text", None):
                    text_parts.append(part.text)
            if image_bytes:
                break

        if image_bytes is None:
            text_blob = " | ".join(text_parts) if text_parts else "no image in response"
            raise RuntimeError(f"Gemini returned no image ({text_blob})")

        # Normalize to PNG bytes so downstream Pillow loading is predictable.
        try:
            img = Image.open(BytesIO(image_bytes))
            img.load()
            buf = BytesIO()
            img.save(buf, format="PNG")
            normalized = buf.getvalue()
        except Exception:
            normalized = image_bytes

        status = f"Generated with {self.model_name}"
        if text_parts:
            status += f" — {text_parts[0][:120]}"
        return normalized, status

    def test_connection(self) -> dict:
        if not self.client:
            return {
                "status": "error",
                "message": "Gemini client not initialized — check GEMINI_API_KEY and the google-genai install",
                "model": self.model_name,
            }
        return {
            "status": "success",
            "message": "Gemini client is configured",
            "model": self.model_name,
        }


_gemini_service: Optional[GeminiService] = None


def get_gemini_service() -> GeminiService:
    global _gemini_service
    if _gemini_service is None:
        _gemini_service = GeminiService()
    return _gemini_service
