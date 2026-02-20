/**
 * Create Post Block - Editor Component
 * Phase 4: Interactive Editor Preview with CreatePostForm
 *
 * Matches Voxel's Elementor pattern:
 * - Same interactive form in editor and frontend
 * - Real-time field interaction
 * - Full form testing capabilities
 */
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import type { EditProps, VoxelPostType } from './types';

/**
 * Window extension for Voxel post types
 */
declare global {
	interface Window {
		voxelPostTypes?: VoxelPostType[];
	}
}

// Phase 4: Import shared components and hooks
import { CreatePostForm } from './shared';
import { useFieldsConfig } from './hooks';
import { getAdvancedVoxelTabProps } from '@shared/utils';
import { InspectorTabs } from '@shared/controls';
import { ContentTab, StyleTab, FieldStyleTab } from './inspector';
import { generateStyleTabResponsiveCSS, generateFieldStyleTabResponsiveCSS } from './styles';

export default function Edit({ attributes, setAttributes, clientId }: EditProps) {
	// Inject Voxel Editor Styles
	useEffect(() => {
		const cssId = 'voxel-create-post-css';
		if (!document.getElementById(cssId)) {
			const link = document.createElement('link');
			link.id = cssId;
			link.rel = 'stylesheet';
			const voxelConfig = (window as any).Voxel_Config;
			const siteUrl = (voxelConfig?.site_url || window.location.origin).replace(/\/$/, '');
			link.href = `${siteUrl}/wp-content/themes/voxel/assets/dist/create-post.css?ver=1.7.5.2`;
			document.head.appendChild(link);
		}
	}, []);

	// Generate blockId if missing
	useEffect(() => {
		if (!attributes.blockId) {
			setAttributes({ blockId: clientId });
		}
	}, [clientId, attributes.blockId, setAttributes]);

	const blockId = attributes.blockId || clientId;

	// NOTE: baseClass MUST start with the selector prefix used in styles.ts
	// styles.ts uses: `.voxel-fse-create-post-${blockId}`
	const advancedProps = getAdvancedVoxelTabProps(attributes, {
		blockId,
		baseClass: 'voxel-fse-create-post ts-form ts-create-post create-post-form',
	});

	// Generate Style tab CSS
	const styleTabCSS = generateStyleTabResponsiveCSS(attributes, blockId);
	// Generate Field Style tab CSS
	const fieldStyleTabCSS = generateFieldStyleTabResponsiveCSS(attributes, blockId);
	const combinedResponsiveCSS = [advancedProps.responsiveCSS, styleTabCSS, fieldStyleTabCSS]
		.filter(Boolean)
		.join('\n');

	const blockProps = useBlockProps({
		className: advancedProps.className,
		style: advancedProps.styles,
	});

	// Get available Voxel post types from server
	const postTypes = (useSelect as any)(() => {
		const types: VoxelPostType[] = window.voxelPostTypes || [];
		return types;
	}, []);

	const hasPostType = Boolean(attributes.postTypeKey && attributes.postTypeKey.trim());

	// Phase 4: Load field configuration from REST API
	const { fieldsConfig: rawFieldsConfig, isLoading, error } = useFieldsConfig(
		attributes.postTypeKey,
		'editor'
	);

	// Ensure fieldsConfig is always an array to prevent "Cannot read properties of undefined (reading 'length')"
	const fieldsConfig = Array.isArray(rawFieldsConfig) ? rawFieldsConfig : [];

	return (
		<>
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
									hasPostType={hasPostType}
								/>
							),
						},
						{
							id: 'style',
							label: __('Style', 'voxel-fse'),
							icon: '\ue921',
							render: () => (
								<StyleTab
									attributes={attributes}
									setAttributes={setAttributes}
								/>
							),
						},
						{
							id: 'field-style',
							label: __('Field Style', 'voxel-fse'),
							icon: '\ue921',
							render: () => (
								<FieldStyleTab
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
				/>
			</InspectorControls>

			<div {...blockProps}>
				{/* Style tab + Field Style tab responsive CSS - MUST be inside blockProps for editor to apply */}
				{combinedResponsiveCSS && (
					<style dangerouslySetInnerHTML={{ __html: combinedResponsiveCSS }} />
				)}
				{!hasPostType ? (
					<div className="ts-no-posts">
						<p>{__('Select a post type in the block settings to configure this form.', 'voxel-fse')}</p>
						{postTypes.length === 0 && (
							<p>{__('No Voxel post types found. Make sure Voxel theme is active.', 'voxel-fse')}</p>
						)}
					</div>
				) : (
					<>
						{/* Show loading state while fetching fields */}
						{isLoading ? (
							<div className="ts-no-posts">
								<span className="ts-loader"></span>
							</div>
						) : error ? (
							<div className="ts-no-posts">
								<p>{__('Error loading form: ', 'voxel-fse')}{error}</p>
							</div>
						) : fieldsConfig.length === 0 ? (
							<div className="ts-no-posts">
								<p>{__('No fields configured for this post type.', 'voxel-fse')}</p>
							</div>
						) : (
							/* Render interactive CreatePostForm - Same as frontend! */
							<CreatePostForm
								attributes={attributes}
								fieldsConfig={fieldsConfig}
								context="editor"
								postId={null}
								isAdminMode={false}
							/>
						)}
					</>
				)}
			</div>
		</>
	);
}
