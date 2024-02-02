<script setup lang="ts">
import type { MapGeoJSONFeature, MapMouseEvent, PointLike } from "maplibre-gl";
import { ref } from "vue";
import maplibregl from "maplibre-gl";

export type PopupItem = {
  layerType: string;
  tableName: string;
  rowId: string | number;
  clickPopupColumns: string[] | null;
  featureDetailColumns: string[] | null;
};

const mapRefStore = useMapRef();
const featureStore = useFeature();
const { map } = storeToRefs(mapRefStore);
const mapLayerStore = useMapLayer();

const contentRef = ref<HTMLDivElement>();
const popupItems = ref<PopupItem[]>([]);
const popupRef = ref<maplibregl.Popup>();
const features = ref<any[]>([]);

watchEffect(() => {
  if (!map.value) return;
  map.value.on("click", (e: MapMouseEvent & Object) => {
    // The 'point' to query for features
    const point = [e.point.x, e.point.y];
    const filterLayers = mapLayerStore.groupedLayerList
      ?.map(({ layerLists }) => layerLists)
      .flat()
      .filter((e) => Boolean(e.click_popup_columns));

    // Query all the rendered features at the clicked point
    // across all layers using queryRenderedFeatures
    const features = map.value!.queryRenderedFeatures(point as PointLike, {
      layers: filterLayers?.map(({ layer_id }) => layer_id),
    });

    // Extracting the layer IDs from the features
    const featureList = features.map((feature: MapGeoJSONFeature) => {
      const foundLayer = filterLayers?.find(
        (layer) => layer.layer_id === feature.layer.id
      )!;
      return {
        layerType: feature.layer.type,
        tableName: feature.sourceLayer,
        rowId: feature.id,
        clickPopupColumns: foundLayer.click_popup_columns,
        featureDetailColumns: foundLayer.feature_detail_columns,
      };
    });

    // console.log(featureList);
    popupItems.value = featureList as PopupItem[];
    if (popupRef.value) {
      popupRef.value.remove();
    }
    if (featureList.length && contentRef.value) {
      popupRef.value = new maplibregl.Popup({
        closeButton: false,
        className: "geod-popup",
      })
        .setLngLat(e.lngLat)
        .setMaxWidth("400px")
        .setDOMContent(contentRef.value)
        .addTo(map.value!);
    }
  });
});

onUnmounted(() => {
  if (popupRef.value) {
    popupRef.value.remove();
  }
});

const handleClose = () => {
  popupRef.value!.remove();
};

watch(popupItems, async (_, newItems) => {
  if (newItems?.length) {
    const fetchFeature = async (popupItem: PopupItem) => {
      try {
        const querystring = new URLSearchParams({
          fields: popupItem.clickPopupColumns!.join(","),
        } as Record<string, string>);
        const response: { data: any } = await $fetch(
          `/panel/items/${popupItem.tableName}/${popupItem.rowId}?${querystring}`
        );
        return response.data;
      } catch (error) {
        return null;
      }
    };
    const data = await Promise.all(newItems.map((item) => fetchFeature(item)));
    features.value = data;
  }
});

const itemIndex = ref(0);
const nextIndex = () => {
  if (itemIndex.value === popupItems.value.length - 1) return;
  const i = itemIndex.value + 1;
  itemIndex.value = i % popupItems.value.length;
};
const prevIndex = () => {
  if (itemIndex.value === 0) return;
  const i = itemIndex.value - 1;
  itemIndex.value = i % popupItems.value.length;
};
</script>

<template>
  <div class="hidden">
    <div ref="contentRef">
      <section
        class="flex min-w-[240px] max-w-[400px] flex-col items-center justify-center gap-2 px-6 py-3 overflow-hidden bg-grey-700 rounded-sm text-grey-100 divide-y divide-grey-100"
      >
        <header class="flex justify-between w-full">
          <h4 class="text-base">Detail Popup</h4>
          <button @click="handleClose">X</button>
        </header>

        <article class="w-full py-3" v-if="popupItems?.length">
          <h5 class="text-sm">Layer</h5>
          <div class="flex text-xs">
            <p class="w-1/3">Name</p>
            <p>: {{ popupItems[itemIndex].tableName }}</p>
          </div>
          <div class="flex text-xs">
            <p class="w-1/3">Type</p>
            <p>: {{ popupItems[itemIndex].layerType }}</p>
          </div>

          <h5 class="text-sm mt-3">Feature</h5>
          <div
            v-for="(value, key) in features[itemIndex]"
            :key="key"
            class="flex"
          >
            <p class="w-1/3 text-xs">{{ key }}</p>
            <p>: {{ value }}</p>
          </div>
        </article>

        <footer class="w-full flex justify-between items-center pt-2 space-x-3">
          <button
            :disabled="popupItems?.length < 2"
            @click="prevIndex"
            class="rounded-full border w-7 h-7 flex justify-center items-center"
          >
            &lt;
          </button>
          <button
            @click="
              () => {
                featureStore.setFeature(popupItems[itemIndex]);
              }
            "
            class="border rounded-md px-3 py-2"
          >
            More Detail
          </button>
          <button
            :disabled="popupItems?.length < 2"
            @click="nextIndex"
            class="rounded-full border w-7 h-7 flex justify-center items-center"
          >
            >
          </button>
        </footer>
      </section>
    </div>
  </div>
</template>
