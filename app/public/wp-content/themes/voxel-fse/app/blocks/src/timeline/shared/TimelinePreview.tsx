/**
 * Timeline Block - Editor Preview Component
 *
 * Displays a configuration summary in the editor.
 * The actual timeline is rendered by Voxel's Vue on the frontend.
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import type { TimelinePreviewProps } from '../types';
import { DISPLAY_MODE_OPTIONS } from '../types';

/**
 * Get display label for mode
 */
function getModeLabel(mode: string): string {
	const option = DISPLAY_MODE_OPTIONS.find((opt) => opt.value === mode);
	return option?.label || mode;
}

/**
 * Timeline Preview Component
 */
export function TimelinePreview({ attributes, isEditor }: TimelinePreviewProps): JSX.Element {
	const { mode, searchEnabled, noStatusText } = attributes;
	// Ensure orderingOptions is always an array
	const orderingOptions = attributes.orderingOptions ?? [];

	return (
		<div className="voxel-fse-timeline-preview">
			<div className="voxel-fse-timeline-preview__header">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					width="24"
					height="24"
					fill="currentColor"
				>
					<path d="M13.5 2c-5.288 0-9.649 3.914-10.377 9h-3.123l4 5.917 4-5.917h-2.847c.711-3.972 4.174-7 8.347-7 4.687 0 8.5 3.813 8.5 8.5s-3.813 8.5-8.5 8.5c-3.015 0-5.662-1.583-7.171-3.957l-1.2 1.775c1.916 2.536 4.948 4.182 8.371 4.182 5.79 0 10.5-4.71 10.5-10.5s-4.71-10.5-10.5-10.5z"/>
				</svg>
				<span>{__('Timeline (VX)', 'voxel-fse')}</span>
			</div>

			<div className="voxel-fse-timeline-preview__content">
				<div className="voxel-fse-timeline-preview__row">
					<span className="voxel-fse-timeline-preview__label">
						{__('Mode:', 'voxel-fse')}
					</span>
					<span className="voxel-fse-timeline-preview__value">
						{getModeLabel(mode)}
					</span>
				</div>

				<div className="voxel-fse-timeline-preview__row">
					<span className="voxel-fse-timeline-preview__label">
						{__('Ordering options:', 'voxel-fse')}
					</span>
					<span className="voxel-fse-timeline-preview__value">
						{orderingOptions.length} {orderingOptions.length === 1 ? 'option' : 'options'}
					</span>
				</div>

				{orderingOptions.length > 0 && (
					<div className="voxel-fse-timeline-preview__ordering">
						{orderingOptions.map((opt, index) => (
							<span key={opt._id} className="voxel-fse-timeline-preview__tag">
								{opt.label}
							</span>
						))}
					</div>
				)}

				<div className="voxel-fse-timeline-preview__row">
					<span className="voxel-fse-timeline-preview__label">
						{__('Search:', 'voxel-fse')}
					</span>
					<span className="voxel-fse-timeline-preview__value">
						{searchEnabled ? __('Enabled', 'voxel-fse') : __('Disabled', 'voxel-fse')}
					</span>
				</div>

				<div className="voxel-fse-timeline-preview__row">
					<span className="voxel-fse-timeline-preview__label">
						{__('Empty text:', 'voxel-fse')}
					</span>
					<span className="voxel-fse-timeline-preview__value voxel-fse-timeline-preview__value--truncate">
						{noStatusText || __('(default)', 'voxel-fse')}
					</span>
				</div>
			</div>

			<div className="voxel-fse-timeline-preview__footer">
				<small>
					{isEditor
						? __('The timeline will be rendered on the frontend using Voxel\'s Vue.js engine.', 'voxel-fse')
						: __('Loading timeline...', 'voxel-fse')
					}
				</small>
			</div>
		</div>
	);
}

export default TimelinePreview;
