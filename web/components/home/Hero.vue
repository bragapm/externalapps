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
      data?: { value: string; label: string; sort: number }[];
    };
  }[];
}

defineProps<{
  item: IBlockHeroItem;
}>();

const current = useState("heroCurrentSlide", () => 0);
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
      let timeout: NodeJS.Timeout;
      let mouseOver = false;
      function clearNextTimeout() {
        clearTimeout(timeout);
      }
      function nextTimeout() {
        clearTimeout(timeout);
        if (mouseOver) return;
        timeout = setTimeout(() => {
          slider.next();
        }, 3000);
      }
      slider.on("created", () => {
        slider.container.addEventListener("mouseover", () => {
          mouseOver = true;
          clearNextTimeout();
        });
        slider.container.addEventListener("mouseout", () => {
          mouseOver = false;
          nextTimeout();
        });
        nextTimeout();
      });
      slider.on("dragStarted", clearNextTimeout);
      slider.on("animationEnded", nextTimeout);
      slider.on("updated", nextTimeout);
    },
  ]
);
</script>

<template>
  <div class="relative w-full h-[50rem]">
    <div ref="container" class="keen-slider h-full">
      <div
        v-if="Array.isArray(item.slides)"
        v-for="slide of item.slides"
        :key="slide.id"
        class="keen-slider__slide flex items-end overflow-hidden bg-center bg-no-repeat bg-cover rounded-lg"
        :style="`background-image: url(/panel/assets/${slide.block_hero_slides_id.image});`"
      >
        <div
          class="flex flex-col justify-end h-full w-1/2 pt-12 pb-24 px-11 space-y-3 backdrop-blur-sm bg-grey-50/20 rounded-l-lg"
        >
          <p class="text-xl font-medium text-grey-600">
            {{ slide.block_hero_slides_id.subtitle }}
          </p>
          <h1 class="text-6xl font-medium">
            {{ slide.block_hero_slides_id.title }}
          </h1>
          <div
            v-if="
              (slide.block_hero_slides_id.primary_button_text &&
                slide.block_hero_slides_id.primary_button_url) ||
              (slide.block_hero_slides_id.secondary_button_text &&
                slide.block_hero_slides_id.secondary_button_url)
            "
            class="flex gap-3 pt-3 pb-7"
          >
            <UButton
              v-if="
                slide.block_hero_slides_id.primary_button_text &&
                slide.block_hero_slides_id.primary_button_url
              "
              color="black"
              :ui="{ rounded: 'rounded-[4px]' }"
              class="p-3"
              :to="slide.block_hero_slides_id.primary_button_url"
              target="_blank"
            >
              {{ slide.block_hero_slides_id.primary_button_text }}
            </UButton>
            <UButton
              v-if="
                slide.block_hero_slides_id.secondary_button_text &&
                slide.block_hero_slides_id.secondary_button_url
              "
              color="black"
              variant="outline"
              :ui="{ rounded: 'rounded-[4px]' }"
              class="p-3"
              :to="slide.block_hero_slides_id.secondary_button_url"
              target="_blank"
            >
              {{ slide.block_hero_slides_id.secondary_button_text }}
            </UButton>
          </div>
          <p>
            {{ slide.block_hero_slides_id.body }}
          </p>
          <div
            v-if="Array.isArray(slide.block_hero_slides_id.data)"
            class="grid grid-cols-3 gap-6"
          >
            <div v-for="data of slide.block_hero_slides_id.data">
              <p class="text-[2.75rem]">{{ data.value }}</p>
              <p>{{ data.label }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="slider"
      class="flex absolute bottom-0 left-0 px-11 pb-12 w-1/2 space-x-2"
    >
      <button
        v-for="(_slide, i) in item.slides"
        class="h-2 w-full rounded-full"
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
