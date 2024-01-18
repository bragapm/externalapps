import logging
import os
import pdb
import sys
import importlib

from pathlib import Path
from utils import logger

# from tasks.transform import transform


def register_actors_from_directory(directory):
    # Path to the directory relative to the current file
    actors_path = Path(__file__).parent / directory

    # Iterate over each file in the directory
    for file in os.listdir(actors_path):
        if file.endswith(".py") and file != "__init__.py":
            module_name = f"{directory}.{file[:-3]}"  # Remove '.py' from filename
            module = importlib.import_module(module_name)

            # Register each actor in the module (optional, depending on your setup)
            for attr_name in dir(module):
                attr = getattr(module, attr_name)
                if hasattr(attr, "queue_name"):  # Check if it's a Dramatiq actor
                    print(f"Registered actor: {attr_name}")


# If run as simple python script (python main.py)
def main():
    register_actors_from_directory("tasks")
    # input_geotiff = "b0e271ae-8d03-4810-b7ea-7f409cfff2f2.tif"
    # output_cog = "bali_cog1.tif"
    # transform(
    #     object_key="99ada037-d1f7-463b-ab22-22645ac46e88.zip",
    #     uploader="49015332-8717-411c-bb40-b589d4273a8a",
    #     format_file="geojson",
    #     is_zipped=True,
    #     table_name="hahaha11",
    # )


# If run as dramatiq manager (dramatiq --verbose -p 1 -t 1 main)
if "__main__" == __name__:
    register_actors_from_directory("tasks")
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
