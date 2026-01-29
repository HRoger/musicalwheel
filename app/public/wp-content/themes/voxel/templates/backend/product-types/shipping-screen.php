<?php
if ( ! defined('ABSPATH') ) {
	exit;
}

wp_enqueue_script('vue');
wp_enqueue_script('sortable');
wp_enqueue_script('vue-draggable');
wp_enqueue_script('vx:ecommerce-settings.js');
?>
<div id="vx-ecommerce-settings" data-config="<?= esc_attr( wp_json_encode( [ 'shipping' => $config, 'tab' => $props['tab'] ?? 'shipping_classes' ] ) ) ?>" data-props="<?= esc_attr( wp_json_encode( $props ?? [] ) ) ?>" v-cloak>
	<form method="POST" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ) ?>" @submit="state.submit_config = JSON.stringify( config.shipping )">
		<div class="sticky-top">
			<div class="vx-head x-container">
				<h2>Shipping</h2>
				<div class="vxh-actions">
					<input type="hidden" name="config" :value="state.submit_config">
					<input type="hidden" name="action" value="voxel_save_shipping_settings">
					<input type="hidden" name="tab" :value="tab">
					<?php wp_nonce_field( 'voxel_save_shipping_settings' ) ?>
					<button type="submit" class="ts-button btn-shadow ts-save-settings">
						<?php \Voxel\svg( 'floppy-disk.svg' ) ?>
						Save changes
					</button>
				</div>
			</div>
		</div>
		<div class="ts-spacer"></div>
		<div class="x-container">
			<div class="x-row">
				<div class="x-col-3">
					<ul class="inner-tabs vertical-tabs">
						<li :class="{'current-item': tab === 'shipping_classes'}">
							<a href="#" @click.prevent="setTab('shipping_classes')">Classes</a>
						</li>
						<li :class="{'current-item': tab === 'shipping_zones'}">
							<a href="#" @click.prevent="setTab('shipping_zones')">Zones</a>
						</li>
						<li :class="{'current-item': tab === 'shipping_rates'}">
							<a href="#" @click.prevent="setTab('shipping_rates')">Rates</a>
						</li>
					</ul>
				</div>

				<div v-if="tab === 'shipping_classes'" class="x-col-9">
					<?php require_once locate_template('templates/backend/product-types/shipping/shipping-classes.php') ?>
				</div>
				<div v-if="tab === 'shipping_zones'" class="x-col-9">
					<?php require_once locate_template('templates/backend/product-types/shipping/shipping-zones.php') ?>
				</div>
				<div v-if="tab === 'shipping_rates'" class="x-col-9">
					<?php require_once locate_template('templates/backend/product-types/shipping/shipping-rates.php') ?>
				</div>
			</div>
		</div>
	</form>
</div>

