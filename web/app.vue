<script setup lang="ts">
import { useGeneralSettings } from "./utils";

const authStore = useAuth();
const { data } = await useGeneralSettings();

useSeoMeta({
  title: data?.value?.data.project_name || "",
  ogTitle: data?.value?.data.project_name || "",
  description: data?.value?.data.project_descriptor || "",
  ogDescription: data?.value?.data.project_descriptor || "",
  ogImage: data?.value?.data.public_favicon
    ? `/panel/assets/${data.value.data.public_favicon}`
    : "",
});
</script>

<template>
  <Head>
    <Link
      rel="icon"
      type="image/png"
      :href="`/panel/assets/${data?.data.public_favicon}`"
  /></Head>
  <UApp>
    <NuxtLayout v-if="!authStore.appLoad">
      <NuxtPage />
    </NuxtLayout>
  </UApp>
  <!-- <NuxtWelcome /> -->
  <UNotifications />
</template>
