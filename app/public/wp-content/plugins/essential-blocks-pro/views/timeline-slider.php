<?php

    $_parent_classes = [
        'eb-parent-wrapper',
        'eb-parent-' . $blockId,
        $preset,
        $classHook
     ];

    $_wrapper_classes = [
        'eb-timeline-slider-wrapper',
        $blockId,
        $preset,
        $contentSource,
        $className,
        $arrows == 1 ? 'slick-arrows' : 'arrow-none',
        $adaptiveHeight == 1 ? 'equal-height' : 'arrow-none',
        $dotPreset
     ];

    $_eb_classes = [
        'eb-timeline-slider',
        'init-' . $blockId
     ];

    $wrapper_attributes = get_block_wrapper_attributes(
        [
            'class' => 'root-' . $blockId
         ]
    );
?>
<div
<?php echo wp_kses_data( $wrapper_attributes ); ?>
>
	<div class="<?php esc_attr_e( implode( ' ', $_parent_classes ) ); ?>">
		<div
			class="<?php esc_attr_e( implode( ' ', $_wrapper_classes ) ); ?>"
			data-id="<?php esc_attr_e( $blockId ); ?>"
			data-querydata="<?php ( $contentSource === 'dynamic-content' ) ? esc_attr_e( json_encode( $queryData ) ) : ''; ?>"
			data-slidersettings="<?php esc_attr_e( json_encode( $sliderSettings ) ); ?>"
			data-attributes="<?php esc_attr_e( json_encode( $essentialAttr ) ); ?>"
		>

            <div class="eb-timeline-slider-line"></div>
            <div class="<?php esc_attr_e( implode( ' ', $_eb_classes ) ); ?>" data-id="<?php esc_attr_e( $blockId ); ?>">

                <?php

                    if ( $contentSource == 'dynamic-content' ) {
                        if ( ! empty( $posts ) ) {
                            $_defined_vars = get_defined_vars();
                            $_params       = isset( $_defined_vars[ 'data' ] ) ? $_defined_vars[ 'data' ] : [  ];

                            $_params = array_merge( $_params, [
                                'posts'      => $posts,
                                'queryData'  => isset( $queryData ) ? $queryData : [  ],
                                'source'     => isset( $queryData[ 'source' ] ) ? $queryData[ 'source' ] : 'post',
                                'headerMeta' => ! empty( $headerMeta ) ? json_decode( $headerMeta ) : [  ],
                                'footerMeta' => ! empty( $footerMeta ) ? json_decode( $footerMeta ) : [  ]
                             ] );

                            $helper::views( 'post-partials/timeline-markup', $_params );
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

                        foreach ( $timelines as $key => $timeline ) {
                            $eb_title = $timeline[ 'title' ];
                            if ( ! empty( $titleLength ) ) {
                                $phrase_array = explode( ' ', $eb_title );
                                if ( count( $phrase_array ) > $titleLength && $titleLength >= 0 ) {
                                    $eb_title = implode( ' ', array_slice( $phrase_array, 0, $titleLength ) );
                                }
                            }

                            $eb_content = $timeline[ 'content' ];
                            if ( ! empty( $contentLength ) ) {
                                $phrase_array = explode( ' ', $eb_content );
                                if ( count( $phrase_array ) > $contentLength && $contentLength >= 0 ) {
                                    $eb_content = implode( ' ', array_slice( $phrase_array, 0, $contentLength ) );
                                }
                            }

                            $html .= sprintf( '<article class="eb-timeline-slider-item" data-id="%1$s">', $key + 1 );
                            if ( $preset != 'style-2' ) {
                                $html .= '<div class="eb-timeline-slider-item-inner">';
                            }

                            if ( $preset === 'style-1' ) {
                                $html .= '<div class="eb-timeline-slider-item-icon-wrap">';
                                $html .= '<div class="eb-timeline-slider-item-icon-info">';

                                if ( $showSubheading ) {
                                    $html .= sprintf( '<span class="eb-timeline-slider-item-subheading">%1$s</span>', $timeline[ 'subheading' ] );
                                }
                                if ( $showDate ) {
                                    $html .= sprintf( '<span class="eb-timeline-slider-item-date">%1$s</span>', $timeline[ 'date' ] );
                                }
                                $html .= '</div>';
                                $html .= '<div class="eb-timeline-slider-item-icon">';
                                $html .= sprintf( $helper::eb_render_icon( $helper::eb_get_icon_type( $timelineIcon ), '', $timelineIcon ) );
                                $html .= '</div>';
                                $html .= '</div>';
                            }
                            $html .= '<div class="eb-timeline-slider-item-content-wrap">';
                            if ( $preset == 'style-2' ) {
                                $html .= '<div class="eb-timeline-slider-item-content-inner">';
                            }
                            if ( $showThumbnail && $mediaType !== "none" ) {
                                $html .= '<div class="eb-timeline-slider-item-image">';

                                if ( $mediaType == "icon" ) {
                                    $html .= sprintf(
                                        '<i aria-hidden="true" class="%1$s"></i>',
                                        $timeline[ 'icon' ],
                                    );
                                }
                                if ( $mediaType == "image" ) {
                                    $html .= sprintf(
                                        '<img class="eb-timeline-img" src="%1$s" alt="%2$s" />',
                                        $timeline[ 'timelineImage' ] ? $timeline[ 'timelineImage' ] : 'https://via.placeholder.com/250x250.png',
                                        $timeline[ 'timelineImageAlt' ] ? $timeline[ 'timelineImageAlt' ] : $timeline[ 'timelineImageTitle' ],
                                    );
                                }

                                $html .= '</div">';
                            }
                            $html .= '<div class="eb-timeline-slider-item-content">';
                            if ( $showTitle ) {
                                $html .= sprintf(
                                    '<%1$s class="eb-timeline-slider-item-content-title">%2$s</%1$s>',
                                    $titleTag,
                                    $eb_title,
                                );
                            }
                            if ( $showContent ) {
                                $html .= sprintf( '<div class="%3$s"><p>%1$s%2$s</p></div>',
                                    $eb_content,
                                    $expansionIndicator,
                                    'eb-timeline-slider-item-content-desc'
                                );
                            }
                            if ( $showReadMore ) {
                                if ( $timeline[ 'linkOpenNewTab' ] && $timeline[ 'linkOpenNewTab' ] === 'true' ) {
                                    $html .= sprintf( '<a href="%2$s" class="eb-timeline-slider-item-btn" target="_blank">%1$s</a>',
                                        $readmoreText,
                                        esc_url( $timeline[ 'link' ] ),
                                    );
                                } else {
                                    $html .= sprintf( '<a href="%2$s" class="eb-timeline-slider-item-btn">%1$s</a>',
                                        $readmoreText,
                                        esc_url( $timeline[ 'link' ] ),
                                    );
                                }
                            }
                            $html .= '</div>';
                            $html .= '</div>';
                            if ( $preset == 'style-2' ) {
                                $html .= '</div>';
                            }

                            if ( $preset === 'style-2' || $preset === 'style-3' ) {
                                $html .= '<div class="eb-timeline-slider-item-icon-wrap">';
                                $html .= '<div class="eb-timeline-slider-item-icon">';
                                $html .= sprintf( $helper::eb_render_icon( $helper::eb_get_icon_type( $timelineIcon ), '', $timelineIcon ) );
                                $html .= '</div>';
                                $html .= '<div class="eb-timeline-slider-item-icon-info">';
                                if ( $showDate ) {
                                    $html .= sprintf( '<span class="eb-timeline-slider-item-date">%1$s</span>', $timeline[ 'date' ] );
                                }
                                if ( $showSubheading ) {
                                    $html .= sprintf( '<span class="eb-timeline-slider-item-subheading">%1$s</span>', $timeline[ 'subheading' ] );
                                }
                                $html .= '</div>';
                            }

                            if ( $preset != 'style-2' ) {
                                $html .= '</div>';
                            }
                            $html .= '</article>';
                        }

                        echo wp_kses( $html, 'post' );
                    }

                ?>
            </div>
        </div>
    </div>
</div>
