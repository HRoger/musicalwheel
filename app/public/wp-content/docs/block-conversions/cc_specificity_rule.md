# CSS Specificity Rule for LLM

## Rule: Avoid `!important` in CSS. Use body-scoped selectors for specificity. Only use `!important` as a last resort when all other methods fail.

### Requirements

- **Preferred**: Prefix all class and ID selectors with `body` to increase specificity naturally
- **Format**: `body .classname { }` or `body #idname { }` (note the space between body and selector)
- **Last Resort**: Use `!important` only when no other solution works (see exceptions below)

### Examples

**✅ Preferred approach:**
```css
body .my-element {
    color: red;
}

body #header {
    background: blue;
}
```

**⚠️ Last resort (use only when necessary):**
```css
.utility-hidden {
    display: none !important; /* Utility class must always apply */
}

.override-inline {
    color: blue !important; /* Overriding inline styles you cannot control */
}
```

### When `!important` Is Acceptable

Use `!important` **only** in these specific cases:

1. **Overriding third-party libraries/frameworks** - When you cannot modify the source CSS and need to override their styles
2. **Overriding inline styles** - When dealing with JavaScript-injected inline styles you cannot control
3. **Utility classes** - For helper classes that must always apply (e.g., `.hidden`, `.text-center`)
4. **Print stylesheets** - When media query styles need to override screen styles
5. **Quick prototyping** - Temporary use during development (must be refactored before production)

### Additional Guidance

- Always try to solve specificity issues through proper CSS organization first
- If `body` prefix is insufficient, use more specific parent selectors (e.g., `body.page-template .classname`)
- For deeply nested specificity issues, chain parent selectors instead of using `!important`
- **Document any `!important` usage** with a comment explaining why it's necessary
- This approach maintains clean, maintainable CSS without fighting specificity wars

### Why Avoid `!important`

- Breaks the natural CSS cascade
- Creates "specificity arms race" where more `!important` rules are needed to override previous ones
- Makes CSS harder to maintain and debug
- Causes conflicts in team environments
- Considered an anti-pattern in modern CSS

### Rationale

The `body` prefix increases specificity to (0,1,1) for classes and (1,0,1) for IDs, which typically overrides default plugin/theme styles without the maintenance burden of `!important` declarations. Only escalate to `!important` when facing constraints outside your control (third-party code, inline styles, etc.).
