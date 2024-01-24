<script setup lang="ts">
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";
import { useFloating, offset, flip } from "@floating-ui/vue";
import IcMenuDots from "~/assets/icons/ic-menu-dots.svg";
import { useTableData } from "~/stores/use-table-data";
import type { LngLatLike } from "maplibre-gl";

defineProps<{
  bounds: GeoJSON.Polygon;
}>();

const store = useTableData();
const { toggleTable } = store;

const mapStore = useMapRef();
const { map } = storeToRefs(mapStore);

const reference = ref(null);
const floating = ref(null);
const { floatingStyles } = useFloating(reference, floating, {
  placement: "right-start",
  middleware: [offset(10), flip()],
});
</script>

<template>
  <Menu as="div" class="relative inline-block">
    <MenuButton ref="reference">
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
      <teleport to="body">
        <MenuItems
          ref="floating"
          :style="floatingStyles"
          class="absolute -right-2 translate-x-full translate-y-full bottom-5 w-56 h-fit p-2 flex flex-col gap-2 rounded-xxs bg-grey-900 shadow-lg ring-1 ring-grey-700 focus:outline-none"
        >
          <MenuItem v-slot="{ active }">
            <button
              @click="
                () => {
                  map?.flyTo({ center: bounds.coordinates[0][0] as LngLatLike });
                }
              "
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
      </teleport>
    </transition>
  </Menu>
</template>
