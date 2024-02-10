import { PUBLIC_FOLDER_ID } from "./const/FOLDER_IDS.mjs";

export async function up(knex) {
  await knex.raw(`
    INSERT INTO directus_permissions(collection,action,permissions,validation,fields)
    VALUES
      ('vector_tiles','read','{"_and":[{"listed":{"_eq":true}},{"permission_type":{"_eq":"roles+public"}}]}','{}','layer_id,layer_name,geometry_type,bounds,minzoom,maxzoom,layer_alias,preview,category,hover_popup_columns,click_popup_columns,image_columns,active,fill_style,line_style,circle_style,symbol_style'),
      ('symbol','read','{}','{}','*'),
      ('raster_tiles','read','{"_and":[{"listed":{"_eq":true}},{"permission_type":{"_eq":"roles+public"}}]}','{}','layer_id,bounds,minzoom,maxzoom,terrain_rgb,layer_alias,category,active'),
      ('raster_overlays','read','{"_and":[{"listed":{"_eq":true}},{"permission_type":{"_eq":"roles+public"}}]}','{}','layer_id,bounds,image,legend_image,layer_alias,category,active'),
      ('line','read','{}','{}','*'),
      ('fill','read','{}','{}','*'),
      ('external_tiles','read','{"_and":[{"listed":{"_eq":true}},{"permission_type":{"_eq":"roles+public"}}]}','{}','layer_id,tile_type,is_tilejson,tilejson_url,tile_url,layer_style_url,bounds,minzoom,maxzoom,tile_size,layer_alias,category,active'),
      ('circle','read','{}','{}','*'),
      ('categories','read','{}','{}','*');

    CREATE OR REPLACE FUNCTION handle_non_admin_non_app_directus_roles_insert()
      RETURNS trigger
      LANGUAGE 'plpgsql'
    AS $BODY$
      BEGIN
        INSERT INTO directus_permissions(role,collection,action,permissions,validation,fields)
        VALUES
          (NEW.id,'directus_settings','read','{}','{}','project_name,project_descriptor,public_favicon,project_logo_horizontal,basemaps,initial_map_view,help_center_url'),
          (NEW.id,'directus_files','read','{"_or":[{"folder":{"_eq":"${PUBLIC_FOLDER_ID}"}},{"folder":{"parent":{"_eq":"${PUBLIC_FOLDER_ID}"}}}]}','{}','*'),
          (NEW.id,'vector_tiles','read','{"_and":[{"listed":{"_eq":true}},{"permission_type":{"_in":["roles","roles+public"]}},{"allowed_roles":{"directus_roles_id":{"_eq":"$CURRENT_ROLE"}}}]}','{}','layer_id,layer_name,geometry_type,bounds,minzoom,maxzoom,layer_alias,preview,category,hover_popup_columns,click_popup_columns,image_columns,active,fill_style,line_style,circle_style,symbol_style'),
          (NEW.id,'symbol','read','{}','{}','*'),
          (NEW.id,'raster_tiles','read','{"_and":[{"listed":{"_eq":true}},{"permission_type":{"_in":["roles","roles+public"]}},{"allowed_roles":{"directus_roles_id":{"_eq":"$CURRENT_ROLE"}}}]}','{}','layer_id,bounds,minzoom,maxzoom,terrain_rgb,layer_alias,category,active'),
          (NEW.id,'raster_overlays','read','{"_and":[{"listed":{"_eq":true}},{"permission_type":{"_in":["roles","roles+public"]}},{"allowed_roles":{"directus_roles_id":{"_eq":"$CURRENT_ROLE"}}}]}','{}','layer_id,bounds,image,legend_image,layer_alias,category,active'),
          (NEW.id,'line','read','{}','{}','*'),
          (NEW.id,'fill','read','{}','{}','*'),
          (NEW.id,'external_tiles','read','{"_and":[{"listed":{"_eq":true}},{"permission_type":{"_in":["roles","roles+public"]}},{"allowed_roles":{"directus_roles_id":{"_eq":"$CURRENT_ROLE"}}}]}','{}','layer_id,tile_type,is_tilejson,tilejson_url,tile_url,layer_style_url,bounds,minzoom,maxzoom,tile_size,layer_alias,category,active'),
          (NEW.id,'circle','read','{}','{}','*'),
          (NEW.id,'categories','read','{}','{}','*');
        RETURN NULL;
      END;
    $BODY$;

    CREATE OR REPLACE TRIGGER on_non_admin_non_app_directus_roles_insert
    AFTER INSERT ON directus_roles
    FOR EACH ROW
    WHEN (NEW.admin_access = FALSE AND NEW.app_access = FALSE)
    EXECUTE FUNCTION handle_non_admin_non_app_directus_roles_insert();
  `);
}

export async function down(knex) {
  await knex.raw(`
    DROP TRIGGER IF EXISTS on_non_admin_non_app_directus_roles_insert ON directus_roles;
    DROP FUNCTION IF EXISTS handle_non_admin_non_app_directus_roles_insert();

    DELETE FROM directus_permissions WHERE collection IN ('vector_tiles','symbol','raster_tiles','raster_overlays','line','fill','external_tiles','circle','categories') AND role IS NULL AND action = 'read';
  `);
}
