/**
 * Search Form Block - Editor Component
 *
 * Fully interactive preview with inspector panels.
 * NO ServerSideRender - uses same SearchFormComponent as frontend.
 *
 * @package VoxelFSE
 */

// @ts-nocheck - WordPress types incomplete
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { Spinner } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { useEffect, useMemo } from 'react';
import SearchFormComponent from './shared/SearchFormComponent';
import { usePostTypes } from './hooks/usePostTypes';
import { ContentTab, GeneralTab, InlineTab } from './inspector';
import InspectorTabs from '@shared/controls/InspectorTabs';
import {
	generateAdvancedStyles,
	generateAdvancedResponsiveCSS,
	combineBlockClasses,
} from '../../shared/utils/generateAdvancedStyles';
import {
	generateVoxelStyles,
	generateVoxelResponsiveCSS,
} from '../../shared/utils/generateVoxelStyles';
import { getCurrentDeviceType } from '@shared/utils/deviceType';
import { generateBlockStyles, generateInlineTabResponsiveCSS } from './styles';
import type { SearchFormAttributes } from './types';

/**
 * Generate unique block ID
 * CRITICAL: This ensures the block has a stable ID that persists across sessions.
 * Without this, block linking (e.g., Post Feed → Search Form) breaks on reload.
 */
function generateBlockId(): string {
	return `sf-${Math.random().toString(36).substring(2, 10)}`;
}

export default function Edit({
	attributes,
	setAttributes,
	clientId,
}: BlockEditProps<SearchFormAttributes>) {
	// Generate styles from AdvancedTab attributes for editor preview
	const blockId = attributes.blockId || 'search-form';
	const uniqueSelector = `.voxel-fse-search-form-${blockId}`;
	const advancedStyles = generateAdvancedStyles(attributes);
	const advancedResponsiveCSS = generateAdvancedResponsiveCSS(attributes, uniqueSelector);

	// Generate styles from General Tab attributes (CSS custom properties)
	const blockStyles = generateBlockStyles(attributes);

	// Generate Inline Tab responsive CSS (scoped to Voxel classes)
	const inlineTabCSS = generateInlineTabResponsiveCSS(attributes, blockId);

	// Generate styles from VoxelTab attributes (sticky position)
	const voxelStyles = generateVoxelStyles(attributes);
	const voxelResponsiveCSS = generateVoxelResponsiveCSS(attributes, uniqueSelector);

	// Merge all styles: AdvancedTab + General Tab + VoxelTab
	const mergedStyles = { ...advancedStyles, ...blockStyles, ...voxelStyles };

	// Combine all responsive CSS: AdvancedTab + InlineTab + VoxelTab
	const responsiveCSS = [advancedResponsiveCSS, inlineTabCSS, voxelResponsiveCSS].filter(Boolean).join('\n');

	// DEBUG: Log background attributes and generated styles
	if (attributes.backgroundColor || attributes.backgroundType) {
		console.log('[Search Form] Background Debug:', {
			backgroundColor: attributes.backgroundColor,
			backgroundType: attributes.backgroundType,
			backgroundImage: attributes.backgroundImage,
			generatedStyles: mergedStyles,
			blockId,
		});
	}

	// DEBUG: Log mask attributes
	if (attributes.maskSwitch || attributes.maskShape || attributes.maskImage?.url) {
		console.log('[Search Form] Mask Debug:', {
			maskSwitch: attributes.maskSwitch,
			maskShape: attributes.maskShape,
			maskImage: attributes.maskImage,
			maskSize: attributes.maskSize,
			maskSizeScale: attributes.maskSizeScale,
			maskSizeScaleUnit: attributes.maskSizeScaleUnit,
			maskPosition: attributes.maskPosition,
			generatedStyles: mergedStyles,
		});
	}

	// Combine all classes (base + visibility + custom)
	const className = combineBlockClasses(
		`voxel-fse-search-form-editor voxel-fse-search-form-${blockId}`,
		attributes
	);

	const blockProps = useBlockProps({
		className,
		style: mergedStyles,
	});

	// Pass filterLists to usePostTypes for proper 1:1 Voxel parity
	// This allows the PHP controller to set filter values and resets_to
	// Evidence: themes/voxel/app/widgets/search-form.php:4192-4203
	// Pass filterLists to usePostTypes for proper 1:1 Voxel parity
	// This allows the PHP controller to set filter values and resets_to
	// Evidence: themes/voxel/app/widgets/search-form.php:4192-4203
	//
	// CRITICAL FIX: We strip style props to prevent refetching/re-rendering
	// when style controls (slider, popup width) change. This fixes sidebar scroll jumps.
	const stableFilterConfigs = useMemo(() => {
		const result: Record<string, any[]> = {};
		if (!attributes.filterLists) return result;

		Object.entries(attributes.filterLists).forEach(([postTypeKey, filters]) => {
			if (Array.isArray(filters)) {
				result[postTypeKey] = filters.map(f => ({
					filterKey: f.filterKey,
					defaultValue: f.defaultValue,
					defaultValueEnabled: f.defaultValueEnabled,
					resetValue: f.resetValue,
					// Include type to ensure we have it, though API mostly needs keys
					type: f.type,
					// Include ID for potential future use (parity with attributes)
					id: f.id,
				}));
			}
		});
		return result;
	}, [attributes.filterLists]);

	const { postTypes, isLoading, error } = usePostTypes({
		filterConfigs: stableFilterConfigs,
	});

	// Generate stable block ID on mount if not set
	// CRITICAL: This enables block linking (Post Feed → Search Form) to persist across sessions
	// Without a stable blockId, the RelationControl would use clientId which changes on reload
	useEffect(() => {
		if (!attributes.blockId) {
			setAttributes({ blockId: generateBlockId() });
		}
	}, [attributes.blockId, setAttributes]);

	// Inject Voxel Editor Styles
	useEffect(() => {
		const cssId = 'voxel-search-form-css';
		if (!document.getElementById(cssId)) {
			const link = document.createElement('link');
			link.id = cssId;
			link.rel = 'stylesheet';
			const voxelConfig = (window as any).Voxel_Config;
			const siteUrl = (voxelConfig?.site_url || window.location.origin).replace(/\/$/, '');
			link.href = `${siteUrl}/wp-content/themes/voxel/assets/dist/search-form.css?ver=1.7.5.2`;
			document.head.appendChild(link);
		}
	}, []);

	// Initialize selectedPostType to first postType if not set
	// This ensures Post Feed can read the currently selected post type for editor preview
	useEffect(() => {
		if (attributes.postTypes.length > 0 && !attributes.selectedPostType) {
			setAttributes({ selectedPostType: attributes.postTypes[0] });
		}
	}, [attributes.postTypes, attributes.selectedPostType, setAttributes]);

	// Callback to update selectedPostType when user changes the dropdown
	// This is called by SearchFormComponent via useSearchForm hook
	const handlePostTypeChange = (postTypeKey: string) => {
		setAttributes({ selectedPostType: postTypeKey });
	};

	// Callback to sync filter values to block attribute for Post Feed preview
	// This enables cross-block communication in the editor via useSelect
	const handleFilterChange = (filterValues: Record<string, unknown>) => {
		setAttributes({ editorFilterValues: filterValues });
	};

	// Get Gutenberg's responsive preview device type
	// Evidence: popup-kit/edit.tsx uses same pattern
	const normalizedDeviceType = useSelect((select) => getCurrentDeviceType(select), []);

	// CRITICAL: Memoize tabs configuration to prevent sidebar flickering
	// The render() functions must use the props passed to them (containing latest attributes)
	// instead of closing over the 'attributes' variable from the component scope.
	// This ensures the 'tabs' array remains stable even when attributes change (e.g. slider dragging).
	const inspectorTabs = useMemo(() => [
		{
			id: 'content',
			label: __('Content', 'voxel-fse'),
			icon: '\ue92c',
			render: (props: any) => (
				<ContentTab
					attributes={props.attributes}
					setAttributes={props.setAttributes}
					postTypes={postTypes}
					isLoading={isLoading}
					clientId={clientId}
				/>
			),
		},
		{
			id: 'general',
			label: __('General', 'voxel-fse'),
			icon: '\ue921',
			render: (props: any) => (
				<GeneralTab
					attributes={props.attributes}
					setAttributes={props.setAttributes}
					clientId={clientId}
				/>
			),
		},
		{
			id: 'inline',
			label: __('Inline', 'voxel-fse'),
			icon: '\ue921',
			render: (props: any) => (
				<InlineTab
					attributes={props.attributes}
					setAttributes={props.setAttributes}
				/>
			),
		},
	], [postTypes, isLoading, clientId]);

	// Voxel renders the form structure immediately - no loading placeholders
	// Evidence: themes/voxel/app/widgets/search-form.php:4007-4126
	// The form renders even with empty post types - validation is done in inspector

	// If loading post types (initial load only), show Voxel-style loader
	// Matches Voxel's immediate render philosophy but provides visual feedback
	if (isLoading && postTypes.length === 0) {
		return (
			<div {...blockProps}>
				<div className="ts-form ts-search-widget">
					<div className="ts-no-posts">
						<span className="ts-loader"></span>
					</div>
				</div>
			</div>
		);
	}

	// If error or no post types available, still render the form structure
	// Voxel does NOT show error placeholders - it renders the form with empty filters
	// Show inspector notice for configuration guidance
	if (error || postTypes.length === 0) {
		return (
			<div {...blockProps}>
				<InspectorControls>
					<InspectorTabs
						tabs={[
							{
								id: 'content',
								label: __('Content', 'voxel-fse'),
								icon: '\ue92c',
								render: () => (
									<ContentTab
										attributes={attributes}
										setAttributes={setAttributes}
										postTypes={postTypes}
										isLoading={isLoading}
										clientId={clientId}
									/>
								),
							},
							{
								id: 'general',
								label: __('General', 'voxel-fse'),
								icon: '\ue921',
								render: () => (
									<GeneralTab
										attributes={attributes}
										setAttributes={setAttributes}
										clientId={clientId}
									/>
								),
							},
							{
								id: 'inline',
								label: __('Inline', 'voxel-fse'),
								icon: '\ue921',
								render: () => (
									<InlineTab
										attributes={attributes}
										setAttributes={setAttributes}
									/>
								),
							},
						]}
						includeAdvancedTab={true}
						includeVoxelTab={true}
						attributes={attributes}
						setAttributes={setAttributes}
						defaultTab="content"
						activeTabAttribute="inspectorActiveTab"
					/>
				</InspectorControls>
				{/* Render empty form structure - matches Voxel behavior */}
				<div className="ts-form ts-search-widget">
					<div className="ts-filter-wrapper flexify">
						{/* Empty filter area - user needs to select post types in inspector */}
						<p style={{ padding: '20px', color: '#666', textAlign: 'center' }}>
							{error
								? __('Select post types in the sidebar to configure the search form.', 'voxel-fse')
								: __('No Voxel post types found. Configure post types in Voxel settings.', 'voxel-fse')
							}
						</p>
					</div>
				</div>
			</div>
		);
	}

	// Inspector controls with InspectorTabs component
	// Persistence: Store active tab in block attributes to survive device changes
	//
	// NOTE: InspectorControls is rendered directly without memoization.
	// The flickering is caused by WordPress's slot system, not React re-renders.
	// Our state persistence handles preserving expanded states across remounts.

	// If no post types selected, render empty form structure (Voxel behavior)
	// Show inspector for configuration - matches Elementor widget pattern
	if (!attributes.postTypes || attributes.postTypes.length === 0) {
		return (
			<div {...blockProps}>
				<InspectorControls>
					<InspectorTabs
						tabs={[
							{
								id: 'content',
								label: __('Content', 'voxel-fse'),
								icon: '\ue92c',
								render: () => (
									<ContentTab
										attributes={attributes}
										setAttributes={setAttributes}
										postTypes={postTypes}
										isLoading={isLoading}
										clientId={clientId}
									/>
								),
							},
							{
								id: 'general',
								label: __('General', 'voxel-fse'),
								icon: '\ue921',
								render: () => (
									<GeneralTab
										attributes={attributes}
										setAttributes={setAttributes}
										clientId={clientId}
									/>
								),
							},
							{
								id: 'inline',
								label: __('Inline', 'voxel-fse'),
								icon: '\ue921',
								render: () => (
									<InlineTab
										attributes={attributes}
										setAttributes={setAttributes}
									/>
								),
							},
						]}
						includeAdvancedTab={true}
						includeVoxelTab={true}
						attributes={attributes}
						setAttributes={setAttributes}
						defaultTab="content"
						activeTabAttribute="inspectorActiveTab"
					/>
				</InspectorControls>
				{/* Render empty form structure - Voxel renders form even without post types */}
				<div className="ts-form ts-search-widget">
					<div className="ts-filter-wrapper flexify">
						<p style={{ padding: '20px', color: '#666', textAlign: 'center' }}>
							{__('Select post types in the sidebar to configure the search form.', 'voxel-fse')}
						</p>
					</div>
				</div>
			</div>
		);
	}

	// Filter post types to only selected ones
	const selectedPostTypes = postTypes.filter((pt) =>
		attributes.postTypes?.includes(pt.key)
	);

	return (
		<div {...blockProps} data-voxel-id={blockId}>
			{/* Responsive CSS from AdvancedTab (tablet/mobile overrides, custom CSS, hover states) */}
			{responsiveCSS && (
				<style dangerouslySetInnerHTML={{ __html: responsiveCSS }} />
			)}
			<InspectorControls>
				<InspectorTabs
					tabs={inspectorTabs}
					includeAdvancedTab={true}
					includeVoxelTab={true}
					attributes={attributes}
					setAttributes={setAttributes}
					defaultTab="content"
					activeTabAttribute="inspectorActiveTab"
				/>
			</InspectorControls>

			{ /* Fully interactive preview - NO ServerSideRender */}
			<SearchFormComponent
				attributes={attributes}
				postTypes={selectedPostTypes}
				context="editor"
				editorDeviceType={normalizedDeviceType}
				onPostTypeChange={handlePostTypeChange}
				onFilterChange={handleFilterChange}
			/>
		</div>
	);
}
