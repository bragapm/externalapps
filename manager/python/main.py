import logging
import os
import pdb
import sys

import tasks
from utils import logger


# If run as simple python script
# Ex : python main.py Kesesuaian_KDB_RTR.zip kesesuaian_5


def main():
    # if len(sys.argv) < 3:
    #     logger.info("Usage: python main.py <object_key> <table_name>")
    #     sys.exit(1)  # Exit the script if there are not enough arguments

    # object_key = sys.argv[1]
    # table_name = sys.argv[2]

    tasks.transform(
        uploader="49015332-8717-411c-bb40-b589d4273a8a",
        object_key="52719c8f-5d29-4a97-8b93-67d5ce9e57e5.gpkg",
        format_file="gpkg",
        is_zipped=False,
        table_name="miko_gpkg1",
        additional_config=None,
    )
    # Above invocation and top most import is necessary for actors auto registration, don't remove or comment it


# If run as dramatiq manager (dramatiq --verbose -p 1 -t 1 main)
if "__main__" == __name__:
    logging.basicConfig(
        level=logging.DEBUG,
        format="%(levelname)1.1s: %(message)s",
    )

    try:
        exit(main())
    except (pdb.bdb.BdbQuit, KeyboardInterrupt):
        logger.info("Interrupted.")
    except Exception:
        logger.exception("Unhandled error:")
        if sys.stdout.isatty():
            logger.debug("Dropping in debugger.")
            pdb.post_mortem(sys.exc_info()[2])

    exit(os.EX_SOFTWARE)
