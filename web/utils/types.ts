import type {
  geomTypeCircle,
  geomTypeLine,
  geomTypePolygon,
} from "~/constants";

export type CircleStyles = {
  layout_visibility?: string;
  layout_circle_sort_key?: number;
  paint_circle_blur?: number;
  paint_circle_color?: string;
  paint_circle_opacity?: string;
  paint_circle_pitch_alignment?: string;
  paint_circle_pitch_scale?: string;
  paint_circle_radius?: number;
  paint_circle_stroke_color?: string;
  paint_circle_stroke_opacity?: string;
  paint_circle_stroke_width?: number;
};

export interface CircleStylesConfig extends CircleStyles {
  id: string;
  name: string;
}

export type SymbolStyles = {
  layout_icon_allow_overlap?: boolean;
  layout_icon_anchor?:
    | "center"
    | "left"
    | "right"
    | "top"
    | "bottom"
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right";
  layout_icon_ignore_placement?: boolean;
  layout_icon_image?: string;
  icon_image_title?: string;
  layout_icon_keep_upright?: boolean;
  layout_icon_offset?: number[];
  layout_icon_optional?: boolean;
  layout_icon_overlap?: "never" | "always" | "cooperative";
  layout_icon_padding?: number[];
  layout_icon_pitch_alignment?: "map" | "viewport" | "auto";
  layout_icon_rotate?: number;
  layout_icon_rotation_alignment?: "map" | "viewport" | "auto";
  layout_icon_size?: number;
  layout_icon_text_fit?: "none" | "width" | "height" | "both";
  layout_icon_text_fit_padding?: number[];
  layout_symbol_avoid_edges?: boolean;
  layout_symbol_placement?: "point" | "line" | "line-center";
  layout_symbol_sort_key?: number;
  layout_symbol_spacing?: number;
  layout_symbol_z_order?: "auto" | "viewport-y" | "source";
  layout_text_allow_overlap?: boolean;
  layout_text_anchor?:
    | "center"
    | "left"
    | "right"
    | "top"
    | "bottom"
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right";
  layout_text_field?: any;
  layout_text_font?: string[];
  layout_text_ignore_placement?: boolean;
  layout_text_justify?: "auto" | "left" | "center" | "right";
  layout_text_keep_upright?: boolean;
  layout_text_letter_spacing?: number;
  layout_text_line_height?: number;
  layout_text_max_angle?: number;
  layout_text_max_width?: number;
  layout_text_offset?: number[];
  layout_text_optional?: boolean;
  layout_text_overlap?: "never" | "always" | "cooperative";
  layout_text_padding?: number;
  layout_text_pitch_alignment?: "map" | "viewport" | "auto";
  layout_text_radial_offset?: number;
  layout_text_rotate?: number;
  layout_text_rotation_alignment?:
    | "map"
    | "viewport"
    | "viewport-glyph"
    | "auto";
  layout_text_size?: number;
  layout_text_transform?: "none" | "uppercase" | "lowercase";
  layout_text_variable_anchor?:
    | "center"
    | "left"
    | "right"
    | "top"
    | "bottom"
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right";
  layout_text_variable_anchor_offset?: any[];
  layout_text_writing_mode?: "horizontal" | "vertical";
  layout_visibility?: "visible" | "none";
  paint_icon_color?: string;
  paint_icon_halo_blur?: number;
  paint_icon_halo_color?: string;
  paint_icon_halo_width?: number;
  paint_icon_opacity?: string;
  paint_icon_translate?: number[];
  paint_icon_translate_anchor?: "map" | "viewport";
  paint_text_color?: string;
  paint_text_halo_blur?: number;
  paint_text_halo_color?: string;
  paint_text_halo_width?: number;
  paint_text_opacity?: string;
  paint_text_translate?: number[];
  paint_text_translate_anchor?: "map" | "viewport";
};

export interface SymbolStylesConfig extends SymbolStyles {
  id: string;
  name: string;
}

export type FillStyles = {
  layout_visibility?: string;
  layout_circle_sort_key?: number;
  paint_fill_antialias?: boolean;
  paint_fill_color?: string;
  paint_fill_opacity?: string;
  paint_fill_outline_color?: string;
  paint_fill_pattern?: string;
  paint_fill_translate?: string;
  paint_fill_translate_anchor?: string;
};

export interface FillStylesConfig extends FillStyles {
  id: string;
  name: string;
}

export type LineStyles = {
  layout_visibility?: string;
  layout_line_cap?: string;
  layout_line_join?: string;
  layout_line_miter_limit?: number;
  layout_line_round_limit?: number;
  layout_line_sort_key?: number;
  paint_line_blur?: number;
  paint_line_color?: string;
  paint_line_dasharray?: string;
  paint_line_gap_width?: number;
  paint_line_gradient?: string;
  paint_line_offset?: number;
  paint_line_pattern?: string;
  paint_line_translate?: string;
  paint_line_translate_anchor?: string;
  paint_line_width?: number;
  paint_line_opacity?: string;
};

export interface LineStylesConfig extends LineStyles {
  id: string;
  name: string;
}

export type RasterStyles = { layout_visibility: string };

export type VectorTiles = {
  source: "vector_tiles";
  bounds: GeoJSON.Polygon;
  category?: { category_name?: string };
  layer_style: CircleStyles | FillStyles | LineStyles | SymbolStyles;
  geometry_type: string;
  layer_alias?: string;
  layer_id: string;
  layer_name: string;
  minzoom?: number;
  maxzoom?: number;
  click_popup_columns?: string[];
  image_columns?: string[];
  feature_detail_columns?: string[];
  dimension: string;
};

export type VectorTilesConfig = {
  layer_id: string;
  layer_name: string;
  bounds: GeoJSON.Polygon;
  geometry_type: string;
  category?: { category_name?: string };
  circle_style?: CircleStylesConfig;
  symbol_style?: SymbolStylesConfig;
  fill_style?: FillStylesConfig;
  line_style?: LineStylesConfig;
  layer_alias?: string;
  minzoom?: number;
  maxzoom?: number;
  click_popup_columns?: string[];
  image_columns?: string[];
  feature_detail_columns?: string[];
};

export type RasterTiles = {
  source: "raster_tiles";
  opacity: number;
  layer_style: RasterStyles;
  bounds: GeoJSON.Polygon;
  category?: { category_name?: string };
  geometry_type: string;
  layer_alias: string;
  layer_id: string;
  minzoom: number;
  maxzoom: number;
  terrain_rgb: boolean;
  dimension: string;
};

export type RasterTilesConfig = {
  layer_id: string;
  bounds: GeoJSON.Polygon;
  minzoom: number;
  maxzoom: number;
  terrain_rgb: boolean;
  layer_alias: string;
  active: boolean;
  category?: { category_name?: string };
};

export type ThreeDTiles = {
  source: "three_d_tiles";
  opacity: number;
  layer_style: { layout_visibility: string };
  geometry_type: string;
  layer_alias: string;
  layer_id: string;
  category: { category_name: string };
  dimension: string;
};

export type ThreeDTilesConfig = {
  active: boolean;
  layer_alias: string;
  layer_id: string;
  opacity: number;
  visible: boolean;
};

export type LayerConfigLists = (
  | VectorTilesConfig
  | RasterTilesConfig
  | ThreeDTilesConfig
)[];

export type LoadedGeoJson = {
  source: "loaded_geojson";
  layer_id: string;
  layer_alias: string;
  layer_style: CircleStyles | FillStyles | LineStyles;
  bounds: GeoJSON.Polygon;
  category: { category_name: string | null };
  geometry_type:
    | typeof geomTypeCircle
    | typeof geomTypeLine
    | typeof geomTypePolygon;
  dimension: "2D";
};

export type LayerLists = (
  | VectorTiles
  | RasterTiles
  | ThreeDTiles
  | LoadedGeoJson
)[];

export type LayerGroupedByCategory = {
  label: string;
  layerLists: LayerLists;
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

export type GeneralSettings = {
  data: {
    help_center_url?: string;
    project_descriptor?: string;
    project_logo_horizontal?: string;
    project_name: string;
    public_favicon?: string;
    public_background?: string;
    basemaps?: { name: string; type: string; url: string; tileSize?: number }[];
  };
};

export type AuthPayload = {
  access_token: string;
  refresh_token: string;
  expires: number;
};
