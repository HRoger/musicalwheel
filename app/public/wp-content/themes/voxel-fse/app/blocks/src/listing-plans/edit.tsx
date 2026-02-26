/**
 * Listing Plans Block - Editor Component
 *
 * Provides the editor UI for the Listing Plans block.
 * Matches Voxel's listing-plans widget controls.
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/modules/paid-listings/widgets/listing-plans-widget.php
 *
 * @package VoxelFSE
 */

import {
	useBlockProps,
	InspectorControls,
} from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { useEffect, useState, useMemo } from 'react';
import apiFetch from '@wordpress/api-fetch';
import type {
	ListingPlansAttributes,
	ListingPlansApiResponse,
	PriceGroup,
} from './types';
import { InspectorTabs } from '@shared/controls';
import ListingPlansComponent from './shared/ListingPlansComponent';
import { ContentTab, StyleTab } from './inspector';
import {
	generateAdvancedStyles,
	combineBlockClasses,
} from '@shared/utils/generateAdvancedStyles';
import { generateBlockStyles, generateBlockResponsiveCSS } from './styles';

interface EditProps {
	attributes: ListingPlansAttributes;
	setAttributes: (attrs: Partial<ListingPlansAttributes>) => void;
	clientId: string;
}

export default function Edit({
	attributes,
	setAttributes,
	clientId,
}: EditProps) {
	const blockId = attributes.blockId || clientId;

	// Generate and merge styles
	const advancedStyles = useMemo(
		() => generateAdvancedStyles(attributes),
		[attributes]
	);
	const blockStyles = useMemo(
		() => generateBlockStyles(attributes),
		[attributes]
	);
	const mergedStyles = useMemo(
		() => ({ ...advancedStyles, ...blockStyles }),
		[advancedStyles, blockStyles]
	);

	// Generate responsive CSS
	const blockResponsiveCSS = useMemo(
		() => generateBlockResponsiveCSS(attributes, blockId),
		[attributes, blockId]
	);

	const blockProps = useBlockProps({
		className: combineBlockClasses(
			`voxel-fse-listing-plans voxel-fse-listing-plans-${blockId}`,
			attributes
		),
		style: mergedStyles,
	});

	// State for API data
	const [apiData, setApiData] = useState<ListingPlansApiResponse | null>(null);
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
				const response = await apiFetch<ListingPlansApiResponse>({
					path: '/voxel-fse/v1/listing-plans',
				});

				if (!cancelled) {
					setApiData(response);

					// If no price groups configured, create default based on API data
					if (
						attributes.priceGroups.length === 0 &&
						response.availablePlans.length > 0
					) {
						// Create default group
						const defaultGroup: PriceGroup = {
							id: `group_${Math.random().toString(36).substring(2, 11)}`,
							label: __('All Plans', 'voxel-fse'),
							prices: [],
							icon: { library: '' as any, value: '' },
						};
						setAttributes({ priceGroups: [defaultGroup] });
					}
				}
			} catch (err) {
				if (!cancelled) {
					setError(
						err instanceof Error
							? err.message
							: __('Failed to load plans data', 'voxel-fse')
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
			{blockResponsiveCSS && (
				<style dangerouslySetInnerHTML={{ __html: blockResponsiveCSS }} />
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
				/>
			</InspectorControls>

			{/* Editor Preview */}
			<ListingPlansComponent
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
