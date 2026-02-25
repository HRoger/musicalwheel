export default {
	template: `<!--minify-->
		<div class="order-event">
			<div v-if="data.status === 'completed'" class="order-event-icon vx-green">
				<icon-checkmark/>
			</div>
			<div v-else-if="data.status === 'canceled'" class="order-event-icon vx-red">
				<icon-info/>
			</div>
			<b v-if="data.status === 'completed'">{{ data.l10n.claim_successful }}</b>
			<b v-else-if="data.status === 'canceled'">{{ data.l10n.claim_declined }}</b>
			
			<div class="further-actions">
				<a :href="data.listing.link" target="_blank" class="ts-btn ts-btn-1">
					{{ data.l10n.view_listing }}
				</a>
				<a :href="data.package.order_link" target="_blank" class="ts-btn ts-btn-1">
					{{ data.l10n.view_plan }}
				</a>
			</div>
		</div>
		<div v-if="data.proof_of_ownership.length" class="order-event">
			<div class="order-event-icon vx-blue">
				<icon-files/>
			</div>
			<span>{{ data.l10n.proof_of_ownership }}</span>
			<ul class="flexify simplify-ul vx-order-files">
				<li v-for="file in data.proof_of_ownership">
					<a :href="file.url" target="_blank" class="ts-order-file">{{ file.name }}</a>
				</li>
			</ul>
		</div>
	`,
	props: {
		orderItem: Object,
		parent: Object,
		order: Object,
		data: Object,
	},
};
