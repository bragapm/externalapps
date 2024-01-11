<script setup lang="ts">
import type { IBlockHeroItem } from "~/components/home/Hero.vue";

interface ILandingBlocks {
  id: number;
}
interface IBlockHero extends ILandingBlocks {
  collection: "block_hero";
  item: IBlockHeroItem;
}

interface ILandingPage {
  data: {
    blocks: IBlockHero[];
  };
}

const { data: landingData, error: landingDataError } = await useFetch<ILandingPage>(
  `/panel/items/landing/eng?fields=blocks.id,blocks.collection,blocks.item:block_hero.slides.id,blocks.item:block_hero.slides.block_hero_slides_id.*`
);
</script>

<template>
  <div class="space-y-3">
    <div
      v-if="!landingDataError && landingData"
      v-for="block in landingData.data.blocks"
      :key="block.id"
    >
      <HomeHero v-if="block.collection === 'block_hero'" :item="block.item" />
    </div>
    <HomeSection1 />
  </div>
</template>
