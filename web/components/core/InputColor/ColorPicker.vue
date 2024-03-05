<script setup lang="ts">
import {
  parseColor,
  hsvToRgb,
  rgbToHex,
  getSaturationCoordinates,
  getHueCoordinates,
  clamp,
} from "~/utils/colorPicker";
import IcEyeDropper from "~/assets/icons/ic-eye-dropper.svg";

const props = defineProps<{
  color: string;
  updateColor: (color: string) => void;
}>();

const isSaturationMouseDown = ref(false);
const isHueMouseDown = ref(false);

const selectedColor = ref(props.color);
const parsedColor = computed(() => parseColor(selectedColor.value));
const satCoords = computed(() => getSaturationCoordinates(parsedColor.value));
const hueCoords = computed(() => getHueCoordinates(parsedColor.value));

const onSaturationChange = (event: any) => {
  const { width, height, left, top } = event.target.getBoundingClientRect();
  const x = clamp(event.clientX - left, 0, width);
  const y = clamp(event.clientY - top, 0, height);

  const s = (x / width) * 100;
  const v = 100 - (y / height) * 100;

  const rgb = hsvToRgb({ h: parsedColor.value?.hsv.h, s, v });
  selectedColor.value = rgbToHex(rgb);
  props.updateColor(selectedColor.value);
};

const onHueChange = (event: any) => {
  const { width, left } = event.target.getBoundingClientRect();
  const x = clamp(event.clientX - left, 0, width);
  const h = Math.round((x / width) * 360);

  const hsv = {
    h,
    s: parsedColor.value?.hsv.s,
    v: parsedColor.value?.hsv.v,
  };
  const rgb = hsvToRgb(hsv);
  selectedColor.value = rgbToHex(rgb);
  props.updateColor(selectedColor.value);
};

const handleEyedropper = () => {
  if (!(window as any).EyeDropper) {
    console.log("browser not supported");
  } else {
    const eyeDropper = new (window as any).EyeDropper();
    eyeDropper
      .open()
      .then((result: { sRGBHex: string }) => {
        const color = result.sRGBHex;
        selectedColor.value = color;
        props.updateColor(selectedColor.value);
      })
      .catch((e: any) => {
        console.error(e);
      });
  }
};
</script>

<template>
  <div class="w-64 grid gap-3 p-1">
    <div class="relative">
      <div
        class="relative w-full h-36 rounded-xxs"
        :style="{
          backgroundImage: `linear-gradient(transparent, black), linear-gradient(to right, white, transparent)`,
          backgroundColor: `hsl(${parsedColor.hsv.h}, 100%, 50%) `,
        }"
      >
        <div
          class="absolute w-4 h-4 -translate-x-2 -translate-y-2 border-2 border-white rounded-full"
          :style="{
            backgroundColor: parsedColor.hex,
            left: (satCoords?.[0] ?? 0) + '%',
            top: (satCoords?.[1] ?? 0) + '%',
          }"
        />
      </div>
      <div
        @mousedown="
          (e) => {
            isSaturationMouseDown = true;
            onSaturationChange(e);
          }
        "
        @mousemove="
          (e) => {
            if (isSaturationMouseDown) {
              onSaturationChange(e);
            }
          }
        "
        @mouseup="
          (e) => {
            isSaturationMouseDown = false;
            onSaturationChange(e);
          }
        "
        class="w-full h-full absolute top-0 left-0"
      />
    </div>
    <div class="grid gap-2">
      <p class="text-grey-400 text-2xs">Color</p>
      <div class="flex items-center gap-2">
        <div class="relative w-full">
          <div
            class="relative rounded-full w-full h-1"
            :style="{
              backgroundImage: `linear-gradient(
                to right,
                #ff0000,
                #ffff00,
                #00ff00,
                #00ffff,
                #0000ff,
                #ff00ff,
                #ff0000
              )`,
            }"
          >
            <div
              class="absolute w-2 h-2 -translate-x-1 -translate-y-[2px] rounded-full bg-grey-400"
              :style="{
                left: (hueCoords ?? 0) + '%',
              }"
            />
          </div>
          <div
            @mousedown="
              (e) => {
                isHueMouseDown = true;
                onHueChange(e);
              }
            "
            @mousemove="
              (e) => {
                if (isHueMouseDown) {
                  onHueChange(e);
                }
              }
            "
            @mouseup="
              (e) => {
                isHueMouseDown = false;
                onHueChange(e);
              }
            "
            class="w-full h-full absolute top-0 left-0"
          ></div>
        </div>
        <button
          class="flex gap-2 items-center bg-grey-700 p-2 border rounded-xxs border-grey-600"
          @click="handleEyedropper"
        >
          <div
            class="w-8 h-3 rounded-xxs"
            :style="{
              backgroundColor: parsedColor.hex,
            }"
          />
          <IcEyeDropper :fontControlled="false" class="w-4 h-4 text-grey-400" />
        </button>
      </div>
    </div>
  </div>
</template>
