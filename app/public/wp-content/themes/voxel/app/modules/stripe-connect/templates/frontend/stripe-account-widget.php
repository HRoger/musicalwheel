<?php
if ( ! defined('ABSPATH') ) {
	exit;
} ?>
<script class="vxconfig" type="text/json"><?= wp_specialchars_decode( wp_json_encode( $config ) ) ?></script>
<div class="ts-vendor-settings hidden">
	<div v-if="screen === 'main'" class="ts-panel">
		
		<?php
				$gen_image = $this->get_settings_for_display('gen_image');
				$gen_image_url = ! empty( $gen_image['url'] ) ? $gen_image['url'] : get_template_directory_uri() . '/assets/images/Connect-social-card.png';
			?>
			<img src="<?= esc_url( $gen_image_url ) ?>" alt="">
		<div class="ac-body">
			
			<?php if (
				$user->has_cap('administrator')
				&& apply_filters( 'voxel/stripe_connect/enable_onboarding_for_admins', false ) !== true
			): ?>
				<p><?= _x( 'Stripe vendor onboarding is not necessary for admin accounts.', 'stripe vendor', 'voxel' ) ?></p>
			<?php else: ?>
				<?php if ( $account->charges_enabled ): ?>
					<p><?= _x( 'Your account is ready to accept payments.', 'stripe vendor', 'voxel' ) ?></p>
				<?php elseif ( $account->details_submitted ): ?>
					<p><?= _x( 'Your account is pending verification.', 'stripe vendor', 'voxel' ) ?></p>
				<?php else: ?>
					<p><?= _x( 'Setup your Stripe vendor account in order to accept payments.', 'stripe vendor', 'voxel' ) ?></p>
				<?php endif ?>
				<?php if ( ! $account->exists ): ?>
				<div class="ac-bottom">
					<ul class="simplify-ul current-plan-btn">
						<li>
							<a href="<?= esc_url( $onboard_link ) ?>" class="ts-btn ts-btn-1 ts-btn-large">
								 <?= \Voxel\get_icon_markup( $this->get_settings_for_display('ts_setup_ico') ) ?: \Voxel\svg( 'plus.svg' ) ?>
								<?= _x( 'Start setup', 'stripe vendor', 'voxel' ) ?>
							</a>
						</li>
					</ul>
				</div>
				<?php elseif ( ! $account->details_submitted ): ?>
				<div class="ac-bottom">
					<ul class="simplify-ul current-plan-btn">
						<li>
							<a href="<?= esc_url( $onboard_link ) ?>" class="ts-btn ts-btn-1 ts-btn-large">
								 <?= \Voxel\get_icon_markup( $this->get_settings_for_display('ts_submit_ico') ) ?: \Voxel\svg( 'info.svg' ) ?>
								<?= _x( 'Complete onboarding', 'stripe vendor', 'voxel' ) ?>
							</a>
						</li>
					</ul>
				</div>
				<?php else: ?>
				<div class="ac-bottom">
					<ul class="simplify-ul current-plan-btn">
						<li>
							<a href="<?= esc_url( $dashboard_link ) ?>" target="_blank" class="ts-btn ts-btn-1 ts-btn-large">
								 <?= \Voxel\get_icon_markup( $this->get_settings_for_display('ts_stripe_ico') ) ?: \Voxel\svg( 'stripe.svg' ) ?>
								<?= _x( 'Stripe Express Dashboard', 'stripe vendor', 'voxel' ) ?>
							</a>
						</li>
					</ul>
				</div>
				<div class="ac-bottom">
					<ul class="simplify-ul current-plan-btn">
						<li>
							<a href="<?= esc_url( $onboard_link ) ?>" class="ts-btn ts-btn-1 ts-btn-large">
								 <?= \Voxel\get_icon_markup( $this->get_settings_for_display('ts_update_ico') ) ?: \Voxel\svg( 'pen-to-square.svg' ) ?>
								<?= _x( 'Update information', 'stripe vendor', 'voxel' ) ?>
							</a>
						</li>
						<?php if ( \Voxel\get( 'payments.stripe.stripe_connect.shipping.responsibility' ) === 'vendor' ): ?>
							<li>
								<a href="#" class="ts-btn ts-btn-1 ts-btn-large" @click.prevent="screen = 'shipping'">
									 <?= \Voxel\get_icon_markup( $this->get_settings_for_display('ts_shipping_ico') ) ?: \Voxel\svg( 'fast-delivery.svg' ) ?>
									<?= _x( 'Configure shipping', 'stripe vendor', 'voxel' ) ?>
								</a>
							</li>
						<?php endif ?>
					</ul>
				</div>
				<?php endif ?>
			<?php endif ?>
		</div>
	</div>

	<?php if ( \Voxel\get( 'payments.stripe.stripe_connect.shipping.responsibility' ) === 'vendor' ): ?>
		<div v-if="screen === 'shipping'" class="ts-vendor-shipping-zones" style="margin-top: 20px;">
			<div class="ac-body">
				<div class="ts-form">
					<div class="create-form-step form-field-grid">
						<?php require locate_template('app/modules/stripe-connect/templates/frontend/stripe-account-shipping.php') ?>
					</div>
				</div>
			</div>
		</div>
	<?php endif ?>
</div>
