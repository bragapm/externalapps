<script lang="ts" setup>
import IcEye from "~/assets/icons/ic-eye.svg";
import IcEyeCrossed from "~/assets/icons/ic-eye-crossed.svg";
import IcPaint from "~/assets/icons/ic-paint.svg";
import { TransitionRoot } from "@headlessui/vue";
import type { VectorTiles } from "~/utils/types";

const props = defineProps<{
  layerItem: VectorTiles;
}>();

const store = useMapRef();
const { map } = storeToRefs(store);

const isShowStyling = ref(false);
const visibility = ref(props.layerItem.default ? "visible" : "none");
</script>

<template>
  <div>
    <div
      :class="[
        isShowStyling
          ? 'bg-grey-700'
          : 'bg-transparent hover:ring-1 hover:ring-grey-500',
        'rounded-xxs p-2 flex justify-between items-center gap-2 w-full ',
      ]"
    >
      <div class="text-white w-8/12">
        <p class="truncate">
          {{ layerItem.layer_name }}
        </p>
        <p class="truncate">{{ layerItem.geometry_type }}</p>
      </div>
      <div class="flex gap-2 items-center justify-end w-4/12">
        <button @click="isShowStyling = !isShowStyling">
          <IcPaint
            :class="[
              isShowStyling ? 'text-brand-500' : 'text-white',
              'w-3 h-3',
            ]"
            :fontControlled="false"
          />
        </button>
        <button
          @click="
            () => {
              if (map) {
                if (
                  map.getLayoutProperty(layerItem.layer_name, 'visibility') ===
                  'none'
                ) {
                  visibility = 'visible';
                  map.setLayoutProperty(
                    layerItem.layer_name,
                    'visibility',
                    'visible'
                  );
                } else {
                  visibility = 'none';
                  map.setLayoutProperty(
                    layerItem.layer_name,
                    'visibility',
                    'none'
                  );
                }
              }
            }
          "
        >
          <IcEyeCrossed
            v-if="visibility === 'none'"
            class="text-white w-3 h-3"
            :fontControlled="false"
          />
          <IcEye v-else class="text-white w-3 h-3" :fontControlled="false" />
        </button>
        <MapManagementMenu :bounds="layerItem.bounds" />
      </div>
    </div>
    <TransitionRoot
      :show="isShowStyling"
      enter="transition duration-500 ease-in-out"
      enterFrom="transform max-h-0 opacity-0"
      enterTo="transform max-h-96 opacity-100"
      leave="transition duration-500 ease-in-out"
      leaveFrom="transform max-h-96 opacity-100"
      leaveTo="transform max-h-0 opacity-0"
      class="transition-all duration-500 ease-in-out"
    >
      <MapManagementStyling />
    </TransitionRoot>
  </div>
</template>
