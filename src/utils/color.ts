// convert a decimal number to a hex string
function toHex(n: number) {
  let x = Math.round(n);
  x = x < 0 ? 0 : x;
  x = x > 255 ? 255 : x;
  let str = x.toString(16);
  if (str.length < 2) {
    str = `0${str}`;
  }
  return str;
}

/**
 * Adjust the brightness of a given color.
 * @param color 7-char hex string for a color '#XXXXXX'
 * @param light factor by which to tint/shade. < 0 darkens, > 0 brightens.
 * @returns The adjusted color as a 7-char hex string.
 */
export function shadeColor(color: string, light: number) {
  let r = parseInt(color.substr(1, 2), 16);
  let g = parseInt(color.substr(3, 2), 16);
  let b = parseInt(color.substr(5, 2), 16);

  if (light < 0) {
    // darken
    r *= (1 + light);
    g *= (1 + light);
    b *= (1 + light);
  } else {
    // brighten
    r = (1 - light) * r + light * 255;
    g = (1 - light) * g + light * 255;
    b = (1 - light) * b + light * 255;
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Convert HSV to RGB. h, s, v should be between 0 and 1 inclusive.
 */
function HSVtoRGB(h: number, s: number, v: number) {
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  let r = 0;
  let g = 0;
  let b = 0;
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

export function randomColor() {
  const randomHue = Math.random();
  const { r, g, b } = HSVtoRGB(randomHue, 0.9, 0.8);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
