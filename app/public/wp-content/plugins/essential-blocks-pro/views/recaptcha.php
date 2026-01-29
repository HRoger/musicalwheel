<?php
    $_parent_wrapper_classes = [
        "eb-parent-$blockId",
        $classHook
     ];
    $validationErrorDiv = '<div class="eb-form-validation eb-validate-recaptcha-field">reCAPTCHA isn\'t verified!</div>';

?>
<div class="eb-parent-wrapper<?php esc_attr_e( implode( ' ', $_parent_wrapper_classes ) );?>">
	<?php
        if ( $type === 'v3' ) {
        ?>
			<div
				class="<?php $blockId?> eb-recaptcha-field-wrapper eb-field-wrapper"
				data-type="<?php echo $type ?>"
				data-site-key="<?php echo $siteKey ?>"
			>
				<input type="hidden" name="g-recaptcha-response" value="" class="eb-form-recaptcha" />
				<?php echo $validationErrorDiv; ?>
			</div>
	<?php
        } else if ( $type === 'v2-checkbox' ) {
        ?>
		<div class="<?php $blockId?> eb-recaptcha-field-wrapper eb-field-wrapper">
			<div class="g-recaptcha" data-sitekey="<?php echo $siteKey ?>"></div>
			<?php echo $validationErrorDiv; ?>
		</div>
	<?php
        } else if ( $type === 'v2-invisible' ) {
        ?>
			<!-- <div class="g-recaptcha" data-sitekey="<?php //echo $siteKey ?>" data-size="invisible"></div> -->
			<div class="<?php $blockId?> eb-recaptcha-field-wrapper eb-field-wrapper">
				<div class="g-recaptcha"
					data-sitekey="<?php echo $siteKey ?>"
					data-callback="recaptchaCallback"
					data-size="invisible">
				</div>
			</div>
    <?php
    }?>
</div>
