import { defineStore } from "pinia";
import type { PopupItem } from "@/components/map/Popup.vue";

export type rightSidebarEnum = "mapinfo" | "feature" | "";

export const useFeature = defineStore("feature", () => {
  const feature = ref<PopupItem>();
  function setFeature(newFeature: PopupItem) {
    feature.value = newFeature;
  }
  const rightSidebar = ref<rightSidebarEnum>("");
  function setRightSidebar(newValue: rightSidebarEnum) {
    rightSidebar.value = newValue;
  }
  return {
    feature,
    setFeature,
    rightSidebar,
    setRightSidebar,
  };
});
