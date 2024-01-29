export type VectorTiles = {
  source: "vector_tiles";

  bounds: GeoJSON.Polygon;
  category: { category_name: string | null };
  default: boolean;
  geometry_type: string;
  layer_id: string;
  layer_name: string;
};

export type RasterTiles = {
  source: "raster_tiles";
  layer_name: string;

  bounds: GeoJSON.Polygon;
  category: { category_name: string | null };
  default: boolean;
  layer_alias: string;
  layer_id: string;
};

export type MapData = {
  data: {
    title: string;
    subtitle: string;
    information: string;
    initial_map_view: GeoJSON.Feature;
  };
};
