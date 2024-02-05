import { defineStore } from "pinia";

export const useMapTools = defineStore("mapTools", () => {
  const expandTools = ref<boolean>(false);
  function toggleExpandTools() {
    expandTools.value = !expandTools.value;
  }
  return { expandTools, toggleExpandTools };
});
