import bbox from "@turf/bbox";

onmessage = (event: MessageEvent<GeoJSON.GeoJSON>) => {
  const [xmin, ymin, xmax, ymax] = bbox(event.data);
  const bounds = {
    type: "Polygon",
    coordinates: [
      [
        [xmin, ymin],
        [xmin, ymax],
        [xmax, ymax],
        [xmax, ymin],
        [xmin, ymin],
      ],
    ],
  };
  postMessage({ status: "success", data: bounds });
};
