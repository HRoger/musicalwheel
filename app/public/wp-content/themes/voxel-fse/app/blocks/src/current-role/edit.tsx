/**
 * Current Role Block - Editor Component
 *
 * Provides the editor UI for the Current Role block.
 * Matches Voxel's current-role widget controls.
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/widgets/current-role.php
 *
 * @package VoxelFSE
 */

import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { useEffect, useState, useMemo } from 'react';
import apiFetch from '@wordpress/api-fetch';
import type { CurrentRoleAttributes, CurrentRoleApiResponse } from './types';
import { InspectorTabs } from '@shared/controls';
import { ContentTab, StyleTab } from './inspector';
import CurrentRoleComponent from './shared/CurrentRoleComponent';
import {
	generateAdvancedStyles,
	generateAdvancedResponsiveCSS,
	combineBlockClasses,
} from '../../shared/utils/generateAdvancedStyles';
import { generateCurrentRoleResponsiveCSS } from './styles';

interface EditProps {
	attributes: CurrentRoleAttributes;
	setAttributes: (attrs: Partial<CurrentRoleAttributes>) => void;
	clientId: string;
}

export default function Edit({
	attributes,
	setAttributes,
	clientId,
}: EditProps) {
	const blockId = attributes.blockId || clientId;
	const uniqueSelector = `.voxel-fse-current-role-${blockId}`;

	// Generate advanced styles (inline)
	const advancedStyles = useMemo(
		() => generateAdvancedStyles(attributes),
		[attributes]
	);

	// Generate responsive CSS (block-specific)
	const blockCSS = useMemo(
		() => generateCurrentRoleResponsiveCSS(attributes, blockId),
		[attributes, blockId]
	);

	// Generate responsive CSS (advanced tab)
	const advancedCSS = useMemo(
		() => generateAdvancedResponsiveCSS(attributes, uniqueSelector),
		[attributes, uniqueSelector]
	);

	// Combine CSS
	const responsiveCSS = `${blockCSS}\n${advancedCSS}`;

	const blockProps = useBlockProps({
		className: combineBlockClasses(
			`voxel-fse-current-role voxel-fse-current-role-${blockId}`,
			attributes
		),
		style: advancedStyles,
	});

	// State for role data
	const [roleData, setRoleData] = useState<CurrentRoleApiResponse | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Set blockId if not set
	useEffect(() => {
		if (!attributes.blockId) {
			setAttributes({ blockId: clientId });
		}
	}, [attributes.blockId, clientId, setAttributes]);

	// Fetch role data from REST API
	useEffect(() => {
		let cancelled = false;

		async function fetchRoleData() {
			setIsLoading(true);
			setError(null);

			try {
				const response = await apiFetch<CurrentRoleApiResponse>({
					path: '/voxel-fse/v1/current-role',
				});

				if (!cancelled) {
					setRoleData(response);
				}
			} catch (err) {
				if (!cancelled) {
					setError(
						err instanceof Error ? err.message : __('Failed to load role data', 'voxel-fse')
					);
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false);
				}
			}
		}

		fetchRoleData();

		return () => {
			cancelled = true;
		};
	}, []);

	return (
		<div {...blockProps}>
			{responsiveCSS && <style>{responsiveCSS}</style>}

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
					]}
					includeAdvancedTab={true}
					includeVoxelTab={true}
					attributes={attributes}
					setAttributes={setAttributes}
					activeTabAttribute="inspectorActiveTab"
				/>
			</InspectorControls>

			{/* Editor Preview */}
			<CurrentRoleComponent
				attributes={attributes}
				roleData={roleData}
				isLoading={isLoading}
				error={error}
				context="editor"
			/>
		</div>
	);
}
