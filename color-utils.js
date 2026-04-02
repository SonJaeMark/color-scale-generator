(() => {
  const cfg = window.ColorScaleGeneratorConfig;
  if (!cfg) throw new Error('Missing window.ColorScaleGeneratorConfig. Load config.js first.');

  function hexToRgb(hex) {
    return {
      r: parseInt(hex.slice(1, 3), 16),
      g: parseInt(hex.slice(3, 5), 16),
      b: parseInt(hex.slice(5, 7), 16),
    };
  }

  function rgbToHex({ r, g, b }) {
    const toHex = (channel) => channel.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  }

  function rgbToHsl({ r, g, b }) {
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    const delta = max - min;
    const lightness = (max + min) / 2;

    let hue = 0;
    if (delta !== 0) {
      if (max === rNorm) {
        hue = ((gNorm - bNorm) / delta) % 6;
      } else if (max === gNorm) {
        hue = (bNorm - rNorm) / delta + 2;
      } else {
        hue = (rNorm - gNorm) / delta + 4;
      }
      hue = Math.round(hue * 60);
      if (hue < 0) hue += 360;
    }

    const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));

    return {
      h: hue,
      s: Math.round(saturation * 100),
      l: Math.round(lightness * 100),
    };
  }

  function normalizeHexInput(colorValue) {
    const trimmed = colorValue.trim();
    if (!trimmed) return null;

    const withHash = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;

    // Support shorthand `#abc`
    if (/^#[\da-fA-F]{3}$/.test(withHash)) {
      const r = withHash[1];
      const g = withHash[2];
      const b = withHash[3];
      return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
    }

    if (/^#[\da-fA-F]{6}$/.test(withHash)) {
      return withHash.toUpperCase();
    }

    return null;
  }

  function mixRgb(source, target, amount) {
    const mixChannel = (from, to) => Math.round(from + (to - from) * amount);
    return {
      r: mixChannel(source.r, target.r),
      g: mixChannel(source.g, target.g),
      b: mixChannel(source.b, target.b),
    };
  }

  function generateColorScale(
    baseColorValue,
    count = cfg.colorBoxCount,
    centerIndex = cfg.centerBoxIndex,
  ) {
    const normalizedHex = normalizeHexInput(baseColorValue);
    if (!normalizedHex) return null;

    const baseRgb = hexToRgb(normalizedHex);
    const black = { r: 0, g: 0, b: 0 };
    const white = { r: 255, g: 255, b: 255 };
    const colors = [];

    for (let i = 0; i < count; i++) {
      if (i === centerIndex) {
        colors.push(normalizedHex);
        continue;
      }

      const distance = Math.abs(i - centerIndex);
      const blendAmount = (distance / centerIndex) * cfg.maxBlend;
      const target = i < centerIndex ? black : white;
      const mixed = mixRgb(baseRgb, target, blendAmount);
      colors.push(rgbToHex(mixed));
    }

    return colors;
  }

  function paintColorBoxes(colorBoxes, colors) {
    if (!colors || colors.length !== colorBoxes.length) return;

    colorBoxes.forEach((colorBox, index) => {
      colorBox.style.backgroundColor = colors[index];
      colorBox.title = colors[index];
    });
  }

  window.ColorScaleGenerator = window.ColorScaleGenerator || {};
  window.ColorScaleGenerator.ColorUtils = {
    hexToRgb,
    rgbToHex,
    rgbToHsl,
    normalizeHexInput,
    generateColorScale,
    paintColorBoxes,
  };
})();

