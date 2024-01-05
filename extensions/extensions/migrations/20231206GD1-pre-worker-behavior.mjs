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
  BEGIN
      -- If the folder is NULL or is_ready is not true, return early without doing anything
      IF NEW.folder IS NULL OR NEW.is_ready IS NOT TRUE THEN
          RETURN NEW;
      END IF;

      -- Get the folder name from directus_folders table for the given folder ID from directus_files
      SELECT name INTO folder_name
      FROM public.directus_folders
      WHERE id = NEW.folder;

      -- Check if the folder_name is 'Layer Data' or 'Raster'
      IF folder_name = 'Layer Data' OR folder_name = 'Raster' THEN
          -- Generate a random UUID
          v_uuid := gen_random_uuid();

          -- Get current timestamp
          v_now := NOW();
              
          -- Convert the current timestamp to milliseconds
          v_timestamp := EXTRACT(EPOCH FROM v_now) * 1000;

          -- Set worker or actor name
          IF NEW.format_file = 'tif' THEN
              actor_name := 'tiling';
          ELSE
              actor_name := 'transform';
          END IF;

          -- Perform the insertion
          INSERT INTO public.geoprocessing_queue(
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
                      'maxzoom', NEW.maxzoom
                  ),
                  'options', jsonb_build_object(),
                  'actor_name', actor_name,
                  'message_id', v_uuid::text,
                  'queue_name', 'default',
                  'message_timestamp', v_timestamp::text
              ) 
          );
      END IF;

      RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER on_directus_files_update
  AFTER UPDATE ON public.directus_files
  FOR EACH ROW
  WHEN (OLD.* IS DISTINCT FROM NEW.*) -- Only if the row actually changed
  EXECUTE FUNCTION handle_directus_files_update();
`);

  await knex.raw(`
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
    DROP TRIGGER IF EXISTS on_geoprocessing_queue_insert ON public.geoprocessing_queue;
    DROP FUNCTION IF EXISTS handle_geoprocessing_queue_insert();

    DROP TRIGGER IF EXISTS on_directus_files_update ON public.directus_files;
    DROP FUNCTION IF EXISTS handle_directus_files_update();
  `);
}
