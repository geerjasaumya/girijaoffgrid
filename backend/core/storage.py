import boto3
import uuid
import mimetypes
from pathlib import Path
from fastapi import UploadFile, HTTPException
from .config import settings

s3_client = boto3.client(
    "s3",
    endpoint_url=f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
    aws_access_key_id=settings.R2_ACCESS_KEY_ID,
    aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
    region_name="auto",
)

ALLOWED_TYPES = {
    "image": ["image/jpeg", "image/png", "image/webp", "image/gif"],
    "video": ["video/mp4", "video/webm", "video/quicktime"],
    "audio": ["audio/mpeg", "audio/wav", "audio/ogg", "audio/flac"],
}

MAX_FILE_SIZE_MB = {
    "image": 10,
    "video": 500,
    "audio": 50,
}


def _detect_media_type(content_type: str) -> str:
    for media_type, mime_list in ALLOWED_TYPES.items():
        if content_type in mime_list:
            return media_type
    return None


async def upload_file(file: UploadFile, space_slug: str) -> dict:
    content_type = file.content_type or mimetypes.guess_type(file.filename)[0] or ""
    media_type = _detect_media_type(content_type)

    if not media_type:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{content_type}' not allowed."
        )

    contents = await file.read()
    size_mb = len(contents) / (1024 * 1024)
    max_mb = MAX_FILE_SIZE_MB[media_type]

    if size_mb > max_mb:
        raise HTTPException(
            status_code=400,
            detail=f"{media_type.capitalize()} too large: {size_mb:.1f}MB. Max is {max_mb}MB."
        )

    ext = Path(file.filename).suffix.lower()
    key = f"{space_slug}/{media_type}/{uuid.uuid4().hex}{ext}"

    s3_client.put_object(
        Bucket=settings.R2_BUCKET_NAME,
        Key=key,
        Body=contents,
        ContentType=content_type,
    )

    return {
        "url": f"{settings.R2_PUBLIC_URL.rstrip('/')}/{key}",
        "key": key,
        "media_type": media_type,
        "mime_type": content_type,
        "size_bytes": len(contents),
    }


def delete_file(key: str) -> None:
    try:
        s3_client.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=key)
    except Exception as e:
        print(f"Warning: could not delete R2 object '{key}': {e}")