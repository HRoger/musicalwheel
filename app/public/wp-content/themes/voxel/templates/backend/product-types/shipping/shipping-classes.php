<?php
if ( ! defined('ABSPATH') ) {
	exit;
} ?>
<div class="ts-group">
	<div class="ts-group-head">
		<h3>Shipping classes</h3>
		<div class="vx-info-box">
			<?php \Voxel\svg( 'info.svg' ) ?>
			<p>Shipping classes are globally defined. They are used both for platform and vendor sold products</p>
		</div>
	</div>
	<div class="x-row">
		<div class="x-col-12 field-container ts-drag-animation">
			<template v-if="config.shipping.shipping_classes.length">
				<draggable
					v-model="config.shipping.shipping_classes"
					group="shipping_classes"
					handle=".field-head"
					item-key="key"
				>
					<template #item="{element: shipping_class, index: index}">
						<div class="single-field wide" :class="{open: state.activeShippingClass === shipping_class}">
							<div class="field-head" @click="state.activeShippingClass = state.activeShippingClass === shipping_class ? null : shipping_class">
								<p class="field-name">{{ shipping_class.label || 'Untitled class' }}</p>
								<p class="field-type">
									<span style="display: none;">{{ shipping_class.key }}</span>
								</p>
								<div class="field-actions">
									<span class="field-action all-center">
										<a href="#" @click.prevent="config.shipping.shipping_classes.splice(index, 1)">
											<i class="lar la-trash-alt icon-sm"></i>
										</a>
									</span>
								</div>
							</div>
							<div v-if="state.activeShippingClass === shipping_class" class="field-body">
								<div class="x-row">
									<?php \Voxel\Utils\Form_Models\Text_Model::render( [
										'v-model' => 'shipping_class.label',
										'label' => 'Label',
										'classes' => 'x-col-6',
									] ) ?>

									<?php \Voxel\Utils\Form_Models\Text_Model::render( [
										'v-model' => 'shipping_class.description',
										'label' => 'Description',
										'classes' => 'x-col-6',
									] ) ?>
								</div>
							</div>
						</div>
					</template>
				</draggable>
			</template>
			<div v-else class="ts-form-group">
				<p>You have not added any shipping classes yet.</p>
			</div>

		</div>

		<div class="x-col-12">
			<div class="add-field">
				<div
					class="ts-button ts-outline"
					@click.prevent="addShippingClass()"
				>
					<p class="field-name">Add shipping class</p>
				</div>
			</div>
		</div>

	</div>
</div>


