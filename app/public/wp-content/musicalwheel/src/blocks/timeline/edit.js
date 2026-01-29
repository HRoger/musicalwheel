/**
 * Timeline Edit Component
 */

import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl, RangeControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function Edit({ attributes, setAttributes }) {
	const { feedType, orderBy, postsPerPage, showComposer, enableSearch } = attributes;

	const blockProps = useBlockProps({
		className: 'mw-timeline-editor',
	});

	const feedTypeOptions = [
		{ label: __('User Feed', 'musicalwheel'), value: 'user_feed' },
		{ label: __('Global Feed', 'musicalwheel'), value: 'global_feed' },
		{ label: __('Post Timeline', 'musicalwheel'), value: 'post_timeline' },
		{ label: __('Post Wall', 'musicalwheel'), value: 'post_wall' },
		{ label: __('Post Reviews', 'musicalwheel'), value: 'post_reviews' },
		{ label: __('Author Timeline', 'musicalwheel'), value: 'author_timeline' },
	];

	const orderByOptions = [
		{ label: __('Latest First', 'musicalwheel'), value: 'latest' },
		{ label: __('Earliest First', 'musicalwheel'), value: 'earliest' },
		{ label: __('Most Liked', 'musicalwheel'), value: 'most_liked' },
		{ label: __('Most Discussed', 'musicalwheel'), value: 'most_discussed' },
	];

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Timeline Settings', 'musicalwheel')} initialOpen={true}>
					<SelectControl
						label={__('Feed Type', 'musicalwheel')}
						value={feedType}
						options={feedTypeOptions}
						onChange={(value) => setAttributes({ feedType: value })}
						help={__('Select the type of timeline feed to display', 'musicalwheel')}
					/>

					<SelectControl
						label={__('Order By', 'musicalwheel')}
						value={orderBy}
						options={orderByOptions}
						onChange={(value) => setAttributes({ orderBy: value })}
					/>

					<RangeControl
						label={__('Posts Per Page', 'musicalwheel')}
						value={postsPerPage}
						onChange={(value) => setAttributes({ postsPerPage: value })}
						min={5}
						max={50}
						step={5}
					/>

					<ToggleControl
						label={__('Show Status Composer', 'musicalwheel')}
						checked={showComposer}
						onChange={(value) => setAttributes({ showComposer: value })}
						help={__('Allow users to create new status posts', 'musicalwheel')}
					/>

					<ToggleControl
						label={__('Enable Search', 'musicalwheel')}
						checked={enableSearch}
						onChange={(value) => setAttributes({ enableSearch: value })}
						help={__('Show search input for filtering statuses', 'musicalwheel')}
					/>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<div className="mw-timeline-preview">
					<div className="mw-timeline-preview__header">
						<h3>{__('Timeline', 'musicalwheel')}</h3>
						<div className="mw-timeline-preview__settings">
							<span className="mw-timeline-preview__badge">
								{feedTypeOptions.find(opt => opt.value === feedType)?.label}
							</span>
							<span className="mw-timeline-preview__badge">
								{orderByOptions.find(opt => opt.value === orderBy)?.label}
							</span>
						</div>
					</div>

					{showComposer && (
						<div className="mw-timeline-composer-preview">
							<div className="mw-timeline-composer-preview__input">
								{__("What's on your mind?", 'musicalwheel')}
							</div>
						</div>
					)}

					<div className="mw-timeline-status-preview">
						<div className="mw-timeline-status-preview__avatar"></div>
						<div className="mw-timeline-status-preview__content">
							<div className="mw-timeline-status-preview__author">
								{__('User Name', 'musicalwheel')}
							</div>
							<div className="mw-timeline-status-preview__text">
								{__('Status content will appear here...', 'musicalwheel')}
							</div>
							<div className="mw-timeline-status-preview__actions">
								<span>❤️ {__('Like', 'musicalwheel')}</span>
								<span>💬 {__('Reply', 'musicalwheel')}</span>
							</div>
						</div>
					</div>

					<div className="mw-timeline-preview__footer">
						<p>
							{__('Showing ', 'musicalwheel')}
							<strong>{postsPerPage}</strong>
							{__(' posts per page', 'musicalwheel')}
						</p>
					</div>
				</div>
			</div>
		</>
	);
}
