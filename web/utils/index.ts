import type { GeoJSONSource, Map } from "maplibre-gl";
import type { MapData, GeneralSettings } from "./types";
import type { Raw } from "vue";
import tailwindConfig from "~/tailwind.config";

export const useMapData = async () => {
  const { pending, data } = await useFetch<MapData>("/panel/items/map/eng", {
    key: "map",
  });
  return { data, isLoading: pending };
};

export const useGeneralSettings = async () => {
  const { pending, data } = await useFetch<GeneralSettings>("/panel/settings", {
    key: "settings",
  });
  return { data, isLoading: pending };
};

export const moveHighlightLayer = (map: Map, layerName: string) => {
  // Find the layer that comes after 'targetLayer', if it exists
  const layers = map.getStyle().layers;
  let targetIndex = layers.findIndex((layer) => layer.id === layerName);
  let layerAboveTarget;
  if (targetIndex !== -1 && targetIndex < layers.length - 1) {
    layerAboveTarget = layers[targetIndex + 1].id;
  }

  map.moveLayer("highlight-point-pulsing", layerAboveTarget);
  map.moveLayer("highlight-line-background", layerAboveTarget);
  map.moveLayer("highlight-line-dashed", layerAboveTarget);
  map.moveLayer("highlight-fill-background", layerAboveTarget);
  map.moveLayer("highlight-fill-outline", layerAboveTarget);
};

export const showHighlightLayer = (
  map: Raw<Map>,
  featureList: { geom: GeoJSON.Geometry }[],
  layerName: string
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
  // console.log(featureList[0].geom.type);

  if (map.getSource("highlight")) {
    (map.getSource("highlight") as GeoJSONSource).setData(newData);
  } else {
    map.addSource("highlight", {
      type: "geojson",
      data: newData,
    });

    map.addLayer({
      type: "symbol",
      source: "highlight",
      id: "highlight-point-pulsing",
      layout: {
        "icon-image": "pulsing-dot",
      },
      filter: ["==", "$type", "Point"],
    });

    map.addLayer({
      type: "line",
      source: "highlight",
      id: "highlight-line-background",
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": (tailwindConfig.theme?.colors as any).brand["500"],
        "line-width": 6,
        "line-opacity": 0.9,
      },
      filter: ["==", "$type", "LineString"],
    });

    // technique based on https://jsfiddle.net/2mws8y3q/
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

    map.addLayer({
      type: "line",
      source: "highlight",
      id: "highlight-line-dashed",
      layout: { "line-join": "round" },
      paint: {
        "line-color": (tailwindConfig.theme?.colors as any).brand["50"],
        "line-width": 6,
        "line-dasharray": dashArraySequence[0],
      },
      filter: ["==", "$type", "LineString"],
    });

    function animateDashArray(timestamp: DOMHighResTimeStamp) {
      // Update line-dasharray using the next value in dashArraySequence. The
      // divisor in the expression `timestamp / 50` controls the animation speed.
      const newStep = parseInt(
        ((timestamp / 60) % dashArraySequence.length).toString()
      );

      if (newStep !== step) {
        map.setPaintProperty(
          "highlight-line-dashed",
          "line-dasharray",
          dashArraySequence[step]
        );
        step = newStep;
      }

      // Request the next frame of the animation.
      requestAnimationFrame(animateDashArray);
    }
    animateDashArray(0);

    map.addLayer({
      type: "fill",
      source: "highlight",
      id: "highlight-fill-background",
      paint: {
        "fill-color": (tailwindConfig.theme?.colors as any).brand["600"],
        "fill-opacity": 0.6,
        "fill-opacity-transition": {
          duration: 900,
          delay: 0,
        },
      } as any,
      filter: ["==", "$type", "Polygon"],
    });

    setInterval(() => {
      const prevVal = map.getPaintProperty(
        "highlight-fill-background",
        "fill-opacity"
      );
      if (prevVal === 0.6)
        map.setPaintProperty("highlight-fill-background", "fill-opacity", 0);
      else
        map.setPaintProperty("highlight-fill-background", "fill-opacity", 0.6);
    }, 900);

    map.addLayer({
      type: "line",
      source: "highlight",
      id: "highlight-fill-outline",
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": (tailwindConfig.theme?.colors as any).brand["300"],
        "line-width": 6,
        "line-opacity": 0.9,
      },
      filter: ["==", "$type", "Polygon"],
    });
  }

  moveHighlightLayer(map, layerName);
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
    context!.strokeStyle = (tailwindConfig.theme?.colors as any).brand["200"];
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

export const capitalizeEachWords = (text: string) => {
  const splitText = text.split("_");

  for (let i = 0; i < splitText.length; i++) {
    if (splitText[i]) {
      splitText[i] = splitText[i][0].toUpperCase() + splitText[i].substring(1);
    } else {
      splitText[i] = "";
    }
  }

  return splitText.join(" ");
};
