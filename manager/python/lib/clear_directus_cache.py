import os
from urllib import request

from utils import logger


def clear_directus_cache():
    url = (
        os.environ.get("DIRECTUS_PUBLIC_URL", "http://directus:8055")
        + "/utils/cache/clear?access_token="
        + os.environ.get("ADMIN_TOKEN", "")
    )
    try:
        request.urlopen(request.Request(url, method="POST"))
        logger.info("Directus cache cleared successfully")
    except Exception as e:
        logger.info(f"Directus cache clearing failed: {e}")
