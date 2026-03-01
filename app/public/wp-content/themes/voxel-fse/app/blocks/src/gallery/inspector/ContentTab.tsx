/**
 * Gallery Block - Content Tab Inspector Controls
 *
 * Extracted from edit.tsx for maintainability.
 * Contains Images and Mosaic accordion sections.
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import { ToggleControl } from '@wordpress/components';
import {
	AccordionPanelGroup,
	AccordionPanel,
	GalleryUploadControl,
	ResponsiveRangeControl,
	ResponsiveSelectControl,
	ResponsiveTextControl,
	SectionHeading,
	getImageSizeOptions,
} from '@shared/controls';
import type { GalleryBlockAttributes } from '../types';
import type { ImageUploadValue } from '@shared/controls/ImageUploadControl';

interface ContentTabProps {
	attributes: GalleryBlockAttributes;
	setAttributes: (attrs: Partial<GalleryBlockAttributes>) => void;
}

/**
 * Mosaic item labels
 */
const MOSAIC_ITEMS = [
	{ key: 'item1', label: __('First item', 'voxel-fse') },
	{ key: 'item2', label: __('Second item', 'voxel-fse') },
	{ key: 'item3', label: __('Third item', 'voxel-fse') },
	{ key: 'item4', label: __('Fourth item', 'voxel-fse') },
	{ key: 'item5', label: __('Fifth item', 'voxel-fse') },
	{ key: 'item6', label: __('Sixth item', 'voxel-fse') },
];

export function ContentTab({ attributes, setAttributes }: ContentTabProps): JSX.Element {
	/**
	 * Update mosaic config for specific item and field (with responsive support)
	 */
	// @ts-ignore -- unused but kept for future use
	const _updateMosaicItem = (
		itemKey: string,
		field: string, // e.g., 'colSpan', 'colSpan_tablet', 'colSpan_mobile'
		value: number | null
	) => {
		const currentMosaic = attributes.mosaic;
		const currentItem = currentMosaic[itemKey as keyof typeof currentMosaic] || {
			colSpan: null,
			colStart: null,
			rowSpan: null,
			rowStart: null,
		};

		setAttributes({
			mosaic: {
				...currentMosaic,
				[itemKey]: {
					...currentItem,
					[field]: value,
				},
			},
		});
	};

	/**
	 * Convert images array to GalleryUploadControl format
	 * IMPORTANT: Include sizes for image resolution to work after reload
	 */
	const imagesToUploadFormat = (images: typeof attributes.images): ImageUploadValue[] => {
		return images.map((img) => ({
			id: img.id,
			url: img.url,
			alt: img.alt,
			sizes: img.sizes,
		}));
	};

	/**
	 * Convert GalleryUploadControl format back to images array
	 * IMPORTANT: Preserve sizes object for image resolution selection
	 */
	const uploadFormatToImages = (uploadImages: ImageUploadValue[]): typeof attributes.images => {
		return uploadImages.map((img) => ({
			id: img.id || 0,
			url: img.url || '',
			alt: img.alt || '',
			caption: '',
			description: '',
			title: '',
			sizes: img.sizes || {},
		}));
	};

	/**
	 * Render mosaic controls for a single item
	 * Uses ResponsiveRangeControl with nested attribute handling
	 */
	const renderMosaicItemControls = (itemKey: string, itemLabel: string) => {
		const item = attributes.mosaic[itemKey as keyof typeof attributes.mosaic] || {
			colSpan: null,
			colStart: null,
			rowSpan: null,
			rowStart: null,
		};

		// Create a flattened attributes object for ResponsiveRangeControl
		// Maps nested mosaic.item1.colSpan to flat colSpan, colSpan_tablet, colSpan_mobile
		const createFlatAttributes = (baseField: string) => {
			return {
				[baseField]: item[baseField as keyof typeof item] ?? undefined,
				[`${baseField}_tablet`]: item[`${baseField}_tablet` as keyof typeof item] ?? undefined,
				[`${baseField}_mobile`]: item[`${baseField}_mobile` as keyof typeof item] ?? undefined,
			};
		};

		const createFlatSetAttributes = (baseField: string) => {
			return (attrs: Record<string, any>) => {
				// Extract the responsive values and update mosaic
				const updates: Record<string, any> = {};
				Object.keys(attrs).forEach((key) => {
					if (key.startsWith(baseField)) {
						updates[key] = attrs[key];
					}
				});

				// Update the nested mosaic structure
				const currentMosaic = attributes.mosaic;
				const currentItem = currentMosaic[itemKey as keyof typeof currentMosaic] || {
					colSpan: null,
					colStart: null,
					rowSpan: null,
					rowStart: null,
				};

				setAttributes({
					mosaic: {
						...currentMosaic,
						[itemKey]: {
							...currentItem,
							...updates,
						},
					},
				});
			};
		};

		// Get dynamic tag value for a field from the nested mosaic structure
		const getDynamicTagValue = (baseField: string): string | undefined => {
			const dynamicTagKey = `${baseField}DynamicTag` as keyof typeof item;
			return item[dynamicTagKey] as string | undefined;
		};

		// Create handler to update dynamic tag value in nested mosaic structure
		const createDynamicTagChangeHandler = (baseField: string) => {
			return (value: string | undefined) => {
				const currentMosaic = attributes.mosaic;
				const currentItem = currentMosaic[itemKey as keyof typeof currentMosaic] || {
					colSpan: null,
					colStart: null,
					rowSpan: null,
					rowStart: null,
				};

				setAttributes({
					mosaic: {
						...currentMosaic,
						[itemKey]: {
							...currentItem,
							[`${baseField}DynamicTag`]: value,
						},
					},
				});
			};
		};

		return (
			<div key={itemKey} style={{ marginBottom: '24px' }}>
				<SectionHeading label={itemLabel} />

				<ResponsiveRangeControl
					label={__('Column span', 'voxel-fse')}
					attributes={createFlatAttributes('colSpan') as any}
					setAttributes={createFlatSetAttributes('colSpan')}
					attributeBaseName="colSpan"
					min={0}
					max={24}
					help={__('How many columns this item spans in the grid', 'voxel-fse')}
					enableDynamicTags={true}
					dynamicTagValue={getDynamicTagValue('colSpan')}
					onDynamicTagChange={createDynamicTagChangeHandler('colSpan')}
					dynamicTagContext="post"
				/>

				<ResponsiveRangeControl
					label={__('Column start', 'voxel-fse')}
					attributes={createFlatAttributes('colStart') as any}
					setAttributes={createFlatSetAttributes('colStart')}
					attributeBaseName="colStart"
					min={0}
					max={24}
					help={__('The start position column for this item', 'voxel-fse')}
					enableDynamicTags={true}
					dynamicTagValue={getDynamicTagValue('colStart')}
					onDynamicTagChange={createDynamicTagChangeHandler('colStart')}
					dynamicTagContext="post"
				/>

				<ResponsiveRangeControl
					label={__('Row span', 'voxel-fse')}
					attributes={createFlatAttributes('rowSpan') as any}
					setAttributes={createFlatSetAttributes('rowSpan')}
					attributeBaseName="rowSpan"
					min={0}
					max={24}
					help={__('How many rows this item spans in the grid', 'voxel-fse')}
					enableDynamicTags={true}
					dynamicTagValue={getDynamicTagValue('rowSpan')}
					onDynamicTagChange={createDynamicTagChangeHandler('rowSpan')}
					dynamicTagContext="post"
				/>

				<ResponsiveRangeControl
					label={__('Row start', 'voxel-fse')}
					attributes={createFlatAttributes('rowStart') as any}
					setAttributes={createFlatSetAttributes('rowStart')}
					attributeBaseName="rowStart"
					min={0}
					max={24}
					help={__('The start position row for this item', 'voxel-fse')}
					enableDynamicTags={true}
					dynamicTagValue={getDynamicTagValue('rowStart')}
					onDynamicTagChange={createDynamicTagChangeHandler('rowStart')}
					dynamicTagContext="post"
				/>
			</div>
		);
	};

	return (
		<AccordionPanelGroup
			attributes={attributes as Record<string, any>}
			setAttributes={setAttributes as (attrs: Record<string, any>) => void}
			stateAttribute="contentTabOpenPanel"
			defaultPanel="images"
		>
			{/* Images Accordion */}
			<AccordionPanel id="images" title={__('Images', 'voxel-fse')}>
				{/* Gallery Upload with Dynamic Tag Support */}
				<GalleryUploadControl
					label={__('Add Images', 'voxel-fse')}
					value={imagesToUploadFormat(attributes.images)}
					onChange={(images) => setAttributes({ images: uploadFormatToImages(images) })}
					enableDynamicTags={true}
					dynamicTagValue={attributes.imagesDynamicTag}
					onDynamicTagChange={(value) => setAttributes({ imagesDynamicTag: value })}
					dynamicTagContext="post"
				/>

				{/* Number of images to load */}
				<ResponsiveRangeControl
					label={__('Number of images to load', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="visibleCount"
					min={1}
					max={20}
					enableDynamicTags={true}
					dynamicTagValue={attributes.visibleCountDynamicTag}
					onDynamicTagChange={(value: string | undefined) => setAttributes({ visibleCountDynamicTag: value })}
					dynamicTagContext="post"
				/>

				{/* Image size (responsive) */}
				<ResponsiveSelectControl
					label={__('Image size', 'voxel-fse')}
					value={attributes.displaySize}
					valueTablet={attributes.displaySize_tablet}
					valueMobile={attributes.displaySize_mobile}
					onChange={(value) => {
						console.log('[ContentTab] displaySize onChange called:', value, 'current:', attributes.displaySize);
						setAttributes({ displaySize: value });
					}}
					onChangeTablet={(value) => setAttributes({ displaySize_tablet: value })}
					onChangeMobile={(value) => setAttributes({ displaySize_mobile: value })}
					options={getImageSizeOptions()}
					controlKey="displaySize"
				/>

				{/* Lightbox size (responsive) */}
				<ResponsiveSelectControl
					label={__('Image size (Lightbox)', 'voxel-fse')}
					value={attributes.lightboxSize}
					valueTablet={attributes.lightboxSize_tablet}
					valueMobile={attributes.lightboxSize_mobile}
					onChange={(value) => setAttributes({ lightboxSize: value })}
					onChangeTablet={(value) => setAttributes({ lightboxSize_tablet: value })}
					onChangeMobile={(value) => setAttributes({ lightboxSize_mobile: value })}
					options={getImageSizeOptions()}
					controlKey="lightboxSize"
				/>

				{/* Columns Section */}
				<SectionHeading label={__('Columns', 'voxel-fse')} />

				{/* Item gap */}
				<ResponsiveRangeControl
					label={__('Item gap', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="columnGap"
					min={0}
					max={100}
				/>

				{/* Number of columns */}
				<ResponsiveRangeControl
					label={__('Number of columns', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="columnCount"
					min={1}
					max={6}
					enableDynamicTags={true}
					dynamicTagValue={attributes.columnCountDynamicTag}
					onDynamicTagChange={(value: string | undefined) => setAttributes({ columnCountDynamicTag: value })}
					dynamicTagContext="post"
				/>

				{/* Remove empty items */}
				<ToggleControl
					label={__('Remove empty items?', 'voxel-fse')}
					checked={attributes.removeEmpty}
					onChange={(value: boolean) => setAttributes({ removeEmpty: value })}
				/>

				{/* Auto fit (conditional) */}
				{attributes.removeEmpty && (
					<ToggleControl
						label={__('Auto fit?', 'voxel-fse')}
						checked={attributes.autoFit}
						onChange={(value: boolean) => setAttributes({ autoFit: value })}
					/>
				)}

				{/* Row height Section */}
				<SectionHeading label={__('Row height', 'voxel-fse')} />

				{/* Set height */}
				{!attributes.useAspectRatio && (
					<ResponsiveRangeControl
						label={__('Set height', 'voxel-fse')}
						attributes={attributes}
						setAttributes={setAttributes}
						attributeBaseName="rowHeight"
						min={50}
						max={500}
					/>
				)}

				{/* Use aspect ratio instead */}
				<ToggleControl
					label={__('Use aspect ratio instead?', 'voxel-fse')}
					checked={attributes.useAspectRatio}
					onChange={(value: boolean) => setAttributes({ useAspectRatio: value })}
				/>

				{/* Aspect ratio (conditional, responsive) */}
				{attributes.useAspectRatio && (
					<ResponsiveTextControl
						label={__('Aspect ratio', 'voxel-fse')}
						attributes={attributes}
						setAttributes={setAttributes}
						attributeBaseName="aspectRatio"
						placeholder="16/9"
						help={__('Set image aspect ratio e.g 16/9', 'voxel-fse')}
						controlKey="aspectRatio"
					/>
				)}
			</AccordionPanel>

			{/* Mosaic Accordion */}
			<AccordionPanel id="mosaic" title={__('Mosaic', 'voxel-fse')}>
				{MOSAIC_ITEMS.map((item) => renderMosaicItemControls(item.key, item.label))}
			</AccordionPanel>
		</AccordionPanelGroup>
	);
}
