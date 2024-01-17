import { defineStore } from "pinia";

export const useTableData = defineStore("tableData", () => {
  const showTable = ref<boolean>(false);
  const fullscreen = ref<boolean>(false);
  function toggleTable() {
    showTable.value = !showTable.value;
  }
  function toggleFullscreen() {
    fullscreen.value = !fullscreen.value;
  }
  return { showTable, toggleTable, fullscreen, toggleFullscreen };
});
