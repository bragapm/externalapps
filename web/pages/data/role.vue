<script setup lang="ts">
import Dummy from "@/assets/images/dum.png";

definePageMeta({
  middleware: "auth",
});
const items = [
  {
    label: "Tabel",
    icon: "lucide:arrow-down-narrow-wide",
    slot: "tabel" as const,
  },
  {
    label: "Struktur Organisasi",
    icon: "lucide:network",
    slot: "struktur" as const,
  },
];

const itemsSelect = ref(["Filter", "Todo", "In Progress", "Done"]);
const valueSelect = ref("Filter");
</script>

<template>
  <div class="bg-grey-100 rounded-lg">
    <!-- Tabs -->
    <div class="p-4 w-full relative">
      <UTabs
        :items="items"
        size="sm"
        class="w-[22rem]"
        :ui="{
          list: 'flex gap-2 border border-gray-500',
          trigger:
            'flex items-center gap-2 border rounded-sm  font-medium data-[state=active]:bg-red-100 data-[state=active]:text-red-600 text-xs data-[state=inactive]:w-[12rem] data-[state=active]:w-[11rem]',
        }"
      >
        <template #tabel class="">
          <div class="absolute left-0 right-0 bg-gray-100 h-[32rem] p-4">
            <DataTableRole />
          </div>
        </template>

        <template #struktur>
          <div
            class="bg-grey-200 absolute left-0 right-0 mt-12 p-12 flex justify-center"
          >
            <img :src="Dummy" alt="struktur" class="" />
          </div>
        </template>
      </UTabs>

      <div>
        <USelect
          v-model="valueSelect"
          :items="itemsSelect"
          placeholder="Filter"
          size="lg"
          class="absolute top-4.5 left-[33%] 2xl:left-[24%] w-[10rem]"
        />
      </div>
      <div
        class="absolute top-4.5 right-[2%] 2xl:right-[1%] flex items-center gap-3"
      >
        <UInput placeholder="Cari" trailing-icon="i-lucide-search" size="lg" />
        <UButton
          icon="i-lucide-download"
          variant="outline"
          color="gray"
          size="lg"
        />
      </div>
    </div>
  </div>
</template>
