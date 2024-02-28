import { LAYER_DATA_FOLDER_ID } from "./const/FOLDER_IDS.mjs";

export async function up(knex) {
  await knex.raw(`
  INSERT INTO directus_folders (id, name)
  VALUES ('${LAYER_DATA_FOLDER_ID}', 'Layer Data');

  INSERT INTO directus_collections(collection, icon, color)
  VALUES ('layer_data', 'layers', '#6644FF');

  ALTER TABLE directus_files
  ADD COLUMN format_file character varying(255),
  ADD COLUMN table_name character varying(64),
  ADD COLUMN is_zipped boolean,
  ADD COLUMN raster_alias character varying(255),
  ADD COLUMN minzoom integer,
  ADD COLUMN maxzoom integer,
  ADD COLUMN is_terrain boolean,
  ADD COLUMN three_d_alias character varying(255),
  ADD COLUMN has_color boolean,
  ADD COLUMN is_ready boolean;

  INSERT INTO directus_fields(collection,field,special,interface,options,display,display_options,readonly,hidden,sort,width,translations,note,conditions,required,"group",validation,validation_message)
  VALUES
    ('directus_files','task_configurations','alias,no-data,group','group-detail',NULL,NULL,NULL,FALSE,TRUE,NULL,'full',NULL,NULL,'[{"name":"Show if folder is Layer Data","rule":{"_and":[{"folder":{"_eq":"${LAYER_DATA_FOLDER_ID}"}}]},"hidden":false,"options":{"start":"open"}}]',FALSE,NULL,NULL,NULL),
    ('directus_files','format_file',NULL,'select-dropdown','{"choices":[{"text":"shapefile","value":"shapefile"},{"text":"kml","value":"kml"},{"text":"xls","value":"xls"},{"text":"xlsx","value":"xlsx"},{"text":"csv","value":"csv"},{"text":"geojson","value":"geojson"},{"text":"gdb","value":"gdb"},{"text":"tif","value":"tif"},{"text":"las/laz","value":"las/laz"}]}',NULL,NULL,FALSE,FALSE,NULL,'full',NULL,NULL,'[{"name":"Require if folder is Layer Data","rule":{"_and":[{"folder":{"_eq":"${LAYER_DATA_FOLDER_ID}"}}]},"required":true,"options":{"allowOther":false,"allowNone":false}}]',FALSE,'task_configurations',NULL,NULL),
    ('directus_files','vector_transform_configuration','alias,no-data,group','group-detail',NULL,NULL,NULL,FALSE,FALSE,NULL,'full',NULL,NULL,'[{"name":"Hide when file is not vector","rule":{"_and":[{"format_file":{"_nin":["shapefile","kml","xls","xlsx","csv","geojson","gdb"]}}]},"options":{"start":"open"},"hidden":true}]',FALSE,'task_configurations',NULL,NULL),
    ('directus_files','table_name',NULL,'input','{"placeholder":"table_name"}',NULL,NULL,FALSE,FALSE,NULL,'full',NULL,'Lowercase alphabet, numeric, and underscore only','[{"name":"Require when file is vector","rule":{"_and":[{"format_file":{"_in":["shapefile","kml","xls","xlsx","csv","geojson","gdb"]}}]},"required":true,"options":{"font":"sans-serif","trim":false,"masked":false,"clear":false,"slug":false}}]',FALSE,'vector_transform_configuration','{"_and":[{"table_name":{"_regex":"^[a-z0-9_]+$"}}]}',NULL),
    ('directus_files','is_zipped','cast-boolean','boolean','{"label":"True"}',NULL,NULL,FALSE,FALSE,NULL,'full',NULL,NULL,'[{"name":"Require when file is vector","rule":{"_and":[{"format_file":{"_in":["shapefile","kml","xls","xlsx","csv","geojson","gdb"]}}]},"required":true,"options":{"iconOn":"check_box","iconOff":"check_box_outline_blank","label":"True"}}]',FALSE,'vector_transform_configuration',NULL,NULL),
    ('directus_files','raster_tiling_configuration','alias,no-data,group','group-detail',NULL,NULL,NULL,FALSE,FALSE,NULL,'full',NULL,NULL,'[{"name":"Hide when file is not raster","rule":{"_and":[{"format_file":{"_nin":["tif"]}}]},"hidden":true,"options":{"start":"open"}}]',FALSE,'task_configurations',NULL,NULL),
    ('directus_files','raster_alias',NULL,'input',NULL,NULL,NULL,FALSE,FALSE,NULL,'full',NULL,NULL,'[{"name":"Require when file is raster","rule":{"_and":[{"format_file":{"_in":["tif"]}}]},"required":true,"options":{"font":"sans-serif","trim":false,"masked":false,"clear":false,"slug":false}}]',FALSE,'raster_tiling_configuration',NULL,NULL),
    ('directus_files','minzoom',NULL,'input','{"min":0,"max":20,"placeholder":"Autodetect"}',NULL,NULL,FALSE,FALSE,NULL,'half',NULL,NULL,'[{"name":"Require when max_zoom is defined","rule":{"_and":[{"maxzoom":{"_nnull":true}}]},"required":true,"options":{"font":"sans-serif","trim":false,"masked":false,"clear":false,"slug":false}}]',FALSE,'raster_tiling_configuration',NULL,NULL),
    ('directus_files','maxzoom',NULL,'input','{"min":0,"max":20,"placeholder":"Autodetect"}',NULL,NULL,FALSE,FALSE,NULL,'half',NULL,NULL,NULL,FALSE,'raster_tiling_configuration',NULL,NULL),
    ('directus_files','is_terrain','cast-boolean','boolean','{"label":"True"}',NULL,NULL,FALSE,FALSE,NULL,'full',NULL,NULL,'[{"name":"Require when file is raster","rule":{"_and":[{"format_file":{"_in":["tif"]}}]},"required":true,"options":{"iconOn":"check_box","iconOff":"check_box_outline_blank","label":"True"}}]',FALSE,'raster_tiling_configuration',NULL,NULL),
    ('directus_files','three_d_tiling_configuration','alias,no-data,group','group-detail',NULL,NULL,NULL,FALSE,FALSE,NULL,'full',NULL,NULL,'[{"name":"Hide when file is not 3d","rule":{"_and":[{"format_file":{"_nin":["las/laz"]}}]},"hidden":true,"options":{"start":"open"}}]',FALSE,'task_configurations',NULL,NULL),
    ('directus_files','three_d_alias',NULL,'input',NULL,NULL,NULL,FALSE,FALSE,NULL,'full',NULL,NULL,'[{"name":"Require when file is 3d","rule":{"_and":[{"format_file":{"_in":["las/laz"]}}]},"required":true,"options":{"font":"sans-serif","trim":false,"masked":false,"clear":false,"slug":false}}]',FALSE,'three_d_tiling_configuration',NULL,NULL),
    ('directus_files','has_color','cast-boolean','boolean','{"label":"True"}',NULL,NULL,FALSE,FALSE,NULL,'full',NULL,NULL,'[{"name":"Require when file is 3d","rule":{"_and":[{"format_file":{"_in":["las/laz"]}}]},"required":true,"options":{"iconOn":"check_box","iconOff":"check_box_outline_blank","label":"True"}}]',FALSE,'three_d_tiling_configuration',NULL,NULL),
    ('directus_files','trigger_after_configuration','alias,no-data,group','group-detail',NULL,NULL,NULL,FALSE,FALSE,NULL,'full',NULL,NULL,NULL,FALSE,'task_configurations',NULL,NULL),
    ('directus_files','is_ready','cast-boolean','boolean','{"label":"True"}',NULL,NULL,FALSE,FALSE,NULL,'full',NULL,NULL,NULL,FALSE,'trigger_after_configuration',NULL,NULL);

  INSERT INTO directus_collections(collection, icon, color)
  VALUES ('internal', 'privacy_tip', '#E35169');

  CREATE TYPE geoprocessing_state AS ENUM (
    'queued',
    'consumed',
    'rejected',
    'done'
  );

  CREATE TABLE geoprocessing_queue (
    message_id uuid PRIMARY KEY,
    queue_name text NOT NULL DEFAULT 'default',
    state geoprocessing_state,
    mtime timestamp with time zone DEFAULT (CURRENT_TIMESTAMP),
    message jsonb,
    result jsonb,
    result_ttl timestamp with time zone
  );

  CREATE INDEX ON geoprocessing_queue (state, mtime);

  INSERT INTO directus_collections(collection, "group", icon, color)
  VALUES ('geoprocessing_queue', 'internal', 'browse_gallery', '#E35169');

  INSERT INTO directus_fields(collection, field)
  VALUES
      ('geoprocessing_queue', 'message_id'),
      ('geoprocessing_queue', 'queue_name'),
      ('geoprocessing_queue', 'geoprocessing_state'),
      ('geoprocessing_queue', 'mtime'),
      ('geoprocessing_queue', 'message'),
      ('geoprocessing_queue', 'result'),
      ('geoprocessing_queue', 'result_ttl');
  `);
}

export async function down(knex) {
  await knex.raw(`
    DELETE FROM directus_fields WHERE collection = 'geoprocessing_queue';
    DELETE FROM directus_collections WHERE collection = 'geoprocessing_queue';

    DROP TABLE IF EXISTS geoprocessing_queue;
    DROP TYPE IF EXISTS geoprocessing_state;

    DELETE FROM directus_collections WHERE collection = 'internal';

    DELETE FROM directus_fields WHERE collection = 'directus_files' AND field IN ('task_configurations','format_file','vector_transform_configuration','table_name','is_zipped','raster_tiling_configuration','raster_alias','minzoom','maxzoom','three_d_tiling_configuration','three_d_alias','has_color','trigger_after_configuration','is_ready');

    ALTER TABLE directus_files
    DROP COLUMN IF EXISTS format_file,
    DROP COLUMN IF EXISTS table_name,
    DROP COLUMN IF EXISTS is_zipped,
    DROP COLUMN IF EXISTS raster_alias,
    DROP COLUMN IF EXISTS minzoom,
    DROP COLUMN IF EXISTS maxzoom,
    DROP COLUMN IF EXISTS three_d_alias,
    DROP COLUMN IF EXISTS has_color,
    DROP COLUMN IF EXISTS is_ready;

    DELETE FROM directus_collections WHERE collection = 'layer_data';
    DELETE FROM directus_folders WHERE id = '${LAYER_DATA_FOLDER_ID}';
  `);
}
