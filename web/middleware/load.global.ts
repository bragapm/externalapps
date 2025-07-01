export default defineNuxtRouteMiddleware(async (to, from) => {
  const publicRoutes = ["/signin"];

  if (publicRoutes.includes(to.path)) {
    const nuxtApp = useNuxtApp();
    const authStore = useAuth(nuxtApp.$pinia);
    if (authStore.appLoad && !authStore.isSignedIn) {
      authStore.tryRefresh();
    }
  }
});
