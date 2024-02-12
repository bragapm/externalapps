export type CircleStyles = {
  id: string;
  layout_visibility: string;
  layout_circle_sort_key: number;
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

export type FillStyles = {
  id: string;
  layout_visibility: string;
  layout_circle_sort_key: number;
  name: string;
  paint_fill_antialias: boolean;
  paint_fill_color: string;
  paint_fill_opacity: string;
  paint_fill_outline_color: string;
  paint_fill_pattern: string;
  paint_fill_translate: string;
  paint_fill_translate_anchor: string;
};

export type LineStyles = {
  id: string;
  layout_visibility: string;
  layout_line_cap: string;
  layout_line_join: string;
  layout_line_miter_limit: number;
  layout_line_round_limit: number;
  layout_line_sort_key: number;
  name: string;
  paint_line_blur: number;
  paint_line_color: string;
  paint_line_dasharray: string;
  paint_line_gap_width: number;
  paint_line_gradient: string;
  paint_line_offset: number;
  paint_line_pattern: string;
  paint_line_translate: string;
  paint_line_translate_anchor: string;
  paint_line_width: number;
  paint_line_opacity: string;
};

export type VectorTiles = {
  source: "vector_tiles";
  bounds: GeoJSON.Polygon;
  category: { category_name: string | null };
  circle_style: null | CircleStyles;
  fill_style: null | FillStyles;
  line_style: null | LineStyles;
  layer_style: CircleStyles | FillStyles | LineStyles;
  geometry_type: string;
  layer_alias: string;
  layer_id: string;
  layer_name: string;
  minzoom: number;
  maxzoom: number;
  click_popup_columns?: string[];
  image_columns?: string[];
  feature_detail_columns?: string[];
};

export type RasterTiles = {
  source: "raster_tiles";
  opacity: number;
  bounds: GeoJSON.Polygon;
  category: { category_name: string | null };
  default: boolean;
  layer_alias: string;
  layer_id: string;
  minzoom: number;
  maxzoom: number;
  terrain_rgb: boolean;
  click_popup_columns?: string[];
  image_columns?: string[];
  feature_detail_columns?: string[];
};

export type LayerGroupedByCategory = {
  label: string;
  layerLists: (VectorTiles | RasterTiles)[];
  defaultOpen: boolean;
};

export type Attachment = {
  title: string;
  description: string;
  url: string;
  icon: "link" | "form";
};

export type MapData = {
  data: {
    title: string;
    subtitle: string;
    information: string;
    initial_map_view: GeoJSON.Feature;
    information_attachments?: Attachment[];
  };
};
