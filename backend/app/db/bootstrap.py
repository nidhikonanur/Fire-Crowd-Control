from __future__ import annotations

from app.db.base import Base
from app.db.session import engine
from app.models import Alert, AnalyticsLatest, Camera  # noqa: F401


def bootstrap_schema() -> None:
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    bootstrap_schema()
