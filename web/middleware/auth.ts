export default defineNuxtRouteMiddleware(async (to, from) => {
  const nuxtApp = useNuxtApp();

  if (import.meta.server) {
    const refreshToken = useCookie("directus_session_token");

    if (!refreshToken.value) {
      const shareId = to.query.share_id;
      const redirectPath = to.fullPath; // Simpan tujuan awal
      if (shareId) {
        return navigateTo(
          "/signin" + "?redirect=" + redirectPath + "&share_id=" + shareId
        );
      } else {
        return navigateTo("/signin?redirect=" + redirectPath);
      }
    }
  }

  if (import.meta.client) {
    const authStore = useAuth(nuxtApp.$pinia);
    if (!authStore.appLoad && !authStore.isSignedIn) {
      return navigateTo("/signin?redirect=" + encodeURIComponent(to.fullPath));
    }

    if (authStore.appLoad && !authStore.isSignedIn) {
      authStore.tryRefresh(true);
    }
  }
});
