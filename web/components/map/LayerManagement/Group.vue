<script setup lang="ts">
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";
import { useTableData } from "~/stores/use-table-data";
import IcEye from "~/assets/icons/ic-eye.svg";
import IcMenuDots from "~/assets/icons/ic-menu-dots.svg";
import IcPaint from "~/assets/icons/ic-paint.svg";
import IcTime from "~/assets/icons/ic-time.svg";

const props = defineProps<{
  layerItem: LayerItem[];
}>();
const store = useTableData();
const { toggleTable } = store;
</script>

<template>
  <template v-for="item in props.layerItem" :key="item.id">
    <div
      class="bg-grey-500 rounded-xxs p-2 flex justify-between items-center w-full"
    >
      <div class="text-white w-8/12">
        <p class="truncate">
          {{ item.label }}
        </p>
        <p class="truncate">{{ item.type }}</p>
      </div>
      <div class="flex gap-2 items-center justify-end w-4/12">
        <IcTime class="text-white w-3 h-3" :fontControlled="false" />
        <IcPaint class="text-white w-3 h-3" :fontControlled="false" />
        <IcEye class="text-white w-3 h-3" :fontControlled="false" />
        <!-- <IcMenuDots class="text-white" /> -->
        <Menu as="div" class="relative inline-block">
          <MenuButton>
            <IcMenuDots class="text-white w-3 h-3" :fontControlled="false" />
          </MenuButton>

          <transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0"
          >
            <MenuItems
              class="absolute -right-2 translate-x-full translate-y-full bottom-5 w-56 p-2 flex flex-col gap-2 rounded-xxs bg-grey-900 shadow-lg ring-1 ring-grey-700 focus:outline-none"
            >
              <MenuItem v-slot="{ active }">
                <button
                  @click="() => {}"
                  :class="[
                    active ? 'bg-grey-700' : 'bg-transparent text-grey-200',
                    'group flex w-full items-center gap-3 rounded-xxs p-2 text-xs text-white',
                  ]"
                >
                  Zoom To Fit
                </button>
              </MenuItem>
              <hr class="border-t-2 border-grey-800" />
              <MenuItem v-slot="{ active }">
                <button
                  @click="() => {}"
                  :class="[
                    active ? 'bg-grey-700' : 'bg-transparent text-grey-200',
                    'group flex w-full items-center gap-3 rounded-xxs p-2 text-xs text-white',
                  ]"
                >
                  Export JSON
                </button>
              </MenuItem>
              <MenuItem v-slot="{ active }">
                <button
                  @click="() => {}"
                  :class="[
                    active ? 'bg-grey-700' : 'bg-transparent text-grey-200',
                    'group flex w-full items-center gap-3 rounded-xxs p-2 text-xs text-white',
                  ]"
                >
                  About Layer
                </button>
              </MenuItem>
              <MenuItem v-slot="{ active }">
                <button
                  @click="() => {}"
                  :class="[
                    active ? 'bg-grey-700' : 'bg-transparent text-grey-200',
                    'group flex w-full items-center gap-3 rounded-xxs p-2 text-xs text-white',
                  ]"
                >
                  Edit Layer Info
                </button>
              </MenuItem>
              <MenuItem v-slot="{ active, close }" as="div">
                <button
                  @click="
                    () => {
                      toggleTable();
                      close();
                    }
                  "
                  :class="[
                    active ? 'bg-grey-700' : 'bg-transparent text-grey-200',
                    'group flex w-full items-center gap-3 rounded-xxs p-2 text-xs text-white',
                  ]"
                >
                  View Data Table
                </button>
              </MenuItem>
              <hr class="border-t-2 border-grey-800" />
              <MenuItem v-slot="{ active }">
                <button
                  @click="() => {}"
                  :class="[
                    active
                      ? 'bg-grey-700 text-white'
                      : 'bg-transparent text-brand-600',
                    'group flex w-full items-center gap-3 rounded-xxs p-2 text-xs',
                  ]"
                >
                  Delete Layer
                </button>
              </MenuItem>
            </MenuItems>
          </transition>
        </Menu>
      </div>
    </div>
  </template>
</template>
