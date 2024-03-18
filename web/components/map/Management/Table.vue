<script setup lang="ts">
import { useQuery, useInfiniteQuery } from "@tanstack/vue-query";
import IcCross from "~/assets/icons/ic-cross.svg";
import IcDownload from "~/assets/icons/ic-download.svg";
import IcExpand from "~/assets/icons/ic-expand.svg";
import IcFilter from "~/assets/icons/ic-filter.svg";
import IcShrink from "~/assets/icons/ic-shrink.svg";
import IcSort from "~/assets/icons/ic-sort.svg";

const store = useTableData();
const { toggleTable, toggleFullscreen } = store;

const selectedIds = ref<string[]>([]);
const highlightedIds = ref<string[]>([]);

const { data: headerData, refetch: refetchHeader } = useQuery({
  queryKey: [`/panel/fields/${store.activeCollection}`],
  queryFn: ({ queryKey }) =>
    $fetch<{ data: any }>(queryKey[0]).then((r) => r.data),
});

const columns = computed<
  {
    key: string;
    label: string;
    is_primary_key: boolean;
    type: string;
  }[]
>(() => {
  if (headerData.value) {
    return headerData.value
      .map((el: any) => ({
        key: el.field,
        label: capitalizeEachWords(el.field),
        is_primary_key: el.schema.is_primary_key,
        type: el.type,
      }))
      .filter((el: any) => !el.is_primary_key && el.type !== "geometry");
  } else return [];
});

const {
  data: tableData,
  error,
  fetchNextPage,
  isLoading,
  isError,
  isFetching,
} = useInfiniteQuery({
  queryKey: [`/panel/items/${store.activeCollection}?`],
  queryFn: async ({ pageParam = 0 }) => {
    const queryParams: Record<string, string> = {
      limit: "25",
      page: pageParam.toString(),
      meta: "filter_count",
      fields: headerData.value
        .filter((el: any) => el.type !== "geometry")
        .map((el: any) => el.field)
        .join(","),
    };
    if (pageParam) {
      delete queryParams.meta;
    }

    return $fetch<{ data: any; meta: any }>(
      `/panel/items/${store.activeCollection}?` +
        new URLSearchParams(queryParams)
    );
  },
  initialPageParam: 0,
  getNextPageParam: (_, pages) => pages.length + 1,
});

const isAllChecked = ref(false);

const onRowClick = (fid: string) => {
  if (highlightedIds.value.includes(fid as string))
    highlightedIds.value = highlightedIds.value.filter((e) => e !== fid);
  else highlightedIds.value = [...highlightedIds.value, fid as string];
};

const onRowSelect = (fid: string) => {
  if (selectedIds.value.includes(fid as string))
    selectedIds.value = selectedIds.value.filter((e) => e !== fid);
  else {
    selectedIds.value = [...selectedIds.value, fid as string];
    if (!highlightedIds.value.includes(fid as string))
      highlightedIds.value = [...highlightedIds.value, fid as string];
  }
};

// watchEffect(() => {
//   console.log(tableData.value);
// });
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
          {{
            store.activeCollection &&
            capitalizeEachWords(store.activeCollection)
          }}
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
    <!-- New Table -->
    <section
      class="h-[calc(100%-5.5rem)] flex flex-col rounded-xxs border border-grey-700 w-full overflow-scroll"
    >
      <header class="flex w-full">
        <div class="bg-grey-800 h-14 w-14 flex items-center justify-center">
          <CoreCheckbox
            id="all-checkbox"
            :index="0"
            :is-checked="isAllChecked"
            :forHeader="true"
            @click="
              () => {
                isAllChecked = !isAllChecked;
                selectedIds = [];
              }
            "
          />
        </div>
        <div
          v-for="column in columns"
          :key="column.key"
          class="bg-grey-800 h-14 flex-1 min-w-[12rem] text-grey-50 flex items-center text-xs font-medium px-3 py-4"
        >
          <p class="line-clamp-2">{{ column.label }}</p>
        </div>
      </header>

      <template v-if="tableData?.pages.length">
        <template v-for="tableRows in tableData.pages">
          <main
            role="button"
            @click="() => onRowClick(rowData.ogc_fid)"
            class="flex w-full group"
            v-for="rowData in tableRows.data"
            :key="rowData.ogc_fid"
          >
            <div
              :class="
                'h-[4.5rem] w-14 flex items-center justify-center group-hover:bg-grey-700 ' +
                (highlightedIds.includes(rowData.ogc_fid) ? 'bg-red-950 ' : ' ')
              "
            >
              <CoreCheckbox
                id="id-checkbox"
                :index="rowData.ogc_fid"
                :is-checked="
                  isAllChecked || selectedIds.includes(rowData.ogc_fid)
                "
                :forHeader="true"
                @click="
                  (event : Event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    onRowSelect(rowData.ogc_fid);
                  }
                "
              />
            </div>
            <div
              v-for="column in columns"
              :key="column.key"
              :class="
                'first-letter:h-[4.5rem] flex-1 min-w-[12rem] flex items-center text-xs font-normal px-3 py-4 group-hover:bg-grey-700 ' +
                (highlightedIds.includes(rowData.ogc_fid)
                  ? 'text-brand-500 '
                  : 'text-grey-400 ') +
                (highlightedIds.includes(rowData.ogc_fid) ? 'bg-red-950 ' : ' ')
              "
            >
              <p class="line-clamp-2">{{ rowData[column.key] }}</p>
            </div>
          </main>
        </template>

        <div class="flex w-full justify-center items-center mb-2">
          <button
            @click="() => fetchNextPage()"
            class="w-1/3 bg-brand-600 mt-2 h-9 text-white text-center rounded-xxs text-xs border border-grey-50"
          >
            Load More
          </button>
        </div>
      </template>
      <span
        class="absolute rounded-xxs border border-grey-600 bottom-8 left-8 w-1/4 bg-grey-800 h-9 text-grey-400 flex justify-center items-center text-xs"
        >{{ selectedIds.length }} row
        {{ (isAllChecked ? "un" : "") + "selected" }}
      </span>
      <span
        class="absolute rounded-xxs border border-grey-600 bottom-8 right-8 w-1/4 bg-grey-800 h-9 text-grey-400 flex justify-center items-center text-xs"
        >from {{ tableData?.pages[0].meta.filter_count }} rows</span
      >
    </section>
  </div>
</template>
