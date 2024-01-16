<script setup lang="ts">
import { useKeenSlider } from "keen-slider/vue";

export interface IBlockHeroItem {
  slides: {
    id: number;
    block_hero_slides_id: {
      id: number;
      title: string;
      subtitle: string;
      body: string;
      image: string;
      primary_button_text?: string;
      primary_button_url?: string;
      secondary_button_text?: string;
      secondary_button_url?: string;
    };
  }[];
}

defineProps<{
  item: IBlockHeroItem;
}>();

const current = useState("heroCurrentSlide", () => 0);
const timeout = useState<NodeJS.Timeout>("heroChangeSlideTimeout");
const mouseOver = useState("heroMouseOver", () => false);

const [container, slider] = useKeenSlider(
  {
    loop: true,
    initial: current.value,
    slideChanged: (s) => {
      current.value = s.track.details.rel;
    },
  },
  [
    (slider) => {
      slider.on("created", () => {
        nextTimeout();
      });
      slider.on("dragStarted", clearNextTimeout);
      slider.on("animationEnded", nextTimeout);
      slider.on("updated", nextTimeout);
    },
  ]
);

function clearNextTimeout() {
  clearTimeout(timeout.value);
}
function nextTimeout() {
  clearTimeout(timeout.value);
  if (mouseOver.value) return;
  timeout.value = setTimeout(() => {
    slider.value?.next();
  }, 3000);
}
</script>

<template>
  <div
    v-if="Array.isArray(item.slides) && item.slides.length"
    class="relative w-full h-[50rem] rounded-lg overflow-hidden"
    @mouseover="
      () => {
        mouseOver = true;
        clearNextTimeout();
      }
    "
    @mouseout="
      () => {
        mouseOver = false;
        nextTimeout();
      }
    "
  >
    <div
      class="flex flex-col justify-end h-full w-1/2 pt-12 pb-24 px-11 space-y-3 backdrop-blur-sm bg-grey-50/20 absolute left-0 z-10"
    >
      <p class="text-lg font-semibold text-grey-600">
        {{ item.slides[current].block_hero_slides_id.subtitle }}
      </p>
      <h1 class="text-6xl font-medium line-clamp-4 leading-tight">
        {{ item.slides[current].block_hero_slides_id.title }}
      </h1>
      <div
        v-if="
          (item.slides[current].block_hero_slides_id.primary_button_text &&
            item.slides[current].block_hero_slides_id.primary_button_url) ||
          (item.slides[current].block_hero_slides_id.secondary_button_text &&
            item.slides[current].block_hero_slides_id.secondary_button_url)
        "
        class="flex gap-3 pt-3 pb-7"
      >
        <UButton
          v-if="
            item.slides[current].block_hero_slides_id.primary_button_text &&
            item.slides[current].block_hero_slides_id.primary_button_url
          "
          color="black"
          :ui="{ rounded: 'rounded-[4px]' }"
          class="p-3"
          :to="item.slides[current].block_hero_slides_id.primary_button_url"
          target="_blank"
        >
          {{ item.slides[current].block_hero_slides_id.primary_button_text }}
        </UButton>
        <UButton
          v-if="
            item.slides[current].block_hero_slides_id.secondary_button_text &&
            item.slides[current].block_hero_slides_id.secondary_button_url
          "
          color="black"
          variant="outline"
          :ui="{ rounded: 'rounded-[4px]' }"
          class="p-3"
          :to="item.slides[current].block_hero_slides_id.secondary_button_url"
          target="_blank"
        >
          {{ item.slides[current].block_hero_slides_id.secondary_button_text }}
        </UButton>
      </div>
      <p>
        {{ item.slides[current].block_hero_slides_id.body }}
      </p>
    </div>
    <div
      v-if="!slider"
      class="h-full bg-center bg-no-repeat bg-cover"
      :style="`background-image: url(/panel/assets/${item.slides[0].block_hero_slides_id.image});`"
    />
    <div ref="container" class="keen-slider h-full">
      <div
        v-for="slide of item.slides"
        :key="slide.id"
        class="keen-slider__slide bg-center bg-no-repeat bg-cover"
        :style="`background-image: url(/panel/assets/${slide.block_hero_slides_id.image});`"
      />
    </div>
    <div
      v-if="slider"
      class="flex absolute bottom-0 left-0 px-11 pb-12 w-1/2 space-x-2"
    >
      <button
        v-for="(_slide, i) in item.slides"
        class="h-2 w-full rounded-full z-20"
        :class="{
          'bg-black': current === i,
          'bg-grey-800/20': current !== i,
        }"
        @click="slider.moveToIdx(i)"
        :key="i"
      />
    </div>
  </div>
</template>

<style>
@import url("keen-slider/keen-slider.css");
</style>
