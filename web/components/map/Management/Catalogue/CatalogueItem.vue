<script setup lang="ts">
import IcHelp from "~/assets/icons/ic-help.svg";
import IcCheck from "~/assets/icons/ic-check.svg";
import IcMapLayerA from "~/assets/icons/ic-map-layer-a.svg";
import type { VectorTiles, RasterTiles } from "~/utils/types";

const props = defineProps<{
  item: VectorTiles | RasterTiles;
  isActive: boolean;
}>();

const emit = defineEmits<{
  addLayer: [layerItem: VectorTiles | RasterTiles];
  removeLayer: [layerItem: VectorTiles | RasterTiles];
}>();
</script>

<template>
  <div class="flex flex-col gap-2 border rounded-xs p-2">
    <div class="flex items-center gap-1">
      <UBadge
        :ui="{ rounded: 'rounded-xxs' }"
        variant="outline"
        class="flex items-center gap-1"
        color="grey"
      >
        <IcMapLayerA></IcMapLayerA>
        <p>{{ item.geometry_type }}</p>
      </UBadge>
      <UBadge
        :ui="{ rounded: 'rounded-xxs' }"
        variant="outline"
        color="green"
        class="gap-1"
        v-if="isActive"
      >
        <IcCheck></IcCheck>
        <p>In Map</p>
      </UBadge>
    </div>
    <img
      src="~/assets/images/catalogue-item.jpeg"
      alt="catalogue-item"
      class="h-24 w-full object-cover object-center rounded-xxs"
    />
    <article>
      <div class="flex items-center justify-between gap-2">
        <h5 class="text-xs text-grey-50 truncate">
          {{ item.layer_alias || item.layer_name }}
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
      class="w-full justify-center"
      :variant="isActive ? 'outline' : 'solid'"
      :color="isActive ? 'brand' : 'grey'"
      @click="isActive ? emit('removeLayer', item) : emit('addLayer', item)"
    />
  </div>
</template>
