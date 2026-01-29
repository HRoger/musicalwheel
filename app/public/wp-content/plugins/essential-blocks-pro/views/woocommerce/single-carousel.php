<?php

if ($carouselPreset != "preset-4") { ?> <div class="eb-product-carousel-item">
        <div class="eb-product-carousel-item-inner">
            <?php if ($carouselPreset == 'preset-2'): ?>
                <div class="eb-woo-product-content-wrapper">
                    <div class="eb-woo-product-content">
                        <div class="eb-woo-product-pricing-wrap">
                            <?php
                            if ($showPrice) {
                                $helper::views('woocommerce/price', [
                                    'product' => $product
                                ]);
                            }

                            if ($showRating) {
                                $helper::views('woocommerce/rating', [
                                    'product' => $product
                                ]);
                            }
                            ?>
                        </div>
                        <?php if ($showCategory) {
                            $helper::views('woocommerce/categories');
                        }
                        $helper::views('woocommerce/title', ['titleTag' => $titleTag]); ?>
                    </div>
                </div>
            <?php endif; ?>
            <div class="eb-woo-product-image-wrapper">
                <div class="eb-woo-product-image">
                    <a href="<?php esc_attr_e(esc_url(get_permalink())); ?>" class="eb-woo-product-image-link">
                        <?php if ('preset-3' == $carouselPreset): ?>
                            <span class="eb-woo-product-overlay"></span>
                        <?php endif; ?>
                        <?php echo wp_kses_post($product->get_image($imageSize)); ?>
                    </a>
                    <?php
                    if ($showSaleBadge && $product->is_on_sale()) {
                        echo wp_kses_post('<span class="eb-woo-product-ribbon ' . $saleBadgeAlign . '">' . $saleText . '</span>');
                    }
                    ?>
                </div>
            </div>
            <?php if ($carouselPreset != 'preset-2'): ?>
                <div class="eb-woo-product-content-wrapper">
                    <div class="eb-woo-product-content">
                        <?php if ($carouselPreset == 'preset-1'): ?> <div class="eb-woo-product-content-info"><?php endif; ?>
                            <?php
                            if ($carouselPreset != 'preset-3' && $showCategory) {
                                $helper::views('woocommerce/categories');
                            }
                            $helper::views('woocommerce/title', ['titleTag' => $titleTag]); ?>
                            <?php if ($carouselPreset != 'preset-1' && $showCategory): $helper::views('woocommerce/categories');
                            endif; ?>
                            <div class="eb-woo-product-pricing-wrap">
                                <?php
                                if ($showPrice) {
                                    $helper::views('woocommerce/price', [
                                        'product' => $product
                                    ]);
                                }

                                if ($showRating) {
                                    $helper::views('woocommerce/rating', [
                                        'product' => $product,
                                        'ratingStyle' => $ratingStyle
                                    ]);
                                }
                                ?>

                            </div>
                            <?php if ($carouselPreset == 'preset-1'): ?>
                            </div><?php endif; ?>
                        <?php
                        if ('preset-1' == $carouselPreset) { ?>
                            <div class="eb-woo-product-button-list">
                                <a href="<?php esc_attr_e(esc_url(get_permalink())); ?>" class="button wp-element-button">
                                    <i class="fas fa-external-link-alt"></i><?php echo " " . $buttonText; ?>
                                </a>
                                <?php woocommerce_template_loop_add_to_cart(); ?>
                            </div>
                        <?php } else {
                            $helper::views('woocommerce/button-list');
                        }
                        ?>
                    </div>
                </div>
            <?php endif; ?>
            <?php if ($carouselPreset == 'preset-2'): ?>
                <div class="eb-woo-product-button-wrapper">
                    <div class="eb-woo-product-button-list">
                        <?php woocommerce_template_loop_add_to_cart(); ?>
                    </div>
                </div>
            <?php endif; ?>
        </div>
    </div><?php }
            ?>

<?php if ('preset-4' == $carouselPreset) { ?>
    <div class="eb-product-carousel-item">
        <div class="eb-product-carousel-item-inner">
            <div class="eb-woo-product-image-wrapper">
                <div class="eb-woo-product-image">
                    <a href="<?php esc_attr_e(esc_url(get_permalink())); ?>" class="eb-woo-product-image-link">
                        <span class="eb-woo-product-overlay"></span>
                        <?php echo wp_kses_post($product->get_image($imageSize)); ?>
                    </a>
                    <?php
                    if ($showSaleBadge && $product->is_on_sale()) {
                        echo wp_kses_post('<span class="eb-woo-product-ribbon ' . $saleBadgeAlign . '">' . $saleText . '</span>');
                    }
                    ?>
                </div>
            </div>
            <div class="eb-woo-product-content-wrapper">
                <div class="eb-woo-product-content">
                    <?php
                    if ($showCategory) {
                        $helper::views('woocommerce/categories');
                    }
                    $helper::views('woocommerce/title', ['titleTag' => $titleTag]); ?>
                    <div class="eb-woo-product-pricing-wrap">
                        <?php
                        if ($showPrice) {
                            $helper::views('woocommerce/price', [
                                'product' => $product
                            ]);
                        }
                        ?>
                    </div>
                    <?php $helper::views('woocommerce/button-list'); ?>
                </div>
            </div>
        </div>
    </div>
<?php }
