//color types
export interface Color {
  hex: string;
  rgb: ColorRGB;
  hsv: ColorHSV;
}

export interface ColorRGB {
  r: number;
  g: number;
  b: number;
}

export interface ColorHSV {
  h: number;
  s: number;
  v: number;
}

//color utils
export function getRgb(color: string): ColorRGB {
  const matches = /rgb\((\d+),\s?(\d+),\s?(\d+)\)/i.exec(color);
  const r = Number(matches?.[1] ?? 0);
  const g = Number(matches?.[2] ?? 0);
  const b = Number(matches?.[3] ?? 0);

  return {
    r,
    g,
    b,
  };
}

export function parseColor(color: string): Color {
  var hex = "";
  var rgb = {
    r: 0,
    g: 0,
    b: 0,
  };
  var hsv = {
    h: 0,
    s: 0,
    v: 0,
  };

  if (color.slice(0, 1) === "#") {
    hex = color;
    rgb = hexToRgb(hex);
    hsv = rgbToHsv(rgb);
  } else if (color.slice(0, 3) === "rgb") {
    rgb = getRgb(color);
    hex = rgbToHex(rgb);
    hsv = rgbToHsv(rgb);
  }

  return {
    hex,
    rgb,
    hsv,
  };
}

export function getSaturationCoordinates(color: Color): [number, number] {
  const { s, v } = rgbToHsv(color.rgb);

  const x = s;
  const y = 100 - v;

  return [x, y];
}

export function getHueCoordinates(color: Color): number {
  const { h } = color.hsv;

  const x = (h / 360) * 100;

  return x;
}

export function clamp(number: number, min: number, max: number): number {
  if (!max) {
    return Math.max(number, min) === min ? number : min;
  } else if (Math.min(number, min) === number) {
    return min;
  } else if (Math.max(number, max) === number) {
    return max;
  }
  return number;
}

//converter
function baseTenToHex(c: Number) {
  /**
   * I: A number
   * O: A string representation of the number in base 16
   */
  let hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

export function rgbToHex(color: ColorRGB): string {
  let { r, g, b } = color;
  return "#" + baseTenToHex(r) + baseTenToHex(g) + baseTenToHex(b);
}

export function hexToRgb(color: string): ColorRGB {
  var r = 0;
  var g = 0;
  var b = 0;

  // 3 digits
  if (color.length === 4) {
    r = Number("0x" + color[1] + color[1]);
    g = Number("0x" + color[2] + color[2]);
    b = Number("0x" + color[3] + color[3]);

    // 6 digits
  } else if (color.length === 7) {
    r = Number("0x" + color[1] + color[2]);
    g = Number("0x" + color[3] + color[4]);
    b = Number("0x" + color[5] + color[6]);
  }

  return {
    r,
    g,
    b,
  };
}

export function rgbToHsv(color: ColorRGB): ColorHSV {
  var { r, g, b } = color;
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);

  const h = d
    ? (max === r
        ? (g - b) / d + (g < b ? 6 : 0)
        : max === g
        ? 2 + (b - r) / d
        : 4 + (r - g) / d) * 60
    : 0;
  const s = max ? (d / max) * 100 : 0;
  const v = max * 100;

  return { h, s, v };
}

export function hsvToRgb(color: ColorHSV): ColorRGB {
  var { h, s, v } = color;
  s /= 100;
  v /= 100;

  const i = ~~(h / 60);
  const f = h / 60 - i;
  const p = v * (1 - s);
  const q = v * (1 - s * f);
  const t = v * (1 - s * (1 - f));
  const index = i % 6;

  const r = Math.round([v, q, p, p, t, v][index] * 255);
  const g = Math.round([t, v, v, q, p, p][index] * 255);
  const b = Math.round([p, p, t, v, v, q][index] * 255);

  return {
    r,
    g,
    b,
  };
}
