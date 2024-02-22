import IcCircle from "~/assets/icons/ic-circle.svg";
import IcGlobe from "~/assets/icons/ic-globe.svg";
import Ic3d from "~/assets/icons/ic-3d.svg";
import IcMapLayerA from "~/assets/icons/ic-map-layer-a.svg";
import IcMapLayerB from "~/assets/icons/ic-map-layer-b.svg";
import IcMin from "~/assets/icons/ic-min.svg";
import IcPicture from "~/assets/icons/ic-picture.svg";
import IcDrawFree from "~/assets/icons/ic-draw-free.svg";

export const uncategorizedAlias = "Others";

export const geomTypeCircle = "Circle";
export const geomTypePolygon = "Polygon";
export const geomTypeLine = "Line";
export const geomTypeRaster = "Raster";
export const geomTypeThreeD = "3D";

export const layerTypeFilterOptions = [
  { type: "all", label: "All Format", checked: true, icon: IcMapLayerB },
  { type: geomTypeCircle, label: "Circle", checked: false, icon: IcCircle },
  { type: geomTypeLine, label: "Line", checked: false, icon: IcMin },
  { type: geomTypePolygon, label: "Polygon", checked: false, icon: IcDrawFree },
  { type: geomTypeRaster, label: "Raster", checked: false, icon: IcPicture },
];

export const dimensionFilterOptions = [
  { type: "all", label: "All Dimension", checked: true, icon: IcMapLayerA },
  { type: "2D", label: "2D", checked: false, icon: IcGlobe },
  { type: "3D", label: "3D", checked: false, icon: Ic3d },
];
