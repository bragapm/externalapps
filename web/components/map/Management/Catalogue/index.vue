<script setup lang="ts">
import IcCross from "~/assets/icons/ic-cross.svg";
import IcFileAdd from "~/assets/icons/ic-file-add.svg";
import IcFileSort from "~/assets/icons/ic-file-sort.svg";
import IcCloudUpload from "~/assets/icons/ic-cloud-upload.svg";
import IcArrow from "~/assets/icons/ic-arrow-square.svg";
import {
  layerTypeFilterOptions,
  dimensionFilterOptions,
  staticKey,
} from "~/constants";
import type { LayerConfigLists } from "~/utils/types";

const authStore = useAuth();
const { getAllLoadedGeoJsonData } = useIDB();
const catalogueStore = useCatalogue();
const { toggleCatalogue } = catalogueStore;
const { selectedCategory } = storeToRefs(catalogueStore);
const mapLayerStore = useMapLayer();
const { getLayersArr } = mapLayerStore;
const mode = ref<UploadModeEnum>("");
const isOption = ref(false);

const activeLayers = computed(() => {
  return mapLayerStore.groupedActiveLayers
    .map(({ layerLists }) => layerLists)
    .flat();
});

const formatLists = ref(layerTypeFilterOptions);
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

const dimensionLists = ref(dimensionFilterOptions);
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

const updateSearchFilter = (input: string) => {
  searchFilter.value = input;
};
watch(searchRef, debounce(updateSearchFilter, 750));

const changeMode = (value: UploadModeEnum) => {
  mode.value = value;
};

const catalogueData = ref<any[]>([]);
const filteredData = ref<any[]>([]);
const isFetching = ref(false);
const fetchData = async (categoryId: string) => {
  isFetching.value = true;
  if (categoryId === staticKey.loadedData) {
    const loadedData = await getAllLoadedGeoJsonData();
    if (loadedData) {
      catalogueData.value = loadedData;
    }
    isFetching.value = false;
  } else {
    const [vectorTiles, rasterTiles, threeDTiles] = await Promise.all([
      $fetch<{
        data: LayerConfigLists;
      }>(
        `/panel/items/vector_tiles?fields=layer_id,layer_name,geometry_type,bounds,minzoom,maxzoom,layer_alias,hover_popup_columns,click_popup_columns,image_columns,active,description,preview,category.*,fill_style.*,line_style.*,circle_style.*,symbol_style.*&sort=layer_name&${
          categoryId === staticKey.other
            ? `filter[category][_null]=true`
            : `filter[category][category_id][_eq]=${categoryId}`
        }`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + authStore.accessToken,
          },
        }
      ),
      $fetch<{
        data: LayerConfigLists;
      }>(
        `/panel/items/raster_tiles?fields=layer_id,bounds,minzoom,maxzoom,terrain_rgb,layer_alias,active,visible,category.*,preview,description&sort=layer_alias&${
          categoryId === staticKey.other
            ? `filter[category][_null]=true`
            : `filter[category][category_id][_eq]=${categoryId}`
        }`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + authStore.accessToken,
          },
        }
      ),
      $fetch<{
        data: LayerConfigLists;
      }>(
        `/panel/items/three_d_tiles?fields=layer_id,layer_alias,active,visible,opacity,point_color,point_size,category.*,preview,description&sort=layer_alias&${
          categoryId === staticKey.other
            ? `filter[category][_null]=true`
            : `filter[category][category_id][_eq]=${categoryId}`
        }`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + authStore.accessToken,
          },
        }
      ),
    ]);
    catalogueData.value = getLayersArr({
      vectorTiles,
      rasterTiles,
      threeDTiles,
    });
    isFetching.value = false;
  }
};

watchEffect(async () => {
  if (selectedCategory.value) {
    fetchData(selectedCategory.value);
  }
});

const applyFilter = (data: LayerLists[]) => {
  let currentData = data;
  //filter by format
  if (formatLists.value.length) {
    const filteredFormat = formatLists.value
      .filter((el) => el.checked === true && el.type !== "all")
      .map((el) => el.type);

    const filteredByFormat = currentData.filter((el: LayerLists) => {
      if (filteredFormat.length > 0) {
        return filteredFormat.includes(el.geometry_type);
      } else {
        return el;
      }
    });

    currentData = filteredByFormat;
  }

  //filter by dimension
  if (dimensionLists.value.length) {
    const dimensionFormat = dimensionLists.value
      .filter((el) => el.checked === true && el.type !== "all")
      .map((el) => el.type);

    const filteredByDimension = currentData.filter((el: LayerLists) => {
      if (dimensionFormat.length > 0) {
        return dimensionFormat.includes(el.dimension);
      } else {
        return el;
      }
    });

    currentData = filteredByDimension;
  }

  //filter by search
  if (searchFilter.value !== "") {
    const filteredBySearch = currentData.filter((el: LayerLists) => {
      if (el.source === "vector_tiles") {
        const name = el.layer_alias ?? el.layer_name;
        return name.toLowerCase().includes(searchFilter.value.toLowerCase());
      } else {
        return el.layer_alias
          ?.toLowerCase()
          .includes(searchFilter.value.toLowerCase());
      }
    });

    currentData = filteredBySearch;
  }

  filteredData.value = currentData.sort((a, b) => {
    let nameA: string;
    let nameB: string;
    if (a.source === "vector_tiles") {
      nameA = a.layer_alias?.toUpperCase() ?? a.layer_name.toUpperCase();
    } else {
      nameA = a.layer_alias.toUpperCase();
    }
    if (b.source === "vector_tiles") {
      nameB = b.layer_alias?.toUpperCase() ?? b.layer_name.toUpperCase();
    } else {
      nameB = b.layer_alias.toUpperCase();
    }
    if (sortOrder.value.id === "asc") {
      return nameA.localeCompare(nameB);
    } else {
      return nameB.localeCompare(nameA);
    }
  });
};

watchEffect(async () => {
  if (catalogueData.value.length > 0) {
    applyFilter(catalogueData.value);
  }
});
</script>

<template>
  <div class="flex flex-col gap-3 p-5 h-full max-h-full">
    <div class="flex justify-between">
      <div class="flex items-center gap-3">
        <IcFileSort
          v-if="mode === ''"
          class="text-grey-300 w-4 h-4"
          :fontControlled="false"
        />
        <IcFileAdd
          v-else
          class="text-grey-300 w-4 h-4"
          :fontControlled="false"
        />
        <h1 class="text-grey-50 text-xs">
          {{
            mode === "loadlocal"
              ? "Load Local Data"
              : mode === "upload"
              ? "Upload Data"
              : isOption
              ? "Load Local Data/Upload Data"
              : "Data Catalogue"
          }}
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
    <div v-if="!mode" class="h-full flex max-h-[calc(100%-2.25rem)]">
      <div
        class="flex flex-col text-white border border-grey-700 rounded-l-xs gap-2 overflow-hidden w-60"
      >
        <MapManagementCatalogueLists :disabled="isOption" />
        <div class="flex flex-col p-2 gap-2">
          <div class="border-t border-grey-700" />
          <UButton
            :ui="{ rounded: 'rounded-xxs' }"
            :label="!isOption ? 'Load Local/Upload Data' : 'Back to Catalogue'"
            variant="outline"
            color="brand"
            class="w-full justify-between text-xs"
            @click="
              () => {
                isOption = !isOption;
              }
            "
          >
            <template #trailing>
              <IcCloudUpload
                v-if="!isOption"
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
              :disabled="isOption"
              :sortOrder="sortOrder"
              @update-sort-order="updateSortOrder"
            />
            <MapManagementCatalogueFormatFilter
              :disabled="isOption"
              :list="formatLists"
              :handleChange="handleChangeFormatList"
            />
            <MapManagementCatalogueDimensionFilter
              :disabled="isOption"
              :list="dimensionLists"
              :handleChange="handleChangeDimensionList"
            />
          </div>
          <UInput
            :disabled="isOption"
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
        <MapManagementCatalogueHeader
          v-if="!isOption"
          :count="filteredData.length"
        />
        <div
          class="flex flex-col w-full h-full border border-grey-700 border-t-0 border-l-0 rounded-br-xs overflow-y-auto divide-y divide-grey-700"
        >
          <div
            v-if="filteredData.length === 0 && !isOption && !isFetching"
            class="flex items-center justify-center text-grey-400 text-sm w-full h-full"
          >
            No Data Layers Found
          </div>
          <div
            v-if="!isOption && !isFetching"
            class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mt-3 gap-3 p-3"
          >
            <MapManagementCatalogueItem
              v-for="layer of filteredData"
              :key="layer.layer_id"
              :item="layer"
              :isActive="
                activeLayers
                  ? activeLayers.findIndex(
                      (item) => item.layer_id === layer.layer_id
                    ) > -1
                  : false
              "
              @remove-loaded-layer="
                (layerId) => {
                  const loadedDataIdx = catalogueData.findIndex(
                    (el) => el.layer_id === layerId
                  );
                  catalogueData.splice(loadedDataIdx, 1);
                }
              "
            />
          </div>
          <div v-if="!isOption && isFetching" class="flex flex-col p-3 gap-1">
            <div
              class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mt-3 gap-3"
            >
              <div
                v-for="i of [0, 1, 2, 3, 4]"
                :key="i"
                class="flex flex-col gap-2 border border-grey-700 rounded-xs p-2"
              >
                <USkeleton
                  :ui="{ background: 'bg-grey-800', rounded: 'rounded-xxs' }"
                  class="h-6 w-1/4"
                />
                <USkeleton
                  :ui="{ background: 'bg-grey-800', rounded: 'rounded-xxs' }"
                  class="h-24 w-full"
                />
                <div class="flex flex-col gap-2">
                  <USkeleton
                    :ui="{ background: 'bg-grey-800' }"
                    class="h-3 w-1/3"
                  />
                  <USkeleton
                    :ui="{ background: 'bg-grey-800' }"
                    class="h-3 w-2/3"
                  />
                </div>
                <USkeleton
                  :ui="{ background: 'bg-grey-800', rounded: 'rounded-xxs' }"
                  class="w-full h-9"
                />
              </div>
            </div>
          </div>
          <MapManagementCatalogueUploadOption
            v-if="isOption"
            :mode="mode"
            @handle-change-mode="
              (modeValue) => {
                changeMode(modeValue);
              }
            "
          />
        </div>
      </div>
    </div>
    <MapManagementCatalogueLoadLocalData
      v-if="mode === 'loadlocal'"
      @handle-success="
        () => {
          changeMode('');
          isOption = false;
          fetchData(staticKey.loadedData);
        }
      "
      @handle-cancel="changeMode('')"
    />
    <MapManagementCatalogueUpload
      v-if="mode === 'upload'"
      @refresh-listed-layers="
        () => {
          if (selectedCategory) fetchData(selectedCategory);
        }
      "
      @handle-success="
        () => {
          changeMode('');
          isOption = false;
        }
      "
      @handle-cancel="changeMode('')"
    />
  </div>
</template>
