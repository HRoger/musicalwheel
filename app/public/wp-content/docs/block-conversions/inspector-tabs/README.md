# Inspector Tab Conversions

This directory contains control inventory mappings and conversion documentation for Elementor inspector tabs converted to Gutenberg InspectorControls.

## Structure

```
inspector-tabs/
├── README.md                    # This file
├── advanced/                    # Standard AdvancedTab sections
│   ├── layout.md               # Layout accordion controls
│   ├── responsive.md           # Responsive accordion controls
│   └── custom-css.md           # Custom CSS accordion controls
├── search-form/                 # Search Form widget tabs
│   ├── content/                # Content tab accordions
│   │   ├── post-types.md
│   │   ├── post-filters.md
│   │   └── ...
│   ├── general/                # General tab accordions
│   └── style/                  # Style tab accordions
└── {widget-name}/              # Other widget tabs
```

## Usage

Use the `/convert:inspector-tab` skill to generate these mappings:

```bash
# Generate mapping for specific accordion
/convert:inspector-tab search-form --tab=Content --accordion="Post types"

# The output will be saved here as:
# inspector-tabs/search-form/content/post-types.md
```

## Control Inventory Format

Each mapping file contains:

1. **Source Information** - Widget PHP location, section ID
2. **Control Inventory Table** - All controls with Elementor → Gutenberg mapping
3. **Implementation Code** - Ready-to-paste TSX
4. **Verification Checklist** - Parity verification status
