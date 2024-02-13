<script setup lang="ts">
import IcCross from "~/assets/icons/ic-cross.svg";
import IcFileSort from "~/assets/icons/ic-file-sort.svg";
import IcMapLayerA from "~/assets/icons/ic-map-layer-a.svg";
import IcMapLayerB from "~/assets/icons/ic-map-layer-b.svg";
import { uncategorizedAlias } from "~/constants";

const mapRefStore = useMapRef();
const store = useCatalogue();
const { toggleCatalogue } = store;
const mapLayerStore = useMapLayer();
const activeLayers = computed(() => {
  return mapLayerStore.groupedActiveLayers
    ?.map(({ layerLists }) => layerLists)
    .flat();
});
const addLayer = (layerItem: VectorTiles | RasterTiles) => {
  let groupName = layerItem.category
    ? layerItem.category.category_name
    : uncategorizedAlias;
  let groupIndex = mapLayerStore.groupedActiveLayers?.findIndex(
    (el) => el.label === groupName
  );
  if (groupIndex !== -1) {
    mapLayerStore.groupedActiveLayers?.[groupIndex as number].layerLists.push(
      layerItem
    );
  } else {
    mapLayerStore.groupedActiveLayers?.push({
      label: groupName as string,
      layerLists: [layerItem],
      defaultOpen: false,
    });
  }
};
const removeLayer = (layerItem: VectorTiles | RasterTiles) => {
  let groupName = layerItem.category
    ? layerItem.category.category_name
    : uncategorizedAlias;
  let groupIndex = mapLayerStore.groupedActiveLayers?.findIndex(
    (el) => el.label === groupName
  );
  let layerIndex = mapLayerStore.groupedActiveLayers?.[
    groupIndex as number
  ].layerLists.findIndex((el) => el.layer_id === layerItem.layer_id);

  if (
    mapLayerStore.groupedActiveLayers?.[groupIndex as number].layerLists
      .length === 1
  ) {
    mapLayerStore.groupedActiveLayers?.splice(groupIndex as number, 1);
  } else {
    mapLayerStore.groupedActiveLayers?.[
      groupIndex as number
    ]?.layerLists.splice(layerIndex as number, 1);
  }

  mapRefStore.map?.removeLayer(layerItem.layer_id);
};

// get listed layer list
const layerStore = useMapLayer();
const { fetchListedLayers } = layerStore;
fetchListedLayers();
</script>

<template>
  <div class="flex flex-col gap-3 p-5 h-full max-h-full">
    <div class="flex justify-between">
      <div class="flex items-center gap-3">
        <IcFileSort class="text-grey-300 w-4 h-4" :fontControlled="false" />
        <h1 class="text-grey-50">Data Catalogue</h1>
      </div>
      <button
        @click="
          () => {
            toggleCatalogue();
          }
        "
      >
        <IcCross class="w-4 h-4 text-grey-400" :fontControlled="false" />
      </button>
    </div>
    <div class="h-full flex max-h-[calc(100%-2.25rem)]">
      <div class="flex flex-col text-white border rounded-l-xs p-2 gap-2">
        <span>
          <h2 class="text-xs">Data Catalogue</h2>
          <p class="text-2xs">Datasets list available in this GeoDashboard</p>
        </span>
        <UButton
          :ui="{ rounded: 'rounded-xxs' }"
          label="Show All"
          class="w-full justify-between v"
          disabled
          @click="
            () => {
              console.log('tes');
            }
          "
        />
        <div class="border-t" />
        <div class="flex flex-col gap-2">
          <span class="p-1">
            <h2 class="text-xs">Default Catalogue</h2>
            <p class="text-2xs">Dataset Folder/Project Provided by Default</p>
          </span>
          <UButton
            v-for="category of mapLayerStore.groupedLayerList"
            :key="category.label"
            :ui="{ rounded: 'rounded-xxs' }"
            :label="category.label"
            variant="ghost"
            color="grey"
          />
        </div>
        <div class="border-t" />
        <div>
          <span>
            <h2 class="text-xs">User’s Catalogue</h2>
            <p class="text-2xs">Dataset Folder/Project Provided by Default</p>
          </span>
        </div>
      </div>
      <div class="flex flex-col w-full h-full max-h-full">
        <div
          class="flex border border-l-0 rounded-tr-xs p-3 items-center justify-between"
        >
          <div class="flex gap-2 items-center">
            <UButton
              :ui="{ rounded: 'rounded-xxs' }"
              label="Sort - Alphabetical (A-Z)"
              class="text-xs text-white outline-grey-50 border-grey-50"
              variant="outline"
              color="grey"
              @click="
                () => {
                  console.log('tes');
                }
              "
            />
            <UButton
              :ui="{ rounded: 'rounded-xxs' }"
              label="All Format"
              variant="outline"
              class="text-xs"
              color="grey"
              @click="
                () => {
                  console.log('tes');
                }
              "
            >
              <template #leading>
                <IcMapLayerB color="grey" />
              </template>
            </UButton>
            <UButton
              :ui="{ rounded: 'rounded-xxs' }"
              label="All Dimension"
              variant="outline"
              class="text-xs"
              color="grey"
              @click="
                () => {
                  console.log('tes');
                }
              "
            >
              <template #leading>
                <IcMapLayerA color="grey" />
              </template>
            </UButton>
          </div>
          <UInput
            color="gray"
            :ui="{ rounded: 'rounded-xxs' }"
            placeholder="Search Dataset"
          >
            <template #trailing>
              <UButton
                color="grey"
                variant="link"
                icon="i-heroicons-magnifying-glass-20-solid"
                :padded="false"
              />
            </template>
          </UInput>
        </div>
        <div
          class="flex flex-col w-full h-full border border-t-0 border-l-0 rounded-br-xs overflow-y-auto divide-y"
        >
          <div
            class="flex flex-col px-3 py-2 gap-1"
            v-for="category of mapLayerStore.groupedLayerList"
          >
            <h3 class="text-grey-50">{{ category.label }}</h3>
            <p class="text-xs text-grey-50">description?</p>
            <span class="flex items-center gap-3 text-grey-400 text-xs">
              <!-- <p>Folder by: {{ folder.created_by }}</p>
              <p>Made at: {{ folder.created_at }}</p> -->
              <p>No. of Datasets : {{ category.layerLists.length }}</p>
            </span>
            <div class="grid grid-cols-4 mt-3 gap-3">
              <MapManagementCatalogueItem
                v-for="layer of category.layerLists"
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
                @remove-layer="removeLayer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
