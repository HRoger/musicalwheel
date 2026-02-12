/**
 * Cart Summary Block - Frontend Entry Point (Plan C+ Hybrid)
 *
 * Hydrates React by reading vxconfig from save.tsx output.
 * Fetches cart data from REST API and AJAX endpoints.
 *
 * Evidence:
 * - Widget: themes/voxel/app/widgets/cart-summary.php (2719 lines)
 * - Template: themes/voxel/templates/widgets/cart-summary.php
 *
 * @package VoxelFSE
 *
 * ============================================================================
 * VOXEL PARITY STATUS
 * ============================================================================
 *
 * Reference: themes/voxel/app/widgets/cart-summary.php (2719 lines)
 *
 * ICONS (Content Tab):
 * ✅ ts_delete_icon - Delete/remove item icon
 * ✅ nostock_ico - No products/empty cart icon
 * ✅ ts_enter - Login icon
 * ✅ auth_email_ico - Email icon (quick register)
 * ✅ auth_user_ico - User icon (quick register)
 * ✅ ts_upload_ico - Upload icon (file field)
 * ✅ ts_shipping_ico - Shipping icon
 * ✅ ts_minus_icon - Minus/decrease quantity icon
 * ✅ ts_plus_icon - Plus/increase quantity icon
 * ✅ ts_checkout_icon - Checkout button icon
 * ✅ ts_continue_icon - Continue shopping icon
 *
 * GENERAL (Style Tab):
 * ✅ field_spacing_value - Section spacing (responsive slider)
 * ✅ wt_typo - Widget title typography (group control)
 * ✅ wt_color - Widget title color
 *
 * EMPTY CART:
 * ✅ ts_nopost_content_Gap - Content gap (responsive slider)
 * ✅ ts_nopost_ico_size - Icon size (responsive slider)
 * ✅ ts_nopost_ico_col - Icon color
 * ✅ ts_nopost_typo - Typography (group control)
 * ✅ ts_nopost_typo_col - Text color
 *
 * PRIMARY BUTTON (ts-btn-2):
 * ✅ ts_submit_btn_typo - Typography (group control)
 * ✅ ts_sf_form_btn_border - Border (group control)
 * ✅ ts_sf_form_btn_radius - Border radius (responsive slider)
 * ✅ ts_sf_form_btn_shadow - Box shadow (group control)
 * ✅ ts_sf_form_btn_c - Text color
 * ✅ ts_sf_form_btn_bg - Background color
 * ✅ ts_sf_form_btn_icon_size - Icon size (responsive slider)
 * ✅ ts_sf_form_btn_icon_color - Icon color
 * ✅ ts_sf_form_btn_icon_spacing - Icon spacing (responsive slider)
 * ✅ ts_sf_form_btn_c_h - Text color (hover)
 * ✅ ts_sf_form_btn_bg_h - Background color (hover)
 * ✅ ts_sf_form_btn_border_h - Border color (hover)
 * ✅ ts_sf_form_btn_shadow_h - Box shadow (hover)
 * ✅ ts_sf_form_btn_icon_color_h - Icon color (hover)
 *
 * SECONDARY BUTTON (ts-btn-1):
 * ✅ scnd_btn_typo - Typography (group control)
 * ✅ scnd_btn_radius - Border radius (responsive slider)
 * ✅ scnd_btn_c - Text color
 * ✅ scnd_btn_padding - Padding (responsive dimensions)
 * ✅ scnd_btn_bg - Background color
 * ✅ scnd_btn_border - Border (group control)
 * ✅ scnd_btn_icon_size - Icon size (responsive slider)
 * ✅ scnd_btn_icon_pad - Icon spacing (responsive slider)
 * ✅ scnd_btn_icon_color - Icon color
 * ✅ scnd_btn_c_h - Text color (hover)
 * ✅ scnd_btn_bg_h - Background color (hover)
 * ✅ scnd_btn_border_h - Border color (hover)
 * ✅ scnd_btn_icon_color_h - Icon color (hover)
 *
 * LOADING:
 * ✅ tm_color1 - Loader color 1
 * ✅ tm_color2 - Loader color 2
 *
 * CHECKBOXES:
 * ✅ checkbox_border_color - Border color
 * ✅ ts_checkbox_checked - Selected background color
 * ✅ ts_checkbox_shadow - Selected box shadow
 *
 * CART STYLING:
 * ✅ cart_spacing - Cart items spacing (responsive slider)
 * ✅ cart_item_spacing - Item content spacing (responsive slider)
 * ✅ ts_cart_img_size - Picture size (responsive slider)
 * ✅ ts_cart_img_radius - Picture radius (responsive slider)
 * ✅ ts_cart_title_typo - Title typography (group control)
 * ✅ ts_cart_title_col - Title color
 * ✅ ts_cart_sub_typo - Subtitle typography (group control)
 * ✅ ts_cart_sub_col - Subtitle color
 *
 * ICON BUTTON:
 * ✅ ts_cart_btn_color - Icon color
 * ✅ ts_cart_btn_bg - Background color
 * ✅ ts_cart_btn_border - Border (group control)
 * ✅ ts_cart_btn_radius - Border radius (responsive slider)
 * ✅ ts_cart_btn_val_size - Value size (responsive slider)
 * ✅ ts_cart_btn_val_col - Value color
 * ✅ ts_cart_btn_color_h - Icon color (hover)
 * ✅ ts_cart_btn_bg_h - Background color (hover)
 * ✅ ts_cart_btn_border_h - Border color (hover)
 *
 * DROPDOWN BUTTON:
 * ✅ pg_trs - Typography (group control)
 * ✅ pg_trs_shadow - Box shadow (group control)
 * ✅ pg_trs_bg - Background color
 * ✅ pg_trs_text - Text color
 * ✅ pg_trs_border - Border (group control)
 * ✅ pg_trs_radius - Border radius (responsive slider)
 * ✅ pg_trs_height - Height (responsive slider)
 * ✅ pg_trs_ico - Icon color
 * ✅ pg_trs_ico_size - Icon size (responsive slider)
 * ✅ pg_trs_ico_spacing - Icon spacing (responsive slider)
 * ✅ pg_trs_chevron_hide - Hide chevron (switcher)
 * ✅ pg_trs_chevron_col - Chevron color
 * ✅ pg_trs_bg_h - Background (hover)
 * ✅ pg_trs_text_h - Text color (hover)
 * ✅ pg_trs_border_h - Border color (hover)
 * ✅ pg_trs_ico_h - Icon color (hover)
 * ✅ pg_trs_shadow_h - Box shadow (hover)
 * ✅ pg_trs_typo_f - Typography (filled)
 * ✅ pg_trs_bg_f - Background (filled)
 * ✅ pg_trs_text_f - Text color (filled)
 * ✅ pg_trs_ico_f - Icon color (filled)
 * ✅ pg_trs_border_f - Border color (filled)
 * ✅ pg_trs_shadow_f - Box shadow (filled)
 *
 * SHIP TO:
 * ✅ shipto_typo - Typography (group control)
 * ✅ shipto_color - Text color
 * ✅ shipto_link_color - Link color
 *
 * SECTION DIVIDER:
 * ✅ sd_typo - Typography (group control)
 * ✅ sd_color - Text color
 * ✅ sd_div_color - Divider line color
 * ✅ sd_div_height - Divider line height
 *
 * SUBTOTAL:
 * ✅ calc_text_total - Typography (group control)
 * ✅ calc_text_color_total - Text color
 *
 * FIELD LABEL:
 * ✅ auth_label_typo - Typography (group control)
 * ✅ auth_label_col - Text color
 * ✅ auth_label_link - Link color
 *
 * INPUT & TEXTAREA (Normal):
 * ✅ auth_placeholder_typo - Placeholder typography
 * ✅ auth_placeholder_color - Placeholder color
 * ✅ auth_input_typo - Value typography
 * ✅ auth_input_color - Value color
 * ✅ auth_input_bg - Background color
 * ✅ auth_input_border - Border (group control)
 * ✅ auth_input_padding - Padding (responsive dimensions)
 * ✅ auth_input_height - Height (responsive slider)
 * ✅ auth_input_radius - Border radius (responsive slider)
 * ✅ auth_textarea_padding - Textarea padding (responsive dimensions)
 * ✅ auth_textarea_radius - Textarea radius (responsive slider)
 * ✅ auth_icon_color - Input icon color
 * ✅ auth_icon_size - Input icon size (responsive slider)
 * ✅ auth_icon_margin - Input icon margin (responsive slider)
 *
 * INPUT & TEXTAREA (Hover):
 * ✅ auth_input_bg_h - Background (hover)
 * ✅ auth_input_border_h - Border color (hover)
 * ✅ auth_placeholder_color_h - Placeholder color (hover)
 * ✅ auth_input_color_h - Value color (hover)
 * ✅ auth_icon_color_h - Icon color (hover)
 *
 * INPUT & TEXTAREA (Active):
 * ✅ auth_input_bg_a - Background (active)
 * ✅ auth_input_border_a - Border color (active)
 * ✅ auth_placeholder_color_a - Placeholder color (active)
 * ✅ auth_input_color_a - Value color (active)
 *
 * CARDS (Normal):
 * ✅ ts_method_cards_gap - Gap (responsive slider)
 * ✅ ts_method_cards_bg - Background color
 * ✅ ts_method_cards_border - Border (group control)
 * ✅ ts_method_cards_radius - Border radius (responsive slider)
 * ✅ ts_method_cards_typo - Primary typography (group control)
 * ✅ ts_method_cards_col - Primary color
 * ✅ ts_method_cards_scnd_typo - Secondary typography (group control)
 * ✅ ts_method_cards_scnd_col - Secondary color
 * ✅ ts_method_cards_price_typo - Price typography (group control)
 * ✅ ts_method_cards_price_col - Price color
 * ✅ ts_method_cards_img_radius - Image radius (responsive slider)
 * ✅ ts_method_cards_img_size - Image size (responsive slider)
 *
 * CARDS (Selected):
 * ✅ ts_method_cards_bg_a - Background (selected)
 * ✅ ts_method_cards_border_a - Border color (selected)
 * ✅ ts_method_cards_shadow_a - Box shadow (selected)
 * ✅ ts_method_cards_typo_a - Typography (selected)
 *
 * FILE FIELD (Applied from Option_Groups\File_Field):
 * ✅ file_field_gap - Field gap (responsive slider)
 * ✅ file_select_icon_color - Select icon color
 * ✅ file_select_icon_size - Select icon size (responsive slider)
 * ✅ file_select_bg - Select background
 * ✅ file_select_border - Select border (group control)
 * ✅ file_select_radius - Select radius (responsive slider)
 * ✅ file_select_typo - Select typography (group control)
 * ✅ file_select_text_color - Select text color
 * ✅ added_file_radius - Added file radius (responsive slider)
 * ✅ added_file_bg - Added file background
 * ✅ added_file_icon_color - Added file icon color
 * ✅ added_file_icon_size - Added file icon size (responsive slider)
 * ✅ added_file_typo - Added file typography (group control)
 * ✅ added_file_text_color - Added file text color
 * ✅ remove_file_bg - Remove button background
 * ✅ remove_file_bg_h - Remove button background (hover)
 * ✅ remove_file_color - Remove button color
 * ✅ remove_file_color_h - Remove button color (hover)
 * ✅ remove_file_radius - Remove button radius (responsive slider)
 * ✅ remove_file_size - Remove button size (responsive slider)
 * ✅ remove_file_icon_size - Remove icon size (responsive slider)
 * ✅ file_select_icon_color_h - Select icon color (hover)
 * ✅ file_select_bg_h - Select background (hover)
 * ✅ file_select_border_h - Select border color (hover)
 * ✅ file_select_text_color_h - Select text color (hover)
 *
 * HTML STRUCTURE:
 * ✅ .ts-form - Form container
 * ✅ .vx-cart-summary-widget - Main widget container
 * ✅ .ts-empty-cart - Empty cart state
 * ✅ .ts-cart-items - Cart items list
 * ✅ .ts-cart-item - Individual cart item
 * ✅ .ts-cart-item-image - Item image
 * ✅ .ts-cart-item-details - Item details
 * ✅ .ts-cart-item-title - Item title
 * ✅ .ts-cart-item-subtitle - Item subtitle
 * ✅ .ts-cart-item-quantity - Quantity controls
 * ✅ .ts-cart-item-price - Item price
 * ✅ .ts-cart-item-remove - Remove button
 * ✅ .ts-cart-shipping - Shipping section
 * ✅ .ts-cart-subtotal - Subtotal section
 * ✅ .ts-cart-checkout - Checkout button
 * ✅ .ts-quick-register - Guest checkout registration
 * ✅ .ts-order-notes - Order notes section
 *
 * REST API:
 * ✅ voxel-fse/v1/cart/config - Cart configuration endpoint
 *
 * AJAX ENDPOINTS (via ?vx=1):
 * ✅ products.get_cart_items - Fetch cart items (logged in)
 * ✅ products.get_guest_cart_items - Fetch guest cart items
 * ✅ products.update_cart_item_quantity - Update quantity (logged in)
 * ✅ products.update_guest_cart_item_quantity - Update guest quantity
 * ✅ products.remove_cart_item - Remove cart item
 *
 * MULTISITE SUPPORT:
 * ✅ getRestBaseUrl() - Handles subdirectory multisite for REST
 * ✅ getSiteBaseUrl() - Handles subdirectory multisite for AJAX
 *
 * NEXT.JS READINESS:
 * ✅ normalizeConfig() handles both vxconfig and REST API formats
 * ✅ Async data fetching with proper error handling
 * ✅ TypeScript strict mode
 * ✅ React hydration pattern
 * ✅ localStorage for guest cart persistence
 *
 * ============================================================================
 */

import { createRoot } from 'react-dom/client';
import { useState, useEffect, useCallback } from 'react';
import CartSummaryComponent from './shared/CartSummaryComponent';
import PromoteScreen from './shared/PromoteScreen';

import type {
	CartSummaryBlockAttributes,
	CartSummaryVxConfig,
	CartConfig,
	CartItem,
	ShippingState,
	QuickRegisterState,
	OrderNotesState,
	PromoteConfig,
} from './types';
import type { IconValue } from '@shared/controls/IconPickerControl';
import { getSiteBaseUrl, getRestBaseUrl } from '@shared/utils/siteUrl';

/**
 * Normalize config from various sources (vxconfig, REST API, data attributes)
 * Handles both camelCase (FSE) and snake_case (Voxel/REST) formats
 *
 * NEXT.JS READINESS: This function enables headless architecture by
 * normalizing config from any source to a consistent format.
 */
function normalizeConfig(raw: Record<string, unknown>): CartSummaryVxConfig {
	// Helper for string normalization
	const normalizeString = (val: unknown, fallback: string): string => {
		if (typeof val === 'string') return val;
		if (typeof val === 'number') return String(val);
		return fallback;
	};

	// Helper for number normalization
	const normalizeNumber = (val: unknown, fallback: number | null): number | null => {
		if (typeof val === 'number') return val;
		if (typeof val === 'string') {
			const parsed = parseFloat(val);
			if (!isNaN(parsed)) return parsed;
		}
		if (val === null || val === undefined) return fallback;
		return fallback;
	};

	// Helper for boolean normalization
	const normalizeBoolean = (val: unknown, fallback: boolean): boolean => {
		if (typeof val === 'boolean') return val;
		if (val === 'true' || val === '1' || val === 1) return true;
		if (val === 'false' || val === '0' || val === 0) return false;
		return fallback;
	};

	// Helper for icon normalization (IconValue object)
	const normalizeIcon = (val: unknown, fallback: IconValue): IconValue => {
		if (val && typeof val === 'object') {
			const obj = val as Record<string, unknown>;
			return {
				library: normalizeString(obj.library, fallback.library) as IconValue['library'],
				value: normalizeString(obj.value, fallback.value),
			};
		}
		return fallback;
	};

	// Default icon values
	const defaultIcon: IconValue = { library: '', value: '' };

	// Normalize icons object - supports both camelCase (FSE) and snake_case (Voxel)
	const normalizeIcons = (val: unknown): CartSummaryVxConfig['icons'] => {
		if (!val || typeof val !== 'object') {
			return {
				deleteIcon: defaultIcon,
				noProductsIcon: defaultIcon,
				loginIcon: defaultIcon,
				emailIcon: defaultIcon,
				userIcon: defaultIcon,
				uploadIcon: defaultIcon,
				shippingIcon: defaultIcon,
				minusIcon: defaultIcon,
				plusIcon: defaultIcon,
				checkoutIcon: defaultIcon,
				continueIcon: defaultIcon,
			};
		}
		const obj = val as Record<string, unknown>;
		return {
			deleteIcon: normalizeIcon(obj.deleteIcon ?? obj.delete_icon ?? obj.ts_delete_icon, defaultIcon),
			noProductsIcon: normalizeIcon(obj.noProductsIcon ?? obj.no_products_icon ?? obj.nostock_ico, defaultIcon),
			loginIcon: normalizeIcon(obj.loginIcon ?? obj.login_icon ?? obj.ts_enter, defaultIcon),
			emailIcon: normalizeIcon(obj.emailIcon ?? obj.email_icon ?? obj.auth_email_ico, defaultIcon),
			userIcon: normalizeIcon(obj.userIcon ?? obj.user_icon ?? obj.auth_user_ico, defaultIcon),
			uploadIcon: normalizeIcon(obj.uploadIcon ?? obj.upload_icon ?? obj.ts_upload_ico, defaultIcon),
			shippingIcon: normalizeIcon(obj.shippingIcon ?? obj.shipping_icon ?? obj.ts_shipping_ico, defaultIcon),
			minusIcon: normalizeIcon(obj.minusIcon ?? obj.minus_icon ?? obj.ts_minus_icon, defaultIcon),
			plusIcon: normalizeIcon(obj.plusIcon ?? obj.plus_icon ?? obj.ts_plus_icon, defaultIcon),
			checkoutIcon: normalizeIcon(obj.checkoutIcon ?? obj.checkout_icon ?? obj.ts_checkout_icon, defaultIcon),
			continueIcon: normalizeIcon(obj.continueIcon ?? obj.continue_icon ?? obj.ts_continue_icon, defaultIcon),
		};
	};

	return {
		// Icons
		icons: normalizeIcons(raw.icons),

		// General
		sectionSpacing: normalizeNumber(raw.sectionSpacing ?? raw.section_spacing ?? raw.field_spacing_value, null) ?? undefined,
		titleColor: normalizeString(raw.titleColor ?? raw.title_color ?? raw.wt_color, '') || undefined,

		// Empty cart
		emptyCartGap: normalizeNumber(raw.emptyCartGap ?? raw.empty_cart_gap ?? raw.ts_nopost_content_Gap, null) ?? undefined,
		emptyCartIconSize: normalizeNumber(raw.emptyCartIconSize ?? raw.empty_cart_icon_size ?? raw.ts_nopost_ico_size, null) ?? undefined,
		emptyCartIconColor: normalizeString(raw.emptyCartIconColor ?? raw.empty_cart_icon_color ?? raw.ts_nopost_ico_col, '') || undefined,
		emptyCartTextColor: normalizeString(raw.emptyCartTextColor ?? raw.empty_cart_text_color ?? raw.ts_nopost_typo_col, '') || undefined,

		// Primary button
		primaryBtnTextColor: normalizeString(raw.primaryBtnTextColor ?? raw.primary_btn_text_color ?? raw.ts_sf_form_btn_c, '') || undefined,
		primaryBtnBgColor: normalizeString(raw.primaryBtnBgColor ?? raw.primary_btn_bg_color ?? raw.ts_sf_form_btn_bg, '') || undefined,
		primaryBtnBorderColor: normalizeString(raw.primaryBtnBorderColor ?? raw.primary_btn_border_color, '') || undefined,
		primaryBtnRadius: normalizeNumber(raw.primaryBtnRadius ?? raw.primary_btn_radius ?? raw.ts_sf_form_btn_radius, null) ?? undefined,
		primaryBtnIconSize: normalizeNumber(raw.primaryBtnIconSize ?? raw.primary_btn_icon_size ?? raw.ts_sf_form_btn_icon_size, null) ?? undefined,
		primaryBtnIconColor: normalizeString(raw.primaryBtnIconColor ?? raw.primary_btn_icon_color ?? raw.ts_sf_form_btn_icon_color, '') || undefined,
		primaryBtnIconSpacing: normalizeNumber(raw.primaryBtnIconSpacing ?? raw.primary_btn_icon_spacing ?? raw.ts_sf_form_btn_icon_spacing, null) ?? undefined,
		primaryBtnTextColorHover: normalizeString(raw.primaryBtnTextColorHover ?? raw.primary_btn_text_color_hover ?? raw.ts_sf_form_btn_c_h, '') || undefined,
		primaryBtnBgColorHover: normalizeString(raw.primaryBtnBgColorHover ?? raw.primary_btn_bg_color_hover ?? raw.ts_sf_form_btn_bg_h, '') || undefined,
		primaryBtnBorderColorHover: normalizeString(raw.primaryBtnBorderColorHover ?? raw.primary_btn_border_color_hover ?? raw.ts_sf_form_btn_border_h, '') || undefined,
		primaryBtnIconColorHover: normalizeString(raw.primaryBtnIconColorHover ?? raw.primary_btn_icon_color_hover ?? raw.ts_sf_form_btn_icon_color_h, '') || undefined,

		// Secondary button
		secondaryBtnTextColor: normalizeString(raw.secondaryBtnTextColor ?? raw.secondary_btn_text_color ?? raw.scnd_btn_c, '') || undefined,
		secondaryBtnBgColor: normalizeString(raw.secondaryBtnBgColor ?? raw.secondary_btn_bg_color ?? raw.scnd_btn_bg, '') || undefined,
		secondaryBtnBorderColor: normalizeString(raw.secondaryBtnBorderColor ?? raw.secondary_btn_border_color, '') || undefined,
		secondaryBtnRadius: normalizeNumber(raw.secondaryBtnRadius ?? raw.secondary_btn_radius ?? raw.scnd_btn_radius, null) ?? undefined,
		secondaryBtnIconSize: normalizeNumber(raw.secondaryBtnIconSize ?? raw.secondary_btn_icon_size ?? raw.scnd_btn_icon_size, null) ?? undefined,
		secondaryBtnIconColor: normalizeString(raw.secondaryBtnIconColor ?? raw.secondary_btn_icon_color ?? raw.scnd_btn_icon_color, '') || undefined,
		secondaryBtnIconSpacing: normalizeNumber(raw.secondaryBtnIconSpacing ?? raw.secondary_btn_icon_spacing ?? raw.scnd_btn_icon_pad, null) ?? undefined,
		secondaryBtnTextColorHover: normalizeString(raw.secondaryBtnTextColorHover ?? raw.secondary_btn_text_color_hover ?? raw.scnd_btn_c_h, '') || undefined,
		secondaryBtnBgColorHover: normalizeString(raw.secondaryBtnBgColorHover ?? raw.secondary_btn_bg_color_hover ?? raw.scnd_btn_bg_h, '') || undefined,
		secondaryBtnBorderColorHover: normalizeString(raw.secondaryBtnBorderColorHover ?? raw.secondary_btn_border_color_hover ?? raw.scnd_btn_border_h, '') || undefined,
		secondaryBtnIconColorHover: normalizeString(raw.secondaryBtnIconColorHover ?? raw.secondary_btn_icon_color_hover ?? raw.scnd_btn_icon_color_h, '') || undefined,

		// Loading
		loaderColor1: normalizeString(raw.loaderColor1 ?? raw.loader_color1 ?? raw.tm_color1, '') || undefined,
		loaderColor2: normalizeString(raw.loaderColor2 ?? raw.loader_color2 ?? raw.tm_color2, '') || undefined,

		// Checkbox
		checkboxBorderColor: normalizeString(raw.checkboxBorderColor ?? raw.checkbox_border_color, '') || undefined,
		checkboxSelectedBgColor: normalizeString(raw.checkboxSelectedBgColor ?? raw.checkbox_selected_bg_color ?? raw.ts_checkbox_checked, '') || undefined,

		// Cart styling
		cartItemSpacing: normalizeNumber(raw.cartItemSpacing ?? raw.cart_item_spacing ?? raw.cart_spacing, null) ?? undefined,
		cartItemContentSpacing: normalizeNumber(raw.cartItemContentSpacing ?? raw.cart_item_content_spacing ?? raw.cart_item_spacing, null) ?? undefined,
		cartPictureSize: normalizeNumber(raw.cartPictureSize ?? raw.cart_picture_size ?? raw.ts_cart_img_size, null) ?? undefined,
		cartPictureRadius: normalizeNumber(raw.cartPictureRadius ?? raw.cart_picture_radius ?? raw.ts_cart_img_radius, null) ?? undefined,
		cartTitleColor: normalizeString(raw.cartTitleColor ?? raw.cart_title_color ?? raw.ts_cart_title_col, '') || undefined,
		cartSubtitleColor: normalizeString(raw.cartSubtitleColor ?? raw.cart_subtitle_color ?? raw.ts_cart_sub_col, '') || undefined,

		// Icon button
		iconBtnColor: normalizeString(raw.iconBtnColor ?? raw.icon_btn_color ?? raw.ts_cart_btn_color, '') || undefined,
		iconBtnBgColor: normalizeString(raw.iconBtnBgColor ?? raw.icon_btn_bg_color ?? raw.ts_cart_btn_bg, '') || undefined,
		iconBtnBorderColor: normalizeString(raw.iconBtnBorderColor ?? raw.icon_btn_border_color, '') || undefined,
		iconBtnRadius: normalizeNumber(raw.iconBtnRadius ?? raw.icon_btn_radius ?? raw.ts_cart_btn_radius, null) ?? undefined,
		iconBtnValueSize: normalizeNumber(raw.iconBtnValueSize ?? raw.icon_btn_value_size ?? raw.ts_cart_btn_val_size, null) ?? undefined,
		iconBtnValueColor: normalizeString(raw.iconBtnValueColor ?? raw.icon_btn_value_color ?? raw.ts_cart_btn_val_col, '') || undefined,
		iconBtnColorHover: normalizeString(raw.iconBtnColorHover ?? raw.icon_btn_color_hover ?? raw.ts_cart_btn_color_h, '') || undefined,
		iconBtnBgColorHover: normalizeString(raw.iconBtnBgColorHover ?? raw.icon_btn_bg_color_hover ?? raw.ts_cart_btn_bg_h, '') || undefined,
		iconBtnBorderColorHover: normalizeString(raw.iconBtnBorderColorHover ?? raw.icon_btn_border_color_hover ?? raw.ts_cart_btn_border_h, '') || undefined,

		// Dropdown button
		dropdownBgColor: normalizeString(raw.dropdownBgColor ?? raw.dropdown_bg_color ?? raw.pg_trs_bg, '') || undefined,
		dropdownTextColor: normalizeString(raw.dropdownTextColor ?? raw.dropdown_text_color ?? raw.pg_trs_text, '') || undefined,
		dropdownBorderColor: normalizeString(raw.dropdownBorderColor ?? raw.dropdown_border_color, '') || undefined,
		dropdownRadius: normalizeNumber(raw.dropdownRadius ?? raw.dropdown_radius ?? raw.pg_trs_radius, null) ?? undefined,
		dropdownHeight: normalizeNumber(raw.dropdownHeight ?? raw.dropdown_height ?? raw.pg_trs_height, null) ?? undefined,
		dropdownIconColor: normalizeString(raw.dropdownIconColor ?? raw.dropdown_icon_color ?? raw.pg_trs_ico, '') || undefined,
		dropdownIconSize: normalizeNumber(raw.dropdownIconSize ?? raw.dropdown_icon_size ?? raw.pg_trs_ico_size, null) ?? undefined,
		dropdownIconSpacing: normalizeNumber(raw.dropdownIconSpacing ?? raw.dropdown_icon_spacing ?? raw.pg_trs_ico_spacing, null) ?? undefined,
		dropdownHideChevron: normalizeBoolean(raw.dropdownHideChevron ?? raw.dropdown_hide_chevron ?? raw.pg_trs_chevron_hide, false),
		dropdownChevronColor: normalizeString(raw.dropdownChevronColor ?? raw.dropdown_chevron_color ?? raw.pg_trs_chevron_col, '') || undefined,
		dropdownBgColorHover: normalizeString(raw.dropdownBgColorHover ?? raw.dropdown_bg_color_hover ?? raw.pg_trs_bg_h, '') || undefined,
		dropdownTextColorHover: normalizeString(raw.dropdownTextColorHover ?? raw.dropdown_text_color_hover ?? raw.pg_trs_text_h, '') || undefined,
		dropdownBorderColorHover: normalizeString(raw.dropdownBorderColorHover ?? raw.dropdown_border_color_hover ?? raw.pg_trs_border_h, '') || undefined,
		dropdownIconColorHover: normalizeString(raw.dropdownIconColorHover ?? raw.dropdown_icon_color_hover ?? raw.pg_trs_ico_h, '') || undefined,
		dropdownBgColorFilled: normalizeString(raw.dropdownBgColorFilled ?? raw.dropdown_bg_color_filled ?? raw.pg_trs_bg_f, '') || undefined,
		dropdownTextColorFilled: normalizeString(raw.dropdownTextColorFilled ?? raw.dropdown_text_color_filled ?? raw.pg_trs_text_f, '') || undefined,
		dropdownIconColorFilled: normalizeString(raw.dropdownIconColorFilled ?? raw.dropdown_icon_color_filled ?? raw.pg_trs_ico_f, '') || undefined,
		dropdownBorderColorFilled: normalizeString(raw.dropdownBorderColorFilled ?? raw.dropdown_border_color_filled ?? raw.pg_trs_border_f, '') || undefined,

		// Ship to
		shipToTextColor: normalizeString(raw.shipToTextColor ?? raw.ship_to_text_color ?? raw.shipto_color, '') || undefined,
		shipToLinkColor: normalizeString(raw.shipToLinkColor ?? raw.ship_to_link_color ?? raw.shipto_link_color, '') || undefined,

		// Section divider
		dividerTextColor: normalizeString(raw.dividerTextColor ?? raw.divider_text_color ?? raw.sd_color, '') || undefined,
		dividerLineColor: normalizeString(raw.dividerLineColor ?? raw.divider_line_color ?? raw.sd_div_color, '') || undefined,
		dividerLineHeight: normalizeNumber(raw.dividerLineHeight ?? raw.divider_line_height ?? raw.sd_div_height, null) ?? undefined,

		// Subtotal
		subtotalTextColor: normalizeString(raw.subtotalTextColor ?? raw.subtotal_text_color ?? raw.calc_text_color_total, '') || undefined,

		// Field label
		fieldLabelColor: normalizeString(raw.fieldLabelColor ?? raw.field_label_color ?? raw.auth_label_col, '') || undefined,
		fieldLabelLinkColor: normalizeString(raw.fieldLabelLinkColor ?? raw.field_label_link_color ?? raw.auth_label_link, '') || undefined,

		// Input
		inputPlaceholderColor: normalizeString(raw.inputPlaceholderColor ?? raw.input_placeholder_color ?? raw.auth_placeholder_color, '') || undefined,
		inputValueColor: normalizeString(raw.inputValueColor ?? raw.input_value_color ?? raw.auth_input_color, '') || undefined,
		inputBgColor: normalizeString(raw.inputBgColor ?? raw.input_bg_color ?? raw.auth_input_bg, '') || undefined,
		inputBorderColor: normalizeString(raw.inputBorderColor ?? raw.input_border_color, '') || undefined,
		inputHeight: normalizeNumber(raw.inputHeight ?? raw.input_height ?? raw.auth_input_height, null) ?? undefined,
		inputRadius: normalizeNumber(raw.inputRadius ?? raw.input_radius ?? raw.auth_input_radius, null) ?? undefined,
		inputIconColor: normalizeString(raw.inputIconColor ?? raw.input_icon_color ?? raw.auth_icon_color, '') || undefined,
		inputIconSize: normalizeNumber(raw.inputIconSize ?? raw.input_icon_size ?? raw.auth_icon_size, null) ?? undefined,
		inputIconMargin: normalizeNumber(raw.inputIconMargin ?? raw.input_icon_margin ?? raw.auth_icon_margin, null) ?? undefined,
		textareaRadius: normalizeNumber(raw.textareaRadius ?? raw.textarea_radius ?? raw.auth_textarea_radius, null) ?? undefined,
		inputBgColorHover: normalizeString(raw.inputBgColorHover ?? raw.input_bg_color_hover ?? raw.auth_input_bg_h, '') || undefined,
		inputBorderColorHover: normalizeString(raw.inputBorderColorHover ?? raw.input_border_color_hover ?? raw.auth_input_border_h, '') || undefined,
		inputPlaceholderColorHover: normalizeString(raw.inputPlaceholderColorHover ?? raw.input_placeholder_color_hover ?? raw.auth_placeholder_color_h, '') || undefined,
		inputValueColorHover: normalizeString(raw.inputValueColorHover ?? raw.input_value_color_hover ?? raw.auth_input_color_h, '') || undefined,
		inputIconColorHover: normalizeString(raw.inputIconColorHover ?? raw.input_icon_color_hover ?? raw.auth_icon_color_h, '') || undefined,
		inputBgColorActive: normalizeString(raw.inputBgColorActive ?? raw.input_bg_color_active ?? raw.auth_input_bg_a, '') || undefined,
		inputBorderColorActive: normalizeString(raw.inputBorderColorActive ?? raw.input_border_color_active ?? raw.auth_input_border_a, '') || undefined,
		inputPlaceholderColorActive: normalizeString(raw.inputPlaceholderColorActive ?? raw.input_placeholder_color_active ?? raw.auth_placeholder_color_a, '') || undefined,
		inputValueColorActive: normalizeString(raw.inputValueColorActive ?? raw.input_value_color_active ?? raw.auth_input_color_a, '') || undefined,

		// Cards
		cardsGap: normalizeNumber(raw.cardsGap ?? raw.cards_gap ?? raw.ts_method_cards_gap, null) ?? undefined,
		cardsBgColor: normalizeString(raw.cardsBgColor ?? raw.cards_bg_color ?? raw.ts_method_cards_bg, '') || undefined,
		cardsBorderColor: normalizeString(raw.cardsBorderColor ?? raw.cards_border_color, '') || undefined,
		cardsRadius: normalizeNumber(raw.cardsRadius ?? raw.cards_radius ?? raw.ts_method_cards_radius, null) ?? undefined,
		cardsPrimaryColor: normalizeString(raw.cardsPrimaryColor ?? raw.cards_primary_color ?? raw.ts_method_cards_col, '') || undefined,
		cardsSecondaryColor: normalizeString(raw.cardsSecondaryColor ?? raw.cards_secondary_color ?? raw.ts_method_cards_scnd_col, '') || undefined,
		cardsPriceColor: normalizeString(raw.cardsPriceColor ?? raw.cards_price_color ?? raw.ts_method_cards_price_col, '') || undefined,
		cardsImageRadius: normalizeNumber(raw.cardsImageRadius ?? raw.cards_image_radius ?? raw.ts_method_cards_img_radius, null) ?? undefined,
		cardsImageSize: normalizeNumber(raw.cardsImageSize ?? raw.cards_image_size ?? raw.ts_method_cards_img_size, null) ?? undefined,
		cardsSelectedBgColor: normalizeString(raw.cardsSelectedBgColor ?? raw.cards_selected_bg_color ?? raw.ts_method_cards_bg_a, '') || undefined,
		cardsSelectedBorderColor: normalizeString(raw.cardsSelectedBorderColor ?? raw.cards_selected_border_color ?? raw.ts_method_cards_border_a, '') || undefined,

		// File/Gallery
		fileFieldGap: normalizeNumber(raw.fileFieldGap ?? raw.file_field_gap, null) ?? undefined,
		fileSelectIconColor: normalizeString(raw.fileSelectIconColor ?? raw.file_select_icon_color, '') || undefined,
		fileSelectIconSize: normalizeNumber(raw.fileSelectIconSize ?? raw.file_select_icon_size, null) ?? undefined,
		fileSelectBgColor: normalizeString(raw.fileSelectBgColor ?? raw.file_select_bg_color ?? raw.file_select_bg, '') || undefined,
		fileSelectBorderColor: normalizeString(raw.fileSelectBorderColor ?? raw.file_select_border_color, '') || undefined,
		fileSelectRadius: normalizeNumber(raw.fileSelectRadius ?? raw.file_select_radius, null) ?? undefined,
		fileSelectTextColor: normalizeString(raw.fileSelectTextColor ?? raw.file_select_text_color, '') || undefined,
		addedFileRadius: normalizeNumber(raw.addedFileRadius ?? raw.added_file_radius, null) ?? undefined,
		addedFileBgColor: normalizeString(raw.addedFileBgColor ?? raw.added_file_bg_color ?? raw.added_file_bg, '') || undefined,
		addedFileIconColor: normalizeString(raw.addedFileIconColor ?? raw.added_file_icon_color, '') || undefined,
		addedFileIconSize: normalizeNumber(raw.addedFileIconSize ?? raw.added_file_icon_size, null) ?? undefined,
		addedFileTextColor: normalizeString(raw.addedFileTextColor ?? raw.added_file_text_color, '') || undefined,
		removeFileBgColor: normalizeString(raw.removeFileBgColor ?? raw.remove_file_bg_color ?? raw.remove_file_bg, '') || undefined,
		removeFileBgColorHover: normalizeString(raw.removeFileBgColorHover ?? raw.remove_file_bg_color_hover ?? raw.remove_file_bg_h, '') || undefined,
		removeFileColor: normalizeString(raw.removeFileColor ?? raw.remove_file_color, '') || undefined,
		removeFileColorHover: normalizeString(raw.removeFileColorHover ?? raw.remove_file_color_hover ?? raw.remove_file_color_h, '') || undefined,
		removeFileRadius: normalizeNumber(raw.removeFileRadius ?? raw.remove_file_radius, null) ?? undefined,
		removeFileSize: normalizeNumber(raw.removeFileSize ?? raw.remove_file_size, null) ?? undefined,
		removeFileIconSize: normalizeNumber(raw.removeFileIconSize ?? raw.remove_file_icon_size, null) ?? undefined,
		fileSelectIconColorHover: normalizeString(raw.fileSelectIconColorHover ?? raw.file_select_icon_color_hover ?? raw.file_select_icon_color_h, '') || undefined,
		fileSelectBgColorHover: normalizeString(raw.fileSelectBgColorHover ?? raw.file_select_bg_color_hover ?? raw.file_select_bg_h, '') || undefined,
		fileSelectBorderColorHover: normalizeString(raw.fileSelectBorderColorHover ?? raw.file_select_border_color_hover ?? raw.file_select_border_h, '') || undefined,
		fileSelectTextColorHover: normalizeString(raw.fileSelectTextColorHover ?? raw.file_select_text_color_hover ?? raw.file_select_text_color_h, '') || undefined,
	};
}

/**
 * Get the REST API base URL
 * MULTISITE FIX: Uses getRestBaseUrl() for multisite subdirectory support
 */
function getRestUrl(): string {
	return getRestBaseUrl();
}

/**
 * Get the AJAX URL for Voxel endpoints
 * Voxel uses a custom AJAX system with ?vx=1 parameter on the site home URL
 * NOT the standard WordPress admin-ajax.php
 * MULTISITE FIX: Uses getSiteBaseUrl() for multisite subdirectory support
 */
function getAjaxUrl(): string {
	const win = window as unknown as { Voxel_Config?: { ajax_url?: string } };
	if (typeof window !== 'undefined' && win.Voxel_Config?.ajax_url) {
		return win.Voxel_Config.ajax_url;
	}
	// MULTISITE FIX: Use getSiteBaseUrl() which properly detects site path
	// This returns full URL like "http://example.com/vx-fse-stays/?vx=1"
	const baseUrl = getSiteBaseUrl();
	// Remove the ?vx=1 suffix as it's added by the caller
	return baseUrl.replace('?vx=1', '');
}

/**
 * Parse vxconfig from script tag
 * Uses normalizeConfig() for API format compatibility
 */
function parseVxConfig(container: HTMLElement): CartSummaryVxConfig | null {
	const vxconfigScript = container.querySelector<HTMLScriptElement>('script.vxconfig');

	if (vxconfigScript && vxconfigScript.textContent) {
		try {
			const raw = JSON.parse(vxconfigScript.textContent);
			return normalizeConfig(raw);
		} catch (error) {
			console.error('Failed to parse vxconfig:', error);
		}
	}

	return null;
}

/**
 * Default icon values
 */
const defaultIcons: Record<string, IconValue> = {
	deleteIcon: { library: 'icon', value: 'las la-trash-alt' },
	noProductsIcon: { library: 'icon', value: 'las la-box' },
	loginIcon: { library: 'icon', value: 'las la-sign-in-alt' },
	emailIcon: { library: 'icon', value: 'las la-envelope' },
	userIcon: { library: 'icon', value: 'las la-user' },
	uploadIcon: { library: 'icon', value: 'las la-cloud-upload-alt' },
	shippingIcon: { library: 'icon', value: 'las la-shipping-fast' },
	minusIcon: { library: 'icon', value: 'las la-minus' },
	plusIcon: { library: 'icon', value: 'las la-plus' },
	checkoutIcon: { library: 'icon', value: 'las la-arrow-right' },
	continueIcon: { library: 'icon', value: 'las la-arrow-right' },
};

/**
 * Build attributes from vxconfig
 */
function buildAttributes(vxConfig: CartSummaryVxConfig): CartSummaryBlockAttributes {
	return {
		blockId: '',

		// Icons
		deleteIcon: vxConfig.icons?.deleteIcon || defaultIcons['deleteIcon'],
		noProductsIcon: vxConfig.icons?.noProductsIcon || defaultIcons['noProductsIcon'],
		loginIcon: vxConfig.icons?.loginIcon || defaultIcons['loginIcon'],
		emailIcon: vxConfig.icons?.emailIcon || defaultIcons['emailIcon'],
		userIcon: vxConfig.icons?.userIcon || defaultIcons['userIcon'],
		uploadIcon: vxConfig.icons?.uploadIcon || defaultIcons['uploadIcon'],
		shippingIcon: vxConfig.icons?.shippingIcon || defaultIcons['shippingIcon'],
		minusIcon: vxConfig.icons?.minusIcon || defaultIcons['minusIcon'],
		plusIcon: vxConfig.icons?.plusIcon || defaultIcons['plusIcon'],
		checkoutIcon: vxConfig.icons?.checkoutIcon || defaultIcons['checkoutIcon'],
		continueIcon: vxConfig.icons?.continueIcon || defaultIcons['continueIcon'],

		// General
		sectionSpacing: vxConfig.sectionSpacing || 40,
		sectionSpacing_tablet: null,
		sectionSpacing_mobile: null,

		// Title
		titleTypography: {},
		titleColor: vxConfig.titleColor || '',

		// Empty cart
		emptyCartGap: vxConfig.emptyCartGap ?? null,
		emptyCartGap_tablet: null,
		emptyCartGap_mobile: null,
		emptyCartIconSize: vxConfig.emptyCartIconSize ?? null,
		emptyCartIconSize_tablet: null,
		emptyCartIconSize_mobile: null,
		emptyCartIconColor: vxConfig.emptyCartIconColor || '',
		emptyCartTypography: {},
		emptyCartTextColor: vxConfig.emptyCartTextColor || '',

		// Primary button
		primaryBtnTypography: {},
		primaryBtnBorderType: '',
		primaryBtnBorderWidth: {},
		primaryBtnBorderColor: vxConfig.primaryBtnBorderColor || '',
		primaryBtnRadius: vxConfig.primaryBtnRadius ?? null,
		primaryBtnRadius_tablet: null,
		primaryBtnRadius_mobile: null,
		primaryBtnBoxShadow: {},
		primaryBtnTextColor: vxConfig.primaryBtnTextColor || '',
		primaryBtnBgColor: vxConfig.primaryBtnBgColor || '',
		primaryBtnIconSize: vxConfig.primaryBtnIconSize ?? null,
		primaryBtnIconSize_tablet: null,
		primaryBtnIconSize_mobile: null,
		primaryBtnIconColor: vxConfig.primaryBtnIconColor || '',
		primaryBtnIconSpacing: vxConfig.primaryBtnIconSpacing ?? null,
		primaryBtnIconSpacing_tablet: null,
		primaryBtnIconSpacing_mobile: null,
		primaryBtnTextColorHover: vxConfig.primaryBtnTextColorHover || '',
		primaryBtnBgColorHover: vxConfig.primaryBtnBgColorHover || '',
		primaryBtnBorderColorHover: vxConfig.primaryBtnBorderColorHover || '',
		primaryBtnBoxShadowHover: {},
		primaryBtnIconColorHover: vxConfig.primaryBtnIconColorHover || '',

		// Secondary button
		secondaryBtnTypography: {},
		secondaryBtnRadius: vxConfig.secondaryBtnRadius ?? null,
		secondaryBtnRadius_tablet: null,
		secondaryBtnRadius_mobile: null,
		secondaryBtnTextColor: vxConfig.secondaryBtnTextColor || '',
		secondaryBtnPadding: {},
		secondaryBtnPadding_tablet: {},
		secondaryBtnPadding_mobile: {},
		secondaryBtnBgColor: vxConfig.secondaryBtnBgColor || '',
		secondaryBtnBorderType: '',
		secondaryBtnBorderWidth: {},
		secondaryBtnBorderColor: vxConfig.secondaryBtnBorderColor || '',
		secondaryBtnIconSize: vxConfig.secondaryBtnIconSize ?? null,
		secondaryBtnIconSize_tablet: null,
		secondaryBtnIconSize_mobile: null,
		secondaryBtnIconSpacing: vxConfig.secondaryBtnIconSpacing ?? null,
		secondaryBtnIconSpacing_tablet: null,
		secondaryBtnIconSpacing_mobile: null,
		secondaryBtnIconColor: vxConfig.secondaryBtnIconColor || '',
		secondaryBtnTextColorHover: vxConfig.secondaryBtnTextColorHover || '',
		secondaryBtnBgColorHover: vxConfig.secondaryBtnBgColorHover || '',
		secondaryBtnBorderColorHover: vxConfig.secondaryBtnBorderColorHover || '',
		secondaryBtnIconColorHover: vxConfig.secondaryBtnIconColorHover || '',

		// Loading
		loaderColor1: vxConfig.loaderColor1 || '',
		loaderColor2: vxConfig.loaderColor2 || '',

		// Checkbox
		checkboxBorderColor: vxConfig.checkboxBorderColor || '',
		checkboxSelectedBgColor: vxConfig.checkboxSelectedBgColor || '',
		checkboxSelectedBoxShadow: {},

		// Cart styling (defaults)
		cartItemSpacing: vxConfig.cartItemSpacing ?? null,
		cartItemSpacing_tablet: null,
		cartItemSpacing_mobile: null,
		cartItemContentSpacing: vxConfig.cartItemContentSpacing ?? null,
		cartItemContentSpacing_tablet: null,
		cartItemContentSpacing_mobile: null,
		cartPictureSize: vxConfig.cartPictureSize ?? null,
		cartPictureSize_tablet: null,
		cartPictureSize_mobile: null,
		cartPictureRadius: vxConfig.cartPictureRadius ?? null,
		cartPictureRadius_tablet: null,
		cartPictureRadius_mobile: null,
		cartTitleTypography: {},
		cartTitleColor: vxConfig.cartTitleColor || '',
		cartSubtitleTypography: {},
		cartSubtitleColor: vxConfig.cartSubtitleColor || '',

		// Icon button
		iconBtnColor: vxConfig.iconBtnColor || '',
		iconBtnBgColor: vxConfig.iconBtnBgColor || '',
		iconBtnBorderType: '',
		iconBtnBorderWidth: {},
		iconBtnBorderColor: vxConfig.iconBtnBorderColor || '',
		iconBtnRadius: vxConfig.iconBtnRadius ?? null,
		iconBtnRadius_tablet: null,
		iconBtnRadius_mobile: null,
		iconBtnValueSize: vxConfig.iconBtnValueSize ?? null,
		iconBtnValueColor: vxConfig.iconBtnValueColor || '',
		iconBtnColorHover: vxConfig.iconBtnColorHover || '',
		iconBtnBgColorHover: vxConfig.iconBtnBgColorHover || '',
		iconBtnBorderColorHover: vxConfig.iconBtnBorderColorHover || '',

		// Dropdown button
		dropdownTypography: {},
		dropdownBoxShadow: {},
		dropdownBgColor: vxConfig.dropdownBgColor || '',
		dropdownTextColor: vxConfig.dropdownTextColor || '',
		dropdownBorderType: '',
		dropdownBorderWidth: {},
		dropdownBorderColor: vxConfig.dropdownBorderColor || '',
		dropdownRadius: vxConfig.dropdownRadius ?? null,
		dropdownRadius_tablet: null,
		dropdownRadius_mobile: null,
		dropdownHeight: vxConfig.dropdownHeight ?? null,
		dropdownHeight_tablet: null,
		dropdownHeight_mobile: null,
		dropdownIconColor: vxConfig.dropdownIconColor || '',
		dropdownIconSize: vxConfig.dropdownIconSize ?? 24,
		dropdownIconSize_tablet: null,
		dropdownIconSize_mobile: null,
		dropdownIconSpacing: vxConfig.dropdownIconSpacing ?? 10,
		dropdownIconSpacing_tablet: null,
		dropdownIconSpacing_mobile: null,
		dropdownHideChevron: vxConfig.dropdownHideChevron || false,
		dropdownChevronColor: vxConfig.dropdownChevronColor || '',
		dropdownBgColorHover: vxConfig.dropdownBgColorHover || '',
		dropdownTextColorHover: vxConfig.dropdownTextColorHover || '',
		dropdownBorderColorHover: vxConfig.dropdownBorderColorHover || '',
		dropdownIconColorHover: vxConfig.dropdownIconColorHover || '',
		dropdownBoxShadowHover: {},
		dropdownTypographyFilled: {},
		dropdownBgColorFilled: vxConfig.dropdownBgColorFilled || '',
		dropdownTextColorFilled: vxConfig.dropdownTextColorFilled || '',
		dropdownIconColorFilled: vxConfig.dropdownIconColorFilled || '',
		dropdownBorderColorFilled: vxConfig.dropdownBorderColorFilled || '',
		dropdownBorderWidthFilled: null,
		dropdownBoxShadowFilled: {},

		// Ship to
		shipToTypography: {},
		shipToTextColor: vxConfig.shipToTextColor || '',
		shipToLinkColor: vxConfig.shipToLinkColor || '',

		// Section divider
		dividerTypography: {},
		dividerTextColor: vxConfig.dividerTextColor || '',
		dividerLineColor: vxConfig.dividerLineColor || '',
		dividerLineHeight: vxConfig.dividerLineHeight ?? null,

		// Subtotal
		subtotalTypography: {},
		subtotalTextColor: vxConfig.subtotalTextColor || '',

		// Field label
		fieldLabelTypography: {},
		fieldLabelColor: vxConfig.fieldLabelColor || '',
		fieldLabelLinkColor: vxConfig.fieldLabelLinkColor || '',

		// Input (defaults)
		inputPlaceholderColor: vxConfig.inputPlaceholderColor || '',
		inputPlaceholderTypography: {},
		inputValueColor: vxConfig.inputValueColor || '',
		inputValueTypography: {},
		inputBgColor: vxConfig.inputBgColor || '',
		inputBorderType: '',
		inputBorderWidth: {},
		inputBorderColor: vxConfig.inputBorderColor || '',
		inputPadding: {},
		inputPadding_tablet: {},
		inputPadding_mobile: {},
		inputHeight: vxConfig.inputHeight ?? null,
		inputHeight_tablet: null,
		inputHeight_mobile: null,
		inputRadius: vxConfig.inputRadius ?? null,
		inputRadius_tablet: null,
		inputRadius_mobile: null,
		inputWithIconPadding: {},
		inputWithIconPadding_tablet: {},
		inputWithIconPadding_mobile: {},
		inputIconColor: vxConfig.inputIconColor || '',
		inputIconSize: vxConfig.inputIconSize ?? null,
		inputIconSize_tablet: null,
		inputIconSize_mobile: null,
		inputIconMargin: vxConfig.inputIconMargin ?? null,
		inputIconMargin_tablet: null,
		inputIconMargin_mobile: null,
		textareaPadding: {},
		textareaPadding_tablet: {},
		textareaPadding_mobile: {},
		textareaRadius: vxConfig.textareaRadius ?? null,
		textareaRadius_tablet: null,
		textareaRadius_mobile: null,
		inputBgColorHover: vxConfig.inputBgColorHover || '',
		inputBorderColorHover: vxConfig.inputBorderColorHover || '',
		inputPlaceholderColorHover: vxConfig.inputPlaceholderColorHover || '',
		inputValueColorHover: vxConfig.inputValueColorHover || '',
		inputIconColorHover: vxConfig.inputIconColorHover || '',
		inputBgColorActive: vxConfig.inputBgColorActive || '',
		inputBorderColorActive: vxConfig.inputBorderColorActive || '',
		inputPlaceholderColorActive: vxConfig.inputPlaceholderColorActive || '',
		inputValueColorActive: vxConfig.inputValueColorActive || '',

		// Cards (defaults)
		cardsGap: vxConfig.cardsGap ?? null,
		cardsGap_tablet: null,
		cardsGap_mobile: null,
		cardsBgColor: vxConfig.cardsBgColor || '',
		cardsBorderType: '',
		cardsBorderWidth: {},
		cardsBorderColor: vxConfig.cardsBorderColor || '',
		cardsRadius: vxConfig.cardsRadius ?? null,
		cardsRadius_tablet: null,
		cardsRadius_mobile: null,
		cardsPrimaryTypography: {},
		cardsPrimaryColor: vxConfig.cardsPrimaryColor || '',
		cardsSecondaryTypography: {},
		cardsSecondaryColor: vxConfig.cardsSecondaryColor || '',
		cardsPriceTypography: {},
		cardsPriceColor: vxConfig.cardsPriceColor || '',
		cardsImageRadius: vxConfig.cardsImageRadius ?? null,
		cardsImageRadius_tablet: null,
		cardsImageRadius_mobile: null,
		cardsImageSize: vxConfig.cardsImageSize ?? null,
		cardsImageSize_tablet: null,
		cardsImageSize_mobile: null,
		cardsSelectedBgColor: vxConfig.cardsSelectedBgColor || '',
		cardsSelectedBorderColor: vxConfig.cardsSelectedBorderColor || '',
		cardsSelectedBoxShadow: {},
		cardsSelectedPrimaryTypography: {},

		// File/Gallery (defaults)
		fileFieldGap: vxConfig.fileFieldGap ?? null,
		fileFieldGap_tablet: null,
		fileFieldGap_mobile: null,
		fileSelectIconColor: vxConfig.fileSelectIconColor || '',
		fileSelectIconSize: vxConfig.fileSelectIconSize ?? null,
		fileSelectIconSize_tablet: null,
		fileSelectIconSize_mobile: null,
		fileSelectBgColor: vxConfig.fileSelectBgColor || '',
		fileSelectBorderType: '',
		fileSelectBorderWidth: {},
		fileSelectBorderColor: vxConfig.fileSelectBorderColor || '',
		fileSelectRadius: vxConfig.fileSelectRadius ?? null,
		fileSelectRadius_tablet: null,
		fileSelectRadius_mobile: null,
		fileSelectTypography: {},
		fileSelectTextColor: vxConfig.fileSelectTextColor || '',
		addedFileRadius: vxConfig.addedFileRadius ?? null,
		addedFileRadius_tablet: null,
		addedFileRadius_mobile: null,
		addedFileBgColor: vxConfig.addedFileBgColor || '',
		addedFileIconColor: vxConfig.addedFileIconColor || '',
		addedFileIconSize: vxConfig.addedFileIconSize ?? null,
		addedFileIconSize_tablet: null,
		addedFileIconSize_mobile: null,
		addedFileTypography: {},
		addedFileTextColor: vxConfig.addedFileTextColor || '',
		removeFileBgColor: vxConfig.removeFileBgColor || '',
		removeFileBgColorHover: vxConfig.removeFileBgColorHover || '',
		removeFileColor: vxConfig.removeFileColor || '',
		removeFileColorHover: vxConfig.removeFileColorHover || '',
		removeFileRadius: vxConfig.removeFileRadius ?? null,
		removeFileRadius_tablet: null,
		removeFileRadius_mobile: null,
		removeFileSize: vxConfig.removeFileSize ?? null,
		removeFileIconSize: vxConfig.removeFileIconSize ?? null,
		fileSelectIconColorHover: vxConfig.fileSelectIconColorHover || '',
		fileSelectBgColorHover: vxConfig.fileSelectBgColorHover || '',
		fileSelectBorderColorHover: vxConfig.fileSelectBorderColorHover || '',
		fileSelectTextColorHover: vxConfig.fileSelectTextColorHover || '',

		// Block spacing
		blockMargin: {},
		blockMargin_tablet: {},
		blockMargin_mobile: {},
		blockPadding: {},
		blockPadding_tablet: {},
		blockPadding_mobile: {},

		// Visibility
		hideDesktop: false,
		hideTablet: false,
		hideMobile: false,

		// Custom
		customClasses: '',
		customCSS: '',
	};
}

/**
 * Fetch cart configuration from REST API
 */
async function fetchCartConfig(): Promise<CartConfig | null> {
	const restUrl = getRestUrl();

	try {
		const headers: HeadersInit = {};
		const nonce = (window as unknown as { wpApiSettings?: { nonce?: string } }).wpApiSettings?.nonce;
		if (nonce) {
			headers['X-WP-Nonce'] = nonce;
		}

		const response = await fetch(`${restUrl}voxel-fse/v1/cart/config`, {
			credentials: 'same-origin',
			headers,
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		return (await response.json()) as CartConfig;
	} catch (error) {
		console.error('Failed to fetch cart config:', error);
		return null;
	}
}

/**
 * Fetch cart items
 */
async function fetchCartItems(
	config: CartConfig,
	isLoggedIn: boolean
): Promise<Record<string, CartItem> | null> {
	const ajaxUrl = getAjaxUrl();

	try {
		const guestCart = localStorage.getItem('voxel:guest_cart');
		const action = isLoggedIn
			? 'products.get_cart_items'
			: 'products.get_guest_cart_items';

		const formData = new FormData();
		formData.append('_wpnonce', config.nonce.cart);
		if (guestCart) {
			formData.append('guest_cart', guestCart);
		}

		const response = await fetch(`${ajaxUrl}?vx=1&action=${action}`, {
			method: 'POST',
			credentials: 'same-origin',
			body: formData,
		});

		// Check if response is ok and has content
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		// Get response text first to check if it's empty
		const responseText = await response.text();
		if (!responseText || responseText.trim() === '') {
			console.warn('Empty response from cart items endpoint');
			return {};
		}

		// Try to parse JSON
		let data: {
			success: boolean;
			items?: Record<string, CartItem>;
			message?: string;
		};

		try {
			data = JSON.parse(responseText);
		} catch (parseError) {
			console.error('Failed to parse cart items response:', responseText);
			throw new Error('Invalid JSON response from server');
		}

		if (data.success) {
			// Clear guest cart if logged in
			if (isLoggedIn && guestCart) {
				localStorage.removeItem('voxel:guest_cart');
			}
			return data.items || {};
		}

		console.error('Failed to fetch cart items:', data.message);
		return null;
	} catch (error) {
		console.error('Failed to fetch cart items:', error);
		return null;
	}
}

/**
 * Fetch direct cart items (single item checkout via URL)
 * Matches Voxel's _getDirectCartSummary() method
 */
async function fetchDirectCartItems(
	config: CartConfig,
	checkoutItemKey: string
): Promise<Record<string, CartItem> | null> {
	const ajaxUrl = getAjaxUrl();

	try {
		// Get item from localStorage
		let itemData = null;
		try {
			const directCart = localStorage.getItem('voxel:direct_cart');
			if (directCart) {
				const parsed = JSON.parse(directCart);
				itemData = parsed[checkoutItemKey];
			}
		} catch (err) {
			console.error('Failed to parse direct cart:', err);
		}

		const url = new URL(`${ajaxUrl}`);
		url.searchParams.set('vx', '1');
		url.searchParams.set('action', 'products.get_direct_cart');
		url.searchParams.set('_wpnonce', config.nonce.cart);
		if (itemData) {
			url.searchParams.set('item', JSON.stringify(itemData));
		}

		const response = await fetch(url.toString(), {
			credentials: 'same-origin',
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = (await response.json()) as {
			success: boolean;
			item?: CartItem;
			metadata?: Record<string, unknown>;
			message?: string;
		};

		if (data.success && data.item) {
			return { [data.item.key]: data.item };
		}

		console.error('Failed to fetch direct cart item:', data.message);
		return {};
	} catch (error) {
		console.error('Failed to fetch direct cart item:', error);
		return null;
	}
}

/**
 * Wrapper component that handles data fetching and state management
 */
interface CartSummaryWrapperProps {
	attributes: CartSummaryBlockAttributes;
}

function CartSummaryWrapper({ attributes }: CartSummaryWrapperProps) {
	const [config, setConfig] = useState<CartConfig | null>(null);
	const [items, setItems] = useState<Record<string, CartItem> | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// State for checkout flow
	const [shipping, setShipping] = useState<ShippingState>({
		first_name: '',
		last_name: '',
		country: null,
		state: '',
		address: '',
		zip: '',
		zone: null,
		rate: null,
		status: 'pending_setup',
		vendors: {},
	});

	const [quickRegister, setQuickRegister] = useState<QuickRegisterState>({
		email: '',
		sending_code: false,
		sent_code: false,
		code: '',
		registered: false,
		terms_agreed: false,
	});

	const [orderNotes, setOrderNotes] = useState<OrderNotesState>({
		enabled: false,
		content: '',
	});

	// Track checkout source (cart or direct_cart)
	const [source, setSource] = useState<'cart' | 'direct_cart'>('cart');

	// Promote screen state
	// Evidence: themes/voxel/app/widgets/cart-summary.php:2562-2591
	const [promoteConfig, setPromoteConfig] = useState<PromoteConfig | null>(null);

	/**
	 * GeoIP country detection
	 * Matches Voxel's geocodeCountry() method
	 */
	const geocodeCountry = async (providers: CartConfig['geoip_providers']): Promise<string | null> => {
		for (const provider of providers) {
			try {
				const response = await fetch(provider.url);
				const data = await response.json();
				if (data?.[provider.prop]) {
					const countryCode = data[provider.prop];
					if (typeof countryCode === 'string') {
						// Store in cookie for future use
						document.cookie = `_vx_ccode=${countryCode}; max-age:259200; path=/`;
						return countryCode.toUpperCase();
					}
				}
			} catch (err) {
				console.error('GeoIP provider error:', err);
			}
		}
		return null;
	};

	/**
	 * Get search param helper
	 * Matches Voxel.getSearchParam()
	 */
	const getSearchParam = (name: string): string | null => {
		const urlParams = new URLSearchParams(window.location.search);
		return urlParams.get(name);
	};

	/**
	 * Delete search param helper
	 * Matches Voxel.deleteSearchParam()
	 */
	const deleteSearchParam = (name: string): void => {
		const url = new URL(window.location.href);
		url.searchParams.delete(name);
		window.history.replaceState({}, '', url.toString());
	};

	// Load configuration and items on mount
	useEffect(() => {
		let cancelled = false;

		async function loadData() {
			const configData = await fetchCartConfig();

			if (cancelled) return;

			if (!configData) {
				setError('Failed to load cart configuration');
				setIsLoading(false);
				return;
			}

			setConfig(configData);

			// Check if this is a promote screen
			// Evidence: themes/voxel/app/widgets/cart-summary.php:2562-2591
			const screen = getSearchParam('screen');
			const promotePostId = getSearchParam('post_id');
			if (screen === 'promote' && promotePostId && configData.is_logged_in) {
				try {
					const restBase = getRestBaseUrl();
					const promoteResponse = await fetch(
						`${restBase}voxel-fse/v1/cart/promote-config?post_id=${encodeURIComponent(promotePostId)}`,
						{ credentials: 'same-origin' }
					);
					if (promoteResponse.ok) {
						const promoteData = await promoteResponse.json() as PromoteConfig & { success?: boolean };
						if (!cancelled && promoteData.success !== false) {
							setPromoteConfig(promoteData);
							setIsLoading(false);
							return;
						}
					}
				} catch (err) {
					console.error('Failed to load promote config:', err);
				}
				// Fall through to regular cart if promote fails
			}

			// Check if this is a direct cart checkout (single item via URL)
			const checkoutItem = getSearchParam('checkout_item');
			if (checkoutItem) {
				setSource('direct_cart');
				// Handle _item param for direct cart (base64 encoded item data)
				const itemParam = getSearchParam('_item');
				if (itemParam) {
					try {
						const itemData = JSON.parse(atob(itemParam));
						localStorage.setItem('voxel:direct_cart', JSON.stringify({ [checkoutItem]: itemData }));
					} catch (err) {
						console.error('Failed to parse direct cart item:', err);
					}
				}

				// Fetch direct cart item
				const directItems = await fetchDirectCartItems(configData, checkoutItem);
				if (!cancelled && directItems !== null) {
					setItems(directItems);
				}
				setIsLoading(false);
				return;
			}

			// Initialize shipping state
			const savedAddress = configData.shipping.saved_address;
			const defaultCountry = configData.shipping.default_country;
			const shippingCountries = configData.shipping.countries;

			let initialCountry: string | null = null;

			if (savedAddress && savedAddress.country && shippingCountries[savedAddress.country]) {
				// Use saved address
				setShipping({
					first_name: savedAddress.first_name || '',
					last_name: savedAddress.last_name || '',
					country: savedAddress.country,
					state: savedAddress.state || '',
					address: savedAddress.address || '',
					zip: savedAddress.zip || '',
					zone: null,
					rate: null,
					status: 'completed',
					vendors: {},
				});
				initialCountry = savedAddress.country;
			} else if (defaultCountry && shippingCountries[defaultCountry]) {
				// Use default country
				initialCountry = defaultCountry;
				setShipping((prev) => ({
					...prev,
					country: defaultCountry,
					status: 'completed',
				}));
			} else if (configData.geoip_providers.length > 0) {
				// Try GeoIP detection
				const detectedCountry = await geocodeCountry(configData.geoip_providers);
				if (detectedCountry && shippingCountries[detectedCountry]) {
					initialCountry = detectedCountry;
					setShipping((prev) => ({
						...prev,
						country: detectedCountry,
						status: 'completed',
					}));
				} else {
					// Fall back to first available country
					const availableCountries = Object.keys(shippingCountries);
					if (availableCountries.length > 0) {
						initialCountry = availableCountries[0];
						setShipping((prev) => ({
							...prev,
							country: availableCountries[0],
							status: 'completed',
						}));
					} else {
						setShipping((prev) => ({
							...prev,
							status: 'completed',
						}));
					}
				}
			} else {
				// No GeoIP, fall back to first available country
				const availableCountries = Object.keys(shippingCountries);
				if (availableCountries.length > 0) {
					initialCountry = availableCountries[0];
					setShipping((prev) => ({
						...prev,
						country: availableCountries[0],
						status: 'completed',
					}));
				} else {
					setShipping((prev) => ({
						...prev,
						status: 'completed',
					}));
				}
			}

			// Fetch cart items
			const itemsData = await fetchCartItems(configData, configData.is_logged_in);

			if (cancelled) return;

			if (itemsData !== null) {
				setItems(itemsData);
			} else {
				setItems({});
			}

			setIsLoading(false);
		}

		loadData();

		return () => {
			cancelled = true;
		};
	}, []);

	// Handle quantity update
	const handleUpdateQuantity = useCallback(
		async (itemKey: string, quantity: number) => {
			if (!config || !items) return;

			const item = items[itemKey];
			if (!item) return;

			// Optimistic update
			const updatedItems = { ...items };
			updatedItems[itemKey] = { ...item, _disabled: true };
			setItems(updatedItems);

			try {
				const ajaxUrl = getAjaxUrl();
				const isLoggedIn = config.is_logged_in || quickRegister.registered;
				const action = isLoggedIn
					? 'products.update_cart_item_quantity'
					: 'products.update_guest_cart_item_quantity';

				const formData = new FormData();
				formData.append('item_key', itemKey);
				formData.append('item_quantity', String(quantity));
				formData.append('_wpnonce', config.nonce.cart);

				if (!isLoggedIn) {
					const guestCart = localStorage.getItem('voxel:guest_cart');
					if (guestCart) {
						formData.append('guest_cart', guestCart);
					}
				}

				const response = await fetch(`${ajaxUrl}?vx=1&action=${action}`, {
					method: 'POST',
					credentials: 'same-origin',
					body: formData,
				});

				const data = (await response.json()) as {
					success: boolean;
					item?: CartItem;
					message?: string;
				};

				if (data.success && data.item) {
					setItems((prev) => {
						if (!prev) return prev;
						return { ...prev, [itemKey]: data.item! };
					});

					// Update guest cart in localStorage if not logged in
					if (!isLoggedIn) {
						storeGuestCart({ ...items, [itemKey]: data.item });
					}
				} else {
					// Revert optimistic update
					setItems((prev) => {
						if (!prev) return prev;
						return { ...prev, [itemKey]: { ...item, _disabled: false } };
					});
					alert(data.message || 'Failed to update quantity');
				}
			} catch (err) {
				// Revert optimistic update
				setItems((prev) => {
					if (!prev) return prev;
					return { ...prev, [itemKey]: { ...item, _disabled: false } };
				});
				console.error('Failed to update quantity:', err);
			}
		},
		[config, items, quickRegister.registered]
	);

	// Handle item removal
	const handleRemoveItem = useCallback(
		async (itemKey: string) => {
			if (!config || !items) return;

			const item = items[itemKey];
			if (!item) return;

			// Direct cart mode: clear items and URL param
			if (source === 'direct_cart') {
				setItems({});
				localStorage.removeItem('voxel:direct_cart');
				deleteSearchParam('checkout_item');
				return;
			}

			// Optimistic update
			const updatedItems = { ...items };
			delete updatedItems[itemKey];

			try {
				const ajaxUrl = getAjaxUrl();
				const isLoggedIn = config.is_logged_in || quickRegister.registered;

				if (isLoggedIn) {
					const formData = new FormData();
					formData.append('item_key', itemKey);
					formData.append('_wpnonce', config.nonce.cart);

					const response = await fetch(
						`${ajaxUrl}?vx=1&action=products.remove_cart_item`,
						{
							method: 'POST',
							credentials: 'same-origin',
							body: formData,
						}
					);

					const data = (await response.json()) as {
						success: boolean;
						message?: string;
					};

					if (data.success) {
						setItems(updatedItems);
					} else {
						alert(data.message || 'Failed to remove item');
					}
				} else {
					// Guest cart - just update local state and storage
					setItems(updatedItems);
					storeGuestCart(updatedItems);
				}
			} catch (err) {
				console.error('Failed to remove item:', err);
			}
		},
		[config, items, quickRegister.registered]
	);

	// Store guest cart in localStorage
	const storeGuestCart = (cartItems: Record<string, CartItem>) => {
		if (Object.keys(cartItems).length) {
			const guestCart: Record<string, unknown> = {};
			Object.values(cartItems).forEach((item) => {
				guestCart[item.key] = item.value;
			});
			localStorage.setItem('voxel:guest_cart', JSON.stringify(guestCart));
		} else {
			localStorage.removeItem('voxel:guest_cart');
		}
	};

	// State for checkout processing
	const [isProcessing, setIsProcessing] = useState(false);

	/**
	 * Submit quick register for guest checkout
	 * Matches Voxel's submitQuickRegister() method
	 */
	const submitQuickRegister = useCallback(async (): Promise<boolean> => {
		if (!config) return false;

		const ajaxUrl = getAjaxUrl();
		const formData = new FormData();
		formData.append('email', quickRegister.email);
		formData.append('_wpnonce', config.nonce.checkout);

		if (config.guest_customers.proceed_with_email?.require_verification) {
			formData.append('_confirmation_code', quickRegister.code);
		}

		if (config.guest_customers.proceed_with_email?.require_tos) {
			formData.append('terms_agreed', quickRegister.terms_agreed ? '1' : '0');
		}

		// Include guest cart for merging
		const guestCart = localStorage.getItem('voxel:guest_cart');
		if (guestCart) {
			formData.append('guest_cart', guestCart);
		}

		// Add reCAPTCHA if enabled
		if (config.recaptcha.enabled && config.recaptcha.key) {
			const grecaptcha = (window as unknown as {
				grecaptcha?: {
					ready: (cb: () => void) => void;
					execute: (key: string, opts: { action: string }) => Promise<string>;
				};
			}).grecaptcha;

			if (grecaptcha) {
				try {
					const token = await new Promise<string>((resolve) => {
						grecaptcha.ready(async () => {
							const t = await grecaptcha.execute(config.recaptcha.key!, { action: 'quick_register' });
							resolve(t);
						});
					});
					formData.append('_recaptcha', token);
				} catch (err) {
					console.error('reCAPTCHA error:', err);
				}
			}
		}

		try {
			const response = await fetch(
				`${ajaxUrl}?vx=1&action=products.quick_register.process`,
				{
					method: 'POST',
					credentials: 'same-origin',
					body: formData,
				}
			);

			const data = await response.json() as {
				success: boolean;
				nonces?: { cart: string; checkout: string };
				message?: string;
			};

			if (data.success && data.nonces) {
				// Update nonces and mark as registered
				setConfig((prev) => {
					if (!prev) return prev;
					return {
						...prev,
						nonce: data.nonces!,
						is_logged_in: true,
					};
				});
				setQuickRegister((prev) => ({ ...prev, registered: true }));

				// Clear guest cart from localStorage
				localStorage.removeItem('voxel:guest_cart');

				return true;
			} else {
				const win = window as unknown as { Voxel?: { alert: (msg: string) => void } };
				if (win.Voxel?.alert) {
					win.Voxel.alert(data.message || 'Registration failed');
				} else {
					alert(data.message || 'Registration failed');
				}
				return false;
			}
		} catch (err) {
			console.error('Quick register error:', err);
			return false;
		}
	}, [config, quickRegister]);

	/**
	 * Handle checkout submission
	 * Matches Voxel's checkout() method
	 */
	const handleCheckout = useCallback(async () => {
		if (!config || !items) return;
		if (isProcessing) return;

		setIsProcessing(true);

		try {
			// For guests, first complete quick register if needed
			const isLoggedIn = config.is_logged_in || quickRegister.registered;
			if (!isLoggedIn && config.guest_customers.behavior === 'proceed_with_email') {
				const registerSuccess = await submitQuickRegister();
				if (!registerSuccess) {
					setIsProcessing(false);
					return;
				}
			}

			// Build FormData for checkout
			const formData = new FormData();
			formData.append('source', source); // 'cart' or 'direct_cart'

			// Add items as JSON array
			const itemsArray = Object.values(items).map((item) => ({
				key: item.key,
				value: item.value,
			}));
			formData.append('items', JSON.stringify(itemsArray));

			// Add order notes if enabled
			if (orderNotes.enabled && orderNotes.content) {
				formData.append('order_notes', orderNotes.content);
			}

			// Add shipping info if there are shippable products
			const hasShippable = Object.values(items).some((item) => item.shipping.is_shippable);
			if (hasShippable && shipping.country) {
				const shippingData: Record<string, unknown> = {
					address: {
						first_name: shipping.first_name,
						last_name: shipping.last_name,
						country: shipping.country,
						state: shipping.state,
						address: shipping.address,
						zip: shipping.zip,
					},
				};

				// Add shipping method based on responsibility
				if (config.shipping.responsibility === 'platform' && shipping.zone && shipping.rate) {
					shippingData.method = {
						zone: shipping.zone,
						rate: shipping.rate,
					};
				} else if (config.shipping.responsibility === 'vendor' && Object.keys(shipping.vendors).length > 0) {
					shippingData.vendors = shipping.vendors;
				}

				formData.append('shipping', JSON.stringify(shippingData));
			}

			// Add redirect URL (current page or checkout success page)
			formData.append('redirect_to', window.location.href);

			// Submit checkout
			const ajaxUrl = getAjaxUrl();
			const response = await fetch(
				`${ajaxUrl}?vx=1&action=products.checkout&_wpnonce=${config.nonce.checkout}`,
				{
					method: 'POST',
					credentials: 'same-origin',
					body: formData,
				}
			);

			const data = await response.json() as {
				success: boolean;
				redirect_url?: string;
				message?: string;
			};

			if (data.success && data.redirect_url) {
				// Redirect to payment page
				window.location.href = data.redirect_url;
			} else {
				const win = window as unknown as { Voxel?: { alert: (msg: string) => void } };
				if (win.Voxel?.alert) {
					win.Voxel.alert(data.message || 'Checkout failed');
				} else {
					alert(data.message || 'Checkout failed');
				}
				setIsProcessing(false);
			}
		} catch (err) {
			console.error('Checkout error:', err);
			setIsProcessing(false);
		}
	}, [config, items, shipping, quickRegister, orderNotes, isProcessing, submitQuickRegister]);

	// Handle shipping state change
	const handleShippingChange = useCallback((changes: Partial<ShippingState>) => {
		setShipping((prev) => ({ ...prev, ...changes }));
	}, []);

	// Handle quick register state change
	const handleQuickRegisterChange = useCallback(
		(changes: Partial<QuickRegisterState>) => {
			setQuickRegister((prev) => ({ ...prev, ...changes }));
		},
		[]
	);

	// Handle order notes state change
	const handleOrderNotesChange = useCallback((changes: Partial<OrderNotesState>) => {
		setOrderNotes((prev) => ({ ...prev, ...changes }));
	}, []);

	// Promote screen mode - render separate UI
	// Evidence: themes/voxel/app/widgets/cart-summary.php:2562-2591
	if (promoteConfig) {
		return (
			<PromoteScreen
				config={promoteConfig}
				currency={config?.currency || 'USD'}
				checkoutIcon={attributes.checkoutIcon}
			/>
		);
	}

	return (
		<CartSummaryComponent
			attributes={attributes}
			config={config}
			items={items}
			context="frontend"
			isLoading={isLoading}
			error={error}
			onUpdateQuantity={handleUpdateQuantity}
			onRemoveItem={handleRemoveItem}
			onCheckout={handleCheckout}
			shipping={shipping}
			onShippingChange={handleShippingChange}
			quickRegister={quickRegister}
			onQuickRegisterChange={handleQuickRegisterChange}
			orderNotes={orderNotes}
			onOrderNotesChange={handleOrderNotesChange}
		/>
	);
}

/**
 * Initialize cart summary blocks on the page
 */
function initCartSummaryBlocks() {
	// Find all cart summary blocks
	const cartSummaryBlocks = document.querySelectorAll<HTMLElement>(
		'.voxel-fse-cart-summary-frontend, .vx-cart-summary-widget'
	);

	cartSummaryBlocks.forEach((container) => {
		// Skip if already hydrated
		if (container.dataset['reactMounted'] === 'true') {
			return;
		}

		// Parse vxconfig
		const vxConfig = parseVxConfig(container);
		if (!vxConfig) {
			console.warn('Cart Summary block: No vxconfig found');
			return;
		}

		// Build attributes
		const attributes = buildAttributes(vxConfig);

		// Clear placeholder and create React root
		container.innerHTML = '';
		container.dataset['reactMounted'] = 'true';

		const root = createRoot(container);
		root.render(<CartSummaryWrapper attributes={attributes} />);
	});
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initCartSummaryBlocks);
} else {
	initCartSummaryBlocks();
}

// Also initialize on Turbo/PJAX page loads
window.addEventListener('turbo:load', initCartSummaryBlocks);
window.addEventListener('pjax:complete', initCartSummaryBlocks);

// Support Voxel's markup update event
document.addEventListener('voxel:markup-update', initCartSummaryBlocks);
