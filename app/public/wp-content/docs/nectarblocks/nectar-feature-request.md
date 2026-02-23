# Nectar Blocks Feature Request: Modernizing the Flex Box Container

**Subject:** Feature Request: Upgrading "Flex Box" to a Modern Grid/Container Standard (Elementor/Stackable Parity)

Dear Nectar Blocks Development Team,

I am writing to you as a dedicated user of Nectar Blocks who values the plugin for its performance, design quality, and clean HTML output—standard advantages that have kept me using Nectar over deeper ecosystems like Elementor.

However, as the WordPress block editor evolves, the standard for layout controls has shifted significantly. Currently, the Nectar **Flex Box** block operates on a classic "Row/Column" (Flexbox-only) paradigm, which feels increasingly restrictive compared to modern "Container" standards set by Elementor's Flex Container, and Essential Blocks.

I would like to formally request an upgrade to the **Flex Box** block to bridge this gap. Specifically, I believe Nectar Blocks is uniquely positioned to offer these advanced controls *without* the DOM bloat associated with other builders, making it the ultimate choice for performance-focused and Headless WordPress projects.

### 1. Functional Gap: Flexbox vs. True CSS Grid
**The Current State:** To create a grid in Nectar, users must rely on flex wrapping and percentage widths (e.g., 3 columns = 33% width each). This is the "Bootstrap-style" approach of the past decade.
**The Modern Standard:** Competitors like Elementor and Stackable now offer a dedicated **Grid Mode** (display: grid).
**The Request:** Please add a toggle to the Flex Box inspector to switch between `display: flex` and `display: grid`, exposing native Grid controls:
*   `grid-template-columns` (with support for `fr`, `minmax`, and `auto-fit`)
*   `gap` (Column/Row gaps)
*   `justify-items` / `align-items`
*   `grid-auto-flow`

### 2. Sizing Constraints: Support for `calc()` and Arbitrary Values
**The Current State:** The "Minimum Height" control is limited to presets (e.g., "Full Height", "75% Viewport") or simple pixel values.
**The Modern Standard:** Modern layouts (especially in headless or complex themes) require precise calculations, such as `min-height: calc(100vh - 80px)` for sticky footers or hero sections that respect header height.
**The Request:** Please allow the "Custom" input field for Width and Height controls to accept raw CSS strings (like `calc()`, `clamp()`, `min()`, `max()`) rather than scrubbing them or limiting functionality to numeric integers.

### 3. Why Nectar? (The Headless Advantage)
You might ask, "Why not just use Elementor or Stackable?"
The answer is **Code Quality**.
*   **Elementor/Essential Blocks:** While their *controls* are superior, their *output* is often bloated "div soup" with heavy nested wrappers, which is detrimental to performance and headless implementations.
*   **Nectar Blocks:** Your `nectar-blocks-flex-box__content-wrap` structure is clean and efficient.

If Nectar Blocks could combine its signature **Clean HTML Output** with **Modern Grid/Calc Controls**, it would arguably become the #1 block suite for professional developers and Headless WordPress architectures. Currently, we are forced to choose between "clean code" (Nectar) and "modern layout control" (Stackable/Elementor). We want to choose Nectar for both.

Thank you for your time and for the excellent work you've done so far. I hope to see these features in a future release.

Best regards,

[Your Name]
[Your Project/Company]
