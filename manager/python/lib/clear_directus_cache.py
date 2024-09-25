import os
from urllib import request

from utils import logger


def clear_directus_cache():
    url = "http://directus:8055/utils/cache/clear?access_token=" + os.environ.get(
        "ADMIN_TOKEN", ""
    )
    request.urlopen(request.Request(url, method="POST"))
    logger.info("Directus cache cleared")
