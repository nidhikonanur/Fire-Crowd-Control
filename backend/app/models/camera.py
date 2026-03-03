from __future__ import annotations

import uuid

from sqlalchemy import Boolean, CheckConstraint, DateTime, Float, Index, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Camera(Base):
    __tablename__ = "cameras"
    __table_args__ = (
        CheckConstraint("target_fps BETWEEN 1 AND 5", name="ck_cameras_target_fps_range"),
        CheckConstraint("alert_threshold >= 1", name="ck_cameras_alert_threshold_positive"),
        Index("ix_cameras_enabled", "enabled"),
        Index("ix_cameras_created_at", "created_at"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    stream_url: Mapped[str] = mapped_column(String(512), nullable=False)
    enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    target_fps: Mapped[int] = mapped_column(Integer, nullable=False, default=2)
    alert_threshold: Mapped[int] = mapped_column(Integer, nullable=False, default=120)

    status: Mapped[str] = mapped_column(String(16), nullable=False, default="offline")
    last_latency_ms: Mapped[float | None] = mapped_column(Float, nullable=True)
    last_processed_fps: Mapped[float | None] = mapped_column(Float, nullable=True)
    last_crowd_count: Mapped[float | None] = mapped_column(Float, nullable=True)
    last_update_ts: Mapped[DateTime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )
