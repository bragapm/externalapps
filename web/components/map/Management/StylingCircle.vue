<script lang="ts" setup>
import IcArrow from "~/assets/icons/ic-arrow-reg.svg";
// import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";
// import { useFloating, offset, flip, size } from "@floating-ui/vue";
import { inject } from "vue";

const props = defineProps<{
  layerItem: VectorTiles;
}>();

const groupIndex = inject("groupIndexProvider");
const layerIndex = inject("layerIndexProvider");

const circleRadius = ref(
  (props.layerItem.layer_style as CircleStyles).paint_circle_radius
);
const circleStrokeWidth = ref(
  (props.layerItem.layer_style as CircleStyles).paint_circle_stroke_width
);
const fillOpacity = ref(
  parseFloat(
    (props.layerItem.layer_style as CircleStyles).paint_circle_opacity
  ) * 100
);
const strokeOpacity = ref(
  parseFloat(
    (props.layerItem.layer_style as CircleStyles).paint_circle_stroke_opacity
  ) * 100
);
const fillColor = ref(
  (props.layerItem.layer_style as CircleStyles).paint_circle_color
);
const strokeColor = ref(
  (props.layerItem.layer_style as CircleStyles).paint_circle_stroke_color
);

// const reference = ref(null);
// const floating = ref(null);
// const { floatingStyles } = useFloating(reference, floating, {
//   placement: "bottom-start",
//   middleware: [
//     offset(10),
//     flip(),
//     size({
//       apply({ rects, elements }) {
//         Object.assign(elements.floating.style, {
//           width: `${rects.reference.width}px`,
//         });
//       },
//     }),
//   ],
// });

const store = useMapLayer();
const { updateLayerProperty } = store;
const mapStore = useMapRef();
const { map } = storeToRefs(mapStore);

const handleChangeProperty = (
  propType: "paint" | "layout",
  value: string | number,
  propName: string
) => {
  updateLayerProperty(
    groupIndex as number,
    layerIndex as number,
    propType,
    propName,
    value
  );
  if (map.value) {
    if (propType === "paint") {
      map.value.setPaintProperty(props.layerItem.layer_id, propName, value);
    } else if (propType === "layout") {
      map.value.setLayoutProperty(props.layerItem.layer_id, propName, value);
    }
  }
};
</script>

<template>
  <div>
    <div class="bg-grey-800 rounded-xxs p-2 space-y-1">
      <p class="text-grey-50 text-2xs">Appearance</p>
      <div class="grid grid-cols-2 gap-1">
        <p class="text-grey-400 text-2xs self-center">Size</p>
        <UInput
          v-model="circleRadius"
          @blur="
            (e) => {
              handleChangeProperty('paint',parseFloat(e.target.value as string), 'circle-radius');
            }
          "
          type="number"
          color="gray"
          :ui="{ rounded: 'rounded-xxs' }"
          placeholder="Circle Radius"
          size="2xs"
          min="0"
          max="100"
        >
          <template #trailing>
            <span class="text-grey-400 text-2xs">px</span>
          </template>
        </UInput>
      </div>
      <p class="text-grey-400 text-2xs">Stroke</p>
      <div class="grid grid-cols-4 gap-1">
        <div class="col-span-3"></div>
        <UInput
          v-model="circleStrokeWidth"
          @blur="
            (e) => {
              handleChangeProperty('paint',parseFloat(e.target.value as string), 'circle-stroke-width');
            }
          "
          type="number"
          color="gray"
          :ui="{ rounded: 'rounded-xxs' }"
          placeholder="Circle Radius"
          size="2xs"
          min="0"
          max="100"
        >
          <template #trailing>
            <span class="text-grey-400 text-2xs">px</span>
          </template>
        </UInput>
      </div>
      <div class="grid grid-cols-4 gap-1">
        <URange
          v-model="strokeOpacity"
          @input="
            (e:any) => {
              handleChangeProperty('paint',parseFloat(e.target.value as string)/100, 'circle-stroke-opacity');
            }
          "
          name="range"
          size="sm"
          color="gray"
          :ui="{
            background: 'bg-grey-800',
            thumb: {
              background:
                '[&::-webkit-slider-thumb]:bg-grey-400 [&::-webkit-slider-thumb]:dark:bg-gray-400',
              ring: '[&::-webkit-slider-thumb]:ring-0 [&::-webkit-slider-thumb]:ring-current',
            },
            track: {
              background:
                '[&::-webkit-slider-runnable-track]:bg-gray-700 [&::-moz-range-track]:bg-gray-700 [&::-webkit-slider-runnable-track]:dark:bg-gray-700 [&::-moz-range-track]:dark:bg-gray-700',
            },
          }"
          :min="0"
          :max="100"
          class="self-center col-span-3"
        />
        <UInput
          v-model="strokeOpacity"
          @blur="
             (e) => {
              handleChangeProperty('paint',parseFloat(e.target.value as string)/100, 'circle-opacity');
            }
          "
          type="number"
          color="gray"
          :ui="{ rounded: 'rounded-xxs' }"
          placeholder="Fill Opacity"
          size="2xs"
          min="0"
          max="100"
        >
          <template #trailing>
            <span class="text-grey-400 text-2xs">%</span>
          </template>
        </UInput>
      </div>
      <UInput
        v-model="strokeColor"
        @input="
          (e:any) => {
            handleChangeProperty('paint',e.target.value, 'circle-stroke-color');
          }
        "
        type="color"
        variant="none"
        :padded="false"
        :ui="{ rounded: 'rounded-xxs' }"
        inputClass="cursor-pointer [&::-webkit-color-swatch]:rounded-[4px] [&::-webkit-color-swatch]:border-0 bg-grey-700 focus:ring-0 focus:border-none border-1 border-grey-600 px-2 py-1"
      >
        <template #trailing>
          <IcArrow
            class="w-4 h-4 rotate-180 text-grey-400"
            :fontControlled="false"
          />
        </template>
      </UInput>
    </div>
    <div class="bg-grey-800 rounded-xxs p-2 space-y-1">
      <p class="text-grey-50 text-2xs">Color</p>
      <p class="text-grey-400 text-2xs">Fill Color Opacity</p>
      <div class="grid grid-cols-4 gap-1">
        <URange
          v-model="fillOpacity"
          @input="
            (e:any) => {
              handleChangeProperty('paint',parseFloat(e.target.value as string)/100, 'circle-opacity');
            }
          "
          name="range"
          size="sm"
          color="gray"
          :ui="{
            background: 'bg-grey-800',
            thumb: {
              background:
                '[&::-webkit-slider-thumb]:bg-grey-400 [&::-webkit-slider-thumb]:dark:bg-gray-400',
              ring: '[&::-webkit-slider-thumb]:ring-0 [&::-webkit-slider-thumb]:ring-current',
            },
            track: {
              background:
                '[&::-webkit-slider-runnable-track]:bg-gray-700 [&::-moz-range-track]:bg-gray-700 [&::-webkit-slider-runnable-track]:dark:bg-gray-700 [&::-moz-range-track]:dark:bg-gray-700',
            },
          }"
          :min="0"
          :max="100"
          class="self-center col-span-3"
        />
        <UInput
          v-model="fillOpacity"
          @blur="
             (e) => {
              handleChangeProperty('paint',parseFloat(e.target.value as string)/100, 'circle-opacity');
            }
          "
          type="number"
          color="gray"
          :ui="{ rounded: 'rounded-xxs' }"
          placeholder="Fill Opacity"
          size="2xs"
          min="0"
          max="100"
        >
          <template #trailing>
            <span class="text-grey-400 text-2xs">%</span>
          </template>
        </UInput>
      </div>
      <UInput
        v-model="fillColor"
        @input="
          (e:any) => {
            handleChangeProperty('paint',e.target.value, 'circle-color');
          }
        "
        type="color"
        variant="none"
        :padded="false"
        :ui="{ rounded: 'rounded-xxs' }"
        inputClass="cursor-pointer [&::-webkit-color-swatch]:rounded-[4px] [&::-webkit-color-swatch]:border-0 bg-grey-700 focus:ring-0 focus:border-none border-1 border-grey-600 px-2 py-1"
      >
        <template #trailing>
          <IcArrow
            class="w-4 h-4 rotate-180 text-grey-400"
            :fontControlled="false"
          />
        </template>
      </UInput>
    </div>
  </div>
</template>
