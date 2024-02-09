<script setup lang="ts">
import type { RasterTiles, VectorTiles } from "~/utils/types";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  TransitionRoot,
} from "@headlessui/vue";
import IcArrowReg from "~/assets/icons/ic-arrow-reg.svg";

const props = defineProps<{
  defaultOpen: boolean;
  label: string;
  layerLists: (VectorTiles | RasterTiles)[];
}>();

const isPanelOpen = ref(props.defaultOpen);

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
  <Disclosure v-slot="{ open }">
    <DisclosureButton
      @click="() => (isPanelOpen = !isPanelOpen)"
      draggable="true"
      class="text-sm text-grey-200 flex items-center justify-between w-full py-2"
    >
      <span>{{ label }}</span>
      <div
        :class="[
          isPanelOpen ? '' : 'rotate-180',
          'text-grey-50 transition-all duration-300',
        ]"
      >
        <IcArrowReg :fontControlled="false" class="w-4 h-4 text-grey-400" />
      </div>
    </DisclosureButton>
    <TransitionRoot
      appear
      :show="isPanelOpen"
      as="div"
      className="overflow-hidden"
      enter="transition-all ease-in duration-300"
      enterFrom="max-h-0"
      enterTo="max-h-[100rem]"
      leave="transition-all ease-out duration-300"
      leaveFrom="max-h-[100rem]"
      leaveTo="max-h-0"
    >
      <DisclosurePanel class="space-y-2 p-[1px] text-xs">
        <template
          v-for="item in props.layerLists"
          :key="item.layer_name"
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
      </DisclosurePanel>
    </TransitionRoot>
  </Disclosure>
</template>
