<script lang="ts" setup>
import { useQuery } from "@tanstack/vue-query";
import { uncategorizedAlias } from "~/constants";

type Category = {
  category_name: string;
  description: string;
  contributor: string;
  date_created: string;
};

const props = defineProps<{
  groupItem: LayerGroupedByCategory;
}>();

const mapLayerStore = useMapLayer();

const { data: categoriesData } = useFetch<{
  data: Category[];
}>(
  "/panel/items/categories?fields=category_name,description,contributor,date_created"
);

const categoryData = ref<Category | null>(null);
watchEffect(() => {
  if (
    categoriesData.value &&
    categoriesData.value.data.findIndex(
      (el) => el.category_name === props.groupItem.label
    ) > -1
  ) {
    categoryData.value = categoriesData.value.data.filter(
      (el) => el.category_name === props.groupItem.label
    )[0];
  }
});

const activeLayers = computed(() => {
  return mapLayerStore.groupedActiveLayers
    .map(({ layerLists }) => layerLists)
    .flat();
});

const addLayer = (
  layerItem: VectorTiles | RasterTiles | ThreeDTiles | LoadedGeoJson
) => {
  let groupName = layerItem.category?.category_name || uncategorizedAlias;

  let groupIndex = mapLayerStore.groupedActiveLayers.findIndex(
    (el) => el.label === groupName
  );
  if (groupIndex !== -1) {
    mapLayerStore.groupedActiveLayers[groupIndex].layerLists.push(layerItem);
  } else {
    if (
      mapLayerStore.groupedActiveLayers.findIndex(
        (el) => el.label === "Terrain"
      ) !== -1
    ) {
      mapLayerStore.groupedActiveLayers.splice(-1, 0, {
        label: groupName,
        layerLists: [layerItem],
        defaultOpen: false,
      });
      // mapLayerStore.groupedActiveLayers.push({
      //   label: groupName,
      //   layerLists: [layerItem],
      //   defaultOpen: false,
      // });
    } else {
      mapLayerStore.groupedActiveLayers.push({
        label: groupName,
        layerLists: [layerItem],
        defaultOpen: false,
      });
    }
  }
};
</script>

<template>
  <div
    class="flex flex-col py-3 gap-1"
    :id="groupItem.label.split(' ').join('')"
  >
    <h3 class="text-neutral-50">
      {{ groupItem.label }}
    </h3>
    <p v-if="categoryData" class="text-xs text-neutral-50">
      {{ categoryData.description }}
    </p>
    <span class="flex items-center gap-3 text-neutral-400 text-xs">
      <p v-if="categoryData">Folder by: {{ categoryData.contributor }}</p>
      <p v-if="categoryData">
        Created at:
        {{
          new Date(categoryData.date_created).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
          })
        }}
      </p>
      <p>Number of Datasets : {{ groupItem.layerLists.length }}</p>
    </span>
    <div
      class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mt-3 gap-3"
    >
      <MapManagementCatalogueItem
        v-for="layer of groupItem.layerLists"
        :key="layer.layer_id"
        :item="layer"
        :isActive="
          activeLayers
            ? activeLayers.findIndex(
                (item) => item.layer_id === layer.layer_id
              ) > -1
            : false
        "
        @add-layer="addLayer"
      />
    </div>
  </div>
</template>
