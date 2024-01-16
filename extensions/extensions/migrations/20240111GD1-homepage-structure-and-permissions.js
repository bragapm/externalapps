export async function up(knex) {
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS block_hero (
      id serial NOT NULL PRIMARY KEY
    );

    CREATE TABLE IF NOT EXISTS block_hero_slides (
      id serial NOT NULL PRIMARY KEY,
      title character varying(255) NOT NULL,
      subtitle character varying(255) NOT NULL,
      body text NOT NULL,
      image uuid NOT NULL REFERENCES directus_files (id),
      primary_button_text character varying(255),
      primary_button_url text,
      secondary_button_text character varying(255),
      secondary_button_url text
    );

    CREATE TABLE IF NOT EXISTS block_hero_block_hero_slides (
      id serial NOT NULL PRIMARY KEY,
      block_hero_id integer REFERENCES block_hero (id)
        ON DELETE CASCADE,
      block_hero_slides_id integer REFERENCES block_hero_slides (id)
        ON DELETE CASCADE,
      sort integer
    );

    CREATE TABLE IF NOT EXISTS home (
      lang character varying(3) NOT NULL PRIMARY KEY
    );

    CREATE TABLE IF NOT EXISTS home_blocks (
      id serial NOT NULL PRIMARY KEY,
      home_lang character varying(3) REFERENCES home (lang)
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
      ('block_hero_block_hero_slides','import_export',TRUE,'#3399FF','blocks'),
      ('home','home',FALSE,'#3399FF','pages'),
      ('home_blocks','import_export',TRUE,'#3399FF','home');

    INSERT INTO directus_fields(collection,field,special,interface,options,display,display_options,readonly,hidden,sort,width,translations,note,conditions,required,"group",validation,validation_message)
    VALUES
      ('home','lang',NULL,'input',NULL,NULL,NULL,FALSE,FALSE,NULL,'full',NULL,'ISO 639 Set 3 language code (https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes)',NULL,TRUE,NULL,NULL,NULL),
      ('home_blocks','id',NULL,NULL,NULL,NULL,NULL,FALSE,TRUE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('home_blocks','home_lang',NULL,NULL,NULL,NULL,NULL,FALSE,TRUE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('home_blocks','item',NULL,NULL,NULL,NULL,NULL,FALSE,TRUE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('home_blocks','collection',NULL,NULL,NULL,NULL,NULL,FALSE,TRUE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
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
      ('block_hero_block_hero_slides','id',NULL,NULL,NULL,NULL,NULL,FALSE,TRUE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('block_hero_block_hero_slides','sort',NULL,NULL,NULL,NULL,NULL,FALSE,TRUE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('block_hero_block_hero_slides','block_hero_slides_id',NULL,NULL,NULL,NULL,NULL,FALSE,TRUE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('block_hero_block_hero_slides','block_hero_id',NULL,NULL,NULL,NULL,NULL,FALSE,TRUE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('home','blocks','m2a','list-m2a',NULL,'related-values','{"template":"{{collection}}"}',FALSE,FALSE,NULL,'full',NULL,NULL,NULL,TRUE,NULL,NULL,NULL),
      ('home_blocks','sort',NULL,NULL,NULL,NULL,NULL,FALSE,TRUE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL);

    INSERT INTO directus_relations(many_collection,many_field,one_collection,one_field,one_collection_field,one_allowed_collections,junction_field,sort_field,one_deselect_action)
    VALUES
      ('block_hero_slides','image','directus_files',NULL,NULL,NULL,NULL,NULL,'nullify'),
      ('block_hero_block_hero_slides','block_hero_id','block_hero','slides',NULL,NULL,'block_hero_slides_id','sort','delete'),
      ('block_hero_block_hero_slides','block_hero_slides_id','block_hero_slides',NULL,NULL,NULL,'block_hero_id',NULL,'nullify'),
      ('home_blocks','item',NULL,NULL,'collection','block_hero','home_lang',NULL,'nullify'),
      ('home_blocks','home_lang','home','blocks',NULL,NULL,'item','sort','delete');

    INSERT INTO directus_permissions(collection,action,fields)
    VALUES
      ('block_hero','read','*'),
      ('block_hero_slides','read','*'),
      ('block_hero_block_hero_slides','read','*'),
      ('home','read','*'),
      ('home_blocks','read','*');
  `);
}

export async function down(knex) {
  await knex.raw(`
    DELETE FROM directus_permissions WHERE role IS NULL AND collection IN ('block_hero','block_hero_slides','block_hero_block_hero_slides','home','home_blocks');
    DELETE FROM directus_relations WHERE many_collection IN ('block_hero_slides','block_hero_block_hero_slides','home_blocks');
    DELETE FROM directus_fields WHERE collection IN ('pages','blocks','block_hero','block_hero_slides','block_hero_block_hero_slides','home','home_blocks');
    DELETE FROM directus_collections WHERE collection IN ('pages','blocks','block_hero','block_hero_slides','block_hero_block_hero_slides','home','home_blocks');
    DROP TABLE IF EXISTS home_blocks;
    DROP TABLE IF EXISTS home;
    DROP TABLE IF EXISTS block_hero_block_hero_slides;
    DROP TABLE IF EXISTS block_hero_slides;
    DROP TABLE IF EXISTS block_hero;
  `);
}
