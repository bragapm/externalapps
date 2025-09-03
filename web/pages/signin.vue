<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import IcAction from "~/assets/icons/ic-action.svg";
import IcEye from "~/assets/icons/ic-eye.svg";
import IcEyeCrossed from "~/assets/icons/ic-eye-crossed.svg";
import IcLogoGeodashboardFull from "~/assets/icons/ic-logo-geodashboard-full.svg";
import IcSpinner from "~/assets/icons/ic-spinner.svg";
import { useGeneralSettings, useMapData } from "~/utils";

import NewLogo from "@/assets/images/new-logo.png";
import Logo from "@/assets/images/logo.png";
import Bg from "@/assets/images/login.png";

type SigninData = {
  email: string;
  password: string;
};

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Must be at least 8 characters"),
});

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
  email: undefined,
  password: undefined,
});

const route = useRoute();
const router = useRouter();

const { data: mapData } = await useMapData();
const { data: generalSettingsData } = await useGeneralSettings();
const signinData = reactive<SigninData>({ email: "", password: "" });
const generalErrorMessage = ref("");
const showPassword = ref(false);
const isLoading = ref(false);

const img = useImage();
const bgImgUrl = computed(() => {
  const fromAPI = generalSettingsData.value?.data.public_background;
  const url = fromAPI
    ? img(fromAPI, undefined, { provider: "directus" }) // gunakan Directus image
    : Bg; // fallback ke image lokal
  return `url('${url}')`;
});

const authStore = useAuth();

const { signin, tryRefresh, getUserData } = authStore;
const { accessToken } = storeToRefs(authStore);
async function onSubmit(event: FormSubmitEvent<Schema>) {
  generalErrorMessage.value = "";
  isLoading.value = true;
  const { email, password } = event.data;

  try {
    const { data } = await $fetch<{ data: AuthPayload }>("/panel/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, mode: "cookie" }),
    });
    console.log("data", data);
    signin(data.access_token);
    getUserData(data.access_token);
    setTimeout(() => {
      tryRefresh();
    }, data.expires - 1000);

    const redirectPath = route.query.redirect || "/"; // Redirect ke tujuan awal atau default ke "/map"
    router.push(redirectPath as string);
  } catch (error) {
    generalErrorMessage.value =
      "Signin information is incorrect. Make sure the email and password is correct and try again.";
    isLoading.value = false;
  }
}

onMounted(() => {
  if (accessToken.value !== null && accessToken.value !== "") {
    router.push("/");
  }
});
</script>

<template>
  <div class="flex px-6 pb-6 h-[calc(100vh-120px)] w-full">
    <div
      :class="[
        'flex justify-end w-full rounded-lg',
        bgImgUrl ? 'bg-cover bg-center' : 'bg-grey-900',
      ]"
      :style="`background-image: ${bgImgUrl}`"
    >
      <div class="w-1/2 p-10">
        <div
          class="flex flex-col bg-grey-200 rounded-lg h-full px-20 py-8 overflow-y-auto justify-center"
        >
          <div class="flex flex-col text-center space-y-5 mb-16">
            <div class="flex flex-col items-center gap-2">
              <!-- <div class="flex gap-2 mx-auto">
                <div
                  class="font-bold text-[10px] uppercase text-grey-950 text-left"
                >
                  <p>X-RELS</p>
                  <p>Apps</p>
                </div>
              </div> -->
              <img :src="NewLogo" class="w-[3rem] h-auto mx-auto" />
            </div>
            <div class="flex flex-col items-center gap-1">
              <h1 class="text-4xl font-medium text-grey-800">
                Welcome to the X-RELS Apps
              </h1>
              <p class="text-grey-500 text-sm">
                Access and manage all integrated applications in one place.
                Please sign in to continue your workflow.
              </p>
            </div>
          </div>
          <UForm
            :schema="schema"
            :state="state"
            class="flex flex-col space-y-3 mb-5"
            @submit="onSubmit"
          >
            <UFormField name="email">
              <UInput
                v-model="state.email"
                type="email"
                class="w-full"
                size="xl"
                placeholder="Email"
                :disabled="isLoading"
              />
            </UFormField>
            <UFormField name="password">
              <UInput
                v-model="state.password"
                :type="showPassword ? 'text' : 'password'"
                class="w-full"
                size="xl"
                placeholder="Password"
                :disabled="isLoading"
              >
                <template #trailing>
                  <button type="button" @click="showPassword = !showPassword">
                    <IcEye v-if="showPassword" class="text-grey-400" />
                    <IcEyeCrossed v-else class="text-grey-400" />
                  </button>
                </template>
              </UInput>
            </UFormField>
            <UButton
              block
              size="xl"
              type="submit"
              label="Sign In"
              class="rounded-sm"
            >
              <IcSpinner
                class="text-white animate-spin h-6 w-6 p-1"
                :fontControlled="false"
                v-if="isLoading"
              />
            </UButton>
          </UForm>
          <USeparator color="secondary" class="opacity-25" />

          <!-- <div class="w-full border border-grey-600 mb-7" />
          <UButton
            block
            variant="outline"
            size="xl"
            class="mb-7"
            label="Sign In with Google"
            :ui="{ rounded: 'rounded-xxs' }"
            :disabled="isLoading"
          >
            <template #leading>
              <img
                src="https://lh3.googleusercontent.com/COxitqgJr1sJnIDe8-jiKhxDx1FrYbtRHKJ9z_hELisAlapwE9LUPh6fcXIfb5vwpbMl4xl9H9TRFPc5NOO8Sb3VSgIBrfRYvW6cUA"
                class="h-5"
              />
            </template>
          </UButton> -->
          <p class="text-center text-grey-500 text-sm mt-5">
            ©{{ new Date().getFullYear() }} Provided by DigiTech - External Apps
            Powered by Braga Technologies
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
