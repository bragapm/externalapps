<script setup lang="ts">
import IcCross from "~/assets/icons/ic-cross.svg";
import IcFileSort from "~/assets/icons/ic-file-sort.svg";
import IcMapLayerA from "~/assets/icons/ic-map-layer-a.svg";
import IcMapLayerB from "~/assets/icons/ic-map-layer-b.svg";
import type { ICatalogueItem } from "./CatalogueItem.vue";

export interface ICatalogueFolder {
  name: string;
  description: string;
  created_at: string;
  created_by: string;
  layers: ICatalogueItem[];
}

const store = useCatalogue();
const { toggleCatalogue } = store;

const props = defineProps<{ folders: ICatalogueFolder[] }>();
</script>

<template>
  <div class="flex flex-col gap-3 p-5 h-full max-h-full">
    <div class="flex justify-between h-full">
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
            v-for="folder of props.folders"
            :ui="{ rounded: 'rounded-xxs' }"
            :label="folder.name"
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
          <div class="flex flex-col px-3 py-2 gap-1" v-for="folder of folders">
            <h3 class="text-grey-50">{{ folder.name }}</h3>
            <p class="text-xs text-grey-50">
              {{ folder.description }}
            </p>
            <span class="flex items-center gap-3 text-grey-400 text-xs">
              <p>Folder by: {{ folder.created_by }}</p>
              <p>Made at: {{ folder.created_at }}</p>
              <p>No. of Datasets : {{ folder.layers.length }}</p>
            </span>
            <div class="grid grid-cols-4 mt-3 gap-3">
              <MapManagementCatalogueItem
                v-for="layer of folder.layers"
                :layer_alias="layer.layer_alias"
                :layer_id="layer.layer_id"
                :layer_name="layer.layer_name"
                :geometry_type="layer.geometry_type"
                :is_active="layer.is_active"
                :description="layer.description"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
