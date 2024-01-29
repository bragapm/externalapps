export type CircleStyles = {
  id: string;
  layout_visibility: "visible" | "none";
  name: string;
  paint_circle_blur: number;
  paint_circle_color: string;
  paint_circle_opacity: string;
  paint_circle_pitch_alignment: string;
  paint_circle_pitch_scale: string;
  paint_circle_radius: number;
  paint_circle_stroke_color: string;
  paint_circle_stroke_opacity: string;
  paint_circle_stroke_width: number;
};

export type VectorTiles = {
  source: "vector_tiles";

  bounds: GeoJSON.Polygon;
  category: { category_name: string | null };
  circle_style: null | CircleStyles;
  default: boolean;
  geometry_type: string;
  layer_id: string;
  layer_name: string;
  minzoom: number;
  maxzoom: number;
};

export type RasterTiles = {
  source: "raster_tiles";
  layer_name: string;

  bounds: GeoJSON.Polygon;
  category: { category_name: string | null };
  default: boolean;
  layer_alias: string;
  layer_id: string;
  minzoom: number;
  maxzoom: number;
};

export type MapData = {
  data: {
    title: string;
    subtitle: string;
    information: string;
    initial_map_view: GeoJSON.Feature;
  };
};
