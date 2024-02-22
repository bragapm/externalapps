export async function up(knex) {
  await knex.raw(`
  CREATE TABLE IF NOT EXISTS three_d_tiles
  (
    layer_id uuid NOT NULL PRIMARY KEY,
    user_created uuid REFERENCES directus_users (id),
    date_created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    user_updated uuid REFERENCES directus_users (id),
    date_updated timestamp with time zone,
    layer_alias character varying(255) NOT NULL,
    listed boolean DEFAULT false NOT NULL,
    active boolean DEFAULT false NOT NULL,
    permission_type character varying(255) DEFAULT 'admin'
  );

    INSERT INTO directus_collections(collection,icon,color,"group",collapse)
    VALUES ('three_d_tiles','3d_rotation','#FFA439','layer_configuration',TRUE);

    CREATE TABLE IF NOT EXISTS three_d_tiles_directus_roles
    (
      id serial NOT NULL PRIMARY KEY,
      three_d_tiles_layer_id uuid REFERENCES three_d_tiles (layer_id)
        ON DELETE CASCADE,
      directus_roles_id uuid REFERENCES directus_roles (id)
        ON DELETE CASCADE
    );

    INSERT INTO directus_collections(collection,"group",hidden)
    VALUES ('three_d_tiles_directus_roles','three_d_tiles',TRUE);

    INSERT INTO directus_fields(collection,field,special,interface,options,display,display_options,readonly,hidden,sort,width,translations,note,conditions,required,"group",validation,validation_message)
    VALUES
      ('three_d_tiles','layer_id','uuid','input',NULL,NULL,NULL,TRUE,FALSE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('three_d_tiles','user_created','user-created','select-dropdown-m2o','{"template":"{{avatar.$thumbnail}} {{first_name}} {{last_name}}"}','user',NULL,TRUE,FALSE,NULL,'half',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('three_d_tiles','date_created','date-created','datetime',NULL,'datetime','{"relative":true}',TRUE,FALSE,NULL,'half',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('three_d_tiles','user_updated','user-updated','select-dropdown-m2o','{"template":"{{avatar.$thumbnail}} {{first_name}} {{last_name}}"}','user',NULL,TRUE,FALSE,NULL,'half',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('three_d_tiles','date_updated','date-updated','datetime',NULL,'datetime','{"relative":true}',TRUE,FALSE,NULL,'half',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('three_d_tiles','listed','cast-boolean','boolean','{"label":"True"}',NULL,NULL,FALSE,FALSE,NULL,'half',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('three_d_tiles','active','cast-boolean','boolean','{"label":"True"}',NULL,NULL,FALSE,FALSE,NULL,'half',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('three_d_tiles','permission_type',NULL,'select-dropdown','{"choices":[{"text":"Admin Only","value":"admin"},{"text":"Selected Roles","value":"roles"},{"text":"Selected Roles + Public","value":"roles+public"}]}',NULL,NULL,FALSE,FALSE,NULL,'half',NULL,NULL,NULL,TRUE,NULL,NULL,NULL),
      ('three_d_tiles','allowed_roles','m2m','list-m2m','{"enableCreate":false,"filter":{"_and":[{"admin_access":{"_eq":false}}]},"template":"{{directus_roles_id.name}}"}',NULL,NULL,FALSE,FALSE,NULL,'half',NULL,NULL,'[{"name":"Hide if permission type is admin","rule":{"_and":[{"permission_type":{"_eq":"admin"}}]},"hidden":true,"options":{"layout":"list","enableCreate":false,"enableSelect":true,"limit":15,"junctionFieldLocation":"bottom","allowDuplicates":false,"enableSearchFilter":false,"enableLink":false}},{"name":"Require when permission type is roles","rule":{"_and":[{"permission_type":{"_eq":"roles"}}]},"required":true,"options":{"layout":"list","enableCreate":false,"enableSelect":true,"limit":15,"junctionFieldLocation":"bottom","allowDuplicates":false,"enableSearchFilter":false,"enableLink":false}}]',FALSE,NULL,NULL,NULL),('three_d_tiles_directus_roles','id',NULL,NULL,NULL,NULL,NULL,FALSE,TRUE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('three_d_tiles_directus_roles','three_d_tiles_layer_id',NULL,NULL,NULL,NULL,NULL,FALSE,TRUE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('three_d_tiles_directus_roles','directus_roles_id',NULL,NULL,NULL,NULL,NULL,FALSE,TRUE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL);

    INSERT INTO directus_relations(many_collection,many_field,one_collection,one_field,one_collection_field,one_allowed_collections,junction_field,sort_field,one_deselect_action)
    VALUES
      ('three_d_tiles','user_created','directus_users',NULL,NULL,NULL,NULL,NULL,'nullify'),
      ('three_d_tiles','user_updated','directus_users',NULL,NULL,NULL,NULL,NULL,'nullify'),
      ('three_d_tiles_directus_roles','directus_roles_id','directus_roles',NULL,NULL,NULL,'three_d_tiles_layer_id',NULL,'nullify'),
      ('three_d_tiles_directus_roles','three_d_tiles_layer_id','three_d_tiles','allowed_roles',NULL,NULL,'directus_roles_id',NULL,'delete');
  `);
}

export async function down(knex) {
  await knex.raw(`
    DELETE FROM directus_relations WHERE many_collection IN ('three_d_tiles','three_d_tiles_directus_roles');

    DELETE FROM directus_fields WHERE collection IN ('three_d_tiles','three_d_tiles_directus_roles');

    DELETE FROM directus_collections WHERE collection IN ('three_d_tiles','three_d_tiles_directus_roles');

    DROP TABLE IF EXISTS three_d_tiles_directus_roles;

    DROP TABLE IF EXISTS three_d_tiles;
  `);
}
