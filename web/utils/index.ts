import type {
  GeoJSONSource,
  LngLatBoundsLike,
  LngLatLike,
  Map,
} from "maplibre-gl";
import type { MapData } from "./types";
import type { Raw } from "vue";
import bbox from "@turf/bbox";
import tailwindConfig from "~/tailwind.config";

export const useMapData = async () => {
  const { pending, data } = await useFetch<MapData>("/panel/items/map/eng", {
    key: "map",
  });
  return { data, isLoading: pending };
};

export const showHighlightLayer = (
  map: Raw<Map>,
  featureList: { geom: GeoJSON.Geometry }[]
) => {
  const newData: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: featureList
      .filter((_, idx) => idx === 0)
      .map(({ geom, ...rest }) => ({
        type: "Feature",
        properties: rest,
        geometry: geom,
      })),
  };
  console.log(featureList[0].geom.type);

  if (featureList[0].geom.type !== "Point") {
    map?.fitBounds(bbox(newData) as LngLatBoundsLike, { padding: 60 });
  } else {
    map?.flyTo({
      zoom: 15,
      center: featureList[0].geom.coordinates as LngLatLike,
    });
  }
  if (map.getSource("highlight")) {
    (map.getSource("highlight") as GeoJSONSource).setData(newData);
  } else {
    map.addSource("highlight", {
      type: "geojson",
      data: newData,
    });

    map.addLayer({
      id: "pulsing-dot",
      type: "symbol",
      source: "highlight",
      layout: {
        "icon-image": "pulsing-dot",
      },
      filter: ["==", "$type", "Point"],
    });

    // add a line layer without line-dasharray defined to fill the gaps in the dashed line
    map.addLayer({
      type: "line",
      source: "highlight",
      id: "line-background",
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": (tailwindConfig.theme?.colors as any).brand["500"],
        "line-width": 6,
        "line-opacity": 0.9,
      },
      filter: ["!=", "$type", "Point"],
      // filter: ["==", "$type", "LineString"],
    });

    // add a line layer with line-dasharray set to the first value in dashArraySequence
    map.addLayer({
      type: "line",
      source: "highlight",
      id: "line-dashed",
      layout: { "line-join": "round" },
      paint: {
        "line-color": (tailwindConfig.theme?.colors as any).brand["50"],
        "line-width": 6,
        "line-dasharray": [0, 4, 3],
      },
      filter: ["!=", "$type", "Point"],
      // filter: ["==", "$type", "LineString"],
    });

    // technique based on https://jsfiddle.net/2mws8y3q/
    // an array of valid line-dasharray values, specifying the lengths of the alternating dashes and gaps that form the dash pattern
    const dashArraySequence = [
      [0, 4, 3],
      [0.5, 4, 2.5],
      [1, 4, 2],
      [1.5, 4, 1.5],
      [2, 4, 1],
      [2.5, 4, 0.5],
      [3, 4, 0],
      [0, 0.5, 3, 3.5],
      [0, 1, 3, 3],
      [0, 1.5, 3, 2.5],
      [0, 2, 3, 2],
      [0, 2.5, 3, 1.5],
      [0, 3, 3, 1],
      [0, 3.5, 3, 0.5],
    ];

    let step = 0;

    function animateDashArray(timestamp: DOMHighResTimeStamp) {
      // Update line-dasharray using the next value in dashArraySequence. The
      // divisor in the expression `timestamp / 50` controls the animation speed.
      const newStep = parseInt(
        ((timestamp / 60) % dashArraySequence.length).toString()
      );

      if (newStep !== step) {
        map.setPaintProperty(
          "line-dashed",
          "line-dasharray",
          dashArraySequence[step]
        );
        step = newStep;
      }

      // Request the next frame of the animation.
      requestAnimationFrame(animateDashArray);
    }

    // start the animation
    animateDashArray(0);
  }
};

export const createPulsingDot = (map: Map, size: number) => ({
  width: size,
  height: size,
  data: new Uint8Array(size * size * 4),
  context: null as CanvasRenderingContext2D | null,

  // When the layer is added to the map,
  // get the rendering context for the map canvas.
  onAdd: function () {
    const canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height;
    this.context = canvas.getContext("2d");
  },

  // Call once before every frame where the icon will be used.
  render: function () {
    const duration = 1000;
    const t = (performance.now() % duration) / duration;

    const radius = (size / 2) * 0.3;
    const outerRadius = (size / 2) * 0.7 * t + radius;
    const context = this.context;

    // Draw the outer circle.
    context!.clearRect(0, 0, this.width, this.height);
    context!.beginPath();
    context!.arc(this.width / 2, this.height / 2, outerRadius, 0, Math.PI * 2);
    context!.fillStyle = `rgba(255, 200, 200, ${1 - t})`;
    context!.fill();

    // Draw the inner circle.
    context!.beginPath();
    context!.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
    // context!.fillStyle = "rgba(255, 100, 100, 1)";
    context!.strokeStyle = "white";
    context!.lineWidth = 2 + 4 * (1 - t);
    context!.fill();
    context!.stroke();

    // Update this image's data with data from the canvas.
    this.data = context!.getImageData(0, 0, this.width, this.height)
      .data as any;

    // Continuously repaint the map, resulting
    // in the smooth animation of the dot.
    map.triggerRepaint();

    // Return `true` to let the map know that the image was updated.
    return true;
  },
});
