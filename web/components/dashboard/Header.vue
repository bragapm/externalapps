<script lang="ts" setup>
import patternr from "@/assets/images/pattern/home-right.png";
import patternl from "@/assets/images/pattern/home-left.png";

const currentDay = ref("");
const currentDate = ref("");
const currentTime = ref("");

const updateTime = () => {
  const now = new Date();

  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  currentDay.value = days[now.getDay()];

  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  currentDate.value = `${now.getDate()} ${
    months[now.getMonth()]
  } ${now.getFullYear()}`;

  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  currentTime.value = `${hours}:${minutes} WIB`;
};

onMounted(() => {
  updateTime();
  setInterval(updateTime, 1000);
});
</script>

<template>
  <div
    class="bg-[#FBDFDF] p-6 w-full text-[#D32E36] relative overflow-hidden rounded-lg"
  >
    <img :src="patternl" class="absolute left-0 top-0 z-0" />
    <img :src="patternr" class="absolute right-0 bottom-0 z-0" />

    <div class="relative z-10 flex justify-between">
      <div>
        <h1 class="text-4xl font-semibold">Selamat Pagi Admin,</h1>
        <h1 class="text-4xl font-semibold mt-3">Anda Belum Absen Hari Ini</h1>
      </div>
      <div class="font-semibold text-right">
        <h3>{{ currentDay }}, {{ currentDate }}</h3>
        <h3>{{ currentTime }}</h3>
      </div>
    </div>

    <button
      class="mt-8 text-white bg-[#D32E36] px-3 py-2 font-medium rounded-[4px] relative z-10"
    >
      Check In Absence
    </button>
  </div>
</template>
