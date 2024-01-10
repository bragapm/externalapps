<script setup lang="ts">
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";
import IcArrow from "~/assets/icons/ic-arrow-reg.svg";

const props = defineProps<{
  triggerLabel?: string;
  triggerIcon?: string;
  itemLabel?: string;
  itemDescription?: string;
  items?: {
    id: string;
    label: string;
    icon?: string;
    action?: () => void;
  }[];
}>();
</script>

<template>
  <Menu as="div" v-slot="{ open }" class="relative inline-block text-left">
    <div>
      <MenuButton
        :class="[
          open
            ? 'bg-brand-950 text-brand-500'
            : 'bg-transparent enabled:hover:bg-grey-800 text-grey-200 disabled:hover:bg-transparent',
          'inline-flex w-full items-center h-9 gap-3 rounded-xxs px-2 py-2 text-sm font-normal focus:outline-none disabled:text-grey-200',
        ]"
      >
        <component
          :is="triggerIcon"
          class="w-4 h-4"
          :fontControlled="false"
        ></component>
        {{ triggerLabel }}
        <IcArrow class="w-4 h-4" :fontControlled="false" />
      </MenuButton>
    </div>

    <transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <MenuItems
        class="absolute right-0 bottom-12 mt-2 p-2 flex flex-col gap-2 w-56 origin-top-right rounded-xxs bg-grey-900 shadow-lg ring-1 ring-grey-800 focus:outline-none"
      >
        <div v-show="itemLabel || itemDescription" class="text-white">
          <p class="text-xs text-grey-400">{{ itemLabel }}</p>
          <p class="text-2xs text-grey-500">{{ itemDescription }}</p>
        </div>
        <slot name="custom-item" />
        <template v-for="item in items" :key="item.id">
          <MenuItem v-slot="{ active }">
            <button
              @click="item.action"
              :class="[
                active ? 'bg-grey-700' : 'bg-transparent text-grey-200',
                'group flex w-full items-center gap-3 rounded-xxs p-2 text-xs text-white',
              ]"
            >
              <component
                :is="item.icon"
                class="w-[14px] h-[14px]"
                :fontControlled="false"
              ></component>
              {{ item.label }}
            </button>
          </MenuItem>
        </template>
      </MenuItems>
    </transition>
  </Menu>
</template>
