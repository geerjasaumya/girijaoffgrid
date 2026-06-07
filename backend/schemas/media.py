from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class MediaItemOut(BaseModel):
    id: int
    post_id: int
    url: str
    media_type: str
    mime_type: Optional[str]
    filename: Optional[str]
    size_bytes: Optional[int]
    caption: Optional[str]
    order: int
    created_at: datetime

    model_config = {"from_attributes": True}


class MediaItemUpdate(BaseModel):
    caption: Optional[str] = None
    order: Optional[int] = None