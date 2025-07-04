<script setup lang="ts">
import type { Attachment } from "~/utils/types";
import KeenSlider, {
  type KeenSliderInstance,
  type KeenSliderPlugin,
} from "keen-slider";
import IcArrowReg from "~/assets/icons/ic-arrow-reg.svg";
import IcCross from "~/assets/icons/ic-cross.svg";
import IcRectangleList from "~/assets/icons/ic-rectangle-list.svg";
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";
import type { GeoJSONSource } from "maplibre-gl";
import { useQuery } from "@tanstack/vue-query";

type DetailData = {
  markdown: string | null;
  attachments: Attachment[];
  gallery: string[];
};

const mapRefStore = useMapRef();
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

const current = ref<number>(0);
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
        initial: 0,
        slideChanged: (s) => {
          current.value = s.track.details.rel;
        },
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

const isOpen = ref(false);

function closeModal() {
  isOpen.value = false;
}
function openModal(idx: number) {
  isOpen.value = true;
  if (idx)
    setTimeout(() => {
      slider?.update();
      slider?.moveToIdx(idx);
    }, 500);
  else current.value = 0;
}

const featureStore = useFeature();
const { feature } = storeToRefs(featureStore);
const {
  data: detailData,
  error: detailError,
  isFetching: isDetailFetching,
  isError: isDetailError,
} = useQuery({
  queryKey: [
    `/panel/feature-detail`,
    feature.value?.tableName,
    feature.value?.rowId,
  ],
  queryFn: async ({ queryKey }) => {
    const res = await $fetch<DetailData>(queryKey.join("/"));
    // console.log(res);
    return res;
  },
  placeholderData: { markdown: null, attachments: [], gallery: [] },
});

const clearSelection = () => {
  (mapRefStore.map!.getSource("highlight") as GeoJSONSource)?.setData(
    emptyFeatureCollection
  );
  pauseAllAnimation();
  featureStore.setRightSidebar("");
  setTimeout(() => {
    featureStore.setFeature(undefined);
  }, 500);
};
</script>

<template>
  <div
    class="flex justify-between items-center mx-4 mt-3 pb-2 border-b border-grey-300"
  >
    <h2 class="text-grey-950 font-medium">Profile Desa</h2>
    <IcCross
      role="button"
      @click="featureStore.setRightSidebar('')"
      :fontControlled="false"
      class="w-3 h-3 rotate-180 text-grey-500"
    />
  </div>
  <div class="px-4 py-3 overflow-y-auto">content</div>
</template>

<style>
@import url("keen-slider/keen-slider.css");
</style>
