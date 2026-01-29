<div class="ebwpg-category-filter" data-ebwpgTaxonomy="<?php echo esc_attr( $taxonomy ); ?>">
	<ul class="ebwpg-category-filter-list">
		<?php
            /**
             * @var array $categories
             */
            array_map(
                function ( $item ) {
                    $activeClass = $item->value === 'all' ? 'active' : '';
                    // WPML Support
					if ($item->label == "All" && class_exists('Sitepress') ) {
						$textdomain = 'essential-blocks-pro';
						$string_name = 'Essential Blocks string';

						if ( apply_filters('wpml_default_language', NULL ) == apply_filters( 'wpml_current_language', NULL )) {
							do_action( 'wpml_register_single_string', $textdomain, $string_name, $item->label );
						}
						// Apply the translation to the string
						$item->label = apply_filters('wpml_translate_single_string', $item->label , $textdomain, $string_name);
					}
                    echo wp_kses(
                        sprintf(
                            '<li class="ebwpg-category-filter-list-item %1$s" data-ebwpgCategory="%2$s">%3$s</li>',
                            $activeClass,
                            $item->value,
                            $item->label
                        ),
                        'post'
                    );
                },
                $categories
            );
        ?>
	</ul>
</div>
