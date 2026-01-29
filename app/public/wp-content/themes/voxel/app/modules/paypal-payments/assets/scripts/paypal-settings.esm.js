export default {
	props: {
		provider: Object,
		settings: Object,
		data: Object,
	},

	data() {
		return {
			//
		};
	},

	methods: {
		setupWebhook( e, mode ) {
			const btn = e.target;
			btn?.classList.add('vx-disabled');
			jQuery.post( Voxel_Config.ajax_url, {
				action: 'paypal.admin.setup_webhook',
				mode: mode,
				client_id: this.settings[ mode ].client_id,
				client_secret: this.settings[ mode ].client_secret,
			} ).always( response => {
				btn?.classList.remove('vx-disabled');
				if ( response.success ) {
					if ( response.id ) {
						this.settings[ mode ].webhook.id = response.id;
					}

					Voxel_Backend.alert( response.message );
				} else {
					Voxel_Backend.alert( response.message || Voxel_Config.l10n.ajaxError, 'error' );
				}
			} );
		},
	},
};

