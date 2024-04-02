<script lang="ts" setup>
import { RadioGroupOption } from "@headlessui/vue";
import IcAddFile from "~/assets/icons/ic-add-file.svg";

defineProps<{
  title: string;
  desc: string;
  optLabel: string;
  optValue: string;
}>();
</script>

<template>
  <div
    class="flex flex-col gap-1 justify-between p-4 bg-grey-800 border border-grey-700 rounded-xs"
  >
    <div class="flex flex-col items-center py-6">
      <IcAddFile class="w-6 h-6 text-brand-500" :fontControlled="false" />
      <p class="text-grey-50 mt-2">{{ title }}</p>
      <p class="text-sm text-grey-400 text-center">
        {{ desc }}
      </p>
    </div>
    <RadioGroupOption v-slot="{ checked }" :value="optValue">
      <div
        :class="[
          checked ? 'bg-red-950' : '',
          'flex gap-2 hover:bg-red-950 p-2 rounded-xxs text-2xs text-grey-50 cursor-pointer',
        ]"
      >
        <div
          :class="[
            checked ? 'border-brand-500' : 'border-grey-600 bg-grey-700',
            ,
            'flex items-center justify-center w-4 h-4 border  rounded-full',
          ]"
        >
          <div v-if="checked" class="w-3 h-3 border-2 border-brand-500 rounded-full"></div>
        </div>
        <p>{{ optLabel }}</p>
      </div>
    </RadioGroupOption>
  </div>
</template>
