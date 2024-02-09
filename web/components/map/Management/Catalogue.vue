<script setup lang="ts">
import IcCross from "~/assets/icons/ic-cross.svg";
import IcFileSort from "~/assets/icons/ic-file-sort.svg";
import IcHelp from "~/assets/icons/ic-help.svg";
import IcCheck from "~/assets/icons/ic-check.svg";
import IcMapLayerA from "~/assets/icons/ic-map-layer-a.svg";
import IcMapLayerB from "~/assets/icons/ic-map-layer-b.svg";
const store = useCatalogue();
const { toggleCatalogue } = store;
</script>

<template>
  <div class="flex flex-col gap-3 p-5 h-full max-h-full">
    <div class="flex justify-between">
      <div class="flex items-center gap-3">
        <IcFileSort class="text-grey-300 w-4 h-4" :fontControlled="false" />
        <h1 class="text-grey-50">Data Catalogue</h1>
      </div>
      <button
        @click="
          () => {
            toggleCatalogue();
          }
        "
      >
        <IcCross class="w-4 h-4 text-grey-400" :fontControlled="false" />
      </button>
    </div>
    <div class="h-full flex">
      <div class="flex flex-col text-white border rounded-l-xs p-2 gap-2">
        <span>
          <h2 class="text-xs">Data Catalogue</h2>
          <p class="text-2xs">Datasets list available in this GeoDashboard</p>
        </span>
        <UButton
          :ui="{ rounded: 'rounded-xxs' }"
          label="Show All"
          class="w-full justify-between v"
          disabled
          @click="
            () => {
              console.log('tes');
            }
          "
        />
        <div class="border-t" />
        <div>
          <span>
            <h2 class="text-xs">Default Catalogue</h2>
            <p class="text-2xs">Dataset Folder/Project Provided by Default</p>
          </span>
        </div>
        <div class="border-t" />
        <div>
          <span>
            <h2 class="text-xs">User’s Catalogue</h2>
            <p class="text-2xs">Dataset Folder/Project Provided by Default</p>
          </span>
        </div>
      </div>
      <div class="flex flex-col w-full">
        <div
          class="flex border border-l-0 rounded-tr-xs p-3 items-center justify-between"
        >
          <div class="flex gap-2 items-center">
            <UButton
              :ui="{ rounded: 'rounded-xxs' }"
              label="Sort - Alphabetical (A-Z)"
              class="text-xs text-white outline-grey-50 border-grey-50"
              variant="outline"
              color="grey"
              @click="
                () => {
                  console.log('tes');
                }
              "
            />
            <UButton
              :ui="{ rounded: 'rounded-xxs' }"
              label="All Format"
              variant="outline"
              class="text-xs"
              color="grey"
              @click="
                () => {
                  console.log('tes');
                }
              "
            >
              <template #leading>
                <IcMapLayerB color="grey" />
              </template>
            </UButton>

            <UButton
              :ui="{ rounded: 'rounded-xxs' }"
              label="All Dimension"
              variant="outline"
              class="text-xs"
              color="grey"
              @click="
                () => {
                  console.log('tes');
                }
              "
            >
              <template #leading>
                <IcMapLayerA color="grey" />
              </template>
            </UButton>
          </div>
          <UInput
            color="gray"
            :ui="{ rounded: 'rounded-xxs' }"
            placeholder="Search Dataset"
          >
            <template #trailing>
              <UButton
                color="grey"
                variant="link"
                icon="i-heroicons-magnifying-glass-20-solid"
                :padded="false"
              />
            </template>
          </UInput>
        </div>
        <div
          class="flex flex-col w-full h-full border border-t-0 border-l-0 rounded-br-xs overflow-y-scroll divide-y"
        >
          <div class="flex flex-col px-3 py-2 gap-1">
            <h3 class="text-grey-50">Primary Dataset</h3>
            <p class="text-xs text-grey-50">
              Project/Folder Description Lorem ipsum dolor sit amet, consectetur
              adipiscing elit, sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo
              consequat. Duis aute irure dolor in reprehenderit in voluptate
            </p>
            <span class="flex items-center gap-3 text-grey-400 text-xs">
              <p>Folder by: [Contributor Name Here]</p>
              <p>Made at: DD/MM/YYYY</p>
              <p>No. of Datasets : 3</p>
            </span>
            <div class="grid grid-cols-4 mt-3 gap-3">
              <div class="flex flex-col gap-2 border rounded-xs p-2">
                <div class="flex items-center gap-1">
                  <UBadge
                    :ui="{ rounded: 'rounded-xxs' }"
                    variant="outline"
                    class="flex items-center gap-1"
                    color="grey"
                  >
                    <IcMapLayerA></IcMapLayerA>
                    <p>Polygon</p>
                  </UBadge>
                  <UBadge
                    :ui="{ rounded: 'rounded-xxs' }"
                    variant="outline"
                    color="green"
                    class="gap-1"
                  >
                    <IcCheck></IcCheck>
                    <p>In Map</p>
                  </UBadge>
                </div>
                <img
                  src="~/assets/images/catalogue-item.jpeg"
                  alt="catalogue-item"
                  class="h-24 w-full object-cover object-center rounded-xxs"
                />
                <article>
                  <div class="flex items-center justify-between gap-2">
                    <h5 class="text-xs text-grey-50 truncate">
                      Building Types adsjalskjd kasdkl ajskdlj sakljd lkasklds j
                    </h5>
                    <button>
                      <IcHelp
                        class="w-3 h-3 text-brand-500"
                        :fontControlled="false"
                      />
                    </button>
                  </div>
                  <p class="line-clamp-3 text-grey-500 text-2xs">
                    Dataset Layer Description 2 Line Max. Lorem ipsum dolor sit
                    amet, cons ectetur adipiscing elit, sed do eiusmod tempor
                    incididunt ut labore et dolore magna aliqua. Ut enim ad
                    minim veniam, quis nostrud exercitation ullamco laboris nisi
                    ut
                  </p>
                </article>
                <UButton
                  :ui="{ rounded: 'rounded-xxs' }"
                  label="Remove"
                  class="w-full justify-center"
                  disabled
                  color="grey"
                  @click="
                    () => {
                      console.log('tes');
                    }
                  "
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
