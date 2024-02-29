<script setup lang="ts">
import {
  geomTypeCircle,
  geomTypeLine,
  geomTypePolygon,
  geomTypeSymbol,
} from "~/constants";
import type {
  VectorTiles,
  CircleStyles,
  FillStyles,
  LineStyles,
  LayerLists,
  SymbolStyles,
} from "~/utils/types";

const store = useMapRef();
const { map } = storeToRefs(store);

const props = defineProps<{
  renderedLayers: LayerLists;
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
    } else if (typeof parsed === "number") {
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

      if (props.item.geometry_type === geomTypeCircle) {
        let paint: any = {},
          layout: any = {};

        Object.keys(props.item.layer_style).forEach((key) => {
          const [category, ...nameStrings] = key.split("_");
          if (
            category === "paint" &&
            props.item.layer_style?.[key as keyof typeof props.item.layer_style]
          ) {
            paint[nameStrings.join("-")] = isString(
              (props.item.layer_style as CircleStyles)[
                key as keyof CircleStyles
              ]
            )
              ? parseString(
                  (props.item.layer_style as CircleStyles)[
                    key as keyof CircleStyles
                  ] as string
                )
              : (props.item.layer_style as CircleStyles)[
                  key as keyof CircleStyles
                ];
          } else if (
            category === "layout" &&
            (props.item.layer_style as CircleStyles)?.[
              key as keyof CircleStyles
            ]
          ) {
            layout[nameStrings.join("-")] = isString(
              (props.item.layer_style as CircleStyles)[
                key as keyof CircleStyles
              ]
            )
              ? parseString(
                  (props.item.layer_style as CircleStyles)[
                    key as keyof CircleStyles
                  ] as string
                )
              : (props.item.layer_style as CircleStyles)[
                  key as keyof CircleStyles
                ];
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
      } else if (props.item.geometry_type === geomTypeSymbol) {
        let paint: any = {},
          layout: any = {};

        Object.keys(props.item.layer_style).forEach((key) => {
          const [category, ...nameStrings] = key.split("_");
          if (
            category === "paint" &&
            props.item.layer_style?.[key as keyof typeof props.item.layer_style]
          ) {
            paint[nameStrings.join("-")] = nameStrings.includes("opacity")
              ? parseFloat(
                  (props.item.layer_style as SymbolStyles)[
                    key as keyof SymbolStyles
                  ]
                )
              : isString(
                  (props.item.layer_style as SymbolStyles)[
                    key as keyof SymbolStyles
                  ]
                )
              ? parseString(
                  (props.item.layer_style as SymbolStyles)[
                    key as keyof SymbolStyles
                  ] as string
                )
              : (props.item.layer_style as SymbolStyles)[
                  key as keyof SymbolStyles
                ];
          } else if (
            category === "layout" &&
            (props.item.layer_style as SymbolStyles)?.[
              key as keyof SymbolStyles
            ]
          ) {
            layout[nameStrings.join("-")] = isString(
              (props.item.layer_style as SymbolStyles)[
                key as keyof SymbolStyles
              ]
            )
              ? parseString(
                  (props.item.layer_style as SymbolStyles)[
                    key as keyof SymbolStyles
                  ] as string
                )
              : (props.item.layer_style as SymbolStyles)[
                  key as keyof SymbolStyles
                ];
          }
        });

        map.value.addLayer(
          {
            id: props.item.layer_id,
            type: "symbol",
            source: props.item.layer_id,
            "source-layer": props.item.layer_name,
            layout,
            paint,
          },
          beforeId || undefined
        );
      } else if (props.item.geometry_type === geomTypePolygon) {
        let paint: any = {},
          layout: any = {};

        Object.keys(props.item.layer_style as FillStyles).forEach((key) => {
          const [category, ...nameStrings] = key.split("_");
          if (
            category === "paint" &&
            props.item.layer_style?.[key as keyof typeof props.item.layer_style]
          ) {
            paint[nameStrings.join("-")] = isString(
              (props.item.layer_style as FillStyles)[key as keyof FillStyles]
            )
              ? parseString(
                  (props.item.layer_style as FillStyles)[
                    key as keyof FillStyles
                  ] as string
                )
              : (props.item.layer_style as FillStyles)[key as keyof FillStyles];
          } else if (
            category === "layout" &&
            (props.item.layer_style as FillStyles)?.[key as keyof FillStyles]
          ) {
            layout[nameStrings.join("-")] = (
              props.item.layer_style as FillStyles
            )[key as keyof FillStyles];
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
      } else if (props.item.geometry_type === geomTypeLine) {
        let paint: any = {},
          layout: any = {};

        Object.keys(props.item.layer_style as LineStyles).forEach((key) => {
          const [category, ...nameStrings] = key.split("_");
          if (
            category === "paint" &&
            props.item.layer_style?.[key as keyof typeof props.item.layer_style]
          ) {
            paint[nameStrings.join("-")] = isString(
              (props.item.layer_style as LineStyles)[key as keyof LineStyles]
            )
              ? parseString(
                  (props.item.layer_style as LineStyles)[
                    key as keyof LineStyles
                  ] as string
                )
              : (props.item.layer_style as LineStyles)[key as keyof LineStyles];
          } else if (
            category === "layout" &&
            (props.item.layer_style as LineStyles)?.[key as keyof LineStyles]
          ) {
            layout[nameStrings.join("-")] = (
              props.item.layer_style as LineStyles
            )[key as keyof LineStyles];
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
