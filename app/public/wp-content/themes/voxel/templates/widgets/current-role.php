<?php
if ( ! defined('ABSPATH') ) {
	exit;
} ?>
<div class="ts-panel active-plan role-panel">
	<div class="ac-head">
		<?= \Voxel\get_icon_markup( $this->get_settings_for_display('ts_role_ico') ) ?: \Voxel\svg( 'user.svg' ) ?>
		<b>
			<?= _x( 'User role', 'current role', 'voxel' ) ?>
		</b>
	</div>
	<div class="ac-body">
		<?php if ( ! empty( $roles ) ): ?>
			<p><?= \Voxel\replace_vars( _x( 'Your current role is @role_label', 'current role', 'voxel' ), [
					'@role_label' => join( ', ', array_map( function( $role ) {
						return $role->get_label();
					}, $roles ) ),
				] ) ?></p>
		<?php else: ?>
			<p><?= _x( 'You do not have a role assigned currently.', 'current role', 'voxel' ) ?></p>
		<?php endif ?>

		<?php if ( $can_switch && ! empty( $switchable_roles ) ): ?>
			<div class="ac-bottom">
				<ul class="simplify-ul current-plan-btn">
					<?php foreach ( $switchable_roles as $role ):
						$switch_role_url = add_query_arg( [
							'role_key' => $role->get_key(),
							'_wpnonce' => wp_create_nonce( 'vx_switch_role' ),
						], home_url( '/?vx=1&action=roles.switch_role' ) );
						?>
						<li>
							<a vx-action class="ts-btn ts-btn-1" href="<?= esc_url( $switch_role_url ) ?>">
								<?= \Voxel\get_icon_markup( $this->get_settings_for_display('ts_switch_ico') ) ?: \Voxel\svg( 'switch.svg' ) ?>
								<?= \Voxel\replace_vars( _x( 'Switch to @role_label', 'current role', 'voxel' ), [
									'@role_label' => $role->get_label(),
								] ) ?>
							</a>
						</li>
					<?php endforeach ?>
				</ul>
			</div>
		<?php endif ?>
	</div>
</div>

