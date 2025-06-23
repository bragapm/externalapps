<script lang="ts" setup>
import { ref, computed } from "vue";

import IcHome from "@/assets/icons/ic-home.svg";
import IcAbsen from "@/assets/icons/ic-absen.svg";
import IcData from "@/assets/icons/ic-master-data.svg";
import IcMap from "@/assets/icons/ic-tracking.svg";
import IcUser from "@/assets/icons/ic-user.svg";
import IcFile from "@/assets/icons/ic-file.svg";

interface MenuChild {
  label: string;
  to: string;
  isActive: boolean;
}

interface MenuItem {
  label: string;
  icon: any;
  isActive: boolean;
  isExpanded: Ref<boolean>;
  children?: MenuChild[];
}

const route = useRoute();
const isCollapsed = ref(false);

const menuGroups = computed((): { items: MenuItem[] }[] => [
  {
    items: [
      {
        label: "Dashboard",
        icon: IcHome,
        isActive: route.path === "/" || route.path === "/report",
        isExpanded: ref(route.path === "/" || route.path === "/report"),
        children: [
          {
            label: "Absensi",
            to: "/",
            isActive: route.path === "/",
          },
          {
            label: "Laporan",
            to: "/report",
            isActive: route.path === "/report",
          },
        ],
      },
    ],
  },
  {
    items: [
      {
        label: "Absensi",
        icon: IcAbsen,
        isActive: route.path.startsWith("/absensi"),
        isExpanded: ref(route.path.startsWith("/absensi")),
        children: [
          {
            label: "Histori Absensi",
            to: "/absensi/histori",
            isActive: route.path === "/absensi/histori",
          },
          {
            label: "Cuti",
            to: "/absensi/cuti",
            isActive: route.path === "/absensi/cuti",
          },
          {
            label: "Perjalanan Dinas",
            to: "/absensi/perjalanan-dinas",
            isActive: route.path === "/absensi/perjalanan-dinas",
          },
        ],
      },
    ],
  },
  {
    items: [
      {
        label: "Aktifitas",
        icon: IcFile,
        isActive: route.path.startsWith("/aktifitas"),
        isExpanded: ref(route.path.startsWith("/aktifitas")),
        children: [
          {
            label: "Aktifitas Harian",
            to: "/aktifitas/harian",
            isActive: route.path === "/aktifitas/harian",
          },
          {
            label: "Mingguan/Bulanan",
            to: "/aktifitas/mingguan",
            isActive: route.path === "/aktifitas/mingguan",
          },
          {
            label: "Laporan",
            to: "/aktifitas/laporan",
            isActive: route.path === "/aktifitas/laporan",
          },
          {
            label: "Rencana Kerja",
            to: "/aktifitas/rencana-kerja",
            isActive: route.path === "/aktifitas/rencana-kerja",
          },
        ],
      },
    ],
  },
  {
    items: [
      {
        label: "Master Data",
        icon: IcData,
        isActive: route.path.startsWith("/data"),
        isExpanded: ref(route.path.startsWith("/data")),
        children: [
          {
            label: "Aktifitas Harian",
            to: "/aktifitas/harian",
            isActive: route.path === "/aktifitas/harian",
          },
          {
            label: "Mingguan/Bulanan",
            to: "/aktifitas/mingguan",
            isActive: route.path === "/aktifitas/mingguan",
          },
          {
            label: "Laporan",
            to: "/aktifitas/laporan",
            isActive: route.path === "/aktifitas/laporan",
          },
          {
            label: "Rencana Kerja",
            to: "/aktifitas/rencana-kerja",
            isActive: route.path === "/aktifitas/rencana-kerja",
          },
        ],
      },
    ],
  },
  {
    items: [
      {
        label: "Stakeholder",
        icon: IcUser,
        isActive: route.path.startsWith("/stakeholder"),
        isExpanded: ref(route.path.startsWith("/stakeholder")),
      },
    ],
  },
  {
    items: [
      {
        label: "Media & Publikasi",
        icon: IcFile,
        isActive: route.path.startsWith("/media"),
        isExpanded: ref(route.path.startsWith("/media")),
      },
    ],
  },
  {
    items: [
      {
        label: "Maps Tracking",
        icon: IcMap,
        isActive: route.path.startsWith("/map"),
        isExpanded: ref(route.path.startsWith("/map")),
      },
    ],
  },
]);

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

const toggleExpand = (item: any) => {
  item.isExpanded.value = !item.isExpanded.value;
};

// Accordion Animation
const onEnter = (el: Element) => {
  const element = el as HTMLElement;
  element.style.height = "0";
  element.offsetHeight;
  element.style.height = element.scrollHeight + "px";
};

const onAfterEnter = (el: Element) => {
  const element = el as HTMLElement;
  element.style.height = "auto";
};

const onLeave = (el: Element) => {
  const element = el as HTMLElement;
  element.style.height = element.scrollHeight + "px";
  element.offsetHeight;
  element.style.height = "0";
};

const onAfterLeave = (el: Element) => {
  const element = el as HTMLElement;
  element.style.height = "auto";
};
</script>

<template>
  <div
    :class="[
      'flex flex-col p-5 ml-6 shrink-0 sticky top-0 h-[calc(100vh-8rem)] overflow-auto bg-grey-100 shadow-[0px_4px_8px_0px_rgba(79,76,74,0.04)] border border-grey-200 rounded-xs transition-all duration-300',
      isCollapsed ? 'w-16 p-2' : 'w-[13.875rem]',
    ]"
  >
    <div class="flex justify-between items-center mb-4">
      <p v-if="!isCollapsed" class="text-grey-800 text-sm font-medium">Menu</p>
      <button @click="toggleCollapse">
        <!-- Custom SVG from assets -->
        <SvgoIcArrowFat
          :class="[
            'transition-transform duration-300',
            isCollapsed ? 'rotate-180' : '',
          ]"
        />
      </button>
    </div>

    <div class="flex flex-col">
      <div
        v-for="(group, groupIndex) in menuGroups"
        :key="groupIndex"
        class="nav-group"
      >
        <div v-for="item in group.items" :key="item.label" class="nav-item">
          <button
            @click="toggleExpand(item)"
            :class="[
              'flex items-center justify-between w-full p-2 rounded-md text-left transition-colors duration-200',
              item.isActive
                ? 'text-red-600'
                : 'text-grey-800 hover:text-grey-700',
            ]"
          >
            <div class="flex items-center space-x-3">
              <!-- Custom SVG Icons from assets -->
              <component
                v-if="!isCollapsed"
                :is="item.icon"
                class="w-12 h-12"
              />
              <span v-if="!isCollapsed" class="text-sm font-medium">{{
                item.label
              }}</span>
            </div>

            <SvgoIcArrowReg
              v-if="!isCollapsed && item.children"
              :class="[
                'w-4 h-4 transition-transform duration-200',
                item.isExpanded.value ? '' : 'rotate-180',
              ]"
            />
          </button>

          <Transition
            name="accordion"
            @enter="onEnter"
            @after-enter="onAfterEnter"
            @leave="onLeave"
            @after-leave="onAfterLeave"
          >
            <div
              v-if="item.children && !isCollapsed && item.isExpanded.value"
              class="accordion-content ml-7 space-y-1"
            >
              <NuxtLink
                v-for="child in item.children"
                :key="child.label"
                :to="child.to"
                :class="[
                  'block px-2 py-[0.375rem] text-sm rounded-md transition-colors duration-200',
                  child.isActive
                    ? 'text-red-600 font-medium'
                    : 'text-grey-900 hover:text-grey-700 font-medium',
                ]"
              >
                {{ child.label }}
              </NuxtLink>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <div
      class="mt-auto flex gap-3 items-center text-grey-800 font-medium text-[14px]"
    >
      <SvgoIcHelp class="mt-1" />
      <p v-if="!isCollapsed">Help</p>
    </div>
  </div>
</template>

<style scoped>
.nav-group:not(:first-child) {
  margin-top: 4px;
}

.nav-item {
  margin-bottom: 0.5rem;
}

/* Accordion animation styles */
.accordion-enter-active,
.accordion-leave-active {
  transition: all 0.3s ease-in-out;
  overflow: hidden;
}

.accordion-enter-from,
.accordion-leave-to {
  height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

.accordion-enter-to,
.accordion-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.nav-item button:hover img {
  opacity: 0.8;
}
</style>
