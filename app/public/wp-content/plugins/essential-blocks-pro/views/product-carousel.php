<?php

    $_wrapper_classes = [
        $blockId,
        'eb-product-carousel-' . $essentialAttr['carouselPreset'],
        $classHook,
        $sliderSettings['arrows'] == 1 ? 'slick-arrows' : 'arrow-none',
        $essentialAttr['adaptiveHeight'] == 1 ? 'equal-height' : 'arrow-none',
        $essentialAttr['dotPreset']
    ];

	$wrapper_attributes = get_block_wrapper_attributes(
		[
			'class' => 'root-' . $blockId,
		]
	);
    $carouselPreset = isset( $essentialAttr['carouselPreset'] ) ? $essentialAttr['carouselPreset'] : 'preset-1';
    $sectionTitle   = isset( $essentialAttr['sectionTitle'] ) ? $essentialAttr['sectionTitle'] : __( "Popular Products", "essential-blocks-pro" );
?>
<div <?php echo wp_kses_data($wrapper_attributes); ?>>
    <div class="eb-parent-wrapper eb-parent-<?php esc_attr_e( $blockId );?><?php esc_attr_e( $classHook );?>">
        <div class="<?php esc_attr_e( implode( ' ', $_wrapper_classes ) );?> eb-product-carousel-wrap"
            data-id="<?php esc_attr_e( $blockId );?>" data-querydata="<?php esc_attr_e( json_encode( $queryData ) );?>"
            data-slidersettings="<?php esc_attr_e( json_encode( $sliderSettings ) );?>"
            data-attributes="<?php esc_attr_e( json_encode( $essentialAttr ) );?>">
            <?php if ( $carouselPreset != "preset-4" ): ?><div class="eb-product-carousel"><?php

		if ( $query->have_posts() ) {
			while ( $query->have_posts() ) {
				$query->the_post();
				$product = wc_get_product( get_the_ID() );

				$helper::views( 'woocommerce/single-carousel', [
					'product'        => $product,
					'showSaleBadge'  => $essentialAttr['showSaleBadge'],
					'saleBadgeAlign' => $essentialAttr['saleBadgeAlign'],
					'saleText'       => $essentialAttr['saleText'],
					'showPrice'      => $essentialAttr['showPrice'],
					'showRating'     => $essentialAttr['showRating'],
					'showCategory'   => $essentialAttr['showCategory'],
					'carouselPreset' => $essentialAttr['carouselPreset'],
					'imageSize'      => $essentialAttr['imageSize'],
					'buttonText'     => $essentialAttr['buttonText'],
					'ratingStyle'    => $essentialAttr['ratingStyle'],
					'titleTag'       => $essentialAttr['titleTag'],
				] );
			}
	}
	?></div><?php endif;?>
            <?php if ( $carouselPreset == "preset-4" ): ?>
            <div class="eb-product-carousel-thumb-wrap">
                <?php if ( $sectionTitle ): ?>
                <div class="eb-product-carousel-title-wrap eb-product-carousel-title-wrap-mobile">
                    <h2 class="eb-product-carousel-title"><?php echo esc_html( $sectionTitle ); ?></h2>
                </div>
                <?php endif;?>
                <div class="eb-product-carousel-thumb">
                    <?php
								if ( $query->have_posts() ) {
									while ( $query->have_posts() ) {
										$query->the_post();
										$product = wc_get_product( get_the_ID() );

										$helper::views( 'woocommerce/single-carousel', [
											'product'        => $product,
											'showSaleBadge'  => $essentialAttr['showSaleBadge'],
											'saleBadgeAlign' => $essentialAttr['saleBadgeAlign'],
											'saleText'       => $essentialAttr['saleText'],
											'showPrice'      => $essentialAttr['showPrice'],
											'showRating'     => $essentialAttr['showRating'],
											'showCategory'   => $essentialAttr['showCategory'],
											'carouselPreset' => $essentialAttr['carouselPreset'],
											'imageSize'      => $essentialAttr['imageSize'],
											'buttonText'     => $essentialAttr['buttonText'],
											'titleTag'       => $essentialAttr['titleTag'],
										] );
									}
								}
							?>
                </div>
            </div>
            <div class="eb-product-carousel-nav-wrap">
                <?php if ( $sectionTitle ): ?>
                <div class="eb-product-carousel-title-wrap eb-product-carousel-title-wrap-desktop">
                    <h2 class="eb-product-carousel-title"><?php echo esc_html( $sectionTitle ); ?></h2>
                </div>
                <?php endif;?>
                <div class="eb-product-carousel-nav">
                    <?php
								if ( $query->have_posts() ) {
									while ( $query->have_posts() ) {
										$query->the_post();
										$product = wc_get_product( get_the_ID() );

										$helper::views( 'woocommerce/single-carousel', [
											'product'        => $product,
											'showSaleBadge'  => $essentialAttr['showSaleBadge'],
											'saleBadgeAlign' => $essentialAttr['saleBadgeAlign'],
											'saleText'       => $essentialAttr['saleText'],
											'showPrice'      => $essentialAttr['showPrice'],
											'showRating'     => $essentialAttr['showRating'],
											'showCategory'   => $essentialAttr['showCategory'],
											'carouselPreset' => $essentialAttr['carouselPreset'],
											'imageSize'      => $essentialAttr['imageSize'],
											'buttonText'     => $essentialAttr['buttonText'],
											'titleTag'       => $essentialAttr['titleTag'],
										] );
									}
								}
							?>
                </div>
            </div>
            <!--- end nav wrap-->
            <?php endif;?>
            <?php

		if ( ! $query->have_posts() ) {
			$helper::views( 'common/no-content', [
				'content' => __( 'No Product Found', 'essential-blocks-pro' )
			] );
		}
	?>
        </div>
    </div>
</div>