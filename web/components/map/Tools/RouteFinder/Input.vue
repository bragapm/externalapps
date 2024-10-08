<script setup lang="ts">
import { orsApiKey } from "~/constants";
import type { LngLatBoundsLike } from "maplibre-gl";
import IcTrash from "~/assets/icons/ic-trash.svg";
// import IcCircle from "~/assets/icons/ic-circle.svg";
import IcMarker from "~/assets/icons/ic-marker-stroked.svg";

const props = defineProps<{
  item: { id: string; feature: GeoJSON.Feature | null; label?: string };
}>();

const directionStore = useDirection();
const { updateLocations, deleteLocationsById } = directionStore;
const mapStore = useMapRef();

const loading = ref(false);
const selected = ref<any>(props.item);
const focused = ref(false);

async function search(q: string) {
  if (!q) return [];
  loading.value = true;
  const res = await fetch(
    "https://api.openrouteservice.org/geocode/autocomplete?boundary.country=ID&sources=openstreetmap&text=" +
      q +
      "&api_key=" +
      orsApiKey
  );
  const result = await res.json();
  let options = [];
  if (result.features) {
    for (const feature of result.features) {
      options.push({
        id: feature.properties.id,
        feature: feature,
        label:
          feature?.properties?.name +
          (feature?.properties?.region
            ? ", " + feature?.properties?.region
            : ""),
      });
    }
  }
  loading.value = false;

  return options;
}

watchEffect(() => {
  selected.value = props.item;
});

const blurWithDelayed = () => {
  setTimeout(() => {
    focused.value = false;
  }, 100);
};
</script>

<template>
  <div class="flex items-center gap-2">
    <div>
      <!-- <IcCircle :class="['text-grey-50 w-2 h-2']" :fontControlled="false" /> -->
      <IcMarker :class="['text-brand-500 w-3 h-3']" :fontControlled="false" />
    </div>
    <div class="flex-1 flex gap-2">
      <UInputMenu
        v-model="selected"
        @focus="focused = true"
        @blur="blurWithDelayed"
        @change=" (el:any) => {
          updateLocations(item.id,el.feature,el.label)
          mapStore.map?.fitBounds(el.feature.bbox as LngLatBoundsLike, { maxZoom:
          17, padding: 100, }); }
        "
        :search="search"
        :loading="loading"
        placeholder="Search location..."
        option-attribute="label"
        trailing
        by="id"
        debounce="500"
        :popper="{ placement: 'top-end' }"
        class="w-full"
        inputClass=""
        color="gray"
        :ui="{
          rounded: 'rounded-xxs',
          base: 'bg-red-500',
        }"
        :uiMenu="{
          rounded: 'rounded-xxs',
          background: 'bg-grey-700',
          ring: 'ring-1 ring-grey-600',
          option: {
            base: 'cursor-pointer hover:text-grey-700',
            selected: 'bg-grey-200 text-grey-700',
            color: 'text-grey-200',
            rounded: 'rounded-xxs',
          },
        }"
        size="xs"
      />
      <button
        v-if="focused"
        @click="
          () => {
            deleteLocationsById(item.id);
            selected = {};
          }
        "
      >
        <IcTrash :class="['text-brand-500 w-3 h-3']" :fontControlled="false" />
      </button>
    </div>
  </div>
</template>
