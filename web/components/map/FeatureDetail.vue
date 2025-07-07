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
import DummyImage from "@/assets/images/catalogue-item.jpeg";

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
    <h2 class="text-grey-950 font-medium">Detail POI</h2>
    <IcCross
      role="button"
      @click="featureStore.setRightSidebar('')"
      :fontControlled="false"
      class="w-3 h-3 rotate-180 text-grey-500"
    />
  </div>
  <div class="px-4 py-3 overflow-y-auto space-y-3">
    <img :src="DummyImage" class="w-full h-72 object-cover rounded-sm" />
    <!-- <NuxtImg
      class="w-full h-72 object-cover rounded-sm"
          provider="directus"
      :src="DummyImage"
    /> -->
    <article class="space-y-1">
      <p class="text-grey-950 font-medium mb-2">Gugun Gunawan</p>
      <div class="grid grid-cols-12 text-grey-600 space-x-2 text-sm">
        <p class="col-span-3 font-medium">Jabatan</p>
        <p>:</p>
        <p class="col-span-8">Site Manager</p>
      </div>
      <div class="grid grid-cols-12 text-grey-600 space-x-2 text-sm">
        <p class="col-span-3 font-medium">Organisasi</p>
        <p>:</p>
        <p class="col-span-8">Organic</p>
      </div>
      <div class="grid grid-cols-12 text-grey-600 space-x-2 text-sm">
        <p class="col-span-3 font-medium">Alamat</p>
        <p>:</p>
        <p class="col-span-8">Jl. Kaler Rimbe Desa. Kalimalang</p>
      </div>
      <div class="grid grid-cols-12 text-grey-600 space-x-2 text-sm">
        <p class="col-span-3 font-medium">Nomer Hp</p>
        <p>:</p>
        <p class="col-span-8">09876858</p>
      </div>
      <div class="grid grid-cols-12 text-grey-600 space-x-2 text-sm">
        <p class="col-span-3 font-medium">Email</p>
        <p>:</p>
        <p class="col-span-8">gugungunawan@gmail.com</p>
      </div>
      <div class="grid grid-cols-12 text-grey-600 space-x-2 text-sm">
        <p class="col-span-3 font-medium">Status:</p>
        <p>:</p>
        <div class="col-span-8">
          <div
            class="w-fit p-1 border border-brand-400 rounded-sm text-2xs text-brand-400 font-medium"
          >
            Negative
          </div>
        </div>
      </div>
      <div class="grid grid-cols-12 text-grey-600 space-x-2 text-sm">
        <p class="col-span-3 font-medium">Dokumen</p>
        <p>:</p>
        <p class="col-span-8">gugungunawan.pdf</p>
      </div>
    </article>
  </div>
</template>

<style>
@import url("keen-slider/keen-slider.css");
</style>
