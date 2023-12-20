<script setup lang="ts"></script>

<template>
  <div class="flex flex-col gap-3 bg-black/5 rounded-lg p-11">
    <p>Info Section</p>
    <div class="grid grid-cols-1 md:grid-cols-2">
      <h1 class="text-4xl">
        About section introduction text lorem ipsum dolor sit Amet
      </h1>
      <div class="space-y-3">
        <p>
          Solar Energy Estimator for Rooftop in Indonesia, in collaboration with
          GSMA MIH and Bappenas as the main partner, by utilizing digital
          technology to support energy transition in Indonesia, using GIS and
          Machine Learning to mapping the potential of PV rooftop in urban
          areas.
        </p>
        <UButton color="black" :ui="{ rounded: 'rounded-[4px]' }" class="p-3">
          Primary CTA Here
        </UButton>
      </div>
    </div>
    <img
      src="assets/images/landing/ecopark.jpg"
      class="w-full h-64 mt-3 rounded-lg"
    />
    <!-- <NuxtImg src="assets/images/landing/ecopark.jpg" width="500" height="300" /> -->
  </div>
</template>
