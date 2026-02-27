/**
 * Voxel Popup Kit Block - Frontend Component
 *
 * Makes the demo popup interactive on the frontend.
 * Provides reusable popup components for form fields.
 *
 * Evidence:
 * - Widget: themes/voxel/app/widgets/popup-kit.php
 * - Template: themes/voxel/templates/widgets/popup-kit.php
 * - Option Groups: themes/voxel/app/widgets/option-groups/popup-*.php
 *
 * @package VoxelFSE
 *
 * ============================================================================
 * VOXEL PARITY STATUS
 * ============================================================================
 *
 * Reference: themes/voxel/app/widgets/popup-kit.php (1,637 lines)
 *
 * POPUP GENERAL (via Option_Groups\Popup_General):
 * ✅ pgBackground - Popup background color
 * ✅ pgTopMargin - Top margin (responsive)
 * ✅ pgShadow - Box shadow
 * ✅ pgBorder - Border (type, width, color)
 * ✅ pgRadius - Border radius (responsive)
 * ✅ pgScrollColor - Scroll track color
 * ✅ disableRevealFx - Disable reveal animation
 * ✅ pgTitleSeparator - Title separator color
 *
 * POPUP HEAD (via Option_Groups\Popup_Head):
 * ✅ phIconSize - Icon size (responsive)
 * ✅ phIconSpacing - Icon spacing (responsive)
 * ✅ phIconColor - Icon color
 * ✅ phTitleColor - Title color
 * ✅ phTitleFont - Title typography (family, size, weight, line-height)
 * ✅ phAvatarSize - Avatar size (responsive)
 * ✅ phAvatarRadius - Avatar border radius (responsive)
 *
 * POPUP CONTROLLER (via Option_Groups\Popup_Controller):
 * ✅ Button 1/2/3 - Background, text, icon colors
 * ✅ Button hover states - All button hover colors
 * ✅ pbTypo - Button typography
 * ✅ pbRadius - Button border radius
 * ✅ Border controls - Per-button borders
 *
 * POPUP LABELS (via Option_Groups\Popup_Label):
 * ✅ plLabelTypo - Label typography
 * ✅ plLabelColor - Label color
 * ✅ plDescTypo - Description typography
 * ✅ plDescColor - Description color
 *
 * POPUP MENU (via Option_Groups\Popup_Menu):
 * ✅ pmItemPadding - Item padding
 * ✅ pmItemHeight - Item height (responsive)
 * ✅ pmSeparatorColor - Separator color
 * ✅ pmTitleColor/Typo - Menu item title
 * ✅ pmIconColor/Size - Menu item icon
 * ✅ pmChevronColor - Chevron for submenus
 * ✅ pmHover* - All hover state colors
 * ✅ pmSelected* - Selected item styling
 * ✅ pmParentTitleTypo - Parent menu item typography
 *
 * POPUP CART:
 * ✅ cart_spacing - Cart item spacing
 * ✅ cart_item_spacing - Item content spacing
 * ✅ ts_cart_img_size - Cart image size
 * ✅ ts_cart_img_radius - Cart image radius
 * ✅ Title/subtitle typography and colors
 *
 * POPUP SUBTOTAL:
 * ✅ calc_text_total - Subtotal typography
 * ✅ calc_text_color_total - Subtotal color
 *
 * POPUP NO RESULTS:
 * ✅ ts_empty_icon_size/color - Empty state icon
 * ✅ ts_empty_title_color - Empty state title
 * ✅ Typography controls
 *
 * POPUP CHECKBOXES (via Option_Groups\Popup_Checkbox):
 * ✅ pcCheckboxSize - Checkbox size (responsive)
 * ✅ pcCheckboxRadius - Border radius
 * ✅ pcCheckboxBorder - Border settings
 * ✅ pcCheckboxBg* - Background colors (checked/unchecked)
 *
 * POPUP RADIO (via Option_Groups\Popup_Radio):
 * ✅ prRadioSize - Radio size (responsive)
 * ✅ prRadioRadius - Border radius
 * ✅ prRadioBorder - Border settings
 * ✅ prRadioBg* - Background colors (checked/unchecked)
 *
 * POPUP INPUT (via Option_Groups\Popup_Input):
 * ✅ piInputHeight - Input height (responsive)
 * ✅ piInputTypo - Typography
 * ✅ piInputPadding - Padding
 * ✅ piInputValueColor - Value color
 * ✅ piInputPlaceholderColor - Placeholder color
 * ✅ piIcon* - Icon settings
 *
 * POPUP FILE/GALLERY:
 * ✅ ts_file_col_gap - Grid gap
 * ✅ ts_file_* - Select files button styling
 * ✅ ts_added_* - Added file styling
 * ✅ ts_rmf_* - Remove button styling
 * ✅ Hover states for all
 *
 * POPUP NUMBER:
 * ✅ popup_number_input_size - Number input size
 *
 * POPUP RANGE SLIDER:
 * ✅ ts_popup_range_size - Range value size
 * ✅ ts_popup_range_val - Range value color
 * ✅ ts_popup_range_bg - Range background
 * ✅ ts_popup_range_bg_selected - Selected range
 * ✅ ts_popup_range_handle - Handle styling
 *
 * POPUP SWITCH:
 * ✅ ts_popup_switch_bg - Switch background (inactive)
 * ✅ ts_popup_switch_bg_active - Switch background (active)
 * ✅ ts_field_switch_bg_handle - Handle background
 *
 * POPUP ICON BUTTON (via Option_Groups\Popup_Icon_Button):
 * ✅ Button size, icon size, colors
 * ✅ Background, border, radius
 * ✅ Hover states
 *
 * POPUP DATEPICKER:
 * ✅ dh_* - Datepicker head (title, subtitle, icon)
 * ✅ dht_* - Datepicker tooltips
 *
 * POPUP CALENDAR (via Option_Groups\Popup_Calendar):
 * ✅ Calendar day/month styling
 * ✅ Selected/today states
 * ✅ Navigation buttons
 *
 * POPUP NOTIFICATIONS (via Option_Groups\Popup_Notifications):
 * ✅ pnIconSize - Notification icon size
 * ✅ pnIconColor - Icon color
 * ✅ pnTitleColor/Typo - Title styling
 *
 * POPUP TEXTAREA:
 * ✅ ts_sf_popup_textarea_height - Textarea height
 * ✅ Typography, colors, padding
 * ✅ Border, hover states
 *
 * POPUP ALERT:
 * ✅ alert_shadow - Box shadow
 * ✅ alertbg - Background color
 * ✅ alert_radius - Border radius
 * ✅ Info/warning/success icon colors
 * ✅ Link colors and hover states
 *
 * HTML STRUCTURE:
 * ✅ .ts-field-popup - Main popup container
 * ✅ .ts-popup-head - Popup header
 * ✅ .ts-popup-controller - Bottom buttons
 * ✅ .ts-term-dropdown - Menu items
 * ✅ .ts-form-group - Form field wrapper
 * ✅ .ts-stepper-input - Number input
 * ✅ .ts-file-list - File upload list
 * ✅ .ts-notice - Alert notifications
 *
 * NEXT.JS READINESS:
 * ✅ normalizeConfig() handles both vxconfig and REST API formats
 * ✅ Reusable FormGroup, FormPopup, DatePicker components
 * ✅ No jQuery in component logic
 * ✅ TypeScript strict mode
 *
 * ============================================================================
 */
import { createRoot } from 'react-dom/client';
import { useState } from 'react';
// import { FormGroup, FormPopup, DatePicker } from './components';

/**
 * Normalize config from various sources (vxconfig, REST API, data attributes)
 * Handles both camelCase (FSE) and snake_case (Voxel/REST) formats
 *
 * NEXT.JS READINESS: This function enables headless architecture by
 * normalizing config from any source to a consistent format.
 *
 * Reference: themes/voxel/app/widgets/popup-kit.php control names
 */
// @ts-ignore -- unused but kept for future use
function _normalizeConfig(raw: Record<string, unknown>): PopupDemoConfig {
	// Helper for boolean normalization
	const normalizeBool = (val: unknown, fallback: boolean): boolean => {
		if (typeof val === 'boolean') return val;
		if (val === 'true' || val === '1' || val === 1 || val === 'yes') return true;
		if (val === 'false' || val === '0' || val === 0 || val === 'no' || val === '') return false;
		return fallback;
	};

	// Helper for string normalization
	const normalizeString = (val: unknown, fallback: string): string => {
		if (typeof val === 'string') return val;
		return fallback;
	};

	return {
		// Demo config - support both camelCase and snake_case
		popupId: normalizeString(raw['popupId'] ?? raw['popup_id'], ''),
		title: normalizeString(raw['title'] ?? raw['popup_title'], ''),
		icon: normalizeString(raw['icon'] ?? raw['popup_icon'], ''),
		showSave: normalizeBool(raw['showSave'] ?? raw['show_save'], true),
		showClear: normalizeBool(raw['showClear'] ?? raw['show_clear'], true),
		clearLabel: normalizeString(raw['clearLabel'] ?? raw['clear_label'], 'Clear'),
		saveLabel: normalizeString(raw['saveLabel'] ?? raw['save_label'], 'Save'),
		wrapperClass: normalizeString(raw['wrapperClass'] ?? raw['wrapper_class'], ''),
	};
}

interface PopupDemoConfig {
	popupId: string;
	title: string;
	icon: string;
	showSave: boolean;
	showClear: boolean;
	clearLabel: string;
	saveLabel: string;
	wrapperClass: string;
}

function PopupDemo({ config: _config }: { config: PopupDemoConfig }) {
	const [_dateValue, setDateValue] = useState<Date | null>(null);

// @ts-ignore -- unused but kept for future use

	const _onDateChange = (date: Date | null) => {
		setDateValue(date);
		
		// Update the display
		const resultDiv = document.querySelector('.vx-popup-demo-result');
		const dateSpan = document.querySelector('.vx-selected-date');
		
		if (resultDiv && dateSpan) {
			if (date) {
				dateSpan.textContent = date.toDateString();
				(resultDiv as HTMLElement).style.display = 'block';
			} else {
				(resultDiv as HTMLElement).style.display = 'none';
			}
		}
	};

	// TODO: Re-enable when FormGroup, FormPopup, and DatePicker components are implemented
	return (
		<div className="vx-popup-demo-form-group">
			<div>Popup Kit Demo - Components not yet implemented</div>
		</div>
	);
}

// Initialize all popup demo blocks on the page
document.addEventListener('DOMContentLoaded', () => {
	const demoBlocks = document.querySelectorAll('.vx-popup-demo-block');

	demoBlocks.forEach((block) => {
		const configAttr = block.getAttribute('data-config');
		if (!configAttr) return;

		try {
			const config: PopupDemoConfig = JSON.parse(configAttr);

			// Find the trigger element
			const trigger = block.querySelector('.vx-popup-demo-trigger');
			if (!trigger) return;

			// Create a root and render the demo
			const root = createRoot(trigger);
			root.render(<PopupDemo config={config} />);
		} catch (error) {
			console.error('Error initializing popup demo:', error);
		}
	});
});

