<?php
if ( ! defined('ABSPATH') ) {
	exit;
}

require_once locate_template( 'templates/widgets/cart-summary/file-upload.php' );
?>

<script type="text/json" class="vxconfig__icons"><?= wp_json_encode( $icons ) ?></script>
<script type="text/json" class="vxconfig"><?= wp_specialchars_decode( wp_json_encode( $config ) ) ?></script>
<div class="vx-loading-screen ts-checkout-loading">
	<div class="ts-no-posts">
		<span class="ts-loader"></span>
	</div>
</div>
<div class="ts-form ts-checkout ts-checkout-regular">
	<template v-if="loading"></template>
	<template v-else-if="!hasItems()">
		<div class="vx-loading-screen">
			<div class="ts-form-group ts-no-posts">
				<?= \Voxel\get_icon_markup( $this->get_settings_for_display('nostock_ico') ) ?: \Voxel\svg( 'box-remove.svg' ) ?>
				<p><?= _x( 'No products selected for checkout', 'cart summary', 'voxel' ) ?></p>
			</div>
		</div>
	</template>
	<template v-else>
		<?php if ( ! is_user_logged_in() && $config['guest_customers']['behavior'] === 'proceed_with_email' ): ?>
			<?php require locate_template('templates/widgets/cart-summary/quick-register.php') ?>
		<?php endif ?>

		<?php if ( is_user_logged_in() || $config['guest_customers']['behavior'] !== 'proceed_with_email' ): ?>
			<div class="ts-cart-head">
				<h1 v-if="metadata.cart_label">
					{{ metadata.cart_label }}
				</h1>
				<h1 v-else>
					<?= _x( 'Order summary', 'cart summary', 'voxel' ) ?>
				</h1>
			</div>
		<?php endif ?>

		<div class="checkout-section form-field-grid">
			<template v-if="shouldGroupItemsByVendor()">
				<template v-for="vendor in vendors">
					<div class="ts-form-group">
						<div class="or-group">
						    <div class="or-line"></div>
							<span class="or-text">
								<?= \Voxel\replace_vars( _x( 'Sold by @vendor_name', 'cart summary', 'voxel' ), [
									'@vendor_name' => '{{ vendor.display_name }}',
								] ) ?>
							</span>
							<div class="or-line"></div>
						</div>
					</div>
					<div class="ts-form-group">
						<ul class="ts-cart-list simplify-ul">
							<template v-for="item in vendor.items">
								<cart-item :checkout="this" :item="item"></cart-item>
							</template>
						</ul>
					</div>
				</template>
			</template>
			<template v-else>
				<div class="ts-form-group">
					<div class="or-group">
					    <div class="or-line"></div>
						<span class="or-text"><?= _x( 'Items', 'cart summary', 'voxel' ) ?></span>
						<div class="or-line"></div>
					</div>
				</div>
				<div class="ts-form-group">
					<ul class="ts-cart-list simplify-ul">
						<template v-for="item in items">
							<cart-item :checkout="this" :item="item"></cart-item>
						</template>
					</ul>
				</div>
			</template>
		</div>

		<?php require locate_template('templates/widgets/cart-summary/shipping-details.php') ?>

		<?php if ( is_user_logged_in() || $config['guest_customers']['behavior'] === 'proceed_with_email' ): ?>
			<div class="checkout-section form-field-grid">
				<div class="ts-form-group">
					<div class="or-group">
					    <div class="or-line"></div>
						<span class="or-text"><?= _x( 'Details', 'cart summary', 'voxel' ) ?></span>
						<div class="or-line"></div>
					</div>
				</div>

				<suspense>
					<template #fallback>
						<div class="ts-no-posts">
							<span class="ts-loader"></span>
						</div>
					</template>
					<template #default>
						<template v-for="item in items">
							<template v-for="component in item.components">
								<component
									:is="'cart-item:'+component.type"
									:data="component.data"
									:parent="this"
									:cart-item="item"
								></component>
							</template>
						</template>
					</template>
				</suspense>

				<div class="tos-checkbox ts-form-group vx-1-1 switcher-label">
					<label @click.prevent="toggleComposer">
						<div class="ts-checkbox-container">
							<label class="container-checkbox">
								<input :checked="order_notes.enabled" type="checkbox" tabindex="0" class="hidden">
								<span class="checkmark"></span>
							</label>
						</div>
						<?= _x( 'Add order notes?', 'cart summary', 'voxel' ) ?>
					</label>
				</div>
				<div v-if="order_notes.enabled" class="ts-form-group vx-1-1">
					<textarea
						ref="orderNotes"
						:value="order_notes.content"
						@input="order_notes.content = $event.target.value; resizeComposer();"
						placeholder="<?= esc_attr( _x( 'Add notes about your order', 'cart summary', 'voxel' ) ) ?>"
						class="autofocus ts-filter"
					></textarea>
					<textarea ref="_orderNotes" disabled style="height:5px;position:fixed;top:-9999px;left:-9999px;visibility:hidden;"></textarea>
				</div>

				<?php if (
					! is_user_logged_in()
					&& $config['guest_customers']['behavior'] === 'proceed_with_email'
					&& $config['guest_customers']['proceed_with_email']['require_tos']
				): ?>
					<div class="tos-checkbox ts-form-group vx-1-1 switcher-label">
						<label @click.prevent="quick_register.terms_agreed = !quick_register.terms_agreed">
							<div class="ts-checkbox-container">
								<label class="container-checkbox">
									<input :checked="quick_register.terms_agreed" type="checkbox" tabindex="0" class="hidden">
									<span class="checkmark"></span>
								</label>
							</div>
							<p class="field-info">
								<?= \Voxel\replace_vars( _x( 'I agree to the <a:terms>Terms and Conditions</a> and <a:privacy>Privacy Policy</a>', 'cart summary', 'voxel' ), [
									'<a:terms>' => '<a target="_blank" @click.stop href="'.esc_url( get_permalink( \Voxel\get( 'templates.terms' ) ) ?: home_url('/') ).'">',
									'<a:privacy>' => '<a target="_blank" @click.stop href="'.esc_url( get_permalink( \Voxel\get( 'templates.privacy_policy' ) ) ?: home_url('/') ).'">'
								] ) ?>
							</p>
						</label>
					</div>
				<?php endif ?>
			</div>

			<div class="checkout-section">
				<ul v-if="getSubtotal() !== 0" class="ts-cost-calculator simplify-ul flexify">
					<li v-if="getShippingTotal() !== null">
						<div class="ts-item-name">
							<p><?= _x( 'Shipping', 'cart summary shipping cost', 'voxel' ) ?></p>
						</div>
						<div class="ts-item-price">
							<p>{{ currencyFormat( getShippingTotal(), cart_currency ) }}</p>
						</div>
					</li>
					<li class="ts-total">
						<div class="ts-item-name">
							<p><?= _x( 'Subtotal', 'cart summary', 'voxel' ) ?></p>
						</div>
						<div class="ts-item-price">
							<p>{{ currencyFormat( getSubtotal(), cart_currency ) }}</p>
						</div>
					</li>
				</ul>
				<a
					href="#"
					class="ts-btn ts-btn-2 form-btn"
					@click.prevent="!processing ? submit() : null"
					:class="{'ts-loading-btn': processing, 'vx-disabled': !canProceedWithPayment()}"
				>
					<div v-if="processing" class="ts-loader-wrapper">
						<span class="ts-loader"></span>
					</div>
					<template v-if="getSubtotal() === 0 || isOfflinePayment()">
						<?= _x( 'Submit order', 'cart summary', 'voxel' ) ?>
						<?= \Voxel\get_icon_markup( $this->get_settings_for_display('continue_ico') ) ?: \Voxel\svg( 'arrow-right.svg' ) ?>
					</template>
					<template v-else>
						<?= _x( 'Proceed to payment', 'cart summary', 'voxel' ) ?>
						<?= \Voxel\get_icon_markup( $this->get_settings_for_display('ts_checkout_icon') ) ?: \Voxel\svg( 'arrow-right.svg' ) ?>

					</template>
				</a>
			</div>
		<?php else: ?>
			<div class="checkout-section">
				<ul v-if="getSubtotal() !== 0" class="ts-cost-calculator simplify-ul flexify">
					<li v-if="getShippingTotal() !== null">
						<div class="ts-item-name">
							<p><?= _x( 'Shipping', 'cart summary shipping cost', 'voxel' ) ?></p>
						</div>
						<div class="ts-item-price">
							<p>{{ currencyFormat( getShippingTotal(), cart_currency ) }}</p>
						</div>
					</li>
					<li class="ts-total">
						<div class="ts-item-name">
							<p><?= _x( 'Subtotal', 'cart summary', 'voxel' ) ?></p>
						</div>
						<div class="ts-item-price">
							<p>{{ currencyFormat( getSubtotal(), cart_currency ) }}</p>
						</div>
					</li>
				</ul>
				<a href="<?= esc_url( $auth_link ) ?>" class="ts-btn ts-btn-2 form-btn">
					<div v-if="processing" class="ts-loader-wrapper">
						<span class="ts-loader"></span>
					</div>
					<?= \Voxel\get_icon_markup( $this->get_settings_for_display('auth_user_ico') ) ?: \Voxel\svg( 'user.svg' ) ?>
					<?= _x( 'Log in to continue', 'cart summary', 'voxel' ) ?>
				</a>
			</div>
		<?php endif ?>
	</template>
</div>
