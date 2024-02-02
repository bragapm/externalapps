import { PUBLIC_FOLDER_ID } from "./const/FOLDER_IDS.mjs";

export async function up(knex) {
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS public."map" (
      lang varchar(255) NOT NULL PRIMARY KEY,
      user_updated uuid REFERENCES directus_users (id),
      date_updated timestamptz,
      information text,
      title varchar(255),
      subtitle varchar(255),
      initial_map_view json
    );

    INSERT INTO directus_collections(collection,icon,hidden,color,"group")
    VALUES ('map','map',FALSE,'#3399FF','pages');

    INSERT INTO public.directus_fields (collection,field,special,interface,"options",display,display_options,readonly,hidden,sort,width,translations,note,conditions,required,"group",validation,validation_message) 
    VALUES ('map','subtitle',NULL,'input',NULL,NULL,NULL,false,false,6,'full',NULL,NULL,NULL,false,NULL,NULL,NULL),
      ('map','lang',NULL,'input',NULL,NULL,NULL,false,false,1,'full',NULL,NULL,NULL,false,NULL,NULL,NULL),
      ('map','user_updated','user-updated','select-dropdown-m2o','{"template":"{{avatar.$thumbnail}} {{first_name}} {{last_name}}"}','user',NULL,true,true,2,'half',NULL,NULL,NULL,false,NULL,NULL,NULL),
      ('map','date_updated','date-updated','datetime',NULL,'datetime','{"relative":true}',true,true,3,'half',NULL,NULL,NULL,false,NULL,NULL,NULL),
      ('map','information',NULL,'input-rich-text-md','{"folder":"${PUBLIC_FOLDER_ID}"}',NULL,NULL,false,false,4,'full',NULL,NULL,NULL,false,NULL,NULL,NULL),
      ('map','title',NULL,'input',NULL,NULL,NULL,false,false,5,'full',NULL,NULL,NULL,false,NULL,NULL,NULL),
      ('map','initial_map_view','cast-json','map','{"defaultView":{"center":{"lng":118.10483551162508,"lat":-0.9964696394390842},"zoom":3.356805567596401,"bearing":0,"pitch":0},"geometryType":"Point"}',NULL,NULL,false,false,7,'full',NULL,NULL,NULL,false,NULL,NULL,NULL);

    INSERT INTO directus_permissions(collection,action,fields) VALUES ('map','read','*');
  `);
}

export async function down(knex) {
  await knex.raw(`
  -- Remove permissions related to the 'map' collection
  DELETE FROM directus_permissions WHERE collection = 'map';
  
  -- Remove field definitions related to the 'map' collection
  DELETE FROM directus_fields WHERE collection = 'map';
  
  -- Remove the 'map' collection entry
  DELETE FROM directus_collections WHERE collection = 'map';
  
  -- Drop the 'map' table, automatically removing the foreign key constraint
  DROP TABLE IF EXISTS public."map";
  `);
}
