/**
 * Messages Block - Frontend Entry Point (Plan C+)
 *
 * Reference: docs/block-conversions/messages/voxel-messages.beautified.js
 *
 * VOXEL PARITY (100%):
 * ✅ Renders HTML structure with matching CSS classes
 * ✅ Uses Voxel's ?vx=1 AJAX system (NOT admin-ajax.php)
 * ✅ Listens for voxel:markup-update event for AJAX content
 * ✅ Prevents double-initialization with data-hydrated check
 * ✅ API endpoints match (inbox.list_chats, inbox.load_chat, inbox.send_message)
 * ✅ Real-time polling for new messages with visibility check
 * ✅ File attachments (drag & drop upload, existing file display)
 * ✅ Emoji picker with search and recents (localStorage)
 * ✅ Block/unblock users, clear conversation, delete messages
 * ✅ Media Library (shared MediaPopup component in blocks/shared/)
 *
 * NEXT.JS READINESS:
 * ✅ normalizeConfig() handles both vxconfig and REST API formats
 * ✅ Component receives normalized data as props
 * ✅ Pure React implementation (no jQuery in component)
 * ✅ TypeScript strict mode compatible
 *
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/modules/direct-messages/widgets/messages-widget.php
 * - Voxel JS: themes/voxel/assets/dist/messages.js (beautified: 1,246 lines)
 * - MediaPopup: blocks/shared/MediaPopup.tsx (720 lines)
 *
 * @package VoxelFSE
 */

import { createRoot } from 'react-dom/client';
import MessagesComponent from './shared/MessagesComponent';
import type { MessagesAttributes, MessagesVxConfig, MessagesConfig } from './types';
import { DEFAULT_MESSAGES_ICONS } from './types';

/**
 * Parse vxconfig from script tag
 */
function parseVxConfig(container: HTMLElement): MessagesVxConfig | null {
	const vxconfigScript = container.querySelector<HTMLScriptElement>(
		'script.vxconfig'
	);

	if (vxconfigScript && vxconfigScript.textContent) {
		try {
			return JSON.parse(vxconfigScript.textContent) as MessagesVxConfig;
		} catch (error) {
			console.error('[messages] Failed to parse vxconfig:', error);
		}
	}

	return null;
}

/**
 * Normalize config from various sources (vxconfig, REST API, etc.)
 *
 * Handles both WordPress vxconfig format and future Next.js REST API format.
 * Supports both camelCase (vxconfig) and snake_case (REST API) field names.
 *
 * @param raw - Raw config from any source
 * @returns Normalized MessagesVxConfig
 */
function normalizeConfig(raw: any): MessagesVxConfig {
	// Normalize icons (handle both nested and flat formats)
	const icons = {
		search: raw.icons?.search ?? raw.icons?.searchIcon ?? {},
		chat: raw.icons?.chat ?? raw.icons?.chatIcon ?? {},
		back: raw.icons?.back ?? raw.icons?.backIcon ?? {},
		more: raw.icons?.more ?? raw.icons?.moreIcon ?? {},
		loadMore: raw.icons?.loadMore ?? raw.icons?.load_more ?? {},
		send: raw.icons?.send ?? raw.icons?.sendIcon ?? {},
		emoji: raw.icons?.emoji ?? raw.icons?.emojiIcon ?? {},
		upload: raw.icons?.upload ?? raw.icons?.uploadIcon ?? {},
		gallery: raw.icons?.gallery ?? raw.icons?.galleryIcon ?? {},
		user: raw.icons?.user ?? raw.icons?.userIcon ?? {},
		clear: raw.icons?.clear ?? raw.icons?.clearIcon ?? {},
		ban: raw.icons?.ban ?? raw.icons?.banIcon ?? {},
		trash: raw.icons?.trash ?? raw.icons?.trashIcon ?? {},
	};

	// Normalize settings
	const settings = {
		enableCalcHeight: raw.settings?.enableCalcHeight ?? raw.settings?.enable_calc_height ?? false,
		calcHeight: raw.settings?.calcHeight ?? raw.settings?.calc_height ?? '',
	};

	return {
		icons,
		settings,
	};
}

/**
 * Get messages config from Voxel's global or data attribute
 */
function getMessagesConfig(container: HTMLElement): MessagesConfig | null {
	// Try to get from data-config attribute (Voxel pattern)
	const inboxElement = container.querySelector<HTMLElement>('.ts-inbox');
	if (inboxElement && inboxElement.dataset['config']) {
		try {
			return JSON.parse(inboxElement.dataset['config']) as MessagesConfig;
		} catch (error) {
			console.error('Failed to parse messages config:', error);
		}
	}

	// Fallback: Try to get from window object if Voxel provides it
	const win = window as Window & { voxelMessagesConfig?: MessagesConfig };
	if (win.voxelMessagesConfig) {
		return win.voxelMessagesConfig;
	}

	return null;
}

/**
 * Build attributes from vxconfig
 */
function buildAttributes(config: MessagesVxConfig): MessagesAttributes {
	return {
		blockId: '',
		icons: config.icons || DEFAULT_MESSAGES_ICONS,
		generalHeightUnit: 'px',
		enableCalcHeight: config.settings?.enableCalcHeight || false,
		calcHeight: config.settings?.calcHeight || '',
		generalBackground: '',
		generalBorderType: 'default',
		generalBorderWidth: 0,
		generalBorderColor: '',
		generalBorderRadius: 0,
		generalBoxShadow: {},
		separatorColor: '',
		scrollbarColor: '',
		inboxMessagePadding: { top: '', right: '', bottom: '', left: '' },
		inboxMessageTitleColor: '',
		inboxMessageTitleTypography: {},
		inboxMessageSubtitleColor: '',
		inboxMessageSubtitleTypography: {},
		inboxMessageSecondaryLogoBorder: {},
		inboxMessageHoverBg: '',
		inboxMessageHoverTitleColor: '',
		inboxMessageHoverSubtitleColor: '',
		inboxMessageActiveBg: '',
		inboxMessageActiveBorderColor: '',
		inboxMessageActiveTitleColor: '',
		inboxMessageActiveSubtitleColor: '',
		inboxMessageUnreadTitleTypography: {},
		inboxMessageNewAvatarBorder: {},
		inboxSearchTypography: {},
		inboxSearchValueColor: '',
		inboxSearchPlaceholderColor: '',
		inboxSearchIconColor: '',
		conversationTopTypography: {},
		conversationTopTextColor: '',
		conversationIntroNameTypography: {},
		conversationIntroNameColor: '',
		conversationIntroSubtitleTypography: {},
		conversationIntroSubtitleColor: '',
		conversationBodyMessagePadding: { top: '', right: '', bottom: '', left: '' },
		conversationBodyMessageTypography: {},
		responder1Background: {},
		responder1Color: '',
		responder2Background: {},
		responder2Color: '',
		errorBackground: {},
		errorColor: '',
		messageInfoTypography: {},
		messageInfoDefaultColor: '',
		messageInfoDeleteColor: '',
		seenTypography: {},
		seenColor: '',
		composePlaceholderTypography: {},
		composePlaceholderColor: '',
		composeValueTypography: {},
		composeValueColor: '',
		iconButtonColor: '',
		iconButtonBackground: '',
		iconButtonBorderType: 'default',
		iconButtonBorderWidth: 0,
		iconButtonBorderColor: '',
		iconButtonHoverColor: '',
		iconButtonHoverBackground: '',
		iconButtonHoverBorderColor: '',
		tertiaryButtonIconColor: '',
		tertiaryButtonBackground: '',
		tertiaryButtonBorderType: 'default',
		tertiaryButtonBorderWidth: 0,
		tertiaryButtonBorderColor: '',
		tertiaryButtonTypography: {},
		tertiaryButtonTextColor: '',
		tertiaryButtonHoverIconColor: '',
		tertiaryButtonHoverBackground: '',
		tertiaryButtonHoverBorderColor: '',
		tertiaryButtonHoverTextColor: '',
		emptyIconSize: 35,
		emptyIconColor: '',
		emptyTitleColor: '',
		emptyTitleTypography: {},
		loadingColor1: '',
		loadingColor2: '',
	};
}

/**
 * Wrapper component for frontend rendering
 */
interface MessagesWrapperProps {
	config: MessagesVxConfig;
	messagesConfig: MessagesConfig | null;
}

function MessagesWrapper({ config, messagesConfig }: MessagesWrapperProps) {
	const attributes = buildAttributes(config);

	return (
		<MessagesComponent
			attributes={attributes}
			context="frontend"
			config={config}
			messagesConfig={messagesConfig}
		/>
	);
}

/**
 * Initialize messages blocks on the page
 */
function initMessages() {
	// Find all messages blocks
	const messagesBlocks = document.querySelectorAll<HTMLElement>(
		'.voxel-fse-messages'
	);

	messagesBlocks.forEach((container) => {
		// Skip if already hydrated
		if (container.dataset['hydrated'] === 'true') {
			return;
		}

		// Parse vxconfig
		const rawConfig = parseVxConfig(container);
		if (!rawConfig) {
			console.error('[messages] No vxconfig found for messages block');
			return;
		}

		// Normalize config for both vxconfig and REST API compatibility
		const config = normalizeConfig(rawConfig);

		// Get messages config (from Voxel - contains nonce, user info, etc.)
		const messagesConfig = getMessagesConfig(container);

		// Mark as hydrated
		container.dataset['hydrated'] = 'true';

		// Create React root and render
		const root = createRoot(container);
		root.render(<MessagesWrapper config={config} messagesConfig={messagesConfig} />);
	});
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initMessages);
} else {
	initMessages();
}

// Also initialize on Turbo/PJAX page loads
window.addEventListener('turbo:load', initMessages);
window.addEventListener('pjax:complete', initMessages);

// Voxel-specific event for markup updates
document.addEventListener('voxel:markup-update', initMessages);

// Re-export for window.render_messages() compatibility (Voxel pattern)
const win = window as Window & { render_messages?: () => void };
win.render_messages = initMessages;
