from fastapi import APIRouter, File, Header, HTTPException, UploadFile, status, Response
from PIL import Image
import io
from app.core.config import get_settings

router = APIRouter()
settings = get_settings()

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}

def require_admin(role: str | None, authorization: str | None) -> None:
    if role and "ADMIN" in role.upper():
        return
    if settings.app_env.lower() != "production" and authorization and authorization.startswith("Bearer "):
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Yêu cầu quyền ADMIN")

def enhance_image(image_bytes: bytes, target_size: int = 800) -> bytes:
    try:
        img = Image.open(io.BytesIO(image_bytes))
    except Exception as e:
        raise ValueError("Invalid image format") from e

    # Convert to RGB if it's RGBA and has white background, else keep as is or convert appropriately
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGBA")
        # Create a white background image
        background = Image.new("RGBA", img.size, (255, 255, 255, 255))
        img = Image.alpha_composite(background, img).convert("RGB")
    elif img.mode != "RGB":
        img = img.convert("RGB")

    # Center and normalize to square
    width, height = img.size
    max_dim = max(width, height)
    
    # Create a new white square image
    new_img = Image.new("RGB", (max_dim, max_dim), (255, 255, 255))
    
    # Paste the original image into the center
    paste_x = (max_dim - width) // 2
    paste_y = (max_dim - height) // 2
    new_img.paste(img, (paste_x, paste_y))
    
    # Resize to target size if it's larger or if we want strict normalization
    if max_dim != target_size:
        new_img = new_img.resize((target_size, target_size), Image.Resampling.LANCZOS)
        
    output = io.BytesIO()
    # Save as WebP for optimization
    new_img.save(output, format="WEBP", quality=85)
    return output.getvalue()

@router.post("/enhance", status_code=status.HTTP_200_OK)
async def enhance_image_endpoint(
    file: UploadFile = File(...),
    x_role: str | None = Header(default=None),
    authorization: str | None = Header(default=None),
) -> Response:
    # require_admin(x_role, authorization) # optional for enhancement if called internally
    content_type = (file.content_type or "").lower()
    if content_type not in ALLOWED_IMAGE_TYPES:
        # We can accept any image PIL supports, but let's be safe
        pass

    file_bytes = await file.read(settings.ai_max_upload_bytes + 1)
    if not file_bytes:
        raise HTTPException(status_code=400, detail="File ảnh trống")
    if len(file_bytes) > settings.ai_max_upload_bytes:
        raise HTTPException(status_code=413, detail="Ảnh vượt quá giới hạn dung lượng")

    try:
        processed_bytes = enhance_image(file_bytes)
        return Response(content=processed_bytes, media_type="image/webp")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Lỗi khi xử lý ảnh")
