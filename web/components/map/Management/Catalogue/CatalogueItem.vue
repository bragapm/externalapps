<script setup lang="ts">
import { TransitionRoot } from "@headlessui/vue";
import IcHelp from "~/assets/icons/ic-help.svg";
import IcSpinner from "~/assets/icons/ic-spinner.svg";
import IcCheck from "~/assets/icons/ic-check.svg";
import IcMapLayerA from "~/assets/icons/ic-map-layer-a.svg";
import type { VectorTiles, RasterTiles, ThreeDTiles } from "~/utils/types";

defineProps<{
  item: VectorTiles | RasterTiles | ThreeDTiles;
  isActive: boolean;
}>();

const emit = defineEmits<{
  addLayer: [layerItem: VectorTiles | RasterTiles | ThreeDTiles];
}>();

const mapLayerStore = useMapLayer();

const isLoad = ref(false);

const addLayer = (item: VectorTiles | RasterTiles | ThreeDTiles) => {
  isLoad.value = true;
  setTimeout(() => {
    isLoad.value = false;
    emit("addLayer", item);
  }, 750);
};

const removeLayer = (item: VectorTiles | RasterTiles | ThreeDTiles) => {
  isLoad.value = true;
  setTimeout(() => {
    isLoad.value = false;
    mapLayerStore.removeLayer(item);
  }, 750);
};
</script>

<template>
  <div class="flex flex-col gap-2 border border-grey-700 rounded-xs p-2">
    <div class="flex items-center gap-1">
      <UBadge
        :ui="{ rounded: 'rounded-xxs' }"
        variant="outline"
        class="flex items-center gap-1 bg-grey-800 text-grey-50 mt-[1px]"
        color="grey"
      >
        <IcMapLayerA></IcMapLayerA>
        <p>{{ item.geometry_type }}</p>
      </UBadge>
      <TransitionRoot
        :show="isActive"
        enter="transition-all duration-1000 ease-in-out"
        enterFrom="transform opacity-0"
        enterTo="transform opacity-100"
        leave="transition-all duration-1000 ease-in-out"
        leaveFrom="transform opacity-100"
        leaveTo="transform opacity-0"
      >
        <UBadge
          :ui="{ rounded: 'rounded-xxs' }"
          variant="outline"
          color="green"
          class="gap-1 bg-grey-800"
        >
          <IcCheck></IcCheck>
          <p>In Map</p>
        </UBadge>
      </TransitionRoot>
    </div>
    <img
      src="~/assets/images/catalogue-item.jpeg"
      alt="catalogue-item"
      class="h-24 w-full object-cover object-center rounded-xxs"
    />
    <article>
      <div class="flex items-center justify-between gap-2">
        <h5 class="text-xs text-grey-50 truncate">
          {{
            item.layer_alias || (item as VectorTiles | RasterTiles).layer_name
          }}
        </h5>
        <button>
          <IcHelp class="w-3 h-3 text-brand-500" :fontControlled="false" />
        </button>
      </div>
      <p class="line-clamp-3 text-grey-500 text-2xs">Description</p>
    </article>
    <UButton
      :ui="{ rounded: 'rounded-xxs' }"
      :label="isActive ? 'Remove' : 'Add to Map'"
      :class="[
        !isActive ? 'transition-all duration-500 ease-in-out' : '',
        'w-full justify-center h-9',
      ]"
      :variant="isActive ? 'outline' : 'solid'"
      :color="isActive ? 'brand' : 'grey'"
      @click="isActive ? removeLayer(item) : addLayer(item)"
    >
      <IcSpinner
        :class="[
          isActive ? 'text-brand-500' : 'text-white',
          'w-4 h-4 animate-spin',
        ]"
        :fontControlled="false"
        v-if="isLoad"
      />
    </UButton>
  </div>
</template>
