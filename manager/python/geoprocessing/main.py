import logging
import os
import pdb
import sys

import tasks
from utils import logger



# If run as simple python script (python main.py)
def main():
    # input_geotiff = "b0e271ae-8d03-4810-b7ea-7f409cfff2f2.tif"
    # output_cog = "bali_cog1.tif"
    tasks.transform(
        object_key="99ada037-d1f7-463b-ab22-22645ac46e88.zip",
        uploader="49015332-8717-411c-bb40-b589d4273a8a",
        format_file="geojson",
        is_zipped=True,
        table_name="hahaha13",
    )


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
