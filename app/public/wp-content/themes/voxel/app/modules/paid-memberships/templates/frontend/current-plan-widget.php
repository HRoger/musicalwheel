<?php
if ( ! defined('ABSPATH') ) {
	exit;
} ?>
<div class="ts-panel active-plan plan-panel">
	<div class="ac-head">
		<?= \Voxel\get_icon_markup( $this->get_settings_for_display('ts_plan_ico') ) ?: \Voxel\svg( 'badge.svg' ) ?>
		<b>
			<?= _x( 'Current plan', 'current plan', 'voxel' ) ?>	
		</b>
	</div>

	<?php if (
		$membership->get_type() === 'order'
		&& ( $order = $membership->get_order() )
		&& ( $payment_method = $membership->get_payment_method() )
		&& ! $payment_method->is_subscription_canceled()
	): ?>
		<div class="ac-body">
			<div class="ac-plan-pricing">
				<span class="ac-plan-price">
					<?= \Voxel\currency_format( $membership->get_amount(), $membership->get_currency(), false ) ?>
				</span>
				<div class="ac-price-period">
					/ <?= \Voxel\interval_format( $membership->get_interval(), $membership->get_frequency() ) ?>
				</div>
			</div>

			<?php if ( $message = $membership->get_status_message_for_customer() ): ?>
				<p><?= esc_html( $message ) ?></p>
			<?php endif ?>

			<p><?= \Voxel\replace_vars( _x( 'Your current plan is @plan_label', 'current plan', 'voxel' ), [
				'@plan_label' => $membership->get_active_plan()->get_label(),
			] ) ?></p>

			<div class="ac-bottom">
				<ul class="simplify-ul current-plan-btn">
					<li>
						<a href="<?= esc_url( $order->get_link() ) ?>" class="ts-btn ts-btn-1">
							<?= \Voxel\get_icon_markup( $this->get_settings_for_display('ts_configure_ico') ) ?: \Voxel\svg( 'cog.svg' ) ?>
							<?= _x( 'Manage subscription', 'current plan', 'voxel' ) ?>
						</a>
					</li>
					<?php if ( $switch_plan_url ): ?>
						<li>
							<a href="<?= esc_url( $switch_plan_url ) ?>" class="ts-btn ts-btn-1">
								<?= \Voxel\get_icon_markup( $this->get_settings_for_display('ts_switch_ico') ) ?: \Voxel\svg( 'switch.svg' ) ?>
								<?= _x( 'Switch plan', 'current plan', 'voxel' ) ?>
							</a>
						</li>
					<?php endif ?>
				</ul>
			</div>
		</div>
	<?php else: ?>
		<div class="ac-body">
			<p>	<?= \Voxel\replace_vars( _x( 'Your current plan is @plan_label', 'current plan', 'voxel' ), [
				'@plan_label' => $membership->get_active_plan()->get_label(),
			] ) ?></p>
			<?php if ( $switch_plan_url): ?>
				<div class="ac-bottom">
					<ul class="simplify-ul current-plan-btn">
						<li>
							<a href="<?= esc_url( $switch_plan_url ) ?>" class="ts-btn ts-btn-1">
								<?= \Voxel\get_icon_markup( $this->get_settings_for_display('ts_switch_ico') ) ?: \Voxel\svg( 'switch.svg' ) ?>
								<?= _x( 'Switch plan', 'current plan', 'voxel' ) ?>
							</a>
						</li>
					</ul>
				</div>
			<?php endif ?>
		</div>
	<?php endif ?>
</div>

