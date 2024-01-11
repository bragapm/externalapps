export async function up(knex) {
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS block_hero (
      id serial NOT NULL PRIMARY KEY
    );

    CREATE TABLE IF NOT EXISTS block_hero_slides (
      id serial NOT NULL PRIMARY KEY,
      title character varying(255) NOT NULL,
      subtitle character varying(255) NOT NULL,
      body character varying(255) NOT NULL,
      image uuid NOT NULL REFERENCES directus_files (id),
      primary_button_text character varying(255),
      primary_button_url text,
      secondary_button_text character varying(255),
      secondary_button_url text,
      data json
    );

    CREATE TABLE IF NOT EXISTS block_hero_block_hero_slides (
      id serial NOT NULL PRIMARY KEY,
      block_hero_id integer REFERENCES block_hero (id)
        ON DELETE CASCADE,
      block_hero_slides_id integer REFERENCES block_hero_slides (id)
        ON DELETE CASCADE,
      sort integer
    );

    CREATE TABLE IF NOT EXISTS landing (
      lang character varying(3) NOT NULL PRIMARY KEY
    );

    CREATE TABLE IF NOT EXISTS landing_blocks (
      id serial NOT NULL PRIMARY KEY,
      landing_lang character varying(3) REFERENCES landing (lang)
        ON DELETE CASCADE,
      item character varying(255),
      collection character varying(255),
      sort integer
    );

    INSERT INTO directus_collections(collection,icon,hidden,color,"group")
    VALUES
      ('pages','web',FALSE,'#3399FF',NULL),
      ('blocks','folder',TRUE,'#3399FF','pages'),
      ('block_hero',NULL,TRUE,'#3399FF','blocks'),
      ('block_hero_slides',NULL,TRUE,'#3399FF','blocks'),
      ('block_hero_block_hero_slides_slides','import_export',TRUE,'#3399FF','blocks'),
      ('landing','home',FALSE,'#3399FF','pages'),
      ('landing_blocks','import_export',TRUE,'#3399FF','landing');

    INSERT INTO directus_fields(collection,field,special,interface,options,display,display_options,readonly,hidden,sort,width,translations,note,conditions,required,"group",validation,validation_message)
    VALUES
      ('landing','lang',NULL,'input',NULL,NULL,NULL,FALSE,FALSE,NULL,'full',NULL,'ISO 639 Set 3 language code (https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes)',NULL,TRUE,NULL,NULL,NULL),
      ('landing_blocks','id',NULL,NULL,NULL,NULL,NULL,FALSE,TRUE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('landing_blocks','landing_lang',NULL,NULL,NULL,NULL,NULL,FALSE,TRUE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('landing_blocks','item',NULL,NULL,NULL,NULL,NULL,FALSE,TRUE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('landing_blocks','collection',NULL,NULL,NULL,NULL,NULL,FALSE,TRUE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('block_hero','slides','m2m','list-m2m','{"allowDuplicates":true,"template":"{{block_hero_slides_id.title}}"}','related-values','{"template":"{{block_hero_slides_id.title}}"}',FALSE,FALSE,NULL,'full',NULL,NULL,NULL,TRUE,NULL,NULL,NULL),
      ('block_hero','id',NULL,'input',NULL,NULL,NULL,TRUE,TRUE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('block_hero_slides','id',NULL,'input',NULL,NULL,NULL,TRUE,TRUE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('block_hero_slides','title',NULL,'input',NULL,NULL,NULL,FALSE,FALSE,NULL,'full',NULL,NULL,NULL,TRUE,NULL,NULL,NULL),
      ('block_hero_slides','subtitle',NULL,'input',NULL,NULL,NULL,FALSE,FALSE,NULL,'full',NULL,NULL,NULL,TRUE,NULL,NULL,NULL),
      ('block_hero_slides','body',NULL,'input',NULL,NULL,NULL,FALSE,FALSE,NULL,'full',NULL,NULL,NULL,TRUE,NULL,NULL,NULL),
      ('block_hero_slides','image','file','file-image','{"folder":"ffffffff-ffff-4fff-bfff-ffffffffffff"}',NULL,NULL,FALSE,FALSE,NULL,'full',NULL,NULL,NULL,TRUE,NULL,NULL,NULL),
      ('block_hero_slides','primary_button_text',NULL,'input',NULL,NULL,NULL,FALSE,FALSE,NULL,'half',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('block_hero_slides','primary_button_url',NULL,'input',NULL,NULL,NULL,FALSE,FALSE,NULL,'half',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('block_hero_slides','secondary_button_text',NULL,'input',NULL,NULL,NULL,FALSE,FALSE,NULL,'half',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('block_hero_slides','secondary_button_url',NULL,'input',NULL,NULL,NULL,FALSE,FALSE,NULL,'half',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('block_hero_slides','data','cast-json','list','{"fields":[{"field":"value","name":"value","type":"string","meta":{"field":"value","type":"string","required":true,"interface":"input"}},{"field":"label","name":"label","type":"string","meta":{"field":"label","type":"string","required":true,"interface":"input"}},{"field":"sort","name":"sort","type":"integer","meta":{"field":"sort","type":"integer","interface":"input"}}],"sort":"sort"}',NULL,NULL,FALSE,FALSE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('block_hero_block_hero_slides','id',NULL,NULL,NULL,NULL,NULL,FALSE,TRUE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('block_hero_block_hero_slides','sort',NULL,NULL,NULL,NULL,NULL,FALSE,TRUE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('block_hero_block_hero_slides','block_hero_slides_id',NULL,NULL,NULL,NULL,NULL,FALSE,TRUE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('block_hero_block_hero_slides','block_hero_id',NULL,NULL,NULL,NULL,NULL,FALSE,TRUE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('landing','blocks','m2a','list-m2a',NULL,'related-values','{"template":"{{collection}}"}',FALSE,FALSE,NULL,'full',NULL,NULL,NULL,TRUE,NULL,NULL,NULL),
      ('landing_blocks','sort',NULL,NULL,NULL,NULL,NULL,FALSE,TRUE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL);

    INSERT INTO directus_relations(many_collection,many_field,one_collection,one_field,one_collection_field,one_allowed_collections,junction_field,sort_field,one_deselect_action)
    VALUES
      ('block_hero_slides','image','directus_files',NULL,NULL,NULL,NULL,NULL,'nullify'),
      ('block_hero_block_hero_slides','block_hero_id','block_hero','slides',NULL,NULL,'block_hero_slides_id','sort','delete'),
      ('block_hero_block_hero_slides','block_hero_slides_id','block_hero_slides',NULL,NULL,NULL,'block_hero_id',NULL,'nullify'),
      ('landing_blocks','item',NULL,NULL,'collection','block_hero','landing_lang',NULL,'nullify'),
      ('landing_blocks','landing_lang','landing','blocks',NULL,NULL,'item','sort','delete');

    INSERT INTO directus_permissions(collection,action,fields)
    VALUES
      ('block_hero','read','*'),
      ('block_hero_slides','read','*'),
      ('block_hero_block_hero_slides','read','*'),
      ('landing','read','*'),
      ('landing_blocks','read','*');
  `);
}

export async function down(knex) {
  await knex.raw(`
    DELETE FROM directus_permissions WHERE role IS NULL AND collection IN ('block_hero','block_hero_slides','block_hero_block_hero_slides','landing','landing_blocks');
    DELETE FROM directus_relations WHERE many_collection IN ('block_hero_slides','block_hero_block_hero_slides','landing_blocks');
    DELETE FROM directus_fields WHERE collection IN ('pages','blocks','block_hero','block_hero_slides','block_hero_block_hero_slides','landing','landing_blocks');
    DELETE FROM directus_collections WHERE collection IN ('pages','blocks','block_hero','block_hero_slides','block_hero_block_hero_slides','landing','landing_blocks');
    DROP TABLE IF EXISTS landing_blocks;
    DROP TABLE IF EXISTS landing;
    DROP TABLE IF EXISTS block_hero_block_hero_slides;
    DROP TABLE IF EXISTS block_hero_slides;
    DROP TABLE IF EXISTS block_hero;
  `);
}
