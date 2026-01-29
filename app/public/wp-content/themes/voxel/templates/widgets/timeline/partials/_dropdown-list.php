<?php
if ( ! defined('ABSPATH') ) {
	exit;
} ?>
<script type="text/html" id="vxfeed__dd-list">
	<teleport to="body">
		<transition name="form-popup">
			<form-popup class="xs-width ts-timeline-popup" :target="target" @blur="$emit('blur')"
				:show-close="true" :show-save="false" :show-clear="false">
				<div class="ts-term-dropdown ts-md-group">
					<ul class="simplify-ul ts-term-dropdown-list min-scroll">
						<slot/>
					</ul>
				</div>
			</form-popup>
		</transition>
	</teleport>
</script>