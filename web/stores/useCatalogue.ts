import { defineStore } from "pinia";

export const useCatalogue = defineStore("catalogueData", () => {
  const showCatalogue = ref<boolean>(false);
  function toggleCatalogue() {
    showCatalogue.value = !showCatalogue.value;
  }
  return { showCatalogue, toggleCatalogue };
});
