/**
 * SearchFormComponent
 *
 * Main shared component used by BOTH editor and frontend.
 * Matches Voxel's HTML structure exactly - 1:1 from search-form.php
 *
 * Evidence: themes/voxel/templates/widgets/search-form.php
 *
 * @package VoxelFSE
 */

import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { SearchFormAttributes, PostTypeConfig, FilterConfig, FilterData } from '../types';
import { useSearchForm } from '../hooks/useSearchForm';
import { hasDynamicTags, extractTagContent, renderDynamicExpression } from '../utils/renderDynamicTags';
import { shouldRenderFilter } from '../utils/filterVisibility';
// Import shared components (Voxel's commons.js pattern)
import { VoxelIcons, renderIcon } from '@shared';

/**
 * Hook to detect current device type based on viewport width (frontend only)
 * Matches Voxel's Elementor breakpoints:
 * - Mobile: <= 767px
 * - Tablet: 768px - 1024px
 * - Desktop: >= 1025px
 *
 * For editor: Use editorDeviceType prop from useSelect('core/edit-post')
 * For frontend: Uses window.innerWidth
 */
function useFrontendDeviceType(): 'desktop' | 'tablet' | 'mobile' {
	const getDeviceType = (): 'desktop' | 'tablet' | 'mobile' => {
		if (typeof window === 'undefined') return 'desktop';

		const width = window.innerWidth;

		if (width <= 767) return 'mobile';
		if (width <= 1024) return 'tablet';
		return 'desktop';
	};

	const [deviceType, setDeviceType] = useState<'desktop' | 'tablet' | 'mobile'>(getDeviceType);

	useEffect(() => {
		const updateDeviceType = () => {
			setDeviceType(getDeviceType());
		};

		// Initial check
		updateDeviceType();

		// Listen to window resize
		window.addEventListener('resize', updateDeviceType);
		return () => window.removeEventListener('resize', updateDeviceType);
	}, []);

	return deviceType;
}
import {
	FilterKeywords,
	FilterRange,
	FilterStepper,
	FilterTerms,
	FilterLocation,
	FilterAvailability,
	FilterDate,
	FilterRecurringDate,
	FilterOpenNow,
	FilterOrderBy,
	FilterPostStatus,
	FilterUser,
	FilterRelations,
	FilterFollowing,
	FilterSwitcher,
	FilterUIHeading,
	FilterPostTypes,
} from '../components';

interface SearchFormComponentProps {
	attributes: SearchFormAttributes;
	postTypes: PostTypeConfig[];
	context: 'editor' | 'frontend';
	editorDeviceType?: 'desktop' | 'tablet' | 'mobile';
	onSubmit?: (values: Record<string, unknown>) => void;
	/**
	 * Callback when post type changes in editor context
	 * Used to sync selectedPostType attribute for Post Feed preview
	 */
	onPostTypeChange?: (postTypeKey: string) => void;
	/**
	 * Callback when filter values change in editor context
	 * Used to sync editorFilterValues attribute for Post Feed preview
	 */
	onFilterChange?: (filterValues: Record<string, unknown>) => void;
}

export default function SearchFormComponent({
	attributes,
	postTypes,
	context,
	editorDeviceType,
	onSubmit,
	onPostTypeChange,
	onFilterChange,
}: SearchFormComponentProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const popupBoxRef = useRef<HTMLDivElement>(null);

	const {
		state,
		setCurrentPostType,
		setFilterValue,
		togglePortal,
		submit,
		clearAll,
		narrowedValues,
		narrowingFilters,
	} = useSearchForm({
		attributes,
		postTypes,
		context,
		onSubmit,
		onPostTypeChange,
		onFilterChange,
	});

	// State for rendered dynamic tag values
	const [renderedSearchButtonText, setRenderedSearchButtonText] = useState<string>('');
	const [renderedResetButtonText, setRenderedResetButtonText] = useState<string>('');

	// Render dynamic tags when attributes change
	// Note: Use ?? (nullish coalescing) to preserve empty strings when user intentionally clears text
	// Empty string "" should hide the button label, not show default "Search"/"Reset"
	useEffect(() => {
		const renderSearchButtonText = async () => {
			const searchText = attributes.searchButtonText ?? '';

			if (hasDynamicTags(searchText)) {
				const expression = extractTagContent(searchText);
				const rendered = await renderDynamicExpression(expression);
				setRenderedSearchButtonText(rendered);
			} else {
				setRenderedSearchButtonText(searchText);
			}
		};

		const renderResetButtonText = async () => {
			const resetText = attributes.resetButtonText ?? 'Reset';

			if (hasDynamicTags(resetText)) {
				const expression = extractTagContent(resetText);
				const rendered = await renderDynamicExpression(expression);
				setRenderedResetButtonText(rendered);
			} else {
				setRenderedResetButtonText(resetText);
			}
		};

		renderSearchButtonText();
		renderResetButtonText();
	}, [attributes.searchButtonText, attributes.resetButtonText]);

	// ESC key handler for closing popup (matches Voxel's blurable mixin)
	useEffect(() => {
		if (!state.portalActive) return;

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				togglePortal();
			}
		};

		document.addEventListener('keydown', handleEscape);
		return () => document.removeEventListener('keydown', handleEscape);
	}, [state.portalActive, togglePortal]);

	// EXACT Voxel: Handle backdrop clicks to close popup (blurable mixin)
	// Evidence: themes/voxel/assets/dist/commons.js (Voxel.mixins.blurable)
	// Logic: Click anywhere outside .triggers-blur closes the popup
	useEffect(() => {
		if (!state.portalActive) return;

		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as HTMLElement;

			// Check if click is inside the popup box (.triggers-blur)
			if (popupBoxRef.current?.contains(target)) {
				return; // Click inside popup, don't close
			}

			// Click outside popup, close it
			togglePortal();
		};

		// Use mousedown event (same as Voxel) instead of click
		// requestAnimationFrame ensures popup is fully rendered before adding listener
		const rafId = requestAnimationFrame(() => {
			document.addEventListener('mousedown', handleClickOutside);
		});

		return () => {
			cancelAnimationFrame(rafId);
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [state.portalActive, togglePortal]);

	// Listen for external reset events (from Post Feed's "Reset filters?" link)
	// Evidence: voxel search-form.js - ts-feed-reset calls clearAll()
	useEffect(() => {
		if (context !== 'frontend') return;

		const handleExternalClear = (event: Event) => {
			const customEvent = event as CustomEvent<{
				postType?: string;
				searchFormId?: string;
			}>;

			// If searchFormId is specified, only respond if it matches this form
			if (customEvent.detail?.searchFormId && customEvent.detail.searchFormId !== attributes.blockId) {
				return;
			}

			// Call clearAll to reset all filters and update URL
			clearAll();
		};

		window.addEventListener('voxel-search-clear', handleExternalClear);
		return () => window.removeEventListener('voxel-search-clear', handleExternalClear);
	}, [context, attributes.blockId, clearAll]);

	// Get current post type config
	const currentPostTypeConfig = postTypes.find(
		(pt) => pt.key === state.currentPostType
	);

	// Get filter configurations for current post type from attributes
	// filterLists contains the editor configuration (filterKey, id, displayAs, etc.)
	// Then renderFilter() looks up actual filter data (props) from currentPostTypeConfig.filters
	const filterConfigs = attributes.filterLists?.[state.currentPostType] || [];

	// Handle form submit
	const handleSubmit = (e?: React.FormEvent) => {
		if (e) {
			e.preventDefault();
		}
		submit();
	};

	// Handle clear all
	const handleClearAll = (closePortal = false) => {
		clearAll(closePortal);
	};

	// Render filter component based on type
	const renderFilter = (config: FilterConfig) => {
		// Check visibility rules before rendering (frontend only)
		// In editor context, always show filters for configuration purposes
		const shouldRender = context === 'frontend' ? shouldRenderFilter(config) : true;

		if (!shouldRender) {
			return null;
		}

		const filterData = currentPostTypeConfig?.filters?.find(
			(f: FilterData) => f.key === config.filterKey
		);

		if (!filterData) {
			return null;
		}

		// CRITICAL: Merge block config defaultValue into filterData.value
		// This enables filters like 'user' to work with default values set in block inspector
		// Evidence: Voxel's PHP sets filter.value via set_value() and get_frontend_config()
		// Our REST API doesn't have this, so we apply it client-side from FilterConfig
		// Reference: themes/voxel/app/post-types/filters/base-filter.php:101
		const mergedFilterData: FilterData = {
			...filterData,
			// Apply defaultValue from block config if enabled
			value: config.defaultValueEnabled && config.defaultValue !== undefined
				? config.defaultValue
				: filterData.value,
		};

		// Common props for all filter components
		// Includes narrowedValues for adaptive filtering support
		// Includes blockId for scoping popup styles (portal elements render at document.body)
		// Includes context for determining value source of truth (editor vs frontend)
		const commonProps = {
			config,
			filterData: mergedFilterData,
			value: state.filterValues[config.filterKey],
			onChange: (value: unknown) => setFilterValue(config.filterKey, value),
			narrowedValues,
			isNarrowing: narrowingFilters,
			blockId: attributes.blockId,
			context,
		};

		switch (filterData.type) {
			case 'keywords':
				return <FilterKeywords key={config.id} {...commonProps} />;
			case 'range':
				return <FilterRange key={config.id} {...commonProps} />;
			case 'stepper':
				return <FilterStepper key={config.id} {...commonProps} />;
			case 'terms':
				return <FilterTerms key={config.id} {...commonProps} />;
			case 'location':
				return <FilterLocation key={config.id} {...commonProps} />;
			case 'availability':
				return <FilterAvailability key={config.id} {...commonProps} />;
			case 'date':
				return <FilterDate key={config.id} {...commonProps} />;
			case 'recurring-date':
				return <FilterRecurringDate key={config.id} {...commonProps} />;
			case 'open-now':
				return <FilterOpenNow key={config.id} {...commonProps} />;
			case 'order-by':
				return <FilterOrderBy key={config.id} {...commonProps} />;
			case 'post-status':
				return <FilterPostStatus key={config.id} {...commonProps} />;
			case 'user':
				return <FilterUser key={config.id} {...commonProps} />;
			case 'relations':
				return <FilterRelations key={config.id} {...commonProps} />;
			case 'following':
				return <FilterFollowing key={config.id} {...commonProps} />;
			case 'switcher':
				return <FilterSwitcher key={config.id} {...commonProps} />;
			case 'ui-heading':
				return <FilterUIHeading key={config.id} {...commonProps} />;
			default:
				return null;
		}
	};

	// Render filters content (used in both inline and portal modes)
	// Matches Voxel: <div class="ts-filter-wrapper flexify">
	// Submit button goes INSIDE this wrapper per Voxel structure
	const renderFiltersContent = (includeSubmit = true) => (
		<div className="ts-filter-wrapper flexify">
			{ /* Post type filter - matches filter-post-types */}
			{ /* HTML structure: <div class="ts-form-group choose-cpt-filter"> (both classes on same element) */}
			{attributes.showPostTypeFilter && postTypes.length > 1 && (
				<FilterPostTypes
					postTypes={postTypes}
					currentPostType={state.currentPostType}
					onChange={setCurrentPostType}
					style={getPostTypeFilterWidth()}
				/>
			)}

			{ /* Render all filters for current post type */}
			{filterConfigs.map((config: FilterConfig) => renderFilter(config))}

			{ /* Search button - INSIDE filter wrapper per Voxel structure */}
			{includeSubmit && attributes.showSearchButton && (
				<div
					className="ts-form-group flexify ts-form-submit"
					id="sf_submit"
					style={getButtonWidth('search')}
				>
					<button
						type="button"
						onClick={() => handleSubmit()}
						className={`ts-btn ts-btn-2 ts-btn-large ts-search-btn ${state.loading && !state.resetting ? 'ts-loading-btn' : ''}`}
					>
						{state.loading && !state.resetting && (
							<div className="ts-loader-wrapper">
								<span className="ts-loader"></span>
							</div>
						)}
						{renderIcon(attributes.searchButtonIcon, VoxelIcons.search)}
						{renderedSearchButtonText && renderedSearchButtonText}
					</button>
				</div>
			)}

			{ /* Reset button - INSIDE filter wrapper per Voxel structure */}
			{includeSubmit && attributes.showResetButton && (
				<div
					className="ts-form-group flexify ts-form-reset"
					style={getButtonWidth('reset')}
				>
					<a
						href="#"
						onClick={(e) => {
							e.preventDefault();
							handleClearAll(false);
						}}
						className="ts-filter"
						role="button"
					>
						{renderIcon(attributes.resetButtonIcon, VoxelIcons.reload)}
						{renderedResetButtonText && (
							<div className="ts-filter-text">
								{renderedResetButtonText}
							</div>
						)}
					</a>
				</div>
			)}
		</div>
	);

	// Detect current device type:
	// - Editor: Use editorDeviceType prop from Gutenberg's useSelect('core/edit-post')
	// - Frontend: Use window.innerWidth via useFrontendDeviceType hook
	const frontendDeviceType = useFrontendDeviceType();
	const deviceType = context === 'editor' && editorDeviceType
		? editorDeviceType
		: frontendDeviceType;

	// Determine if toggle mode is enabled for the current device
	// Works in both editor (responsive preview) and frontend
	const isToggleEnabledForDevice =
		(deviceType === 'desktop' && (attributes.formToggleDesktop ?? false)) ||
		(deviceType === 'tablet' && (attributes.formToggleTablet ?? true)) ||
		(deviceType === 'mobile' && (attributes.formToggleMobile ?? true));

	// Should toggle button be visible? (visible when toggle mode enabled)
	const showToggleButton = isToggleEnabledForDevice;
	// Should inline form be visible? (visible when toggle mode disabled)
	const showInlineForm = !isToggleEnabledForDevice;

	// Build vxconfig JSON matching Voxel's structure
	const vxConfig = {
		postTypes: postTypes.map((pt) => ({
			key: pt.key,
			label: pt.label,
			filters: pt.filters,
		})),
		currentPostType: state.currentPostType,
		filterLists: attributes.filterLists || {},
		portalMode: attributes.portalMode || { desktop: false, tablet: false, mobile: false },
		showPostTypeFilter: attributes.showPostTypeFilter ?? true,
		showSearchButton: attributes.showSearchButton ?? true,
		showResetButton: attributes.showResetButton ?? false,
		searchButtonText: attributes.searchButtonText || '',
		resetButtonText: attributes.resetButtonText || '',
		formToggleDesktop: attributes.formToggleDesktop ?? false,
		formToggleTablet: attributes.formToggleTablet ?? true,
		formToggleMobile: attributes.formToggleMobile ?? true,
		// Button width settings
		searchButtonWidth: attributes.searchButtonWidth,
		searchButtonWidth_tablet: attributes.searchButtonWidth_tablet,
		searchButtonWidth_mobile: attributes.searchButtonWidth_mobile,
		searchButtonWidthUnit: attributes.searchButtonWidthUnit || '%',
		resetButtonWidth: attributes.resetButtonWidth,
		resetButtonWidth_tablet: attributes.resetButtonWidth_tablet,
		resetButtonWidth_mobile: attributes.resetButtonWidth_mobile,
		resetButtonWidthUnit: attributes.resetButtonWidthUnit || '%',
	};

	// Helper function to get button width based on current device (matches Voxel filter width pattern)
	const getButtonWidth = (type: 'search' | 'reset'): React.CSSProperties => {
		const unit = type === 'search'
			? (attributes.searchButtonWidthUnit || '%')
			: (attributes.resetButtonWidthUnit || '%');

		let width: number | undefined;

		if (type === 'search') {
			// Get width based on device (with inheritance: mobile -> tablet -> desktop)
			if (deviceType === 'mobile') {
				width = attributes.searchButtonWidth_mobile ?? attributes.searchButtonWidth_tablet ?? attributes.searchButtonWidth;
			} else if (deviceType === 'tablet') {
				width = attributes.searchButtonWidth_tablet ?? attributes.searchButtonWidth;
			} else {
				width = attributes.searchButtonWidth;
			}
		} else {
			// Reset button
			if (deviceType === 'mobile') {
				width = attributes.resetButtonWidth_mobile ?? attributes.resetButtonWidth_tablet ?? attributes.resetButtonWidth;
			} else if (deviceType === 'tablet') {
				width = attributes.resetButtonWidth_tablet ?? attributes.resetButtonWidth;
			} else {
				width = attributes.resetButtonWidth;
			}
		}

		// Return style object (matches Voxel: width: 100%; flex-grow: 0; flex-shrink: 0;)
		if (width !== undefined) {
			return {
				width: `${width}${unit}`,
				flexGrow: 0,
				flexShrink: 0,
			};
		}

		return {};
	};

	// Helper function to get post type filter width based on current device
	const getPostTypeFilterWidth = (): React.CSSProperties => {
		let width: number | undefined;

		// Get width based on device (with inheritance: mobile -> tablet -> desktop)
		if (deviceType === 'mobile') {
			width = attributes.postTypeFilterWidth_mobile ?? attributes.postTypeFilterWidth_tablet ?? attributes.postTypeFilterWidth;
		} else if (deviceType === 'tablet') {
			width = attributes.postTypeFilterWidth_tablet ?? attributes.postTypeFilterWidth;
		} else {
			width = attributes.postTypeFilterWidth;
		}

		// Return style object (always uses %)
		if (width !== undefined) {
			return {
				width: `${width}%`,
				flexGrow: 0,
				flexShrink: 0,
			};
		}

		return {};
	};

	// Main wrapper matches Voxel: <div class="ts-form ts-search-widget" data-v-app="">
	// data-v-app marks this as a Vue/React app container for Voxel CSS compatibility
	return (
		<>
			<div className="ts-form ts-search-widget" data-v-app="">
				{ /* Voxel vxconfig pattern - configuration stored in JSON script */}
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
				/>

				{ /* Filter Toggle Button - matches Voxel exactly */}
				{ /* Show only when toggle mode is enabled for current device */}
				{ /* vx-hidden-desktop: hides toggle button on desktop (matches Voxel CSS) */}
				{showToggleButton && (
					<div className="ts-filter-wrapper flexify">
						<a
							href="#"
							onClick={(e) => {
								e.preventDefault();
								togglePortal();
							}}
							onMouseDown={(e) => e.preventDefault()}
							className={`ts-filter-toggle ts-btn ts-btn-1 ${state.activeFilterCount > 0 ? 'ts-filled' : ''}`}
							role="button"
							aria-expanded={state.portalActive}
						>
							{ /* Voxel uses SVG icon via \Voxel\svg('filterslider.svg') */}
							{VoxelIcons.filterslider}
							<div className="ts-toggle-text">Filter results</div>
							{state.activeFilterCount > 0 && (
								<span className="ts-filter-count">{state.activeFilterCount}</span>
							)}
						</a>
					</div>
				)}

				{ /* Form wrapper matching Voxel: <form method="GET" onsubmit="return false;"> */}
				<form method="GET" onSubmit={(e) => { e.preventDefault(); return false; }}>
					{ /* Inline filters - shown only when toggle mode is disabled for current device */}
					{showInlineForm && (
						<div className="ts-inline-filters">
							{renderFiltersContent()}
						</div>
					)}
				</form>

				{ /* Portal placeholder - matches Voxel structure */}
				{ /* Evidence: themes/voxel/templates/widgets/search-form.php:34 */}
				{ /* This is a placeholder div that exists in the DOM for CSS targeting */}
				{ /* Actual portal content is rendered to document.body via createPortal */}
				<div className="hidden">
					<div className="ts-search-portal"></div>
				</div>
			</div>

			{ /* Portal rendered at document.body via createPortal - matches Voxel's <teleport to="body"> */}
			{ /* Evidence: themes/voxel/templates/widgets/search-form.php:34-70 */}
			{ /* NOTE: Backdrop clicks handled by document-level mousedown listener (blurable mixin) */}
			{state.portalActive && createPortal(
				<div className={`ts-search-portal vx-popup elementor voxel-fse-search-form-${attributes.blockId}`} data-voxel-id={attributes.blockId}>
					<div className="ts-popup-root elementor-element">
						<div className="ts-form ts-search-widget no-render elementor-element">
							<div className="ts-field-popup-container">
								<div className="ts-field-popup triggers-blur" ref={popupBoxRef}>
									<div className="ts-popup-content-wrapper min-scroll">
										<div className="ts-form-group">
											{renderFiltersContent()}
										</div>
									</div>
									<div className="ts-popup-controller">
										<ul className="flexify simplify-ul">
											<li className="flexify ts-popup-close">
												<a
													href="#"
													onClick={(e) => {
														e.preventDefault();
														togglePortal();
													}}
													className="ts-icon-btn"
													role="button"
													aria-label="Close"
												>
													{renderIcon(attributes.closeIcon, VoxelIcons.close)}
												</a>
											</li>
											<li className="flexify hide-d">
												<a
													href="#"
													onClick={(e) => {
														e.preventDefault();
														handleClearAll(true);
													}}
													className="ts-icon-btn"
													role="button"
												>
													{VoxelIcons.reload}
												</a>
											</li>
											<li className="flexify hide-m">
												<a
													href="#"
													onClick={(e) => {
														e.preventDefault();
														handleClearAll(true);
													}}
													className="ts-btn ts-btn-1"
													role="button"
												>
													Clear
												</a>
											</li>
											<li className="flexify">
												<a
													href="#"
													onClick={(e) => {
														e.preventDefault();
														handleSubmit();
														togglePortal();
													}}
													className="ts-btn ts-btn-2"
													role="button"
												>
													Search
												</a>
											</li>
										</ul>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>,
				document.body
			)}
		</>
	);
}
