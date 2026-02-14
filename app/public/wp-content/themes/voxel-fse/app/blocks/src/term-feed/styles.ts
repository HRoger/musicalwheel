import { TermFeedAttributes } from './types';

/**
 * Helper: Generate responsive CSS for a range attribute
 */
function generateResponsiveRangeCSS(
    attributes: TermFeedAttributes,
    baseName: string,
    selector: string,
    property: string | string[],
    unitOrFormatter: string | ((val: any) => string) = 'px'
): string {
    const properties = Array.isArray(property) ? property : [property];
    const cssRules: string[] = [];
    const tabletRules: string[] = [];
    const mobileRules: string[] = [];

    const formatValue = (val: any) => {
        if (typeof unitOrFormatter === 'function') {
            return unitOrFormatter(val);
        }
        return `${val}${unitOrFormatter}`;
    };

    // Desktop
    if (attributes[baseName] !== undefined && attributes[baseName] !== '') {
        const val = formatValue(attributes[baseName]);
        cssRules.push(`${selector} { ${properties.map(p => `${p}: ${val}`).join('; ')}; }`);
    }

    // Tablet
    const tabletName = `${baseName}_tablet`;
    if (attributes[tabletName] !== undefined && attributes[tabletName] !== '') {
        const val = formatValue(attributes[tabletName]);
        tabletRules.push(`${selector} { ${properties.map(p => `${p}: ${val}`).join('; ')}; }`);
    }

    // Mobile
    const mobileName = `${baseName}_mobile`;
    if (attributes[mobileName] !== undefined && attributes[mobileName] !== '') {
        const val = formatValue(attributes[mobileName]);
        mobileRules.push(`${selector} { ${properties.map(p => `${p}: ${val}`).join('; ')}; }`);
    }

    let finalCSS = cssRules.join('\n');
    if (tabletRules.length > 0) {
        finalCSS += `\n@media (max-width: 1024px) {\n${tabletRules.join('\n')}\n}`;
    }
    if (mobileRules.length > 0) {
        finalCSS += `\n@media (max-width: 767px) {\n${mobileRules.join('\n')}\n}`;
    }

    return finalCSS;
}

export function generateTermFeedResponsiveCSS(
    attributes: TermFeedAttributes,
    selector: string
): string {
    const cssParts: string[] = [];

    // Container positioning + overflow containment (matches post-feed/styles.ts)
    cssParts.push(`${selector} { position: relative; max-width: 100%; min-width: 0; overflow: hidden; }`);

    // Carousel Navigation Button Styles
    // PARITY FIX: Voxel scopes to `.post-feed-nav .ts-icon-btn` to avoid bleeding into card template icons
    // Evidence: themes/voxel/app/widgets/term-feed.php:367,387,406,417,438,450,472,511,530,541,553,566
    const btnSelector = `${selector} .post-feed-nav .ts-icon-btn`;
    const btnHoverSelector = `${selector} .post-feed-nav .ts-icon-btn:hover`;
    const navLiFirstSelector = `${selector} .post-feed-nav li:first-child`;
    const navLiLastSelector = `${selector} .post-feed-nav li:last-child`;
    const navLiAllSelector = `${selector} .post-feed-nav li`;

    // 1. Horizontal Position (Margins on li)
    cssParts.push(
        generateResponsiveRangeCSS(
            attributes,
            'navHorizontalPosition',
            navLiFirstSelector,
            'margin-left'
        )
    );
    cssParts.push(
        generateResponsiveRangeCSS(
            attributes,
            'navHorizontalPosition',
            navLiLastSelector,
            'margin-right'
        )
    );

    // 2. Vertical Position (Margin top on li)
    cssParts.push(
        generateResponsiveRangeCSS(
            attributes,
            'navVerticalPosition',
            navLiAllSelector,
            'margin-top'
        )
    );

    // 3. Button Icon Color
    if (attributes.navButtonIconColor) {
        cssParts.push(`${btnSelector} { --ts-icon-color: ${attributes.navButtonIconColor}; color: ${attributes.navButtonIconColor}; }`);
    }

    // 4. Button Size
    cssParts.push(
        generateResponsiveRangeCSS(
            attributes,
            'navButtonSize',
            btnSelector,
            ['width', 'height']
        )
    );

    // 5. Button Icon Size
    cssParts.push(
        generateResponsiveRangeCSS(
            attributes,
            'navButtonIconSize',
            btnSelector,
            '--ts-icon-size'
        )
    );

    // 6. Button Background
    if (attributes.navButtonBackground) {
        cssParts.push(`${btnSelector} { background-color: ${attributes.navButtonBackground}; }`);
    }

    // 7. Backdrop Blur
    cssParts.push(
        generateResponsiveRangeCSS(
            attributes,
            'navBackdropBlur',
            btnSelector,
            'backdrop-filter',
            (val) => `blur(${val}px)`
        )
    );

    // 8. Border
    if (attributes.navBorderType && attributes.navBorderType !== 'none') {
        const { top, right, bottom, left } = attributes.navBorderWidth || { top: 0, right: 0, bottom: 0, left: 0 };
        cssParts.push(`${btnSelector} { border-style: ${attributes.navBorderType}; border-width: ${top}px ${right}px ${bottom}px ${left}px; border-color: ${attributes.navBorderColor}; }`);
    }

    // 9. Border Radius
    cssParts.push(
        generateResponsiveRangeCSS(
            attributes,
            'navBorderRadius',
            btnSelector,
            'border-radius'
        )
    );

    // --- HOVER STATE ---

    // 10. Button Size Hover
    cssParts.push(
        generateResponsiveRangeCSS(
            attributes,
            'navButtonSizeHover',
            btnHoverSelector,
            ['width', 'height']
        )
    );

    // 11. Button Icon Size Hover
    cssParts.push(
        generateResponsiveRangeCSS(
            attributes,
            'navButtonIconSizeHover',
            btnHoverSelector,
            '--ts-icon-size'
        )
    );

    // 12. Button Icon Color Hover
    if (attributes.navButtonIconColorHover) {
        cssParts.push(`${btnHoverSelector} { --ts-icon-color: ${attributes.navButtonIconColorHover}; color: ${attributes.navButtonIconColorHover}; }`);
    }

    // 13. Button Background Hover
    if (attributes.navButtonBackgroundHover) {
        cssParts.push(`${btnHoverSelector} { background-color: ${attributes.navButtonBackgroundHover}; }`);
    }

    // 14. Button Border Color Hover
    if (attributes.navButtonBorderColorHover) {
        cssParts.push(`${btnHoverSelector} { border-color: ${attributes.navButtonBorderColorHover}; }`);
    }

    // --- LAYOUT ATTRIBUTES ---

    const gridSelector = `${selector} .post-feed-grid`;

    // Item Gap
    cssParts.push(
        generateResponsiveRangeCSS(
            attributes,
            'itemGap',
            gridSelector,
            'gap'
        )
    );

    if (attributes.layoutMode === 'ts-feed-grid-default') {
        // Grid Columns
        cssParts.push(
            generateResponsiveRangeCSS(
                attributes,
                'gridColumns',
                gridSelector,
                'grid-template-columns',
                (val) => `repeat(${val}, minmax(0, 1fr))`
            )
        );
    } else if (attributes.layoutMode === 'ts-feed-nowrap') {
        // Scroll Padding
        cssParts.push(
            generateResponsiveRangeCSS(
                attributes,
                'scrollPadding',
                gridSelector,
                ['padding-left', 'padding-right', 'scroll-padding']
            )
        );

        // Scroll Padding - Last child margin (Voxel parity)
        const lastChildSelector = `${gridSelector} > div:last-of-type`;
        cssParts.push(
            generateResponsiveRangeCSS(
                attributes,
                'scrollPadding',
                lastChildSelector,
                'margin-right'
            )
        );

        // Item Width
        const itemSelector = `${selector} .ts-feed-nowrap .ts-preview`;
        cssParts.push(
            generateResponsiveRangeCSS(
                attributes,
                'carouselItemWidth',
                itemSelector,
                ['width', 'min-width', 'flex-basis'],
                (val) => `${val}${attributes.carouselItemWidthUnit || '%'}`
            )
        );

        // Item Padding
        cssParts.push(
            generateResponsiveRangeCSS(
                attributes,
                'itemPadding',
                itemSelector,
                'padding'
            )
        );
    }

    return cssParts.filter(Boolean).join('\n');
}
