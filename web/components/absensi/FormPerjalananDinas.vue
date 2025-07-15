<script lang="ts" setup>
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const schema = z
  .object({
    start_date: z.string(),
    end_date: z.string(),
    location: z.string(),
    tujuan: z.string(),
    agenda: z.string(),
    transportation: z.string({
      required_error: "Jenis transportasi wajib dipilih",
    }),
    attachment: z
      .instanceof(File)
      .optional()
      .refine((file) => !file || file.size < 5 * 1024 * 1024, {
        message: "Ukuran file maksimal 5MB",
      }),
  })
  .refine(
    ({ start_date, end_date }) => new Date(start_date) <= new Date(end_date),
    {
      message: "Tanggal selesai harus setelah tanggal mulai",
      path: ["end_date"],
    }
  );

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
  start_date: undefined,
  end_date: undefined,
  location: undefined,
  tujuan: undefined,
  agenda: undefined,
  transportation: undefined,
  attachment: undefined,
});

const agendaOptions = [
  { label: "Survei Lokasi", value: "survey" },
  { label: "Kick-off Meeting", value: "kickoff" },
];

const transportOptions = [
  { label: "Kereta", value: "kerete" },
  { label: "Pesawat", value: "pesawat" },
];

const toast = useToast();
async function onSubmit(event: FormSubmitEvent<Schema>) {
  console.log(event.data);
  toast.add({
    title: "Success",
    description: "The form has been submitted.",
    color: "success",
  });
}

const open = ref(false);
</script>

<template>
  <USlideover
    v-model:open="open"
    title="Ajukan Perjalanan Dinas"
    :ui="{ content: 'm-9' }"
  >
    <UButton
      icon="i-heroicons-plus"
      label="Buat Perjalanan Dinas"
      class="text-sm"
    />
    <template #body>
      <UForm
        id="perjalanan-dinas-form"
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <div class="flex gap-2 w-full">
          <UFormField label="Tanggal Mulai" name="start_date">
            <UInput v-model="state.start_date" type="date" class="w-full" />
          </UFormField>

          <UFormField label="Tanggal Selesai" name="end_date">
            <UInput v-model="state.end_date" type="date" class="w-full" />
          </UFormField>
        </div>
        <UFormField label="Lokasi" name="location">
          <UInput v-model="state.location" class="w-full" />
        </UFormField>
        <UFormField label="Tujuan" name="tujuan">
          <UInput v-model="state.tujuan" class="w-full" />
        </UFormField>
        <UFormField label="Agenda" name="agenda">
          <USelect
            v-model="state.agenda"
            :items="agendaOptions"
            placeholder="Pilih jenis agenda"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Transportasi" name="transportation">
          <USelect
            v-model="state.transportation"
            :items="transportOptions"
            placeholder="Pilih jenis transportasi"
            class="w-full"
          />
        </UFormField>
        <CoreCustomFileInput
          v-model="state.attachment"
          name="attachment"
          label="Dokumen Pendukung"
          placeholder="Pilih file..."
          accept=".pdf,.docx"
        />
      </UForm>
    </template>
    <template #footer>
      <div class="w-full space-y-3">
        <UButton
          type="submit"
          form="perjalanan-dinas-form"
          class="w-full justify-center"
        >
          Submit
        </UButton>
        <UButton
          @click="
            () => {
              open = false;
            }
          "
          type="button"
          form="perjalanan-dinas-form"
          class="w-full justify-center"
          variant="outline"
        >
          Cancel
        </UButton>
      </div>
    </template>
  </USlideover>
</template>
