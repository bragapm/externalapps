import maplibregl from "maplibre-gl";

export default function addRasterColorProtocol() {
  // Function to interpolate between two colors
  function interpolateColor(
    color1: number[],
    color2: number[],
    factor: number
  ) {
    const result: number[] = [];

    for (let i = 0; i < 3; i++) {
      result[i] = Math.round(color1[i] + factor * (color2[i] - color1[i]));
    }
    return result;
  }

  // Generate a color scale of 256 colors from red to black
  function generateColorScale() {
    const red = [255, 0, 0];
    const black = [0, 0, 0];
    const scale: number[][] = [];

    for (let i = 0; i < 256; i++) {
      const factor = i / 255;
      scale.push(interpolateColor(red, black, factor));
    }
    return scale;
  }

  const colorScale = generateColorScale();

  maplibregl.addProtocol("greyscale", (async (params: any) => {
    try {
      const t = await fetch(params.url.replace("greyscale://", ""));
      if (t.status !== 200) {
        throw new Error(`Tile fetch error: ${t.statusText}`);
      }

      console.log("Enter greyscale protocol");
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        const blob = await t.blob();
        const img = new Image();
        img.src = URL.createObjectURL(blob);

        await new Promise<void>((resolve) => {
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, 256, 256);
            URL.revokeObjectURL(img.src);

            const imageData = ctx.getImageData(
              0,
              0,
              canvas.width,
              canvas.height
            );
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
              const value = data[i]; // Assuming grayscale image
              const color = colorScale[value];
              data[i] = color[0]; // Red
              data[i + 1] = color[1]; // Green
              data[i + 2] = color[2]; // Blue
            }

            ctx.putImageData(imageData, 0, 0);
            resolve();
          };
        });

        const newBlob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((blob) => resolve(blob));
        });

        if (newBlob) {
          const buffer = await newBlob.arrayBuffer();
          return { data: buffer };
        }
      }
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }) as any);
}
