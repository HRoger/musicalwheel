/**
 * Current Plan Block - Editor Component
 *
 * Provides the editor UI for the Current Plan block.
 * Matches Voxel's current-plan widget controls.
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/modules/paid-memberships/widgets/current-plan-widget.php
 *
 * @package VoxelFSE
 */

import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { useEffect, useState, useMemo } from 'react';
import apiFetch from '@wordpress/api-fetch';
import type { CurrentPlanAttributes, CurrentPlanApiResponse } from './types';
import { InspectorTabs } from '@shared/controls';
import { ContentTab, StyleTab } from './inspector';
import CurrentPlanComponent from './shared/CurrentPlanComponent';
import {
	generateAdvancedStyles,
	combineBlockClasses,
	generateAdvancedResponsiveCSS,
} from '../../shared/utils/generateAdvancedStyles';
import { generateCurrentPlanResponsiveCSS } from './styles';

interface EditProps {
	attributes: CurrentPlanAttributes;
	setAttributes: (attrs: Partial<CurrentPlanAttributes>) => void;
	clientId: string;
}

export default function Edit({
	attributes,
	setAttributes,
	clientId,
}: EditProps) {
	const blockId = attributes.blockId || clientId;

	// Generate advanced styles
	const advancedStyles = useMemo(
		() => generateAdvancedStyles(attributes),
		[attributes]
	);

	// Generate block-specific CSS + advanced responsive CSS
	const blockCSS = useMemo(() => {
		const styleCSS = generateCurrentPlanResponsiveCSS(attributes, blockId);
		const advancedCSS = generateAdvancedResponsiveCSS(attributes, blockId);
		return styleCSS + '\n' + advancedCSS;
	}, [attributes, blockId]);

	const blockProps = useBlockProps({
		className: combineBlockClasses(
			`voxel-fse-current-plan voxel-fse-current-plan-${blockId}`,
			attributes
		),
		style: advancedStyles,
	});

	// State for plan data
	const [planData, setPlanData] = useState<CurrentPlanApiResponse | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Set blockId if not set
	useEffect(() => {
		if (!attributes.blockId) {
			setAttributes({ blockId: clientId });
		}
	}, [attributes.blockId, clientId, setAttributes]);

	// Fetch plan data from REST API
	useEffect(() => {
		let cancelled = false;

		async function fetchPlanData() {
			setIsLoading(true);
			setError(null);

			try {
				const response = await apiFetch<CurrentPlanApiResponse>({
					path: '/voxel-fse/v1/current-plan',
				});

				if (!cancelled) {
					setPlanData(response);
				}
			} catch (err) {
				if (!cancelled) {
					setError(
						err instanceof Error ? err.message : __('Failed to load plan data', 'voxel-fse')
					);
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false);
				}
			}
		}

		fetchPlanData();

		return () => {
			cancelled = true;
		};
	}, []);

	return (
		<div {...blockProps}>
			<InspectorControls>
				<InspectorTabs
					tabs={[
						{
							id: 'content',
							label: __('Content', 'voxel-fse'),
							icon: '\ue92c', // eicon-edit
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
							icon: '\ue921', // eicon-paint-brush
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
					defaultTab="content"
				/>
			</InspectorControls>

			{/* Block-specific CSS for Style tab */}
			{blockCSS && <style>{blockCSS}</style>}

			{/* Editor Preview */}
			<CurrentPlanComponent
				attributes={attributes}
				planData={planData}
				isLoading={isLoading}
				error={error}
				context="editor"
			/>
		</div>
	);
}
