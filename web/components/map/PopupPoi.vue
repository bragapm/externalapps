<script lang="ts" setup>
import maplibregl from "maplibre-gl";
import IcCross from "~/assets/icons/ic-cross.svg";
import type {
  GeoJSONSource,
  MapGeoJSONFeature,
  MapMouseEvent,
  PointLike,
} from "maplibre-gl";
const mapRefStore = useMapRef();
const { map } = storeToRefs(mapRefStore);

const contentRef = ref<HTMLDivElement>();
const popupRef = ref<maplibregl.Popup>();

const layerId = "poi_circle_layer";

const onMouseEnter = () => {
  map.value!.getCanvas().style.cursor = "pointer";
};
const onMouseLeave = () => {
  map.value!.getCanvas().style.cursor = "";
};

watchEffect(() => {
  if (map.value) {
    map.value.on(
      "click",
      layerId,
      (e: MapMouseEvent & { features?: MapGeoJSONFeature[] }) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const geometry = feature.geometry;
        if (geometry.type === "Point") {
          const coordinates = geometry.coordinates.slice();

          if (popupRef.value) {
            popupRef.value.remove();
          }
          if (contentRef.value) {
            popupRef.value = new maplibregl.Popup({
              closeButton: false,
              className: "geod-popup",
            })
              .setLngLat(coordinates as [number, number])
              .setMaxWidth("400px")
              .setDOMContent(contentRef.value)
              .addTo(map.value!);
          }
        }
      }
    );

    map.value.on("mouseenter", layerId, onMouseEnter);
    map.value.on("mouseleave", layerId, onMouseLeave);
  }
});

const removePopup = () => {
  popupRef.value!.remove();
  (map.value!.getSource("highlight") as GeoJSONSource).setData(
    emptyFeatureCollection
  );
  pauseAllAnimation();
};
</script>

<template>
  <div class="hidden">
    <div ref="contentRef">
      <section
        class="flex w-72 flex-col items-center justify-center gap-3 p-3 overflow-hidden rounded-xs text-grey-950 bg-grey-200"
      >
        <header
          class="flex justify-between items-center w-full border-b pb-1 border-grey-700"
        >
          <h4 class="text-xs font-medium">Karyawan</h4>
          <IcCross
            role="button"
            :fontControlled="false"
            @click="removePopup"
            class="-mr-1 w-5 h-4 px-1 py-0.5 text-grey-600"
          ></IcCross>
        </header>
        <article class="w-full space-y-2 max-h-40 overflow-y-scroll">
          <div class="flex text-grey-950 space-x-2">
            <p class="text-2xs w-1/3">Name</p>
            <p class="text-xs font-medium">: name</p>
          </div>
          <div class="flex text-grey-950 space-x-2">
            <p class="text-2xs w-1/3">iSafe Number</p>
            <p class="text-xs font-medium">: text</p>
          </div>
          <div class="flex text-grey-950 space-x-2">
            <p class="text-2xs w-1/3">Tipe Karyawan</p>
            <p class="text-xs font-medium">: text</p>
          </div>
          <div class="flex text-grey-950 space-x-2">
            <p class="text-2xs w-1/3">Role</p>
            <p class="text-xs font-medium">: text</p>
          </div>
        </article>
        <UButton @click="" class="w-full justify-center">More Detail</UButton>
      </section>
    </div>
  </div>
</template>
