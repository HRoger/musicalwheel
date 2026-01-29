<?php
    $_parent_classes = [
        'eb-news-ticker-main-wrap',
        'main-wrap-' . $blockId,
        $preset,
        $arrows == 1 ? 'eb-news-ticker-controls' : '',
        $animationDirection == 'false' ? 'ticker-left' : 'ticker-right'
    ];

    $_wrapper_classes = [
        'eb-news-ticker-wrapper',
        $blockId,
        $animationType,
        $preset,
        $contentSource,
        $className
    ];
    $_dir = [
        $animationDirection == 'false' ? 'ltr' : 'rtl'
    ];

	$wrapper_attributes = get_block_wrapper_attributes(
	[
		'class' => 'root-' . $blockId,
	]
);
?>
<div <?php echo wp_kses_data($wrapper_attributes); ?>>
	<div class="eb-parent-wrapper eb-parent-<?php esc_attr_e( $blockId );?><?php esc_attr_e( $classHook );?>">
		<div dir="<?php esc_attr_e( implode( ' ', $_dir ) );?>" class="<?php esc_attr_e( implode( ' ', $_parent_classes ) );?>">
			<div class="ticker-label">
				<?php
					if ( $showLabelIcon ) {
						echo sprintf( '%1$s', $helper::eb_render_icon( $helper::eb_get_icon_type( $labelIcon ), '', $labelIcon ) );
					}

				echo $newsLabel;?>
			</div>
			<div class="ticker-content-wrap">
				<div
				dir="<?php esc_attr_e( implode( ' ', $_dir ) );?>"
				class="<?php esc_attr_e( implode( ' ', $_wrapper_classes ) );?>"
				data-id="<?php esc_attr_e( $blockId );?>"
				data-querydata="<?php esc_attr_e( json_encode( $queryData ) );?>"
				data-slidersettings="<?php esc_attr_e( json_encode( $sliderSettings ) );?>"
				data-attributes="<?php esc_attr_e( json_encode( $essentialAttr ) );?>">

				<?php

					if ( $contentSource == 'dynamic-content' ) {
						if ( ! empty( $posts ) ) {
							$html = '';

							foreach ( $posts as $result ) {
								// title
								$eb_title = wp_kses( $result->post_title, 'post' );
								if ( ! empty( $titleLength ) ) {
									$eb_title = $block_object->truncate( $eb_title, $titleLength );
								}

								/**
								 * Article Markup
								 */
								$html .= sprintf( '<div class="eb-news-ticker-content" data-id="%1$s"><a class="eb-news-ticker-content-inner" href="%2$s" title="%3$s">%4$s</a></div>', $result->ID, get_permalink( $result->ID ),
									esc_attr( $eb_title ),
									$eb_title,
								);
							}

							echo wp_kses( $html, 'post' );
						}

						/**
						 * No Post Markup
						 */
						if ( empty( $posts ) ) {
							$helper::views( 'common/no-content', [
								'content' => __( 'No Posts Found', 'essential-blocks' )
							] );
						}
					} else {
						$html = '';

						foreach ( $news as $key => $item ) {
							$html .= '<div class="eb-news-ticker-content">';

							if ( $showReadMore ) {
								if ( $item['linkOpenNewTab'] && $item['linkOpenNewTab'] === true ) {
									$html .= sprintf( '<a class="eb-news-ticker-content-inner" href="%3$s" data-id="%1$s" target="_blank">%2$s</a>', $key + 1, $item['content'], $item['link'] );
								} else {
									$html .= sprintf( '<a class="eb-news-ticker-content-inner" href="%3$s" data-id="%1$s">%2$s</a>', $key + 1, $item['content'], $item['link'] );
								}
							} else {
								$html .= sprintf( '<div class="eb-news-ticker-content-inner" data-id="%1$s">%2$s</div>', $key + 1, $item['content'] );
							}

							$html .= '</div>';
						}

						echo wp_kses( $html, 'post' );
					}

				?>
			</div>
			</div>
		</div>
	</div>
</div>
