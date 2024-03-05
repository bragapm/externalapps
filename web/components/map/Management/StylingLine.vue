<script lang="ts" setup>
import { inject } from "vue";

const props = defineProps<{
  layerItem: VectorTiles;
}>();

const groupIndex = inject("groupIndexProvider");
const layerIndex = inject("layerIndexProvider");

const lineWidth = ref(
  (props.layerItem.layer_style as LineStyles).paint_line_width
);
const lineOpacity = ref(
  parseFloat((props.layerItem.layer_style as LineStyles).paint_line_opacity) *
    100
);
const lineColor = ref(
  (props.layerItem.layer_style as LineStyles).paint_line_color
);

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
          v-model="lineWidth"
          @blur="
            (e:any) => {
              handleChangeProperty('paint',parseFloat(e.target.value as string), 'line-width');
            }
          "
          type="number"
          color="gray"
          :ui="{ rounded: 'rounded-xxs' }"
          placeholder="Line Width"
          size="2xs"
          min="0"
          max="100"
        >
          <template #trailing>
            <span class="text-grey-400 text-2xs">px</span>
          </template>
        </UInput>
      </div>
    </div>
    <div class="bg-grey-800 rounded-xxs p-2 space-y-1">
      <p class="text-grey-50 text-2xs">Color</p>
      <p class="text-grey-400 text-2xs">Line Color Opacity</p>
      <div class="grid grid-cols-4 gap-1">
        <URange
          v-model="lineOpacity"
          @input="
            (e:any) => {
              handleChangeProperty('paint',parseFloat(e.target.value as string)/100, 'line-opacity');
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
          v-model="lineOpacity"
          @blur="
             (e:any) => {
              handleChangeProperty('paint',parseFloat(e.target.value as string)/100, 'line-opacity');
            }
          "
          type="number"
          color="gray"
          :ui="{ rounded: 'rounded-xxs' }"
          placeholder="Line Opacity"
          size="2xs"
          min="0"
          max="100"
        >
          <template #trailing>
            <span class="text-grey-400 text-2xs">%</span>
          </template>
        </UInput>
      </div>
      <CoreInputColor
        v-model="lineColor"
        :updateColor="
          (color:string) => {
            handleChangeProperty('paint',color, 'line-color');
          }
        "
      />
    </div>
  </div>
</template>
