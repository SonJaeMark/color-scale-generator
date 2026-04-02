(() => {
  const MAIN_ID = 'main';
  const COLOR_BOX_COUNT = 11;
  const CENTER_BOX_INDEX = 5;
  const COLOR_BOX_MIN_HEIGHT = 12;
  const SCALE_STEPS = [950, 900, 800, 700, 600, 500, 400, 300, 200, 100, 50];
  let buttonCount = 0;

  const inputStyles = 'border-2 border-transparent shadow-[inset_3px_3px_10px_rgba(0,0,0,0.2)] focus:outline-none focus:shadow focus:shadow-[inset_3px_3px_15px_rgba(0,0,0,0.2)] focus:ring-inset rounded-3xl p-2 max-w-40 min-w-25 xl:w-1/5';
  const actionButtonStyles = 'rounded-2xl px-3 py-1 text-sm bg-white shadow hover:shadow-md active:scale-95 transition cursor-pointer';

  function createInput({ type, placeholder }) {
    const input = document.createElement('input');
    input.type = type;
    input.placeholder = placeholder;
    input.className = inputStyles;
    return input;
  }

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

    const saturation =
      delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));

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

  function generateColorScale(baseColorValue, count = COLOR_BOX_COUNT, centerIndex = CENTER_BOX_INDEX) {
    const normalizedHex = normalizeHexInput(baseColorValue);
    if (!normalizedHex) {
      return null;
    }

    const baseRgb = hexToRgb(normalizedHex);
    const black = { r: 0, g: 0, b: 0 };
    const white = { r: 255, g: 255, b: 255 };
    const maxBlend = 0.75;
    const colors = [];

    for (let i = 0; i < count; i++) {
      if (i === centerIndex) {
        colors.push(normalizedHex);
        continue;
      }

      const distance = Math.abs(i - centerIndex);
      const blendAmount = (distance / centerIndex) * maxBlend;
      const target = i < centerIndex ? black : white;
      const mixed = mixRgb(baseRgb, target, blendAmount);
      colors.push(rgbToHex(mixed));
    }

    return colors;
  }

  function paintColorBoxes(colorBoxes, colors) {
    if (!colors || colors.length !== colorBoxes.length) {
      return;
    }

    colorBoxes.forEach((colorBox, index) => {
      colorBox.style.backgroundColor = colors[index];
      colorBox.title = colors[index];
    });
  }

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
      const scale = SCALE_STEPS[index];
      const formattedColor = getColorAsFormat(hexColor, format);
      return `--color-${name}-${scale}: ${formattedColor};`;
    });
  }

  function createCodeModal() {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black/45 hidden items-center justify-center p-4 z-50';

    const panel = document.createElement('div');
    panel.className = 'bg-white w-full max-w-3xl rounded-xl p-4 shadow-xl';

    const topBar = document.createElement('div');
    topBar.className = 'flex items-center justify-between gap-3 mb-3';

    const title = document.createElement('h2');
    title.className = 'text-lg font-semibold';
    title.textContent = 'Generated Color Code';

    const colorCodeSelect = document.createElement('select');
    colorCodeSelect.className = 'border rounded-lg px-2 py-1';
    colorCodeSelect.innerHTML = `
      <option value="hex">HEX</option>
      <option value="rgb">RGB</option>
      <option value="hsl">HSL</option>
    `;

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = actionButtonStyles;
    closeButton.textContent = 'Close';

    const codeBlock = document.createElement('pre');
    codeBlock.className = 'bg-slate-900 text-slate-50 rounded-lg p-3 overflow-auto max-h-[60vh]';

    const codeText = document.createElement('code');
    codeBlock.appendChild(codeText);

    topBar.appendChild(title);
    topBar.appendChild(colorCodeSelect);
    topBar.appendChild(closeButton);
    panel.appendChild(topBar);
    panel.appendChild(codeBlock);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    function hide() {
      overlay.classList.add('hidden');
      overlay.classList.remove('flex');
    }

    function show() {
      overlay.classList.remove('hidden');
      overlay.classList.add('flex');
    }

    closeButton.addEventListener('click', hide);
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) hide();
    });

    return { show, hide, colorCodeSelect, codeText };
  }

  function createColorBox({ isCenter }) {
    const box = document.createElement('div');

    const baseClasses = `shadow-lg xl:h-16 min-h-${COLOR_BOX_MIN_HEIGHT} rounded-lg bg-white flex-grow xl:flex-none xl:w-[8%]`;
    const centerClasses = `shadow-lg w-full min-h-${COLOR_BOX_MIN_HEIGHT} sm:w-auto xl:h-16 rounded-lg bg-white flex-grow xl:flex-none xl:w-[8%]`;

    box.className = isCenter ? centerClasses : baseClasses;
    return box;
  }

  function createInputContainer() {
    const hexBaseInput = createInput({ type: 'text', placeholder: '#000000' });
    const nameInput = createInput({ type: 'text', placeholder: 'primary' });
    const container = document.createElement('div');
    container.className = 'flex gap-2 w-full';
    container.appendChild(hexBaseInput);
    container.appendChild(nameInput);
    return { container, hexBaseInput, nameInput };
  }

  function createSwatch({ onAddSwatch, onRemoveSwatch, onSwatchActive }) {
    const swatch = document.createElement('div');
    swatch.className =
      'relative bg-mist-50 w-full min-h-24 p-4 rounded-xl hover:shadow-xl/20 hover:-translate-y-2 hover:scale-100 transition ease-in-out shadow-lg flex gap-2 md:flex-wrap flex-wrap';

    const { container, hexBaseInput, nameInput } = createInputContainer();
    swatch.appendChild(container);

    const addColorButton = document.createElement('button');
    addColorButton.type = 'button';
    addColorButton.textContent = '+';
    // Animate via opacity/transform (visibility doesn't transition nicely).
    addColorButton.className =
      'absolute -bottom-7 left-4 bg-white rounded-3xl w-15 h-10 shadow-lg active:scale-95 active:shadow-inner cursor-pointer ' +
      'transition-[opacity,transform] duration-300 ease-out delay-100    ' +
      'opacity-0 translate-y-2 scale-95 pointer-events-none';

    const removeSwatchButton = document.createElement('button');
    removeSwatchButton.type = 'button';
    removeSwatchButton.textContent = '-';
    removeSwatchButton.className =
      'absolute -bottom-7 left-20 bg-white rounded-3xl w-15 h-10 shadow-lg active:scale-95 active:shadow-inner cursor-pointer ' +
      'transition-[opacity,transform] duration-300 ease-out delay-100 ' +
      'opacity-0 translate-y-2 scale-95 pointer-events-none';

    let hideTimerId = null;

    function showFloatingButtons() {
      if (hideTimerId) {
        window.clearTimeout(hideTimerId);
        hideTimerId = null;
      }

      [addColorButton, removeSwatchButton].forEach((button) => {
        button.classList.remove('opacity-0', 'translate-y-2', 'scale-95', 'pointer-events-none');
        button.classList.add('opacity-100', 'translate-y-0', 'scale-100', 'pointer-events-auto');
      });
    }

    function hideFloatingButtons() {
      [addColorButton, removeSwatchButton].forEach((button) => {
        button.classList.remove('opacity-100', 'translate-y-0', 'scale-100', 'pointer-events-auto');
        button.classList.add('opacity-0', 'translate-y-2', 'scale-95');
      });

      hideTimerId = window.setTimeout(() => {
        [addColorButton, removeSwatchButton].forEach((button) => {
          button.classList.add('pointer-events-none');
        });
        hideTimerId = null;
      }, 200);
    }

    swatch.addEventListener('mouseenter', () => {
        showFloatingButtons();
    });

    swatch.addEventListener('mouseleave', () => {
        hideFloatingButtons();
    });

    let currentScale = null;

    function getCurrentCodeLines(format) {
      if (!currentScale) {
        currentScale = generateColorScale(hexBaseInput.value);
      }
      if (!currentScale) return [];
      const colorName = sanitizeName(nameInput.value);
      return generateCodeLines({
        name: colorName,
        colors: currentScale,
        format,
      });
    }

    addColorButton.addEventListener('click', () => {
      buttonCount++;
      console.log(`add color button clicked ${buttonCount} times`);
      onAddSwatch();
    });

    removeSwatchButton.addEventListener('click', () => {
      onRemoveSwatch(swatch);
    });
    swatch.addEventListener('click', () => {
      onSwatchActive(api);
    });

    swatch.appendChild(addColorButton);
    swatch.appendChild(removeSwatchButton);

    const colorBoxes = [];
    for (let i = 0; i < COLOR_BOX_COUNT; i++) {
      const colorBox = createColorBox({ isCenter: i === CENTER_BOX_INDEX });
      colorBoxes.push(colorBox);
      swatch.appendChild(colorBox);
    }

    hexBaseInput.addEventListener('input', () => {
      const colorScale = generateColorScale(hexBaseInput.value);
      currentScale = colorScale;
      paintColorBoxes(colorBoxes, colorScale);
    });

    nameInput.addEventListener('input', () => {
      const name = nameInput.value;
      console.log(name);
    });

    const api = {
      swatch,
      getCodeLines: (format) => getCurrentCodeLines(format),
    };
    return api;
  }

  function init() {
    const main = document.getElementById(MAIN_ID);
    const title = document.createElement('h1');
    const logo = document.createElement('img');
    const header = document.createElement('div');
    header.className = 'flex self-start gap-2';
    header.appendChild(logo);
    header.appendChild(title);
    logo.src = 'color-scale-generator-logo.png';
    logo.alt = 'Color Scale Generator Logo';
    logo.className = 'w-10 h-10';
    title.className = 'text-2xl font-bold self-center';
    title.appendChild(document.createTextNode(' Color Scale Generator'));

    const topBar = document.createElement('div');
    topBar.className = 'w-full flex items-center justify-between gap-4 flex-wrap';
    const aboutLink = document.createElement('a');
    aboutLink.href = 'about.html';
    aboutLink.textContent = 'About';
    aboutLink.className = `${actionButtonStyles} no-underline text-neutral-800`;
    topBar.appendChild(header);
    topBar.appendChild(aboutLink);
    main.appendChild(topBar);

    main.className = 'flex flex-col items-center min-h-screen bg-white p-8 gap-4';
    const modal = createCodeModal();
    const swatchesContainer = document.createElement('div');
    swatchesContainer.className = 'w-full flex flex-col gap-4';
    const globalActions = document.createElement('div');
    globalActions.className = 'w-full flex gap-2 justify-end';

    const showCodeButton = document.createElement('button');
    showCodeButton.type = 'button';
    showCodeButton.textContent = 'Show Code';
    showCodeButton.className = actionButtonStyles;

    const copyCodeButton = document.createElement('button');
    copyCodeButton.type = 'button';
    copyCodeButton.textContent = 'Copy Code';
    copyCodeButton.className = actionButtonStyles;

    globalActions.appendChild(showCodeButton);
    globalActions.appendChild(copyCodeButton);
    main.appendChild(swatchesContainer);
    main.appendChild(globalActions);

    const swatchApis = [];

    function getAllSwatchesCode() {
      const allLines = [];
      swatchApis.forEach((swatchApi) => {
        const swatchLines = swatchApi.getCodeLines(modal.colorCodeSelect.value);
        if (swatchLines.length === 0) return;
        if (allLines.length > 0) {
          allLines.push('');
        }
        allLines.push(...swatchLines);
      });
      return allLines.join('\n');
    }

    function appendNewSwatch() {
      const swatchApi = createSwatch({
        onAddSwatch: appendNewSwatch,
        onRemoveSwatch: (targetSwatch) => {
          const swatchIndex = swatchApis.findIndex((api) => api.swatch === targetSwatch);
          if (swatchIndex >= 0) {
            swatchApis.splice(swatchIndex, 1);
          }
          targetSwatch.remove();
        },
        onSwatchActive: () => {},
      });
      swatchApis.push(swatchApi);
      swatchesContainer.appendChild(swatchApi.swatch);
    }

    showCodeButton.addEventListener('click', () => {
      modal.codeText.textContent = getAllSwatchesCode();
      modal.show();
    });

    copyCodeButton.addEventListener('click', async () => {
      const code = getAllSwatchesCode();
      if (!code) return;
      try {
        await navigator.clipboard.writeText(code);
        copyCodeButton.textContent = 'Copied!';
        window.setTimeout(() => {
          copyCodeButton.textContent = 'Copy Code';
        }, 1000);
      } catch (error) {
        console.error('Failed to copy code.', error);
      }
    });

    modal.colorCodeSelect.addEventListener('change', () => {
      if (!modal.codeText.textContent) return;
      modal.codeText.textContent = getAllSwatchesCode();
    });

    appendNewSwatch();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();