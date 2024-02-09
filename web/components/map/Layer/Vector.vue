<script setup lang="ts">
import type { VectorTiles, CircleStyles, FillStyles } from "~/utils/types";

const store = useMapRef();
const { map } = storeToRefs(store);

const props = defineProps<{
  renderedLayers: (VectorTiles | RasterTiles)[];
  item: VectorTiles;
  order: number;
}>();

function isString(value: string | number | boolean): value is string {
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

watchEffect(async (onInvalidate) => {
  const onMouseEnter = () => {
    map.value!.getCanvas().style.cursor = "pointer";
  };
  const onMouseLeave = () => {
    map.value!.getCanvas().style.cursor = "";
  };

  if (map?.value) {
    if (!map.value.getSource(props.item.layer_id)) {
      map.value.addSource(props.item.layer_id, {
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
    }
    if (!map.value.getLayer(props.item.layer_id)) {
      let beforeId: undefined | string = undefined;
      if (props.order !== 0) {
        beforeId = props.renderedLayers[props.order - 1].layer_id;
      }

      if (props.item.geometry_type === "CIRCLE") {
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

          map.value.addLayer(
            {
              id: props.item.layer_id,
              type: "circle",
              source: props.item.layer_id,
              "source-layer": props.item.layer_name,
              layout,
              paint,
            },
            beforeId || undefined
          );
        }
      } else if (props.item.geometry_type === "POLYGON") {
        if (props.item.fill_style) {
          let paint: any = {},
            layout: any = {};

          Object.keys(props.item.fill_style).forEach((key) => {
            const [category, ...nameStrings] = key.split("_");
            if (
              category === "paint" &&
              props.item.fill_style?.[key as keyof typeof props.item.fill_style]
            ) {
              paint[nameStrings.join("-")] = nameStrings.includes("opacity")
                ? parseFloat(props.item.fill_style.paint_fill_opacity)
                : isString(props.item.fill_style[key as keyof FillStyles])
                ? parseString(
                    props.item.fill_style[key as keyof FillStyles] as string
                  )
                : props.item.fill_style[key as keyof FillStyles];
            } else if (
              category === "layout" &&
              props.item.fill_style?.[key as keyof FillStyles]
            ) {
              layout[nameStrings.join("-")] =
                props.item.fill_style[key as keyof FillStyles];
            }
          });

          map.value.addLayer(
            {
              id: props.item.layer_id,
              type: "fill",
              source: props.item.layer_id,
              "source-layer": props.item.layer_name,
              layout,
              paint,
            },
            beforeId || undefined
          );
        }
      } else if (props.item.geometry_type === "LINE") {
        if (props.item.line_style) {
          let paint: any = {},
            layout: any = {};

          Object.keys(props.item.line_style).forEach((key) => {
            const [category, ...nameStrings] = key.split("_");
            if (
              category === "paint" &&
              props.item.line_style?.[key as keyof typeof props.item.line_style]
            ) {
              paint[nameStrings.join("-")] = nameStrings.includes("opacity")
                ? parseFloat(props.item.line_style.paint_line_opacity)
                : isString(props.item.line_style[key as keyof LineStyles])
                ? parseString(
                    props.item.line_style[key as keyof LineStyles] as string
                  )
                : props.item.line_style[key as keyof LineStyles];
            } else if (
              category === "layout" &&
              props.item.line_style?.[key as keyof LineStyles]
            ) {
              layout[nameStrings.join("-")] =
                props.item.line_style[key as keyof LineStyles];
            }
          });

          map.value.addLayer(
            {
              id: props.item.layer_id,
              type: "line",
              source: props.item.layer_id,
              "source-layer": props.item.layer_name,
              layout,
              paint,
            },
            beforeId || undefined
          );
        }
      }

      // emit("updateBeforeId", props.item.layer_id);
    }

    if (props.item.click_popup_columns?.length) {
      map.value.on("mouseenter", props.item.layer_id, onMouseEnter);
      map.value.on("mouseleave", props.item.layer_id, onMouseLeave);
    }
  }

  onInvalidate(() => {
    if (map?.value) {
      map.value.off("mouseenter", props.item.layer_id, onMouseEnter);
      map.value.off("mouseleave", props.item.layer_id, onMouseLeave);
    }
  });
});
</script>

<template></template>
