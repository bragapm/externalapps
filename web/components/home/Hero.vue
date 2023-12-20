<script setup lang="ts"></script>

<template>
  <div
    class="flex items-end w-full h-[50rem] overflow-hidden relative bg-[url('assets/images/landing/ecopark.jpg')] bg-center bg-no-repeat bg-cover rounded-lg"
  >
    <div class="w-1/2 py-12 px-11 space-y-3">
      <p class="text-xl font-medium text-grey-600">
        Sub Title Here Page Subtitle Here
      </p>
      <h1 class="text-6xl font-medium">
        Title Placement Here Map Title Over Here Lorem Ipsum Dolor Sit Max 4
        Line
      </h1>
      <div class="flex gap-3 pt-3 pb-7">
        <UButton color="black" :ui="{ rounded: 'rounded-[4px]' }" class="p-3">
          Primary CTA Here
        </UButton>
        <UButton
          color="black"
          variant="outline"
          :ui="{ rounded: 'rounded-[4px]' }"
          class="p-3"
        >
          Secondary CTA Here
        </UButton>
      </div>
      <p>
        Social Proof’s Body Copy here to inform more about the products’s
        selling point such as partnership, statistics, media mentions, or
        credentials
      </p>
      <div class="grid grid-cols-3 gap-6">
        <div>
          <p class="text-[2.75rem]">12.345</p>
          <p>Social Proofs</p>
        </div>
        <div>
          <p class="text-[2.75rem]">98.1%</p>
          <p>Lorem Ipsum Dolor</p>
        </div>
        <div>
          <p class="text-[2.75rem]">102</p>
          <p>Sit Amet</p>
        </div>
      </div>
    </div>
  </div>
</template>
