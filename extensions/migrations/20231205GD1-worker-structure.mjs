export async function up(knex) {
  // Create Layer Data Folder
  await knex.raw(`
  INSERT INTO directus_folders (id, name)
  VALUES (gen_random_uuid(), 'Layer Data');
  
  INSERT INTO directus_collections(collection, icon, color)
  VALUES ('layer_data', 'layers', '#6644FF');
  
  ALTER TABLE directus_files
  ADD COLUMN format_file character varying(255) DEFAULT 'shapefile'::character varying,
  ADD COLUMN table_name character varying(255),
  ADD COLUMN is_zipped boolean DEFAULT true,
  ADD COLUMN raster_alias character varying(255),
  ADD COLUMN minzoom integer,
  ADD COLUMN maxzoom integer,
  ADD COLUMN is_ready boolean;
  
  INSERT INTO directus_fields(collection, field, special, interface, options, sort, width, required)
  VALUES
      ('directus_files', 'format_file', null, 'select-dropdown', '{"choices":[{"text":"shapefile","value":"shapefile"},{"text":"kml","value":"kml"},{"text":"xls","value":"xls"},{"text":"xlsx","value":"xlsx"},{"text":"csv","value":"csv"},{"text":"geojson","value":"geojson"},{"text":"gdb","value":"gdb"},{"text":"tif","value":"tif"}]}', 1, 'full', false),
      ('directus_files', 'divider-sjndgf', 'alias,no-data', 'presentation-divider', '{"title":"Vector Transform Configuration","inlineTitle":true}', 2, 'full', false),
      ('directus_files', 'table_name', null, 'input', null, 3, 'full', true),  -- Set required to true only for table_name
      ('directus_files', 'is_zipped', 'cast-boolean', 'boolean', '{"label":"Yes"}', 4, 'full', false),
      ('directus_files', 'divider-xhf5pw', 'alias,no-data', 'presentation-divider', '{"inlineTitle":true,"title":"Raster Tiling Configuration"}', 5, 'full', false),
      ('directus_files', 'raster_alias', null, 'input', null, 6, 'full', false),
      ('directus_files', 'minzoom', null, 'input', '{"min":1,"max":20}', 7, 'half', false),
      ('directus_files', 'maxzoom', null, 'input', '{"min":1,"max":20}', 8, 'half', false),
      ('directus_files', 'divider-3gqc1y', 'alias,no-data', 'presentation-divider', '{"title":"Trigger After Configuration","inlineTitle":true}', 9, 'full', false),
      ('directus_files', 'is_ready', 'cast-boolean', 'boolean', '{"label":"Yes"}', 10, 'full', false);
      `);

  // Create Geoprocessing Queue Table
  await knex.raw(`
  INSERT INTO directus_collections(collection, icon, color)
  VALUES ('internal', 'privacy_tip', '#E35169');

  DO $$ 
  DECLARE
  	schema_name TEXT := 'public';
  	state_name TEXT := 'geoprocessing_state';
  	queue_name TEXT := 'geoprocessing_queue';
  
  BEGIN
      EXECUTE 'CREATE SCHEMA IF NOT EXISTS ' || schema_name;
      EXECUTE 'CREATE TYPE ' || schema_name || '.' || state_name || ' AS ENUM (
        ''queued'',
        ''consumed'',
        ''rejected'',
        ''done''
      )';
      EXECUTE 'CREATE TABLE ' || schema_name || '.' || queue_name || ' (
        message_id uuid PRIMARY KEY,
        queue_name TEXT NOT NULL DEFAULT ''default'',
        "state" ' || schema_name || '.' || state_name || ',
        mtime TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE ''UTC''),
        message JSONB,
        "result" JSONB,
        result_ttl  TIMESTAMP WITH TIME ZONE
      ) WITHOUT OIDS';

      EXECUTE 'CREATE INDEX ON ' || schema_name || '.' || queue_name || '("state", mtime)';
  END $$;

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

    DO $$
    DECLARE
      schema_name TEXT := 'public';
      state_name TEXT := 'geoprocessing_state';
      queue_name TEXT := 'geoprocessing_queue';

    BEGIN
      EXECUTE 'DROP TABLE IF EXISTS ' || schema_name || '.' || queue_name;
      EXECUTE 'DROP TYPE IF EXISTS ' || schema_name || '.' || state_name;
    END $$;

    DELETE FROM directus_collections WHERE collection = 'internal';
  `);

  await knex.raw(`
    DELETE FROM directus_fields WHERE collection = 'directus_files' AND field IN ('format_file', 'divider-sjndgf', 'table_name', 'is_zipped', 'divider-xhf5pw', 'raster_alias', 'minzoom', 'maxzoom', 'divider-3gqc1y', 'is_ready');

    ALTER TABLE directus_files
    DROP COLUMN IF EXISTS format_file,
    DROP COLUMN IF EXISTS table_name,
    DROP COLUMN IF EXISTS is_zipped,
    DROP COLUMN IF EXISTS raster_alias,
    DROP COLUMN IF EXISTS minzoom,
    DROP COLUMN IF EXISTS maxzoom,
    DROP COLUMN IF EXISTS is_ready;

    DELETE FROM directus_collections WHERE collection = 'layer_data';
    DELETE FROM directus_folders WHERE name = 'Layer Data';
  `);
}
