import { PUBLIC_FOLDER_ID } from "./const/FOLDER_IDS.mjs";

export async function up(knex) {
  await knex.raw(`
    ALTER TABLE IF EXISTS directus_settings
      ADD COLUMN IF NOT EXISTS help_center_url text,
      ADD COLUMN IF NOT EXISTS securewatch_maxar_username text,
      ADD COLUMN IF NOT EXISTS securewatch_maxar_password text,
      ADD COLUMN IF NOT EXISTS project_logo_horizontal uuid REFERENCES directus_files (id) ON DELETE SET NULL;

    INSERT INTO directus_fields(collection,field,special,interface,options,display,display_options,readonly,hidden,sort,width,translations,note,conditions,required,"group",validation,validation_message)
    VALUES
      ('directus_settings','divider-zl85od','alias,no-data','presentation-divider','{"title":"Additional Configuration","inlineTitle":true,"icon":"build"}',NULL,NULL,FALSE,FALSE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('directus_settings','help_center_url',NULL,'input',NULL,NULL,NULL,FALSE,FALSE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('directus_settings','securewatch_maxar_username',NULL,'input',NULL,NULL,NULL,FALSE,FALSE,NULL,'half',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('directus_settings','securewatch_maxar_password',NULL,'input','{"masked":true}',NULL,NULL,FALSE,FALSE,NULL,'half',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('directus_settings','divider-wu7adw','alias,no-data','presentation-divider','{"title":"Additional Configuration","inlineTitle":true,"icon":"build"}',NULL,NULL,FALSE,FALSE,NULL,'full',NULL,NULL,NULL,FALSE,'theming_group',NULL,NULL),
      ('directus_settings','project_logo_horizontal','file','file-image','{"folder":"${PUBLIC_FOLDER_ID}"}',NULL,NULL,FALSE,FALSE,NULL,'full',NULL,'Please make sure selected file is in Public folder',NULL,FALSE,'theming_group',NULL,NULL);

    INSERT INTO directus_relations(many_collection,many_field,one_collection,one_field,one_collection_field,one_allowed_collections,junction_field,sort_field,one_deselect_action)
    VALUES
      ('directus_settings','project_logo_horizontal','directus_files',NULL,NULL,NULL,NULL,NULL,'nullify');

    INSERT INTO directus_permissions(collection,action,permissions,validation,fields)
    VALUES ('directus_settings','read','{}','{}','project_name,project_descriptor,public_favicon,basemaps,help_center_url,project_logo_horizontal');
  `);
}

export async function down(knex) {
  await knex.raw(`
    DELETE FROM directus_permissions WHERE collection = 'directus_settings' AND role IS NULL AND action = 'read';

    DELETE FROM directus_relations WHERE many_collection = 'directus_settings' AND one_collection = 'project_logo_horizontal';

    DELETE FROM directus_fields WHERE collection = 'directus_settings' AND field IN ('divider-zl85od','help_center_url','securewatch_maxar_username','securewatch_maxar_password','divider-wu7adw','project_logo_horizontal');

    ALTER TABLE IF EXISTS directus_settings
      DROP COLUMN IF EXISTS help_center_url,
      DROP COLUMN IF EXISTS securewatch_maxar_username,
      DROP COLUMN IF EXISTS securewatch_maxar_password,
      DROP COLUMN IF EXISTS project_logo_horizontal;
  `);
}
