<script setup lang="ts">
import type { IBlockHeroSlidesItem } from "~/components/home/HeroSlides.vue";
import type { IBlockHeroSingleItem } from "~/components/home/HeroSingle.vue";
import type { IBlockInfoSingleItem } from "~/components/home/InfoSingleBottom.vue";
import type { IBlockInfoSlidesItem } from "~/components/home/InfoSlides.vue";

interface IHomeBlocks {
  id: number;
}
interface IBlockHeroSlides extends IHomeBlocks {
  collection: "block_hero_slides";
  item: IBlockHeroSlidesItem;
}
interface IBlockHeroSingle extends IHomeBlocks {
  collection: "block_hero_single";
  item: IBlockHeroSingleItem;
}
interface IBlockInfoSingle extends IHomeBlocks {
  collection: "block_info_single";
  item: IBlockInfoSingleItem;
}
interface IBlockInfoSlides extends IHomeBlocks {
  collection: "block_info_slides";
  item: IBlockInfoSlidesItem
}

interface IHomeData {
  data: {
    blocks: (IBlockHeroSlides | IBlockHeroSingle | IBlockInfoSingle | IBlockInfoSlides)[];
  };
}

const { data: homeData, error: homeDataError } = await useFetch<IHomeData>(
  `/panel/items/home/eng?fields=blocks.id,blocks.collection,blocks.item:block_hero_slides.contents.id,blocks.item:block_hero_slides.contents.block_hero_slides_contents_id.*,blocks.item:block_hero_single.*,blocks.item:block_info_single.*,blocks.item:block_info_slides.contents.id,blocks.item:block_info_slides.contents.block_info_slides_contents_id.*`
);
</script>

<template>
  <div class="space-y-3">
    <template
      v-if="!homeDataError && homeData"
      v-for="block in homeData.data.blocks"
      :key="block.id"
    >
      <HomeHeroSlides v-if="block.collection === 'block_hero_slides'" :item="block.item" />
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
      <HomeInfoSlides
        v-else-if="block.collection === 'block_info_slides'"
        :item="block.item"
      />
    </template>
  </div>
</template>
