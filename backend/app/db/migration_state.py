from __future__ import annotations

from sqlalchemy import inspect
from sqlalchemy.exc import SQLAlchemyError

from app.db.session import engine

REQUIRED_TABLES = {"cameras", "analytics_latest", "alerts"}
ALEMBIC_VERSION_TABLE = "alembic_version"


def requires_alembic_stamp() -> bool:
    table_names = set(inspect(engine).get_table_names())
    has_required_schema = REQUIRED_TABLES.issubset(table_names)
    has_version_table = ALEMBIC_VERSION_TABLE in table_names
    return has_required_schema and not has_version_table


def main() -> int:
    try:
        return 2 if requires_alembic_stamp() else 0
    except SQLAlchemyError:
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
