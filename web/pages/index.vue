<script setup lang="ts">
import type { IBlockHeroItem } from "~/components/home/Hero.vue";

interface IHomeBlocks {
  id: number;
}
interface IBlockHero extends IHomeBlocks {
  collection: "block_hero";
  item: IBlockHeroItem;
}

interface IHomeData {
  data: {
    blocks: IBlockHero[];
  };
}

const { data: homeData, error: homeDataError } = await useFetch<IHomeData>(
  `/panel/items/home/eng?fields=blocks.id,blocks.collection,blocks.item:block_hero.slides.id,blocks.item:block_hero.slides.block_hero_slides_id.*`
);
</script>

<template>
  <div class="space-y-3">
    <div
      v-if="!homeDataError && homeData"
      v-for="block in homeData.data.blocks"
      :key="block.id"
    >
      <HomeHero v-if="block.collection === 'block_hero'" :item="block.item" />
    </div>
    <HomeSection1 />
  </div>
</template>
