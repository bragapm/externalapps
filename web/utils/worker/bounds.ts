import bbox from "@turf/bbox";

type IWorkerMessage = GeoJSON.GeoJSON | GeoJSON.GeoJSON[];
declare var onmessage:
  | ((this: Window, ev: MessageEvent<IWorkerMessage>) => any)
  | null;
interface IAbstractWorkerResult {
  status: "success";
}
interface IWorkerResult extends IAbstractWorkerResult {
  data: GeoJSON.Polygon;
}
interface IWorkerResultMulti extends IAbstractWorkerResult {
  data: GeoJSON.Polygon[];
}
declare function postMessage<M extends IWorkerMessage>(
  message: M extends GeoJSON.GeoJSON ? IWorkerResult : IWorkerResultMulti,
  targetOrigin: string,
  transfer?: Transferable[]
): void;
declare function postMessage<M extends IWorkerMessage>(
  message: M extends GeoJSON.GeoJSON ? IWorkerResult : IWorkerResultMulti,
  options?: WindowPostMessageOptions
): void;
export interface IBoundsWorker extends Worker {
  postMessage(
    message: IWorkerMessage,
    options?: StructuredSerializeOptions
  ): void;
  postMessage(message: IWorkerMessage, transfer: Transferable[]): void;
  addEventListener<M extends IWorkerMessage>(
    type: "message",
    listener: (this: Worker, ev: MessageEvent<M extends GeoJSON.GeoJSON ? IWorkerResult : IWorkerResultMulti>) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener<K extends keyof WorkerEventMap>(
    type: K,
    listener: (this: Worker, ev: WorkerEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
}

const buildPolygon = (
  xmin: number,
  ymin: number,
  xmax: number,
  ymax: number
): GeoJSON.Polygon => {
  return {
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
};

onmessage = (event) => {
  if (Array.isArray(event.data)) {
    const boundsArr: GeoJSON.Polygon[] = [];
    for (const geojson of event.data) {
      const [xmin, ymin, xmax, ymax] = bbox(geojson);
      boundsArr.push(buildPolygon(xmin, ymin, xmax, ymax))
    }
    postMessage<typeof event.data>({
      status: "success",
      data: boundsArr,
    });
  } else {
    const [xmin, ymin, xmax, ymax] = bbox(event.data);
    postMessage<typeof event.data>({
      status: "success",
      data: buildPolygon(xmin, ymin, xmax, ymax),
    });
  }
};
