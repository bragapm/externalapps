import { defineStore } from "pinia";
import type { PopupItem } from "@/components/map/Popup.vue";

export const useFeature = defineStore("feature", () => {
  const feature = ref<PopupItem>();
  function setFeature(newFeature: PopupItem) {
    feature.value = newFeature;
  }
  return { feature, setFeature };
});
