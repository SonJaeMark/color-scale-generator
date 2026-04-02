(() => {
  // Shared configuration used across all JS files.
  window.ColorScaleGeneratorConfig = {
    mainId: 'main',
    colorBoxCount: 11,
    centerBoxIndex: 5,
    // Tailwind class uses this numeric value (e.g. `min-h-12`).
    colorBoxMinHeight: 12,
    scaleSteps: [950, 900, 800, 700, 600, 500, 400, 300, 200, 100, 50],
    maxBlend: 0.75,
  };
})();

