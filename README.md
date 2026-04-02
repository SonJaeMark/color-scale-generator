# Color Scale Generator

## What it does
Color Scale Generator turns a single base hex color (for example `#3498DB`) into a full 11-step palette and exports it as CSS custom properties you can paste into your stylesheet or design tokens.

## Features
- Generate an 11-step color scale from a base hex input.
- Uses a dark-to-light mapping (`950` darkest, `50` lightest).
- Create multiple swatches.
- Remove any swatch with the `-` button.
- Preview generated code in a modal (`Show Code`).
- Copy generated code to clipboard (`Copy Code`).
- Choose an output format in the modal:
  - `HEX`
  - `RGB`
  - `HSL`
- Variable naming format:
  - `--color-[nameInput]-[scale]: [color];`

## How to use
1. Open `index.html` in your browser.
2. Enter a base hex color in `Hex Base Input` (`#abc`, `abc`, `#aabbcc`, `aabbcc`).
3. Enter a name in `Name Input` (used in the CSS variable names).
4. Click `+` to add another swatch, or `-` to remove one.
5. Click `Show Code` to preview all generated variables from all swatches.
6. Click `Copy Code` to copy the generated CSS.

## Output example
```css
--color-brand-950: #1A1A1A;
--color-brand-900: #262626;
--color-brand-800: #333333;
--color-brand-700: #404040;
--color-brand-600: #4D4D4D;
--color-brand-500: #5A5A5A;
--color-brand-400: #808080;
--color-brand-300: #A6A6A6;
--color-brand-200: #CCCCCC;
--color-brand-100: #E6E6E6;
--color-brand-50: #F2F2F2;
```

## Project structure
- `index.html` - main page and script entry
- `script.js` - app logic, UI generation, color scale generation, code export
- `about.html` - author info and contact

## Notes
- Only hex input is used for scale generation.
- If the input is not a valid 3- or 6-digit hex, the swatch will not update.

## Suggested improvements
- Add unit tests for the pure functions (`normalizeHexInput`, `generateColorScale`, `sanitizeName`, `generateCodeLines`).
- Improve accessibility: add `label` elements (or `aria-label`) for inputs, and ensure keyboard focus styles are clear.
- Replace dynamically constructed Tailwind class strings (for example `min-h-${...}`) with static classes or inline styles so styling is guaranteed.
- Add inline validation/error UI for invalid hex input instead of silently not updating.
- Let users customize the scale steps / blend behavior (or at least expose them in one config object).
- Support exporting additional formats (e.g. JSON tokens) or downloading a `.css` file.
