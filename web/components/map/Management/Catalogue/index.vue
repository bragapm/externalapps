<script setup lang="ts">
import IcCross from "~/assets/icons/ic-cross.svg";
import IcFileSort from "~/assets/icons/ic-file-sort.svg";
import IcCloudUpload from "~/assets/icons/ic-cloud-upload.svg";
import IcArrow from "~/assets/icons/ic-arrow-square.svg";
import { layerTypeFilterOptions, dimensionFilterOptions } from "~/constants";

const store = useCatalogue();
const { toggleCatalogue } = store;
const mapLayerStore = useMapLayer();
const uploadMode = ref(false);

let timeoutId: NodeJS.Timeout;
function debounce(func: Function, delay: number) {
  return function (...args: any[]) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func.apply(null, args);
    }, delay);
  };
}

// get listed layer list
const layerStore = useMapLayer();
const { fetchListedLayers } = layerStore;
fetchListedLayers();
const filteredLayers = ref<LayerGroupedByCategory[] | null>(null);

const formatLists = ref(layerTypeFilterOptions);
const handleChangeFormatList = (index: number, value: boolean) => {
  if (index === 0 && value === true) {
    for (const el of formatLists.value) {
      if (el.type === "all") {
        el.checked = true;
      } else {
        el.checked = false;
      }
    }
  } else {
    if (
      value === false &&
      formatLists.value.filter((el) => el.type !== "all" && el.checked === true)
        .length === 1
    ) {
      formatLists.value[0].checked = true;
      formatLists.value[index].checked = value;
    } else {
      formatLists.value[0].checked = false;
      formatLists.value[index].checked = value;
    }
  }
};

const dimensionLists = ref(dimensionFilterOptions);
const handleChangeDimensionList = (index: number, value: boolean) => {
  if (index === 0 && value === true) {
    for (const el of dimensionLists.value) {
      if (el.type === "all") {
        el.checked = true;
      } else {
        el.checked = false;
      }
    }
  } else {
    if (
      value === false &&
      dimensionLists.value.filter(
        (el) => el.type !== "all" && el.checked === true
      ).length === 1
    ) {
      dimensionLists.value[0].checked = true;
      dimensionLists.value[index].checked = value;
    } else {
      dimensionLists.value[0].checked = false;
      dimensionLists.value[index].checked = value;
    }
  }
};
const searchFilter = ref("");

const searchRef = ref("");

const applyFilter = () => {
  let current = JSON.parse(JSON.stringify(mapLayerStore.groupedLayerList));

  //filter by format
  const filteredFormat = formatLists.value
    .filter((el) => el.checked === true && el.type !== "all")
    .map((el) => el.type);

  const filteredByFormat = current
    ?.map((item: LayerGroupedByCategory) => {
      return {
        ...item,
        layerLists: item.layerLists.filter((el: any) => {
          if (filteredFormat.length > 0) {
            return filteredFormat.includes(el.geometry_type);
          } else {
            return el;
          }
        }),
      };
    })
    .filter((item: any) => item.layerLists.length > 0);

  current = filteredByFormat;
  //filter by format

  //filter by dimension
  const dimensionFormat = dimensionLists.value
    .filter((el) => el.checked === true && el.type !== "all")
    .map((el) => el.type);

  const filteredByDimension = current
    ?.map((item: LayerGroupedByCategory) => {
      return {
        ...item,
        layerLists: item.layerLists.filter((el: any) => {
          if (dimensionFormat.length > 0) {
            return dimensionFormat.includes(el.dimension);
          } else {
            return el;
          }
        }),
      };
    })
    .filter((item: any) => item.layerLists.length > 0);

  current = filteredByDimension;
  //filter by dimension

  //filter by search
  if (searchFilter.value !== "") {
    const filteredBySearch = current
      ?.map((item: LayerGroupedByCategory) => {
        return {
          ...item,
          layerLists: item.layerLists.filter((el: any) => {
            if (el.layer_name) {
              return el.layer_name
                ?.toLowerCase()
                .includes(searchFilter.value.toLowerCase());
            } else if (el.layer_alias) {
              return el.layer_alias
                ?.toLowerCase()
                .includes(searchFilter.value.toLowerCase());
            }
          }),
        };
      })
      .filter((item: any) => item.layerLists.length > 0);

    current = filteredBySearch;
  }

  filteredLayers.value = current;
};

watchEffect(() => {
  applyFilter();
});

const updateSearchFilter = (input: string) => {
  searchFilter.value = input;
};
watch(searchRef, (newValue) => {
  debounce(updateSearchFilter, 500)(newValue);
});
</script>

<template>
  <div class="flex flex-col gap-3 p-5 h-full max-h-full">
    <div class="flex justify-between">
      <div class="flex items-center gap-3">
        <IcFileSort class="text-grey-300 w-4 h-4" :fontControlled="false" />
        <h1 class="text-grey-50">
          {{ !uploadMode ? "Data Catalogue" : "User's Catalogue" }}
        </h1>
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
      <div
        class="flex flex-col text-white border border-grey-700 rounded-l-xs gap-2 overflow-hidden w-60"
      >
        <MapManagementCatalogueLists :uploadMode="uploadMode" />
        <div class="flex flex-col p-2 gap-2">
          <div class="border-t border-grey-700" />
          <UButton
            :ui="{ rounded: 'rounded-xxs' }"
            :label="!uploadMode ? 'Upload Data' : 'Back to Catalogue'"
            variant="outline"
            color="brand"
            class="w-full justify-between text-sm"
            @click="
              () => {
                uploadMode = !uploadMode;
              }
            "
          >
            <template #trailing>
              <IcCloudUpload
                v-if="!uploadMode"
                class="w-3 h-3"
                :fontControlled="false"
              />
              <IcArrow
                v-else-if="uploadMode"
                class="w-3 h-3"
                :fontControlled="false"
              />
            </template>
          </UButton>
        </div>
      </div>
      <div class="flex flex-col w-full h-full max-h-full">
        <div
          class="flex border border-grey-700 border-l-0 rounded-tr-xs p-3 items-center justify-between"
        >
          <div class="flex gap-2 items-center">
            <MapManagementCatalogueSort />
            <MapManagementCatalogueFormatFilter
              :list="formatLists"
              :handleChange="handleChangeFormatList"
            />
            <MapManagementCatalogueDimensionFilter
              :list="dimensionLists"
              :handleChange="handleChangeDimensionList"
            />
          </div>
          <UInput
            v-model="searchRef"
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
        <MapManagementCatalogueData
          :uploadMode="uploadMode"
          :filteredLayers="filteredLayers"
        />
      </div>
    </div>
  </div>
</template>
