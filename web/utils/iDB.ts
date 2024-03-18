import Dexie from "dexie";
import type { Table } from "dexie";

import type { LoadedGeoJson } from "./types";

interface LoadedGeoJsonData extends LoadedGeoJson {
  data: GeoJSON.GeoJSON;
}

class TypedDexie extends Dexie {
  loadedGeoJsonData!: Table<LoadedGeoJsonData>;

  constructor() {
    super("geodashboard");
    this.version(1).stores({
      loadedGeoJsonData: "layer_id",
    });
  }
}

const iDB = new TypedDexie();

export default iDB;
