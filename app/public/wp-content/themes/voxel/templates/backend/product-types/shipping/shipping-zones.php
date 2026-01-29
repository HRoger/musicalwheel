<?php
if ( ! defined('ABSPATH') ) {
	exit;
} ?>
<div class="ts-group">
	<div class="ts-group-head">
		<h3>Shipping zones</h3>
		<div class="vx-info-box">
			<?php \Voxel\svg( 'info.svg' ) ?>
			<p>Shipping zones used for products sold by the platform.</p>
		</div>
	</div>
	<div class="x-row">
		<div class="x-col-12 field-container ts-drag-animation">
			<template v-if="config.shipping.shipping_zones.length">
				<draggable
					v-model="config.shipping.shipping_zones"
					group="shipping_zones"
					handle=".field-head.field-head--zones"
					item-key="key"
				>
					<template #item="{element: zone, index: index}">
						<div class="single-field wide" :class="{open: state.activeShippingZone === zone}">
							<div class="field-head field-head--zones" @click="state.activeShippingZone = state.activeShippingZone === zone ? null : zone">
								<p class="field-name">{{ zone.label || 'Untitled zone' }}</p>
								<p class="field-type">
									<template v-if="zone.rates.length">{{ zone.rates.length }} shipping rate{{ zone.rates.length !== 1 ? 's' : '' }}</template>

									<span style="display: none;">{{ zone.key }}</span>
								</p>
								<div class="field-actions">
									<span class="field-action all-center">
										<a href="#" @click.prevent="config.shipping.shipping_zones.splice(index, 1)">
											<i class="lar la-trash-alt icon-sm"></i>
										</a>
									</span>
								</div>
							</div>
							<div v-if="state.activeShippingZone === zone" class="field-body">
								<div class="x-row">
									<?php \Voxel\Utils\Form_Models\Text_Model::render( [
										'v-model' => 'zone.label',
										'label' => 'Label',
										'classes' => 'x-col-12',
									] ) ?>


									<div class="ts-form-group x-col-12">
										<label>Countries</label>
										<span class="toggle-btns">
											<a href="#" @click.prevent="selectAllCountries(zone)">Select all</a>
											<span>/</span>
											<a href="#" @click.prevent="unselectAllCountries(zone)">Unselect all</a>
										</span>

										<div class="add-field">
											<select @change="handleCountrySelect(zone, $event.target.value, $event)">
												<option value="">Add country</option>
												<template v-for="(countries, continent) in props.shipping_countries_by_continent">
													<option v-if="shouldShowContinentOption(continent)" :value="'continent:' + continent" style="font-weight: bold;">All in {{ continent }}</option>
												</template>
												<template v-for="(countries, continent) in props.shipping_countries_by_continent">
													<optgroup :label="continent">
														<template v-for="(country_name, country_code) in countries">
															<option :disabled="zone.regions.find( region => region.country === country_code )" :value="country_code">{{ country_name }}</option>
														</template>
													</optgroup>
												</template>
											</select>
										</div>
									</div>

									<div class="ts-form-group x-col-12">
										<template v-if="zone.regions.length">
											<div class="field-container">
												<ul class="inner-tabs">
													<li :class="{'current-item': getActiveContinent(zone) === null}">
														<a href="#" @click.prevent="setActiveContinent(zone, null)">
															All ({{ zone.regions.length }})
														</a>
													</li>
													<template v-for="continentData in getContinentsWithCounts(zone)">
														<li :class="{'current-item': getActiveContinent(zone) === continentData.name}">
															<a href="#" @click.prevent="setActiveContinent(zone, continentData.name)">
																{{ continentData.name }} ({{ continentData.count }})
															</a>
														</li>
													</template>
												</ul>
												<div class="vx-selected-regions min-scroll">
													<template v-for="(countries, continent) in getFilteredRegionsByContinent(zone)">
														<div v-for="item in countries" :key="item.region.country" class="single-field wide" :class="{open: state.activeRegion === item.region}">
															<div class="field-head" @click="state.activeRegion = state.activeRegion === item.region ? null : item.region">
																<p class="field-name">{{ item.name || '(untitled)' }}</p>
																<p class="field-type">
																	<span style="display: none;">{{ item.region.country }}</span>
																</p>
																<div class="field-actions">
																	<span class="field-action all-center">
																		<a href="#" @click.prevent="zone.regions.splice(zone.regions.indexOf(item.region), 1)">
																			<i class="lar la-trash-alt icon-sm"></i>
																		</a>
																	</span>
																</div>
															</div>
															<div v-if="state.activeRegion === item.region" class="field-body">
																<div class="x-row">
																	<template v-if="props.shipping_countries[item.region.country] && props.shipping_countries[item.region.country].states && Object.keys(props.shipping_countries[item.region.country].states).length">
																		<div class="ts-form-group x-col-12">
																			<label>
																				States

																			</label>
                                                                            <span class="toggle-btns">
																					<a href="#" @click.prevent="selectAllStates(item.region, item.region.country)">Select all</a>
																					<span>/</span>
																					<a href="#" @click.prevent="item.region.states = []">Unselect all</a>
                                                                            </span>
																			<div class="x-row">
                                                                                <div class="ts-form-group x-col-12">
                                                                                    <div class="add-field">
                                                                                        <select @change="handleStateSelect(item.region, $event.target.value, $event)">
                                                                                            <option value="">Add state</option>
                                                                                            <template v-for="(state_name, state_code) in getAvailableStates(item.region.country)">
                                                                                                <option
                                                                                                    :disabled="Array.isArray(item.region.states) && item.region.states.includes(state_code)"
                                                                                                    :value="state_code"
                                                                                                >
                                                                                                    {{ state_name.name }}
                                                                                                </option>
                                                                                            </template>
                                                                                        </select>
                                                                                    </div>
                                                                                </div>
                                                                                <div class="x-col-12 ts-form-group">
                                                                                    <template v-if="item.region.states && item.region.states.length">
                                                                                        <div class="vx-selected-states">
                                                                                            <div v-for="(stateCode, stateIndex) in item.region.states" :key="stateCode" class="ts-button ts-outline shipping-cn">
                                                                                                <p>{{ getStateName(item.region.country, stateCode) || stateCode || '(untitled)' }}</p>
                                                                                                <a href="#" @click.prevent="item.region.states.splice(stateIndex, 1)" class="vx-button-delete">
                                                                                                    <?php \Voxel\svg( 'close.svg' ) ?>
                                                                                                </a>
                                                                                            </div>
                                                                                        </div>
                                                                                    </template>
                                                                                    <div v-else class="ts-form-group">
                                                                                        <label style="padding-bottom: 0;">No states selected. Leave empty to allow all states in this country.</label>
                                                                                    </div>
                                                                                </div>
                                                                            </div>


																		</div>
																	</template>

																	<div class="ts-form-group x-col-12 switch-slider">
																		<span class="vx-info-box wide" style="float: right;">
																			<?php \Voxel\svg( 'info.svg' ) ?>
																			<div style="width: 400px;">
																				Limit shipping to specific ZIP/postal codes. Supported formats:<br><br>

																				<b>1. Exact ZIP Code</b><br>
																				23000<br>
																				90210<br><br>

																				<b>2. ZIP Code Range</b><br>
																				20000..90000<br><br>

																				<b>3. Wildcard Pattern</b><br>
																				NW20*<br>
																				SW1*<br>
																				(Matches any ZIP starting with the prefix)
																			</div>
																		</span>
																		<label>Limit by ZIP codes</label>
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

																	<div class="ts-form-group x-col-12" v-if="item.region.zip_codes_enabled">
																		<label>ZIP codes</label>
																		<textarea v-model="item.region.zip_codes" rows="3" placeholder="Enter ZIP codes one per line" style="min-height: 120px;"></textarea>
																	</div>
																</div>
															</div>
														</div>
													</template>
												</div>
											</div>
										</template>

										<div v-else class="ts-form-group">
											<label style="padding-bottom: 0;">You have not added any countries yet.</label>
										</div>
									</div>
								</div>
							</div>
						</div>
					</template>
				</draggable>
			</template>
			<div v-else class="ts-form-group">
				<p>You have not added any shipping zones yet.</p>
			</div>
		</div>

		<div class="x-col-12">
			<div class="add-field">
				<div
					class="ts-button ts-outline"
					@click.prevent="addShippingZone()"
				>
					<p class="field-name">Add shipping zone</p>
				</div>
			</div>
		</div>

	</div>
</div>

