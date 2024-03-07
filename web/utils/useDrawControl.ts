import MapboxDraw, {
  type DrawCreateEvent,
} from "@mapbox/mapbox-gl-draw";
import type { Feature, GeoJsonProperties, Geometry } from "geojson";
import type { Raw } from "vue";

type DrawControl = {
  mode: string;
};

export const useDrawControl = ({ mode }: DrawControl) => {
  const drawer = shallowRef<null | Raw<MapboxDraw>>(null);
  const mapRefStore = useMapRef();

  const features = ref<Feature<Geometry, GeoJsonProperties> | null>(null);

  const onCreate = (e: DrawCreateEvent) => {
    features.value = e.features?.[0];
  };
  const onUpdate = () => {
    console.log("update");
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
        // styles: drawStyles,
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
