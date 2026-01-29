<?php
if ( ! defined('ABSPATH') ) {
	exit;
} ?>
<a href="<?= esc_url( $auth_link ) ?>" class="ts-btn ts-btn-1 form-btn">
	<?= \Voxel\get_icon_markup( $this->get_settings_for_display('ts_enter') ) ?: \Voxel\svg( 'user.svg' ) ?>
	<?= _x( 'Existing customer? Sign in', 'cart summary', 'voxel' ) ?>
</a>

<div class="checkout-section form-field-grid">
	<div class="ts-form-group">
		<div class="or-group">
		    <div class="or-line"></div>
			<span class="or-text"><?= _x( 'Or continue as Guest', 'cart summary', 'voxel' ) ?></span>
			<div class="or-line"></div>
		</div>
	</div>
	<div class="ts-form-group vx-1-1">
		<label><?= esc_attr( _x( 'Email address', 'cart summary', 'voxel' ) ) ?></label>
		<div class="ts-input-icon flexify">
			<?= \Voxel\get_icon_markup( $this->get_settings_for_display('auth_email_ico') ) ?: \Voxel\svg( 'envelope.svg' ) ?>
			<input
				v-model="quick_register.email"
				type="email"
				placeholder="<?= esc_attr( _x( 'Your email address', 'cart summary', 'voxel' ) ) ?>"
				@input="quick_register.sent_code ? quick_register.sent_code = false : ''"
				:readonly="quick_register.sending_code || quick_register.registered"
				@keydown.enter="$refs.sendCode?.click()"
				class="ts-filter"
			>
		</div>
	</div>
	<?php if ( $config['guest_customers']['proceed_with_email']['require_verification'] ): ?>
		<div v-if="!quick_register.sent_code && /^\S+@\S+\.\S+$/.test(quick_register.email)" class="ts-form-group vx-1-1">
			<div :class="{'vx-disabled': quick_register.sending_code}">
				<a href="#" class="ts-btn ts-btn-1 form-btn" ref="sendCode" @click.prevent="sendEmailVerificationCode">
					<?= \Voxel\get_icon_markup( $this->get_settings_for_display('auth_email_ico') ) ?: \Voxel\svg( 'envelope.svg' ) ?>
					<?= _x( 'Send confirmation code', 'cart summary', 'voxel' ) ?>
				</a>
			</div>
		</div>
		<div v-if="quick_register.sent_code" class="ts-form-group vx-1-1">
			<label><?= esc_attr( _x( 'Confirmation code', 'cart summary', 'voxel' ) ) ?></label>
			<input
				ref="emailConfirmCode"
				type="text"
				maxlength="6"
				placeholder="<?= esc_attr( _x( 'Type your 6 digit code', 'cart summary', 'voxel' ) ) ?>"
				v-model="quick_register.code"
				:readonly="quick_register.registered"
				class="ts-filter"
			>
		</div>
	<?php endif ?>
</div>