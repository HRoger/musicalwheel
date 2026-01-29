/**
 * Messages Block - TypeScript Types
 *
 * Defines all types for the Messages block, matching Voxel's messages-widget.php
 *
 * @package VoxelFSE
 */

import type { IconValue, TypographyValue, BoxShadowValue, BoxValues } from '../shared/controls';

/**
 * Icon set for the messages widget
 */
export interface MessagesIcons {
	search: IconValue;
	chat: IconValue;
	loadMore: IconValue;
	back: IconValue;
	more: IconValue;
	user: IconValue;
	clear: IconValue;
	ban: IconValue;
	trash: IconValue;
	upload: IconValue;
	gallery: IconValue;
	emoji: IconValue;
	send: IconValue;
}

/**
 * Background value for gradient support
 */
export interface BackgroundValue {
	type?: 'classic' | 'gradient';
	color?: string;
	gradient?: string;
}

/**
 * Border value
 */
export interface BorderValue {
	width?: number;
	style?: string;
	color?: string;
}

/**
 * Main block attributes
 */
export interface MessagesAttributes {
	blockId: string;
	icons: MessagesIcons;

	// General section
	generalHeight?: number;
	generalHeightTablet?: number;
	generalHeightMobile?: number;
	generalHeightUnit: string;
	enableCalcHeight: boolean;
	calcHeight: string;
	generalBackground: string;
	generalBorderType: string;
	generalBorderWidth: number;
	generalBorderColor: string;
	generalBorderRadius: number;
	generalBoxShadow: BoxShadowValue;
	sidebarWidth?: number;
	separatorColor: string;
	scrollbarColor: string;

	// Inbox: Message section
	inboxMessagePadding: BoxValues;
	inboxMessageContentGap?: number;
	inboxMessageTitleColor: string;
	inboxMessageTitleTypography: TypographyValue;
	inboxMessageSubtitleColor: string;
	inboxMessageSubtitleTypography: TypographyValue;
	inboxMessageAvatarSize?: number;
	inboxMessageAvatarRadius?: number;
	inboxMessageAvatarGap?: number;
	inboxMessageSecondaryLogoSize?: number;
	inboxMessageSecondaryLogoRadius?: number;
	inboxMessageSecondaryLogoBorder: BorderValue;

	// Inbox: Message - Hover state
	inboxMessageHoverBg: string;
	inboxMessageHoverTitleColor: string;
	inboxMessageHoverSubtitleColor: string;

	// Inbox: Message - Active state
	inboxMessageActiveBg: string;
	inboxMessageActiveBorderWidth?: number;
	inboxMessageActiveBorderColor: string;
	inboxMessageActiveTitleColor: string;
	inboxMessageActiveSubtitleColor: string;

	// Inbox: Message - Unread state
	inboxMessageUnreadTitleTypography: TypographyValue;

	// Inbox: Message - New state
	inboxMessageNewAvatarBorder: BorderValue;

	// Inbox: Search section
	inboxSearchTypography: TypographyValue;
	inboxSearchValueColor: string;
	inboxSearchPlaceholderColor: string;
	inboxSearchIconColor: string;
	inboxSearchIconSize?: number;

	// Conversation: Top section
	conversationTopAvatarRadius?: number;
	conversationTopAvatarGap?: number;
	conversationTopTypography: TypographyValue;
	conversationTopTextColor: string;

	// Conversation: Intro section
	conversationIntroContentGap?: number;
	conversationIntroAvatarSize?: number;
	conversationIntroAvatarRadius?: number;
	conversationIntroNameTypography: TypographyValue;
	conversationIntroNameColor: string;
	conversationIntroSubtitleTypography: TypographyValue;
	conversationIntroSubtitleColor: string;

	// Conversation: Body section
	conversationBodyMessageGap?: number;
	conversationBodyMessagePadding: BoxValues;
	conversationBodyMessageTypography: TypographyValue;
	conversationBodyMessageRadius?: number;
	responder1Background: BackgroundValue;
	responder1Color: string;
	responder2Background: BackgroundValue;
	responder2Color: string;
	errorBackground: BackgroundValue;
	errorColor: string;
	messageInfoTypography: TypographyValue;
	messageInfoDefaultColor: string;
	messageInfoDeleteColor: string;
	seenTypography: TypographyValue;
	seenColor: string;
	imagesRadius?: number;

	// Conversation: Compose section
	composeAvatarRadius?: number;
	composePlaceholderTypography: TypographyValue;
	composePlaceholderColor: string;
	composeValueTypography: TypographyValue;
	composeValueColor: string;

	// Icon button section
	iconButtonColor: string;
	iconButtonBackground: string;
	iconButtonBorderType: string;
	iconButtonBorderWidth: number;
	iconButtonBorderColor: string;
	iconButtonRadius?: number;
	iconButtonHoverColor: string;
	iconButtonHoverBackground: string;
	iconButtonHoverBorderColor: string;

	// Tertiary button section
	tertiaryButtonIconColor: string;
	tertiaryButtonIconSize?: number;
	tertiaryButtonBackground: string;
	tertiaryButtonBorderType: string;
	tertiaryButtonBorderWidth: number;
	tertiaryButtonBorderColor: string;
	tertiaryButtonRadius?: number;
	tertiaryButtonTypography: TypographyValue;
	tertiaryButtonTextColor: string;
	tertiaryButtonHoverIconColor: string;
	tertiaryButtonHoverBackground: string;
	tertiaryButtonHoverBorderColor: string;
	tertiaryButtonHoverTextColor: string;

	// Empty state section
	emptyIconSize: number;
	emptyIconColor: string;
	emptyTitleColor: string;
	emptyTitleTypography: TypographyValue;

	// Loading section
	loadingColor1: string;
	loadingColor2: string;
}

/**
 * VxConfig for frontend hydration (Plan C+)
 * Contains only data needed for runtime
 */
export interface MessagesVxConfig {
	icons: MessagesIcons;
	settings: {
		enableCalcHeight: boolean;
		calcHeight: string;
	};
}

/**
 * Chat/Conversation structure from Voxel API
 */
export interface VoxelChat {
	id: number;
	key: string;
	target: {
		id: number;
		name: string;
		avatar: string;
		link: string;
		type: 'user' | 'post';
	};
	author: {
		id: number;
		name: string;
		avatar: string;
		link: string;
		type: 'user' | 'post';
	};
	excerpt: string;
	time: string;
	seen: boolean;
	is_new: boolean;
	follow_status: {
		author: number;
		target: number;
	};
	messages: {
		loading: boolean;
		loadingMore: boolean;
		list: VoxelMessage[];
		hasMore: boolean;
	};
	state: {
		content: string;
	};
	processing: boolean;
}

/**
 * Message structure from Voxel API
 */
export interface VoxelMessage {
	id: number;
	content: string;
	has_content: boolean;
	time: string;
	sent_by: 'author' | 'target';
	seen: boolean;
	sending?: boolean;
	tmp?: boolean;
	is_deleted: boolean;
	is_hidden: boolean;
	_editing?: boolean;
	files?: VoxelMessageFile[];
}

/**
 * File attachment in a message
 */
export interface VoxelMessageFile {
	url: string;
	name: string;
	is_image: boolean;
	preview?: string;
	alt?: string;
	width?: number;
	height?: number;
}

/**
 * Emoji structure
 */
export interface VoxelEmoji {
	emoji: string;
	name: string;
}

/**
 * File data for pending uploads
 */
export interface FileData {
	source: 'new_upload' | 'existing';
	name: string;
	type: string;
	size: number;
	preview: string;
	item: File;
	_id: string;
	id?: number;
	url?: string;
}

/**
 * Messages state for the component
 */
export interface MessagesState {
	chats: {
		loading: boolean;
		loadingMore: boolean;
		list: VoxelChat[];
		hasMore: boolean;
	};
	activeChat: VoxelChat | null;
	search: {
		term: string;
		loading: boolean;
		list: VoxelChat[];
	};
	emojis: {
		loading: boolean;
		list: Record<string, VoxelEmoji[]> | null;
		search: {
			term: string;
			list: string[];
		};
		recents: string[];
	};
	files: FileData[];
	dragActive: boolean;
	activePopup: string | null;
}

/**
 * Messages config passed from PHP
 */
export interface MessagesConfig {
	user: {
		id: number;
	};
	polling: {
		enabled: boolean;
		url: string;
		frequency: number;
	};
	seen_badge: {
		enabled: boolean;
	};
	emojis: {
		url: string;
	};
	nonce: string;
	files: {
		enabled: boolean;
		allowed_file_types: string[] | null;
		max_size: number | null;
		max_count: number | null;
	};
	l10n: {
		emoji_groups: Record<string, string>;
	};
	blur_on_send: boolean;
}

/**
 * Default icons for the Messages block
 */
export const DEFAULT_MESSAGES_ICONS: MessagesIcons = {
	search: { library: '', value: '' },
	chat: { library: '', value: '' },
	loadMore: { library: '', value: '' },
	back: { library: '', value: '' },
	more: { library: '', value: '' },
	user: { library: '', value: '' },
	clear: { library: '', value: '' },
	ban: { library: '', value: '' },
	trash: { library: '', value: '' },
	upload: { library: '', value: '' },
	gallery: { library: '', value: '' },
	emoji: { library: '', value: '' },
	send: { library: '', value: '' },
};
