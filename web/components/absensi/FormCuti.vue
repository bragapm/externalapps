<script lang="ts" setup>
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const schema = z
  .object({
    start_date: z.string(),
    end_date: z.string(),
    reason: z.string(),
    leave_type: z.string({ required_error: "Jenis cuti wajib dipilih" }),
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
  reason: undefined,
  leave_type: undefined,
  attachment: undefined,
});

const leaveTypeOptions = [
  { label: "Cuti Tahunan", value: "cuti_tahunan" },
  { label: "Cuti Sakit", value: "cuti_sakit" },
  { label: "Cuti Melahirkan", value: "cuti_melahirkan" },
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
</script>

<template>
  <USlideover title="Ajukan Cuti" :ui="{ content: 'm-9' }">
    <UButton icon="i-heroicons-plus" label="Ajukan Cuti" size="xl" />
    <template #body>
      <UForm
        id="cuti-form"
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
        <UFormField label="Jenis Cuti" name="leave_type">
          <USelect
            v-model="state.leave_type"
            :items="leaveTypeOptions"
            placeholder="Pilih jenis cuti"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Alasan" name="reason">
          <UTextarea v-model="state.reason" :rows="5" class="w-full" />
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
    <template #footer
      ><UButton type="submit" form="cuti-form"> Submit </UButton>
    </template>
  </USlideover>
</template>
