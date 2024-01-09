<script setup lang="ts">
import IcTime from "~/assets/icons/ic-time.svg";
import IcPaint from "~/assets/icons/ic-paint.svg";
import IcForm from "~/assets/icons/ic-form.svg";
import IcEye from "~/assets/icons/ic-eye.svg";

const props = defineProps<{
  layerItem: LayerItem[];
}>();
</script>

<template>
  <template v-for="item in props.layerItem" :key="item.id">
    <div
      class="bg-grey-500 rounded-xxs p-2 flex justify-between items-center w-full"
    >
      <div class="text-white w-8/12">
        <p class="truncate">
          {{ item.label }}
        </p>
        <p class="truncate">{{ item.type }}</p>
      </div>
      <div class="flex gap-2 items-center justify-end w-4/12">
        <IcTime class="text-white" />
        <IcPaint class="text-white" />
        <IcForm class="text-white" />
        <IcEye class="text-white" />
      </div>
    </div>
  </template>
</template>
