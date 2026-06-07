from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from .post import PostOut


class SpaceCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    icon: Optional[str] = None
    order: int = 0


class SpaceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    order: Optional[int] = None


class SpaceOut(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str]
    icon: Optional[str]
    cover_image_url: Optional[str]
    order: int
    created_at: datetime

    model_config = {"from_attributes": True}


class SpaceWithPosts(SpaceOut):
    posts: List[PostOut] = []