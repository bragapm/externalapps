import { defineStore } from "pinia";

export const useAuth = defineStore("authData", () => {
  const isSignedIn = ref<boolean>(false);
  const accessToken = ref<string>("");
  function signin(newToken: string) {
    isSignedIn.value = true;
    accessToken.value = newToken;
  }
  function signout() {
    isSignedIn.value = false;
    accessToken.value = "";
    fetch("/panel/auth/logout", {
      method: "POST",
      body: JSON.stringify({
        refresh_token: localStorage.getItem(refreshTokenKey),
      }),
    }).then(() => {
      localStorage.removeItem(refreshTokenKey);
    });
  }
  return { isSignedIn, accessToken, signin, signout };
});
