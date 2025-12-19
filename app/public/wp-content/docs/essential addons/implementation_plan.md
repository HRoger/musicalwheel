# Implementation Plan - FSE Flex Container Block

## Goal Description
Create a **Flex Container** Gutenberg block that is a 1:1 clone of the "Essential Blocks" Flex Container in terms of **Inspector UI** and **functionality**, but built from scratch using Voxel FSE's existing component library. This ensures full control, "headless" compatibility via `vxconfig`, and maintenance independence.

## User Review Required
> [!IMPORTANT]
> **No "Porting" involved**: This is a pure rebuild. We are not using any code from the original plugin.
> **UI Clone**: We will use `voxel-fse` components (`ResponsiveRangeControlWithDropdown`, `DimensionsControl`, etc.) to visually replicate the Essential Blocks Inspector tabs (General/Style/Advanced).

## Proposed Changes

### 1. New Block Directory
Create `themes/voxel-fse/app/blocks/src/flex-container/`

#### [NEW] [block.json](file:///c:/Users/herle/Local%20Sites/musicalwheel/app/public/wp-content/themes/voxel-fse/app/blocks/src/flex-container/block.json)
- Define attributes: `containerWidth`, `contentWidth`, `minHeight`, `htmlTag`, `overflow`, `flexDirection`, `justifyContent`, `alignItems`, `flexWrap`, `alignContent`, `padding`, `margin`, `backgroundColor`, `backgroundImage`, `border`, `borderRadius`, `boxShadow`, `zIndex`, `customCSS`.
- Register as `voxel-fse/flex-container`.

#### [NEW] [edit.tsx](file:///c:/Users/herle/Local%20Sites/musicalwheel/app/public/wp-content/themes/voxel-fse/app/blocks/src/flex-container/edit.tsx)
- **Tabs Implementation**: Use a State-based Tab system (General | Style | Advanced).
- **General Tab**:
    - **Container**: `SelectControl` (Full/Boxed) + `ResponsiveRangeControlWithDropdown` (Width).
    - **Content Width**: `SelectControl` + `RangeControl`.
    - **Min Height**: `ResponsiveRangeControlWithDropdown`.
    - **HTML Tag**: `SelectControl`.
    - **Overflow**: `SelectControl`.
    - **Layouts**: Flex controls (Direction, Justify, Align, Wrap) using `SelectControl` or `ButtonGroup`.
- **Style Tab**:
    - **Background**: `PanelColorSettings` + Image controls.
    - **Border**: `SelectControl` (Type) + `ResponsiveRangeControlWithDropdown` (Width, Radius).
    - **Shadow**: Reuse `BoxShadowPopup`.
    - **Typography**: Reuse `TypographyPopup`.
- **Advanced Tab**:
    - **Layout**: Margin/Padding using `DimensionsControl`.
    - **Z-Index**: `RangeControl`.
    - **Custom CSS**: `TextareaControl`.

#### [NEW] [save.tsx](file:///c:/Users/herle/Local%20Sites/musicalwheel/app/public/wp-content/themes/voxel-fse/app/blocks/src/flex-container/save.tsx)
- Output `<script type="application/json" class="vxconfig">` containing all block attributes.
- Render inner blocks via `<InnerBlocks.Content />`.

#### [NEW] [index.tsx](file:///c:/Users/herle/Local%20Sites/musicalwheel/app/public/wp-content/themes/voxel-fse/app/blocks/src/flex-container/index.tsx)
- Register the block.

### 2. Component Reuse
Import reusable components from `../shared/controls/`:
- `ResponsiveRangeControlWithDropdown`
- `DimensionsControl`
- `TypographyControl` (Note: `popup-kit` uses `TypographyPopup`, checking if `TypographyControl` is the shared equivalent)
- `BoxShadowControl`
- `ColorControl` or `ResponsiveColorControl` (verify exact name in shared)

## Verification Plan

### Manual Verification
1.  **Block Appearance**:
    - Open WordPress Editor.
    - Add "FSE Flex Container" block.
    - Verify Inspector Controls match the "Essential Blocks" screenshot layout (three tabs, specific controls).
2.  **Attribute Saving**:
    - Change values (Width, Background Color, Padding).
    - Save post.
    - Reload editor to ensure values persist.
3.  **Frontend/Headless Output**:
    - View the frontend page source.
    - Confirm the `vxconfig` script tag exists and contains the correct JSON data.
