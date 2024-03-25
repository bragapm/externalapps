<script setup lang="ts">
import IcCross from "~/assets/icons/ic-cross.svg";
import IcFileSort from "~/assets/icons/ic-file-sort.svg";
import IcCloudUpload from "~/assets/icons/ic-cloud-upload.svg";
import IcArrow from "~/assets/icons/ic-arrow-square.svg";
import { layerTypeFilterOptions, dimensionFilterOptions } from "~/constants";
import LoadFileInput from "./LoadFileInput.vue";

const catalogueStore = useCatalogue();
const { toggleCatalogue } = catalogueStore;
const mapLayerStore = useMapLayer();
const { fetchListedLayers } = mapLayerStore;
const fetchingListedLayers = ref(true);
const uploadMode = ref(false);
const loadFileInput = ref<InstanceType<typeof LoadFileInput> | null>(null);

// get listed layer list
onMounted(async () => {
  await fetchListedLayers();
  fetchingListedLayers.value = false;
});
const filteredLayers = ref<LayerGroupedByCategory[]>([]);
const filteredLocalLayers = ref<LayerGroupedByCategory[]>([]);

const formatLists = shallowRef(layerTypeFilterOptions);
const handleChangeFormatList = (index: string | number, value: boolean) => {
  if (typeof index === "number")
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
        formatLists.value.filter(
          (el) => el.type !== "all" && el.checked === true
        ).length === 1
      ) {
        formatLists.value[0].checked = true;
        formatLists.value[index].checked = value;
      } else {
        formatLists.value[0].checked = false;
        formatLists.value[index].checked = value;
      }
    }
};

const dimensionLists = shallowRef(dimensionFilterOptions);
const handleChangeDimensionList = (index: string | number, value: boolean) => {
  if (typeof index === "number")
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

const sortOrder = ref<{ id: "asc" | "desc"; name: string }>({
  id: "asc",
  name: "Sort - Alphabetical (A-Z)",
});

const searchFilter = ref("");

const searchRef = ref("");

const updateSortOrder = (order: { id: "asc" | "desc"; name: string }) => {
  sortOrder.value = order;
};

const updateFilteredLayers = (newValue: LayerGroupedByCategory[]) => {
  filteredLayers.value = newValue;
};
const updateFilteredLocalLayers = (newValue: LayerGroupedByCategory[]) => {
  filteredLocalLayers.value = newValue;
};

const applyFilter = (
  data: LayerGroupedByCategory[],
  updateFunc: (newValue: LayerGroupedByCategory[]) => void
) => {
  //filter by format
  if (formatLists.value.length) {
    const filteredFormat = formatLists.value
      .filter((el) => el.checked === true && el.type !== "all")
      .map((el) => el.type);

    const filteredByFormat = data
      .map((item: LayerGroupedByCategory) => {
        return {
          ...item,
          layerLists: item.layerLists.filter((el: LayerLists) => {
            if (filteredFormat.length > 0) {
              return filteredFormat.includes(el.geometry_type);
            } else {
              return el;
            }
          }),
        };
      })
      .filter((item: LayerGroupedByCategory) => item.layerLists.length > 0);

    data = filteredByFormat;
  }
  //filter by format

  //filter by dimension
  if (dimensionLists.value.length) {
    const dimensionFormat = dimensionLists.value
      .filter((el) => el.checked === true && el.type !== "all")
      .map((el) => el.type);

    const filteredByDimension = data
      ?.map((item: LayerGroupedByCategory) => {
        return {
          ...item,
          layerLists: item.layerLists.filter((el: LayerLists) => {
            if (dimensionFormat.length > 0) {
              return dimensionFormat.includes(el.dimension);
            } else {
              return el;
            }
          }),
        };
      })
      .filter((item: LayerGroupedByCategory) => item.layerLists.length > 0);

    data = filteredByDimension;
  }
  //filter by dimension

  //filter by search
  if (searchFilter.value !== "") {
    const filteredBySearch = data
      ?.map((item: LayerGroupedByCategory) => {
        return {
          ...item,
          layerLists: item.layerLists.filter((el) => {
            if (el.source === "vector_tiles") {
              const name = el.layer_alias ?? el.layer_name;
              return name
                .toLowerCase()
                .includes(searchFilter.value.toLowerCase());
            } else {
              return el.layer_alias
                ?.toLowerCase()
                .includes(searchFilter.value.toLowerCase());
            }
          }),
        };
      })
      .filter((item: LayerGroupedByCategory) => item.layerLists.length > 0);

    data = filteredBySearch;
  }
  updateFunc(data);
};

watchEffect(() => {
  applyFilter(mapLayerStore.groupedLayerList, updateFilteredLayers);
  applyFilter(mapLayerStore.groupedLocalLayers, updateFilteredLocalLayers);
});

const updateSearchFilter = (input: string) => {
  searchFilter.value = input;
};
watch(searchRef, debounce(updateSearchFilter, 750));
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
        <div v-if="fetchingListedLayers" class="flex-1 overflow-scroll">
          <template v-for="i of [0, 1]" :key="i">
            <div v-if="i !== 0" class="border-t border-grey-700 mx-2" />
            <div class="flex flex-col gap-2 p-2">
              <USkeleton
                :ui="{ background: 'bg-gray-800' }"
                class="h-3 w-1/2"
              />
              <USkeleton
                :ui="{ background: 'bg-gray-800' }"
                class="h-3 w-full"
              />
              <USkeleton
                v-for="i of [0, 1, 2, 3, 4]"
                :key="i"
                :ui="{ rounded: 'rounded-xxs', background: 'bg-gray-800' }"
                class="w-full h-7"
              />
            </div>
          </template>
        </div>
        <MapManagementCatalogueLists v-else :uploadMode="uploadMode" />
        <div class="flex flex-col p-2 gap-2">
          <div class="border-t border-grey-700" />
          <!-- TODO UI flow for file upload -->
          <MapManagementCatalogueLoadFileInput
            ref="loadFileInput"
            :sortOrder="sortOrder"
          />
          <UButton
            :ui="{ rounded: 'rounded-xxs' }"
            :label="!uploadMode ? 'Load Local Data' : 'Back to Catalogue'"
            variant="outline"
            color="brand"
            class="w-full justify-between text-sm"
            @click="
              () => {
                // TODO alter uploadMode logic and UI (multiple files)
                // uploadMode = !uploadMode;
                loadFileInput?.input?.click();
              }
            "
          >
            <template #trailing>
              <IcCloudUpload
                v-if="!uploadMode"
                class="w-3 h-3"
                :fontControlled="false"
              />
              <IcArrow v-else class="w-3 h-3" :fontControlled="false" />
            </template>
          </UButton>
        </div>
      </div>
      <div class="flex flex-col w-full h-full max-h-full">
        <div
          class="flex border border-grey-700 border-l-0 rounded-tr-xs p-3 items-center justify-between"
        >
          <div class="flex gap-2 items-center">
            <MapManagementCatalogueSort
              :sortOrder="sortOrder"
              @update-sort-order="updateSortOrder"
            />
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
        <div
          v-if="fetchingListedLayers"
          class="flex flex-col w-full h-full border border-grey-700 border-t-0 border-l-0 rounded-br-xs overflow-y-auto divide-y divide-grey-700"
        >
          <div v-for="i of [0, 1]" :key="i" class="flex flex-col p-3 gap-1">
            <USkeleton :ui="{ background: 'bg-gray-800' }" class="h-6 w-1/12" />
            <USkeleton :ui="{ background: 'bg-gray-800' }" class="h-4 w-3/12" />
            <USkeleton :ui="{ background: 'bg-gray-800' }" class="h-4 w-5/12" />
            <div
              class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mt-3 gap-3"
            >
              <div
                v-for="i of [0, 1, 2, 3, 4]"
                :key="i"
                class="flex flex-col gap-2 border border-grey-700 rounded-xs p-2"
              >
                <USkeleton
                  :ui="{ background: 'bg-gray-800', rounded: 'rounded-xxs' }"
                  class="h-6 w-1/4"
                />
                <USkeleton
                  :ui="{ background: 'bg-gray-800', rounded: 'rounded-xxs' }"
                  class="h-24 w-full"
                />
                <div class="flex flex-col gap-2">
                  <USkeleton
                    :ui="{ background: 'bg-gray-800' }"
                    class="h-3 w-1/3"
                  />
                  <USkeleton
                    :ui="{ background: 'bg-gray-800' }"
                    class="h-3 w-2/3"
                  />
                </div>
                <USkeleton
                  :ui="{ background: 'bg-gray-800', rounded: 'rounded-xxs' }"
                  class="w-full h-9"
                />
              </div>
            </div>
          </div>
        </div>
        <MapManagementCatalogueData
          v-else
          :uploadMode="uploadMode"
          :filteredLayers="filteredLayers"
          :filteredLocalLayers="filteredLocalLayers"
        />
      </div>
    </div>
  </div>
</template>
