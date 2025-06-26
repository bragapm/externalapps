<script lang="ts" setup>
const props = defineProps<{
  modelValue?: File;
  label: string;
  name: string;
  placeholder?: string;
  accept?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", file: File | undefined): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const fileName = ref("");

function openFileDialog() {
  fileInput.value?.click();
}

function handleFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  fileName.value = file?.name || "";
  emit("update:modelValue", file);
}
</script>

<template>
  <UFormField :label="label" :name="name">
    <div class="relative">
      <UInput
        readonly
        :placeholder="placeholder"
        :model-value="fileName"
        @click="openFileDialog"
        class="w-full cursor-pointer"
        :ui="{ base: ['h-10'] }"
      >
        <template #trailing>
          <slot name="icon">
            <UIcon
              name="i-simple-line-icons-cloud-upload"
              class="text-grey-500 size-5"
            />
          </slot>
        </template>
      </UInput>
      <input
        ref="fileInput"
        type="file"
        class="hidden"
        :accept="accept"
        @change="handleFileChange"
      />
    </div>
  </UFormField>
</template>
