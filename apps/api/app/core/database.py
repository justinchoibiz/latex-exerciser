from urllib.parse import urlsplit, urlunsplit

import psycopg

from app.core.config import get_settings


def mask_database_url(database_url: str) -> str:
    split_url = urlsplit(database_url)

    if "@" not in split_url.netloc:
        return database_url

    userinfo, hostinfo = split_url.netloc.rsplit("@", 1)

    if ":" not in userinfo:
        masked_netloc = f"{userinfo}:***@{hostinfo}"
    else:
        username, _password = userinfo.split(":", 1)
        masked_netloc = f"{username}:***@{hostinfo}"

    return urlunsplit(
        (
            split_url.scheme,
            masked_netloc,
            split_url.path,
            split_url.query,
            split_url.fragment,
        )
    )


def get_psycopg_database_url() -> str:
    settings = get_settings()

    return settings.database_url.replace("postgresql+psycopg://", "postgresql://")


def check_database_connection() -> bool:
    database_url = get_psycopg_database_url()

    try:
        with psycopg.connect(database_url, connect_timeout=2) as connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()

        return True
    except psycopg.Error:
        return False
    except TimeoutError:
        return False