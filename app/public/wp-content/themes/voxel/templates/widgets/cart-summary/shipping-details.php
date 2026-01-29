<?php
if ( ! defined('ABSPATH') ) {
	exit;
} ?>
<div v-if="hasShippableProducts()" class="checkout-section form-field-grid">
	<div class="ts-form-group">
		<div class="or-group">
		    <div class="or-line"></div>
			<span class="or-text"><?= _x( 'Shipping details', 'cart summary', 'voxel' ) ?></span>
			<div class="or-line"></div>
		</div>
	</div>
	<template v-if="shipping.status !== 'completed'">
		<div class="ts-form-group vx-1-1">
			<div class="vx-loading-screen">
				<div class="ts-no-posts">
					<span class="ts-loader"></span>
				</div>
			</div>
		</div>
	</template>
	<template v-else>
		<div class="ts-form-group vx-1-2">
			<label><?= esc_attr( _x( 'First name', 'cart summary', 'voxel' ) ) ?></label>
			<input
				type="text"
				v-model="shipping.first_name"
				placeholder="<?= esc_attr( _x( 'First name', 'cart summary', 'voxel' ) ) ?>"
				class="ts-filter"
			>
		</div>
		<div class="ts-form-group vx-1-2">
			<label><?= esc_attr( _x( 'Last name', 'cart summary', 'voxel' ) ) ?></label>
			<input
				type="text"
				v-model="shipping.last_name"
				placeholder="<?= esc_attr( _x( 'Last name', 'cart summary', 'voxel' ) ) ?>"
				class="ts-filter"
			>
		</div>

		<div
			class="ts-form-group"
			:class="(shipping.country
				&& getCountryStates(shipping.country)
				&& Object.keys(getCountryStates(shipping.country)).length
			) ? 'vx-1-2' : 'vx-1-1'"
		>
			<label><?= esc_attr( _x( 'Country', 'cart summary', 'voxel' ) ) ?></label>
			<div class="ts-filter">
				<select ref="shippingCountry" v-model="shipping.country" @change="shippingCountryUpdated($event)">
					<option value=""><?= esc_attr( _x( 'Select country', 'cart summary', 'voxel' ) ) ?></option>
					<template v-for="country, country_code in shippingCountries">
						<option :value="country_code">{{ country.name || country }}</option>
					</template>
				</select>
		    	<div class="ts-down-icon"></div>
			</div>
		</div>
		<template v-if="shipping.country && getCountryStates(shipping.country) && Object.keys(getCountryStates(shipping.country)).length">
			<div class="ts-form-group vx-1-2">
				<label><?= esc_attr( _x( 'State / County', 'cart summary', 'voxel' ) ) ?></label>
				<div class="ts-filter">
					<select v-model="shipping.state">
						<option value=""><?= esc_attr( _x( 'Select state', 'cart summary', 'voxel' ) ) ?></option>
						<template v-for="(state_data, state_code) in getCountryStates(shipping.country)">
							<option :value="state_code">{{ state_data.name || state_code }}</option>
						</template>
					</select>
		    		<div class="ts-down-icon"></div>
				</div>
			</div>
		</template>
		<div class="ts-form-group vx-1-2">
			<label><?= esc_attr( _x( 'Address', 'cart summary', 'voxel' ) ) ?></label>
			<input
				type="text"
				v-model="shipping.address"
				placeholder="<?= esc_attr( _x( 'Street address', 'cart summary', 'voxel' ) ) ?>"
				class="ts-filter"
			>
		</div>
		<div class="ts-form-group vx-1-2">
			<label><?= esc_attr( _x( 'ZIP / Postal code', 'cart summary', 'voxel' ) ) ?></label>
			<input
				type="text"
				v-model="shipping.zip"
				placeholder="<?= esc_attr( _x( 'ZIP / Postal code', 'cart summary', 'voxel' ) ) ?>"
				class="ts-filter"
			>
		</div>
	</template>
</div>
<div v-if="hasShippableProducts() && shipping.status === 'completed'" class="checkout-section form-field-grid">
	<div v-if="getShippingMethod() !== 'vendor_rates'" class="ts-form-group">
		<div class="or-group">
		    <div class="or-line"></div>
			<span class="or-text"><?= _x( 'Shipping method', 'cart summary', 'voxel' ) ?></span>
			<div class="or-line"></div>
		</div>
	</div>
	<div v-if="getShippingMethod() === 'platform_rates'" class="ts-form-group vx-1-1">
		<template v-if="platformHasMatchingRates()">
			<ul class="simplify-ul addon-cards flexify">
				<template v-for="rateData in getAllSortedPlatformRates()">
					<li
						class="flexify"
						:class="{
							'adc-selected': (
								shipping.zone === rateData.zone.key
								&& shipping.rate === rateData.rate.key
							),
							'vx-disabled': !rateMeetsCriteria(rateData.rate, rateData.zone),
						}"
						@click.prevent="shipping.zone = rateData.zone.key; shipping.rate = rateData.rate.key">
						<div class="card-icn">
							<?= \Voxel\get_icon_markup( $this->get_settings_for_display('ts_shipping_ico') ) ?: \Voxel\svg( 'box-closed.svg' ) ?>
						</div>
						<div class="addon-details">
							<span class="adc-title">
								{{ rateData.rate.label }}
							</span>
							<span
								v-if="rateData.rate.delivery_estimate && rateMeetsCriteria(rateData.rate, rateData.zone)"
								class="adc-subtitle"
							>{{ rateData.rate.delivery_estimate }}</span>
							<template v-if="!rateMeetsCriteria(rateData.rate, rateData.zone)">
								<span
									v-if="rateData.rate.type === 'free_shipping' && rateData.rate.requirements === 'minimum_order_amount'"
									class="adc-subtitle"
								>
									<?= _x( 'Minimum order amount:', 'cart summary', 'voxel' ) ?>
									{{ currencyFormat( rateData.rate.minimum_order_amount, cart_currency ) }}
								</span>
							</template>
							<span class="vx-addon-price">
								<template v-if="getShippingTotalForRate( rateData.rate ) === 0">
									{{ config.l10n.free }}
								</template>
								<template v-else>
									{{ currencyFormat( getShippingTotalForRate( rateData.rate ), cart_currency ) }}
								</template>
							</span>
						</div>
					</li>
				</template>
			</ul>
		</template>
		<template v-else>
			<label>
				<?= _x( 'No shipping rates available for your location. Please select a different address.', 'cart summary', 'voxel' ) ?>
			</label>
		</template>
	</div>
	<template v-else-if="getShippingMethod() === 'vendor_rates' && shipping.country">
		<template v-for="vendor in vendorsWithShippableProducts">
			<div class="ts-form-group">
				<div class="or-group">
				    <div class="or-line"></div>
					<span class="or-text">
						<?= \Voxel\replace_vars( _x( 'Shipping method (Products sold by @vendor_name)', 'cart summary', 'voxel' ), [
							'@vendor_name' => '{{ vendor.display_name }}',
						] ) ?>
					</span>
					<div class="or-line"></div>
				</div>
			</div>
			<div class="ts-form-group vx-1-1">
				<template v-if="vendorHasMatchingRates(vendor)">
					<ul class="simplify-ul addon-cards flexify">
						<template v-for="rateData in getAllSortedVendorRates(vendor)">
							<li
								class="flexify"
								:class="{
									'adc-selected': (
										shipping.vendors[vendor.key]
										&& shipping.vendors[vendor.key].zone === rateData.zone.key
										&& shipping.vendors[vendor.key].rate === rateData.rate.key
									),
									'vx-disabled': !vendorRateMeetsCriteria(vendor, rateData.rate, rateData.zone),
								}"
								@click.prevent="shipping.vendors[vendor.key] = {
									zone: rateData.zone.key,
									rate: rateData.rate.key,
								}">
									<div class="card-icn">
										<?= \Voxel\get_icon_markup( $this->get_settings_for_display('ts_shipping_ico') ) ?: \Voxel\svg( 'box-closed.svg' ) ?>
									</div>
									<div class="addon-details">
										<span class="adc-title">
											{{ rateData.rate.label }}
										</span>
										<span
											v-if="rateData.rate.delivery_estimate && vendorRateMeetsCriteria(vendor, rateData.rate, rateData.zone)"
											class="adc-subtitle"
										>{{ rateData.rate.delivery_estimate }}</span>
										<template v-if="!vendorRateMeetsCriteria(vendor, rateData.rate, rateData.zone)">
											<span
												v-if="rateData.rate.type === 'free_shipping' && rateData.rate.requirements === 'minimum_order_amount'"
												class="adc-subtitle"
											>
												<?= _x( 'Minimum order amount:', 'cart summary', 'voxel' ) ?>
												{{ currencyFormat( rateData.rate.minimum_order_amount, cart_currency ) }}
											</span>
										</template>
										<span class="vx-addon-price">
											<template v-if="getVendorShippingTotalForRate( vendor, rateData.rate ) === 0">
												{{ config.l10n.free }}
											</template>
											<template v-else>
												{{ currencyFormat( getVendorShippingTotalForRate( vendor, rateData.rate ), cart_currency ) }}
											</template>
										</span>
									</div>
								</li>
						</template>
					</ul>
				</template>
				<template v-else>
					<label>
						<?= _x( 'This vendor does not ship to your location. In order to proceed, remove products by this vendor from cart, or pick a different address.', 'cart summary', 'voxel' ) ?>
					</label>
				</template>
			</div>
		</template>
	</template>
</div>
