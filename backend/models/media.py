from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base


class MediaItem(Base):
    __tablename__ = "media_items"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    url = Column(String(500), nullable=False)
    key = Column(String(500), nullable=False)
    media_type = Column(String(20), nullable=False)
    mime_type = Column(String(100), nullable=True)
    filename = Column(String(200), nullable=True)
    size_bytes = Column(Integer, nullable=True)
    caption = Column(String(300), nullable=True)
    order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    post = relationship("Post", back_populates="media_items")