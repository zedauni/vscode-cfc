# CFC: Color Formats Converter

[![Version](https://img.shields.io/visual-studio-marketplace/v/zedauni.vscode-cfc)](https://marketplace.visualstudio.com/items?itemName=zedauni.vscode-cfc)
[![VSCode Marketplace Rating](https://img.shields.io/visual-studio-marketplace/stars/zedauni.vscode-cfc)](https://marketplace.visualstudio.com/items?itemName=zedauni.vscode-cfc)
[![Issues](https://img.shields.io/github/issues/zedauni/vscode-cfc.svg)](https://github.com/zedauni/vscode-cfc/issues)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/zedauni/vscode-cfc/blob/main/LICENSE.txt)

**CFC: Color Formats Converter** is an easy-to-use VS Code extension that lets you quickly and easily convert colors between different formats. It supports modern color spaces like **OKLCH** and **OKLAB**, as well as traditional formats like **HEX**, **RGB**, **HSL**, and **HWB**. Whether you're a web developer, designer, or digital artist, this tool will make your workflow easier and ensure accurate color transformations.

It also has many other features to help you work faster and more efficiently, like history, favorites, on-the-fly color conversion, context menu integration, keyboard shortcuts and color previews for OKLCH, OKLAB, LCH, and LAB (which is not natively supported by VS Code).

---

## 🚀 Features

- **Convert between formats**: Easily switch between OKLCH, OKLAB, HEX, RGB, HSL, HWB, and more.
- **Modern color spaces**: Support for advanced color spaces like OKLCH and OKLAB.
- **On-the-fly hover color conversion**: Hover over any color in supported files (CSS, LESS, SCSS, etc.) to see corresponding popular formats.
- **OKLCH, OKLAB, LCH and LAB colors preview**: Display a color preview square before the color code for modern formats like OKLCH, OKLAB, LCH, and LAB.
- **Context menu integration**: Convert colors directly from the editor's context menu.
- **Keyboard shortcuts**: Quickly convert colors with a customizable keyboard shortcut, `Ctrl+Alt+0` (Windows/Linux) or `Cmd+Alt+0` (macOS).
- **Customizable precision**: Set the number of decimal places for color values.
- **History of converted colors**: Keep track of latest converted colors in a dedicated history view (limited to the last 100 conversions by default, customizable).
- **Favorites**: Save your favorite colors for quick access (will be improved in next version).
- **Multi-language support**: Available in English, French and more languages coming soon.

---

## 📦 Installation

1. Open **Visual Studio Code**.
2. Go to the **Extensions** view (`Ctrl+Shift+X` or `Cmd+Shift+X` on macOS).
3. Search for **"CFC: Color Formats Converter"**.
4. Click **Install** to add the extension to your editor.

---

## 🧑‍💻 Usage

### ⚡️ Convert a Color
1. **With a selection**:
   - Select a color code or a block of code containing one or more colors in your file (e.g., `#FF5733`, `rgb(255, 87, 51)`, `oklch(65 18 35.5)`).
   - Right-click on the selection and use the **CFC: Convert Color** option in contextual menu.
      - Or simply use the keyboard shortcut `Ctrl+Alt+0` (Windows/Linux) or `Cmd+Alt+0` (macOS).
      - Or open the **Command Palette** (`Ctrl+Shift+P` or `Cmd+Shift+P` on macOS), search for **"CFC: Convert Color"** and execute the command.
   - The selected color(s) will be converted to the default format defined in the settings (default: OKLCH, customizable in settings).

2. **Without a selection**:
   - Right-click in the editor and use the **CFC: Convert Color** option in contextual menu.
      - Or simply use the keyboard shortcut `Ctrl+Alt+0` (Windows/Linux) or `Cmd+Alt+0` (macOS).
      - Or open the **Command Palette** (`Ctrl+Shift+P` or `Cmd+Shift+P` on macOS), search for **"CFC: Convert Color"** and execute the command.
   - A prompt will appear, allowing you to enter a color in any format.
   - The extension will display all popular formats for the entered color, and you can choose the desired format.
   - The chosen format will be copied to your clipboard.

3. **Via keyboard shortcut**:
   - Use the default shortcut `Ctrl+Alt+0` (Windows/Linux) or `Cmd+Alt+0` (macOS) to quickly convert a selected color or open the color input prompt if there's no selection.

4. **On-the-fly hover color conversion**:
   - When working in supported files (CSS, LESS, SCSS, JavaScript, TypeScript, HTML, etc.), hover over any color to see a tooltip displaying popular format conversions.

### 📝 History and Favorites

- **History**:
  - All converted colors are saved in the **History** view, accessible via the sidebar.
  - By default, the history retains the last 100 conversions, but this limit can be customized in the settings.

- **Favorites**:
  - Save your favorite colors for quick access in the **Favorites** view.
  - Use the **Add to Favorites** command to save a color. _**(Will be added in next version)**_

- **Sidebar**:
  - The sidebar provides quick access to both the **History** and **Favorites** views.
  - You can manage, clear or refresh the history and favorites directly from the sidebar.

---

## 🛠️ Customize Settings

- Open Settings (`Ctrl+,` or `Cmd+,` on macOS).

- Search for "CFC: Color Formats Converter" to customize:

   - **Default format**: Set the default output format (e.g., OKLCH, HEX, RGB...).

   - **Precision**: Adjust the number of decimal places for color values.

   - **Force Alpha**: Always include transparency in color conversions.

   - **Show Modern Color Preview**: Display a color square for modern formats.

- You can also customize the shortcut for the color conversion command.
   - Open keyboard shortcuts (`Ctrl+K Ctrl+S`, or `Cmd+K Cmd+S` on macOS).
   - Search for "**CFC: Convert Color**" and set the desired shortcut.

---

## ✨ Supported Formats

This extension supports all popular color formats, including those not listed here. But it can convert colors to the following formats (**default**: OKLCH, customizable in settings):

### HEX
- 3-digit: `#FFF`
- 4-digit (with alpha): `#FFFF`
- 6-digit: `#FFFFFF`
- 8-digit (with alpha): `#FFFFFFFF`

### RGB
- `rgb(R, G, B)` (e.g., `rgb(238, 238, 238)`, `rgb(93.33% 93.33% 93.33%)`)
- `rgba(R, G, B, A)` (e.g., `rgba(238, 238, 238, 0.349)`, `rgba(93.33%, 93.33%, 93.33%, 0.349)`)

### HSL
- `hsl(H, S%, L%)` (e.g., `hsl(0, 0%, 93%)`, `hsl(none, 0%, 92.94%)`)
- `hsla(H, S%, L%, A)` (e.g., `hsla(0, 0%, 93%, 0.349)`, `hsla(none, 0%, 92.94%, 0.349)`)

### HWB
- `hwb(H, W%, B%)` (e.g., `hwb(0 93% 7%)`)

### LAB
- `lab(L, A, B)` (e.g., `lab(93.75 0 0)`, `lab(93.75 0 0 / 0.349)`)

### LCH
- `lch(L, C, H)` (e.g., `lch(93.75 0 none)`, `lch(93.75 0 none / 0.349)`)

### OKLAB
- `oklab(L, A, B)` (e.g., `oklab(94.61% 0 0)`, `oklab(94.61% 0 0 / 0.349)`)

### OKLCH
- `oklch(L, C, H)` (e.g., `oklch(94.61% 0 none)`, `oklch(94.61% 0 none / 0.349)`)

### SUPPORTED FORMATS BY OTHER FEATURES

- **On-the-fly hover color conversion** feature support this formats and [CSS basic named colors](https://www.w3.org/wiki/CSS/Properties/color/keywords#Basic_Colors) + transparent + orange (aqua, black, blue, fuchsia, gray, green, lime, maroon, navy, olive, orange, purple, red, silver, teal, transparent, white, yellow). Support for extended named colors (e.g., aliceblue, lightgreen, etc.) will be added in next versions. [Refer to the REGEX](https://github.com/zedauni/vscode-cfc/blob/main/src/constants.ts#L93).

- **CFC Convert color command** support this formats and all other valid formats.

- **OKLCH, OKLAB, LCH and LAB colors previews** are available only for OKLCH, OKLAB, LCH and LAB formats since this feature is not natively provided by VS Code for all other popular formats. [Refer to the REGEX](https://github.com/zedauni/vscode-cfc/blob/main/src/utils.ts#L363).

---

## 🔧 Contributing

We welcome contributions! If you'd like to improve **CFC: Color Formats Converter**, please follow these steps:

1. Fork the repository.
   ```sh
   git clone https://github.com/zedauni/vscode-cfc.git
   cd vscode-cfc
   ```
2. Create a new branch for your feature or bugfix.
3. Submit a pull request with a detailed description of your changes.

---

## 📜 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE.txt) file for details.

---

## 🤝 Support

If you encounter any issues or have suggestions for new features, please [open an issue](https://github.com/zedauni/vscode-cfc/issues) on GitHub or leave a review on the [VS Code Marketplace Q & A](https://marketplace.visualstudio.com/items?itemName=zedauni.vscode-cfc&ssr=false#qna).

---

## 👨‍🔧 Credits

- Developed by **[Aurèle ZANNOU TCHOKO](https://github.com/zedauni)**.
- Inspired by the need of modern color spaces support in VS Code.
- All color conversions are based on the [color.js](https://github.com/color-js/color.js) library.

---

🫶 Enjoy using **CFC: Color Formats Converter**! If you find it helpful, consider giving it a ⭐ on [GitHub](https://github.com/zedauni/vscode-cfc) or leaving a review on the [VS Code Marketplace Rating and Review](https://marketplace.visualstudio.com/items?itemName=zedauni.vscode-cfc&ssr=false#review-details).