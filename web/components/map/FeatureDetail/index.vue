<script setup lang="ts">
import type { Attachment } from "~/utils/types";
import KeenSlider, {
  type KeenSliderInstance,
  type KeenSliderPlugin,
} from "keen-slider";
import IcArrowReg from "~/assets/icons/ic-arrow-reg.svg";
import IcArrowLeft from "~/assets/icons/ic-arrow-left.svg";

// Gallery Logic
const ResizePlugin: KeenSliderPlugin = (slider) => {
  const observer = new ResizeObserver(function () {
    slider.update();
  });

  slider.on("created", () => {
    observer.observe(slider.container);
  });
  slider.on("destroyed", () => {
    observer.unobserve(slider.container);
  });
};

const sliderContainer = ref<HTMLElement | null>(null);
let slider: KeenSliderInstance | null = null;
let nextImage: (e: MouseEvent) => void;
let prevImage: (e: MouseEvent) => void;

watchEffect((onInvalidate) => {
  if (sliderContainer.value) {
    slider = new KeenSlider(
      sliderContainer.value!,
      {
        loop: true,
      },
      [ResizePlugin]
    );
    nextImage = (e: MouseEvent) => {
      slider?.update();
      slider?.next();
    };

    prevImage = (e: MouseEvent) => {
      slider?.update();
      slider?.prev();
    };
  }

  onInvalidate(() => {
    slider?.destroy();
  });
});

const featureStore = useFeature();

const isLoading = ref(false);
const detail = ref<{
  markdown: string;
  attachments: Attachment[];
  gallery: string[];
}>({
  markdown: "",
  attachments: [],
  gallery: [],
});

watchEffect(async () => {
  if (featureStore.feature)
    try {
      isLoading.value = true;
      const res = await $fetch(
        `/panel/feature-detail/${featureStore.feature.tableName}/${featureStore.feature.rowId}`
      );
      detail.value = res as any;
    } catch (error) {
      return null;
    } finally {
      isLoading.value = false;
    }
});
</script>

<template>
  <div class="flex justify-between items-center m-3">
    <h2 class="text-white">Feature Detail</h2>
    <IcArrowLeft
      role="button"
      @click="featureStore.setRightSidebar('')"
      :fontControlled="false"
      class="w-3 h-3 rotate-180 text-grey-50"
    />
  </div>
  <hr class="mx-3" />
  <div class="flex-1 overflow-scroll px-3 my-3">
    <div v-if="isLoading" class="px-3 my-3 text-white">Loading ...</div>
    <MapMarkdownRenderer
      v-else-if="Boolean(detail.markdown)"
      :source="detail.markdown"
    />

    <div v-if="detail.gallery.length">
      <p class="text-white text-sm mt-3">Image Gallery</p>
      <div class="relative w-full h-44 my-3">
        <div ref="sliderContainer" class="keen-slider h-full w-full rounded-xs">
          <img
            class="keen-slider__slide object-cover min-w-full max-w-full"
            v-for="(source, idx) of detail.gallery
              .map((src) => (src.includes(',') ? src.split(',') : src))
              .flat()"
            :key="idx"
            :src="source"
          />
        </div>

        <button
          @click="prevImage"
          class="absolute left-2 top-1/2 -translate-y-1/2 flex justify-center items-center border rounded-xs bg-black opacity-40"
        >
          <IcArrowReg
            :fontControlled="false"
            class="w-5 h-5 m-1 -rotate-90 text-grey-50"
          />
        </button>

        <button
          @click="nextImage"
          class="absolute right-2 top-1/2 -translate-y-1/2 flex justify-center items-center border rounded-xs bg-black opacity-40"
        >
          <IcArrowReg
            :fontControlled="false"
            class="w-5 h-5 m-1 rotate-90 text-grey-50"
          />
        </button>
      </div>
    </div>

    <ul class="mt-3 space-y-3" v-if="detail.attachments.length">
      <p class="text-white text-sm">Attachment</p>
      <MapAttachmentLink
        v-for="attachment in detail.attachments"
        :title="attachment.title"
        :description="attachment.description"
        :url="attachment.url"
        :icon="attachment.icon"
      />
    </ul>
  </div>
</template>

<style>
@import url("keen-slider/keen-slider.css");
</style>
