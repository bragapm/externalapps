import { defineStore } from "pinia";

export const useAuth = defineStore("authData", () => {
  const isSignedIn = ref<boolean>(false);
  const accessToken = ref<string>("");
  function signin(newToken: string) {
    isSignedIn.value = true;
    accessToken.value = newToken;
  }
  async function signout() {
    isSignedIn.value = false;
    accessToken.value = "";
    await fetch("/panel/auth/logout", {
      method: "POST",
      body: JSON.stringify({
        refresh_token: localStorage.getItem(refreshTokenKey),
      }),
    });
    localStorage.removeItem(refreshTokenKey);
  }
  const authModal = ref<boolean>(false);
  function mutateAuthModal(newState?: boolean) {
    if (typeof newState === "undefined") {
      authModal.value = !authModal.value;
    } else {
      authModal.value = newState;
    }
  }

  return {
    isSignedIn,
    accessToken,
    signin,
    signout,
    authModal,
    mutateAuthModal,
  };
});
