import type { VectorTiles } from "~/utils/types";

export const useMapLayer = defineStore("maplayer", () => {
  const activeMapLayer = ref<VectorTiles[] | null>(null);
  function setActiveMapLayer(value: VectorTiles[]) {
    activeMapLayer.value = value;
  }

  return { activeMapLayer, setActiveMapLayer };
});
