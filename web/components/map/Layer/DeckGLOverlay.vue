<script setup lang="ts">
import { MapboxOverlay, type MapboxOverlayProps } from "@deck.gl/mapbox/src";
const store = useMapRef();
const { map } = storeToRefs(store);

const props = defineProps<{
  layers: MapboxOverlayProps;
}>();

const ctrl = computed(() => markRaw(new MapboxOverlay(props)));
watchEffect(async () => {
  if (map?.value) {
    if (!store.ctrl) {
      if (!map.value.hasControl(ctrl.value as any)) {
        map.value.addControl(ctrl.value as any);
        store.setCtrlRef(ctrl.value);
      }
    } else {
      if (props.layers.length === 0) {
        store.ctrl.finalize();
        store.setCtrlRef(null);
      } else {
        store.ctrl.setProps(props);
      }
    }
  }
});
</script>

<template></template>
