<script setup lang="ts">
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/vue";
import IcCheck from "~/assets/icons/ic-check.svg";
const sortOption = [
  { id: 1, name: "Sort - Alphabetical (A-Z)" },
  { id: 2, name: "Sort - Alphabetical (Z-A)" },
];
const sortAlphabetical = ref(sortOption[0]);
</script>

<template>
  <Listbox v-model="sortAlphabetical" v-slot="{ open }">
    <div class="relative">
      <ListboxButton
        :class="[
          'p-2 text-xs border rounded-xxs',
          open
            ? 'bg-grey-700 text-grey-50 border-grey-500'
            : 'bg-transparent text-grey-200 border-grey-600',
        ]"
      >
        <span class="block truncate">{{ sortAlphabetical.name }}</span>
      </ListboxButton>

      <transition
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <ListboxOptions
          class="p-2 absolute mt-1 max-h-60 min-w-full overflow-auto rounded-xxs border border-grey-700 bg-grey-800 space-y-2"
        >
          <ListboxOption
            v-slot="{ active, selected }"
            v-for="item in sortOption"
            :key="item.name"
            :value="item"
            as="template"
          >
            <li
              :class="[
                active ? 'bg-brand-950 text-amber-900' : 'text-gray-900',
                selected ? 'bg-brand-950' : '',
                'relative p-2 select-none rounded-xxs text-grey-200 flex items-center gap-5 cursor-pointer',
              ]"
            >
              <p
                :class="[
                  selected ? 'font-medium' : 'font-normal',
                  'block truncate text-xs',
                ]"
              >
                {{ item.name }}
              </p>
              <IcCheck
                v-if="selected"
                class="w-4 h-4 text-brand-500"
                :fontControlled="false"
              />
              <!-- <span
                v-if="selected"
                class="absolute inset-y-0 right-0 flex items-center pl-3 text-amber-600"
              >
                <p>X</p>
              </span> -->
            </li>
          </ListboxOption>
        </ListboxOptions>
      </transition>
    </div>
  </Listbox>
</template>
