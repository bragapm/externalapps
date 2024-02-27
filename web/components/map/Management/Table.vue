<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";
import IcCross from "~/assets/icons/ic-cross.svg";
import IcDownload from "~/assets/icons/ic-download.svg";
import IcExpand from "~/assets/icons/ic-expand.svg";
import IcFilter from "~/assets/icons/ic-filter.svg";
import IcShrink from "~/assets/icons/ic-shrink.svg";
import IcSort from "~/assets/icons/ic-sort.svg";
const store = useTableData();
const { toggleTable, toggleFullscreen } = store;

// const columns = [
//   {
//     key: "name",
//     label: "Name",
//   },
//   {
//     key: "address",
//     label: "address",
//   },
//   // {
//   //   key: "email",
//   //   label: "Email",
//   // },
//   // {
//   //   key: "role",
//   //   label: "Role",
//   // },
//   // {
//   //   key: "actions",
//   // },
// ];

// const dummyData = [
//   {
//     id: 1,
//     name: "Lindsay Walton",
//     title: "Front-end Developer",
//     email: "lindsay.walton@example.com",
//     role: "Member",
//   },
//   {
//     id: 2,
//     name: "Courtney Henry",
//     title: "Designer",
//     email: "courtney.henry@example.com",
//     role: "Admin",
//   },
//   {
//     id: 3,
//     name: "Tom Cook",
//     title: "Director of Product",
//     email: "tom.cook@example.com",
//     role: "Member",
//   },
//   {
//     id: 4,
//     name: "Whitney Francis",
//     title: "Copywriter",
//     email: "whitney.francis@example.com",
//     role: "Admin",
//   },
//   {
//     id: 5,
//     name: "Leonard Krasner",
//     title: "Senior Designer",
//     email: "leonard.krasner@example.com",
//     role: "Owner",
//   },
//   {
//     id: 6,
//     name: "Floyd Miles",
//     title: "Principal Designer",
//     email: "floyd.miles@example.com",
//     role: "Member",
//   },
//   {
//     id: 7,
//     name: "Floyd Miles",
//     title: "Principal Designer",
//     email: "floyd.miles@example.com",
//     role: "Member",
//   },
//   {
//     id: 8,
//     name: "Floyd Miles",
//     title: "Principal Designer",
//     email: "floyd.miles@example.com",
//     role: "Member",
//   },
//   {
//     id: 9,
//     name: "Floyd Miles",
//     title: "Principal Designer",
//     email: "floyd.miles@example.com",
//     role: "Member",
//   },
//   {
//     id: 10,
//     name: "Floyd Miles",
//     title: "Principal Designer",
//     email: "floyd.miles@example.com",
//     role: "Member",
//   },
//   {
//     id: 11,
//     name: "Floyd Miles",
//     title: "Principal Designer",
//     email: "floyd.miles@example.com",
//     role: "Member",
//   },
//   {
//     id: 12,
//     name: "Floyd Miles",
//     title: "Principal Designer",
//     email: "floyd.miles@example.com",
//     role: "Member",
//   },
//   {
//     id: 13,
//     name: "Floyd Miles",
//     title: "Principal Designer",
//     email: "floyd.miles@example.com",
//     role: "Member",
//   },
//   {
//     id: 14,
//     name: "Floyd Miles",
//     title: "Principal Designer",
//     email: "floyd.miles@example.com",
//     role: "Member",
//   },
//   {
//     id: 15,
//     name: "Floyd Miles",
//     title: "Principal Designer",
//     email: "floyd.miles@example.com",
//     role: "Member",
//   },
//   {
//     id: 16,
//     name: "Floyd Miles",
//     title: "Principal Designer",
//     email: "floyd.miles@example.com",
//     role: "Member",
//   },
//   {
//     id: 17,
//     name: "Floyd Miles",
//     title: "Principal Designer",
//     email: "floyd.miles@example.com",
//     role: "Member",
//   },
// ];

const selected = ref([]);

const page = ref(1);
const pageCount = ref(10);

// const rows = computed(() => {
//   return dummyData.slice((page.value - 1) * pageCount.value, page.value * pageCount.value);
// });

/////
const columns = ref([
  {
    key: "nama_jalan",
    label: "Nama Jalan",
  },
  {
    key: "fungsi",
    label: "Fungsi",
  },
]);

const fetcher = async (url: string, searchParams?: any): Promise<any> =>
  await fetch(`${url}${searchParams ? "?" + searchParams : ""}`).then(
    (response) => response.json()
  );

const { isLoading, isError, isFetching, data, error, refetch } = useQuery({
  queryKey: ["/panel/items/jaringan_jalan_bandung"],
  queryFn: ({ queryKey }) =>
    fetcher(
      queryKey[0],
      new URLSearchParams({
        limit: pageCount.value.toString(),
        offset: ((page.value - 1) * pageCount.value).toString(),
        meta: "filter_count",
      })
    ),
});

watchEffect(() => {
  if (page.value) {
    refetch();
  }
});
</script>

<template>
  <div class="flex flex-col gap-3 p-6 h-full max-h-full">
    <div class="flex justify-between">
      <h1 class="text-gray-400">Data Table</h1>
      <button
        @click="
          () => {
            toggleTable();
            store.fullscreen && toggleFullscreen();
          }
        "
      >
        <IcCross class="w-4 h-4 text-grey-400" :fontControlled="false" />
      </button>
    </div>
    <hr class="border-b border-grey-700" />
    <div class="flex justify-between items-center gap-3">
      <div class="flex items-center gap-3">
        <button
          class="flex items-center gap-3 p-2 border border-grey-600 rounded-xxs bg-grey-800 text-xs text-grey-200"
        >
          <IcShrink
            class="w-[14px] h-[14px] text-grey-400"
            :fontControlled="false"
          />
          Data Jaringan Jalan Bandung
        </button>
        <div class="border-l border-grey-700 h-8"></div>
        <button
          class="flex items-center gap-3 p-2 border border-grey-600 rounded-xxs bg-grey-800 text-xs text-grey-200"
        >
          <IcSort
            class="w-[14px] h-[14px] text-grey-400"
            :fontControlled="false"
          />
          Show All Field
        </button>
        <button
          class="flex items-center gap-3 p-2 border border-grey-600 rounded-xxs bg-grey-800 text-xs text-grey-200"
        >
          <IcFilter
            class="w-[14px] h-[14px] text-grey-400"
            :fontControlled="false"
          />
          Filter
        </button>
      </div>
      <div class="flex items-center gap-3">
        <button
          @click="toggleFullscreen"
          class="p-2 border border-grey-600 rounded-xxs bg-grey-800"
        >
          <IcExpand
            class="w-[14px] h-[14px] text-grey-400"
            :fontControlled="false"
          />
        </button>
        <button class="p-2 border border-grey-600 rounded-xxs bg-grey-800">
          <IcDownload
            class="w-[14px] h-[14px] text-grey-400"
            :fontControlled="false"
          />
        </button>
      </div>
    </div>
    <div class="h-[calc(100%-5.5rem)] flex flex-col gap-2">
      <UTable
        v-model="selected"
        :rows="data?.data"
        :columns="columns"
        class="overflow-scroll"
        :ui="{
          wrapper: 'bg-transparent rounded-xxs border border-grey-700 ',
          divide: 'divide-y divide-grey-700 dark:divide-grey-700',
          thead: 'sticky top-0 bg-grey-800 z-10',
          tbody: 'divide-y divide-grey-700 dark:divide-grey-700',
          tr: {
            selected: 'bg-grey-800',
          },
          th: {
            base: 'text-left rtl:text-right',
            padding: 'px-3 py-3.5',
            color: 'text-grey-50 dark:text-grey-50',
            font: 'font-semibold',
            size: 'text-sm',
          },
          checkbox: {
            padding: 'ps-4',
          },
        }"
      >
        <!-- <template #name-data="{ row }">
          <span
            :class="[
              selected.find((person) => person.id === row.id) &&
                'text-primary-500 dark:text-primary-400',
            ]"
            >{{ row.name }}</span
          >
        </template> -->

        <!-- <template #actions-data="{ row }">
          <UDropdown :items="items(row)">
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-ellipsis-horizontal-20-solid"
            />
          </UDropdown>
        </template> -->
      </UTable>
      <div class="flex justify-end py-3">
        <UPagination
          v-model="page"
          :page-count="pageCount"
          :total="data?.meta.filter_count"
          :active-button="{ variant: 'paginationActive' }"
          :inactive-button="{ variant: 'paginationInactive' }"
          :prev-button="{ variant: 'paginationInactive' }"
          :next-button="{ variant: 'paginationInactive' }"
          :first-button="{
            variant: 'paginationInactive',
          }"
          :last-button="{
            variant: 'paginationInactive',
          }"
          show-first
          show-last
          :ui="{
            wrapper: 'gap-2',
            rounded: 'first:rounded-s-xxs last:rounded-e-xxs',
          }"
        />
      </div>
    </div>
  </div>
</template>
