/**
 * Cart Summary Block - Save Function (Plan C+)
 *
 * Saves static HTML with vxconfig JSON for React hydration.
 * This eliminates the need for render.php (server-side PHP rendering).
 *
 * @package VoxelFSE
 */

import { useBlockProps } from '@wordpress/block-editor';
import {
	getAdvancedVoxelTabProps,
	renderBackgroundElements,
} from '../../shared/utils';
import { generateCartSummaryStyles } from './styles';
import { getCartIcon } from './shared/iconDefaults';
import type { SaveProps, CartSummaryVxConfig } from './types';

function createSaveFn(includePlaceholder: boolean) {
	return function save({ attributes }: SaveProps) {
		const blockId = attributes.blockId || 'cart-summary';

		// Use shared utility for AdvancedTab + VoxelTab wiring
		const advancedProps = getAdvancedVoxelTabProps(attributes, {
			blockId,
			baseClass: 'vx-cart-summary-widget voxel-fse-cart-summary-frontend',
			selectorPrefix: 'voxel-fse-cart-summary',
		});

		// Generate CSS for Style tab controls
		const styleCSS = generateCartSummaryStyles(attributes, blockId);

		const blockProps = (useBlockProps as any).save({
			id: advancedProps.elementId,
			className: advancedProps.className,
			style: advancedProps.styles,
			'data-block-type': 'cart-summary',
			// Headless-ready: Visibility rules configuration
			'data-visibility-behavior': attributes['visibilityBehavior'] || undefined,
			'data-visibility-rules': attributes['visibilityRules']?.length
				? JSON.stringify(attributes['visibilityRules'])
				: undefined,
			// Headless-ready: Loop element configuration
			'data-loop-source': attributes['loopSource'] || undefined,
			'data-loop-property': attributes['loopProperty'] || undefined,
			'data-loop-limit': attributes['loopLimit'] || undefined,
			'data-loop-offset': attributes['loopOffset'] || undefined,
			...advancedProps.customAttrs,
		});

		// Build vxconfig JSON with all frontend-required attributes
		const vxConfig: CartSummaryVxConfig = {
			// Icons — uses shared CART_ICON_DEFAULTS as fallbacks
			icons: {
				deleteIcon: getCartIcon(attributes.deleteIcon, 'deleteIcon'),
				noProductsIcon: getCartIcon(attributes.noProductsIcon, 'noProductsIcon'),
				loginIcon: getCartIcon(attributes.loginIcon, 'loginIcon'),
				emailIcon: getCartIcon(attributes.emailIcon, 'emailIcon'),
				userIcon: getCartIcon(attributes.userIcon, 'userIcon'),
				uploadIcon: getCartIcon(attributes.uploadIcon, 'uploadIcon'),
				shippingIcon: getCartIcon(attributes.shippingIcon, 'shippingIcon'),
				minusIcon: getCartIcon(attributes.minusIcon, 'minusIcon'),
				plusIcon: getCartIcon(attributes.plusIcon, 'plusIcon'),
				checkoutIcon: getCartIcon(attributes.checkoutIcon, 'checkoutIcon'),
				continueIcon: getCartIcon(attributes.continueIcon, 'continueIcon'),
			},

			// General styling
			sectionSpacing: attributes.sectionSpacing || undefined,
			titleColor: attributes.titleColor || undefined,

			// Empty cart
			emptyCartGap: attributes.emptyCartGap ?? undefined,
			emptyCartIconSize: attributes.emptyCartIconSize ?? undefined,
			emptyCartIconColor: attributes.emptyCartIconColor || undefined,
			emptyCartTextColor: attributes.emptyCartTextColor || undefined,

			// Primary button
			primaryBtnTextColor: attributes.primaryBtnTextColor || undefined,
			primaryBtnBgColor: attributes.primaryBtnBgColor || undefined,
			primaryBtnBorderColor: attributes.primaryBtnBorderColor || undefined,
			primaryBtnRadius: attributes.primaryBtnRadius ?? undefined,
			primaryBtnIconSize: attributes.primaryBtnIconSize ?? undefined,
			primaryBtnIconColor: attributes.primaryBtnIconColor || undefined,
			primaryBtnIconSpacing: attributes.primaryBtnIconSpacing ?? undefined,
			primaryBtnTextColorHover: attributes.primaryBtnTextColorHover || undefined,
			primaryBtnBgColorHover: attributes.primaryBtnBgColorHover || undefined,
			primaryBtnBorderColorHover: attributes.primaryBtnBorderColorHover || undefined,
			primaryBtnIconColorHover: attributes.primaryBtnIconColorHover || undefined,

			// Secondary button
			secondaryBtnTextColor: attributes.secondaryBtnTextColor || undefined,
			secondaryBtnBgColor: attributes.secondaryBtnBgColor || undefined,
			secondaryBtnBorderColor: attributes.secondaryBtnBorderColor || undefined,
			secondaryBtnRadius: attributes.secondaryBtnRadius ?? undefined,
			secondaryBtnIconSize: attributes.secondaryBtnIconSize ?? undefined,
			secondaryBtnIconColor: attributes.secondaryBtnIconColor || undefined,
			secondaryBtnIconSpacing: attributes.secondaryBtnIconSpacing ?? undefined,
			secondaryBtnTextColorHover: attributes.secondaryBtnTextColorHover || undefined,
			secondaryBtnBgColorHover: attributes.secondaryBtnBgColorHover || undefined,
			secondaryBtnBorderColorHover: attributes.secondaryBtnBorderColorHover || undefined,
			secondaryBtnIconColorHover: attributes.secondaryBtnIconColorHover || undefined,

			// Loading
			loaderColor1: attributes.loaderColor1 || undefined,
			loaderColor2: attributes.loaderColor2 || undefined,

			// Checkbox
			checkboxBorderColor: attributes.checkboxBorderColor || undefined,
			checkboxSelectedBgColor: attributes.checkboxSelectedBgColor || undefined,

			// Cart styling
			cartItemSpacing: attributes.cartItemSpacing ?? undefined,
			cartItemContentSpacing: attributes.cartItemContentSpacing ?? undefined,
			cartPictureSize: attributes.cartPictureSize ?? undefined,
			cartPictureRadius: attributes.cartPictureRadius ?? undefined,
			cartTitleColor: attributes.cartTitleColor || undefined,
			cartSubtitleColor: attributes.cartSubtitleColor || undefined,

			// Icon button
			iconBtnColor: attributes.iconBtnColor || undefined,
			iconBtnBgColor: attributes.iconBtnBgColor || undefined,
			iconBtnBorderColor: attributes.iconBtnBorderColor || undefined,
			iconBtnRadius: attributes.iconBtnRadius ?? undefined,
			iconBtnValueSize: attributes.iconBtnValueSize ?? undefined,
			iconBtnValueColor: attributes.iconBtnValueColor || undefined,
			iconBtnColorHover: attributes.iconBtnColorHover || undefined,
			iconBtnBgColorHover: attributes.iconBtnBgColorHover || undefined,
			iconBtnBorderColorHover: attributes.iconBtnBorderColorHover || undefined,

			// Dropdown button
			dropdownBgColor: attributes.dropdownBgColor || undefined,
			dropdownTextColor: attributes.dropdownTextColor || undefined,
			dropdownBorderColor: attributes.dropdownBorderColor || undefined,
			dropdownRadius: attributes.dropdownRadius ?? undefined,
			dropdownHeight: attributes.dropdownHeight ?? undefined,
			dropdownIconColor: attributes.dropdownIconColor || undefined,
			dropdownIconSize: attributes.dropdownIconSize ?? undefined,
			dropdownIconSpacing: attributes.dropdownIconSpacing ?? undefined,
			dropdownHideChevron: attributes.dropdownHideChevron || undefined,
			dropdownChevronColor: attributes.dropdownChevronColor || undefined,
			dropdownBgColorHover: attributes.dropdownBgColorHover || undefined,
			dropdownTextColorHover: attributes.dropdownTextColorHover || undefined,
			dropdownBorderColorHover: attributes.dropdownBorderColorHover || undefined,
			dropdownIconColorHover: attributes.dropdownIconColorHover || undefined,
			dropdownBgColorFilled: attributes.dropdownBgColorFilled || undefined,
			dropdownTextColorFilled: attributes.dropdownTextColorFilled || undefined,
			dropdownIconColorFilled: attributes.dropdownIconColorFilled || undefined,
			dropdownBorderColorFilled: attributes.dropdownBorderColorFilled || undefined,

			// Ship to
			shipToTextColor: attributes.shipToTextColor || undefined,
			shipToLinkColor: attributes.shipToLinkColor || undefined,

			// Section divider
			dividerTextColor: attributes.dividerTextColor || undefined,
			dividerLineColor: attributes.dividerLineColor || undefined,
			dividerLineHeight: attributes.dividerLineHeight ?? undefined,

			// Subtotal
			subtotalTextColor: attributes.subtotalTextColor || undefined,

			// Field label
			fieldLabelColor: attributes.fieldLabelColor || undefined,
			fieldLabelLinkColor: attributes.fieldLabelLinkColor || undefined,

			// Input
			inputPlaceholderColor: attributes.inputPlaceholderColor || undefined,
			inputValueColor: attributes.inputValueColor || undefined,
			inputBgColor: attributes.inputBgColor || undefined,
			inputBorderColor: attributes.inputBorderColor || undefined,
			inputHeight: attributes.inputHeight ?? undefined,
			inputRadius: attributes.inputRadius ?? undefined,
			inputIconColor: attributes.inputIconColor || undefined,
			inputIconSize: attributes.inputIconSize ?? undefined,
			inputIconMargin: attributes.inputIconMargin ?? undefined,
			textareaRadius: attributes.textareaRadius ?? undefined,
			inputBgColorHover: attributes.inputBgColorHover || undefined,
			inputBorderColorHover: attributes.inputBorderColorHover || undefined,
			inputPlaceholderColorHover: attributes.inputPlaceholderColorHover || undefined,
			inputValueColorHover: attributes.inputValueColorHover || undefined,
			inputIconColorHover: attributes.inputIconColorHover || undefined,
			inputBgColorActive: attributes.inputBgColorActive || undefined,
			inputBorderColorActive: attributes.inputBorderColorActive || undefined,
			inputPlaceholderColorActive: attributes.inputPlaceholderColorActive || undefined,
			inputValueColorActive: attributes.inputValueColorActive || undefined,

			// Cards
			cardsGap: attributes.cardsGap ?? undefined,
			cardsBgColor: attributes.cardsBgColor || undefined,
			cardsBorderColor: attributes.cardsBorderColor || undefined,
			cardsRadius: attributes.cardsRadius ?? undefined,
			cardsPrimaryColor: attributes.cardsPrimaryColor || undefined,
			cardsSecondaryColor: attributes.cardsSecondaryColor || undefined,
			cardsPriceColor: attributes.cardsPriceColor || undefined,
			cardsImageRadius: attributes.cardsImageRadius ?? undefined,
			cardsImageSize: attributes.cardsImageSize ?? undefined,
			cardsSelectedBgColor: attributes.cardsSelectedBgColor || undefined,
			cardsSelectedBorderColor: attributes.cardsSelectedBorderColor || undefined,

			// File/Gallery
			fileFieldGap: attributes.fileFieldGap ?? undefined,
			fileSelectIconColor: attributes.fileSelectIconColor || undefined,
			fileSelectIconSize: attributes.fileSelectIconSize ?? undefined,
			fileSelectBgColor: attributes.fileSelectBgColor || undefined,
			fileSelectBorderColor: attributes.fileSelectBorderColor || undefined,
			fileSelectRadius: attributes.fileSelectRadius ?? undefined,
			fileSelectTextColor: attributes.fileSelectTextColor || undefined,
			addedFileRadius: attributes.addedFileRadius ?? undefined,
			addedFileBgColor: attributes.addedFileBgColor || undefined,
			addedFileIconColor: attributes.addedFileIconColor || undefined,
			addedFileIconSize: attributes.addedFileIconSize ?? undefined,
			addedFileTextColor: attributes.addedFileTextColor || undefined,
			removeFileBgColor: attributes.removeFileBgColor || undefined,
			removeFileBgColorHover: attributes.removeFileBgColorHover || undefined,
			removeFileColor: attributes.removeFileColor || undefined,
			removeFileColorHover: attributes.removeFileColorHover || undefined,
			removeFileRadius: attributes.removeFileRadius ?? undefined,
			removeFileSize: attributes.removeFileSize ?? undefined,
			removeFileIconSize: attributes.removeFileIconSize ?? undefined,
			fileSelectIconColorHover: attributes.fileSelectIconColorHover || undefined,
			fileSelectBgColorHover: attributes.fileSelectBgColorHover || undefined,
			fileSelectBorderColorHover: attributes.fileSelectBorderColorHover || undefined,
			fileSelectTextColorHover: attributes.fileSelectTextColorHover || undefined,
		};

		return (
			<div {...blockProps}>
				{/* Advanced Tab + VoxelTab CSS */}
				{advancedProps.responsiveCSS && (
					<style dangerouslySetInnerHTML={{ __html: advancedProps.responsiveCSS }} />
				)}
				{/* Style Tab CSS */}
				{styleCSS && (
					<style dangerouslySetInnerHTML={{ __html: styleCSS }} />
				)}
				{/* Voxel vxconfig pattern - configuration stored in JSON script */}
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
				/>

				{/* Background elements: video, slideshow, overlay, shape dividers */}
				{renderBackgroundElements(attributes, false, undefined, undefined, advancedProps.uniqueSelector)}

				{/* Placeholder for React hydration */}
				{includePlaceholder && (
					<div
						className="voxel-fse-block-placeholder"
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							flexDirection: 'column',
							gap: '8px',
							backgroundColor: '#f0f0f0',
							padding: '24px',
							minHeight: '120px',
							borderRadius: '4px',
						}}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							width="32"
							height="32"
							fill="currentColor"
							style={{ opacity: 0.4 }}
						>
							<path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
						</svg>
						<span style={{ opacity: 0.6, fontSize: '14px' }}>Cart Summary (VX)</span>
					</div>
				)}
			</div>
		);
	};
}

export default createSaveFn(false);
export const saveWithPlaceholder = createSaveFn(true);
