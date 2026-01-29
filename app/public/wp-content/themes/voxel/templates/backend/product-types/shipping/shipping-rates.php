<?php
if ( ! defined('ABSPATH') ) {
	exit;
} ?>
<div class="ts-group">
	<div class="ts-group-head">
		<h3>Shipping rates</h3>
		<div class="vx-info-box">
			<?php \Voxel\svg( 'info.svg' ) ?>
			<p>Manage shipping rates for each zone. Rates determine the cost and delivery options for shipping.</p>
		</div>
	</div>
	<div class="x-row">
		<div class="x-col-12 field-container ts-drag-animation">
			<template v-if="config.shipping.shipping_rates.length">
				<draggable
					v-model="config.shipping.shipping_rates"
					group="shipping_rates"
					handle=".field-head.field-head--rates"
					item-key="key"
				>
					<template #item="{element: shipping_rate, index: rateIndex}">
						<div class="single-field wide" :class="{open: state.activeShippingRate === shipping_rate}">
							<div class="field-head field-head--rates" @click="state.activeShippingRate = state.activeShippingRate === shipping_rate ? null : shipping_rate">
								<p class="field-name">{{ shipping_rate.label || 'Untitled rate' }}</p>
								<p class="field-type">
									<template v-if="getRateZones(shipping_rate).length">
										{{ getRateZones(shipping_rate).length }} shipping zone{{ getRateZones(shipping_rate).length !== 1 ? 's' : '' }}
									</template>
								</p>
								<div class="field-actions">
									<span class="field-action all-center">
										<a href="#" @click.prevent="removeShippingRate(shipping_rate)">
											<i class="lar la-trash-alt icon-sm"></i>
										</a>
									</span>
								</div>
							</div>
							<div v-if="state.activeShippingRate === shipping_rate" class="field-body">
								<div class="x-row">
									<?php \Voxel\Utils\Form_Models\Text_Model::render( [
										'v-model' => 'shipping_rate.label',
										'label' => 'Label',
										'classes' => 'x-col-12',
									] ) ?>

									<div class="ts-form-group x-col-12">
										<label>Zones</label>
										<span class="toggle-btns">
											<a href="#" @click.prevent="selectAllZonesForRate(shipping_rate)">Select all</a>
											<span>/</span>
											<a href="#" @click.prevent="unselectAllZonesForRate(shipping_rate)">Unselect all</a>
										</span>
										<div class="x-row">
											<div class="ts-form-group x-col-12">
												<div class="add-field">
													<select @change="handleZoneSelect(shipping_rate, $event.target.value, $event)">
														<option value="">Add zone</option>
														<template v-for="(z, zIndex) in config.shipping.shipping_zones">
															<option
																:disabled="isRateInZone(shipping_rate, z.key)"
																:value="z.key"
															>
																{{ z.label || 'Untitled Zone' }}
															</option>
														</template>
													</select>
												</div>
											</div>
											<div class="x-col-12 ts-form-group">
												<template v-if="getRateZones(shipping_rate).length">
													<div class="vx-selected-states">
														<div v-for="(zone, zoneIndex) in getRateZones(shipping_rate)" :key="zone.key" class="ts-button ts-outline shipping-cn">
															<p>{{ zone.label || 'Untitled Zone' }}</p>
															<a href="#" @click.prevent="removeRateFromZone(shipping_rate, zone.key)" class="vx-button-delete">
																<?php \Voxel\svg( 'close.svg' ) ?>
															</a>
														</div>
													</div>
												</template>
												<div v-else class="ts-form-group">
													<label style="padding-bottom: 0;">No zones selected. Select zones where this rate applies.</label>
												</div>
											</div>
										</div>
									</div>
                                    <div class="ts-form-group x-col-12">
                                            <div class="ts-divider"></div>
                                    </div>
									<?php \Voxel\Utils\Form_Models\Select_Model::render( [
										'v-model' => 'shipping_rate.type',
										'label' => 'Type',
										'classes' => 'x-col-6',
										'choices' => [
											'free_shipping' => 'Free shipping',
											'fixed_rate' => 'Flat rate',
										],
									] ) ?>

									<template v-if="shipping_rate.type === 'free_shipping'">
										<?php \Voxel\Utils\Form_Models\Select_Model::render( [
											'v-model' => 'shipping_rate.free_shipping.requirements',
											'label' => 'Free shipping requires',
											'classes' => 'x-col-6',
											'choices' => [
												'none' => 'No requirement',
												'minimum_order_amount' => 'Minimum order amount',
											],
										] ) ?>

										<template v-if="shipping_rate.free_shipping.requirements === 'minimum_order_amount'">
											<?php \Voxel\Utils\Form_Models\Number_Model::render( [
												'v-model' => 'shipping_rate.free_shipping.minimum_order_amount',
												'label' => 'Min. order amount',
												'classes' => 'x-col-12',
												'step' => 'any',
											] ) ?>
										</template>

										<div class="ts-form-group x-col-12">
                                            <div class="ts-divider"></div>
                                        </div>

										<div class="ts-form-group x-col-12" style="padding-bottom: 0;">
											<label>Estimated shipping time</label>
										</div>
										<?php \Voxel\Utils\Form_Models\Number_Model::render( [
											'v-model' => 'shipping_rate.free_shipping.delivery_estimate.minimum.value',
											'label' => 'Between',
											'classes' => 'x-col-2',
										] ) ?>
										<?php \Voxel\Utils\Form_Models\Select_Model::render( [
											'v-model' => 'shipping_rate.free_shipping.delivery_estimate.minimum.unit',
											'label' => '&nbsp;',
											'classes' => 'x-col-4',
											'choices' => [
												'hour' => 'Hour(s)',
												'day' => 'Day(s)',
												'business_day' => 'Business day(s)',
												'week' => 'Week(s)',
												'month' => 'Month(s)',
											],
										] ) ?>
										<?php \Voxel\Utils\Form_Models\Number_Model::render( [
											'v-model' => 'shipping_rate.free_shipping.delivery_estimate.maximum.value',
											'label' => 'And',
											'classes' => 'x-col-2',
										] ) ?>
										<?php \Voxel\Utils\Form_Models\Select_Model::render( [
											'v-model' => 'shipping_rate.free_shipping.delivery_estimate.maximum.unit',
											'label' => '&nbsp;',
											'classes' => 'x-col-4',
											'choices' => [
												'hour' => 'Hour(s)',
												'day' => 'Day(s)',
												'business_day' => 'Business day(s)',
												'week' => 'Week(s)',
												'month' => 'Month(s)',
											],
										] ) ?>
									</template>
									<template v-else-if="shipping_rate.type === 'fixed_rate'">

                                        <?php \Voxel\Utils\Form_Models\Select_Model::render( [
											'v-model' => 'shipping_rate.fixed_rate.calculation_method',
											'label' => 'Calculation method',
											'classes' => 'x-col-6',
											'choices' => [
												'per_item' => 'Per item: Charge per item/quantity (default)',
												'per_order' => 'Per order: Fixed cost regardless of quantity or number of items',
												'per_class' => 'Per class: Use the highest shipping class cost when multiple classes are in cart',
											],
										] ) ?>

										<?php \Voxel\Utils\Form_Models\Number_Model::render( [
											'v-model' => 'shipping_rate.fixed_rate.amount_per_unit',
											'label' => 'Amount per unit (default)',
											'classes' => 'x-col-12',
											'step' => 'any',
										] ) ?>

										<template v-if="shipping_rate.fixed_rate.calculation_method !== 'per_order'">
											<div class="ts-form-group x-col-12" v-if="config.shipping.shipping_classes.length">
												<label>Amount per unit (by shipping class)</label>

												<div v-if="shipping_rate.fixed_rate.shipping_classes.length" class="x-row">
													<template v-for="shipping_class, shipping_class_index in shipping_rate.fixed_rate.shipping_classes">
														<div v-if="config.shipping.shipping_classes.find( cls => cls.key === shipping_class.shipping_class )" class="ts-form-group x-col-6">
															<label>
																{{ config.shipping.shipping_classes.find( cls => cls.key === shipping_class.shipping_class ).label }}

																<a style="float:right;" href="#" @click.prevent="shipping_rate.fixed_rate.shipping_classes.splice(shipping_class_index, 1)">Remove</a>
															</label>
															<input v-model="shipping_class.amount_per_unit" type="number" step="any">
														</div>
													</template>
												</div>

												<div class="ts-form-group mt10">
													<div class="add-field">
														<template v-for="shipping_class in config.shipping.shipping_classes">
															<div
																v-if="!shipping_rate.fixed_rate.shipping_classes.find( cls => cls.shipping_class === shipping_class.key )"
																class="ts-button ts-outline"
																@click.prevent="addShippingClassToRate(shipping_rate, shipping_class)"
															>
																{{ shipping_class.label }}
															</div>
														</template>
													</div>
												</div>
											</div>
										</template>

                                        <div class="ts-form-group x-col-12">
                                            <div class="ts-divider"></div>
                                        </div>

										<div class="ts-form-group x-col-12" style="padding-bottom: 0;">
											<label>Estimated shipping time</label>
										</div>
										<?php \Voxel\Utils\Form_Models\Number_Model::render( [
											'v-model' => 'shipping_rate.fixed_rate.delivery_estimate.minimum.value',
											'label' => 'Between',
											'classes' => 'x-col-2',
										] ) ?>
										<?php \Voxel\Utils\Form_Models\Select_Model::render( [
											'v-model' => 'shipping_rate.fixed_rate.delivery_estimate.minimum.unit',
											'label' => '&nbsp;',
											'classes' => 'x-col-4',
											'choices' => [
												'hour' => 'Hour(s)',
												'day' => 'Day(s)',
												'business_day' => 'Business day(s)',
												'week' => 'Week(s)',
												'month' => 'Month(s)',
											],
										] ) ?>
										<?php \Voxel\Utils\Form_Models\Number_Model::render( [
											'v-model' => 'shipping_rate.fixed_rate.delivery_estimate.maximum.value',
											'label' => 'And',
											'classes' => 'x-col-2',
										] ) ?>
										<?php \Voxel\Utils\Form_Models\Select_Model::render( [
											'v-model' => 'shipping_rate.fixed_rate.delivery_estimate.maximum.unit',
											'label' => '&nbsp;',
											'classes' => 'x-col-4',
											'choices' => [
												'hour' => 'Hour(s)',
												'day' => 'Day(s)',
												'business_day' => 'Business day(s)',
												'week' => 'Week(s)',
												'month' => 'Month(s)',
											],
										] ) ?>

										<div class="ts-form-group x-col-12">
											<div class="ts-divider"></div>
										</div>

										<?php \Voxel\Utils\Form_Models\Select_Model::render( [
											'v-model' => 'shipping_rate.fixed_rate.tax_code',
											'label' => 'Shipping tax code',
											'classes' => 'x-col-6',
											'choices' => [
												'nontaxable' => 'Nontaxable',
												'shipping' => 'Shipping',
											],
										] ) ?>

										<?php \Voxel\Utils\Form_Models\Select_Model::render( [
											'v-model' => 'shipping_rate.fixed_rate.tax_behavior',
											'label' => sprintf( 'Tax behavior <a style="float:right;" href="%s" target="_blank">Set default tax behavior</a>', esc_url( \Voxel\Modules\Stripe_Payments\Stripe_Client::dashboard_url( '/settings/tax' ) ) ),
											'classes' => 'x-col-6',
											'choices' => [
												'default' => 'Default: Use default tax behavior configured in your Stripe dashboard',
												'inclusive' => 'Inclusive: Tax is included in the price',
												'exclusive' => 'Exclusive: Tax is added on top of the price',
											],
										] ) ?>
									</template>
								</div>
							</div>
						</div>
					</template>
				</draggable>
			</template>
			<div v-else class="ts-form-group">
				<p>You have not added any shipping rates yet.</p>
			</div>
		</div>

		<div class="x-col-12">
			<div class="add-field">
				<div
					class="ts-button ts-outline"
					@click.prevent="addShippingRate()"
				>
					<p class="field-name">Add shipping rate</p>
				</div>
			</div>
		</div>

	</div>
</div>

