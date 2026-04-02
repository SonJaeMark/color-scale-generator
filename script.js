(() => {
  const CONFIG = window.ColorScaleGeneratorConfig;

  const MAIN_ID = CONFIG.mainId;
  const COLOR_BOX_COUNT = CONFIG.colorBoxCount;
  const CENTER_BOX_INDEX = CONFIG.centerBoxIndex;
  const COLOR_BOX_MIN_HEIGHT = CONFIG.colorBoxMinHeight;

  const inputStyles = 'border-2 border-transparent shadow-[inset_3px_3px_10px_rgba(0,0,0,0.2)] focus:outline-none focus:shadow focus:shadow-[inset_3px_3px_15px_rgba(0,0,0,0.2)] focus:ring-inset rounded-3xl p-2 max-w-40 min-w-25 xl:w-1/5';
  const actionButtonStyles = 'rounded-2xl px-3 py-1 text-sm bg-white shadow hover:shadow-md active:scale-95 transition cursor-pointer';

  function createInput({ type, placeholder }) {
    const input = document.createElement('input');
    input.type = type;
    input.placeholder = placeholder;
    input.className = inputStyles;
    return input;
  }

  // Imported pure logic from other files (loaded via separate <script> tags).
  const ColorUtils = window.ColorScaleGenerator.ColorUtils;
  const CodeUtils = window.ColorScaleGenerator.CodeUtils;

  const { generateColorScale, paintColorBoxes } = ColorUtils;
  const { sanitizeName, generateCodeLines } = CodeUtils;

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

    let scaleCache = null;

    function getCurrentCodeLines(format) {
      if (!scaleCache) {
        scaleCache = generateColorScale(hexBaseInput.value);
      }
      if (!scaleCache) return [];
      const colorName = sanitizeName(nameInput.value);
      return generateCodeLines({
        name: colorName,
        colors: scaleCache,
        format,
      });
    }

    addColorButton.addEventListener('click', () => {
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
      scaleCache = colorScale;
      paintColorBoxes(colorBoxes, colorScale);
    });

    // `nameInput` is read on export/code generation, so no work is needed on every keystroke.

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