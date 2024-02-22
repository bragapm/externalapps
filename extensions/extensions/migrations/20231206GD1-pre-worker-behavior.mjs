import { LAYER_DATA_FOLDER_ID } from "./const/FOLDER_IDS.mjs";

export async function up(knex) {
  await knex.raw(`
  CREATE OR REPLACE FUNCTION handle_directus_files_update()
  RETURNS TRIGGER AS $$
  DECLARE
      folder_name varchar(255);
      v_uuid UUID;
      v_now TIMESTAMP WITH TIME ZONE;
      v_timestamp BIGINT;
      actor_name TEXT;
      terrain_rgb_enabled boolean;
      three_d_tiling_enabled boolean;
  BEGIN
      -- If the folder is NULL or is_ready is not true, return early without doing anything
      IF NEW.folder IS NULL OR NEW.is_ready IS NOT TRUE THEN
          RETURN NULL;
      END IF;
      
      -- Get worker configuration
      SELECT terrain_rgb_worker, three_d_tiling_worker INTO STRICT terrain_rgb_enabled, three_d_tiling_enabled
      FROM directus_settings;

      -- Check if the folder is 'Layer Data'
      IF NEW.folder = '${LAYER_DATA_FOLDER_ID}' THEN
          -- Generate a random UUID
          v_uuid := gen_random_uuid();

          -- Get current timestamp
          v_now := NOW();
              
          -- Convert the current timestamp to milliseconds
          v_timestamp := EXTRACT(EPOCH FROM v_now) * 1000;

          -- Set worker or actor name
          IF NEW.format_file = 'tif' THEN
              IF NEW.is_terrain = TRUE AND terrain_rgb_enabled = FALSE THEN
                  RAISE EXCEPTION 'Terrain RGB worker is not enabled';
              END IF;
              actor_name := 'tiling';
          ELSIF NEW.format_file = 'las/laz' THEN
              IF three_d_tiling_enabled = FALSE THEN
                  RAISE EXCEPTION '3D tiling worker is not enabled';
              END IF;
              actor_name := 'three_d_tiling';
          ELSE
              actor_name := 'transform';
          END IF;

          -- Perform the insertion
          INSERT INTO geoprocessing_queue(
              message_id,
              queue_name,
              state,
              mtime,
              message
          )
          VALUES (
              v_uuid,
              'default',
              'queued',
              v_now,
              jsonb_build_object(
                  'args', jsonb_build_array(),
                  'kwargs', jsonb_build_object(
                      'object_key', NEW.filename_disk,
                      'table_name', NEW.table_name,
                      'uploader', NEW.uploaded_by,
                      'format_file', NEW.format_file,
                      'is_zipped', NEW.is_zipped,
                      'raster_alias', NEW.raster_alias,
                      'minzoom', NEW.minzoom,
                      'maxzoom', NEW.maxzoom,
                      'is_terrain', NEW.is_terrain,
                      'three_d_alias', NEW.three_d_alias
                  ),
                  'options', jsonb_build_object(),
                  'actor_name', actor_name,
                  'message_id', v_uuid::text,
                  'queue_name', 'default',
                  'message_timestamp', v_timestamp::text
              ) 
          );
      END IF;

      RETURN NULL;
  END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER on_directus_files_update
  AFTER UPDATE ON directus_files
  FOR EACH ROW
  WHEN (OLD.* IS DISTINCT FROM NEW.*) -- Only if the row actually changed
  EXECUTE FUNCTION handle_directus_files_update();

  CREATE OR REPLACE FUNCTION handle_geoprocessing_queue_insert()
  RETURNS TRIGGER AS $$
  DECLARE
      notify_payload jsonb;
  BEGIN
      IF octet_length(NEW.message::text) >= 8000 THEN
          notify_payload := jsonb_build_object('message_id', NEW.message_id)::text;
      ELSE
          notify_payload := NEW.message::text;
      END IF;

      PERFORM pg_notify('dramatiq.' || NEW.queue_name || '.enqueue', notify_payload::text);
      RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER on_geoprocessing_queue_insert
  AFTER INSERT ON geoprocessing_queue
  FOR EACH ROW
  EXECUTE FUNCTION handle_geoprocessing_queue_insert();
`);
}

export async function down(knex) {
  await knex.raw(`
    DROP TRIGGER IF EXISTS on_geoprocessing_queue_insert ON geoprocessing_queue;
    DROP FUNCTION IF EXISTS handle_geoprocessing_queue_insert();

    DROP TRIGGER IF EXISTS on_directus_files_update ON directus_files;
    DROP FUNCTION IF EXISTS handle_directus_files_update();
  `);
}
