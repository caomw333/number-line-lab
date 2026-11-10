/* Adapted from Quill-00/INDEX, src/lib/numberline.ts (MIT).
 * Copyright (c) 2026 INDEX contributors. See LICENSE-INDEX.txt.
 * Changes: TypeScript removed; only coordinate/drag helpers retained;
 * exposed as a browser global so this demo works directly from file://.
 */
(() => {
  const NL_MIN = -10;
  const NL_MAX = 10;
  const clampValue = (v, min = NL_MIN, max = NL_MAX) => Math.min(max, Math.max(min, v));
  function valueToFraction(v, min = NL_MIN, max = NL_MAX) {
    return (v - min) / (max - min);
  }
  function fractionToValue(f, step = 1, min = NL_MIN, max = NL_MAX) {
    const raw = min + Math.min(1, Math.max(0, f)) * (max - min);
    const snapped = Math.round(raw / step) * step;
    return Number(clampValue(snapped, min, max).toFixed(4)) + 0;
  }
  globalThis.NumberLine = Object.freeze({ NL_MIN, NL_MAX, clampValue, valueToFraction, fractionToValue });
})();
