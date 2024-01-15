<script setup lang="ts">
import IcEye from "~/assets/icons/ic-eye.svg";
import IcPaint from "~/assets/icons/ic-paint.svg";
import IcTime from "~/assets/icons/ic-time.svg";

const props = defineProps<{
  layerItem: LayerItem[];
}>();

</script>

<template>
  <div class="flex flex-col gap-2">
    <template v-for="item in props.layerItem" :key="item.id" class="space-y-2">
      <div
        class="bg-transparent rounded-xxs p-2 flex justify-between items-center gap-2 w-full hover:ring-1 hover:ring-grey-500"
      >
        <div class="text-white w-8/12">
          <p class="truncate">
            {{ item.label }}
          </p>
          <p class="truncate">{{ item.type }}</p>
        </div>
        <div class="flex gap-2 items-center justify-end w-4/12">
          <IcTime class="text-white w-3 h-3" :fontControlled="false" />
          <IcPaint class="text-white w-3 h-3" :fontControlled="false" />
          <IcEye class="text-white w-3 h-3" :fontControlled="false" />
          <!-- <IcMenuDots class="text-white" /> -->

          <MapLayerManagementMenu />
        </div>
      </div>
    </template>
  </div>
</template>
