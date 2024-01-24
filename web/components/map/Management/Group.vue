<script setup lang="ts">
import type { VectorTiles } from "~/utils/types";

const props = defineProps<{
  layerLists: VectorTiles[];
}>();
</script>

<template>
  <div class="flex flex-col gap-2">
    <template
      v-for="item in props.layerLists"
      :key="item.layer_name"
      class="space-y-2"
    >
      <MapManagementLayer :layerItem="item" />
    </template>
  </div>
</template>
