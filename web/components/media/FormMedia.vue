<script lang="ts" setup>
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
const authStore = useAuth();
import { useQueryClient } from "@tanstack/vue-query";

const queryClient = useQueryClient();

const schema = z.object({
  media_partner: z.string().min(1, "Media Partner wajib dipilih"),
  contact: z.string().min(1, "Kontak wajib diisi"),
  publications: z.array(
    z.object({
      title: z.string().min(1, "Judul wajib diisi"),
      file: z.string().optional(),
      link: z
        .string()
        .url("Link harus berupa URL yang valid")
        .min(1, "Link wajib diisi"),
      status: z.string().min(1, "Status wajib dipilih"),
    })
  ),
});

type Schema = z.output<typeof schema>;

const props = defineProps<{
  publication?: any;
  mode?: "create" | "edit";
}>();

const emit = defineEmits<{
  close: [];
}>();

const state = reactive({
  media_partner: "",
  contact: "",
  publications: [{ title: "", file: "", link: "", status: "positive" }],
});

const toast = useToast();
const loading = ref(false);
const mediaOptions = ref([]);
const loadingMedias = ref(false);

// Status options
const statusOptions = [
  { label: "Positif", value: "positive" },
  { label: "Negatif", value: "negative" },
  { label: "Netral", value: "neutral" },
];

// Initialize form data based on mode
watch(
  () => props.publication,
  (newPublication) => {
    if (props.mode === "edit" && newPublication) {
      // Populate form with existing data
      state.media_partner = newPublication.media?.id?.toString() || "";
      state.contact = newPublication.media?.phone_number || "";
      state.publications = [
        {
          title: newPublication.title || "",
          file: newPublication.file || "",
          link: newPublication.link || "",
          status: newPublication.status || "positive",
        },
      ];
    }
  },
  { immediate: true }
);

// Reset form when mode changes to create
watch(
  () => props.mode,
  (newMode) => {
    if (newMode === "create") {
      resetForm();
    }
  }
);

function resetForm() {
  state.media_partner = "";
  state.contact = "";
  state.publications = [{ title: "", file: "", link: "", status: "positive" }];
}

// Fetch media partners
const fetchMedias = async () => {
  try {
    loadingMedias.value = true;
    const response = await $fetch<any>("panel/items/medias", {});
    mediaOptions.value = response.data.map((media: any) => ({
      label: media.name,
      value: media.id.toString(),
    }));
  } catch (error) {
    console.error("Error fetching medias:", error);
    toast.add({
      title: "Error",
    });
  } finally {
    loadingMedias.value = false;
  }
};

// Load medias when component mounts
onMounted(() => {
  fetchMedias();
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    loading.value = true;

    if (props.mode === "edit" && props.publication) {
      // Update existing publication
      const publicationData = {
        title: event.data.publications[0].title,
        file: event.data.publications[0].file || null,
        link: event.data.publications[0].link,
        status: event.data.publications[0].status,
        media: parseInt(event.data.media_partner),
      };

      await $fetch(`panel/items/publications/${props.publication.id}`, {
        method: "PATCH",
        body: publicationData,
      });

      toast.add({
        title: "Berhasil",
        description: "Data publikasi berhasil diperbarui",
      });
    } else {
      // Create new publications
      for (const publication of event.data.publications) {
        const publicationData = {
          title: publication.title,
          file: publication.file || null,
          link: publication.link,
          status: publication.status,
          media: parseInt(event.data.media_partner),
        };

        await $fetch("panel/items/publications", {
          method: "POST",
          body: publicationData,
        });
      }

      toast.add({
        title: "Berhasil",
        description: "Data publikasi berhasil disimpan",
      });
    }

    queryClient.invalidateQueries({ queryKey: ["publications"] });
    resetForm();
    emit("close");
  } catch (error) {
    console.error("Error submitting publications:", error);
    toast.add({
      title: "Error",
      description: "Gagal menyimpan data publikasi",
    });
  } finally {
    loading.value = false;
  }
}

function addPublication() {
  if (props.mode !== "edit") {
    state.publications.push({
      title: "",
      file: "",
      link: "",
      status: "positive",
    });
  }
}

function removePublication(index: number) {
  if (state.publications.length > 1 && props.mode !== "edit") {
    state.publications.splice(index, 1);
  }
}
</script>

<template>
  <UForm
    id="media-publication-form"
    :schema="schema"
    :state="state"
    class="space-y-4"
    @submit="onSubmit"
  >
    <!-- Media Partner Selection -->
    <UFormField label="Media Partner" name="media_partner" required>
      <USelect
        v-model="state.media_partner"
        :items="mediaOptions"
        placeholder="Pilih Media Partner"
        :loading="loadingMedias"
        class="w-full"
      />
    </UFormField>

    <UFormField label="Kontak" name="contact" required>
      <UInput
        v-model="state.contact"
        placeholder="08567234567"
        class="w-full"
      />
    </UFormField>

    <div class="text-sm font-medium text-gray-700 pt-2">Media</div>

    <!-- Publications -->
    <div class="space-y-4">
      <div
        v-for="(publication, index) in state.publications"
        :key="index"
        class="relative border border-gray-200 rounded-lg p-4 space-y-3"
      >
        <!-- Remove button (only show for create mode with multiple publications) -->
        <div
          v-if="state.publications.length > 1 && mode !== 'edit'"
          class="absolute top-3 right-3"
        >
          <UButton
            variant="ghost"
            icon="i-heroicons-x-mark-20-solid"
            @click="removePublication(index)"
          />
        </div>

        <UFormField
          label="Judul"
          :name="`publications.${index}.title`"
          required
        >
          <UInput
            v-model="publication.title"
            placeholder="Sinergi Bangun Desa"
            class="w-full"
          />
        </UFormField>

        <UFormField label="File" :name="`publications.${index}.file`">
          <div class="flex items-center gap-2">
            <UInput
              v-model="publication.file"
              placeholder="Technical-Spec.docs"
              class="flex-1"
            />
            <UButton
              icon="i-heroicons-cloud-arrow-up"
              variant="outline"
              size="sm"
            />
          </div>
        </UFormField>

        <UFormField label="Link" :name="`publications.${index}.link`" required>
          <UInput
            v-model="publication.link"
            placeholder="https://www.kompas.com/tag/boreno-indobara"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Status"
          :name="`publications.${index}.status`"
          required
        >
          <USelect
            v-model="publication.status"
            :items="statusOptions"
            class="w-full"
          />
        </UFormField>
      </div>
    </div>

    <!-- Add Publication Button (only show for create mode) -->
    <div
      v-if="mode !== 'edit'"
      class="border-2 border-dashed border-gray-300 rounded-lg px-4 my-12 text-center"
    >
      <UButton
        @click="addPublication"
        type="button"
        variant="ghost"
        class="text-red-600 hover:text-red-700 w-full items-center flex justify-center"
      >
        Tambah Media
      </UButton>
    </div>
  </UForm>

  <div class="flex flex-col gap-2">
    <UButton
      type="submit"
      form="media-publication-form"
      class="w-full justify-center bg-red-600 hover:bg-red-700"
      :loading="loading"
      :disabled="loading"
    >
      {{ mode === "edit" ? "Update" : "Simpan" }}
    </UButton>
    <UButton
      @click="emit('close')"
      type="button"
      variant="outline"
      class="w-full justify-center"
      :disabled="loading"
    >
      Batal
    </UButton>
  </div>
</template>
