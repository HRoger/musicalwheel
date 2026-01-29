/**
 * Current Plan Block - Content Tab Inspector Controls
 *
 * Extracted from edit.tsx for maintainability.
 * Contains: Icons accordion.
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/modules/paid-memberships/widgets/current-plan-widget.php:L77-L118
 * - Section: ts_ui_icons (Content tab > Icons accordion)
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import {
	IconPickerControl,
	AccordionPanelGroup,
	AccordionPanel,
} from '@shared/controls';
import type { CurrentPlanAttributes } from '../types';

interface ContentTabProps {
	attributes: CurrentPlanAttributes;
	setAttributes: (attrs: Partial<CurrentPlanAttributes>) => void;
}

/**
 * Content Tab Component
 *
 * Renders the Content tab with one accordion section:
 * - Icons (icon customization for all plan actions)
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
			{/* Icons Accordion - matches Voxel's ts_ui_icons section */}
			<AccordionPanel id="icons" title={__('Icons', 'voxel-fse')}>
				{/* Plan icon - matches ts_plan_icon control */}
				<IconPickerControl
					label={__('Plan icon', 'voxel-fse')}
					value={attributes.planIcon}
					onChange={(value) => setAttributes({ planIcon: value })}
				/>

				{/* View plans icon - matches ts_view_plans_icon control */}
				<IconPickerControl
					label={__('View plans icon', 'voxel-fse')}
					value={attributes.viewPlansIcon}
					onChange={(value) => setAttributes({ viewPlansIcon: value })}
				/>

				{/* Customize plan icon - matches ts_configure_icon control */}
				<IconPickerControl
					label={__('Customize plan icon', 'voxel-fse')}
					value={attributes.configureIcon}
					onChange={(value) => setAttributes({ configureIcon: value })}
				/>

				{/* Switch icon - matches ts_switch_icon control */}
				<IconPickerControl
					label={__('Switch icon', 'voxel-fse')}
					value={attributes.switchIcon}
					onChange={(value) => setAttributes({ switchIcon: value })}
				/>

				{/* Cancel icon - matches ts_cancel_icon control */}
				<IconPickerControl
					label={__('Cancel icon', 'voxel-fse')}
					value={attributes.cancelIcon}
					onChange={(value) => setAttributes({ cancelIcon: value })}
				/>

				{/* Portal icon - matches ts_portal_icon control */}
				<IconPickerControl
					label={__('Portal icon', 'voxel-fse')}
					value={attributes.portalIcon}
					onChange={(value) => setAttributes({ portalIcon: value })}
				/>
			</AccordionPanel>
		</AccordionPanelGroup>
	);
}
