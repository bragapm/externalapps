import MapboxDraw, {
  type DrawCreateEvent,
  type DrawUpdateEvent,
} from "@mapbox/mapbox-gl-draw";
import type { Feature, GeoJsonProperties, Geometry } from "geojson";
import type { Raw } from "vue";
import glDrawStyles from "~/constants/glDrawStyles";

type DrawControl = {
  mode: string;
  onCreated?: (feature: Feature<Geometry, GeoJsonProperties>) => void;
  onUpdated?: (feature: Feature<Geometry, GeoJsonProperties>) => void;
};

export const useDrawControl = ({ mode, onCreated, onUpdated }: DrawControl) => {
  const drawer = shallowRef<null | Raw<MapboxDraw>>(null);
  const mapRefStore = useMapRef();

  const onCreate = (e: DrawCreateEvent) => {
    onCreated && onCreated(e.features?.[0]);
  };
  const onUpdate = (e: DrawUpdateEvent) => {
    onUpdated && onUpdated(e.features?.[0]);
  };
  const onDelete = () => {
    console.log("delete");
  };

  const mapCanvas = mapRefStore.map?.getCanvas();
  watchEffect((onCleanup) => {
    if (!mapRefStore.map) return;
    mapCanvas!.style.cursor = "crosshair";

    drawer.value = markRaw(
      new MapboxDraw({
        defaultMode: mode,
        controls: { trash: true, polygon: true, line_string: true },
        displayControlsDefault: false,
        keybindings: true,
        touchEnabled: true,
        styles: glDrawStyles,
      })
    );

    mapRefStore.map.addControl(drawer.value as any);
    mapRefStore.map.on("draw.create", onCreate);
    mapRefStore.map.on("draw.update", onUpdate);
    mapRefStore.map.on("draw.delete", onDelete);

    onCleanup(() => {
      if (!mapRefStore.map || !drawer.value) return;
      mapCanvas!.style.cursor = "";
      mapRefStore.map.removeControl(drawer.value as any);
      mapRefStore.map.off("draw.create", onCreate);
      mapRefStore.map.off("draw.update", onUpdate);
      mapRefStore.map.off("draw.delete", onDelete);
    });
  });

  return { drawer: drawer.value };
};
