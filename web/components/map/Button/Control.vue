<script setup lang="ts">
const props = defineProps<{
  onClick: () => void;
  active: boolean;
}>();
</script>

<template>
  <div class="p-2 rounded-lg">
    <UButton
      @click="onClick"
      size="sm"
      :class="active ? 'text-brand-500 bg-brand-50' : 'text-grey-700 bg-transparent'"
      class="hover:bg-brand-50 hover:text-brand-500 p-2 rounded-lg"
    >
      <slot></slot>
    </UButton>
  </div>
</template>
