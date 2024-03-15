<script lang="ts" setup>
const mapStore = useMapRef();
const { map } = mapStore;

const longitudeRef = ref("");
const latitudeRef = ref("");

const findCoordinate = () => {
  map?.flyTo({
    center: [parseFloat(longitudeRef.value), parseFloat(latitudeRef.value)],
    zoom: 10,
  });
};
</script>

<template>
  <div class="p-2 flex flex-col gap-2">
    <p class="text-2xs text-grey-400">
      <span class="font-bold"
        >Input coordinates (Decimal Degrees/DD Format)</span
      >
      into the field below to find the place.
    </p>
    <div class="grid grid-cols-2 gap-1">
      <UInput
        v-model="longitudeRef"
        color="gray"
        :ui="{ rounded: 'rounded-xxs' }"
        placeholder="Longitude"
        size="2xs"
      >
      </UInput>
      <UInput
        v-model="latitudeRef"
        color="gray"
        :ui="{ rounded: 'rounded-xxs' }"
        placeholder="Latitude"
        size="2xs"
      >
      </UInput>
    </div>
  </div>
  <div class="p-2">
    <UButton
      @click="findCoordinate"
      color="grey"
      variant="outline"
      :ui="{ rounded: 'rounded-[4px]' }"
      class="w-full justify-center text-sm"
      >Search</UButton
    >
  </div>
</template>
