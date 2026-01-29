/**
 * Countdown Block - Style Tab Inspector Controls
 *
 * Extracted from edit.tsx for maintainability.
 * Contains: Style accordion (animation, orientation, spacing, colors, typography).
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import { ToggleControl } from '@wordpress/components';

import {
	ResponsiveRangeControl,
	ColorControl,
	TypographyControl,
	AccordionPanelGroup,
	AccordionPanel,
} from '@shared/controls';

import type { CountdownAttributes } from '../types';

interface StyleTabProps {
	attributes: CountdownAttributes;
	setAttributes: (attrs: Partial<CountdownAttributes>) => void;
}

/**
 * Style Tab Component
 *
 * Renders the Style tab with one accordion section:
 * - Style (animation, orientation, spacing, colors, typography)
 */
export function StyleTab({ attributes, setAttributes }: StyleTabProps): JSX.Element {
	return (
		<AccordionPanelGroup
			defaultPanel="style"
			attributes={attributes as Record<string, any>}
			setAttributes={setAttributes as (attrs: Record<string, any>) => void}
			stateAttribute="styleTabOpenPanel"
		>
			<AccordionPanel id="style" title={__('Style', 'voxel-fse')}>
				<ToggleControl
					label={__('Disable reveal animation', 'voxel-fse')}
					checked={attributes.disableAnimation}
					onChange={(value: boolean) => setAttributes({ disableAnimation: value })}
					help={__('Disable the fade animation when numbers change', 'voxel-fse')}
				/>

				<ToggleControl
					label={__('Horizontal orientation', 'voxel-fse')}
					checked={attributes.horizontalOrientation}
					onChange={(value: boolean) => setAttributes({ horizontalOrientation: value })}
					help={__('Display number and label side by side', 'voxel-fse')}
				/>

				<ResponsiveRangeControl
					label={__('Item spacing', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="itemSpacing"
					min={0}
					max={200}
					step={1}
				/>

				<ResponsiveRangeControl
					label={__('Content spacing', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="contentSpacing"
					min={0}
					max={200}
					step={1}
				/>

				<ColorControl
					label={__('Text Color', 'voxel-fse')}
					value={attributes.textColor}
					onChange={(value) => setAttributes({ textColor: value })}
				/>

				<ColorControl
					label={__('Number Color', 'voxel-fse')}
					value={attributes.numberColor}
					onChange={(value) => setAttributes({ numberColor: value })}
				/>

				<ColorControl
					label={__('Ended Color', 'voxel-fse')}
					value={attributes.endedColor}
					onChange={(value) => setAttributes({ endedColor: value })}
				/>

				<TypographyControl
					label={__('Text Typography', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					typographyAttributeName="textTypography"
				/>

				<TypographyControl
					label={__('Number Typography', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					typographyAttributeName="numberTypography"
				/>

				<TypographyControl
					label={__('Ended Typography', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					typographyAttributeName="endedTypography"
				/>
			</AccordionPanel>
		</AccordionPanelGroup>
	);
}
