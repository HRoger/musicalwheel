import { useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

interface TimelineAttributes {
	postTypes: string[];
	limit: number;
	showAvatars: boolean;
	showTimestamp: boolean;
	enableInfiniteScroll: boolean;
}

interface EditProps {
	attributes: TimelineAttributes;
}

export default function Edit({ attributes }: EditProps) {
	const blockProps = useBlockProps({
		className: 'wp-block-musicalwheel-timeline editor-preview',
	});

	const { limit, showAvatars, showTimestamp, enableInfiniteScroll } = attributes;

	return (
		<div {...blockProps}>
			<div className="timeline-preview">
				<div className="timeline-preview__header">
					<svg className="timeline-preview__icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
						<path
							d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
							fill="currentColor"
						/>
					</svg>
					<h3 className="timeline-preview__title">{__('Timeline', 'musicalwheel-fse')}</h3>
				</div>

				<div className="timeline-preview__settings">
					<span className="timeline-preview__badge">
						{limit} {__('items', 'musicalwheel-fse')}
					</span>
					{showAvatars && (
						<span className="timeline-preview__badge">
							{__('Avatars', 'musicalwheel-fse')}
						</span>
					)}
					{showTimestamp && (
						<span className="timeline-preview__badge">
							{__('Timestamps', 'musicalwheel-fse')}
						</span>
					)}
					{enableInfiniteScroll && (
						<span className="timeline-preview__badge">
							{__('Infinite Scroll', 'musicalwheel-fse')}
						</span>
					)}
				</div>

				<div className="timeline-preview__info">
					<p>
						{__(
							'This block will display a social activity timeline on the frontend.',
							'musicalwheel-fse'
						)}
					</p>
					<p>
						{__(
							'Configure block settings in the sidebar when WordPress component types are available.',
							'musicalwheel-fse'
						)}
					</p>
				</div>
			</div>
		</div>
	);
}
