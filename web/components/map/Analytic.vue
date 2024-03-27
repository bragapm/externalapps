<script lang="ts" setup>
import IcArrowLeft from "~/assets/icons/ic-arrow-left.svg";

const featureStore = useFeature();

const closeAnalytic = () => {
  featureStore.setMapInfo("");
};
</script>

<template>
  <div class="flex justify-between items-center m-3">
    <h2 class="text-white">Analytic Tools Result</h2>
    <IcArrowLeft
      role="button"
      @click="closeAnalytic"
      :fontControlled="false"
      class="w-3 h-3 rotate-180 text-neutral-50"
    />
  </div>
  <hr class="mx-3" />
  <div class="flex-1 overflow-scroll px-3 my-3">
    <p>Headline/Map Title Map Information Here</p>
  </div>
</template>
