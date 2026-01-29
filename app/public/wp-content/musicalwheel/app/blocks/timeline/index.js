/**
 * Timeline Block - Minimal version for testing
 */
(function (wp) {
	const { registerBlockType } = wp.blocks;
	const { useBlockProps } = wp.blockEditor;
	const { __ } = wp.i18n;

	registerBlockType('musicalwheel/timeline', {
		edit: function (props) {
			const blockProps = useBlockProps({
				className: 'wp-block-musicalwheel-timeline editor-preview',
			});

			return wp.element.createElement(
				'div',
				blockProps,
				wp.element.createElement(
					'div',
					{ className: 'timeline-preview' },
					wp.element.createElement('h3', null, __('Timeline Block', 'musicalwheel-fse')),
					wp.element.createElement('p', null, __('This block displays a social activity timeline.', 'musicalwheel-fse'))
				)
			);
		},
		save: function () {
			return null; // Dynamic block, rendered by PHP
		},
	});
})(window.wp);
