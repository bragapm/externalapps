<script setup lang="ts">
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";
import IcMapLayerB from "~/assets/icons/ic-map-layer-b.svg";

const props = defineProps<{
  list: any;
  handleChange: any;
}>();
const activeFilter = computed(() =>
  props.list
    .filter((el: any) => el.checked === true)
    .map((item: any) => item.type)
);
</script>

<template>
  <Menu as="div" class="relative inline-block text-left" v-slot="{ open }">
    <div>
      <MenuButton
        :class="[
          'p-2 text-xs border rounded-xxs flex gap-2 items-center',
          open
            ? 'bg-grey-700 text-grey-50 border-grey-500'
            : 'bg-transparent text-grey-200 border-grey-600',
        ]"
      >
        <IcMapLayerB class="text-grey-200 w-4 h-4" :fontControlled="false" />
        {{
          activeFilter.length === 1 && activeFilter[0] === "all"
            ? "All Dimension"
            : activeFilter.length + " selected"
        }}
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
        class="p-2 absolute mt-1 max-h-60 min-w-full overflow-auto rounded-xxs border border-grey-700 bg-grey-800 space-y-2"
      >
        <template v-for="(item, index) in list" :key="item.type">
          <MenuItem as="div" v-slot="{ active }">
            <CoreCheckbox
              :index="index"
              :label="item.label"
              :isChecked="item.checked"
              @on-change="handleChange"
            />
          </MenuItem>
        </template>
      </MenuItems>
    </transition>
  </Menu>
</template>
