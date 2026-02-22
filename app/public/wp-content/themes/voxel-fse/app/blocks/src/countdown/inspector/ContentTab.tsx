/**
 * Countdown Block - Content Tab Inspector Controls
 *
 * Extracted from edit.tsx for maintainability.
 * Contains: Content settings (due date, ended text, visibility toggles).
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import { PanelBody, ToggleControl } from '@wordpress/components';

import { DynamicTagDateTimeControl, DynamicTagTextControl } from '@shared/controls';

import type { CountdownAttributes } from '../types';

interface ContentTabProps {
	attributes: CountdownAttributes;
	setAttributes: (attrs: Partial<CountdownAttributes>) => void;
}

/**
 * Content Tab Component
 *
 * Renders the Content tab with:
 * - Due Date (with dynamic tag support)
 * - Countdown Ended Text (with dynamic tag support)
 * - Visibility toggles (hide seconds, minutes, hours, days)
 */
export function ContentTab({ attributes, setAttributes }: ContentTabProps): JSX.Element {
	return (
		<PanelBody title={__('Content', 'voxel-fse')} initialOpen={true}>
			<DynamicTagDateTimeControl
				label={__('Due Date', 'voxel-fse')}
				value={attributes.dueDate}
				onChange={(value) => setAttributes({ dueDate: value })}
				placeholder="YYYY-MM-DD HH:mm:ss"
				context="post"
			/>

			<DynamicTagTextControl
				label={__('Countdown Ended Text', 'voxel-fse')}
				value={attributes.countdownEndedText}
				onChange={(value) => setAttributes({ countdownEndedText: value })}
				help={__('Message displayed when countdown reaches zero', 'voxel-fse')}
				context="post"
			/>

			<ToggleControl
				label={__('Hide seconds', 'voxel-fse')}
				checked={attributes.hideSeconds}
				onChange={(value: boolean) => setAttributes({ hideSeconds: value })}
			/>

			<ToggleControl
				label={__('Hide minutes', 'voxel-fse')}
				checked={attributes.hideMinutes}
				onChange={(value: boolean) => setAttributes({ hideMinutes: value })}
			/>

			<ToggleControl
				label={__('Hide hours', 'voxel-fse')}
				checked={attributes.hideHours}
				onChange={(value: boolean) => setAttributes({ hideHours: value })}
			/>

			<ToggleControl
				label={__('Hide days', 'voxel-fse')}
				checked={attributes.hideDays}
				onChange={(value: boolean) => setAttributes({ hideDays: value })}
			/>
		</PanelBody>
	);
}
