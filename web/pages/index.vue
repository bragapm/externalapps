<script setup lang="ts">
import type { IBlockHeroItem } from "~/components/home/Hero.vue";
import type { IBlockHeroSingleItem } from "~/components/home/HeroSingle.vue";
import type { IBlockInfoSingleItem } from "~/components/home/InfoSingleBottom.vue";

interface IHomeBlocks {
  id: number;
}
interface IBlockHero extends IHomeBlocks {
  collection: "block_hero";
  item: IBlockHeroItem;
}
interface IBlockHeroSingle extends IHomeBlocks {
  collection: "block_hero_single";
  item: IBlockHeroSingleItem;
}
interface IBlockInfoSingle extends IHomeBlocks {
  collection: "block_info_single";
  item: IBlockInfoSingleItem;
}

interface IHomeData {
  data: {
    blocks: (IBlockHero | IBlockHeroSingle | IBlockInfoSingle)[];
  };
}

const { data: homeData, error: homeDataError } = await useFetch<IHomeData>(
  `/panel/items/home/eng?fields=blocks.id,blocks.collection,blocks.item:block_hero.slides.id,blocks.item:block_hero.slides.block_hero_slides_id.*,blocks.item:block_hero_single.*,blocks.item:block_info_single.*`
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
      <HomeHeroSingle
        v-else-if="block.collection === 'block_hero_single'"
        :item="block.item"
      />
      <HomeInfoSingleBottom
        v-else-if="block.collection === 'block_info_single' && block.item.variant === 'bottom'"
        :item="block.item"
      />
      <HomeInfoSingleSide
        v-else-if="block.collection === 'block_info_single' && block.item.variant === 'side'"
        :item="block.item"
      />
    </div>
  </div>
</template>
