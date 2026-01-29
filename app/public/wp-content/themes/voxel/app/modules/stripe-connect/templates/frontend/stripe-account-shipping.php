<?php
if ( ! defined('ABSPATH') ) {
	exit;
} ?>
<div class="ts-form-group ui-heading-field field-key-ui-heading">
	<label><?= _x( 'Configure Shipping', 'stripe vendor', 'voxel' ) ?></label>
</div>

<!-- SHIPPING ZONES SECTION -->
<div class="ts-form-group">
	<label><?= _x( 'Shipping zones', 'stripe vendor', 'voxel' ) ?></label>
	<draggable
		v-if="config.shipping_zones.length"
		v-model="config.shipping_zones"
		:group="'shipping_zones'"
		handle=".ts-repeater-head.ts-repeater-head--zone"
		item-key="key"
		class="ts-repeater-container"
		filter=".no-drag"
	>
		<template #item="{element: zone, index: zoneIndex}">
			<div class="ts-field-repeater" :class="{collapsed: activeZone !== zone}">
				<div class="ts-repeater-head ts-repeater-head--zone" @click.prevent="activeZone = activeZone === zone ? null : zone">
					<?= \Voxel\get_icon_markup( $this->get_settings_for_display('flag_icon') ) ?: \Voxel\svg( 'flag.svg' ) ?>
					<label>{{ zone.label || <?= wp_json_encode( _x( 'Untitled zone', 'stripe vendor shipping', 'voxel' ) ) ?> }}</label>
					<div class="ts-repeater-controller">
						<a href="#" @click.stop.prevent="config.shipping_zones.splice(zoneIndex,1)" class="ts-icon-btn ts-smaller no-drag">
							<?= \Voxel\get_icon_markup( $this->get_settings_for_display('trash_icon') ) ?: \Voxel\svg( 'trash-can.svg' ) ?>
						</a>
						<a href="#" class="ts-icon-btn ts-smaller no-drag" @click.prevent>
							<?= \Voxel\get_icon_markup( $this->get_settings_for_display('down_icon') ) ?: \Voxel\svg( 'chevron-down.svg' ) ?>
						</a>
					</div>
				</div>
				<div v-if="activeZone === zone" class="medium form-field-grid">
					<div class="ts-form-group vx-1-1">
						<label><?= _x( 'Label', 'stripe vendor shipping zone', 'voxel' ) ?></label>
						<input v-model="zone.label" type="text" class="ts-filter" maxlength="32">
					</div>

					<div class="ts-form-group vx-1-1">
						<label>
							<?= _x( 'Countries', 'stripe vendor shipping', 'voxel' ) ?>
							<span style="margin-left: auto;">
								<a href="#" @click.prevent="selectAllCountries(zone)">
									<?= _x( 'Select all', 'stripe vendor shipping', 'voxel' ) ?>
								</a>
								/
								<a href="#" @click.prevent="unselectAllCountries(zone)">
									<?= _x( 'Unselect all', 'stripe vendor shipping', 'voxel' ) ?>
								</a>
							</span>
						</label>
						<div class="ts-filter">
							<select @change="handleCountrySelect(zone, $event.target.value, $event)">
								<option value=""><?= _x( 'Add country', 'stripe vendor shipping', 'voxel' ) ?></option>
								<template v-for="(countries, continent) in config.shipping_countries_by_continent">
									<option v-if="shouldShowContinentOption(continent)" :value="'continent:' + continent" style="font-weight: bold;"><?= _x( 'All in', 'stripe vendor shipping', 'voxel' ) ?> {{ continent }}</option>
								</template>
								<template v-for="(countries, continent) in config.shipping_countries_by_continent">
									<optgroup :label="continent">
										<template v-for="(country_name, country_code) in countries">
											<option :disabled="zone.regions && zone.regions.find( region => region.country === country_code )" :value="country_code">{{ country_name }}</option>
										</template>
									</optgroup>
								</template>
							</select>
							<div class="ts-down-icon"></div>
						</div>
					</div>

					<div class="ts-form-group vx-1-1">
						<template v-if="zone.regions && zone.regions.length">
							<div class="ts-region-categories" style="margin-bottom: 20px;">
								<ul class="simplify-ul addon-buttons flexify">
									<li
										@click.prevent="setActiveContinent(zone, null)"
										:class="{'adb-selected': getActiveContinent(zone) === null}">
										<?= _x( 'All', 'stripe vendor shipping', 'voxel' ) ?> ({{ zone.regions.length }})
									</li>
									<template v-for="continentData in getContinentsWithCounts(zone)">
										<li
											@click.prevent="setActiveContinent(zone, continentData.name)"
											:class="{'adb-selected': getActiveContinent(zone) === continentData.name}">
											{{ continentData.name }} ({{ continentData.count }})
										</li>
									</template>
								</ul>
							</div>
							<div class="ts-repeater-container">
								<template v-for="(countries, continent) in getFilteredRegionsByContinent(zone)">
									<template v-for="item in countries">
										<div class="ts-field-repeater" :class="{collapsed: zone._activeRegion !== item.region}">
											<div class="ts-repeater-head" @click="zone._activeRegion = zone._activeRegion === item.region ? null : item.region">
												<label>{{ item.name || <?= wp_json_encode( _x( 'Untitled zone', 'stripe vendor shipping', 'voxel' ) ) ?> }}</label>
												<div class="ts-repeater-controller">
													<a href="#"
														@click.stop.prevent="zone.regions.splice(zone.regions.indexOf(item.region), 1)"
														class="ts-icon-btn ts-smaller">
														<?= \Voxel\get_icon_markup( $this->get_settings_for_display('trash_icon') ) ?: \Voxel\svg( 'trash-can.svg' ) ?>
													</a>
												</div>
											</div>
											<div v-if="zone._activeRegion === item.region" class="form-field-grid medium">
												<template v-if="config.shipping_countries[item.region.country] && config.shipping_countries[item.region.country].states && Object.keys(config.shipping_countries[item.region.country].states).length">
													<div class="ts-form-group vx-1-1">
														<label>
															<?= _x( 'States', 'stripe vendor shipping', 'voxel' ) ?>
															<span style="margin-left: auto;">
																<a href="#" @click.prevent="selectAllStates(item.region, item.region.country)"><?= _x( 'Select all', 'stripe vendor shipping', 'voxel' ) ?></a>
																/
																<a href="#" @click.prevent="item.region.states = []"><?= _x( 'Unselect all', 'stripe vendor shipping', 'voxel' ) ?></a>
															</span>
														</label>
														<div class="ts-filter">
															<select @change="handleStateSelect(item.region, $event.target.value, $event)">
																<option value=""><?= _x( 'Add state', 'stripe vendor shipping', 'voxel' ) ?></option>
																<template v-for="(state_data, state_code) in getAvailableStates(item.region.country)">
																	<option :disabled="item.region.states && item.region.states.includes(state_code)" :value="state_code">{{ state_data.name || state_code }}</option>
																</template>
															</select>
															<div class="ts-down-icon"></div>
														</div>
													</div>
													<div class="ts-form-group vx-1-1">
														<template v-if="item.region.states && item.region.states.length">
															<div class="flexify simplify-ul attribute-select" >
																<template v-for="(stateCode, stateIndex) in item.region.states" :key="stateCode">
																	<a href="#" @click.prevent>
																		{{ getStateName(item.region.country, stateCode) || stateCode || '(untitled)' }}
																		<span @click.prevent="item.region.states.splice(stateIndex, 1)"><?= \Voxel\svg( 'trash-can.svg' ) ?></span>
																	</a>
																</template>
															</div>
														</template>
														<template v-else>
															<label style="padding-bottom: 0;"><?= _x( 'No states selected. Leave empty to allow all states in this country.', 'stripe vendor shipping', 'voxel' ) ?></label>
														</template>
													</div>
												</template>

												<div class="ts-form-group vx-1-1 switch-slider">
													<label><?= _x( 'Limit by ZIP codes', 'stripe vendor shipping', 'voxel' ) ?></label>
													<div class="onoffswitch">
														<input
															type="checkbox"
															class="onoffswitch-checkbox"
															:id="'switcher-zip-'+(item.region.country || '')"
															tabindex="0"
															v-model="item.region.zip_codes_enabled"
														>
														<label
															class="onoffswitch-label"
															:for="'switcher-zip-'+(item.region.country || '')"
														></label>
													</div>
												</div>
												<template v-if="item.region.zip_codes_enabled">
													<div class="ts-form-group vx-1-1">
														<label><?= _x( 'Limit to specific ZIP/postcodes in this country (one per line). ', 'stripe vendor shipping', 'voxel' ) ?></label>
														<textarea v-model="item.region.zip_codes" rows="3" placeholder="<?= esc_attr( _x( 'Enter ZIP codes one per line', 'stripe vendor shipping', 'voxel' ) ) ?>" style="min-height: 120px;"></textarea>
													</div>
												</template>
											</div>
										</div>
									</template>
								</template>
							</div>
						</template>
						<div v-else class="ts-form-group">
							<label style="padding-bottom: 0;"><?= _x( 'You have not added any countries yet.', 'stripe vendor shipping', 'voxel' ) ?></label>
						</div>
					</div>
				</div>
			</div>
		</template>
	</draggable>
	<a href="#" class="ts-repeater-add ts-btn ts-btn-4 form-btn" @click.prevent="addShippingZone()">
		<?= \Voxel\get_icon_markup( $this->get_settings_for_display('ts_add_icon') ) ?: \Voxel\svg( 'plus.svg' ) ?>
		<?= _x( 'Add shipping zone', 'stripe vendor shipping', 'voxel' ) ?>
	</a>
</div>

<!-- SHIPPING RATES SECTION -->
<div class="ts-form-group">
	<label><?= _x( 'Shipping rates', 'stripe vendor', 'voxel' ) ?></label>
	<draggable
		v-if="config.shipping_rates.length"
		v-model="config.shipping_rates"
		:group="'shipping_rates'"
		handle=".ts-repeater-head.ts-repeater-head--rate"
		item-key="key"
		class="ts-repeater-container"
		filter=".no-drag"
	>
		<template #item="{element: rate, index: rateIndex}">
			<div class="ts-field-repeater" :class="{collapsed: activeRate !== rate}">
				<div class="ts-repeater-head ts-repeater-head--rate" @click.prevent="activeRate = activeRate === rate ? null : rate">
				    <?= \Voxel\get_icon_markup( $this->get_settings_for_display('box_icon') ) ?: \Voxel\svg( 'box.svg' ) ?>
					<label>{{ rate.label || <?= wp_json_encode( _x( 'Untitled rate', 'stripe vendor shipping', 'voxel' ) ) ?> }}</label>
					<em v-if="getRateZones(rate).length">
						<template v-if="getRateZones(rate).length === 1">
							<?= _x( '1 zone', 'stripe vendor shipping', 'voxel' ) ?>
						</template>
						<template v-else>
							<?= \Voxel\replace_vars( _x( '@count zones', 'stripe vendor shipping', 'voxel' ), [
								'@count' => '{{ getRateZones(rate).length }}',
							] ) ?>
						</template>
					</em>
					<div class="ts-repeater-controller">
						<a href="#" @click.stop.prevent="removeShippingRate(rate)" class="ts-icon-btn ts-smaller no-drag">
							<?= \Voxel\get_icon_markup( $this->get_settings_for_display('trash_icon') ) ?: \Voxel\svg( 'trash-can.svg' ) ?>
						</a>
						<a href="#" class="ts-icon-btn ts-smaller no-drag" @click.prevent>
							<?= \Voxel\get_icon_markup( $this->get_settings_for_display('down_icon') ) ?: \Voxel\svg( 'chevron-down.svg' ) ?>
						</a>
					</div>
				</div>
				<div v-if="activeRate === rate" class="medium form-field-grid">
					<div class="ts-form-group vx-1-1">
						<label><?= _x( 'Label', 'stripe vendor shipping class', 'voxel' ) ?></label>
						<input v-model="rate.label" type="text" class="ts-filter" maxlength="32">
					</div>

					<!-- Zones selector -->
					<div class="ts-form-group vx-1-1">
						<label>
							<?= _x( 'Zones', 'stripe vendor shipping', 'voxel' ) ?>
							<span style="margin-left: auto;">
								<a href="#" @click.prevent="selectAllZonesForRate(rate)"><?= _x( 'Select all', 'stripe vendor shipping', 'voxel' ) ?></a>
								/
								<a href="#" @click.prevent="unselectAllZonesForRate(rate)"><?= _x( 'Unselect all', 'stripe vendor shipping', 'voxel' ) ?></a>
							</span>
						</label>
						<div class="ts-filter">
							<select @change="handleZoneSelectForRate(rate, $event.target.value, $event)">
								<option value=""><?= _x( 'Add zone', 'stripe vendor shipping', 'voxel' ) ?></option>
								<template v-for="zone in config.shipping_zones">
									<option :disabled="isRateInZone(rate, zone.key)" :value="zone.key">{{ zone.label || <?= wp_json_encode( _x( 'Untitled zone', 'stripe vendor shipping', 'voxel' ) ) ?> }}</option>
								</template>
							</select>
							<div class="ts-down-icon"></div>
						</div>
					</div>
					<div class="ts-form-group vx-1-1">
						<template v-if="getRateZones(rate).length">
							<div class="flexify simplify-ul attribute-select">
								<template v-for="zone in getRateZones(rate)" :key="zone.key">
									<a href="#" @click.prevent>
										{{ zone.label || <?= wp_json_encode( _x( 'Untitled zone', 'stripe vendor shipping', 'voxel' ) ) ?> }}
										<span @click.prevent="removeRateFromZone(rate, zone.key)"><?= \Voxel\svg( 'trash-can.svg' ) ?></span>
									</a>
								</template>
							</div>
						</template>
						<template v-else>
							<label style="padding-bottom: 0;"><?= _x( 'No zones selected. Select zones where this rate applies.', 'stripe vendor shipping', 'voxel' ) ?></label>
						</template>
					</div>

					<div class="ts-form-group vx-1-1">
						<label><?= _x( 'Type', 'stripe vendor shipping', 'voxel' ) ?></label>
						<div class="ts-filter">
							<select v-model="rate.type">
								<option value="free_shipping"><?= _x( 'Free shipping', 'stripe vendor shipping', 'voxel' ) ?></option>
								<option value="fixed_rate"><?= _x( 'Flat rate', 'stripe vendor shipping', 'voxel' ) ?></option>
							</select>
							<div class="ts-down-icon"></div>
						</div>
					</div>

					<template v-if="rate.type === 'free_shipping'">
						<div class="ts-form-group vx-1-1">
							<label><?= _x( 'Free shipping requires', 'stripe vendor shipping', 'voxel' ) ?></label>
							<div class="ts-filter">
								<select v-model="rate.free_shipping.requirements">
									<option value="none"><?= _x( 'No requirement', 'stripe vendor shipping', 'voxel' ) ?></option>
									<option value="minimum_order_amount"><?= _x( 'Minimum order amount', 'stripe vendor shipping', 'voxel' ) ?></option>
								</select>
								<div class="ts-down-icon"></div>
							</div>
						</div>

						<template v-if="rate.free_shipping.requirements === 'minimum_order_amount'">
							<div class="ts-form-group vx-1-1">
								<label><?= _x( 'Min. order amount', 'stripe vendor shipping', 'voxel' ) ?></label>
								<div class="input-container">
									<input v-model="rate.free_shipping.minimum_order_amount" type="number" step="any" class="ts-filter">
									<span class="input-suffix"><?= \Voxel\get_primary_currency() ?></span>
								</div>
							</div>
						</template>

						<div class="ts-form-group vx-1-1">
							<label>
								<div class="switch-slider">
									<div class="onoffswitch">
										<input type="checkbox" class="onoffswitch-checkbox" v-model="rate.free_shipping.delivery_estimate.enabled">
										<label class="onoffswitch-label" @click.prevent="rate.free_shipping.delivery_estimate.enabled = !rate.free_shipping.delivery_estimate.enabled"></label>
									</div>
								</div>
								<?= _x( 'Add delivery estimate?', 'stripe vendor shipping', 'voxel' ) ?>
							</label>

							<template v-if="rate.free_shipping.delivery_estimate.enabled">
								<div class="medium form-field-grid">
									<div class="ts-form-group vx-1-2">
										<label><?= _x( 'Between', 'stripe vendor shipping', 'voxel' ) ?></label>
										<input v-model="rate.free_shipping.delivery_estimate.minimum.value" type="number" class="ts-filter">
									</div>
									<div class="ts-form-group vx-1-2">
										<label><?= _x( 'Period', 'stripe vendor shipping', 'voxel' ) ?></label>
										<div class="ts-filter">
											<select v-model="rate.free_shipping.delivery_estimate.minimum.unit">
												<option value="hour"><?= _x( 'Hour(s)', 'stripe vendor shipping', 'voxel' ) ?></option>
												<option value="day"><?= _x( 'Day(s)', 'stripe vendor shipping', 'voxel' ) ?></option>
												<option value="business_day"><?= _x( 'Business day(s)', 'stripe vendor shipping', 'voxel' ) ?></option>
												<option value="week"><?= _x( 'Week(s)', 'stripe vendor shipping', 'voxel' ) ?></option>
												<option value="month"><?= _x( 'Month(s)', 'stripe vendor shipping', 'voxel' ) ?></option>
											</select>
											<div class="ts-down-icon"></div>
										</div>
									</div>
									<div class="ts-form-group vx-1-2">
										<label><?= _x( 'And', 'stripe vendor shipping', 'voxel' ) ?></label>
										<input v-model="rate.free_shipping.delivery_estimate.maximum.value" type="number" class="ts-filter">
									</div>
									<div class="ts-form-group vx-1-2">
										<label><?= _x( 'Period', 'stripe vendor shipping', 'voxel' ) ?></label>
										<div class="ts-filter">
											<select v-model="rate.free_shipping.delivery_estimate.maximum.unit">
												<option value="hour"><?= _x( 'Hour(s)', 'stripe vendor shipping', 'voxel' ) ?></option>
												<option value="day"><?= _x( 'Day(s)', 'stripe vendor shipping', 'voxel' ) ?></option>
												<option value="business_day"><?= _x( 'Business day(s)', 'stripe vendor shipping', 'voxel' ) ?></option>
												<option value="week"><?= _x( 'Week(s)', 'stripe vendor shipping', 'voxel' ) ?></option>
												<option value="month"><?= _x( 'Month(s)', 'stripe vendor shipping', 'voxel' ) ?></option>
											</select>
											<div class="ts-down-icon"></div>
										</div>
									</div>
								</div>
							</template>
						</div>
					</template>
					<template v-else-if="rate.type === 'fixed_rate'">
						<div class="ts-form-group vx-1-1">
							<label><?= _x( 'Calculation method', 'stripe vendor shipping', 'voxel' ) ?></label>
							<div class="ts-filter">
								<select v-model="rate.fixed_rate.calculation_method">
									<option value="per_item"><?= _x( 'Per item: Charge per item/quantity (default)', 'stripe vendor shipping', 'voxel' ) ?></option>
									<option value="per_order"><?= _x( 'Per order: Fixed cost regardless of quantity or number of items', 'stripe vendor shipping', 'voxel' ) ?></option>
									<option value="per_class"><?= _x( 'Per class: Use the highest shipping class cost', 'stripe vendor shipping', 'voxel' ) ?></option>
								</select>
								<div class="ts-down-icon"></div>
							</div>
						</div>

						<div class="ts-form-group vx-1-1">
							<label><?= _x( 'Price per unit', 'stripe vendor shipping', 'voxel' ) ?></label>
							<div class="input-container">
								<input v-model="rate.fixed_rate.amount_per_unit" type="number" step="any" class="ts-filter">
								<span class="input-suffix"><?= \Voxel\get_primary_currency() ?></span>
							</div>
						</div>

						<template v-if="rate.fixed_rate.calculation_method !== 'per_order'">
							<div v-if="Object.keys(config.shipping_classes).length" class="ts-form-group vx-1-1">
								<div class="medium form-field-grid">
									<div class="ts-form-group vx-1-1 ui-heading-field">
										<label><?= _x( 'Price by class', 'stripe vendor shipping', 'voxel' ) ?></label>
									</div>
									<template v-for="shipping_class, shipping_class_index in rate.fixed_rate.shipping_classes">
										<div v-if="config.shipping_classes[ shipping_class.shipping_class ]" class="ts-form-group vx-1-2">
											<label>
												{{ config.shipping_classes[ shipping_class.shipping_class ].label }}
											</label>
											<div class="input-container">
												<input class="ts-filter" v-model="shipping_class.amount_per_unit" type="number" step="any">
												<span class="input-suffix"><?= \Voxel\get_primary_currency() ?></span>
											</div>
										</div>
										<div class="ts-form-group vx-1-2">
											<label>&nbsp;</label>
											<a href="#" @click.stop.prevent="rate.fixed_rate.shipping_classes.splice(shipping_class_index, 1)" class="ts-btn ts-btn-1 form-btn">
												<?= \Voxel\get_icon_markup( $this->get_settings_for_display('trash_icon') ) ?: \Voxel\svg( 'trash-can.svg' ) ?>
												<?= _x( 'Remove', 'product field timeslots', 'voxel' ) ?>
											</a>
										</div>
									</template>
									<div class="ts-form-group" v-if="Object.values(config.shipping_classes).some( shipping_class => !rate.fixed_rate.shipping_classes.find( cls => cls.shipping_class === shipping_class.key ) )">
										<div class="flexify simplify-ul attribute-select" >
											<template v-for="shipping_class in config.shipping_classes">
												<a
													href="#"
													v-if="!rate.fixed_rate.shipping_classes.find( cls => cls.shipping_class === shipping_class.key )"
													@click.prevent="rate.fixed_rate.shipping_classes.push( {
														shipping_class: shipping_class.key,
														amount_per_unit: null,
													} )"
												>{{ shipping_class.label }}</a>
											</template>
										</div>
									</div>
								</div>
							</div>
						</template>

						<div class="ts-form-group vx-1-1">
							<label>
								<div class="switch-slider">
									<div class="onoffswitch">
										<input type="checkbox" class="onoffswitch-checkbox" v-model="rate.fixed_rate.delivery_estimate.enabled">
										<label class="onoffswitch-label" @click.prevent="rate.fixed_rate.delivery_estimate.enabled = !rate.fixed_rate.delivery_estimate.enabled"></label>
									</div>
								</div>
								<?= _x( 'Add delivery estimate?', 'stripe vendor shipping', 'voxel' ) ?>
							</label>

							<template v-if="rate.fixed_rate.delivery_estimate.enabled">
								<div class="medium form-field-grid">
									<div class="ts-form-group vx-1-2">
										<label><?= _x( 'Between', 'stripe vendor shipping', 'voxel' ) ?></label>
										<input v-model="rate.fixed_rate.delivery_estimate.minimum.value" type="number" class="ts-filter">
									</div>
									<div class="ts-form-group vx-1-2">
										<label><?= _x( 'Period', 'stripe vendor shipping', 'voxel' ) ?></label>
										<div class="ts-filter">
											<select v-model="rate.fixed_rate.delivery_estimate.minimum.unit">
												<option value="hour"><?= _x( 'Hour(s)', 'stripe vendor shipping', 'voxel' ) ?></option>
												<option value="day"><?= _x( 'Day(s)', 'stripe vendor shipping', 'voxel' ) ?></option>
												<option value="business_day"><?= _x( 'Business day(s)', 'stripe vendor shipping', 'voxel' ) ?></option>
												<option value="week"><?= _x( 'Week(s)', 'stripe vendor shipping', 'voxel' ) ?></option>
												<option value="month"><?= _x( 'Month(s)', 'stripe vendor shipping', 'voxel' ) ?></option>
											</select>
											<div class="ts-down-icon"></div>
										</div>
									</div>
									<div class="ts-form-group vx-1-2">
										<label><?= _x( 'And', 'stripe vendor shipping', 'voxel' ) ?></label>
										<input v-model="rate.fixed_rate.delivery_estimate.maximum.value" type="number" class="ts-filter">
									</div>
									<div class="ts-form-group vx-1-2">
										<label><?= _x( 'Period', 'stripe vendor shipping', 'voxel' ) ?></label>
										<div class="ts-filter">
											<select v-model="rate.fixed_rate.delivery_estimate.maximum.unit">
												<option value="hour"><?= _x( 'Hour(s)', 'stripe vendor shipping', 'voxel' ) ?></option>
												<option value="day"><?= _x( 'Day(s)', 'stripe vendor shipping', 'voxel' ) ?></option>
												<option value="business_day"><?= _x( 'Business day(s)', 'stripe vendor shipping', 'voxel' ) ?></option>
												<option value="week"><?= _x( 'Week(s)', 'stripe vendor shipping', 'voxel' ) ?></option>
												<option value="month"><?= _x( 'Month(s)', 'stripe vendor shipping', 'voxel' ) ?></option>
											</select>
											<div class="ts-down-icon"></div>
										</div>
									</div>
								</div>
							</template>
						</div>
					</template>
				</div>
			</div>
		</template>
	</draggable>
	<a href="#" @click.prevent="addShippingRate()" class="ts-repeater-add ts-btn ts-btn-4 form-btn">
		<?= \Voxel\get_icon_markup( $this->get_settings_for_display('ts_add_icon') ) ?: \Voxel\svg( 'plus.svg' ) ?>
		<?= _x( 'Add shipping rate', 'stripe vendor shipping', 'voxel' ) ?>
	</a>
</div>

<!-- BOTTOM ACTIONS -->
<div class="ts-form-group vx-1-2">
	<a @click.prevent="screen = 'main'" href="#" class="ts-btn ts-btn-1 ts-btn-large">
		<?= \Voxel\get_icon_markup( $this->get_settings_for_display('ts_chevron_left') ) ?: \Voxel\svg( 'chevron-left.svg' ) ?>
		<?= _x( 'Go back', 'stripe vendor shipping', 'voxel' ) ?>
	</a>
</div>
<div class="ts-form-group vx-1-2">
	<a @click.prevent="saveShipping" href="#" class="ts-btn ts-btn-2 ts-btn-large" :class="{'vx-disabled': savingShipping}">
		<?= \Voxel\get_icon_markup( $this->get_settings_for_display('save_icon') ) ?: \Voxel\svg( 'floppy-disk.svg' ) ?>
		<?= _x( 'Save changes', 'stripe vendor shipping', 'voxel' ) ?>
	</a>
</div>
