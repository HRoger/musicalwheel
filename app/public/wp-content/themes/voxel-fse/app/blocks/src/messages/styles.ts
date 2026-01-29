/**
 * Messages Block - Style Generation
 *
 * Generates CSS for all 85 Style tab controls.
 * Organized by accordion sections matching StyleTab.tsx.
 *
 * @package VoxelFSE
 */

import type { MessagesAttributes } from './types';
import type { DimensionsConfig, BorderGroupValue, BoxShadowValue, TypographyValue } from '@shared/types';

/**
 * Helper: Generate dimensions CSS (padding, margin)
 */
function generateDimensionsCSS(
	dimensions: DimensionsConfig | undefined,
	property: string
): string {
	if (!dimensions) return '';

	const unit = dimensions.unit || 'px';
	const top = parseFloat(String(dimensions.top)) || 0;
	const right = parseFloat(String(dimensions.right)) || 0;
	const bottom = parseFloat(String(dimensions.bottom)) || 0;
	const left = parseFloat(String(dimensions.left)) || 0;

	return `${property}: ${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit};`;
}

/**
 * Helper: Generate border CSS from BorderGroupValue
 */
function generateBorderCSS(border: BorderGroupValue | undefined): string {
	if (!border || !border.borderType || border.borderType === 'none') return '';

	let css = '';

	// Border width
	if (border.borderWidth) {
		const unit = border.borderWidth.unit || 'px';
		const top = parseFloat(String(border.borderWidth.top)) || 0;
		const right = parseFloat(String(border.borderWidth.right)) || 0;
		const bottom = parseFloat(String(border.borderWidth.bottom)) || 0;
		const left = parseFloat(String(border.borderWidth.left)) || 0;

		css += `border-width: ${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}; `;
	}

	// Border style
	css += `border-style: ${border.borderType}; `;

	// Border color
	if (border.borderColor) {
		css += `border-color: ${border.borderColor}; `;
	}

	return css;
}

/**
 * Helper: Generate box shadow CSS
 */
function generateBoxShadowCSS(shadow: BoxShadowValue | undefined): string {
	if (!shadow || !shadow.enable) return '';

	const h = shadow.horizontal || 0;
	const v = shadow.vertical || 0;
	const blur = shadow.blur || 0;
	const spread = shadow.spread || 0;
	const color = shadow.color || 'rgba(0,0,0,0.1)';
	const position = shadow.position === 'inset' ? 'inset ' : '';

	return `box-shadow: ${position}${h}px ${v}px ${blur}px ${spread}px ${color};`;
}

/**
 * Helper: Generate typography CSS
 */
function generateTypographyCSS(typography: TypographyValue | undefined): string {
	if (!typography) return '';

	let css = '';

	if (typography.fontFamily) css += `font-family: ${typography.fontFamily}; `;
	if (typography.fontSize !== undefined) {
		const unit = typography.fontSizeUnit || 'px';
		css += `font-size: ${typography.fontSize}${unit}; `;
	}
	if (typography.fontWeight) css += `font-weight: ${typography.fontWeight}; `;
	if (typography.fontStyle) css += `font-style: ${typography.fontStyle}; `;
	if (typography.textTransform) css += `text-transform: ${typography.textTransform}; `;
	if (typography.textDecoration) css += `text-decoration: ${typography.textDecoration}; `;
	if (typography.lineHeight !== undefined) {
		const unit = typography.lineHeightUnit || '';
		css += `line-height: ${typography.lineHeight}${unit}; `;
	}
	if (typography.letterSpacing !== undefined) {
		const unit = typography.letterSpacingUnit || 'px';
		css += `letter-spacing: ${typography.letterSpacing}${unit}; `;
	}

	return css;
}

/**
 * Helper: Generate background CSS from BackgroundControl
 */
function generateBackgroundCSS(
	attributes: Record<string, any>,
	prefix: string = ''
): string {
	const bgType = attributes[`${prefix}backgroundType`] || 'classic';
	let css = '';

	if (bgType === 'classic') {
		const bgColor = attributes[`${prefix}backgroundColor`];
		if (bgColor) css += `background-color: ${bgColor}; `;

		const bgImage = attributes[`${prefix}backgroundImage`];
		if (bgImage?.url) {
			css += `background-image: url('${bgImage.url}'); `;

			const bgPosition = attributes[`${prefix}backgroundPosition`] || 'center center';
			css += `background-position: ${bgPosition}; `;

			const bgAttachment = attributes[`${prefix}backgroundAttachment`] || 'scroll';
			css += `background-attachment: ${bgAttachment}; `;

			const bgRepeat = attributes[`${prefix}backgroundRepeat`] || 'no-repeat';
			css += `background-repeat: ${bgRepeat}; `;

			const bgSize = attributes[`${prefix}backgroundSize`] || 'cover';
			css += `background-size: ${bgSize}; `;
		}
	} else if (bgType === 'gradient') {
		const bgGradient = attributes[`${prefix}backgroundGradient`];
		if (bgGradient) css += `background: ${bgGradient}; `;
	}

	return css;
}

/**
 * Generate inline styles for messages block (if needed)
 * Currently returns empty object as all styles are scoped CSS
 */
export function generateMessagesInlineStyles(
	attributes: MessagesAttributes
): React.CSSProperties {
	return {};
}

/**
 * Generate responsive CSS for all 85 messages style controls
 */
export function generateMessagesResponsiveCSS(
	attributes: MessagesAttributes,
	blockId: string
): string {
	const cssRules: string[] = [];
	const tabletRules: string[] = [];
	const mobileRules: string[] = [];
	const selector = `.voxel-fse-messages-${blockId}`;

	// ============================================
	// 1. GENERAL
	// Source: messages-widget.php
	// ============================================

	// Height
	if (attributes.generalHeight !== undefined) {
		const unit = attributes.generalHeightUnit || 'px';
		cssRules.push(`${selector} { height: ${attributes.generalHeight}${unit}; }`);
	}
	if (attributes.generalHeight_tablet !== undefined) {
		const unit = attributes.generalHeightUnit || 'px';
		tabletRules.push(`${selector} { height: ${attributes.generalHeight_tablet}${unit}; }`);
	}
	if (attributes.generalHeight_mobile !== undefined) {
		const unit = attributes.generalHeightUnit || 'px';
		mobileRules.push(`${selector} { height: ${attributes.generalHeight_mobile}${unit}; }`);
	}

	// Calculated height (if enabled)
	if (attributes.enableCalcHeight && attributes.calcHeight) {
		cssRules.push(`${selector} { height: ${attributes.calcHeight}; }`);
	}

	// Background color
	if (attributes.generalBackground) {
		cssRules.push(`${selector} { background-color: ${attributes.generalBackground}; }`);
	}

	// Border
	const generalBorder = generateBorderCSS({
		borderType: attributes.generalBorderType,
		borderWidth: attributes.generalBorderWidth,
		borderColor: attributes.generalBorderColor,
	});
	if (generalBorder) {
		cssRules.push(`${selector} { ${generalBorder} }`);
	}

	// Border radius
	if (attributes.generalBorderRadius !== undefined) {
		const unit = attributes.generalBorderRadiusUnit || 'px';
		cssRules.push(`${selector} { border-radius: ${attributes.generalBorderRadius}${unit}; }`);
	}
	if (attributes.generalBorderRadius_tablet !== undefined) {
		const unit = attributes.generalBorderRadiusUnit || 'px';
		tabletRules.push(`${selector} { border-radius: ${attributes.generalBorderRadius_tablet}${unit}; }`);
	}
	if (attributes.generalBorderRadius_mobile !== undefined) {
		const unit = attributes.generalBorderRadiusUnit || 'px';
		mobileRules.push(`${selector} { border-radius: ${attributes.generalBorderRadius_mobile}${unit}; }`);
	}

	// Box shadow
	const generalBoxShadow = generateBoxShadowCSS(attributes.generalBoxShadow);
	if (generalBoxShadow) {
		cssRules.push(`${selector} { ${generalBoxShadow} }`);
	}

	// Sidebar width
	if (attributes.sidebarWidth !== undefined) {
		const unit = attributes.sidebarWidthUnit || 'px';
		cssRules.push(`${selector} .message-list-container { width: ${attributes.sidebarWidth}${unit}; }`);
	}
	if (attributes.sidebarWidth_tablet !== undefined) {
		const unit = attributes.sidebarWidthUnit || 'px';
		tabletRules.push(`${selector} .message-list-container { width: ${attributes.sidebarWidth_tablet}${unit}; }`);
	}
	if (attributes.sidebarWidth_mobile !== undefined) {
		const unit = attributes.sidebarWidthUnit || 'px';
		mobileRules.push(`${selector} .message-list-container { width: ${attributes.sidebarWidth_mobile}${unit}; }`);
	}

	// Separator color
	if (attributes.separatorColor) {
		cssRules.push(`${selector} .separator { background-color: ${attributes.separatorColor}; }`);
	}

	// Scrollbar color
	if (attributes.scrollbarColor) {
		cssRules.push(`${selector} .message-list::-webkit-scrollbar-thumb { background-color: ${attributes.scrollbarColor}; }`);
		cssRules.push(`${selector} .conversation-body::-webkit-scrollbar-thumb { background-color: ${attributes.scrollbarColor}; }`);
	}

	// ============================================
	// 2. INBOX: MESSAGE
	// Source: messages-widget.php:44-56
	// Voxel structure: <li> with .ts-active-chat, .ts-unread-message, .ts-new-message
	// ============================================

	// Normal state - Target: .ts-convo-list > li > a
	const inboxMessagePaddingCSS = generateDimensionsCSS(
		attributes.inboxMessagePadding,
		'padding'
	);
	if (inboxMessagePaddingCSS) {
		cssRules.push(`${selector} .ts-convo-list > li > a { ${inboxMessagePaddingCSS} }`);
	}

	if (attributes.inboxMessageContentGap !== undefined) {
		const unit = attributes.inboxMessageContentGapUnit || 'px';
		cssRules.push(`${selector} .ts-convo-list > li > a { gap: ${attributes.inboxMessageContentGap}${unit}; }`);
	}
	if (attributes.inboxMessageContentGap_tablet !== undefined) {
		const unit = attributes.inboxMessageContentGapUnit || 'px';
		tabletRules.push(`${selector} .ts-convo-list > li > a { gap: ${attributes.inboxMessageContentGap_tablet}${unit}; }`);
	}
	if (attributes.inboxMessageContentGap_mobile !== undefined) {
		const unit = attributes.inboxMessageContentGapUnit || 'px';
		mobileRules.push(`${selector} .ts-convo-list > li > a { gap: ${attributes.inboxMessageContentGap_mobile}${unit}; }`);
	}

	// Title - Target: .message-details > b
	if (attributes.inboxMessageTitleColor) {
		cssRules.push(`${selector} .ts-convo-list .message-details > b { color: ${attributes.inboxMessageTitleColor}; }`);
	}

	const inboxMessageTitleTypoCSS = generateTypographyCSS(
		attributes.inboxMessageTitleTypography
	);
	if (inboxMessageTitleTypoCSS) {
		cssRules.push(`${selector} .ts-convo-list .message-details > b { ${inboxMessageTitleTypoCSS} }`);
	}

	// Subtitle - Target: .message-details > span
	if (attributes.inboxMessageSubtitleColor) {
		cssRules.push(`${selector} .ts-convo-list .message-details > span { color: ${attributes.inboxMessageSubtitleColor}; }`);
	}

	const inboxMessageSubtitleTypoCSS = generateTypographyCSS(
		attributes.inboxMessageSubtitleTypography
	);
	if (inboxMessageSubtitleTypoCSS) {
		cssRules.push(`${selector} .ts-convo-list .message-details > span { ${inboxMessageSubtitleTypoCSS} }`);
	}

	// Avatar - Target: .convo-avatar
	if (attributes.inboxMessageAvatarSize !== undefined) {
		const unit = attributes.inboxMessageAvatarSizeUnit || 'px';
		cssRules.push(`${selector} .ts-convo-list .convo-avatar { width: ${attributes.inboxMessageAvatarSize}${unit}; height: ${attributes.inboxMessageAvatarSize}${unit}; }`);
	}
	if (attributes.inboxMessageAvatarSize_tablet !== undefined) {
		const unit = attributes.inboxMessageAvatarSizeUnit || 'px';
		tabletRules.push(`${selector} .ts-convo-list .convo-avatar { width: ${attributes.inboxMessageAvatarSize_tablet}${unit}; height: ${attributes.inboxMessageAvatarSize_tablet}${unit}; }`);
	}
	if (attributes.inboxMessageAvatarSize_mobile !== undefined) {
		const unit = attributes.inboxMessageAvatarSizeUnit || 'px';
		mobileRules.push(`${selector} .ts-convo-list .convo-avatar { width: ${attributes.inboxMessageAvatarSize_mobile}${unit}; height: ${attributes.inboxMessageAvatarSize_mobile}${unit}; }`);
	}

	if (attributes.inboxMessageAvatarGap !== undefined) {
		const unit = attributes.inboxMessageAvatarGapUnit || 'px';
		cssRules.push(`${selector} .ts-convo-list > li > a { column-gap: ${attributes.inboxMessageAvatarGap}${unit}; }`);
	}
	if (attributes.inboxMessageAvatarGap_tablet !== undefined) {
		const unit = attributes.inboxMessageAvatarGapUnit || 'px';
		tabletRules.push(`${selector} .ts-convo-list > li > a { column-gap: ${attributes.inboxMessageAvatarGap_tablet}${unit}; }`);
	}
	if (attributes.inboxMessageAvatarGap_mobile !== undefined) {
		const unit = attributes.inboxMessageAvatarGapUnit || 'px';
		mobileRules.push(`${selector} .ts-convo-list > li > a { column-gap: ${attributes.inboxMessageAvatarGap_mobile}${unit}; }`);
	}

	// Secondary logo - Target: .post-avatar (line 48)
	if (attributes.inboxMessageSecondaryLogoSize !== undefined) {
		const unit = attributes.inboxMessageSecondaryLogoSizeUnit || 'px';
		cssRules.push(`${selector} .ts-convo-list .post-avatar { width: ${attributes.inboxMessageSecondaryLogoSize}${unit}; height: ${attributes.inboxMessageSecondaryLogoSize}${unit}; }`);
	}
	if (attributes.inboxMessageSecondaryLogoSize_tablet !== undefined) {
		const unit = attributes.inboxMessageSecondaryLogoSizeUnit || 'px';
		tabletRules.push(`${selector} .ts-convo-list .post-avatar { width: ${attributes.inboxMessageSecondaryLogoSize_tablet}${unit}; height: ${attributes.inboxMessageSecondaryLogoSize_tablet}${unit}; }`);
	}
	if (attributes.inboxMessageSecondaryLogoSize_mobile !== undefined) {
		const unit = attributes.inboxMessageSecondaryLogoSizeUnit || 'px';
		mobileRules.push(`${selector} .ts-convo-list .post-avatar { width: ${attributes.inboxMessageSecondaryLogoSize_mobile}${unit}; height: ${attributes.inboxMessageSecondaryLogoSize_mobile}${unit}; }`);
	}

	const secondaryLogoBorder = generateBorderCSS(
		attributes.inboxMessageSecondaryLogoBorder
	);
	if (secondaryLogoBorder) {
		cssRules.push(`${selector} .ts-convo-list .post-avatar { ${secondaryLogoBorder} }`);
	}

	// Hover state
	if (attributes.inboxMessageHoverBg) {
		cssRules.push(`${selector} .ts-convo-list > li > a:hover { background-color: ${attributes.inboxMessageHoverBg}; }`);
	}

	if (attributes.inboxMessageHoverTitleColor) {
		cssRules.push(`${selector} .ts-convo-list > li > a:hover .message-details > b { color: ${attributes.inboxMessageHoverTitleColor}; }`);
	}

	if (attributes.inboxMessageHoverSubtitleColor) {
		cssRules.push(`${selector} .ts-convo-list > li > a:hover .message-details > span { color: ${attributes.inboxMessageHoverSubtitleColor}; }`);
	}

	// Active state - Target: li.ts-active-chat
	if (attributes.inboxMessageActiveBg) {
		cssRules.push(`${selector} .ts-convo-list > li.ts-active-chat > a { background-color: ${attributes.inboxMessageActiveBg}; }`);
	}

	if (attributes.inboxMessageActiveBorderWidth !== undefined) {
		const unit = attributes.inboxMessageActiveBorderWidthUnit || 'px';
		cssRules.push(`${selector} .ts-convo-list > li.ts-active-chat > a { border-left-width: ${attributes.inboxMessageActiveBorderWidth}${unit}; border-left-style: solid; }`);
	}
	if (attributes.inboxMessageActiveBorderWidth_tablet !== undefined) {
		const unit = attributes.inboxMessageActiveBorderWidthUnit || 'px';
		tabletRules.push(`${selector} .ts-convo-list > li.ts-active-chat > a { border-left-width: ${attributes.inboxMessageActiveBorderWidth_tablet}${unit}; }`);
	}
	if (attributes.inboxMessageActiveBorderWidth_mobile !== undefined) {
		const unit = attributes.inboxMessageActiveBorderWidthUnit || 'px';
		mobileRules.push(`${selector} .ts-convo-list > li.ts-active-chat > a { border-left-width: ${attributes.inboxMessageActiveBorderWidth_mobile}${unit}; }`);
	}

	if (attributes.inboxMessageActiveBorderColor) {
		cssRules.push(`${selector} .ts-convo-list > li.ts-active-chat > a { border-left-color: ${attributes.inboxMessageActiveBorderColor}; }`);
	}

	if (attributes.inboxMessageActiveTitleColor) {
		cssRules.push(`${selector} .ts-convo-list > li.ts-active-chat .message-details > b { color: ${attributes.inboxMessageActiveTitleColor}; }`);
	}

	if (attributes.inboxMessageActiveSubtitleColor) {
		cssRules.push(`${selector} .ts-convo-list > li.ts-active-chat .message-details > span { color: ${attributes.inboxMessageActiveSubtitleColor}; }`);
	}

	// Unread state - Target: li.ts-unread-message
	const inboxMessageUnreadTitleTypoCSS = generateTypographyCSS(
		attributes.inboxMessageUnreadTitleTypography
	);
	if (inboxMessageUnreadTitleTypoCSS) {
		cssRules.push(`${selector} .ts-convo-list > li.ts-unread-message .message-details > b { ${inboxMessageUnreadTitleTypoCSS} }`);
	}

	// New state - Target: li.ts-new-message (avatar border)
	const newAvatarBorder = generateBorderCSS(attributes.inboxMessageNewAvatarBorder);
	if (newAvatarBorder) {
		cssRules.push(`${selector} .ts-convo-list > li.ts-new-message .convo-avatar { ${newAvatarBorder} }`);
	}

	// ============================================
	// 3. INBOX: SEARCH
	// ============================================

	const inboxSearchTypoCSS = generateTypographyCSS(attributes.inboxSearchTypography);
	if (inboxSearchTypoCSS) {
		cssRules.push(`${selector} .inbox-search input { ${inboxSearchTypoCSS} }`);
	}

	if (attributes.inboxSearchValueColor) {
		cssRules.push(`${selector} .inbox-search input { color: ${attributes.inboxSearchValueColor}; }`);
	}

	if (attributes.inboxSearchPlaceholderColor) {
		cssRules.push(`${selector} .inbox-search input::placeholder { color: ${attributes.inboxSearchPlaceholderColor}; }`);
	}

	if (attributes.inboxSearchIconColor) {
		cssRules.push(`${selector} .inbox-search .search-icon { color: ${attributes.inboxSearchIconColor}; }`);
	}

	if (attributes.inboxSearchIconSize !== undefined) {
		const unit = attributes.inboxSearchIconSizeUnit || 'px';
		cssRules.push(`${selector} .inbox-search .search-icon { font-size: ${attributes.inboxSearchIconSize}${unit}; }`);
	}
	if (attributes.inboxSearchIconSize_tablet !== undefined) {
		const unit = attributes.inboxSearchIconSizeUnit || 'px';
		tabletRules.push(`${selector} .inbox-search .search-icon { font-size: ${attributes.inboxSearchIconSize_tablet}${unit}; }`);
	}
	if (attributes.inboxSearchIconSize_mobile !== undefined) {
		const unit = attributes.inboxSearchIconSizeUnit || 'px';
		mobileRules.push(`${selector} .inbox-search .search-icon { font-size: ${attributes.inboxSearchIconSize_mobile}${unit}; }`);
	}

	// ============================================
	// 4. CONVERSATION: TOP
	// ============================================

	if (attributes.conversationTopAvatarRadius !== undefined) {
		const unit = attributes.conversationTopAvatarRadiusUnit || 'px';
		cssRules.push(`${selector} .conversation-top .avatar { border-radius: ${attributes.conversationTopAvatarRadius}${unit}; }`);
	}
	if (attributes.conversationTopAvatarRadius_tablet !== undefined) {
		const unit = attributes.conversationTopAvatarRadiusUnit || 'px';
		tabletRules.push(`${selector} .conversation-top .avatar { border-radius: ${attributes.conversationTopAvatarRadius_tablet}${unit}; }`);
	}
	if (attributes.conversationTopAvatarRadius_mobile !== undefined) {
		const unit = attributes.conversationTopAvatarRadiusUnit || 'px';
		mobileRules.push(`${selector} .conversation-top .avatar { border-radius: ${attributes.conversationTopAvatarRadius_mobile}${unit}; }`);
	}

	if (attributes.conversationTopAvatarGap !== undefined) {
		const unit = attributes.conversationTopAvatarGapUnit || 'px';
		cssRules.push(`${selector} .conversation-top { gap: ${attributes.conversationTopAvatarGap}${unit}; }`);
	}
	if (attributes.conversationTopAvatarGap_tablet !== undefined) {
		const unit = attributes.conversationTopAvatarGapUnit || 'px';
		tabletRules.push(`${selector} .conversation-top { gap: ${attributes.conversationTopAvatarGap_tablet}${unit}; }`);
	}
	if (attributes.conversationTopAvatarGap_mobile !== undefined) {
		const unit = attributes.conversationTopAvatarGapUnit || 'px';
		mobileRules.push(`${selector} .conversation-top { gap: ${attributes.conversationTopAvatarGap_mobile}${unit}; }`);
	}

	const conversationTopTypoCSS = generateTypographyCSS(
		attributes.conversationTopTypography
	);
	if (conversationTopTypoCSS) {
		cssRules.push(`${selector} .conversation-top .name { ${conversationTopTypoCSS} }`);
	}

	if (attributes.conversationTopTextColor) {
		cssRules.push(`${selector} .conversation-top .name { color: ${attributes.conversationTopTextColor}; }`);
	}

	// ============================================
	// 5. CONVERSATION: INTRO
	// ============================================

	if (attributes.conversationIntroContentGap !== undefined) {
		const unit = attributes.conversationIntroContentGapUnit || 'px';
		cssRules.push(`${selector} .conversation-intro { gap: ${attributes.conversationIntroContentGap}${unit}; }`);
	}
	if (attributes.conversationIntroContentGap_tablet !== undefined) {
		const unit = attributes.conversationIntroContentGapUnit || 'px';
		tabletRules.push(`${selector} .conversation-intro { gap: ${attributes.conversationIntroContentGap_tablet}${unit}; }`);
	}
	if (attributes.conversationIntroContentGap_mobile !== undefined) {
		const unit = attributes.conversationIntroContentGapUnit || 'px';
		mobileRules.push(`${selector} .conversation-intro { gap: ${attributes.conversationIntroContentGap_mobile}${unit}; }`);
	}

	if (attributes.conversationIntroAvatarSize !== undefined) {
		const unit = attributes.conversationIntroAvatarSizeUnit || 'px';
		cssRules.push(`${selector} .conversation-intro .avatar { width: ${attributes.conversationIntroAvatarSize}${unit}; height: ${attributes.conversationIntroAvatarSize}${unit}; }`);
	}
	if (attributes.conversationIntroAvatarSize_tablet !== undefined) {
		const unit = attributes.conversationIntroAvatarSizeUnit || 'px';
		tabletRules.push(`${selector} .conversation-intro .avatar { width: ${attributes.conversationIntroAvatarSize_tablet}${unit}; height: ${attributes.conversationIntroAvatarSize_tablet}${unit}; }`);
	}
	if (attributes.conversationIntroAvatarSize_mobile !== undefined) {
		const unit = attributes.conversationIntroAvatarSizeUnit || 'px';
		mobileRules.push(`${selector} .conversation-intro .avatar { width: ${attributes.conversationIntroAvatarSize_mobile}${unit}; height: ${attributes.conversationIntroAvatarSize_mobile}${unit}; }`);
	}

	if (attributes.conversationIntroAvatarRadius !== undefined) {
		const unit = attributes.conversationIntroAvatarRadiusUnit || 'px';
		cssRules.push(`${selector} .conversation-intro .avatar { border-radius: ${attributes.conversationIntroAvatarRadius}${unit}; }`);
	}
	if (attributes.conversationIntroAvatarRadius_tablet !== undefined) {
		const unit = attributes.conversationIntroAvatarRadiusUnit || 'px';
		tabletRules.push(`${selector} .conversation-intro .avatar { border-radius: ${attributes.conversationIntroAvatarRadius_tablet}${unit}; }`);
	}
	if (attributes.conversationIntroAvatarRadius_mobile !== undefined) {
		const unit = attributes.conversationIntroAvatarRadiusUnit || 'px';
		mobileRules.push(`${selector} .conversation-intro .avatar { border-radius: ${attributes.conversationIntroAvatarRadius_mobile}${unit}; }`);
	}

	const conversationIntroNameTypoCSS = generateTypographyCSS(
		attributes.conversationIntroNameTypography
	);
	if (conversationIntroNameTypoCSS) {
		cssRules.push(`${selector} .conversation-intro .name { ${conversationIntroNameTypoCSS} }`);
	}

	if (attributes.conversationIntroNameColor) {
		cssRules.push(`${selector} .conversation-intro .name { color: ${attributes.conversationIntroNameColor}; }`);
	}

	const conversationIntroSubtitleTypoCSS = generateTypographyCSS(
		attributes.conversationIntroSubtitleTypography
	);
	if (conversationIntroSubtitleTypoCSS) {
		cssRules.push(`${selector} .conversation-intro .subtitle { ${conversationIntroSubtitleTypoCSS} }`);
	}

	if (attributes.conversationIntroSubtitleColor) {
		cssRules.push(`${selector} .conversation-intro .subtitle { color: ${attributes.conversationIntroSubtitleColor}; }`);
	}

	// ============================================
	// 6. CONVERSATION: BODY
	// ============================================

	if (attributes.conversationBodyMessageGap !== undefined) {
		const unit = attributes.conversationBodyMessageGapUnit || 'px';
		cssRules.push(`${selector} .conversation-body { gap: ${attributes.conversationBodyMessageGap}${unit}; }`);
	}
	if (attributes.conversationBodyMessageGap_tablet !== undefined) {
		const unit = attributes.conversationBodyMessageGapUnit || 'px';
		tabletRules.push(`${selector} .conversation-body { gap: ${attributes.conversationBodyMessageGap_tablet}${unit}; }`);
	}
	if (attributes.conversationBodyMessageGap_mobile !== undefined) {
		const unit = attributes.conversationBodyMessageGapUnit || 'px';
		mobileRules.push(`${selector} .conversation-body { gap: ${attributes.conversationBodyMessageGap_mobile}${unit}; }`);
	}

	const conversationBodyMessagePaddingCSS = generateDimensionsCSS(
		attributes.conversationBodyMessagePadding,
		'padding'
	);
	if (conversationBodyMessagePaddingCSS) {
		cssRules.push(`${selector} .message-bubble { ${conversationBodyMessagePaddingCSS} }`);
	}

	const conversationBodyMessageTypoCSS = generateTypographyCSS(
		attributes.conversationBodyMessageTypography
	);
	if (conversationBodyMessageTypoCSS) {
		cssRules.push(`${selector} .message-bubble { ${conversationBodyMessageTypoCSS} }`);
	}

	if (attributes.conversationBodyMessageRadius !== undefined) {
		const unit = attributes.conversationBodyMessageRadiusUnit || 'px';
		cssRules.push(`${selector} .message-bubble { border-radius: ${attributes.conversationBodyMessageRadius}${unit}; }`);
	}
	if (attributes.conversationBodyMessageRadius_tablet !== undefined) {
		const unit = attributes.conversationBodyMessageRadiusUnit || 'px';
		tabletRules.push(`${selector} .message-bubble { border-radius: ${attributes.conversationBodyMessageRadius_tablet}${unit}; }`);
	}
	if (attributes.conversationBodyMessageRadius_mobile !== undefined) {
		const unit = attributes.conversationBodyMessageRadiusUnit || 'px';
		mobileRules.push(`${selector} .message-bubble { border-radius: ${attributes.conversationBodyMessageRadius_mobile}${unit}; }`);
	}

	// Responder 1
	const responder1BgCSS = generateBackgroundCSS(attributes as any, 'responder1');
	if (responder1BgCSS) {
		cssRules.push(`${selector} .message-bubble.responder-1 { ${responder1BgCSS} }`);
	}

	if (attributes.responder1Color) {
		cssRules.push(`${selector} .message-bubble.responder-1 { color: ${attributes.responder1Color}; }`);
	}

	// Responder 2
	const responder2BgCSS = generateBackgroundCSS(attributes as any, 'responder2');
	if (responder2BgCSS) {
		cssRules.push(`${selector} .message-bubble.responder-2 { ${responder2BgCSS} }`);
	}

	if (attributes.responder2Color) {
		cssRules.push(`${selector} .message-bubble.responder-2 { color: ${attributes.responder2Color}; }`);
	}

	// Error
	const errorBgCSS = generateBackgroundCSS(attributes as any, 'error');
	if (errorBgCSS) {
		cssRules.push(`${selector} .message-bubble.error { ${errorBgCSS} }`);
	}

	if (attributes.errorColor) {
		cssRules.push(`${selector} .message-bubble.error { color: ${attributes.errorColor}; }`);
	}

	// Message info
	const messageInfoTypoCSS = generateTypographyCSS(attributes.messageInfoTypography);
	if (messageInfoTypoCSS) {
		cssRules.push(`${selector} .message-info { ${messageInfoTypoCSS} }`);
	}

	if (attributes.messageInfoDefaultColor) {
		cssRules.push(`${selector} .message-info { color: ${attributes.messageInfoDefaultColor}; }`);
	}

	if (attributes.messageInfoDeleteColor) {
		cssRules.push(`${selector} .message-info .delete { color: ${attributes.messageInfoDeleteColor}; }`);
	}

	// Seen
	const seenTypoCSS = generateTypographyCSS(attributes.seenTypography);
	if (seenTypoCSS) {
		cssRules.push(`${selector} .seen-indicator { ${seenTypoCSS} }`);
	}

	if (attributes.seenColor) {
		cssRules.push(`${selector} .seen-indicator { color: ${attributes.seenColor}; }`);
	}

	// Images
	if (attributes.imagesRadius !== undefined) {
		const unit = attributes.imagesRadiusUnit || 'px';
		cssRules.push(`${selector} .message-image { border-radius: ${attributes.imagesRadius}${unit}; }`);
	}
	if (attributes.imagesRadius_tablet !== undefined) {
		const unit = attributes.imagesRadiusUnit || 'px';
		tabletRules.push(`${selector} .message-image { border-radius: ${attributes.imagesRadius_tablet}${unit}; }`);
	}
	if (attributes.imagesRadius_mobile !== undefined) {
		const unit = attributes.imagesRadiusUnit || 'px';
		mobileRules.push(`${selector} .message-image { border-radius: ${attributes.imagesRadius_mobile}${unit}; }`);
	}

	// ============================================
	// 7. CONVERSATION: COMPOSE
	// ============================================

	if (attributes.composeAvatarRadius !== undefined) {
		const unit = attributes.composeAvatarRadiusUnit || 'px';
		cssRules.push(`${selector} .compose-area .avatar { border-radius: ${attributes.composeAvatarRadius}${unit}; }`);
	}
	if (attributes.composeAvatarRadius_tablet !== undefined) {
		const unit = attributes.composeAvatarRadiusUnit || 'px';
		tabletRules.push(`${selector} .compose-area .avatar { border-radius: ${attributes.composeAvatarRadius_tablet}${unit}; }`);
	}
	if (attributes.composeAvatarRadius_mobile !== undefined) {
		const unit = attributes.composeAvatarRadiusUnit || 'px';
		mobileRules.push(`${selector} .compose-area .avatar { border-radius: ${attributes.composeAvatarRadius_mobile}${unit}; }`);
	}

	// Placeholder
	const composePlaceholderTypoCSS = generateTypographyCSS(
		attributes.composePlaceholderTypography
	);
	if (composePlaceholderTypoCSS) {
		cssRules.push(`${selector} .compose-area textarea::placeholder { ${composePlaceholderTypoCSS} }`);
	}

	if (attributes.composePlaceholderColor) {
		cssRules.push(`${selector} .compose-area textarea::placeholder { color: ${attributes.composePlaceholderColor}; }`);
	}

	// Value
	const composeValueTypoCSS = generateTypographyCSS(
		attributes.composeValueTypography
	);
	if (composeValueTypoCSS) {
		cssRules.push(`${selector} .compose-area textarea { ${composeValueTypoCSS} }`);
	}

	if (attributes.composeValueColor) {
		cssRules.push(`${selector} .compose-area textarea { color: ${attributes.composeValueColor}; }`);
	}

	// ============================================
	// 8. ICON BUTTON
	// ============================================

	// Normal state
	if (attributes.iconButtonColor) {
		cssRules.push(`${selector} .icon-button { color: ${attributes.iconButtonColor}; }`);
	}

	if (attributes.iconButtonBackground) {
		cssRules.push(`${selector} .icon-button { background-color: ${attributes.iconButtonBackground}; }`);
	}

	const iconButtonBorder = generateBorderCSS({
		borderType: attributes.iconButtonBorderType,
		borderWidth: attributes.iconButtonBorderWidth,
		borderColor: attributes.iconButtonBorderColor,
	});
	if (iconButtonBorder) {
		cssRules.push(`${selector} .icon-button { ${iconButtonBorder} }`);
	}

	if (attributes.iconButtonRadius !== undefined) {
		const unit = attributes.iconButtonRadiusUnit || 'px';
		cssRules.push(`${selector} .icon-button { border-radius: ${attributes.iconButtonRadius}${unit}; }`);
	}
	if (attributes.iconButtonRadius_tablet !== undefined) {
		const unit = attributes.iconButtonRadiusUnit || 'px';
		tabletRules.push(`${selector} .icon-button { border-radius: ${attributes.iconButtonRadius_tablet}${unit}; }`);
	}
	if (attributes.iconButtonRadius_mobile !== undefined) {
		const unit = attributes.iconButtonRadiusUnit || 'px';
		mobileRules.push(`${selector} .icon-button { border-radius: ${attributes.iconButtonRadius_mobile}${unit}; }`);
	}

	// Hover state
	if (attributes.iconButtonHoverColor) {
		cssRules.push(`${selector} .icon-button:hover { color: ${attributes.iconButtonHoverColor}; }`);
	}

	if (attributes.iconButtonHoverBackground) {
		cssRules.push(`${selector} .icon-button:hover { background-color: ${attributes.iconButtonHoverBackground}; }`);
	}

	if (attributes.iconButtonHoverBorderColor) {
		cssRules.push(`${selector} .icon-button:hover { border-color: ${attributes.iconButtonHoverBorderColor}; }`);
	}

	// ============================================
	// 9. TERTIARY BUTTON
	// ============================================

	// Normal state
	if (attributes.tertiaryButtonIconColor) {
		cssRules.push(`${selector} .tertiary-button .icon { color: ${attributes.tertiaryButtonIconColor}; }`);
	}

	if (attributes.tertiaryButtonIconSize !== undefined) {
		const unit = attributes.tertiaryButtonIconSizeUnit || 'px';
		cssRules.push(`${selector} .tertiary-button .icon { font-size: ${attributes.tertiaryButtonIconSize}${unit}; }`);
	}
	if (attributes.tertiaryButtonIconSize_tablet !== undefined) {
		const unit = attributes.tertiaryButtonIconSizeUnit || 'px';
		tabletRules.push(`${selector} .tertiary-button .icon { font-size: ${attributes.tertiaryButtonIconSize_tablet}${unit}; }`);
	}
	if (attributes.tertiaryButtonIconSize_mobile !== undefined) {
		const unit = attributes.tertiaryButtonIconSizeUnit || 'px';
		mobileRules.push(`${selector} .tertiary-button .icon { font-size: ${attributes.tertiaryButtonIconSize_mobile}${unit}; }`);
	}

	if (attributes.tertiaryButtonBackground) {
		cssRules.push(`${selector} .tertiary-button { background-color: ${attributes.tertiaryButtonBackground}; }`);
	}

	const tertiaryButtonBorder = generateBorderCSS({
		borderType: attributes.tertiaryButtonBorderType,
		borderWidth: attributes.tertiaryButtonBorderWidth,
		borderColor: attributes.tertiaryButtonBorderColor,
	});
	if (tertiaryButtonBorder) {
		cssRules.push(`${selector} .tertiary-button { ${tertiaryButtonBorder} }`);
	}

	if (attributes.tertiaryButtonRadius !== undefined) {
		const unit = attributes.tertiaryButtonRadiusUnit || 'px';
		cssRules.push(`${selector} .tertiary-button { border-radius: ${attributes.tertiaryButtonRadius}${unit}; }`);
	}
	if (attributes.tertiaryButtonRadius_tablet !== undefined) {
		const unit = attributes.tertiaryButtonRadiusUnit || 'px';
		tabletRules.push(`${selector} .tertiary-button { border-radius: ${attributes.tertiaryButtonRadius_tablet}${unit}; }`);
	}
	if (attributes.tertiaryButtonRadius_mobile !== undefined) {
		const unit = attributes.tertiaryButtonRadiusUnit || 'px';
		mobileRules.push(`${selector} .tertiary-button { border-radius: ${attributes.tertiaryButtonRadius_mobile}${unit}; }`);
	}

	const tertiaryButtonTypoCSS = generateTypographyCSS(
		attributes.tertiaryButtonTypography
	);
	if (tertiaryButtonTypoCSS) {
		cssRules.push(`${selector} .tertiary-button { ${tertiaryButtonTypoCSS} }`);
	}

	if (attributes.tertiaryButtonTextColor) {
		cssRules.push(`${selector} .tertiary-button { color: ${attributes.tertiaryButtonTextColor}; }`);
	}

	// Hover state
	if (attributes.tertiaryButtonHoverIconColor) {
		cssRules.push(`${selector} .tertiary-button:hover .icon { color: ${attributes.tertiaryButtonHoverIconColor}; }`);
	}

	if (attributes.tertiaryButtonHoverBackground) {
		cssRules.push(`${selector} .tertiary-button:hover { background-color: ${attributes.tertiaryButtonHoverBackground}; }`);
	}

	if (attributes.tertiaryButtonHoverBorderColor) {
		cssRules.push(`${selector} .tertiary-button:hover { border-color: ${attributes.tertiaryButtonHoverBorderColor}; }`);
	}

	if (attributes.tertiaryButtonHoverTextColor) {
		cssRules.push(`${selector} .tertiary-button:hover { color: ${attributes.tertiaryButtonHoverTextColor}; }`);
	}

	// ============================================
	// 10. NO MESSAGES / NO CHAT SELECTED
	// ============================================

	if (attributes.emptyIconSize !== undefined) {
		const unit = attributes.emptyIconSizeUnit || 'px';
		cssRules.push(`${selector} .empty-state .icon { font-size: ${attributes.emptyIconSize}${unit}; }`);
	}
	if (attributes.emptyIconSize_tablet !== undefined) {
		const unit = attributes.emptyIconSizeUnit || 'px';
		tabletRules.push(`${selector} .empty-state .icon { font-size: ${attributes.emptyIconSize_tablet}${unit}; }`);
	}
	if (attributes.emptyIconSize_mobile !== undefined) {
		const unit = attributes.emptyIconSizeUnit || 'px';
		mobileRules.push(`${selector} .empty-state .icon { font-size: ${attributes.emptyIconSize_mobile}${unit}; }`);
	}

	if (attributes.emptyIconColor) {
		cssRules.push(`${selector} .empty-state .icon { color: ${attributes.emptyIconColor}; }`);
	}

	if (attributes.emptyTitleColor) {
		cssRules.push(`${selector} .empty-state .title { color: ${attributes.emptyTitleColor}; }`);
	}

	const emptyTitleTypoCSS = generateTypographyCSS(attributes.emptyTitleTypography);
	if (emptyTitleTypoCSS) {
		cssRules.push(`${selector} .empty-state .title { ${emptyTitleTypoCSS} }`);
	}

	// ============================================
	// 11. LOADING
	// ============================================

	if (attributes.loadingColor1) {
		cssRules.push(`${selector} .loader { --color-1: ${attributes.loadingColor1}; }`);
	}

	if (attributes.loadingColor2) {
		cssRules.push(`${selector} .loader { --color-2: ${attributes.loadingColor2}; }`);
	}

	// ============================================
	// Combine CSS with media queries
	// ============================================
	let finalCSS = '';
	if (cssRules.length > 0) {
		finalCSS += cssRules.join('\n');
	}
	if (tabletRules.length > 0) {
		finalCSS += `\n@media (max-width: 1024px) {\n${tabletRules.join('\n')}\n}`;
	}
	if (mobileRules.length > 0) {
		finalCSS += `\n@media (max-width: 767px) {\n${mobileRules.join('\n')}\n}`;
	}

	return finalCSS;
}
