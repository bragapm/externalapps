import type { MapData } from "./types";

export const useMapData = async () => {
  const { pending, data } = await useFetch<MapData>("/panel/items/map/eng", {
    key: "map",
  });
  console.log({ mapData: data });
  return { data, isLoading: pending };
};
