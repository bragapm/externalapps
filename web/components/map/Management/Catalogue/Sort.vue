<script setup lang="ts">
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/vue";
import IcCheck from "~/assets/icons/ic-check.svg";

const props = defineProps<{
  sortOrder: { id: "asc" | "desc"; name: string };
}>();
const emit = defineEmits<{
  updateSortOrder: [order: { id: "asc" | "desc"; name: string }];
}>();

const mapLayerStore = useMapLayer();
const sortOption: { id: "asc" | "desc"; name: string }[] = [
  { id: "asc", name: "Sort - Alphabetical (A-Z)" },
  { id: "desc", name: "Sort - Alphabetical (Z-A)" },
];

const updateLayers = (newValue: LayerGroupedByCategory[]) => {
  mapLayerStore.groupedLayerList = newValue;
};
const updateLocalLayers = (newValue: LayerGroupedByCategory[]) => {
  mapLayerStore.groupedLocalLayers = newValue;
};

const handleSort = async (
  data: LayerLists[],
  updateFunc: (newValue: LayerGroupedByCategory[]) => void
) => {
  data.sort((a, b) => {
    let nameA: string;
    let nameB: string;
    if (a.source === "vector_tiles") {
      nameA = a.layer_alias?.toUpperCase() ?? a.layer_name.toUpperCase();
    } else {
      nameA = a.layer_alias.toUpperCase();
    }
    if (b.source === "vector_tiles") {
      nameB = b.layer_alias?.toUpperCase() ?? b.layer_name.toUpperCase();
    } else {
      nameB = b.layer_alias.toUpperCase();
    }
    if (props.sortOrder.id === "asc") {
      return nameA.localeCompare(nameB);
    } else {
      return nameB.localeCompare(nameA);
    }
  });
  updateFunc(mapLayerStore.groupLayerByCategory(data));
};

watchEffect(() => {
  handleSort(
    mapLayerStore.groupedLayerList.map(({ layerLists }) => layerLists).flat(),
    updateLayers
  );
  handleSort(
    mapLayerStore.groupedLocalLayers.map(({ layerLists }) => layerLists).flat(),
    updateLocalLayers
  );
});
</script>

<template>
  <Listbox :value="sortOrder" v-slot="{ open }">
    <div class="relative">
      <ListboxButton
        :class="[
          'p-2 text-xs border rounded-xxs',
          open
            ? 'bg-neutral-700 text-neutral-50 border-neutral-500'
            : 'bg-transparent text-neutral-200 border-neutral-600',
        ]"
      >
        <span class="block truncate">{{ sortOrder.name }}</span>
      </ListboxButton>

      <transition
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <ListboxOptions
          class="p-2 absolute mt-1 max-h-60 min-w-full overflow-auto rounded-xxs border border-neutral-700 bg-neutral-800 space-y-2"
        >
          <ListboxOption
            v-slot="{ active, selected }"
            v-for="item in sortOption"
            @click="
              () => {
                emit('updateSortOrder', item);
              }
            "
            :key="item.name"
            :value="item"
            as="template"
          >
            <li
              :class="[
                active ? 'bg-brand-950 text-amber-900' : 'text-neutral-900',
                sortOrder.id === item.id ? 'bg-brand-950' : '',
                'relative p-2 select-none rounded-xxs text-neutral-200 flex items-center gap-5 cursor-pointer',
              ]"
            >
              <p
                :class="[
                  sortOrder.id === item.id ? 'font-medium' : 'font-normal',
                  'block truncate text-xs',
                ]"
              >
                {{ item.name }}
              </p>
              <IcCheck
                v-if="sortOrder.id === item.id"
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
