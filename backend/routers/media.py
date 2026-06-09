from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List

from core.database import get_db
from core.security import get_current_admin
from core.storage import upload_file, delete_file
from models.post import Post
from models.media import MediaItem
from schemas.media import MediaItemOut, MediaItemUpdate

router = APIRouter(prefix="/api/spaces/{slug}/posts/{post_id}/media", tags=["media"])


def _get_post_or_404(slug: str, post_id: int, db: Session) -> Post:
    post = (
        db.query(Post)
        .join(Post.space)
        .filter(Post.id == post_id)
        .filter(Post.space.has(slug=slug))
        .first()
    )
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.get("/", response_model=List[MediaItemOut])
def list_media(slug: str, post_id: int, db: Session = Depends(get_db)):
    """Public — list all media attached to a post."""
    post = _get_post_or_404(slug, post_id, db)

    return (db.query(MediaItem).filter(MediaItem.post_id==post.id).order_by(MediaItem.order).all())


@router.post("/", response_model=MediaItemOut)
async def upload_media(slug: str, post_id: int, file: UploadFile = File(...), db: Session = Depends(get_db), _: str = Depends(get_current_admin)):
    """Admin only — upload an image, video or audio file to a post."""
    post = _get_post_or_404(slug, post_id, db)
    result = await upload_file(file, space_slug=slug)

    media = MediaItem(
        post_id = post.id,
        url = result["url"],
        key = result["key"],
        media_type = result["media_type"],
        mime_type = result["mime_type"],
        filename = file.filename,
        size_bytes = result["size_bytes"]
    )

    db.add(media)
    db.commit()
    db.refresh(media)
    return media


@router.patch("/{media_id}", response_model=MediaItemOut)
def update_media(slug: str, post_id: int, media_id: int, data: MediaItemUpdate, db: Session = Depends(get_db), _: str = Depends(get_current_admin)):
    """Admin only — update caption or order of a media item."""
    media = db.query(MediaItem).filter(MediaItem.id == media_id, MediaItem.post_id == post_id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(media, field, value)
    db.commit()
    db.refresh(media)
    return media


@router.delete("/{media_id}", status_code=204)
def delete_media(slug: str, post_id: int, media_id: int, db: Session = Depends(get_db), _: str = Depends(get_current_admin)):
    """Admin only - delete item and remove it from R2"""
    media = db.query(MediaItem).filter(MediaItem.id == media_id, MediaItem.post_id == post_id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media item not found")
    delete_file(media.key)
    db.delete(media)
    db.commit()
    