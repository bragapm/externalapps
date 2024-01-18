import os
import dramatiq.results
from osgeo import gdal


@dramatiq.actor(store_results=True)
def convert(input_file, output_file):
    # Open the source dataset
    src_ds = gdal.OpenEx(
        f"/vsis3/{os.environ.get('STORAGE_S3_BUCKET')}/{input_file}", gdal.GA_ReadOnly
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
