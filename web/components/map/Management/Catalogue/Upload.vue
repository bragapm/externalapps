<script lang="ts" setup>

const emit = defineEmits<{
  (e: "handleCancel"): void;
}>();

const cancel = () => {
  emit("handleCancel");
};
</script>

<template>
  <div class="h-full flex flex-col gap-4 max-h-[calc(100%-2.25rem)]">
    <div class="w-full h-full border border-neutral-700">

    </div>
    <UButton
      @click="cancel"
      :ui="{ rounded: 'rounded-xs' }"
      label="Cancel"
      variant="outline"
      color="brand"
      class="w-44 text-sm justify-center"
    >
    </UButton>
  </div>
</template>
