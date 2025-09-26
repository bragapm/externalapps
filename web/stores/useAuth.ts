import { defineStore } from "pinia";

type UserData = {
  email: string;
  first_name: string;
  id: string;
  initial_map_view: GeoJSON.Polygon;
  last_name: string;
  province?: string;
  role: {
    id: string;
    name: string;
    is_enable_all_feature?: boolean;
    is_enable_all_viewport?: boolean;
    is_enable_dissemination?: boolean;
    is_enable_simulation?: boolean;
  };
  districts?: string[];
  avatar?: string;
  tfa_secret?: string;
  password?: string;
  email_notifications?: boolean;
  skip_guide?: boolean;
};

export const useAuth = defineStore("authData", () => {
  const appLoad = ref<boolean>(true);
  const isSignedIn = ref<boolean>(false);
  const accessToken = ref<string>("");
  function signin(newToken: string) {
    isSignedIn.value = true;
    accessToken.value = newToken;
    appLoad.value = false;
  }
  async function signout() {
    isSignedIn.value = false;
    accessToken.value = "";
    await fetch("/panel/auth/logout", {
      method: "POST",
      body: JSON.stringify({
        mode: "session",
      }),
    });
    appLoad.value = false;
    navigateTo("/signin");
  }
  const authModal = ref<boolean>(false);
  function mutateAuthModal(newState?: boolean) {
    if (typeof newState === "undefined") {
      authModal.value = !authModal.value;
    } else {
      authModal.value = newState;
    }
  }

  const userData = ref<UserData>();

  const getUserData = async (accessToken: string) => {
    const { data } = await $fetch<{
      data: UserData;
    }>("/panel/users/me?fields=*.*", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
        "Cache-Control": "no-store",
      },
    });
    if (data) {
      userData.value = data;
    }
  };

  const tryRefresh = async (redirect?: boolean) => {
    console.log("try refrehs");
    try {
      const { data } = await $fetch<{ data: AuthPayload }>(
        "/panel/auth/refresh",
        {
          method: "POST",
          body: JSON.stringify({
            mode: "session",
          }),
        }
      );
      signin(data.access_token);
      getUserData(data.access_token);
      setTimeout(() => {
        tryRefresh();
      }, data.expires - 1000);
    } catch (error) {
      isSignedIn.value = false;
      accessToken.value = "";
      if (redirect === true) {
        navigateTo("/signin");
      }
    } finally {
      appLoad.value = false;
    }
  };

  return {
    isSignedIn,
    accessToken,
    signin,
    signout,
    authModal,
    mutateAuthModal,
    appLoad,
    tryRefresh,
    getUserData,
  };
});
