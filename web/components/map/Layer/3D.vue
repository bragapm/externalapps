<script setup lang="ts">
import { Tile3DLayer } from "@deck.gl/geo-layers";
import { Tiles3DLoader } from "@loaders.gl/3d-tiles";

const props = defineProps<{
  data: ThreeDTiles[];
}>();

const mapLayerStore = useMapLayer();
const updateBounds = (id: string, center: [number, number], zoom: number) => {
  const prev: any = { ...mapLayerStore.threeDLayerCenter.value };
  prev[id] = { center, zoom };
  mapLayerStore.threeDLayerCenter.value = prev;
};
</script>

<template>
  <MapLayerDeckGLOverlay
    :layers="
      data.map(
        (layer) =>
          new Tile3DLayer({
            id: layer.layer_id,
            data: '/panel/3d-tiles/' + layer.layer_id + '/tileset.json',
            opacity: layer.opacity,
            visible: layer.layer_style.layout_visibility === 'visible',
            loader: Tiles3DLoader,
            getPointColor: [200, 200, 200, 100],
            onTilesetLoad: (tileset: any) => {
                const { cartographicCenter, zoom } = tileset;
                updateBounds(layer.layer_id, [cartographicCenter[0],cartographicCenter[1]] , zoom)
            },
          })
      )
    "
  />
</template>
