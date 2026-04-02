(() => {
  const cfg = window.ColorScaleGeneratorConfig;
  const ColorUtils = window.ColorScaleGenerator?.ColorUtils;
  if (!cfg) throw new Error('Missing window.ColorScaleGeneratorConfig. Load config.js first.');
  if (!ColorUtils) throw new Error('Missing ColorUtils. Load color-utils.js first.');

  const { hexToRgb, rgbToHsl } = ColorUtils;

  function getColorAsFormat(hexColor, format) {
    const rgb = hexToRgb(hexColor);

    if (format === 'rgb') {
      return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    }

    if (format === 'hsl') {
      const hsl = rgbToHsl(rgb);
      return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    }

    return hexColor;
  }

  function sanitizeName(nameValue) {
    const cleaned = nameValue
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    return cleaned || 'color';
  }

  function generateCodeLines({ name, colors, format }) {
    return colors.map((hexColor, index) => {
      const scale = cfg.scaleSteps[index];
      const formattedColor = getColorAsFormat(hexColor, format);
      return `--color-${name}-${scale}: ${formattedColor};`;
    });
  }

  window.ColorScaleGenerator = window.ColorScaleGenerator || {};
  window.ColorScaleGenerator.CodeUtils = {
    sanitizeName,
    generateCodeLines,
  };
})();

