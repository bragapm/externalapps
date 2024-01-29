<script setup lang="ts">
import type { VectorTiles, CircleStyles } from "~/utils/types";

const store = useMapRef();
const { map } = storeToRefs(store);

const props = defineProps<{
  item: VectorTiles;
}>();

function isString(value: string | number): value is string {
  return typeof value === "string";
}

function parseString(input: string) {
  try {
    const parsed = JSON.parse(input);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (e) {
    // Do nothing, will return the input string
  }
  return input;
}

watchEffect(async () => {
  if (map?.value) {
    if (!map.value.getSource(props.item.layer_name)) {
      map.value.addSource(props.item.layer_name, {
        type: "vector",
        tiles: [
          window.location.origin +
            "/panel/mvt/" +
            props.item.layer_name +
            "?z={z}&x={x}&y={y}",
        ],
        minzoom: props.item.minzoom || 5,
        maxzoom: props.item.maxzoom || 15,
      });

      if (props.item.geometry_type === "POINT") {
        if (props.item.circle_style) {
          let paint: any = {},
            layout: any = {};

          Object.keys(props.item.circle_style).forEach((key) => {
            const [category, ...nameStrings] = key.split("_");
            if (
              category === "paint" &&
              props.item.circle_style?.[
                key as keyof typeof props.item.circle_style
              ]
            ) {
              paint[nameStrings.join("-")] = nameStrings.includes("opacity")
                ? parseFloat(props.item.circle_style.paint_circle_opacity)
                : isString(props.item.circle_style[key as keyof CircleStyles])
                ? parseString(
                    props.item.circle_style[key as keyof CircleStyles] as string
                  )
                : props.item.circle_style[key as keyof CircleStyles];
            } else if (
              category === "layout" &&
              props.item.circle_style?.[key as keyof CircleStyles]
            ) {
              layout[nameStrings.join("-")] =
                props.item.circle_style[key as keyof CircleStyles];
            }
          });

          map.value.addLayer({
            id: props.item.layer_name,
            type: "circle",
            source: props.item.layer_name,
            "source-layer": props.item.layer_name,
            layout: {
              visibility: props.item.default ? "visible" : "none",
            },
            paint,
          });
        }
      }
    }
  }
});
</script>

<template></template>
