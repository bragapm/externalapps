<script lang="ts" setup>
definePageMeta({
  middleware: "auth",
});

import { SvgoIcCross } from "#components";
import type { TableColumn, TableRow } from "@nuxt/ui";
const UCheckbox = resolveComponent("UCheckbox");
const UIcon = resolveComponent("UIcon");
const UButton = resolveComponent("UButton");

const data = ref<Record<string, any>[]>([
  {
    isafe_id: "IDT01A",
    nik: "IDT01A5JWADPKZA999",
    role: "Admin",
    name: "Andi Setiawan",
    email: "AndiSetiawan@gmail.com",
  },
  {
    isafe_id: "IDT01A",
    nik: "IDT01A5JWADPKZA999",
    role: "Admin",
    name: "Agnias",
    email: "AndiSetiawan@gmail.com",
  },
  {
    isafe_id: "IDT01A",
    nik: "IDT01A5JWADPKZA999",
    role: "Admin",
    name: "Alma",
    email: "AndiSetiawan@gmail.com",
  },
  {
    isafe_id: "IDT01A",
    nik: "IDT01A5JWADPKZA999",
    role: "Admin",
    name: "Angel",
    email: "Angel@gmail.com",
  },
  {
    isafe_id: "IDT01A",
    nik: "IDT01A5JWADPKZA999",
    role: "Admin",
    name: "Rian",
    email: "Rian@gmail.com",
  },
  {
    isafe_id: "IDT01A",
    nik: "IDT01A5JWADPKZA999",
    role: "Admin",
    name: "Dion",
    email: "Dion@gmail.com",
  },
  {
    isafe_id: "IDT01A",
    nik: "IDT01A5JWADPKZA999",
    role: "Admin",
    name: "Yandi",
    email: "Yandi@gmail.com",
  },
]);

// View state
const isEditingRole = ref(false);
const selectedUser = ref<Record<string, any> | null>(null);

// Access role permissions data
const accessRoleData = ref([
  {
    module: "Dashboard Absensi",
    akses_semua: false,
    lihat: false,
    tambah: false,
    ubah: false,
    hapus: false,
    approve: false,
  },
  {
    module: "Dashboard Laporan",
    akses_semua: false,
    lihat: false,
    tambah: false,
    ubah: false,
    hapus: false,
    approve: false,
  },
  {
    module: "Dashboard Rencana Kerja",
    akses_semua: false,
    lihat: true,
    tambah: true,
    ubah: true,
    hapus: true,
    approve: false,
  },
  {
    module: "Absensi",
    akses_semua: false,
    lihat: true,
    tambah: true,
    ubah: false,
    hapus: false,
    approve: false,
  },
  {
    module: "Plan Cuti",
    akses_semua: true,
    lihat: true,
    tambah: true,
    ubah: true,
    hapus: true,
    approve: true,
  },
  {
    module: "Plan Perjalanan Dinas",
    akses_semua: true,
    lihat: true,
    tambah: true,
    ubah: true,
    hapus: true,
    approve: true,
  },
  {
    module: "Daily Activity",
    akses_semua: false,
    lihat: false,
    tambah: false,
    ubah: false,
    hapus: false,
    approve: false,
  },
  {
    module: "Weekly",
    akses_semua: false,
    lihat: false,
    tambah: false,
    ubah: true,
    hapus: false,
    approve: false,
  },
  {
    module: "Master Data Role & Struktur Organisasi",
    akses_semua: false,
    lihat: false,
    tambah: true,
    ubah: true,
    hapus: true,
    approve: false,
  },
  {
    module: "Master Data Jenis Report",
    akses_semua: false,
    lihat: false,
    tambah: true,
    ubah: true,
    hapus: true,
    approve: false,
  },
  {
    module: "Master Data Role & Struktur Organisasi Duplicate",
    akses_semua: false,
    lihat: false,
    tambah: true,
    ubah: true,
    hapus: true,
    approve: false,
  },
  {
    module: "Master Data Media dan Publikasi",
    akses_semua: false,
    lihat: false,
    tambah: true,
    ubah: true,
    hapus: true,
    approve: false,
  },
  {
    module: "Stakeholder",
    akses_semua: false,
    lihat: false,
    tambah: false,
    ubah: false,
    hapus: false,
    approve: true,
  },
  {
    module: "Media dan Publikasi",
    akses_semua: false,
    lihat: false,
    tambah: true,
    ubah: true,
    hapus: true,
    approve: false,
  },
  {
    module: "Maps Tracking",
    akses_semua: true,
    lihat: true,
    tambah: true,
    ubah: true,
    hapus: true,
    approve: false,
  },
]);

const openRoleAccessTable = (user: Record<string, any>) => {
  selectedUser.value = user;
  isEditingRole.value = true;
};

const backToUserTable = () => {
  isEditingRole.value = false;
  selectedUser.value = null;
};

const savePermissions = () => {
  // Handle save logic here
  console.log("Saving permissions for:", selectedUser.value);
  console.log("Permissions:", accessRoleData.value);
  backToUserTable();
};

// User table columns
const userColumns: TableColumn<Record<string, any>>[] = [
  {
    accessorKey: "isafe_id",
    header: "iSafe ID",
  },
  {
    accessorKey: "nik",
    header: "NIK",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "name",
    header: "Nama Personil",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    id: "action",
    header: "Aksi",
    cell: ({ row }) => {
      return h("div", { class: "flex items-center gap-2" }, [
        h(UIcon, {
          name: "lucide:eye",
          class: "w-4 h-4 cursor-pointer text-gray-600 hover:text-gray-800",
          onClick: () => console.log("View", row.original),
        }),
        h(UIcon, {
          name: "lucide:pencil",
          class: "w-4 h-4 cursor-pointer text-gray-600 hover:text-gray-800",
          onClick: () => openRoleAccessTable(row.original),
        }),
      ]);
    },
  },
];

// Access role table columns
const roleColumns: TableColumn<Record<string, any>>[] = [
  {
    accessorKey: "module",
    header: "Modul",
  },
  {
    accessorKey: "akses_semua",
    header: "Akses Semua",
    cell: ({ row }) => {
      return h(UCheckbox, {
        modelValue: row.original.akses_semua,
        "onUpdate:modelValue": (value: boolean) => {
          const index = accessRoleData.value.findIndex(
            (item) => item.module === row.original.module
          );
          if (index !== -1) {
            accessRoleData.value[index].akses_semua = value;
          }
        },
        class: "text-red-500",
      });
    },
  },
  {
    accessorKey: "lihat",
    header: "Lihat",
    cell: ({ row }) => {
      return h(UCheckbox, {
        modelValue: row.original.lihat,
        "onUpdate:modelValue": (value: boolean) => {
          const index = accessRoleData.value.findIndex(
            (item) => item.module === row.original.module
          );
          if (index !== -1) {
            accessRoleData.value[index].lihat = value;
          }
        },
        class: "text-red-500",
      });
    },
  },
  {
    accessorKey: "tambah",
    header: "Tambah",
    cell: ({ row }) => {
      return h(UCheckbox, {
        modelValue: row.original.tambah,
        "onUpdate:modelValue": (value: boolean) => {
          const index = accessRoleData.value.findIndex(
            (item) => item.module === row.original.module
          );
          if (index !== -1) {
            accessRoleData.value[index].tambah = value;
          }
        },
        class: "text-red-500",
      });
    },
  },
  {
    accessorKey: "ubah",
    header: "Ubah",
    cell: ({ row }) => {
      return h(UCheckbox, {
        modelValue: row.original.ubah,
        "onUpdate:modelValue": (value: boolean) => {
          const index = accessRoleData.value.findIndex(
            (item) => item.module === row.original.module
          );
          if (index !== -1) {
            accessRoleData.value[index].ubah = value;
          }
        },
        class: "text-red-500",
      });
    },
  },
  {
    accessorKey: "hapus",
    header: "Hapus",
    cell: ({ row }) => {
      return h(UCheckbox, {
        modelValue: row.original.hapus,
        "onUpdate:modelValue": (value: boolean) => {
          const index = accessRoleData.value.findIndex(
            (item) => item.module === row.original.module
          );
          if (index !== -1) {
            accessRoleData.value[index].hapus = value;
          }
        },
        class: "text-red-500",
      });
    },
  },
  {
    accessorKey: "approve",
    header: "Approve",
    cell: ({ row }) => {
      return h(UCheckbox, {
        modelValue: row.original.approve,
        "onUpdate:modelValue": (value: boolean) => {
          const index = accessRoleData.value.findIndex(
            (item) => item.module === row.original.module
          );
          if (index !== -1) {
            accessRoleData.value[index].approve = value;
          }
        },
        class: "text-red-500",
      });
    },
  },
];
</script>
<template>
  <div class="w-full space-y-4">
    <!-- Detail Personil Section -->

    <div
      v-if="isEditingRole && selectedUser"
      class="bg-white p-3 rounded-lg border border-gray-200"
    >
      <h3 class="font-semibold text-gray-900 text-xs mb-4">Detail Personil</h3>

      <!-- Two-column label/value layout -->
      <div class="grid grid-cols-2 gap-y-4 text-xs text-gray-700">
        <div class="text-gray-500 font-medium">Nama</div>
        <div class="text-gray-900">{{ selectedUser.name }}</div>

        <div class="text-gray-500 font-medium">Email</div>
        <div class="text-gray-900">{{ selectedUser.email }}</div>

        <div class="text-gray-500 font-medium">NIK</div>
        <div class="text-gray-900">{{ selectedUser.nik }}</div>

        <div class="text-gray-500 font-medium">iSafe Number</div>
        <div class="text-gray-900">{{ selectedUser.isafe_id }}</div>

        <div class="text-gray-500 font-medium">Role</div>
        <div class="text-gray-900">{{ selectedUser.role }}</div>
      </div>

      <!-- Back Button aligned to bottom right -->
      <div class="mt-6 flex justify-end">
        <UButton variant="outline" @click="backToUserTable" color="red">
          <UIcon name="lucide:arrow-left" class="w-4 h-4 mr-2" />
          Back
        </UButton>
      </div>
    </div>

    <!-- Conditional Table Views -->
    <DashboardTable
      v-if="!isEditingRole"
      :data="data"
      :columns="userColumns"
      :totalData="7"
    />

    <DashboardTable
      v-else
      :data="accessRoleData"
      :columns="roleColumns"
      :totalData="15"
    />
    <!-- Action Buttons -->
    <div
      v-if="isEditingRole"
      class="mt-8 pt-6 border-t border-gray-200 w-full space-y-3"
    >
      <UButton
        variant="outline"
        @click="backToUserTable"
        class="w-full flex justify-center"
        >Cancel</UButton
      >
      <UButton @click="savePermissions" class="w-full flex justify-center">
        Edit
      </UButton>
    </div>
  </div>
</template>
