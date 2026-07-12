from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List

from core.database import get_db
from core.security import get_current_admin
from core.storage import upload_file, delete_file
from models.space import Space
from schemas.space import SpaceCreate, SpaceUpdate, SpaceOut, SpaceWithPosts


router = APIRouter(prefix="/api/spaces", tags=["spaces"])


@router.get("/", response_model=List[SpaceOut])
def list_spaces(db: Session = Depends(get_db)):
    """Public - List all spaces ordered by display order"""
    return db.query(Space).order_by(Space.order).all()


@router.get("/{slug}", response_model=SpaceWithPosts)
def get_space(slug: str, db: Session = Depends(get_db)):
    """Public - get a single space with all it's posts"""
    space = db.query(Space).filter(Space.slug == slug).first()
    if not space:
        raise HTTPException(status_code=404, detail="Space not Found")
    return space


@router.post("/", response_model=SpaceOut)
def create_space(data: SpaceCreate, db: Session = Depends(get_db), _: str = Depends(get_current_admin)):
    """Admin only — create a new space."""
    existing = db.query(Space).filter(Space.slug == data.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Slug '{data.slug}' already exists")
    space = Space(**data.model_dump())
    
    db.add(space)
    db.commit()
    db.refresh(space)
    return space


@router.patch("/{slug}", response_model=SpaceOut)
def update_space(slug: str, data: SpaceUpdate, db: Session = Depends(get_db), _: str = Depends(get_current_admin)):
    """Admin only Space Update Metadata"""
    space = db.query(Space).filter(Space.slug == slug).first()
    if not space:
        raise HTTPException(status_code=404, detail="Space not found")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(space, field, value)
    db.commit()
    db.refresh(space)
    return space


@router.post("/{slug}/cover", response_model=SpaceOut)
async def upload_cover_image(slug: str, file: UploadFile = File(...), db: Session = Depends(get_db), _: str = Depends(get_current_admin)):
    """Admin only — upload or replace the space cover image."""
    space = db.query(Space).filter(Space.slug == slug).first()
    if not space:
        raise HTTPException(status_code=404, detail="Space not found")
    if space.cover_image_key:
        delete_file(space.cover_image_key)
    
    result = await upload_file(file, space_slug=slug)
    if result["media_type"] != "image":
        raise HTTPException(status_code=400, detail="Cover must be an image")
    
    space.cover_image_url = result["url"]
    space.cover_image_key = result["key"]
    db.commit()
    db.refresh(space)
    return space


@router.delete("/{slug}", status_code=204)
def delete_space(slug: str, db: Session = Depends(get_db), _: str = Depends(get_current_admin)):
    """Admin only — delete a space and all its posts and media."""
    space = db.query(Space).filter(Space.slug == slug).first()
    if not space:
        raise HTTPException(status_code=404, detail="Space not found")
    if space.cover_image_key:
        delete_file(space.cover_image_key)
    db.delete(space)
    db.commit()