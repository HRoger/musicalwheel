/**
 * Custom Popup Menu Control
 *
 * Shared control for styling custom popup menu items with Normal/Hover states.
 * Used by Quick Search and other blocks that have custom popup menu styling.
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import {
	ColorControl,
	ResponsiveRangeControl,
	TypographyControl,
	DimensionsControl,
	StateTabPanel,
	SectionHeading,
} from './index';

interface CustomPopupMenuControlProps {
	attributes: any;
	setAttributes: (attributes: any) => void;
	attributeNames?: {
		// State tracking
		stateTab?: string;

		// Normal Tab - Item
		itemPadding?: string;
		itemHeight?: string;
		itemBorderRadius?: string;

		// Normal Tab - Title
		titleColor?: string;
		titleTypography?: string;

		// Normal Tab - Logo/Image
		logoWidth?: string;
		logoRadius?: string;

		// Normal Tab - Icon
		iconColor?: string;
		iconSize?: string;

		// Normal Tab - Icon Container
		iconContainerSize?: string;
		iconContainerSpacing?: string;

		// Normal Tab - Chevron
		chevronColor?: string;

		// Hover Tab
		itemBackgroundHover?: string;
		titleColorHover?: string;
		iconColorHover?: string;
	};
}

export default function CustomPopupMenuControl({
	attributes,
	setAttributes,
	attributeNames = {},
}: CustomPopupMenuControlProps) {
	const keys = {
		stateTab: attributeNames.stateTab || 'customPopupMenuState',
		// Item
		itemPadding: attributeNames.itemPadding || 'menuItemPadding',
		itemHeight: attributeNames.itemHeight || 'menuItemHeight',
		itemBorderRadius:
			attributeNames.itemBorderRadius || 'menuItemBorderRadius',
		// Title
		titleColor: attributeNames.titleColor || 'menuTitleColor',
		titleTypography:
			attributeNames.titleTypography || 'menuTitleTypography',
		// Logo
		logoWidth: attributeNames.logoWidth || 'menuLogoWidth',
		logoRadius: attributeNames.logoRadius || 'menuLogoRadius',
		// Icon
		iconColor: attributeNames.iconColor || 'menuIconColor',
		iconSize: attributeNames.iconSize || 'menuIconSize',
		// Icon Container
		iconContainerSize:
			attributeNames.iconContainerSize || 'menuIconContainerSize',
		iconContainerSpacing:
			attributeNames.iconContainerSpacing || 'menuIconContainerSpacing',
		// Chevron
		chevronColor: attributeNames.chevronColor || 'menuChevronColor',
		// Hover
		itemBackgroundHover:
			attributeNames.itemBackgroundHover || 'menuItemBackgroundHover',
		titleColorHover:
			attributeNames.titleColorHover || 'menuTitleColorHover',
		iconColorHover: attributeNames.iconColorHover || 'menuIconColorHover',
	};

	return (
		<StateTabPanel
			attributeName={keys.stateTab}
			attributes={attributes}
			setAttributes={setAttributes}
			tabs={[
				{ name: 'normal', title: __('Normal', 'voxel-fse') },
				{ name: 'hover', title: __('Hover', 'voxel-fse') },
			]}
		>
			{(tab) => {
				if (tab.name === 'normal') {
					return (
						<>
							<SectionHeading label={__('Item', 'voxel-fse')} />
							<DimensionsControl
								label={__('Item padding', 'voxel-fse')}
								values={attributes[keys.itemPadding] || {}}
								onChange={(values) =>
									setAttributes({ [keys.itemPadding]: values })
								}
							/>
							<ResponsiveRangeControl
								label={__('Height', 'voxel-fse')}
								attributes={attributes}
								setAttributes={setAttributes}
								attributeBaseName={keys.itemHeight}
								min={0}
								max={100}
							/>
							<ResponsiveRangeControl
								label={__('Border radius', 'voxel-fse')}
								attributes={attributes}
								setAttributes={setAttributes}
								attributeBaseName={keys.itemBorderRadius}
								min={0}
								max={100}
							/>

							<SectionHeading label={__('Title', 'voxel-fse')} />
							<ColorControl
								label={__('Title color', 'voxel-fse')}
								value={attributes[keys.titleColor]}
								onChange={(value) =>
									setAttributes({ [keys.titleColor]: value })
								}
							/>
							<TypographyControl
								label={__('Title typography', 'voxel-fse')}
								attributes={attributes}
								setAttributes={setAttributes}
								typographyAttributeName={keys.titleTypography}
							/>

							<SectionHeading label={__('Logo/Image', 'voxel-fse')} />
							<ResponsiveRangeControl
								label={__('Width', 'voxel-fse')}
								attributes={attributes}
								setAttributes={setAttributes}
								attributeBaseName={keys.logoWidth}
								min={0}
								max={40}
							/>
							<ResponsiveRangeControl
								label={__('Radius', 'voxel-fse')}
								attributes={attributes}
								setAttributes={setAttributes}
								attributeBaseName={keys.logoRadius}
								min={0}
								max={100}
							/>

							<SectionHeading label={__('Icon', 'voxel-fse')} />
							<ColorControl
								label={__('Icon color', 'voxel-fse')}
								value={attributes[keys.iconColor]}
								onChange={(value) =>
									setAttributes({ [keys.iconColor]: value })
								}
							/>
							<ResponsiveRangeControl
								label={__('Icon size', 'voxel-fse')}
								attributes={attributes}
								setAttributes={setAttributes}
								attributeBaseName={keys.iconSize}
								min={0}
								max={40}
							/>

							<SectionHeading label={__('Icon container', 'voxel-fse')} />
							<ResponsiveRangeControl
								label={__('Size', 'voxel-fse')}
								attributes={attributes}
								setAttributes={setAttributes}
								attributeBaseName={keys.iconContainerSize}
								min={0}
								max={40}
							/>
							<ResponsiveRangeControl
								label={__('Spacing', 'voxel-fse')}
								attributes={attributes}
								setAttributes={setAttributes}
								attributeBaseName={keys.iconContainerSpacing}
								min={0}
								max={50}
							/>

							<SectionHeading label={__('Chevron', 'voxel-fse')} />
							<ColorControl
								label={__('Chevron color', 'voxel-fse')}
								value={attributes[keys.chevronColor]}
								onChange={(value) =>
									setAttributes({ [keys.chevronColor]: value })
								}
							/>
						</>
					);
				}

				if (tab.name === 'hover') {
					return (
						<>
							<SectionHeading label={__('Term item', 'voxel-fse')} />
							<ColorControl
								label={__('List item background', 'voxel-fse')}
								value={attributes[keys.itemBackgroundHover]}
								onChange={(value) =>
									setAttributes({ [keys.itemBackgroundHover]: value })
								}
							/>
							<ColorControl
								label={__('Title color', 'voxel-fse')}
								value={attributes[keys.titleColorHover]}
								onChange={(value) =>
									setAttributes({ [keys.titleColorHover]: value })
								}
							/>
							<ColorControl
								label={__('Icon color', 'voxel-fse')}
								value={attributes[keys.iconColorHover]}
								onChange={(value) =>
									setAttributes({ [keys.iconColorHover]: value })
								}
							/>
						</>
					);
				}

				return null;
			}}
		</StateTabPanel>
	);
}
