<?php
    $soldCount = isset( $product ) ? $product->get_total_sales() : 0;
    $quantity  = isset( $product ) ? $product->get_stock_quantity() : 0;
    if ( $showSoldCount ) {
    ?>
<div class="eb-woo-product-sold-bar-wrapper">
	<?php if ( $showSoldCountBar ) {?>
	<div class="eb-woo-product-sold-container">
		<div class="eb-woo-product-sold-bar" data-sold-count="<?php echo esc_attr( $soldCount ); ?>" data-product-quantity="<?php echo esc_attr( $quantity ); ?>" data-stock-percent=<?php echo esc_attr( $stockPercent ); ?>></div>
	</div>
	<?php }?>
	<div class="eb-woo-product-sold-count">
		<?php
            echo esc_html( $soldCountPrefix ) . $product->get_total_sales() . $soldCountSuffix;
            ?>
	</div>
</div>
<?php
}
