<script setup lang="ts">
export interface IBlockCTAItem {
  id: number;
  variant: "bg-image" | "bg-image-card" | "card-image";
  title: string;
  subtitle: string;
  body: string;
  image: string;
  primary_button_text: string;
  primary_button_url: string;
  secondary_button_text?: string;
  secondary_button_url?: string;
}

const props = defineProps<{
  item: IBlockCTAItem;
}>();

const img = useImage();
const bgImg = computed(
  () =>
    `bg-[url('${img(props.item.image, undefined, {
      provider: "directus",
    })}')] bg-cover bg-no-repeat`
);
</script>

<template>
  <div
    :class="[
      'grid grid-cols-1 md:grid-cols-2 gap-7 rounded-lg',
      item.variant === 'bg-image-card' ? 'p-6' : 'p-11',
      item.variant === 'card-image' ? 'bg-black/5' : bgImg,
    ]"
  >
    <div
      :class="[
        'flex flex-col gap-3 p-6',
        item.variant === 'bg-image-card' && 'bg-black text-white rounded-lg',
      ]"
    >
      <p class="font-semibold text-lg">{{ item.subtitle }}</p>
      <h1 class="text-4xl">{{ item.title }}</h1>
      <p>{{ item.body }}</p>
      <div
        v-if="
          (item.primary_button_text && item.primary_button_url) ||
          (item.secondary_button_text && item.secondary_button_url)
        "
        class="flex gap-3 mt-3"
      >
        <UButton
          v-if="item.primary_button_text && item.primary_button_url"
          :color="item.variant === 'bg-image-card' ? 'white' : 'black'"
          :ui="{ rounded: 'rounded-[4px]' }"
          class="p-3"
          :to="item.primary_button_url"
          target="_blank"
        >
          {{ item.primary_button_text }}
        </UButton>
        <UButton
          v-if="item.secondary_button_text && item.secondary_button_url"
          :color="item.variant === 'bg-image-card' ? 'white' : 'black'"
          variant="outline"
          :ui="{ rounded: 'rounded-[4px]' }"
          class="p-3"
          :to="item.secondary_button_url"
          target="_blank"
        >
          {{ item.secondary_button_text }}
        </UButton>
      </div>
    </div>
    <div
      v-if="item.variant === 'card-image'"
      :class="['w-full h-full rounded-lg', bgImg]"
    />
  </div>
</template>
