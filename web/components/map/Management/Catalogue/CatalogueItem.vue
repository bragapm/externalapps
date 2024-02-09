<script setup lang="ts">
import IcHelp from "~/assets/icons/ic-help.svg";
import IcCheck from "~/assets/icons/ic-check.svg";

export interface ICatalogueItem {
  layer_id: number;
  layer_alias: string;
  layer_name: string;
  description: string;
  is_active: boolean;
  geometry_type: string;
}

const props = defineProps<ICatalogueItem>();
</script>

<template>
  <div class="flex flex-col gap-2 border rounded-xs p-2">
    <div class="flex items-center gap-1">
      <UBadge
        :ui="{ rounded: 'rounded-xxs' }"
        variant="outline"
        class="flex items-center gap-1"
        color="grey"
      >
        <IcMapLayerA></IcMapLayerA>
        <p>{{ props.geometry_type }}</p>
      </UBadge>
      <UBadge
        :ui="{ rounded: 'rounded-xxs' }"
        variant="outline"
        color="green"
        class="gap-1"
        v-if="props.is_active"
      >
        <IcCheck></IcCheck>
        <p>In Map</p>
      </UBadge>
    </div>
    <img
      src="~/assets/images/catalogue-item.jpeg"
      alt="catalogue-item"
      class="h-24 w-full object-cover object-center rounded-xxs"
    />
    <article>
      <div class="flex items-center justify-between gap-2">
        <h5 class="text-xs text-grey-50 truncate">{{ props.layer_alias }}</h5>
        <button>
          <IcHelp class="w-3 h-3 text-brand-500" :fontControlled="false" />
        </button>
      </div>
      <p class="line-clamp-3 text-grey-500 text-2xs">
        {{ props.description }}
      </p>
    </article>
    <UButton
      :ui="{ rounded: 'rounded-xxs' }"
      :label="props.is_active ? 'Remove' : 'Add to Map'"
      class="w-full justify-center"
      :variant="props.is_active ? 'outline' : 'solid'"
      :color="props.is_active ? 'brand' : 'grey'"
      @click="
        () => {
          console.log('tes');
        }
      "
    />
  </div>
</template>
