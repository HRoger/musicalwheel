<?php
if ( ! defined('ABSPATH') ) {
	exit;
} ?>
<div class="ts-group">
	<div class="ts-group-head">
		<h3>Map provider</h3>
	</div>
	<div class="x-row">
		<?php \Voxel\Utils\Form_Models\Select_Model::render( [
			'v-model' => 'config.maps.provider',
			'label' => 'Select map provider',
			'classes' => 'x-col-12',
			'choices' => [
				'google_maps' => 'Google Maps',
				'mapbox' => 'Mapbox',
				'openstreetmap' => 'OpenStreetMap',
			],
		] ) ?>
	</div>
</div>
<template v-if="config.maps.provider === 'google_maps'">
	<div class="ts-group">
		<div class="ts-group-head">
			<h3>API key</h3>
		</div>

		<div class="x-row">
			<?php \Voxel\Utils\Form_Models\Text_Model::render( [
				'v-model' => 'config.maps.google_maps.api_key',
				'label' => 'Google Maps API key',
				'classes' => 'x-col-12',
			] ) ?>
		</div>
	</div>
	<div class="ts-group">
		<div class="ts-group-head">
			<h3>Map options</h3>
		</div>
		<div class="x-row">
			<?php \Voxel\Utils\Form_Models\Select_Model::render( [
				'v-model' => 'config.maps.google_maps.map_type_id',
				'label' => 'Map type',
				'classes' => 'x-col-12',
				'choices' => [
					'roadmap' => 'Roadmap: Displays a normal street map',
					'satellite' => 'Satellite: Displays satellite images',
					'terrain' => 'Terrain: Displays maps with physical features such as terrain and vegetation',
					'hybrid' => 'Hybrid: Displays a transparent layer of major streets on satellite images',
				],
			] ) ?>

			<?php \Voxel\Utils\Form_Models\Switcher_Model::render( [
				'v-model' => 'config.maps.google_maps.map_type_control',
				'label' => 'Show Map Type control',
				'classes' => 'x-col-12',
			] ) ?>

			<?php \Voxel\Utils\Form_Models\Switcher_Model::render( [
				'v-model' => 'config.maps.google_maps.street_view_control',
				'label' => 'Show Street View control',
				'classes' => 'x-col-12',
			] ) ?>

			<div class="ts-form-group x-col-12">
				<label>Custom map skin</label>
				<textarea v-model="config.maps.google_maps.skin" placeholder="Paste the map skin JSON code here" style="height: 100px"></textarea>
				<p>
					You can create custom map styles through the
					<a href="https://console.cloud.google.com/google/maps-apis/studio/styles" target="_blank">Google Maps Cloud Console</a>.
					Leave empty to use default map skin.
				</p>
			</div>
		</div>
	</div>
	<div class="ts-group">
		<div class="ts-group-head">
			<h3>Localization</h3>
		</div>
		<div class="x-row">
			<div class="ts-form-group x-col-12">
				<label>Language</label>
				<select v-model="config.maps.google_maps.language">
					<option value="">Default (browser detected)</option>
					<?php foreach ( \Voxel\Modules\Google_Maps\Supported_Languages::all() as $key => $label ): ?>
						<option value="<?= $key ?>"><?= $label ?></option>
					<?php endforeach ?>
				</select>
			</div>
			<div class="ts-form-group x-col-12">
				<label>Region</label>
				<select v-model="config.maps.google_maps.region">
					<option value="">All</option>
					<?php foreach ( \Voxel\Utils\Country_List::all() as $country ): ?>
						<option value="<?= $country['alpha-2'] ?>"><?= $country['name'] ?></option>
					<?php endforeach ?>
				</select>

			</div>
			<div class="ts-form-group x-col-12">
				<p>
					If you set the language of the map, it's important to consider setting the region too.
					This helps ensure that your application complies with local laws. If a region is set,
					address geocoding results will be biased towards that region too.
					<a href="https://developers.google.com/maps/documentation/javascript/localization" target="_blank">Read more</a>
				</p>
			</div>
		</div>
	</div>

	<div class="ts-group">
		<div class="ts-group-head">
			<h3>Autocomplete: Search forms</h3>
		</div>

		<div class="x-row">
			<div class="ts-form-group x-col-12">
				<label>Search form: Autocomplete returns results for</label>
				<select v-model="config.maps.google_maps.autocomplete.feature_types">
					<option :value="null">All feature types</option>
					<option value="geocode">Geocoding results</option>
					<option value="establishment">Establishments</option>
					<option value="(regions)">Regions</option>
					<option value="(cities)">Cities</option>
					<option value="point_of_interest">Points of interest</option>
					<option value="street_address">Street addresses</option>
					<option value="postal_code">Postal codes</option>
					<option value="custom">Custom</option>
				</select>
			</div>

			<?php \Voxel\Utils\Form_Models\Text_Model::render( [
				'v-if' => 'config.maps.google_maps.autocomplete.feature_types === \'custom\'',
				'v-model' => 'config.maps.google_maps.autocomplete.feature_types_custom',
				'label' => 'Enter up to 5 feature types (comma-separated)
					<a href="https://developers.google.com/maps/documentation/places/web-service/place-types#table-a" target="_blank" style="float:right;">Supported values</a>',
				'placeholder' => 'e.g. country, locality, sublocality, postal_code',
				'classes' => 'x-col-12',
			] ) ?>
		</div>
	</div>
	<div class="ts-group">
		<div class="ts-group-head">
			<h3>Autocomplete: Submission</h3>
		</div>
		<div class="x-row">
			<div class="ts-form-group x-col-12">
				<label>Post submission form: Autocomplete returns results for</label>
				<select v-model="config.maps.google_maps.autocomplete.feature_types_in_submission">
					<option :value="null">All feature types</option>
					<option value="geocode">Geocoding results</option>
					<option value="establishment">Establishments</option>
					<option value="(regions)">Regions</option>
					<option value="(cities)">Cities</option>
					<option value="point_of_interest">Points of interest</option>
					<option value="street_address">Street addresses</option>
					<option value="postal_code">Postal codes</option>
					<option value="custom">Custom</option>
				</select>
			</div>

			<?php \Voxel\Utils\Form_Models\Text_Model::render( [
				'v-if' => 'config.maps.google_maps.autocomplete.feature_types_in_submission === \'custom\'',
				'v-model' => 'config.maps.google_maps.autocomplete.feature_types_in_submission_custom',
				'label' => 'Enter up to 5 feature types (comma-separated)
					<a href="https://developers.google.com/maps/documentation/places/web-service/place-types#table-a" target="_blank" style="float:right;">Supported values</a>',
				'placeholder' => 'e.g. country, locality, sublocality, postal_code',
				'classes' => 'x-col-12',
			] ) ?>
		</div>
	</div>
	<div class="ts-group">
		<div class="ts-group-head">
			<h3>Autocomplete: Countries</h3>
		</div>
		<div class="x-row">
			<div class="ts-form-group x-col-12">
				<label>Autocomplete returns results in</label>
				<select v-model="config.maps.google_maps.autocomplete.countries" multiple="multiple" style="height: 180px; padding-top: 15px; padding-bottom: 15px;" class="min-scroll">
					<?php foreach ( \Voxel\Utils\Country_List::all() as $country ): ?>
						<option value="<?= $country['alpha-2'] ?>"><?= $country['name'] ?></option>
					<?php endforeach ?>
				</select>

			</div>
			<div class="ts-form-group x-col-12">
				<p>Limit autocomplete results to one or more countries (max: 5).</p>
			</div>
		</div>
	</div>
</template>

<template v-if="config.maps.provider === 'mapbox'">
	<div class="ts-group">
		<div class="ts-group-head">
			<h3>API Key</h3>
		</div>

		<div class="x-row">
			<?php \Voxel\Utils\Form_Models\Text_Model::render( [
				'v-model' => 'config.maps.mapbox.api_key',
				'label' => 'Mapbox API key',
				'classes' => 'x-col-12',
			] ) ?>
		</div>
	</div>
	<div class="ts-group">
		<div class="ts-group-head">
			<h3>Skins</h3>
		</div>
		<div class="x-row">
			<div class="ts-form-group x-col-12">
				<label>Custom map skin</label>
				<input type="text" v-model="config.maps.mapbox.skin" placeholder="Paste the style URL here">

			</div>
			<div class="ts-form-group x-col-12">
				<p>You can create custom map styles through <a href="https://studio.mapbox.com/" target="_blank">Mapbox Studio</a>. Leave empty to use default map skin.</p>
			</div>
		</div>
	</div>

	<div class="ts-group">
		<div class="ts-group-head">
			<h3>Localization</h3>
		</div>

		<div class="x-row">
			<div class="ts-form-group x-col-12">
				<label>Language</label>
				<select v-model="config.maps.mapbox.language">
					<option :value="null">Default (browser detected)</option>
					<optgroup label="Global coverage">
						<?php foreach ( \Voxel\Modules\Mapbox\Supported_Languages::global_coverage() as $key => $label ): ?>
							<option value="<?= $key ?>"><?= $label ?></option>
						<?php endforeach ?>
					</optgroup>
					<optgroup label="Local coverage">
						<?php foreach ( \Voxel\Modules\Mapbox\Supported_Languages::local_coverage() as $key => $label ): ?>
							<option value="<?= $key ?>"><?= $label ?></option>
						<?php endforeach ?>
					</optgroup>
					<optgroup label="Limited coverage">
						<?php foreach ( \Voxel\Modules\Mapbox\Supported_Languages::limited_coverage() as $key => $label ): ?>
							<option value="<?= $key ?>"><?= $label ?></option>
						<?php endforeach ?>
					</optgroup>
				</select>
			</div>
		</div>

	</div>
	<div class="ts-group">
		<div class="ts-group-head">
			<h3>Autocomplete: Search form</h3>
		</div>

		<div class="x-row">
			<?php \Voxel\Utils\Form_Models\Checkboxes_Model::render( [
				'v-model' => 'config.maps.mapbox.autocomplete.feature_types',
				'label' => 'Search form: Autocomplete returns results for',
				'classes' => 'x-col-12',
				'columns' => 'two',
				'choices' => [
					'country' => 'Countries',
					'region' => 'Regions',
					'postcode' => 'Postcodes',
					'district' => 'Districts',
					'place' => 'Places',
					'locality' => 'Localities',
					'neighborhood' => 'Neighborhoods',
					'address' => 'Addresses',
					'poi' => 'Points of interest',
				],
			] ) ?>
		</div>
	</div>
	<div class="ts-group">
		<div class="ts-group-head">
			<h3>Autocomplete: Post submission</h3>
		</div>
		<div class="x-row">
			<?php \Voxel\Utils\Form_Models\Checkboxes_Model::render( [
				'v-model' => 'config.maps.mapbox.autocomplete.feature_types_in_submission',
				'label' => 'Post submission form: Autocomplete returns results for',
				'classes' => 'x-col-12',
				'columns' => 'two',
				'choices' => [
					'country' => 'Countries',
					'region' => 'Regions',
					'postcode' => 'Postcodes',
					'district' => 'Districts',
					'place' => 'Places',
					'locality' => 'Localities',
					'neighborhood' => 'Neighborhoods',
					'address' => 'Addresses',
					'poi' => 'Points of interest',
				],
				'footnote' => <<<HTML
					<br>Determine what kind of features should be searched by autocomplete. If left empty, all available features will be used.
					<a href="https://docs.mapbox.com/api/search/geocoding/#data-types" target="_blank">Read more</a>
				HTML,
			] ) ?>
		</div>
	</div>
	<div class="ts-group">
		<div class="ts-group-head">
			<h3>Autocomplete: Countries</h3>
		</div>
		<div class="x-row">
			<div class="ts-form-group x-col-12">
				<label>Autocomplete returns results in</label>
				<select v-model="config.maps.mapbox.autocomplete.countries" multiple="multiple" style="height: 180px; padding-top: 15px; padding-bottom: 15px;" class="min-scroll">
					<?php foreach ( \Voxel\Utils\Country_List::all() as $country ): ?>
						<option value="<?= $country['alpha-2'] ?>"><?= $country['name'] ?></option>
					<?php endforeach ?>
				</select>
				<br><br>
				<p>Limit autocomplete results to one or more countries.</p>
			</div>
		</div>
	</div>

</template>

<template v-if="config.maps.provider === 'openstreetmap'">
	<div class="ts-group">
		<div class="ts-group-head">
			<h3>Tile server</h3>
		</div>
		<div class="x-row">
			<?php \Voxel\Utils\Form_Models\Text_Model::render( [
				'v-model' => 'config.maps.openstreetmap.tile_url',
				'label' => 'Tile URL',
				'placeholder' => 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
				'classes' => 'x-col-12',
				'infobox' => <<<HTML
				Custom tile server URL. Use placeholders: <code>{s}</code> for subdomain,
				<code>{z}</code> for zoom, <code>{x}</code> and <code>{y}</code> for tile coordinates.
				Leave empty for default OpenStreetMap tiles.
				HTML,
			] ) ?>

			<?php \Voxel\Utils\Form_Models\Text_Model::render( [
				'v-model' => 'config.maps.openstreetmap.tile_subdomains',
				'label' => 'Tile subdomains',
				'placeholder' => 'abc',
				'classes' => 'x-col-12',
				'infobox' => <<<HTML
				Subdomains for load balancing. Default: <code>abc</code>
				HTML,
			] ) ?>
		</div>
	</div>
	<div class="ts-group">
		<div class="ts-group-head">
			<h3>Geocoding provider</h3>
		</div>
		<div class="x-row">
			<div class="ts-form-group x-col-12">
				<label>Select geocoding provider</label>
				<select v-model="config.maps.openstreetmap.geocoding_provider">
					<option value="nominatim">Nominatim (Free, 1 req/sec limit - not for commercial use)</option>
					<option value="google_maps">Google Maps (Uses existing Google Maps API key)</option>
					<option value="mapbox">Mapbox (Uses existing Mapbox API key)</option>
				</select>
			</div>
			<div class="ts-form-group x-col-12" v-if="config.maps.openstreetmap.geocoding_provider === 'nominatim'">
				<p>
					<strong>Usage Policy:</strong> Nominatim has strict usage limits (1 request per second application-wide) and is not suitable for commercial use. Consider using an alternative provider for production sites.
				</p>
			</div>
			<div class="ts-form-group x-col-12" v-if="['google_maps', 'mapbox'].includes(config.maps.openstreetmap.geocoding_provider)">
				<p>
					This provider will use the API key configured in the <strong>{{ config.maps.openstreetmap.geocoding_provider === 'google_maps' ? 'Google Maps' : 'Mapbox' }}</strong> settings above.
				</p>
			</div>

			<template v-if="config.maps.openstreetmap.geocoding_provider === 'nominatim'">
				<div class="ts-form-group x-col-12">
					<label>Autocomplete language</label>
					<select v-model="config.maps.openstreetmap.nominatim.language">
						<option value="">Default</option>
						<?php foreach ( \Voxel\Modules\Openstreetmap\Supported_Languages::all() as $key => $label ): ?>
							<option value="<?= $key ?>"><?= $label ?></option>
						<?php endforeach ?>
					</select>
				</div>
				<div class="ts-form-group x-col-12">
					<label>Autocomplete returns results in</label>
					<select v-model="config.maps.openstreetmap.nominatim.countries" multiple="multiple" style="height: 180px; padding-top: 15px; padding-bottom: 15px;" class="min-scroll">
						<?php foreach ( \Voxel\Utils\Country_List::all() as $country ): ?>
							<option value="<?= strtolower( $country['alpha-2'] ) ?>"><?= $country['name'] ?></option>
						<?php endforeach ?>
					</select>
					<br><br>
					<p>Limit autocomplete results to one or more countries.</p>
				</div>
			</template>
		</div>
	</div>
</template>
<div class="ts-group">
	<div class="ts-group-head">
		<h3>Post submission: Default map picker location</h3>
	</div>
	<div class="x-row">
		<div class="ts-form-group x-col-4">
			<label>Latitude</label>
			<input v-model="config.maps.default_location.lat" type="number" min="-90" max="90" placeholder="42.5" step="any">
		</div>
		<div class="ts-form-group x-col-4">
			<label>Longitude</label>
			<input v-model="config.maps.default_location.lng" type="number" min="-180" max="180" placeholder="21.0" step="any">
		</div>
		<div class="ts-form-group x-col-4">
			<label>Zoom level</label>
			<input v-model="config.maps.default_location.zoom" type="number" min="0" max="30" placeholder="10">
		</div>
	</div>
</div>
