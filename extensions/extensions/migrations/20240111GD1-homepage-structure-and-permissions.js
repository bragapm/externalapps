import { PUBLIC_FOLDER_ID } from "./const/FOLDER_IDS.mjs";

export async function up(knex) {
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS block_info_accordion (
      id serial NOT NULL PRIMARY KEY,
      title character varying(255) NOT NULL,
      subtitle character varying(255) NOT NULL,
      body text NOT NULL
    );

    CREATE TABLE IF NOT EXISTS block_info_accordion_contents (
      id serial NOT NULL PRIMARY KEY,
      headline character varying(255) NOT NULL,
      body text NOT NULL,
      image uuid NOT NULL REFERENCES directus_files (id)
    );

    CREATE TABLE IF NOT EXISTS block_info_accordion_block_info_accordion_contents (
      id serial NOT NULL PRIMARY KEY,
      block_info_accordion_id integer REFERENCES block_info_accordion (id)
        ON DELETE CASCADE,
      block_info_accordion_contents_id integer REFERENCES block_info_accordion_contents (id)
        ON DELETE CASCADE,
      sort integer
    );

    CREATE TABLE IF NOT EXISTS block_info_slides (
      id serial NOT NULL PRIMARY KEY
    );

    CREATE TABLE IF NOT EXISTS block_info_slides_contents (
      id serial NOT NULL PRIMARY KEY,
      title character varying(255) NOT NULL,
      subtitle character varying(255) NOT NULL,
      body text NOT NULL,
      image uuid NOT NULL REFERENCES directus_files (id),
      button_text character varying(255),
      button_url text
    );

    CREATE TABLE IF NOT EXISTS block_info_slides_block_info_slides_contents (
      id serial NOT NULL PRIMARY KEY,
      block_info_slides_id integer REFERENCES block_info_slides (id)
        ON DELETE CASCADE,
      block_info_slides_contents_id integer REFERENCES block_info_slides_contents (id)
        ON DELETE CASCADE,
      sort integer
    );

    CREATE TABLE IF NOT EXISTS block_info_single (
      id serial NOT NULL PRIMARY KEY,
      variant character varying(255) NOT NULL,
      title character varying(255) NOT NULL,
      subtitle character varying(255) NOT NULL,
      body text NOT NULL,
      button_text character varying(255),
      button_url text,
      image uuid REFERENCES directus_files (id)
    );

    CREATE TABLE IF NOT EXISTS block_hero_single (
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

    CREATE TABLE IF NOT EXISTS block_hero_slides (
      id serial NOT NULL PRIMARY KEY
    );

    CREATE TABLE IF NOT EXISTS block_hero_slides_contents (
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

    CREATE TABLE IF NOT EXISTS block_hero_slides_block_hero_slides_contents (
      id serial NOT NULL PRIMARY KEY,
      block_hero_slides_id integer REFERENCES block_hero_slides (id)
        ON DELETE CASCADE,
      block_hero_slides_contents_id integer REFERENCES block_hero_slides_contents (id)
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
      ('home','home',FALSE,'#3399FF','pages'),
      ('blocks','folder',TRUE,'#3399FF','home'),
      ('home_blocks','import_export',TRUE,'#3399FF','home'),
      ('block_hero_slides',NULL,FALSE,'#3399FF','blocks'),
      ('block_hero_slides_contents',NULL,FALSE,'#3399FF','block_hero_slides'),
      ('block_hero_slides_block_hero_slides_contents','import_export',TRUE,'#3399FF','block_hero_slides'),
      ('block_hero_single',NULL,FALSE,'#3399FF','blocks'),
      ('block_info_single',NULL,FALSE,'#3399FF','blocks'),
      ('block_info_slides',NULL,FALSE,'#3399FF','blocks'),
      ('block_info_slides_contents',NULL,FALSE,'#3399FF','block_info_slides'),
      ('block_info_slides_block_info_slides_contents','import_export',TRUE,'#3399FF','block_info_slides'),
      ('block_info_accordion',NULL,FALSE,'#3399FF','blocks'),
      ('block_info_accordion_contents',NULL,FALSE,'#3399FF','block_info_accordion'),
      ('block_info_accordion_block_info_accordion_contents','import_export',TRUE,'#3399FF','block_info_accordion');

    INSERT INTO directus_fields(collection,field,special,interface,options,display,display_options,readonly,hidden,sort,width,translations,note,conditions,required,"group",validation,validation_message)
    VALUES
      ('home','lang',NULL,'input',NULL,NULL,NULL,FALSE,FALSE,NULL,'full',NULL,'ISO 639 Set 3 language code (https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes)',NULL,TRUE,NULL,NULL,NULL),
      ('home','blocks','m2a','list-m2a',NULL,'related-values','{"template":"{{collection}}"}',FALSE,FALSE,NULL,'full',NULL,NULL,NULL,TRUE,NULL,NULL,NULL),
      ('home_blocks','id',NULL,NULL,NULL,NULL,NULL,FALSE,TRUE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('home_blocks','home_lang',NULL,NULL,NULL,NULL,NULL,FALSE,TRUE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('home_blocks','item',NULL,NULL,NULL,NULL,NULL,FALSE,TRUE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('home_blocks','collection',NULL,NULL,NULL,NULL,NULL,FALSE,TRUE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('home_blocks','sort',NULL,NULL,NULL,NULL,NULL,FALSE,TRUE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('block_hero_slides','id',NULL,'input',NULL,NULL,NULL,TRUE,TRUE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('block_hero_slides','contents','m2m','list-m2m','{"template":"{{block_hero_slides_contents_id.title}}"}','related-values','{"template":"{{block_hero_slides_contents_id.title}}"}',FALSE,FALSE,NULL,'full',NULL,NULL,NULL,TRUE,NULL,NULL,NULL),
      ('block_hero_slides_contents','id',NULL,'input',NULL,NULL,NULL,TRUE,TRUE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('block_hero_slides_contents','title',NULL,'input',NULL,NULL,NULL,FALSE,FALSE,NULL,'full',NULL,NULL,NULL,TRUE,NULL,NULL,NULL),
      ('block_hero_slides_contents','subtitle',NULL,'input',NULL,NULL,NULL,FALSE,FALSE,NULL,'full',NULL,NULL,NULL,TRUE,NULL,NULL,NULL),
      ('block_hero_slides_contents','body',NULL,'input',NULL,NULL,NULL,FALSE,FALSE,NULL,'full',NULL,NULL,NULL,TRUE,NULL,NULL,NULL),
      ('block_hero_slides_contents','image','file','file-image','{"folder":"${PUBLIC_FOLDER_ID}"}',NULL,NULL,FALSE,FALSE,NULL,'full',NULL,NULL,NULL,TRUE,NULL,NULL,NULL),
      ('block_hero_slides_contents','primary_button_text',NULL,'input',NULL,NULL,NULL,FALSE,FALSE,NULL,'half',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('block_hero_slides_contents','primary_button_url',NULL,'input',NULL,NULL,NULL,FALSE,FALSE,NULL,'half',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('block_hero_slides_contents','secondary_button_text',NULL,'input',NULL,NULL,NULL,FALSE,FALSE,NULL,'half',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('block_hero_slides_contents','secondary_button_url',NULL,'input',NULL,NULL,NULL,FALSE,FALSE,NULL,'half',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('block_hero_slides_block_hero_slides_contents','id',NULL,NULL,NULL,NULL,NULL,FALSE,TRUE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('block_hero_slides_block_hero_slides_contents','sort',NULL,NULL,NULL,NULL,NULL,FALSE,TRUE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('block_hero_slides_block_hero_slides_contents','block_hero_slides_id',NULL,NULL,NULL,NULL,NULL,FALSE,TRUE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('block_hero_slides_block_hero_slides_contents','block_hero_slides_contents_id',NULL,NULL,NULL,NULL,NULL,FALSE,TRUE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('block_hero_single','id',NULL,'input',NULL,NULL,NULL,TRUE,TRUE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('block_hero_single','title',NULL,'input',NULL,NULL,NULL,FALSE,FALSE,NULL,'full',NULL,NULL,NULL,TRUE,NULL,NULL,NULL),
      ('block_hero_single','subtitle',NULL,'input',NULL,NULL,NULL,FALSE,FALSE,NULL,'full',NULL,NULL,NULL,TRUE,NULL,NULL,NULL),
      ('block_hero_single','body',NULL,'input',NULL,NULL,NULL,FALSE,FALSE,NULL,'full',NULL,NULL,NULL,TRUE,NULL,NULL,NULL),
      ('block_hero_single','image','file','file-image','{"folder":"${PUBLIC_FOLDER_ID}"}',NULL,NULL,FALSE,FALSE,NULL,'full',NULL,NULL,NULL,TRUE,NULL,NULL,NULL),
      ('block_hero_single','primary_button_text',NULL,'input',NULL,NULL,NULL,FALSE,FALSE,NULL,'half',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('block_hero_single','primary_button_url',NULL,'input',NULL,NULL,NULL,FALSE,FALSE,NULL,'half',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('block_hero_single','secondary_button_text',NULL,'input',NULL,NULL,NULL,FALSE,FALSE,NULL,'half',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('block_hero_single','secondary_button_url',NULL,'input',NULL,NULL,NULL,FALSE,FALSE,NULL,'half',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('block_info_single','id',NULL,'input',NULL,NULL,NULL,TRUE,TRUE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('block_info_single','variant',NULL,'select-dropdown','{"choices":[{"text":"Image at Bottom","value":"bottom"},{"text":"Image Side-by-Side","value":"side"}]}',NULL,NULL,FALSE,FALSE,NULL,'full',NULL,NULL,NULL,TRUE,NULL,NULL,NULL),
      ('block_info_single','title',NULL,'input',NULL,NULL,NULL,FALSE,FALSE,NULL,'full',NULL,NULL,NULL,TRUE,NULL,NULL,NULL),
      ('block_info_single','subtitle',NULL,'input',NULL,NULL,NULL,FALSE,FALSE,NULL,'full',NULL,NULL,NULL,TRUE,NULL,NULL,NULL),
      ('block_info_single','body',NULL,'input',NULL,NULL,NULL,FALSE,FALSE,NULL,'full',NULL,NULL,NULL,TRUE,NULL,NULL,NULL),
      ('block_info_single','button_text',NULL,'input',NULL,NULL,NULL,FALSE,FALSE,NULL,'half',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('block_info_single','button_url',NULL,'input',NULL,NULL,NULL,FALSE,FALSE,NULL,'half',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('block_info_single','image','file','file-image','{"folder":"${PUBLIC_FOLDER_ID}"}',NULL,NULL,FALSE,FALSE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('block_info_slides','id',NULL,'input',NULL,NULL,NULL,TRUE,TRUE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('block_info_slides','contents','m2m','list-m2m','{"template":"{{block_info_slides_contents_id.title}}"}','related-values','{"template":"{{block_info_slides_contents_id.title}}"}',FALSE,FALSE,NULL,'full',NULL,NULL,NULL,TRUE,NULL,NULL,NULL),
      ('block_info_slides_block_info_slides_contents','id',NULL,NULL,NULL,NULL,NULL,FALSE,TRUE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('block_info_slides_block_info_slides_contents','block_info_slides_id',NULL,NULL,NULL,NULL,NULL,FALSE,TRUE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('block_info_slides_block_info_slides_contents','block_info_slides_contents_id',NULL,NULL,NULL,NULL,NULL,FALSE,TRUE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('block_info_slides_block_info_slides_contents','sort',NULL,NULL,NULL,NULL,NULL,FALSE,TRUE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('block_info_slides_contents','id',NULL,'input',NULL,NULL,NULL,TRUE,TRUE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('block_info_slides_contents','title',NULL,'input',NULL,NULL,NULL,FALSE,FALSE,NULL,'full',NULL,NULL,NULL,TRUE,NULL,NULL,NULL),
      ('block_info_slides_contents','subtitle',NULL,'input',NULL,NULL,NULL,FALSE,FALSE,NULL,'full',NULL,NULL,NULL,TRUE,NULL,NULL,NULL),
      ('block_info_slides_contents','body',NULL,'input',NULL,NULL,NULL,FALSE,FALSE,NULL,'full',NULL,NULL,NULL,TRUE,NULL,NULL,NULL),
      ('block_info_slides_contents','image','file','file-image','{"folder":"${PUBLIC_FOLDER_ID}"}',NULL,NULL,FALSE,FALSE,NULL,'full',NULL,NULL,NULL,TRUE,NULL,NULL,NULL),
      ('block_info_slides_contents','button_text',NULL,'input',NULL,NULL,NULL,FALSE,FALSE,NULL,'half',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('block_info_slides_contents','button_url',NULL,'input',NULL,NULL,NULL,FALSE,FALSE,NULL,'half',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('block_info_accordion','id',NULL,'input',NULL,NULL,NULL,TRUE,TRUE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('block_info_accordion','title',NULL,'input',NULL,NULL,NULL,FALSE,FALSE,NULL,'full',NULL,NULL,NULL,TRUE,NULL,NULL,NULL),
      ('block_info_accordion','subtitle',NULL,'input',NULL,NULL,NULL,FALSE,FALSE,NULL,'full',NULL,NULL,NULL,TRUE,NULL,NULL,NULL),
      ('block_info_accordion','body',NULL,'input',NULL,NULL,NULL,FALSE,FALSE,NULL,'full',NULL,NULL,NULL,TRUE,NULL,NULL,NULL),
      ('block_info_accordion','contents','m2m','list-m2m','{"template":"{{block_info_accordion_contents_id.headline}}"}','related-values','{"template":"{{block_info_accordion_contents_id.headline}}"}',FALSE,FALSE,NULL,'full',NULL,NULL,NULL,TRUE,NULL,NULL,NULL),
      ('block_info_accordion_block_info_accordion_contents','id',NULL,NULL,NULL,NULL,NULL,FALSE,TRUE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('block_info_accordion_block_info_accordion_contents','block_info_accordion_id',NULL,NULL,NULL,NULL,NULL,FALSE,TRUE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('block_info_accordion_block_info_accordion_contents','block_info_accordion_contents_id',NULL,NULL,NULL,NULL,NULL,FALSE,TRUE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('block_info_accordion_block_info_accordion_contents','sort',NULL,NULL,NULL,NULL,NULL,FALSE,TRUE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('block_info_accordion_contents','id',NULL,'input',NULL,NULL,NULL,TRUE,TRUE,NULL,'full',NULL,NULL,NULL,FALSE,NULL,NULL,NULL),
      ('block_info_accordion_contents','headline',NULL,'input',NULL,NULL,NULL,FALSE,FALSE,NULL,'full',NULL,NULL,NULL,TRUE,NULL,NULL,NULL),
      ('block_info_accordion_contents','body',NULL,'input',NULL,NULL,NULL,FALSE,FALSE,NULL,'full',NULL,NULL,NULL,TRUE,NULL,NULL,NULL),
      ('block_info_accordion_contents','image','file','file-image','{"folder":"${PUBLIC_FOLDER_ID}"}',NULL,NULL,FALSE,FALSE,NULL,'full',NULL,NULL,NULL,TRUE,NULL,NULL,NULL);

    INSERT INTO directus_relations(many_collection,many_field,one_collection,one_field,one_collection_field,one_allowed_collections,junction_field,sort_field,one_deselect_action)
    VALUES
      ('block_hero_slides_contents','image','directus_files',NULL,NULL,NULL,NULL,NULL,'nullify'),
      ('block_hero_slides_block_hero_slides_contents','block_hero_slides_id','block_hero_slides','contents',NULL,NULL,'block_hero_slides_contents_id','sort','delete'),
      ('block_hero_slides_block_hero_slides_contents','block_hero_slides_contents_id','block_hero_slides_contents',NULL,NULL,NULL,'block_hero_slides_id',NULL,'nullify'),
      ('home_blocks','item',NULL,NULL,'collection','block_hero_slides,block_hero_single,block_info_single,block_info_slides,block_info_accordion','home_lang',NULL,'nullify'),
      ('home_blocks','home_lang','home','blocks',NULL,NULL,'item','sort','delete'),
      ('block_hero_single','image','directus_files',NULL,NULL,NULL,NULL,NULL,'nullify'),
      ('block_info_single','image','directus_files',NULL,NULL,NULL,NULL,NULL,'nullify'),
      ('block_info_slides_contents','image','directus_files',NULL,NULL,NULL,NULL,NULL,'nullify'),
      ('block_info_slides_block_info_slides_contents','block_info_slides_id','block_info_slides','contents',NULL,NULL,'block_info_slides_contents_id','sort','delete'),
      ('block_info_slides_block_info_slides_contents','block_info_slides_contents_id','block_info_slides_contents',NULL,NULL,NULL,'block_info_slides_id',NULL,'nullify'),
      ('block_info_accordion_contents','image','directus_files',NULL,NULL,NULL,NULL,NULL,'nullify'),
      ('block_info_accordion_block_info_accordion_contents','block_info_accordion_contents_id','block_info_accordion_contents',NULL,NULL,NULL,'block_info_accordion_id',NULL,'nullify'),
      ('block_info_accordion_block_info_accordion_contents','block_info_accordion_id','block_info_accordion','contents',NULL,NULL,'block_info_accordion_contents_id','sort','delete');

    INSERT INTO directus_permissions(collection,action,fields)
    VALUES
      ('block_hero_slides','read','*'),
      ('block_hero_slides_contents','read','*'),
      ('block_hero_slides_block_hero_slides_contents','read','*'),
      ('home','read','*'),
      ('home_blocks','read','*'),
      ('block_hero_single','read','*'),
      ('block_info_single','read','*'),
      ('block_info_slides','read','*'),
      ('block_info_slides_contents','read','*'),
      ('block_info_slides_block_info_slides_contents','read','*'),
      ('block_info_accordion','read','*'),
      ('block_info_accordion_contents','read','*'),
      ('block_info_accordion_block_info_slides_contents','read','*');
  `);
}

export async function down(knex) {
  await knex.raw(`
    DELETE FROM directus_permissions WHERE role IS NULL AND collection IN ('block_hero_slides','block_hero_slides_contents','block_hero_slides_block_hero_slides_contents','home','home_blocks','block_hero_single','block_info_single','block_info_slides','block_info_slides_contents','block_info_slides_block_info_slides_contents','block_info_accordion','block_info_accordion_contents','block_info_accordion_block_info_accordion_contents');
    DELETE FROM directus_relations WHERE many_collection IN ('block_hero_slides_contents','block_hero_slides_block_hero_slides_contents','home_blocks','block_hero_single','block_info_single','block_info_slides_contents','block_info_slides_block_info_slides_contents','block_info_accordion_contents','block_info_accordion_block_info_accordion_contents');
    DELETE FROM directus_fields WHERE collection IN ('pages','blocks','block_hero_slides','block_hero_slides_contents','block_hero_slides_block_hero_slides_contents','home','home_blocks','block_hero_single','block_info_single','block_info_slides','block_info_slides_contents','block_info_slides_block_info_slides_contents','block_info_accordion','block_info_accordion_contents','block_info_accordion_block_info_accordion_contents');
    DELETE FROM directus_collections WHERE collection IN ('pages','blocks','block_hero_slides','block_hero_slides_contents','block_hero_slides_block_hero_slides_contents','home','home_blocks','block_hero_single','block_info_single','block_info_slides','block_info_slides_contents','block_info_slides_block_info_slides_contents','block_info_accordion','block_info_accordion_contents','block_info_accordion_block_info_accordion_contents');
    DROP TABLE IF EXISTS home_blocks;
    DROP TABLE IF EXISTS home;
    DROP TABLE IF EXISTS block_hero_slides_block_hero_slides_contents;
    DROP TABLE IF EXISTS block_hero_slides_contents;
    DROP TABLE IF EXISTS block_hero_slides;
    DROP TABLE IF EXISTS block_hero_single;
    DROP TABLE IF EXISTS block_info_single;
    DROP TABLE IF EXISTS block_info_slides_block_info_slides_contents;
    DROP TABLE IF EXISTS block_info_slides_contents;
    DROP TABLE IF EXISTS block_info_slides;
    DROP TABLE IF EXISTS block_info_accordion_block_info_accordion_contents;
    DROP TABLE IF EXISTS block_info_accordion_contents;
    DROP TABLE IF EXISTS block_info_accordion;
  `);
}
