from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session, joinedload
from typing import List
import json

from core.database import get_db
from core.security import get_current_admin
from models.space import Space
from models.post import Post
from schemas.post import PostCreate, PostOut, PostUpdate

router = APIRouter(prefix="/api/spaces/{slug}/posts", tags=["posts"])

def _get_space_or_404(slug: str, db: Session) -> Space:
    space = db.query(Space).filter(Space.slug == slug).first()
    if not space:
        raise HTTPException(status_code=404, detail="Space not found")
    return space


@router.get("/", response_model=List[PostOut])
def list_post(slug: str, db: Session = Depends(get_db)):
    """Public — list all posts in a space."""
    space = _get_space_or_404

    return (
        db.query(Post)
        .options(joinedload(Post.media_items))
        .filter(Post.space_id == space.id)
        .order_by(Post.order, Post.created_at.desc())
        .all()
    )


@router.get("/{post_id}", response_model=PostOut)
def get_post(slug: str, post_id: int, db: Session = Depends(get_db)):
    """Public — get a single post with its media."""
    space = _get_space_or_404
    post = (
        db.query(Post)
        .options(joinedload(Post.media_items))
        .filter(Post.id == post_id, Post.space_id == space.id)
        .first()
    )

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.post("/", response_model=PostOut)
def create_post(slug: str, data: PostCreate, db: Session = Depends(get_db), _: str = Depends(get_current_admin)):
    """Admin only — create a post in a space."""
    space = _get_space_or_404(slug, db)
    post_data = data.model_dump()
    if post_data.get('links') is not None:
        post_data['links'] = json.dumps([l.model_dump() if hasattr(l, 'model_dump') else l for l in post_data['links']])
    post = Post(space_id=space.id, **post_data)
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@router.patch("/{post_id}", response_model=PostOut)
def update_post(slug: str, post_id: int, data: PostUpdate, db: Session = Depends(get_db), _: str = Depends(get_current_admin)):
    """Admin only — update post text/tags."""
    space = _get_space_or_404(slug, db)
    post = db.query(Post).filter(Post.id == post_id, Post.space_id == space.id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    update_data = data.model_dump(exclude_none=True)
    if 'links' in update_data:
        update_data['links'] = json.dumps([l.model_dump() if hasattr(l, 'model_dump') else l for l in update_data['links']])
    for field, value in update_data.items():
        setattr(post, field, value)
    db.commit()
    db.refresh(post)
    return post


@router.delete("/{post_id}", status_code=204)
def delete_post(slug: str, post_id: int, db: Session = Depends(get_db), _: str = Depends(get_current_admin)):
    """Admin only — delete a post and all its media."""
    space = _get_space_or_404(slug, db)
    post = db.query(Post).filter(Post.id == post_id, Post.space_id == space.id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post Not found")
    db.delete(post)
    db.commit()