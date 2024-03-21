import geojsonhint from "@mapbox/geojsonhint/lib/object";

import BoundsWorker from "~/utils/worker/bounds?worker";
import type { IBoundsWorker } from "./bounds";

interface IWorkerMessage extends File {}
declare var onmessage:
  | ((this: Window, ev: MessageEvent<IWorkerMessage>) => any)
  | null;
interface IWorkerResultSuccess {
  status: "success";
  data: { geojsonObj: GeoJSON.GeoJSON; bounds: GeoJSON.Polygon };
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
export interface IGeojsonWorker extends Worker {
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

onmessage = async (event) => {
  const file = event.data;
  let geojsonObj: GeoJSON.GeoJSON;
  try {
    geojsonObj = JSON.parse(await file.text());
    const geojsonError = geojsonhint.hint(geojsonObj);
    if (geojsonError.length) {
      console.error(geojsonError);
      postMessage({ status: "error", message: "Invalid GeoJSON" });
      return;
    }
  } catch (error) {
    console.error(error);
    postMessage({ status: "error", message: "Error parsing GeoJSON" });
    return;
  }

  if (geojsonObj.type === "GeometryCollection") {
    postMessage({
      status: "error",
      message: "GeometryCollection is not supported",
    });
    return;
  }

  const boundsWorker: IBoundsWorker = new BoundsWorker();
  boundsWorker.addEventListener("error", (e) => {
    postMessage({ status: "error", data: e.error, message: e.message });
    boundsWorker.terminate();
  });
  boundsWorker.addEventListener<typeof geojsonObj>("message", (e) => {
    postMessage({
      status: "success",
      data: { geojsonObj, bounds: e.data.data },
    });
    boundsWorker.terminate();
  });
  boundsWorker.postMessage(geojsonObj);
};
