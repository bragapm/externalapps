<script lang="ts" setup>
import IcEye from "~/assets/icons/ic-eye.svg";
import IcEyeCrossed from "~/assets/icons/ic-eye-crossed.svg";
import IcPaint from "~/assets/icons/ic-paint.svg";
import { TransitionRoot } from "@headlessui/vue";
import type { VectorTiles } from "~/utils/types";
import { storeToRefs } from "pinia";

const props = defineProps<{
  layerItem: VectorTiles;
}>();

const store = useMapRef();
const { map } = storeToRefs(store);

const storeLayer = useMapLayer();
const { handleVisibility } = storeLayer;

const groupIndex = computed(() => {
  if (storeLayer.groupedLayerList)
    if (props.layerItem.category) {
      return storeLayer.groupedLayerList.findIndex(
        (el) => el.label === props.layerItem.category.category_name
      );
    } else {
      return storeLayer.groupedLayerList.findIndex(
        (el) => el.label === "Others"
      );
    }
});

const layerIndex = computed(() => {
  if (groupIndex.value !== undefined) {
    if (storeLayer?.groupedLayerList?.[groupIndex.value]?.layerLists)
      return storeLayer.groupedLayerList[groupIndex.value].layerLists.findIndex(
        (el) => el.layer_id === props.layerItem.layer_id
      );
  }
});

const isShowStyling = ref(false);
const visibility = ref<string>(
  props.layerItem.geometry_type === "CIRCLE"
    ? props.layerItem.circle_style
      ? props.layerItem.circle_style.layout_visibility
      : "none"
    : props.layerItem.geometry_type === "POLYGON"
    ? props.layerItem?.fill_style?.layout_visibility === "visible"
      ? "visible"
      : "none"
    : props.layerItem.geometry_type === "LINE"
    ? props.layerItem?.line_style?.layout_visibility === "visible"
      ? "visible"
      : "none"
    : "none"
);
const opacity = ref<string>(
  props.layerItem.circle_style
    ? props.layerItem.circle_style.paint_circle_opacity
    : props.layerItem.fill_style
    ? props.layerItem.fill_style.paint_fill_opacity
    : props.layerItem.line_style
    ? props.layerItem.line_style.paint_line_opacity
    : "0"
);

const toggleVisibility = () => {
  if (groupIndex.value !== undefined && layerIndex.value !== undefined) {
    const currentVisibility =
      visibility.value === "visible" ? "none" : "visible";
    handleVisibility(groupIndex.value, layerIndex.value, currentVisibility);
    visibility.value = currentVisibility;
  }
  if (map.value) {
    if (props.layerItem.geometry_type === "CIRCLE") {
      const currentLayoutVisibility = map.value.getLayoutProperty(
        props.layerItem.layer_id + "_circle",
        "visibility"
      );
      map.value.setLayoutProperty(
        props.layerItem.layer_id + "_circle",
        "visibility",
        currentLayoutVisibility === "visible" ? "none" : "visible"
      );
    } else if (props.layerItem.geometry_type === "POLYGON") {
      const currentLayoutVisibility = map.value.getLayoutProperty(
        props.layerItem.layer_id + "_fill",
        "visibility"
      );
      map.value.setLayoutProperty(
        props.layerItem.layer_id + "_fill",
        "visibility",
        currentLayoutVisibility === "visible" ? "none" : "visible"
      );
    } else if (props.layerItem.geometry_type === "LINE") {
      const currentLayoutVisibility = map.value.getLayoutProperty(
        props.layerItem.layer_id + "_line",
        "visibility"
      );
      map.value.setLayoutProperty(
        props.layerItem.layer_id + "_line",
        "visibility",
        currentLayoutVisibility === "visible" ? "none" : "visible"
      );
    }
  }
};
</script>

<template>
  <div>
    <div
      :class="[
        isShowStyling
          ? 'bg-grey-700'
          : 'bg-transparent hover:ring-1 hover:ring-grey-500',
        'rounded-xxs p-2 flex justify-between items-center gap-2 w-full ',
      ]"
    >
      <div class="text-white w-8/12">
        <p class="truncate">
          {{
            layerItem.layer_alias ||
            (layerItem.source === "vector_tiles" && layerItem.layer_name)
          }}
        </p>
        <p class="truncate">
          {{ layerItem.geometry_type }}
        </p>
      </div>
      <div class="flex gap-2 items-center justify-end w-4/12">
        <button @click="isShowStyling = !isShowStyling">
          <IcPaint
            :class="[
              isShowStyling ? 'text-brand-500' : 'text-white',
              'w-3 h-3',
            ]"
            :fontControlled="false"
          />
        </button>
        <button @click="toggleVisibility">
          <IcEyeCrossed
            v-if="visibility === 'none'"
            class="text-white w-3 h-3"
            :fontControlled="false"
          />
          <IcEye v-else class="text-white w-3 h-3" :fontControlled="false" />
        </button>
        <MapManagementMenu :bounds="layerItem.bounds" />
      </div>
    </div>
    <TransitionRoot
      :show="isShowStyling"
      enter="transition duration-500 ease-in-out"
      enterFrom="transform max-h-0 opacity-0"
      enterTo="transform max-h-96 opacity-100"
      leave="transition duration-500 ease-in-out"
      leaveFrom="transform max-h-96 opacity-100"
      leaveTo="transform max-h-0 opacity-0"
      class="transition-all duration-500 ease-in-out"
    >
      <MapManagementStyling :opacity="opacity ? parseFloat(opacity) : 0" />
    </TransitionRoot>
  </div>
</template>
