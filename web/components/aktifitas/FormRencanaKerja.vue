<script lang="ts" setup>
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const schema = z.object({
  reports: z.array(
    z.object({
      start_date: z.string().min(1, "Tanggal mulai wajib diisi"),
      title: z.string().min(1, "Judul laporan wajib diisi"),
      description: z.string().min(1, "Deskripsi wajib diisi"),
    })
  ),
});

type Schema = z.output<typeof schema>;

const state = reactive({
  reports: [{ start_date: "", title: "", description: "" }],
});

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

function addReport() {
  state.reports.push({
    start_date: "",
    title: "",
    description: "",
  });
}
</script>

<template>
  <USlideover
    v-model:open="open"
    title="Buat Rencana Kerja"
    :ui="{ content: 'm-9' }"
  >
    <UButton icon="i-heroicons-plus" label="Buat Rencana Kerja" size="xl" />
    <template #body>
      <UForm
        id="rencana-kerja-form"
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <div
          v-for="(report, index) in state.reports"
          :key="index"
          class="space-y-2"
        >
          <UFormField
            label="Tanggal Kerja"
            :name="`reports.${index}.start_date`"
          >
            <UInput v-model="report.start_date" type="date" class="w-full" />
          </UFormField>
          <UFormField label="Judul Laporan" :name="`reports.${index}.title`">
            <UInput v-model="report.title" class="w-full" />
          </UFormField>
          <UFormField label="Deskripsi" :name="`reports.${index}.description`">
            <UTextarea v-model="report.description" :rows="5" class="w-full" />
          </UFormField>
          <USeparator />
        </div>
        <UButton
          @click="addReport"
          type="button"
          class="w-full justify-center"
          variant="outline"
        >
          Tambah Rencana Kerja
        </UButton>
      </UForm>
    </template>
    <template #footer>
      <div class="w-full space-y-3">
        <UButton
          type="submit"
          form="rencana-kerja-form"
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
          form="rencana-kerja-form"
          class="w-full justify-center"
          variant="outline"
        >
          Cancel
        </UButton>
      </div>
    </template>
  </USlideover>
</template>
