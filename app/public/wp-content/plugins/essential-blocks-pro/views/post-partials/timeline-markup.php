<?php

/**
 * @var string $source
 */

$html = '';

foreach ( $posts as $result ) {
    // title
    $eb_title = wp_kses( $result->post_title, 'post' );
    if ( ! empty( $titleLength ) ) {
        $eb_title = $block_object->truncate( $eb_title, $titleLength );
    }

    $title_link_classes = $block_object->get_name() == 'post-grid' ? 'ebpg-grid-post-link' : 'ebpg-carousel-post-link';

    // content
    $_content = ! empty( $result->post_excerpt ) ? $result->post_excerpt : $result->post_content;
    $content  = $block_object->truncate( wp_kses_post( strip_tags( $_content ) ), $contentLength );

    // thumbnail
    $thumbnail = get_the_post_thumbnail( $result->ID, $thumbnailSize );

    /**
     * Article Markup
     */
    $html .= sprintf( '<article class="eb-timeline-slider-item" data-id="%1$s">', $result->ID );
    if ( $preset != 'style-2' ) {
        $html .= '<div class="eb-timeline-slider-item-inner">';
    }

    if ( $preset === 'style-1' ) {
        $html .= '<div class="eb-timeline-slider-item-icon-wrap">';
        $html .= '<div class="eb-timeline-slider-item-icon-info">';
        $html .= sprintf(
            '<span class="eb-timeline-slider-item-date">
            <time dateTime="%1$s">%2$s</time>
        </span>',
            esc_attr( get_the_date( 'c', $result ) ),
            esc_html( get_the_date( '', $result ) )
        );

        $html .= '<div class="eb-timeline-slider-item-icon eb-timeline-slider-item-icon-active">';
        $html .= sprintf( '<i aria-hidden="true" class="%1$s"></i>', $timelineIcon );
        $html .= '</div>';
        $html .= '</div>';
        $html .= '</div>';
    }

    $html .= '<div class="eb-timeline-slider-item-content-wrap">';
    if ( $preset == 'style-2' ) {
        $html .= '<div class="eb-timeline-slider-item-content-inner">';
    }

    if ( $showThumbnail ) {
		if ( ! empty( $thumbnail ) ) {
			$html .= sprintf(
				'<div class="eb-timeline-slider-item-image">
					%1$s
			</div>',
				$thumbnail
			);
        } else {
			if( $showFallbackImg && ! empty( $fallbackImgUrl )) {
				$html .= '<div class="eb-timeline-slider-item-image">
					<img src="' . $fallbackImgUrl . '" alt="' . (!empty($fallbackImgAlt) ? $fallbackImgAlt : 'No Thumbnail Found') . '">
				</div>';
			} else {
				$html .= '<div class="eb-timeline-slider-item-image">
					<img src="https://via.placeholder.com/250x250.png" alt="No Thumbnail Found">
				</div>';
			}
		}
    }
    $html .= '<div class="eb-timeline-slider-item-content">';
    if ( $showTitle ) {
        $html .= sprintf( '<%1$s class="eb-timeline-slider-item-content-title"><a class="%5$s" href="%2$s" title="%3$s">%4$s</a></%1$s>',
            $titleTag,
            get_permalink( $result->ID ),
            esc_attr( $eb_title ),
            $eb_title,
            $title_link_classes
        );
    }

    if ( $showContent ) {
        $html .= sprintf( '<div class="%3$s"><p>%1$s%2$s</p></div>',
            $content,
            $expansionIndicator,
            'eb-timeline-slider-item-content-desc'
        );
    }

    if ( $showReadMore ) {
        $html .= sprintf( '<a href="%2$s" class="eb-timeline-slider-item-btn">%1$s</a>',
            $readmoreText,
            esc_url(get_permalink( $result->ID ))
        );
    }

    $html .= '</div>';
    $html .= '</div>';
    if ( $preset == 'style-2' ) {
        $html .= '</div>';
    }

    if ( $preset === 'style-2' || $preset === 'style-3' ) {
        $html .= '<div class="eb-timeline-slider-item-icon-wrap">';
        $html .= '<div class="eb-timeline-slider-item-icon">';
        $html .= sprintf( '<i aria-hidden="true" class="%1$s"></i>', $timelineIcon );
        $html .= '</div>';

        $html .= '<div class="eb-timeline-slider-item-icon-info">';
        $html .= sprintf(
            '<span class="eb-timeline-slider-item-date">
            <time dateTime="%1$s">%2$s</time>
        </span>',
            esc_attr( get_the_date( 'c', $result ) ),
            esc_html( get_the_date( '', $result ) )
        );
        $html .= '</div>';
        $html .= '</div>';
    }

    if ( $preset != 'style-2' ) {
        $html .= '</div>';
    }

    $html .= '</article>';
}

echo wp_kses( $html, 'post' );