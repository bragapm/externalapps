<script setup lang="ts">
const { signin, signout } = useAuth();

onMounted(() => {
  const refresh_token = localStorage.getItem(refreshTokenKey);
  if (refresh_token) tryRefresh(refresh_token, signin, signout);
});
</script>

<template>
  <LayoutsPageNavbar> </LayoutsPageNavbar>
  <slot />
</template>
