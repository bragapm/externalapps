<script lang="ts" setup>
definePageMeta({
  middleware: "auth",
});
import type { TableColumn, TableRow } from "@nuxt/ui";

const page = ref(1);
const pageSize = ref<string>("10");
const startDate = ref();
const endDate = ref();
const search = ref("");
const currentQueryParams = ref<Record<string, string>>();
const openReview = ref(false);

function handleDateUpdate(startDateInput?: string, endDateInput?: string) {
  startDate.value = startDateInput ?? null;
  endDate.value = endDateInput ?? null;
}

const UCheckbox = resolveComponent("UCheckbox");

const data = ref<Record<string, any>[]>([
  {
    id: "1",
    nama_media: "Kompas",
    pic: "Ridwan",
    jabatan: "Ketua",
    jumlah_berita: 10,
    lampiran: "Dokumen.pdf",
    kontak: "CP - kompastiar@gmail.com",
  },
  {
    id: "2",
    nama_media: "Pos Jawa",
    pic: "Hilmi",
    jabatan: "Jurnalis",
    jumlah_berita: 10,
    lampiran: "Dokumen.pdf",
    kontak: "CP - kompastiar@gmail.com",
  },
  {
    id: "3",
    nama_media: "Pos Solo",
    pic: "Tubagus",
    jabatan: "Jurnalis",
    jumlah_berita: 10,
    lampiran: "Dokumen.pdf",
    kontak: "CP - kompastiar@gmail.com",
  },
  {
    id: "4",
    nama_media: "Metro kalsel",
    pic: "Najib",
    jabatan: "Jurnalis",
    jumlah_berita: 10,
    lampiran: "Dokumen.pdf",
    kontak: "CP - kompastiar@gmail.com",
  },
  {
    id: "5",
    nama_media: "Metro tv",
    pic: "Angel",
    jabatan: "Jurnalis",
    jumlah_berita: 10,
    lampiran: "Dokumen.pdf",
    kontak: "CP - kompastiar@gmail.com",
  },
]);

const columns: TableColumn<Record<string, any>>[] = [
  {
    id: "select",
    header: () => h("input", { type: "checkbox", class: "form-checkbox" }),
    cell: () =>
      h("input", {
        type: "checkbox",
        class: "form-checkbox",
      }),
  },
  {
    accessorKey: "nama_media",
    header: "Nama Media",
  },
  {
    accessorKey: "pic",
    header: "PIC",
  },
  {
    accessorKey: "jabatan",
    header: "Jabatan",
  },
  {
    accessorKey: "jumlah_berita",
    header: "Jumlah Berita",
  },
  {
    accessorKey: "lampiran",
    header: "Lampiran",
    cell: ({ row }) =>
      h(
        "a",
        { href: "#", class: "text-blue-500 underline text-sm" },
        { default: () => row.getValue("lampiran") }
      ),
  },
  {
    accessorKey: "kontak",
    header: "Kontak",
  },
  {
    id: "aksi",
    header: "Aksi",
    cell: () =>
      h("div", { class: "flex items-center gap-2" }, [
        h("i", { class: "i-heroicons-eye w-4 h-4 text-gray-600" }),
        h("span", { class: "text-xl" }, "⋮"),
      ]),
  },
];
</script>

<template>
  <div class="p-6 bg-grey-100 rounded-lg space-y-3">
    <DashboardTableHeaderControls
      v-model:search="search"
      @update-date="handleDateUpdate"
      :collection="'business_trips'"
      :queryParams="currentQueryParams"
    >
      <template #slideover-button>
        <USlideover
          title="Tambah Stakeholder"
          :ui="{
            content: 'w-full max-w-[40vw] m-9 rounded-lg',
            body: 'relative',
            title: 'text-sm font-semibold text-gray-900',
          }"
        >
          <UButton
            icon="i-heroicons-plus"
            label="Tambah Media & Publikasi"
            size="xl"
            class="text-sm"
          />

          <template #body>
            <div class="w-full">
              <AktifitasFormDailyActivity />
            </div>
          </template>
        </USlideover>
      </template>
    </DashboardTableHeaderControls>
    <section class="grid grid-cols-2 gap-3">
      <ChartBarChart
        title="Jumlah Media dan Publikasi"
        :labels="['Kompas', 'Detik', 'Jawa Pos', 'Tempo', 'Kaltim Pos']"
        :datasets="[
          {
            label: 'stakeholder',
            data: [12, 5, 10, 20, 15],
            backgroundColor: '#ED6C2B',
            borderRadius: 4,
          },
        ]"
        height="h-64"
        :showPeriodSelector="false"
        @periodChange="
        (period : any) => {
          console.log('Selected period:', period);
        }
      "
      />
      <ChartPieChart
        title="Sentimen Media"
        :data="[
          { label: 'Positif', value: 30, color: '#21D372' },
          { label: 'Negatif', value: 5, color: '#D32E36' },
        ]"
      />
    </section>

    <DashboardTable
      v-model:pageSize="pageSize"
      v-model:page="page"
      :data="data"
      :columns="columns"
      :totalData="12"
    />
  </div>
</template>
