<?php
if ( ! defined('ABSPATH') ) {
	exit;
} ?>
<div class="ts-group">
	<div class="ts-group-head">
		<h3>PayPal</h3>
	</div>
	<div class="x-row">
		<?php \Voxel\Utils\Form_Models\Select_Model::render( [
			'v-model' => 'settings.currency',
			'label' => 'Currency',
			'choices' => \Voxel\Utils\Currency_List::only( $this->get_supported_currencies() ),
			'classes' => 'x-col-12',
		] ) ?>

		<?php \Voxel\Utils\Form_Models\Select_Model::render( [
			'v-model' => 'settings.mode',
			'label' => 'Mode',
			'classes' => 'x-col-12',
			'choices' => [
				'live' => 'Production',
				'sandbox' => 'Sandbox (test mode)',
			],
		] ) ?>

		<template v-if="settings.mode === 'sandbox'">
			<?php \Voxel\Utils\Form_Models\Password_Model::render( [
				'v-model' => 'settings.sandbox.client_id',
				'label' => 'Sandbox Client ID',
				'classes' => 'x-col-6',
				'infobox' => 'You can access your PayPal Client ID and Secret by navigating to: PayPal Developer Dashboard → My Apps & Credentials → Create App (or select existing app).',
			] ) ?>

			<?php \Voxel\Utils\Form_Models\Password_Model::render( [
				'v-model' => 'settings.sandbox.client_secret',
				'label' => 'Sandbox Client Secret',
				'classes' => 'x-col-6',
				'infobox' => 'Keep your Client Secret secure and never share it publicly.',
			] ) ?>

			<template v-if="settings.sandbox.client_id && settings.sandbox.client_secret">
				<?php \Voxel\Utils\Form_Models\Key_Model::render( [
					'v-model' => 'settings.sandbox.webhook.id',
					'label' => 'Sandbox Webhook ID',
					'classes' => 'x-col-12',
					'placeholder' => 'Not configured',
					'infobox' => 'Webhooks enable real-time payment notifications from PayPal, allowing automatic order status updates when payments are completed, refunded, or other events occur. Only the webhook ID is required.',
				] ) ?>

				<div v-if="!settings.sandbox.webhook.id" class="ts-form-group x-col-12">
					<a href="#" @click.prevent="setupWebhook($event, 'sandbox')" class="ts-button ts-outline">Create webhook</a>
				</div>
			</template>
		</template>
		<template v-else>
			<?php \Voxel\Utils\Form_Models\Password_Model::render( [
				'v-model' => 'settings.live.client_id',
				'label' => 'Client ID',
				'classes' => 'x-col-6',
				'infobox' => 'You can access your PayPal Client ID and Secret by navigating to: PayPal Developer Dashboard → My Apps & Credentials → Create App (or select existing app).',
			] ) ?>

			<?php \Voxel\Utils\Form_Models\Password_Model::render( [
				'v-model' => 'settings.live.client_secret',
				'label' => 'Client Secret',
				'classes' => 'x-col-6',
				'infobox' => 'Keep your Client Secret secure and never share it publicly.',
			] ) ?>

			<template v-if="settings.live.client_id && settings.live.client_secret">
				<?php \Voxel\Utils\Form_Models\Key_Model::render( [
					'v-model' => 'settings.live.webhook.id',
					'label' => 'Webhook ID',
					'classes' => 'x-col-12',
					'placeholder' => 'Not configured',
					'infobox' => 'Webhooks enable real-time payment notifications from PayPal, allowing automatic order status updates when payments are completed, refunded, or other events occur. Only the webhook ID is required.',
				] ) ?>

				<div v-if="!settings.live.webhook.id" class="ts-form-group x-col-12">
					<a href="#" @click.prevent="setupWebhook($event, 'live')" class="ts-button ts-outline">Create webhook</a>
				</div>
			</template>
		</template>
	</div>
</div>

<div class="ts-group">
	<div class="ts-group-head">
		<h3>Payments</h3>
	</div>
	<div class="x-row">
		<?php \Voxel\Utils\Form_Models\Select_Model::render( [
			'v-model' => 'settings.payments.order_approval',
			'label' => 'Order approval',
			'classes' => 'x-col-12',
			'choices' => [
				'automatic' => 'Automatic: Order is approved once payment succeeds',
				'deferred' => 'Deferred: Order is approved once payment is authorized and late stock validation succeeds',
				'manual' => 'Manual: Order is approved manually by vendor',
			],
		] ) ?>
	</div>
</div>
