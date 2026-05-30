# app/routers/image_router.py
"""Image editing endpoints"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Form, Depends
from fastapi.responses import Response
from PIL import Image, ImageFilter
from io import BytesIO
from typing import Optional
from config import settings
from services.gemini_service import get_gemini_service
from services.image_service import image_service
from services.background_removal_service import background_removal_service
from services.auth_service import get_current_active_user
from database import get_db, User
from sqlalchemy import update
from sqlalchemy.orm import Session

# Initialize Gemini service
gemini_service = get_gemini_service()

router = APIRouter(prefix="/edit", tags=["Image Editing"])


def reserve_user_credit(db: Session, user: User) -> bool:
    """Atomically reserve 1 credit. Returns True on success, False if insufficient.

    Issued as a single conditional UPDATE — the DB serializes concurrent callers,
    so two requests can never both succeed when only 1 credit is available.
    Pair every successful reservation with either keeping it (operation succeeded)
    or calling refund_user_credit (operation failed) — never leave a reservation
    dangling.
    """
    result = db.execute(
        update(User)
        .where(User.id == user.id)
        .where(User.credits > 0)
        .values(credits=User.credits - 1)
    )
    db.commit()
    if result.rowcount == 0:
        return False
    db.refresh(user)
    return True


def refund_user_credit(db: Session, user: User) -> int:
    """Atomically refund 1 credit. Use after a reserved operation fails."""
    db.execute(
        update(User)
        .where(User.id == user.id)
        .values(credits=User.credits + 1)
    )
    db.commit()
    db.refresh(user)
    return user.credits


@router.post("")
async def edit_image(
    file: Optional[UploadFile] = File(None),
    prompt: str = Form("", description="AI editing or generation prompt"),
    style: str = Form("none", description="Style preset: none|realistic|cartoon|artistic|sketch|watercolor|oil-painting|anime"),
    format: str = Form("same", description="jpeg|png|webp|same"),
    width: Optional[int] = Form(None, ge=1, le=settings.MAX_IMAGE_DIMENSION),
    height: Optional[int] = Form(None, ge=1, le=settings.MAX_IMAGE_DIMENSION),
    grayscale: bool = Form(False),
    rotate: int = Form(0, ge=0, le=359),
    blur: float = Form(0.0, ge=0.0, le=50.0),
    watermark: str = Form(""),
    quality: int = Form(settings.DEFAULT_QUALITY, ge=1, le=100),
    use_ai: bool = Form(True, description="Use AI for editing"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Edit an image with AI, generate from a prompt, or apply traditional transforms.

    - **file**: Image file (optional — if omitted with a prompt, runs text-to-image)
    - **prompt**: AI instructions. Required when no file is uploaded.
    - **format**: Output format (jpeg, png, webp, or same)
    - **width/height**: Resize dimensions
    - **grayscale**: Convert to grayscale
    - **rotate**: Rotation angle (0-359)
    - **blur**: Blur radius (0-50)
    - **watermark**: Watermark text
    - **quality**: Output quality (1-100)
    - **use_ai**: Enable AI-powered generation/editing
    """

    has_file = file is not None
    has_ai_request = use_ai and bool(prompt)

    # Must have either an input image or an AI prompt
    if not has_file and not has_ai_request:
        raise HTTPException(400, "Either a file or an AI prompt is required")

    # Read and validate the input file, if present
    data: Optional[bytes] = None
    content_type = "image/png"
    if has_file:
        if file.content_type not in settings.ALLOWED_CONTENT_TYPES:
            raise HTTPException(
                415,
                f"Unsupported content type: {file.content_type or 'unknown'}"
            )
        data = await file.read()
        if len(data) > settings.MAX_FILE_SIZE:
            raise HTTPException(
                413,
                f"File too large (> {settings.MAX_FILE_SIZE} bytes)"
            )
        content_type = file.content_type

    # AI-powered generation or editing
    ai_analysis = ""
    if has_ai_request:
        # Atomically reserve 1 credit. If reservation fails, the user has none.
        if not reserve_user_credit(db, current_user):
            raise HTTPException(
                status_code=402,
                detail="Insufficient credits. Please purchase more credits to continue."
            )
        print(f"💳 Credit reserved. Remaining: {current_user.credits}")

        try:
            if has_file:
                print(f"🤖 Gemini image edit: '{prompt}' (style: {style})")
                data, ai_analysis = await gemini_service.edit_image_with_ai(
                    data,
                    prompt,
                    content_type,
                    style=style,
                )
            else:
                print(f"🤖 Gemini text-to-image: '{prompt}' (style: {style})")
                data, ai_analysis = await gemini_service.generate_image(
                    prompt,
                    style=style,
                )
            print("✅ Gemini call completed")
        except Exception as e:
            refund_user_credit(db, current_user)
            print(f"❌ Gemini call failed (credit refunded): {e}")
            raise HTTPException(500, f"AI generation failed: {e}")

    # Load image for traditional processing
    try:
        img = Image.open(BytesIO(data))
        img.load()
        print(f"📥 RECEIVED image: {img.size[0]}x{img.size[1]} ({img.mode})")
    except Exception:
        raise HTTPException(400, "Invalid or corrupted image")

    # Apply traditional transformations
    if rotate:
        img = img.rotate(-rotate, expand=True)

    if grayscale:
        img = img.convert("L")

    if width or height:
        img = image_service.resize_keep_aspect(img, width, height)

    if blur and blur > 0:
        img = img.filter(ImageFilter.GaussianBlur(radius=blur))

    if watermark:
        img = image_service.add_watermark(img, watermark)

    # Prepare output
    out_fmt = image_service.pick_output_format(format, content_type)
    img = image_service.ensure_mode_for_format(img, out_fmt)

    print(f"📤 SENDING image: {img.size[0]}x{img.size[1]} ({img.mode}) as {out_fmt}")

    buf = BytesIO()
    save_kwargs = {}
    if out_fmt in ("jpeg", "webp"):
        save_kwargs["quality"] = quality
    img.save(buf, format=out_fmt.upper(), **save_kwargs)

    print(f"📤 Output buffer size: {buf.tell()} bytes")

    headers = {"Content-Disposition": f'inline; filename="edited.{out_fmt}"'}

    if ai_analysis:
        analysis_preview = ai_analysis[:150] + "..." if len(ai_analysis) > 150 else ai_analysis
        clean_analysis = analysis_preview.replace('\n', ' ').replace('\r', ' ')
        clean_analysis = clean_analysis.replace('–', '-').replace('—', '-')
        try:
            headers["X-AI-Analysis"] = clean_analysis.encode('ascii', 'ignore').decode('ascii')
        except Exception:
            headers["X-AI-Analysis"] = "AI generation completed"

    return Response(
        content=buf.getvalue(),
        media_type=f"image/{out_fmt}",
        headers=headers
    )


@router.post("/remove-background")
async def remove_background(
    file: UploadFile = File(...),
    model: str = Form("u2net", description="Model to use: u2net|u2netp|silueta|isnet-general-use"),
    alpha_matting: bool = Form(False, description="Enable alpha matting for better edges"),
    format: str = Form("png", description="Output format: png|webp"),
    quality: int = Form(settings.DEFAULT_QUALITY, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Remove background from an image

    - **file**: Image file to process
    - **model**: Background removal model to use
    - **alpha_matting**: Enable alpha matting for smoother edges
    - **format**: Output format (png recommended for transparency)
    - **quality**: Output quality (1-100)
    """

    # Validate content type
    if file.content_type not in settings.ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            415,
            f"Unsupported content type: {file.content_type or 'unknown'}"
        )

    # Read and validate file size
    data = await file.read()
    if len(data) > settings.MAX_FILE_SIZE:
        raise HTTPException(
            413,
            f"File too large (> {settings.MAX_FILE_SIZE} bytes)"
        )

    # Atomically reserve 1 credit. If reservation fails, the user has none.
    if not reserve_user_credit(db, current_user):
        raise HTTPException(
            status_code=402,
            detail="Insufficient credits. Please purchase more credits to continue."
        )
    print(f"💳 Credit reserved. Remaining: {current_user.credits}")

    # Remove background
    try:
        print(f"🎯 Starting background removal with model: {model}")
        processed_data, status_message = background_removal_service.remove_background_with_options(
            data,
            model_name=model,
            alpha_matting=alpha_matting
        )
    except Exception as e:
        refund_user_credit(db, current_user)
        print(f"❌ Background removal failed (credit refunded): {e}")
        raise HTTPException(500, f"Background removal failed: {e}")

    # The service catches its own exceptions and signals failure via the status
    # message — refund if the reservation didn't translate to a real success.
    if "successfully" not in status_message:
        refund_user_credit(db, current_user)
        print(f"❌ Background removal did not succeed (credit refunded): {status_message}")
        raise HTTPException(500, f"Background removal failed: {status_message}")

    print("✅ Background removal completed")

    # Load processed image for format conversion if needed
    try:
        img = Image.open(BytesIO(processed_data))
        img.load()
        print(f"📤 SENDING image: {img.size[0]}x{img.size[1]} ({img.mode})")
    except Exception:
        raise HTTPException(500, "Failed to process background removal result")

    # Prepare output format
    out_fmt = format.lower()
    if out_fmt not in ["png", "webp"]:
        out_fmt = "png"  # Default to PNG for transparency support

    # Save with proper format
    buf = BytesIO()
    save_kwargs = {}
    if out_fmt == "webp":
        save_kwargs["quality"] = quality
        save_kwargs["lossless"] = False

    img.save(buf, format=out_fmt.upper(), **save_kwargs)

    print(f"📤 Output buffer size: {buf.tell()} bytes")

    # Prepare response headers
    headers = {
        "Content-Disposition": f'inline; filename="no-background.{out_fmt}"',
        "X-Processing-Status": status_message.replace('\n', ' ').replace('\r', ' ')
    }

    return Response(
        content=buf.getvalue(),
        media_type=f"image/{out_fmt}",
        headers=headers
    )


@router.get("/background-removal/models")
async def list_background_removal_models():
    """List available background removal models"""
    return background_removal_service.test_connection()
