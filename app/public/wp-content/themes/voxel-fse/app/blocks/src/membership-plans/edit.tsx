/**
 * Membership Plans Block - Editor Component
 *
 * Provides the editor UI for the Membership Plans block.
 * Matches Voxel's pricing-plans widget controls.
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/modules/paid-memberships/widgets/pricing-plans-widget.php
 *
 * @package VoxelFSE
 */

import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { useEffect, useState, useMemo } from 'react';
import apiFetch from '@wordpress/api-fetch';
import type {
	MembershipPlansAttributes,
	MembershipPlansApiResponse,
	PriceGroup,
} from './types';
import { InspectorTabs } from '@shared/controls';
import { ContentTab, StyleTab } from './inspector';
import MembershipPlansComponent from './shared/MembershipPlansComponent';
import {
	generateAdvancedStyles,
	generateAdvancedResponsiveCSS,
	combineBlockClasses,
} from '@shared/utils/generateAdvancedStyles';
import { generateBlockResponsiveCSS } from './styles';

interface EditProps {
	attributes: MembershipPlansAttributes;
	setAttributes: (attrs: Partial<MembershipPlansAttributes>) => void;
	clientId: string;
}

/**
 * Generate unique ID for price groups
 */
function generateId(): string {
	return `group_${Math.random().toString(36).substring(2, 11)}`;
}

export default function Edit({ attributes, setAttributes, clientId }: EditProps) {
	const blockId = attributes.blockId || clientId;

	// Generate Advanced tab styles
	const advancedStyles = useMemo(
		() => generateAdvancedStyles(attributes),
		[attributes]
	);

	// Generate responsive CSS (Advanced tab + block-specific)
	const advancedResponsiveCSS = useMemo(
		() => generateAdvancedResponsiveCSS(attributes, `.voxel-fse-membership-plans-${blockId}`),
		[attributes, blockId]
	);

	const blockResponsiveCSS = useMemo(
		() => generateBlockResponsiveCSS(attributes, blockId),
		[attributes, blockId]
	);

	const combinedResponsiveCSS = useMemo(
		() => [advancedResponsiveCSS, blockResponsiveCSS].filter(Boolean).join('\n'),
		[advancedResponsiveCSS, blockResponsiveCSS]
	);

	const blockProps = useBlockProps({
		className: combineBlockClasses(
			`voxel-fse-membership-plans voxel-fse-membership-plans-${blockId}`,
			attributes
		),
		style: advancedStyles,
	});

	// State for API data
	const [apiData, setApiData] = useState<MembershipPlansApiResponse | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<string>('');

	// Set blockId if not set
	useEffect(() => {
		if (!attributes.blockId) {
			setAttributes({ blockId: clientId });
		}
	}, [attributes.blockId, clientId, setAttributes]);

	// Fetch plans data from REST API
	useEffect(() => {
		let cancelled = false;

		async function fetchPlansData() {
			setIsLoading(true);
			setError(null);

			try {
				const response = (await apiFetch({
					path: '/voxel-fse/v1/membership-plans',
				})) as MembershipPlansApiResponse;

				if (!cancelled) {
					setApiData(response);

					// If no price groups configured, create default based on API data
					if (attributes.priceGroups.length === 0 && response.availablePlans.length > 0) {
						const defaultGroups: PriceGroup[] = [
							{
								id: generateId(),
								label: __('Monthly', 'voxel-fse'),
								prices: [],
								rowVisibility: 'show',
								visibilityRules: [],
							},
						];
						setAttributes({ priceGroups: defaultGroups });
					}
				}
			} catch (err) {
				if (!cancelled) {
					setError(
						err instanceof Error ? err.message : __('Failed to load plans data', 'voxel-fse')
					);
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false);
				}
			}
		}

		fetchPlansData();

		return () => {
			cancelled = true;
		};
	}, []);

	// Set active tab if not set
	useEffect(() => {
		if (!activeTab && attributes.priceGroups.length > 0) {
			setActiveTab(attributes.priceGroups[0].id);
		}
	}, [activeTab, attributes.priceGroups]);

	return (
		<div {...blockProps}>
			{/* Responsive CSS */}
			{combinedResponsiveCSS && (
				<style dangerouslySetInnerHTML={{ __html: combinedResponsiveCSS }} />
			)}

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
									apiData={apiData}
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
					activeTabAttribute="activeTab"
				/>
			</InspectorControls>

			{/* Editor Preview */}
			<MembershipPlansComponent
				attributes={attributes}
				apiData={apiData}
				isLoading={isLoading}
				error={error}
				context="editor"
				onTabChange={setActiveTab}
			/>
		</div>
	);
}

