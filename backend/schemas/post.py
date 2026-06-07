from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from .media import MediaItemOut


class PostCreate(BaseModel):
    title: str
    body: Optional[str] = None
    tags: Optional[str] = None
    order: int = 0


class PostUpdate(BaseModel):
    title: Optional[str] = None
    body: Optional[str] = None
    tags: Optional[str] = None
    order: Optional[int] = None


class PostOut(BaseModel):
    id: int
    space_id: int
    title: str
    body: Optional[str]
    tags: Optional[str]
    order: int
    created_at: datetime
    updated_at: Optional[datetime]
    media_items: List[MediaItemOut] = []

    model_config = {"from_attributes": True}