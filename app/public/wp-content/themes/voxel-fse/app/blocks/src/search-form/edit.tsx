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
import { useState, useEffect } from 'react';
import SearchFormComponent from './shared/SearchFormComponent';
import { usePostTypes } from './hooks/usePostTypes';
import { ContentTab, GeneralTab, InlineTab } from './inspector';
import AdvancedTab from '@shared/controls/AdvancedTab';
import VoxelTab from '@shared/controls/VoxelTab';
import type { SearchFormAttributes } from './types';

type TabType = 'content' | 'general' | 'inline' | 'advanced' | 'voxel';

interface TabConfig {
	id: TabType;
	label: string;
	icon: string;
}

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
	const blockProps = useBlockProps({
		className: 'voxel-fse-search-form-editor',
	});

	const [activeTab, setActiveTab] = useState<TabType>('content');
	const { postTypes, isLoading, error } = usePostTypes();

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

	// Get Gutenberg's responsive preview device type
	// Evidence: popup-kit/edit.tsx uses same pattern
	const editorDeviceType = useSelect((select: any) => {
		const editPostStore = select('core/edit-post');
		if (editPostStore && typeof editPostStore.getPreviewDeviceType === 'function') {
			return editPostStore.getPreviewDeviceType();
		}
		// Fallback to experimental API
		if (editPostStore && typeof editPostStore.__experimentalGetPreviewDeviceType === 'function') {
			return editPostStore.__experimentalGetPreviewDeviceType();
		}
		return 'Desktop';
	}, []);

	// Normalize device type to lowercase
	const normalizedDeviceType = editorDeviceType
		? (editorDeviceType.toLowerCase() as 'desktop' | 'tablet' | 'mobile')
		: 'desktop';

	// Tab configuration - Advanced tab always shown (uses custom controls, not Stackable)
	const tabs: TabConfig[] = [
		{ id: 'content', label: __('Content', 'voxel-fse'), icon: 'las la-edit' },
		{ id: 'general', label: __('General', 'voxel-fse'), icon: 'las la-circle' },
		{ id: 'inline', label: __('Inline', 'voxel-fse'), icon: 'las la-paint-brush' },
		{ id: 'advanced', label: __('Advanced', 'voxel-fse'), icon: 'las la-cog' },
		{ id: 'voxel', label: __('Voxel', 'voxel-fse'), icon: 'las la-heart' },
	];

	// If loading post types, show spinner
	if (isLoading) {
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

	// Render tab navigation
	const renderTabNavigation = () => (
		<div className="voxel-fse-inspector-tabs">
			{tabs.map((tab) => (
				<button
					key={tab.id}
					type="button"
					className={`voxel-fse-tab-btn ${activeTab === tab.id ? 'is-active' : ''}`}
					onClick={() => setActiveTab(tab.id)}
					title={tab.label}
				>
					<i className={tab.icon}></i>
					<span className="voxel-fse-tab-label">{tab.label}</span>
				</button>
			))}
		</div>
	);

	// Render active tab content
	const renderTabContent = () => {
		switch (activeTab) {
			case 'content':
				return (
					<ContentTab
						attributes={attributes}
						setAttributes={setAttributes}
						postTypes={postTypes}
						isLoading={isLoading}
						clientId={clientId}
					/>
				);
			case 'general':
				return (
					<GeneralTab
						attributes={attributes}
						setAttributes={setAttributes}
						clientId={clientId}
					/>
				);
			case 'inline':
				return (
					<InlineTab
						attributes={attributes}
						setAttributes={setAttributes}
					/>
				);
			case 'advanced':
				return (
					<AdvancedTab
						attributes={attributes}
						setAttributes={setAttributes}
					/>
				);
			case 'voxel':
				return (
					<VoxelTab
						attributes={attributes}
						setAttributes={setAttributes}
						showPortalSettings={true}
						showAdaptiveFiltering={true}
					/>
				);
			default:
				return null;
		}
	};

	// Inspector controls with tab navigation
	const renderInspectorControls = () => (
		<InspectorControls>
			{renderTabNavigation()}
			<div className="voxel-fse-tab-content">
				{renderTabContent()}
			</div>
		</InspectorControls>
	);

	// If no post types selected, show placeholder with instructions
	if (!attributes.postTypes || attributes.postTypes.length === 0) {
		return (
			<div {...blockProps}>
				{renderInspectorControls()}
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
		<div {...blockProps}>
			{renderInspectorControls()}

			{ /* Fully interactive preview - NO ServerSideRender */}
			<SearchFormComponent
				attributes={attributes}
				postTypes={selectedPostTypes}
				context="editor"
				editorDeviceType={normalizedDeviceType}
				onPostTypeChange={handlePostTypeChange}
			/>
		</div>
	);
}
