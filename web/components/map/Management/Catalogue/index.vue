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

const formatFilter = [
  { type: "all", label: "All Format", checked: true },
  { type: "CIRCLE", label: "Circle", checked: false },
  { type: "LINE", label: "Line", checked: false },
  { type: "POLYGON", label: "Polygon", checked: false },
  { type: "RASTER", label: "Raster", checked: false },
];
const formatLists = ref(formatFilter);
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
    formatLists.value[0].checked = false;
    formatLists.value[index].checked = value;
  }
};

const dimensionFilter = [
  { type: "all", label: "All Format", checked: true },
  { type: "2D", label: "2D", checked: false },
  { type: "3D", label: "3D", checked: false },
];
const dimensionLists = ref(dimensionFilter);
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
    dimensionLists.value[0].checked = false;
    dimensionLists.value[index].checked = value;
  }
};
const searchFilter = ref("");

const handleScroll = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

const searchRef = ref("");

const handleFormatFilter = () => {
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
  if (
    formatLists.value.filter((el) => el.checked === true)?.length > 0 ||
    dimensionLists.value.filter((el) => el.checked === true)?.length > 0
  ) {
    handleFormatFilter();
  }
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
            @click="
              () => {
                handleScroll(category.label.split(' ').join(''));
              }
            "
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
            <MapManagementCatalogueSelect />
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
          class="flex flex-col w-full h-full border border-t-0 border-l-0 rounded-br-xs overflow-y-auto divide-y"
        >
          <template
            v-for="category of filteredLayers
              ? filteredLayers
              : mapLayerStore.groupedLayerList"
          >
            <div
              class="flex flex-col px-3 py-2 gap-1"
              :id="category.label.split(' ').join('')"
            >
              <h3 class="text-grey-50">
                {{ category.label }}
              </h3>
              <p class="text-xs text-grey-50">description</p>
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
          </template>
          <div
            v-if="
              mapLayerStore.groupedLayerList?.length === 0 ||
              (filteredLayers && filteredLayers.length === 0)
            "
            class="flex flex-col w-full h-full border border-t-0 border-l-0 rounded-br-xs overflow-y-auto divide-y"
          >
            <div
              class="flex items-center justify-center text-grey-400 text-sm w-full h-full"
            >
              No Data Layers Found
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
