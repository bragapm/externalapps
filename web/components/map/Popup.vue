<script setup lang="ts">
import type {
  GeoJSONSource,
  LngLatBoundsLike,
  Map,
  MapGeoJSONFeature,
  MapMouseEvent,
  PointLike,
} from "maplibre-gl";
import { ref } from "vue";
import maplibregl from "maplibre-gl";
import IcArrowReg from "~/assets/icons/ic-arrow-reg.svg";
import IcCross from "~/assets/icons/ic-cross.svg";
import KeenSlider, { type KeenSliderInstance } from "keen-slider";
import type { Raw } from "vue";
import tailwindConfig from "~/tailwind.config";
import bbox from "@turf/bbox";

const showHighlightLayer = (
  map: Raw<Map>,
  featureList: { geom: GeoJSON.Geometry }[]
) => {
  const newData: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: featureList
      .filter((_, idx) => idx === 0)
      .map(({ geom, ...rest }) => ({
        type: "Feature",
        properties: rest,
        geometry: geom,
      })),
  };
  map?.fitBounds(bbox(newData) as LngLatBoundsLike, { padding: 20 });
  if (map.getSource("highlight")) {
    (map.getSource("highlight") as GeoJSONSource).setData(newData);
  } else {
    map.addSource("highlight", {
      type: "geojson",
      data: newData,
    });

    // add a line layer without line-dasharray defined to fill the gaps in the dashed line
    map.addLayer({
      type: "line",
      source: "highlight",
      id: "line-background",
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": (tailwindConfig.theme?.colors as any).grey["600"],
        "line-width": 6,
        "line-opacity": 0.3,
      },
      filter: ["!=", "$type", "Point"],
    });

    // add a line layer with line-dasharray set to the first value in dashArraySequence
    map.addLayer({
      type: "line",
      source: "highlight",
      id: "line-dashed",
      layout: { "line-join": "round" },
      paint: {
        "line-color": (tailwindConfig.theme?.colors as any).grey["300"],
        "line-width": 6,
        "line-opacity": 0.6,
        "line-dasharray": [0, 4, 3],
      },
      filter: ["!=", "$type", "Point"],
    });

    // technique based on https://jsfiddle.net/2mws8y3q/
    // an array of valid line-dasharray values, specifying the lengths of the alternating dashes and gaps that form the dash pattern
    const dashArraySequence = [
      [0, 4, 3],
      [0.5, 4, 2.5],
      [1, 4, 2],
      [1.5, 4, 1.5],
      [2, 4, 1],
      [2.5, 4, 0.5],
      [3, 4, 0],
      [0, 0.5, 3, 3.5],
      [0, 1, 3, 3],
      [0, 1.5, 3, 2.5],
      [0, 2, 3, 2],
      [0, 2.5, 3, 1.5],
      [0, 3, 3, 1],
      [0, 3.5, 3, 0.5],
    ];

    let step = 0;

    function animateDashArray(timestamp: DOMHighResTimeStamp) {
      // Update line-dasharray using the next value in dashArraySequence. The
      // divisor in the expression `timestamp / 50` controls the animation speed.
      const newStep = parseInt(
        ((timestamp / 60) % dashArraySequence.length).toString()
      );

      if (newStep !== step) {
        map.setPaintProperty(
          "line-dashed",
          "line-dasharray",
          dashArraySequence[step]
        );
        step = newStep;
      }

      // Request the next frame of the animation.
      requestAnimationFrame(animateDashArray);
    }

    // start the animation
    animateDashArray(0);
  }
};

const sliderContainer = ref<HTMLElement | null>(null);
let slider: KeenSliderInstance | null = null;
let nextImage: (e: MouseEvent) => void;
let prevImage: (e: MouseEvent) => void;

onMounted(() => {
  if (sliderContainer.value) {
    slider = new KeenSlider(sliderContainer.value!, {
      loop: true,
    });
    nextImage = (e: MouseEvent) => {
      slider?.update();
      slider?.next();
    };

    prevImage = (e: MouseEvent) => {
      slider?.update();
      slider?.prev();
    };
  }
});

onUnmounted(() => {
  slider?.destroy();
});

// Popup Logic
export type PopupItem = {
  layerType: string;
  tableName: string;
  rowId: string | number;
  clickPopupColumns: string[] | null;
  imageColumns: string[] | null;
  featureDetailColumns: string[] | null;
  geometry: GeoJSON.Geometry;
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
    const filterLayers = mapLayerStore.groupedActiveLayers
      ?.map(({ layerLists }) => layerLists)
      .flat()
      .filter((e) => Boolean(e.click_popup_columns));

    // Query all the rendered features at the clicked point
    // across all layers using queryRenderedFeatures
    const features = map.value!.queryRenderedFeatures(point as PointLike, {
      layers: filterLayers?.map(({ layer_id }) => layer_id),
    });

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
        imageColumns: foundLayer.image_columns,
      };
    });

    popupItems.value = featureList as PopupItem[];
    if (popupRef.value) {
      popupRef.value.remove();
    }
    if (featureList.length && contentRef.value) {
      popupRef.value = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        closeOnMove: false,
        className: "geod-popup",
      })
        .setLngLat(e.lngLat)
        .setMaxWidth("400px")
        .setDOMContent(contentRef.value)
        .addTo(map.value!);
      window.dispatchEvent(new Event("resize"));
      slider?.moveToIdx(0);
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
          fields: [
            "geom",
            ...popupItem.clickPopupColumns!,
            ...popupItem.imageColumns!,
          ]!.join(","),
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
    showHighlightLayer(map.value!, data as any[]);
  }
});

const itemIndex = ref(0);
const nextIndex = () => {
  if (itemIndex.value === popupItems.value.length - 1) return;
  itemIndex.value++;
  const newData: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: features.value
      .filter((_, idx) => idx === itemIndex.value)
      .map(({ geom, ...rest }) => ({
        type: "Feature",
        properties: rest,
        geometry: geom,
      })),
  };
  (map.value!.getSource("highlight") as GeoJSONSource).setData(newData);
  map.value!.fitBounds(bbox(newData) as LngLatBoundsLike, { padding: 20 });
  slider?.moveToIdx(0);
};
const prevIndex = () => {
  if (itemIndex.value === 0) return;
  itemIndex.value--;
  const newData: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: features.value
      .filter((_, idx) => idx === itemIndex.value)
      .map(({ geom, ...rest }) => ({
        type: "Feature",
        properties: rest,
        geometry: geom,
      })),
  };
  (map.value!.getSource("highlight") as GeoJSONSource).setData(newData);
  map.value!.fitBounds(bbox(newData) as LngLatBoundsLike, { padding: 20 });
  slider?.moveToIdx(0);
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
            @click="
              () => {
                (map?.getSource('highlight') as GeoJSONSource)
                .setData({
                  type: 'FeatureCollection',
                  features: []
                } as any );
                handleClose();
              }
            "
            class="w-3 h-3 text-grey-400"
          ></IcCross>
        </header>

        <div
          :class="`relative w-full ${
            popupItems[itemIndex]?.imageColumns?.length ? 'h-40' : 'h-0'
          }`"
        >
          <div
            ref="sliderContainer"
            class="keen-slider h-full w-full rounded-xs"
          >
            <img
              class="keen-slider__slide object-cover min-w-full max-w-full"
              v-for="(val, idx) of Object.keys(features[itemIndex] ?? {})
                .filter((k) => popupItems[itemIndex].imageColumns?.includes(k))
                .map((k) =>
                  features[itemIndex][k].includes(',')
                    ? features[itemIndex][k].split(',')
                    : features[itemIndex][k]
                )
                .flat()"
              :key="idx"
              :src="val"
            />
          </div>

          <button
            v-if="
              Object.keys(features[itemIndex] ?? {}).filter((k) =>
                popupItems[itemIndex].imageColumns?.includes(k)
              ).length
            "
            @click="prevImage"
            class="absolute left-2 top-1/2 -translate-y-1/2 flex justify-center items-center border rounded-xs bg-black opacity-40"
          >
            <IcArrowReg
              :fontControlled="false"
              class="w-5 h-5 m-1 -rotate-90 text-grey-50"
            />
          </button>

          <button
            v-if="
              Object.keys(features[itemIndex] ?? {}).filter((k) =>
                popupItems[itemIndex].imageColumns?.includes(k)
              ).length
            "
            @click="nextImage"
            class="absolute right-2 top-1/2 -translate-y-1/2 flex justify-center items-center border rounded-xs bg-black opacity-40"
          >
            <IcArrowReg
              :fontControlled="false"
              class="w-5 h-5 m-1 rotate-90 text-grey-50"
            />
          </button>
        </div>

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
              v-for="key of Object.keys(features[itemIndex] ?? {}).filter((k) =>
                popupItems[itemIndex].clickPopupColumns?.includes(k)
              )"
              :key="key"
              class="flex text-grey-400 space-x-2"
            >
              <p class="text-2xs w-1/4">{{ key }}</p>
              <p class="text-xs">: {{ features[itemIndex][key] }}</p>
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
          />
          <button
            @click="
              () => {
                featureStore.setFeature(popupItems[itemIndex]);
                featureStore.setRightSidebar('feature');
                handleClose();
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
          />
        </footer>
      </section>
    </div>
  </div>
</template>

<style>
@import url("keen-slider/keen-slider.css");
</style>
