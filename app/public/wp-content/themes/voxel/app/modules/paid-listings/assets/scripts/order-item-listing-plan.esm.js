export default {
	template: `<!--minify-->
		
		<div class="order-event">
			

			<div v-for="limit in data.limits" class="order-event-box">
				<ul class="ts-cart-list simplify-ul">
					<li>
						<div class="cart-image" style="align-self: center;">
							<img width="150" height="150" :src="data.image" class="ts-status-avatar" decoding="async">
						</div>
						<div class="cart-item-details">
							<div class="order-item-title">
								<a>{{ limit.label }}</a>
							</div>
							<span>{{ limit.usage.text }}<template v-if="limit.description"> · {{ limit.description }}</template></span>
						</div>
						
					</li>
				</ul>
				<div v-if="limit.create_links.length && limit.usage.used < limit.usage.total" class="order-event-actions" style="display: grid; gap: 10px; ">
					<a v-for="link in limit.create_links" :href="link.url" class="ts-btn ts-btn-1">
						<span v-html="link.icon"></span>
						{{ data.l10n.create_post.replace('%s', link.label) }}
					</a>
				</div>
				<details v-if="limit.recents.list.length" class="order-accordion">
					<summary>{{ data.l10n.recent_submissions }}<icon-down/></summary>
					<div class="details-body">
						<ul class="ts-cart-list simplify-ul">
						<li v-for="item in limit.recents.list">
							<div class="cart-image" v-if="item.logo">
								<img width="150" height="150" :src="item.logo" class="ts-status-avatar" decoding="async">
							</div>
							<div class="cart-item-details">
									<a :href="item.link">{{ item.title }}</a>
									<span>{{ item.description }}</span>
								</div>
							</li>
							<li v-if="limit.recents.has_more">
								<a href="#" class="ts-btn ts-btn-1" @click.prevent="loadMorePosts(limit)">{{ data.l10n.load_more }}</a>
							</li>
						</ul>
					</div>
				</details>
			</div>
		</div>
	`,
	props: {
		orderItem: Object,
		parent: Object,
		order: Object,
		data: Object,
	},

	methods: {
		loadMorePosts( limit ) {
			jQuery.get( `${Voxel_Config.ajax_url}&action=paid_listings.order.load_more_recents`, {
				order_id: this.order.id,
				order_item_id: this.orderItem.id,
				index: this.data.limits.indexOf( limit ),
				cursor: limit.recents.list.length,
				_wpnonce: this.data._wpnonce,
			} ).always( response => {
				if ( response.success ) {
					limit.recents.list.push( ...response.posts.list );
					limit.recents.has_more = response.posts.has_more;
				} else {
					Voxel.alert( response.message || Voxel_Config.l10n.ajaxError, 'error' );
				}
			} );
		},
	},
};
