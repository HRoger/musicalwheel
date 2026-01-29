/**
 * Current Role Block - Content Tab Inspector Controls
 *
 * Extracted from edit.tsx for maintainability.
 * Contains: Icons accordion.
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import {
	AccordionPanelGroup,
	AccordionPanel,
	IconPickerControl,
} from '@shared/controls';
import type { CurrentRoleAttributes } from '../types';

interface ContentTabProps {
	attributes: CurrentRoleAttributes;
	setAttributes: (attrs: Partial<CurrentRoleAttributes>) => void;
}

/**
 * Content Tab Component
 *
 * Renders the Content tab with one accordion section:
 * - Icons (role icon, switch icon)
 */
export function ContentTab({
	attributes,
	setAttributes,
}: ContentTabProps): JSX.Element {
	return (
		<AccordionPanelGroup
			attributes={attributes as Record<string, any>}
			setAttributes={setAttributes as (attrs: Record<string, any>) => void}
			stateAttribute="contentTabOpenPanel"
			defaultPanel="icons"
		>
			<AccordionPanel id="icons" title={__('Icons', 'voxel-fse')}>
				<IconPickerControl
					label={__('Role icon', 'voxel-fse')}
					value={attributes.roleIcon}
					onChange={(value) => setAttributes({ roleIcon: value })}
				/>
				<IconPickerControl
					label={__('Switch icon', 'voxel-fse')}
					value={attributes.switchIcon}
					onChange={(value) => setAttributes({ switchIcon: value })}
				/>
			</AccordionPanel>
		</AccordionPanelGroup>
	);
}
