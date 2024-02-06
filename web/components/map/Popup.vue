<script setup lang="ts">
import type { MapGeoJSONFeature, MapMouseEvent, PointLike } from "maplibre-gl";
import { ref } from "vue";
import maplibregl from "maplibre-gl";
import placeholderImg from "~/assets/images/landing/ecopark.jpg";
import IcArrowReg from "~/assets/icons/ic-arrow-reg.svg";
import IcCross from "~/assets/icons/ic-cross.svg";

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
const isFetching = ref(false);

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

watchEffect(async () => {
  if (popupItems.value?.length) {
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
        return {};
      }
    };
    isFetching.value = true;
    const data = await Promise.all(
      popupItems.value.map((item) => fetchFeature(item))
    );
    isFetching.value = false;
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
        class="flex w-72 flex-col items-center justify-center gap-3 p-3 overflow-hidden bg-grey-800 rounded-xs text-grey-100"
      >
        <header
          class="flex justify-between w-full border-b pb-1 border-grey-700"
        >
          <h4 class="text-xs font-medium">Detail Popup</h4>
          <IcCross
            role="button"
            :fontControlled="false"
            @click="handleClose"
            class="w-3 h-3 text-grey-400"
          ></IcCross>
        </header>

        <img :src="placeholderImg" alt="feature image" class="rounded-xs" />

        <article
          class="w-full space-y-2 max-h-40 overflow-y-scroll"
          v-if="popupItems?.length"
        >
          <h5 class="text-xs font-medium">Layer</h5>
          <div class="flex text-grey-400 space-x-2">
            <p class="text-2xs w-1/4">Name</p>
            <p class="text-xs">: {{ popupItems[itemIndex].tableName }}</p>
          </div>
          <div class="flex text-grey-400 space-x-2">
            <p class="text-2xs w-1/4">Type</p>
            <p class="text-xs">: {{ popupItems[itemIndex].layerType }}</p>
          </div>

          <h5 class="text-xs font-medium">Feature</h5>
          <template v-if="isFetching">
            <div
              v-for="(_, idx) in Array.from({ length: 3 })"
              :key="idx"
              class="flex space-x-2 animate-pulse"
            >
              <div class="w-1/4 h-4 bg-grey-700 rounded-xs"></div>
              <div class="grow h-4 bg-grey-700 rounded-xs"></div>
            </div>
          </template>
          <template v-else>
            <div
              v-for="(value, key) in features[itemIndex]"
              :key="key"
              class="flex text-grey-400 space-x-2"
            >
              <p class="text-2xs w-1/4">{{ key }}</p>
              <p class="text-xs">: {{ value }}</p>
            </div>
          </template>
        </article>

        <footer class="w-full flex items-center pt-2 space-x-2">
          <IcArrowReg
            role="button"
            :fontControlled="false"
            :disabled="popupItems?.length < 2"
            @click="prevIndex"
            class="rounded-xs border w-9 h-9 flex justify-center items-center -rotate-90 text-grey-400 border-grey-400"
          >
            &lt;
          </IcArrowReg>
          <button
            @click="
              () => {
                featureStore.setFeature(popupItems[itemIndex]);
                featureStore.setRightSidebar('feature');
              }
            "
            class="rounded-xs grow h-9 bg-brand-600 text-sm font-medium"
          >
            More Detail
          </button>
          <IcArrowReg
            role="button"
            :fontControlled="false"
            :disabled="popupItems?.length < 2"
            @click="nextIndex"
            class="rounded-xs border w-9 h-9 flex justify-center items-center rotate-90 text-grey-400 border-grey-400"
          >
            >
          </IcArrowReg>
        </footer>
      </section>
    </div>
  </div>
</template>
