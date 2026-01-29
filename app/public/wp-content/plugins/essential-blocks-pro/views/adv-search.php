<?php
	$wrapper_attributes = get_block_wrapper_attributes(
		[
			'class' => 'root-' . $blockId,
		]
	);
    $_parent_classes = [
        'eb-parent-wrapper',
        'eb-parent-' . $blockId,
        $classHook
    ];

    $_wrapper_classes = [
        'eb-adv-search-wrapper',
        $blockId
    ];

    $_form_classes = [
        'eb-adv-searchform',
        $preset
    ];

    $input_markup = sprintf(
        '<div class="eb-adv-search-input-wrap">
            <svg class="eb-adv-search-loader" width="38" height="38" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg" stroke="#444b54">
                <g fill="none" fill-rule="evenodd">
                    <g transform="translate(1 1)" stroke-width="2">
                        <circle stroke-opacity=".5" cx="18" cy="18" r="18"></circle>
                        <path d="M36 18c0-9.94-8.06-18-18-18">
                            <animateTransform attributeName="transform" type="rotate" from="0 18 18" to="360 18 18" dur="1s" repeatCount="indefinite"></animateTransform>
                        </path>
                    </g>
                </g>
            </svg>
            <span class="eb-adv-search-close"><i class="fas fa-times"></i></span>
            <input type="search" id="s" class="adv-search-field" name="s" value="%s" placeholder="%s" required />
        </div>',
        // $input_id,
        // esc_attr( implode( ' ', $input_classes ) ),
        get_search_query(),
        esc_attr( $placeholderText ),
    );

    $button_internal_markup = wp_kses_post( $btnText );
    $aria_label             = '';

    $query_params_markup = sprintf(
        '<input type="hidden" name="post_type" value="%s" />',
        esc_attr( $postTypeValue )
    );

    // $taxonomy = json_decode( $selectedTaxonomy );
    // $query_params_markup .= sprintf(
    //     '<input type="hidden" name="%s" value="" />',
    //     esc_attr( $taxonomy->value )
    // );

?>
<div <?php echo wp_kses_data($wrapper_attributes); ?>>
    <div class="<?php esc_attr_e( implode( ' ', $_parent_classes ) );?>">
        <div class="<?php esc_attr_e( implode( ' ', $_wrapper_classes ) );?>" data-id="<?php esc_attr_e( $blockId );?>">

            <form role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>" id="search-form-alt"
                class="<?php esc_attr_e( implode( ' ', $_form_classes ) );?>"
                data-searchsettings="<?php esc_attr_e( json_encode( $searchSettings ) );?>">
                <?php
				if ( $showSearchIcon && $preset !== 'preset-modern' ) {?>
                <svg class="eb-adv-search-icon" xmlns="http://www.w3.org/2000/svg" width="38" viewBox="0 0 50 50">
                    <path
                        d="M21 3C11.602 3 4 10.602 4 20s7.602 17 17 17c3.355 0 6.46-.984 9.094-2.656l12.281 12.281 4.25-4.25L34.5 30.281C36.68 27.421 38 23.88 38 20c0-9.398-7.602-17-17-17zm0 4c7.2 0 13 5.8 13 13s-5.8 13-13 13S8 27.2 8 20 13.8 7 21 7z">
                    </path>
                </svg>
                <?php }
				if ( $showSearchIcon && $preset == 'preset-modern' ) {?>
                <svg class="eb-adv-search-filter-icon" width="24" height="24" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_14_501)">
                        <path
                            d="M4.2308 23.25L4.2308 11.831C5.79731 11.4869 6.97336 10.0879 6.97336 8.41955C6.97336 6.75117 5.79736 5.35223 4.2308 5.00808L4.2308 0.75C4.2308 0.335812 3.89498 0 3.4808 0C3.06661 0 2.7308 0.335812 2.7308 0.75L2.7308 5.00845C1.16508 5.35327 -0.0117188 6.75413 -0.0117188 8.41955C-0.0117188 10.0859 1.16489 11.4861 2.7308 11.8307L2.7308 23.25C2.7308 23.6642 3.06661 24 3.4808 24C3.89498 24 4.2308 23.6642 4.2308 23.25ZM3.48277 10.412C3.48009 10.412 3.47738 10.412 3.4747 10.412C2.37937 10.4087 1.48833 9.51492 1.48833 8.41955C1.48833 7.32572 2.37816 6.43191 3.47297 6.42717L3.48398 6.42703C4.58119 6.42876 5.47341 7.32192 5.47341 8.41955C5.47341 9.5167 4.58208 10.4096 3.48553 10.4121L3.48277 10.412ZM19.769 0.75V5.00845C18.2033 5.35331 17.0265 6.75413 17.0265 8.41955C17.0265 10.0859 18.2031 11.4861 19.769 11.8307L19.769 23.25C19.769 23.6642 20.1047 24 20.519 24C20.9332 24 21.269 23.6642 21.269 23.25L21.269 11.831C22.8355 11.4869 24.0115 10.0879 24.0115 8.41955C24.0115 6.75117 22.8355 5.35223 21.269 5.00808V0.75C21.269 0.335812 20.9332 0 20.519 0C20.1047 0 19.769 0.335812 19.769 0.75ZM22.5115 8.41955C22.5115 9.5167 21.6202 10.4096 20.5237 10.4121L20.5209 10.412C20.5182 10.412 20.5155 10.412 20.5129 10.412C19.4175 10.4087 18.5265 9.51492 18.5265 8.41955C18.5265 7.32572 19.4163 6.43191 20.511 6.42717L20.5221 6.42703C21.6194 6.42863 22.5115 7.32183 22.5115 8.41955ZM11.2499 0.75L11.2499 12.169C9.68339 12.5131 8.50739 13.9121 8.50739 15.5805C8.50739 17.2488 9.68339 18.6478 11.2499 18.9919L11.2499 23.25C11.2499 23.6642 11.5857 24 11.9999 24C12.4141 24 12.7499 23.6642 12.7499 23.25L12.7499 18.9915C14.3156 18.6467 15.4924 17.2459 15.4924 15.5805C15.4924 13.9141 14.3158 12.5139 12.7499 12.1693L12.7499 0.75C12.7499 0.335812 12.4141 0 11.9999 0C11.5857 0 11.2499 0.335812 11.2499 0.75ZM11.9979 13.588C12.0007 13.588 12.0033 13.588 12.006 13.588C13.1013 13.5913 13.9924 14.4851 13.9924 15.5805C13.9924 16.6743 13.1025 17.5681 12.0078 17.5728L11.9968 17.573C10.8995 17.5713 10.0074 16.6781 10.0074 15.5805C10.0074 14.4833 10.8987 13.5904 11.9953 13.5879L11.9979 13.588Z"
                            fill="white" />
                    </g>
                    <defs>
                        <clipPath id="clip0_14_501">
                            <rect width="24" height="24" fill="white" transform="matrix(0 -1 1 0 0 24)" />
                        </clipPath>
                    </defs>
                </svg>
                <?php }
						echo $input_markup;
						if ( $postTypeValue !== 'all' ) {
							echo $query_params_markup;
						}

					?>

                <?php

					if ( $showTaxonomyFilter && $preset !== 'preset-modern' ):
				?>

                <div class="eb-adv-search-select">
                    <span class="eb-icon fas fa-chevron-down"></span>
                    <select name="eb-adv-search-cate-list" class="eb-adv-search-cate">
                        <?php
									$cat_lists = json_decode( $selectedTaxonomyItems );
									$markup    = sprintf( "<option value=''>%s</option>", esc_html( $taxListText ) );

									if ( ! empty( $cat_lists ) ) {
										foreach ( $cat_lists as $my_object ) {
											$label = ucwords( $my_object->label );
											$value = $my_object->value;
											$markup .= sprintf( "<option value='%s'>%s</option>", $value, $label );
										}

										echo $markup;
									} else {
										foreach ( $filterTerms as $my_object ) {
											$label = ucwords( $my_object['label'] );
											$value = $my_object['value'];
											$markup .= sprintf( "<option value='%s'>%s</option>", $value, $label );
										}

										echo $markup;
									}

								?>
                    </select>

                </div>

                <?php endif;

							if ( $showSearchBtn ) {
								$button_markup = '<button type="submit" class="adv-search-btn">';

								if ( $buttonType !== "btn-type-text" ) {
									$button_markup .= sprintf(
										$helper::eb_render_icon( $helper::eb_get_icon_type( $searchBtnIcon ), '',$searchBtnIcon )
									);
								}
								if ( $buttonType !== "btn-type-icon" ) {
									$button_markup .= $button_internal_markup;
								}
								$button_markup .= '</button>';
								echo $button_markup;
							}
						?>
            </form>

            <?php
			if ( $showPopularKeywords ) {
				global $wpdb;
				$popular_keywords = $wpdb->get_results(
					$wpdb->prepare(
						"
						SELECT keyword, count, is_found
						From " . ESSENTIAL_BLOCKS_SEARCH_KEYWORD_TABLE . "
						WHERE count >= %d && is_found = %d
						ORDER BY count DESC LIMIT %d
					", $popularKeywordsRank, 1, $popularKeywordslimit )
				);

				if ( ! empty( $popular_keywords ) ) {
					arsort( $popular_keywords );
					$lists = null;
					foreach ( $popular_keywords as $item ) {
						$keywords = ucfirst( str_replace( '_', ' ', $item->keyword ) );
						$lists .= sprintf( '<a href="javascript:void(0)" data-keyword="%1$s" class="eb-popular-keyword-item">%2$s</a>', $item->keyword, $keywords );
					}

					if ( ! empty( $lists ) ) {
						$popularKeywordMarkup = '<div class="eb-adv-search-popular-keywords">';
						$popularKeywordMarkup .= sprintf( '<h4>%s</h4>', $popularKeywordsLabel, );
						$popularKeywordMarkup .= '<div class="eb-popular-keyword-content">';
						$popularKeywordMarkup .= $lists;
						$popularKeywordMarkup .= '</div>';
						$popularKeywordMarkup .= '</div>';
						echo $popularKeywordMarkup;
					}
				}
			}

		?>


            <?php
			if ( $showTaxonomyFilter && $preset == 'preset-modern' ) {?>
            <div class="eb-adv-search-filter-area" style="display: none;">
                <h3 class="filter-label"><?php echo $taxListText; ?></h3>
                <div class="eb-adv-search-filter-wrapper">
                    <?php
					$cat_lists = json_decode( $selectedTaxonomyItems );
						$markup    = '';
						if ( ! empty( $cat_lists ) ) {
							foreach ( $cat_lists as $my_object ) {
								$label = ucwords( $my_object->label );
								$value = $my_object->value;
								$markup .= sprintf( '<div class="form-control"><input type="radio" class="search-filter" name="search-filter" value="%s" /><label>%s</label></div>', $value, $label );
							}

							echo $markup;
						} else {
							foreach ( $filterTerms as $my_object ) {
								$label = ucwords( $my_object['label'] );
								$value = $my_object['value'];
								$markup .= sprintf( '<div class="form-control"><input type="radio" class="search-filter" name="search-filter" value="%s" /><label>%s</label></div>', $value, $label );
							}

							echo $markup;
						}

					?>
                </div>
            </div>

            <?php }
			?>

            <div class="eb-adv-search-result">
                <?php if ( $showTotalResult ): ?>
                <p class="eb-adv-search-total-results-wrapper">
                    <?php
                    $totalResultsText = ! empty( $totalResultsText ) ? $totalResultsText : __( 'Total [post_count] Results', 'essential-blocks-pro' );
                    $totalResultsText = explode( '[post_count]', $totalResultsText );
                    if ( count( $totalResultsText ) ) {
                        esc_html_e( $totalResultsText[0] );

							if ( isset( $totalResultsText[1] ) ) {
								echo '<span class="eb-adv-search-total-results-count"></span>';
								esc_html_e( $totalResultsText[1] );
							}
						}
					?>
                </p>
                <?php endif;?>

                <div class="eb-adv-search-content"></div>
                <p class="eb-adv-search-not-found"><?php echo $notFoundText; ?></p>

                <?php if ( $showLoadMore && ! empty( $loadmoreBtnText ) ): ?>
                <div class="eb-adv-search-load-more">
                    <a class="eb-adv-search-load-more-btn" href="#">
                        <?php echo esc_html( $loadmoreBtnText ); ?>
                    </a>
                </div>
                <?php endif;?>
            </div>
        </div>
    </div>
</div>