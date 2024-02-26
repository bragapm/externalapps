import { defineStore } from "pinia";
import type { PopupItem } from "@/components/map/Popup.vue";

export type rightSidebarEnum = "mapinfo" | "feature" | "3d-feature" | "";

export const useFeature = defineStore("feature", () => {
  const feature = ref<PopupItem>();
  function setFeature(newFeature: PopupItem | undefined) {
    feature.value = newFeature;
  }
  const threeDfeature = ref<{ header: Object; content: Object }>();
  function set3DFeature(
    newFeature: { header: Object; content: Object } | undefined
  ) {
    threeDfeature.value = newFeature;
  }
  const rightSidebar = ref<rightSidebarEnum>("");
  function setRightSidebar(newValue: rightSidebarEnum) {
    rightSidebar.value = newValue;
  }
  return {
    feature,
    setFeature,
    threeDfeature,
    set3DFeature,
    rightSidebar,
    setRightSidebar,
  };
});
