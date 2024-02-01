<script setup lang="ts">
import type { MapGeoJSONFeature, MapMouseEvent, PointLike } from "maplibre-gl";
import { ref } from "vue";
import maplibregl from "maplibre-gl";

type PopupItem = {
  layerType: string;
  tableName: string;
  rowId: string | number;
  clickPopupColumns: string[] | null;
  featureDetailColumns: string[] | null;
};

const contentRef = ref<HTMLDivElement>();
const popupItems = ref<PopupItem[]>([]);
const popupRef = ref<maplibregl.Popup>();

const mapRefStore = useMapRef();
const { map } = storeToRefs(mapRefStore);
const mapLayerStore = useMapLayer();

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

    console.log(featureList);
    popupItems.value = featureList as PopupItem[];
    if (popupRef.value) {
      popupRef.value.remove();
    }
    if (featureList.length && contentRef.value)
      popupRef.value = new maplibregl.Popup({
        closeButton: false,
      })
        .setLngLat(e.lngLat)
        .setMaxWidth("400px")
        .setDOMContent(contentRef.value)
        .addTo(map.value!);
  });
});

onUnmounted(() => {
  if (popupRef.value) {
    popupRef.value.remove();
  }
});
</script>

<template>
  <div class="hidden">
    <div ref="contentRef" class="font-map">Popup Test</div>
  </div>
</template>
