<script setup lang="ts">
const props = defineProps<{
  layerItem: LayerItem[];
}>();
</script>

<template>
  <div class="flex flex-col gap-2">
    <template v-for="item in props.layerItem" :key="item.id" class="space-y-2">
      <MapManagementLayer :layerLabel="item.label" :layerType="item.type"/>
    </template>
  </div>
</template>
