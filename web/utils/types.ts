export type VectorTiles = {
  layer_name: string;
  category: { category_name: string | null };
  geometry_type: string;
  bounds: GeoJSON.Polygon;
  default: boolean;
};
