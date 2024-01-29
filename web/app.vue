<script setup lang="ts">
const { data, pending } = useFetch<{
  data: {
    help_center_url?: string;
    project_descriptor?: string;
    project_logo_horizontal?: string;
    project_name: string;
    public_favicon?: string;
  };
}>("/panel/settings");

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
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <!-- <NuxtWelcome /> -->
</template>
