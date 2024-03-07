import { defineStore } from "pinia";
import type { Raw } from "vue";
import { Map, GeolocateControl } from "maplibre-gl";

export const useMapRef = defineStore("mapref", () => {
  const mapLoad = ref<boolean>(false);
  const map = ref<null | Raw<Map>>(null);
  const ctrl = ref<null | any>(null);
  const geolocateRef = ref<null | Raw<GeolocateControl>>(null);
  const currentBasemap = ref("default");
  function setMapLoad(value: boolean) {
    mapLoad.value = value;
  }
  function setMapRef(value: null | Raw<Map>) {
    map.value = value;
  }
  function setCtrlRef(value: null | any) {
    ctrl.value = value;
  }
  function setGeolocateRef(value: null | Raw<GeolocateControl>) {
    geolocateRef.value = value;
  }
  function setCurrentBaseMap(value: string) {
    currentBasemap.value = value;
  }

  return {
    mapLoad,
    setMapLoad,
    map,
    setMapRef,
    geolocateRef,
    setGeolocateRef,
    ctrl,
    setCtrlRef,
    currentBasemap,
    setCurrentBaseMap,
  };
});
