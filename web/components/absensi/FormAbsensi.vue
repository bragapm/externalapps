<script lang="ts" setup>
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const open = ref(false);

const schema = z.object({
  start_date: z.string(),
  jam_masuk: z.string(),
  jam_keluar: z.string().optional(),
  location: z.string(),
  notes: z.string().optional(),
  selfie: z.any().optional(),
});

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
  start_date: undefined,
  jam_masuk: undefined,
  jam_keluar: undefined,
  location: "Kantor",
  notes: undefined,
  selfie: undefined,
});

function onSubmit(event: FormSubmitEvent<Schema>) {
  console.log("Form submitted:", event.data);
  open.value = false;
}
</script>

<template>
  <USlideover
    v-model:open="open"
    title="Tambah Absensi"
    :ui="{ content: 'm-9' }"
  >
    <UButton
      icon="i-heroicons-plus"
      label="Tambah Absensi"
      class="text-sm"
      @click="open = true"
    />

    <template #body>
      <UForm
        id="absensi-form"
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <!-- Start Date -->
        <UFormField label="Keterangan Waktu" name="start_date">
          <UInput v-model="state.start_date" type="date" class="w-full" />
        </UFormField>

        <!-- Jam Masuk & Jam Keluar -->
        <div class="flex gap-2 w-full">
          <UFormField label="Jam Masuk" name="jam_masuk" class="w-1/2">
            <UInput v-model="state.jam_masuk" type="time" class="w-full" />
          </UFormField>

          <UFormField label="Jam Keluar" name="jam_keluar" class="w-1/2">
            <UInput
              v-model="state.jam_keluar"
              type="time"
              class="w-full"
              disabled
            />
          </UFormField>
        </div>

        <!-- Lokasi -->
        <UFormField label="Lokasi Otomatis" name="location">
          <UInput v-model="state.location" class="w-full" />
        </UFormField>

        <!-- Catatan -->
        <UFormField label="Catatan Opsional" name="notes">
          <UInput v-model="state.notes" class="w-full" />
        </UFormField>

        <!-- File Upload -->
        <CoreCustomFileInput
          v-model="state.selfie"
          name="selfie"
          label="Upload Selfie"
          placeholder="Pilih file..."
          accept=".jpg,.jpeg,.png,.doc,.docx,.pdf"
        />
      </UForm>
    </template>

    <template #footer>
      <div class="w-full space-y-3">
        <UButton
          type="submit"
          form="absensi-form"
          class="w-full justify-center bg-red-600 text-white"
        >
          Submit
        </UButton>
        <UButton
          @click="open = false"
          type="button"
          class="w-full justify-center"
          variant="outline"
        >
          Cancel
        </UButton>
      </div>
    </template>
  </USlideover>
</template>
