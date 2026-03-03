"""Initial production schema.

Revision ID: 20260303_0001
Revises:
Create Date: 2026-03-03 00:00:00
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "20260303_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "cameras",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("name", sa.String(length=80), nullable=False),
        sa.Column("stream_url", sa.String(length=512), nullable=False),
        sa.Column("enabled", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("target_fps", sa.Integer(), nullable=False, server_default=sa.text("2")),
        sa.Column("alert_threshold", sa.Integer(), nullable=False, server_default=sa.text("120")),
        sa.Column("status", sa.String(length=16), nullable=False, server_default=sa.text("'offline'")),
        sa.Column("last_latency_ms", sa.Float(), nullable=True),
        sa.Column("last_processed_fps", sa.Float(), nullable=True),
        sa.Column("last_crowd_count", sa.Float(), nullable=True),
        sa.Column("last_update_ts", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.CheckConstraint("target_fps BETWEEN 1 AND 5", name="ck_cameras_target_fps_range"),
        sa.CheckConstraint("alert_threshold >= 1", name="ck_cameras_alert_threshold_positive"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    op.create_index("ix_cameras_enabled", "cameras", ["enabled"], unique=False)
    op.create_index("ix_cameras_created_at", "cameras", ["created_at"], unique=False)

    op.create_table(
        "analytics_latest",
        sa.Column("camera_id", sa.String(length=36), nullable=False),
        sa.Column("ts", sa.DateTime(timezone=True), nullable=True),
        sa.Column("status", sa.String(length=16), nullable=False, server_default=sa.text("'offline'")),
        sa.Column("processed_fps", sa.Float(), nullable=False, server_default=sa.text("0")),
        sa.Column("latency_ms", sa.Float(), nullable=False, server_default=sa.text("0")),
        sa.Column("crowd_count", sa.Float(), nullable=False, server_default=sa.text("0")),
        sa.Column("density_overlay_png_base64", sa.Text(), nullable=False, server_default=sa.text("''")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["camera_id"], ["cameras.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("camera_id"),
    )

    op.create_table(
        "alerts",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("camera_id", sa.String(length=36), nullable=False),
        sa.Column("ts", sa.DateTime(timezone=True), nullable=False),
        sa.Column("type", sa.String(length=24), nullable=False),
        sa.Column("severity", sa.String(length=24), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("resolved", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["camera_id"], ["cameras.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_alerts_camera_ts", "alerts", ["camera_id", "ts"], unique=False)
    op.create_index("ix_alerts_resolved_ts", "alerts", ["resolved", "ts"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_alerts_resolved_ts", table_name="alerts")
    op.drop_index("ix_alerts_camera_ts", table_name="alerts")
    op.drop_table("alerts")

    op.drop_table("analytics_latest")

    op.drop_index("ix_cameras_created_at", table_name="cameras")
    op.drop_index("ix_cameras_enabled", table_name="cameras")
    op.drop_table("cameras")
