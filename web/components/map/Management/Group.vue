<script setup lang="ts">
import type { RasterTiles, VectorTiles } from "~/utils/types";

const props = defineProps<{
  layerLists: (VectorTiles | RasterTiles)[];
}>();

// const store = useMapLayer();
// const { groupedActiveLayers } = storeToRefs(store);

const dragItem = ref<null | any>(null);
const updateDragItem = (dragItemValue: any) => {
  dragItem.value = dragItemValue;
};
const dragOverItem = ref<null | any>(null);
const updateDragOverItem = (dragOverItemValue: any) => {
  dragOverItem.value = dragOverItemValue;
};
const handleChangeOrder = () => {
  // if (store.groupedActiveLayers && dragItem.value && dragOverItem.value) {
  //   const copiedGroupedActiveLayers: any[] = JSON.parse(
  //     JSON.stringify(store.groupedActiveLayers)
  //   );
  //   const movedLayer =
  //     copiedGroupedActiveLayers[dragItem.value.groupIndex].layerLists[
  //       dragItem.value.layerIndex
  //     ];
  //   copiedGroupedActiveLayers[dragItem.value.groupIndex].layerLists.splice(
  //     dragItem.value.layerIndex,
  //     1
  //   );
  //   copiedGroupedActiveLayers[dragItem.value.groupIndex].layerLists.splice(
  //     dragOverItem.value.layerIndex,
  //     0,
  //     movedLayer
  //   );
  //   console.log(copiedGroupedActiveLayers);
  //   // console.log(dragOverItem.value.layerIndex);
  //   // console.log(movedLayer);
  //   // current[dragItem.value.groupIndex].layerLists.splice(0, 0, movedLayer);
  //   // console.log(movedLayer);
  //   // console.log(current);
  //   // store.groupedActiveLayers = copiedGroupedActiveLayers;
  // }
};
</script>

<template>
  <div class="flex flex-col gap-2">
    <template
      v-for="item in props.layerLists"
      :key="item.layer_name"
      class="space-y-2"
    >
      <MapManagementLayerVector
        v-if="item.source === 'vector_tiles'"
        :layerItem="(item as VectorTiles)"
        :dragItem="dragItem"
        @update-drag-item="updateDragItem"
        :dragOverItem="dragOverItem"
        @update-drag-over-item="updateDragOverItem"
        @handle-change-order="handleChangeOrder"
      />
      <MapManagementLayerRaster
        v-else-if="item.source === 'raster_tiles'"
        :layerItem="(item as RasterTiles)"
      />
    </template>
  </div>
</template>
