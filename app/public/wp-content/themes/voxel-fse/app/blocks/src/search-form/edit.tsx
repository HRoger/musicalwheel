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
import { Placeholder, Spinner } from '@wordpress/components';
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

	// If loading post types (initial load only), show spinner
	// We keep the component mounted during background refreshes to avoid popup closing
	// and state resets when modifying inspector controls
	if (isLoading && postTypes.length === 0) {
		return (
			<div {...blockProps}>
				<Placeholder
					icon="search"
					label={__('Search Form (VX)', 'voxel-fse')}
				>
					<Spinner />
					<p>{__('Loading post types...', 'voxel-fse')}</p>
				</Placeholder>
			</div>
		);
	}

	// If error loading post types, show error message
	if (error) {
		return (
			<div {...blockProps}>
				<Placeholder icon="warning" label={__('Search Form (VX)', 'voxel-fse')}>
					<p>
						{__('Error loading post types: ', 'voxel-fse')}
						{error}
					</p>
				</Placeholder>
			</div>
		);
	}

	// If no post types available, show warning
	if (postTypes.length === 0) {
		return (
			<div {...blockProps}>
				<InspectorControls>
					<div className="voxel-fse-inspector-notice">
						<p>
							{__(
								'No Voxel post types found. Make sure the Voxel theme is active and post types are configured.',
								'voxel-fse'
							)}
						</p>
					</div>
				</InspectorControls>
				<Placeholder
					icon="warning"
					label={__('Search Form (VX)', 'voxel-fse')}
					instructions={__(
						'No Voxel post types found. Please configure post types in Voxel theme settings.',
						'voxel-fse'
					)}
				/>
			</div>
		);
	}

	// Inspector controls with InspectorTabs component
	// Persistence: Store active tab in block attributes to survive device changes
	//
	// NOTE: InspectorControls is rendered directly without memoization.
	// The flickering is caused by WordPress's slot system, not React re-renders.
	// Our state persistence handles preserving expanded states across remounts.

	// If no post types selected, show placeholder with instructions
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
				<Placeholder
					icon="search"
					label={__('Search Form (VX)', 'voxel-fse')}
					instructions={__(
						'Select post types in the sidebar to configure the search form.',
						'voxel-fse'
					)}
				/>
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
