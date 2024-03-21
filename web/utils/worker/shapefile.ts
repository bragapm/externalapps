import shp, { type FeatureCollectionWithFilename } from "shpjs/dist/shp"; // we use dist because of bundling issue when directly using shpjs

import BoundsWorker from "~/utils/worker/bounds?worker";
import type { IBoundsWorker } from "./bounds";

interface IWorkerMessage extends File {}
declare var onmessage:
  | ((this: Window, ev: MessageEvent<IWorkerMessage>) => any)
  | null;
interface IParseResult {
  geojsonObj: GeoJSON.GeoJSON;
  bounds: GeoJSON.Polygon;
}
interface IParseResultWithFileName extends IParseResult {
  fileName?: string;
}
interface IWorkerResultSuccess {
  status: "success";
  data: IParseResult | IParseResultWithFileName[];
}
interface IWorkerResultError {
  status: "error";
  message: string;
  data?: any;
}
declare function postMessage(
  message: IWorkerResultSuccess | IWorkerResultError,
  targetOrigin: string,
  transfer?: Transferable[]
): void;
declare function postMessage(
  message: IWorkerResultSuccess | IWorkerResultError,
  options?: WindowPostMessageOptions
): void;
export interface IShapefileWorker extends Worker {
  postMessage(
    message: IWorkerMessage,
    options?: StructuredSerializeOptions
  ): void;
  postMessage(message: IWorkerMessage, transfer: Transferable[]): void;
  addEventListener(
    type: "message",
    listener: (
      this: Worker,
      ev: MessageEvent<IWorkerResultSuccess | IWorkerResultError>
    ) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener<K extends keyof WorkerEventMap>(
    type: K,
    listener: (this: Worker, ev: WorkerEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
}

onmessage = async (event: MessageEvent<File>) => {
  const buffer = await event.data.arrayBuffer();
  let parsed: FeatureCollectionWithFilename | FeatureCollectionWithFilename[];
  try {
    parsed = await shp(buffer);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error parsing Shapefile";
    postMessage({ status: "error", message, data: error });
    return;
  }
  const boundsWorker: IBoundsWorker = new BoundsWorker();
  boundsWorker.addEventListener("error", (e) => {
    postMessage({ status: "error", data: e.error, message: e.message });
    boundsWorker.terminate();
  });
  if (Array.isArray(parsed)) {
    boundsWorker.addEventListener<typeof parsed>("message", (e) => {
      const { data } = e.data;
      const results = (parsed as FeatureCollectionWithFilename[]).map(
        (el, i) => {
          return {
            fileName: el.fileName,
            geojsonObj: el,
            bounds: data[i],
          };
        }
      );
      postMessage({
        status: "success",
        data: results,
      });
      boundsWorker.terminate();
    });
  } else {
    boundsWorker.addEventListener<typeof parsed>("message", (e) => {
      postMessage({
        status: "success",
        data: {
          geojsonObj: parsed as FeatureCollectionWithFilename,
          bounds: e.data.data,
        },
      });
      boundsWorker.terminate();
    });
  }

  boundsWorker.postMessage(parsed);
};
