<script setup lang="ts">
import { Tile3DLayer } from "@deck.gl/geo-layers";
import { Tiles3DLoader } from "@loaders.gl/3d-tiles";

const props = defineProps<{
  data: ThreeDTiles[];
}>();
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
            visible: layer.layer_style.layout_visibility ==='visible',
            loader: Tiles3DLoader,
            getPointColor: [200, 200, 200, 100],
            onTilesetLoad: (tileset: any) => {
                const { cartographicCenter } = tileset;
            },
          })
      )
    "
  />
</template>
