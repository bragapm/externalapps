import { defineStore } from "pinia";

export const useMapRef = defineStore("mapref", () => {
  const mapLoad = ref<boolean>(false);
  function setMapLoad(value: boolean) {
    mapLoad.value = value;
  }
  
  return { mapLoad, setMapLoad };
});
