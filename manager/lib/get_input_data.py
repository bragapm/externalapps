import shutil
import logging
import os
from urllib.parse import urlparse
from osgeo import ogr, gdal
from minio import Minio
from typing import List

logger = logging.getLogger(__name__)

# init minio client
parsed_url = urlparse(os.environ.get("STORAGE_S3_ENDPOINT"))
s3_endpoint = parsed_url.netloc if parsed_url.scheme else parsed_url.path

minio_client = Minio(
    endpoint=s3_endpoint,
    access_key=os.environ.get("STORAGE_S3_KEY"),
    secret_key=os.environ.get("STORAGE_S3_SECRET"),
    region=os.environ.get("STORAGE_S3_REGION"),
    secure=False if parsed_url.scheme == "http" else True,
)

# Set S3 configuration for GDAL
gdal.SetConfigOption("AWS_ACCESS_KEY_ID", os.environ.get("STORAGE_S3_KEY"))
gdal.SetConfigOption("AWS_SECRET_ACCESS_KEY", os.environ.get("STORAGE_S3_SECRET"))
gdal.SetConfigOption("AWS_S3_ENDPOINT", s3_endpoint)
gdal.SetConfigOption("AWS_REGION", os.environ.get("STORAGE_S3_REGION"))
gdal.SetConfigOption("AWS_HTTPS", "NO" if parsed_url.scheme == "http" else "YES")
gdal.SetConfigOption(
    "AWS_VIRTUAL_HOSTING", "TRUE" if s3_endpoint == "s3.amazonaws.com" else "FALSE"
)

# Ensure GDAL uses Amazon S3 Virtual File System Handler
ogr.RegisterAll()
gdal.UseExceptions()

# Ensure GDAL uses COPY in when inserting data into PostgreSQL
gdal.SetConfigOption("PG_USE_COPY", "YES")


def generate_local_temp_dir_path(object_key: str):
    return f"/tmp/geodashboard_{object_key}"


def generate_local_temp_file_path(object_key: str):
    return f"/tmp/geodashboard_{object_key}/{object_key}"


def delete_local_temp_dir(object_key: str):
    shutil.rmtree(generate_local_temp_dir_path(object_key))


def get_gdb_directory(bucket: str, object_key: str):
    src_path = f"/vsizip//vsis3/{bucket}/{object_key}"
    gdb_directory = gdal.ReadDir(src_path)

    return f"{object_key}/{gdb_directory[0]}"


def get_input_data_with_vsi(
    bucket: str,
    object_key: str,
    is_zipped: bool,
    driver_short_name: str,
    open_opts: List[str] = [],
):
    src_path = (
        f"/vsizip//vsis3/{bucket}/{object_key}"
        if is_zipped == True
        else f"/vsis3/{bucket}/{object_key}"
    )
    try:
        dataSource: gdal.Dataset = gdal.OpenEx(
            src_path,
            gdal.GA_ReadOnly | gdal.OF_VECTOR,
            [driver_short_name],
            open_opts,
        )
        if not dataSource:
            raise Exception("No data found!")
        return dataSource
    except Exception as err:
        raise Exception("Error:", err)


def get_input_data_without_vsi_with_vrt(
    bucket: str,
    object_key: str,
    is_zipped: bool,
    driver_short_name: str,
    table_name: str,
):
    try:
        temp_file_path = generate_local_temp_file_path(object_key)

        # download data to temp directory
        minio_client.fget_object(bucket, object_key, temp_file_path)
        if is_zipped == True:
            raise Exception("Not implemented yet")

        # open dataset
        dataSource: gdal.Dataset = gdal.OpenEx(
            temp_file_path,
            gdal.GA_ReadOnly | gdal.OF_VECTOR,
            [driver_short_name],
        )
        # return dataSource

    except Exception as err:
        raise Exception("Error:", err)

    in_layer: ogr.Layer = dataSource.GetLayerByIndex(0)
    in_layer_defn: ogr.FeatureDefn = in_layer.GetLayerDefn()
    layer_name: str = in_layer_defn.GetName()

    # close layer and dataset by making it out of scope
    del in_layer_defn
    del in_layer
    del dataSource

    temp_file_path = generate_local_temp_file_path(object_key)

    try:
        # create in memory VRT
        vrt_path = f"/vsimem/{object_key}.vrt"
        gdal.FileFromMemBuffer(
            f"/vsimem/{object_key}.vrt",
            f"""<OGRVRTDataSource>
<OGRVRTLayer name="{table_name}">
    <SrcDataSource>{temp_file_path}</SrcDataSource>
    <SrcLayer>{layer_name}</SrcLayer>
    <GeometryType>wkbPoint</GeometryType>
    <LayerSRS>WGS84</LayerSRS>
    <GeometryField encoding="PointFromColumns" x="lon" y="lat"/>
</OGRVRTLayer>
</OGRVRTDataSource>\n""",
        )
    except Exception as err:
        logger.error(err)
        delete_local_temp_dir(object_key)
        return "error: Internal server error. Failed to create VRT"

    try:
        # open vrt
        dataSource: gdal.Dataset = gdal.OpenEx(vrt_path, gdal.GA_ReadOnly, ["OGR_VRT"])
        # check if exist
        if not dataSource:
            raise Exception("No data found")

        return dataSource

    except Exception as err:
        logger.error(err)
        # remove vrt from memory
        gdal.Unlink(vrt_path)
        delete_local_temp_dir(object_key)
        return "error: Failed to open data using VRT. Please make sure the data contains valid 'lon' and 'lat' columns"


def get_input_data_with_vsi_with_vrt(
    bucket: str,
    object_key: str,
    is_zipped: bool,
    driver_short_name: str,
    table_name: str,
):
    try:
        dataSource_xlsx: gdal.Dataset = get_input_data_with_vsi(
            bucket,
            object_key,
            is_zipped,
            driver_short_name,
        )
    except Exception as err:
        raise Exception("Error:", err)

    in_layer: ogr.Layer = dataSource_xlsx.GetLayerByIndex(0)
    in_layer_defn: ogr.FeatureDefn = in_layer.GetLayerDefn()
    layer_name: str = in_layer_defn.GetName()

    # close layer and dataset by making it out of scope
    del in_layer_defn
    del in_layer
    del dataSource_xlsx

    try:
        # create in memory VRT
        vrt_path = f"/vsimem/{object_key}.vrt"
        gdal.FileFromMemBuffer(
            f"/vsimem/{object_key}.vrt",
            f"""<OGRVRTDataSource>
    <OGRVRTLayer name="{table_name}">
        <SrcDataSource>/vsis3/{bucket}/{object_key}</SrcDataSource>
        <SrcLayer>{layer_name}</SrcLayer>
        <GeometryType>wkbPoint</GeometryType>
        <LayerSRS>WGS84</LayerSRS>
        <GeometryField encoding="PointFromColumns" x="lon" y="lat"/>
    </OGRVRTLayer>
</OGRVRTDataSource>\n""",
        )
    except Exception as err:
        logger.error(err)
        return "error: Internal server error. Failed to create VRT"

    try:
        # open vrt
        dataSource: gdal.Dataset = gdal.OpenEx(vrt_path, gdal.GA_ReadOnly, ["OGR_VRT"])
        # check if exist
        if not dataSource:
            raise Exception("No data found")

        return dataSource

    except Exception as err:
        logger.error(err)
        # remove vrt from memory
        gdal.Unlink(vrt_path)
        return "error: Failed to open data using VRT. Please make sure the data contains valid 'lon' and 'lat' columns"
