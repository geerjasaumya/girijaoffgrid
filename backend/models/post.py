from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    space_id = Column(Integer, ForeignKey("spaces.id"), nullable=False)
    title = Column(String(200), nullable=False)
    body = Column(Text, nullable=True)
    tags = Column(String(500), nullable=True)
    order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    links = Column(Text, nullable=True)  # JSON string: [{"title": "GitHub", "url": "https://..."}]

    space = relationship("Space", back_populates="posts")
    media_items = relationship("MediaItem", back_populates="post", cascade="all, delete-orphan")