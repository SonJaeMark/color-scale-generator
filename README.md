# Color Scale Generator

A lightweight browser app for generating multi-step color scales from a base hex color and exporting CSS custom properties.

## Features

- Generate an 11-step color scale from a base hex input.
- Scale mapping uses:
  - `950` as the darkest
  - `50` as the lightest
- Create multiple swatches.
- Remove any swatch with the `-` button.
- Preview generated code in a modal (`Show Code`).
- Copy generated code to clipboard (`Copy Code`).
- Export format selection in modal:
  - `HEX`
  - `RGB`
  - `HSL`
- Variable naming format:
  - `--color-[nameInput]-[scale]: [color];`

## Project Structure

- `index.html` - main page and script entry
- `script.js` - app logic, UI generation, color scale generation, code export

## How It Works

1. Enter a base hex color in `Hex Base Input` (`#abc`, `abc`, `#aabbcc`, `aabbcc`).
2. The app generates and paints 11 color boxes for that swatch.
3. Enter a name in `Name Input` (used in CSS variable naming).
4. Use `+` to add another swatch and `-` to remove one.
5. Click `Show Code` to preview all generated variables from all swatches.
6. Click `Copy Code` to copy all generated variables.

## Output Example

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

## Run Locally

No build step required.

1. Open `index.html` in your browser.
2. Start generating swatches and export your color variables.

## Notes

- Only hex input is used for scale generation.
- If the input is not a valid 3- or 6-digit hex, the swatch will not update.
