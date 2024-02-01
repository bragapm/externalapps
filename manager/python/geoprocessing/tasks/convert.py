import os
import traceback

import dramatiq.results
from osgeo import gdal

from utils import init_gdal_config, logger


@dramatiq.actor(store_results=True)
def convert(input_file: str, output_file: str, **kwargs):
    init_gdal_config()

    try:
        # Open the source dataset
        src_ds = gdal.OpenEx(
            f"/vsis3/{os.environ.get('STORAGE_S3_BUCKET')}/{input_file}",
            gdal.GA_ReadOnly,
        )

        # COG creation options
        creation_options = [
            "TILED=YES",
            "COMPRESS=DEFLATE",
            "BIGTIFF=IF_SAFER",
            "COPY_SRC_OVERVIEWS=YES",
            "BLOCKXSIZE=512",
            "BLOCKYSIZE=512",
        ]

        # Convert to COG
        gdal.Translate(
            f"/vsis3/{os.environ.get('STORAGE_S3_BUCKET')}/{output_file}",
            src_ds,
            format="GTiff",
            creationOptions=creation_options,
        )

        # Close the dataset
        src_ds = None
    except Exception as err:
        error_message = str(err)
        error_traceback = traceback.format_exc()
        logger.error(error_traceback)
        return {"error": error_message, "traceback": error_traceback}
