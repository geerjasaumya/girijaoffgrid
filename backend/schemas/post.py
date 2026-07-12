from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional, List
from .media import MediaItemOut
import json


class LinkItem(BaseModel):
    title: str
    url: str


class PostCreate(BaseModel):
    title: str
    body: Optional[str] = None
    tags: Optional[str] = None
    links: Optional[List[LinkItem]] = None
    order: int = 0


class PostUpdate(BaseModel):
    title: Optional[str] = None
    body: Optional[str] = None
    tags: Optional[str] = None
    links: Optional[List[LinkItem]] = None
    order: Optional[int] = None


class PostOut(BaseModel):
    id: int
    space_id: int
    title: str
    body: Optional[str]
    tags: Optional[str]
    links: Optional[List[LinkItem]] = None
    order: int
    created_at: datetime
    updated_at: Optional[datetime]
    media_items: List[MediaItemOut] = []

    model_config = {"from_attributes": True}

    @field_validator('links', mode='before')
    @classmethod
    def parse_links(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except Exception:
                return None
        return v


@classmethod
def model_validate(cls, obj, *args, **kwargs):
    if hasattr(obj, 'links') and isinstance(obj.links, str):
        try:
            parsed = json.loads(obj.links)
            obj.links = parsed
        except Exception:
            obj.links = None
    return super().model_validate(obj, *args, **kwargs)