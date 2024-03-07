<script setup lang="ts">
import { MenuItem } from "@headlessui/vue";

const store = useMapRef();
const { data: generalSettingsData } = await useGeneralSettings();
const { currentBasemap, setCurrentBaseMap, map, mapLoad } = store;

const basemaps = computed(() => {
  const basemaps = [
    {
      name: "Maptiler Satellite",
      url: "https://api.maptiler.com/tiles/satellite-v2/{z}/{x}/{y}.jpg?key=D7JUUxLv3oK21JM9jscD",
    },
  ];
  if (Array.isArray(generalSettingsData.value?.data.basemaps)) {
    for (const basemap of generalSettingsData.value.data.basemaps) {
      basemaps.push({ name: basemap.name, url: basemap.url });
    }
  }
  return basemaps;
});

const handleChangeBasemap = (name: string) => {
  if (map && mapLoad) {
    if (currentBasemap === "default") {
      map.setLayoutProperty("Satellite", "visibility", "none");
      map.setLayoutProperty("Satellite Mediumres 2021", "visibility", "none");
    } else {
      map.setLayoutProperty(currentBasemap, "visibility", "none");
    }
    if (name === "Maptiler Satellite") {
      map.setLayoutProperty("Satellite", "visibility", "visible");
      map.setLayoutProperty(
        "Satellite Mediumres 2021",
        "visibility",
        "visible"
      );
      setCurrentBaseMap("default");
    } else {
      map.setLayoutProperty(`__geodashboard_basemap-${name}`, "visibility", "visible");
      setCurrentBaseMap(`__geodashboard_basemap-${name}`);
    }
  }
};
</script>

<template>
  <div v-for="basemap in basemaps" :key="basemap.name">
    <MenuItem v-slot="{ active }" @click="handleChangeBasemap(basemap.name)">
      <button
        :class="[
          active ? 'bg-grey-700' : 'bg-transparent text-grey-200',
          'group flex w-full items-center gap-3 rounded-xxs p-2 text-xs text-white',
        ]"
      >
        <NuxtImg
          width="64px"
          height="64px"
          class="rounded-xxs"
          :src="
            basemap.url
              .replace('{z}', '0')
              .replace('{x}', '0')
              .replace('{y}', '0')
          "
        />
        {{ basemap.name }}
      </button>
    </MenuItem>
  </div>
</template>
