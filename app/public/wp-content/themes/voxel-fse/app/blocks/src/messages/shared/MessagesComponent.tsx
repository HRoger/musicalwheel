/**
 * Messages Block - Shared Component
 *
 * Reference: docs/block-conversions/messages/voxel-messages.beautified.js (1,246 lines)
 *
 * VOXEL PARITY CHECKLIST:
 * ✅ HTML structure matches (.ts-inbox, .inbox-left, .ts-message-body)
 * ✅ CSS classes match exactly
 * ✅ Uses Voxel's ?vx=1 AJAX system (NOT admin-ajax.php)
 * ✅ API endpoints match (inbox.list_chats, inbox.load_chat, etc.)
 * ✅ Chat list with pagination
 * ✅ Basic message sending with optimistic UI
 * ✅ Real-time polling (checkActivity, refreshInbox)
 * ✅ File attachments (drag & drop, media library)
 * ✅ Emoji picker (load, search, insert, recents)
 * ✅ Block/unblock users
 * ✅ Clear conversation
 * ✅ Delete individual messages
 * ✅ URL deep linking (chat=xxx param)
 * ✅ Auto-resize composer textarea
 * ✅ Load more messages with scroll preservation
 *
 * NEXT.JS READINESS:
 * ✅ Pure React implementation (no jQuery)
 * ✅ Props-based component (config via props)
 * ✅ Hooks-based state management
 * ⚠️ AJAX URL needs abstraction for Next.js
 *
 * Evidence:
 * - Voxel template: themes/voxel/app/modules/direct-messages/templates/frontend/messages-widget.php
 * - Voxel JS: themes/voxel/assets/dist/messages.js (beautified: 1,246 lines)
 *
 * @package VoxelFSE
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { __ } from '@wordpress/i18n';
import MediaPopup from '../../../shared/MediaPopup';
import type {
	MessagesAttributes,
	MessagesVxConfig,
	MessagesConfig,
	MessagesState,
	VoxelChat,
	VoxelMessage,
	VoxelMessageFile,
	FileData,
} from '../types';

interface MessagesComponentProps {
	attributes: MessagesAttributes;
	context: 'editor' | 'frontend';
	config?: MessagesVxConfig;
	messagesConfig?: MessagesConfig | null;
}

// FileData interface removed - using the one from types.ts

interface EmojiCategory {
	[key: string]: Array<{ name: string; emoji: string }>;
}

/**
 * Default SVG icons matching Voxel's defaults
 */
const DEFAULT_ICONS = {
	search: `<svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path></svg>`,
	inbox: `<svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"></path><path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"></path></svg>`,
	chevronLeft: `<svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>`,
	menu: `<svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"></path></svg>`,
	reload: `<svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"></path></svg>`,
	send: `<svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>`,
	emoji: `<svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clip-rule="evenodd"></path></svg>`,
	attach: `<svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clip-rule="evenodd"></path></svg>`,
	close: `<svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>`,
	trash: `<svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>`,
	block: `<svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clip-rule="evenodd"></path></svg>`,
	gallery: `<svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path><path d="M6 6.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z"></path></svg>`,
	file: `<svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"></path></svg>`,
};

/**
 * Get icon HTML from attributes or default
 */
function getIcon(iconValue: { library: string; value: string } | undefined, defaultIcon: string): string {
	if (iconValue && iconValue.value) {
		return iconValue.value;
	}
	return defaultIcon;
}

/**
 * Generate random ID for file uploads
 * Reference: voxel-messages.beautified.js line 339
 */
function randomId(length: number = 8): string {
	const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}

/**
 * Debounce helper
 * Reference: voxel-messages.beautified.js line 1172
 */
function debounce<T extends (...args: any[]) => any>(fn: T, delay: number = 300): T {
	let timeoutId: NodeJS.Timeout | null = null;
	return ((...args: any[]) => {
		if (timeoutId) clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn(...args), delay);
	}) as T;
}

/**
 * Get URL search param helper
 */
function getSearchParam(key: string): string | null {
	const params = new URLSearchParams(window.location.search);
	return params.get(key);
}

/**
 * Set URL search param helper
 */
function setSearchParam(key: string, value: string): void {
	const url = new URL(window.location.href);
	url.searchParams.set(key, value);
	window.history.replaceState({}, '', url.toString());
}

/**
 * Delete URL search param helper
 */
function deleteSearchParam(key: string): void {
	const url = new URL(window.location.href);
	url.searchParams.delete(key);
	window.history.replaceState({}, '', url.toString());
}

/**
 * Show Voxel alert notification
 */
function showAlert(message: string, type: 'error' | 'success' = 'error'): void {
	const Voxel = (window as unknown as { Voxel?: { alert?: (msg: string, t: string) => void } }).Voxel;
	if (Voxel?.alert) {
		Voxel.alert(message, type);
	} else {
		console.error(`[messages] ${type}: ${message}`);
	}
}

/**
 * Mock data for editor preview
 */
const MOCK_CHATS: VoxelChat[] = [];

export default function MessagesComponent({
	attributes,
	context,
	config,
	messagesConfig,
}: MessagesComponentProps) {
	// State management
	const [state, setState] = useState<MessagesState>({
		chats: {
			loading: false,
			loadingMore: false,
			list: context === 'editor' ? MOCK_CHATS : [],
			hasMore: false,
			page: 1,
		},
		activeChat: null,
		search: {
			term: '',
			loading: false,
			list: [],
		},
		emojis: {
			loading: false,
			list: null,
			search: { term: '', list: [] },
			recents: [],
		},
		files: [],
		activePopup: null,
		dragActive: false,
	});

	/**
	 * Inject Voxel Messages CSS for both Editor and Frontend
	 */
	useEffect(() => {
		const cssId = 'voxel-messages-css';
		if (!document.getElementById(cssId)) {
			const link = document.createElement('link');
			link.id = cssId;
			link.rel = 'stylesheet';

			// Get site URL from Voxel config or fallback to origin
			const voxelConfig = (window as unknown as { Voxel_Config?: { site_url?: string } }).Voxel_Config;
			// Ensure no trailing slash for consistency
			const siteUrl = (voxelConfig?.site_url || window.location.origin).replace(/\/$/, '');

			link.href = `${siteUrl}/wp-content/themes/voxel/assets/dist/messages.css?ver=1.7.5.2`;
			document.head.appendChild(link);
		}
	}, []);

	// Refs
	const bodyRef = useRef<HTMLDivElement>(null);
	const composerRef = useRef<HTMLTextAreaElement>(null);
	const hiddenComposerRef = useRef<HTMLTextAreaElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const chatActionsRef = useRef<HTMLButtonElement>(null);
	const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	/**
	 * Get Voxel AJAX URL - MUST use ?vx=1 system, NOT admin-ajax.php
	 * Reference: voxel-messages.beautified.js - uses Voxel_Config.ajax_url pattern
	 */
	const getAjaxUrl = useCallback((action: string): string => {
		const voxelConfig = (window as unknown as { Voxel_Config?: { site_url?: string; ajax_url?: string } }).Voxel_Config;
		if (voxelConfig?.ajax_url) {
			return `${voxelConfig.ajax_url}&action=${action}`;
		}
		const siteUrl = voxelConfig?.site_url || window.location.origin;
		return `${siteUrl}/?vx=1&action=${action}`;
	}, []);

	/**
	 * Scroll chat body to bottom
	 * Reference: voxel-messages.beautified.js line 617-619
	 */
	const updateScroll = useCallback(() => {
		if (bodyRef.current) {
			bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
		}
	}, []);

	/**
	 * Auto-resize composer textarea
	 * Reference: voxel-messages.beautified.js line 812-820
	 */
	const resizeComposer = useCallback(() => {
		if (!composerRef.current || !hiddenComposerRef.current) return;

		hiddenComposerRef.current.value = composerRef.current.value;
		hiddenComposerRef.current.style.width = `${composerRef.current.scrollWidth}px`;
		hiddenComposerRef.current.style.minWidth = `${composerRef.current.scrollWidth}px`;
		hiddenComposerRef.current.style.maxWidth = `${composerRef.current.scrollWidth}px`;
		composerRef.current.style.height = `${hiddenComposerRef.current.scrollHeight}px`;
	}, []);

	/**
	 * Load chats from Voxel API
	 * Reference: voxel-messages.beautified.js line 573-606
	 */
	const loadChats = useCallback(async (autoload: boolean = false, page: number = 1) => {
		if (!messagesConfig) return;

		setState((prev) => ({
			...prev,
			chats: { ...prev.chats, loading: page === 1, loadingMore: page > 1 },
		}));

		try {
			const formData = new FormData();
			formData.append('pg', String(page));
			formData.append('_wpnonce', messagesConfig.nonce);

			// Auto-load specific chat from URL
			if (autoload) {
				const chatParam = getSearchParam('chat');
				if (chatParam) {
					formData.append('load', chatParam);
				}
			}

			const response = await fetch(getAjaxUrl('inbox.list_chats'), {
				method: 'POST',
				body: formData,
			});

			const data = await response.json();

			if (data.success) {
				const newChats = data.list || data.data?.chats || [];

				setState((prev) => ({
					...prev,
					chats: {
						loading: false,
						loadingMore: false,
						list: page === 1 ? newChats : [...prev.chats.list, ...newChats],
						hasMore: data.has_more || data.data?.has_more || false,
						page,
					},
				}));

				// Auto-open chat if specified
				if (autoload) {
					const chatToLoad = newChats.find((chat: VoxelChat) => chat.autoload);
					if (chatToLoad) {
						openChat(chatToLoad);
					} else if (data.default_chat) {
						openChat(data.default_chat);
					}
				}
			} else {
				showAlert(data.message || 'Failed to load chats', 'error');
				setState((prev) => ({
					...prev,
					chats: { ...prev.chats, loading: false, loadingMore: false },
				}));
			}
		} catch (error) {
			console.error('[messages] Failed to load chats:', error);
			setState((prev) => ({
				...prev,
				chats: { ...prev.chats, loading: false, loadingMore: false },
			}));
		}
	}, [messagesConfig, getAjaxUrl]);

	/**
	 * Load more chats
	 * Reference: voxel-messages.beautified.js line 609-612
	 */
	const loadMoreChats = useCallback(() => {
		const nextPage = state.chats.page + 1;
		loadChats(false, nextPage);
	}, [state.chats.page, loadChats]);

	/**
	 * Open a chat conversation
	 * Reference: voxel-messages.beautified.js line 624-665
	 */
	const openChat = useCallback(async (chat: VoxelChat) => {
		// Build chat identifier for URL
		const chatParam = [
			chat.author.type === 'post' ? chat.author.id : '',
			chat.target.type === 'post' ? 'p' : 'u',
			chat.target.id,
		].join('');
		setSearchParam('chat', chatParam);

		setState((prev) => ({
			...prev,
			activeChat: {
				...chat,
				messages: { loading: true, loadingMore: false, list: [], hasMore: false },
				state: { content: '' },
				processing: false,
				follow_status: chat.follow_status || { author: 0, target: 0 },
			},
			files: [],
		}));

		if (!messagesConfig) return;

		try {
			const formData = new FormData();
			formData.append('author_type', chat.author.type);
			formData.append('author_id', String(chat.author.id));
			formData.append('target_type', chat.target.type);
			formData.append('target_id', String(chat.target.id));
			formData.append('_wpnonce', messagesConfig.nonce);

			const response = await fetch(getAjaxUrl('inbox.load_chat'), {
				method: 'POST',
				body: formData,
			});

			const data = await response.json();

			if (data.success) {
				setState((prev) => {
					if (!prev.activeChat) return prev;
					return {
						...prev,
						activeChat: {
							...prev.activeChat,
							messages: {
								loading: false,
								loadingMore: false,
								list: data.list || [],
								hasMore: data.has_more || false,
							},
							is_new: false,
							seen: true,
							follow_status: {
								author: data.follow_status?.author ?? prev.activeChat.follow_status?.author ?? 0,
								target: data.follow_status?.target ?? prev.activeChat.follow_status?.target ?? 0,
							},
						},
					};
				});

				// Scroll to bottom and focus composer
				setTimeout(() => {
					updateScroll();
					resizeComposer();
					composerRef.current?.focus();
				}, 50);

				// Handle pre-filled text from URL
				const textParam = getSearchParam('text');
				if (textParam) {
					setState((prev) => {
						if (!prev.activeChat) return prev;
						return {
							...prev,
							activeChat: {
								...prev.activeChat,
								state: { content: textParam },
							},
						};
					});
					deleteSearchParam('text');
				}
			} else {
				showAlert(data.message || 'Failed to load messages', 'error');
			}
		} catch (error) {
			console.error('[messages] Failed to load messages:', error);
		}
	}, [messagesConfig, getAjaxUrl, updateScroll, resizeComposer]);

	/**
	 * Close active chat
	 * Reference: voxel-messages.beautified.js line 662-665
	 */
	const closeActiveChat = useCallback(() => {
		deleteSearchParam('chat');
		setState((prev) => ({
			...prev,
			activeChat: null,
			files: [],
		}));
	}, []);

	/**
	 * Load more messages with scroll preservation
	 * Reference: voxel-messages.beautified.js line 699-711
	 */
	const loadMoreMessages = useCallback(async () => {
		if (!state.activeChat || !messagesConfig || state.activeChat.messages.loadingMore) return;

		const body = bodyRef.current;
		if (!body) return;

		const scrollOffset = body.scrollHeight - body.scrollTop;

		setState((prev) => {
			if (!prev.activeChat) return prev;
			return {
				...prev,
				activeChat: {
					...prev.activeChat,
					messages: { ...prev.activeChat.messages, loadingMore: true },
				},
			};
		});

		try {
			const lastMessage = state.activeChat.messages.list[state.activeChat.messages.list.length - 1];

			const formData = new FormData();
			if (lastMessage) {
				formData.append('cursor', String(lastMessage.id));
			}
			formData.append('author_type', state.activeChat.author.type);
			formData.append('author_id', String(state.activeChat.author.id));
			formData.append('target_type', state.activeChat.target.type);
			formData.append('target_id', String(state.activeChat.target.id));
			formData.append('_wpnonce', messagesConfig.nonce);

			const response = await fetch(getAjaxUrl('inbox.load_chat'), {
				method: 'POST',
				body: formData,
			});

			const data = await response.json();

			if (data.success) {
				setState((prev) => {
					if (!prev.activeChat) return prev;
					return {
						...prev,
						activeChat: {
							...prev.activeChat,
							messages: {
								loading: false,
								loadingMore: false,
								list: [...prev.activeChat.messages.list, ...(data.list || [])],
								hasMore: data.has_more || false,
							},
						},
					};
				});

				// Preserve scroll position
				setTimeout(() => {
					if (body) {
						body.scrollTop = body.scrollHeight - scrollOffset;
					}
				}, 10);
			}
		} catch (error) {
			console.error('[messages] Failed to load more messages:', error);
			setState((prev) => {
				if (!prev.activeChat) return prev;
				return {
					...prev,
					activeChat: {
						...prev.activeChat,
						messages: { ...prev.activeChat.messages, loadingMore: false },
					},
				};
			});
		}
	}, [state.activeChat, messagesConfig, getAjaxUrl]);

	/**
	 * Send a message
	 * Reference: voxel-messages.beautified.js line 716-807
	 */
	const sendMessage = useCallback(async () => {
		if (!state.activeChat || !messagesConfig) return;

		const content = state.activeChat.state.content.trim();
		const hasFiles = state.files.length > 0;

		// Only send if there's content or files
		if (!content && !hasFiles) return;

		// Create temporary message for optimistic UI
		const tempMessage: VoxelMessage = {
			id: Date.now(),
			content: content
				.replace(/(?:\r\n|\r|\n){2,}/g, '</p><p>')
				.replace(/(?:\r\n|\r|\n)/g, '<br>'),
			has_content: content.length > 0,
			time: __('Sending', 'voxel-fse'),
			sent_by: 'author',
			seen: false,
			sending: true,
			tmp: true,
			is_deleted: false,
			is_hidden: false,
		};

		// Add temp message immediately (optimistic UI)
		setState((prev) => {
			if (!prev.activeChat) return prev;
			return {
				...prev,
				activeChat: {
					...prev.activeChat,
					messages: {
						...prev.activeChat.messages,
						list: [tempMessage, ...prev.activeChat.messages.list],
					},
					state: { content: '' },
				},
				files: [],
			};
		});

		// Build form data
		const formData = new FormData();
		const fields: Record<string, unknown> = { content };

		// Add files
		const fileFieldKey = 'files';
		const filesList: Array<string | number> = [];

		state.files.forEach((file) => {
			if (file.source === 'new_upload' && file.item) {
				formData.append(`files[${fileFieldKey}][]`, file.item);
				filesList.push('uploaded_file');
			} else if (file.source === 'existing' && file.id) {
				filesList.push(file.id);
			}
		});

		fields[fileFieldKey] = filesList;
		formData.append('fields', JSON.stringify(fields));
		formData.append('sender_type', state.activeChat.author.type);
		formData.append('sender_id', String(state.activeChat.author.id));
		formData.append('receiver_type', state.activeChat.target.type);
		formData.append('receiver_id', String(state.activeChat.target.id));
		formData.append('_wpnonce', messagesConfig.nonce);

		// Update UI
		setTimeout(() => {
			updateScroll();
			resizeComposer();
			composerRef.current?.focus();
		}, 10);

		try {
			const response = await fetch(getAjaxUrl('inbox.send_message'), {
				method: 'POST',
				body: formData,
			});

			const data = await response.json();

			if (data.success) {
				// Replace temp message with real one
				setState((prev) => {
					if (!prev.activeChat) return prev;

					const newList = prev.activeChat.messages.list.map((m) =>
						m.tmp && m.id === tempMessage.id
							? { ...(data.message || m), tmp: false, sending: false }
							: m
					);

					// Update chat metadata and move to top
					const updatedChat = {
						...prev.activeChat,
						messages: { ...prev.activeChat.messages, list: newList },
						excerpt: data.message?.excerpt || prev.activeChat.excerpt,
						time: data.message?.chat_time || prev.activeChat.time,
					};

					// Move chat to top of list
					const newChatsList = prev.chats.list.filter((c) => c.key !== prev.activeChat?.key);
					newChatsList.unshift(updatedChat);

					return {
						...prev,
						activeChat: updatedChat,
						chats: { ...prev.chats, list: newChatsList },
					};
				});

				// Clear file cache
				delete (window as unknown as { _vx_file_upload_cache?: FileData[] })._vx_file_upload_cache;

				setTimeout(updateScroll, 50);
			} else {
				// Remove temp message on failure
				setState((prev) => {
					if (!prev.activeChat) return prev;
					return {
						...prev,
						activeChat: {
							...prev.activeChat,
							messages: {
								...prev.activeChat.messages,
								list: prev.activeChat.messages.list.filter((m) => m.id !== tempMessage.id),
							},
							state: { content }, // Restore content on validation error
						},
					};
				});

				showAlert(data.message || 'Failed to send message', 'error');
				setTimeout(resizeComposer, 10);
			}
		} catch (error) {
			console.error('[messages] Failed to send message:', error);
			// Remove temp message on error
			setState((prev) => {
				if (!prev.activeChat) return prev;
				return {
					...prev,
					activeChat: {
						...prev.activeChat,
						messages: {
							...prev.activeChat.messages,
							list: prev.activeChat.messages.list.filter((m) => m.id !== tempMessage.id),
						},
						state: { content },
					},
				};
			});
		}
	}, [state.activeChat, state.files, messagesConfig, getAjaxUrl, updateScroll, resizeComposer]);

	/**
	 * Delete a message
	 * Reference: voxel-messages.beautified.js line 1123-1146
	 */
	const deleteMessage = useCallback(async (message: VoxelMessage) => {
		if (!state.activeChat || !messagesConfig) return;
		if (!window.confirm(__('Are you sure?', 'voxel-fse'))) return;

		const formData = new FormData();
		formData.append('deleter_type', state.activeChat.author.type);
		formData.append('deleter_id', String(state.activeChat.author.id));
		formData.append('message_id', String(message.id));
		formData.append('_wpnonce', messagesConfig.nonce);

		// Set processing state
		setState((prev) => {
			if (!prev.activeChat) return prev;
			return {
				...prev,
				activeChat: {
					...prev.activeChat,
					messages: {
						...prev.activeChat.messages,
						list: prev.activeChat.messages.list.map((m) =>
							m.id === message.id ? { ...m, processing: true } : m
						),
					},
				},
			};
		});

		try {
			const response = await fetch(getAjaxUrl('inbox.delete_message'), {
				method: 'POST',
				body: formData,
			});

			const data = await response.json();

			if (data.success) {
				setState((prev) => {
					if (!prev.activeChat) return prev;
					return {
						...prev,
						activeChat: {
							...prev.activeChat,
							messages: {
								...prev.activeChat.messages,
								list: prev.activeChat.messages.list.map((m) =>
									m.id === message.id
										? { ...m, is_deleted: data.is_deleted, is_hidden: data.is_hidden, processing: false }
										: m
								),
							},
						},
					};
				});
			} else {
				showAlert(data.message || 'Failed to delete message', 'error');
				setState((prev) => {
					if (!prev.activeChat) return prev;
					return {
						...prev,
						activeChat: {
							...prev.activeChat,
							messages: {
								...prev.activeChat.messages,
								list: prev.activeChat.messages.list.map((m) =>
									m.id === message.id ? { ...m, processing: false } : m
								),
							},
						},
					};
				});
			}
		} catch (error) {
			console.error('[messages] Failed to delete message:', error);
		}
	}, [state.activeChat, messagesConfig, getAjaxUrl]);

	/**
	 * Block/unblock a chat
	 * Reference: voxel-messages.beautified.js line 958-984
	 */
	const blockChat = useCallback(async () => {
		if (!state.activeChat || !messagesConfig) return;
		if (!window.confirm(__('Are you sure?', 'voxel-fse'))) return;

		const isBlocked = state.activeChat.follow_status?.author === -1;

		const formData = new FormData();
		formData.append('sender_type', state.activeChat.author.type);
		formData.append('sender_id', String(state.activeChat.author.id));
		formData.append('receiver_type', state.activeChat.target.type);
		formData.append('receiver_id', String(state.activeChat.target.id));
		if (isBlocked) {
			formData.append('unblock', 'yes');
		}
		formData.append('_wpnonce', messagesConfig.nonce);

		setState((prev) => {
			if (!prev.activeChat) return prev;
			return {
				...prev,
				activeChat: { ...prev.activeChat, processing: true },
			};
		});

		chatActionsRef.current?.blur();

		try {
			const response = await fetch(getAjaxUrl('inbox.block_chat'), {
				method: 'POST',
				body: formData,
			});

			const data = await response.json();

			if (data.success) {
				setState((prev) => {
					if (!prev.activeChat) return prev;
					return {
						...prev,
						activeChat: {
							...prev.activeChat,
							processing: false,
							follow_status: {
								...prev.activeChat.follow_status,
								author: data.status,
							},
						},
					};
				});
				setTimeout(updateScroll, 50);
			} else {
				showAlert(data.message || 'Failed to update block status', 'error');
				setState((prev) => {
					if (!prev.activeChat) return prev;
					return {
						...prev,
						activeChat: { ...prev.activeChat, processing: false },
					};
				});
			}
		} catch (error) {
			console.error('[messages] Failed to block/unblock:', error);
		}
	}, [state.activeChat, messagesConfig, getAjaxUrl, updateScroll]);

	/**
	 * Check if chat is blocked
	 * Reference: voxel-messages.beautified.js line 986-988
	 */
	const isChatBlocked = useCallback((): boolean => {
		if (!state.activeChat?.follow_status) return false;
		return state.activeChat.follow_status.author === -1 || state.activeChat.follow_status.target === -1;
	}, [state.activeChat]);

	/**
	 * Clear entire conversation
	 * Reference: voxel-messages.beautified.js line 993-1031
	 */
	const clearChat = useCallback(async (closeAfter: boolean = false) => {
		if (!state.activeChat || !messagesConfig) return;
		if (!window.confirm(__('Are you sure?', 'voxel-fse'))) return;

		const formData = new FormData();
		formData.append('sender_type', state.activeChat.author.type);
		formData.append('sender_id', String(state.activeChat.author.id));
		formData.append('receiver_type', state.activeChat.target.type);
		formData.append('receiver_id', String(state.activeChat.target.id));
		formData.append('_wpnonce', messagesConfig.nonce);

		setState((prev) => {
			if (!prev.activeChat) return prev;
			return {
				...prev,
				activeChat: { ...prev.activeChat, processing: true },
			};
		});

		chatActionsRef.current?.blur();

		try {
			const response = await fetch(getAjaxUrl('inbox.clear_conversation'), {
				method: 'POST',
				body: formData,
			});

			const data = await response.json();

			if (data.success) {
				setState((prev) => {
					if (!prev.activeChat) return prev;

					// Remove chat from list
					const newChatsList = prev.chats.list.filter((c) => c.key !== prev.activeChat?.key);

					if (closeAfter) {
						return {
							...prev,
							activeChat: null,
							chats: { ...prev.chats, list: newChatsList },
						};
					}

					return {
						...prev,
						activeChat: {
							...prev.activeChat,
							processing: false,
							messages: { ...prev.activeChat.messages, list: [], hasMore: false },
						},
						chats: { ...prev.chats, list: newChatsList },
					};
				});

				if (closeAfter) {
					deleteSearchParam('chat');
				}
			} else {
				showAlert(data.message || 'Failed to clear conversation', 'error');
				setState((prev) => {
					if (!prev.activeChat) return prev;
					return {
						...prev,
						activeChat: { ...prev.activeChat, processing: false },
					};
				});
			}
		} catch (error) {
			console.error('[messages] Failed to clear conversation:', error);
		}
	}, [state.activeChat, messagesConfig, getAjaxUrl]);

	/**
	 * Check for new activity (polling)
	 * Reference: voxel-messages.beautified.js line 836-856
	 */
	const checkActivity = useCallback(async () => {
		if (!messagesConfig?.polling?.enabled) return;

		// Don't poll if page is hidden
		if (document.visibilityState !== 'visible') {
			pollingTimeoutRef.current = setTimeout(checkActivity, messagesConfig.polling.frequency || 30000);
			return;
		}

		const timestamp = Math.round(Date.now() / 1000);

		try {
			const response = await fetch(
				`${messagesConfig.polling.url}?u=${messagesConfig.user?.id || 0}&v=${timestamp}`
			);
			const text = await response.text();

			if (text === '1') {
				refreshInbox();
			} else {
				pollingTimeoutRef.current = setTimeout(checkActivity, messagesConfig.polling.frequency || 30000);
			}
		} catch (error) {
			console.error('[messages] Polling failed:', error);
			pollingTimeoutRef.current = setTimeout(checkActivity, messagesConfig.polling.frequency || 30000);
		}
	}, [messagesConfig]);

	/**
	 * Patch existing chat with new data
	 * Reference: voxel-messages.beautified.js line 861-906
	 */
	const patchChat = useCallback((existingChat: VoxelChat, newChat: VoxelChat): VoxelChat => {
		const patched = {
			...existingChat,
			excerpt: newChat.excerpt,
			is_new: newChat.is_new,
			seen: newChat.seen,
			time: newChat.time,
		};

		// Merge messages if both have loaded messages
		if (newChat.messages?.list && existingChat.messages?.list) {
			// Update existing message states
			newChat.messages.list.forEach((newMsg) => {
				const existing = existingChat.messages.list.find((m) => m.id === newMsg.id);
				if (existing) {
					existing.seen = newMsg.seen;
					existing.is_deleted = newMsg.is_deleted;
					existing.is_hidden = newMsg.is_hidden;
				}
			});

			// Add new messages
			const lastId = existingChat.messages.list[0]?.id || 0;
			const newMessages = newChat.messages.list.filter((m) => m.id > lastId);

			if (newMessages.length < 15) {
				patched.messages = {
					...existingChat.messages,
					list: [...newMessages, ...existingChat.messages.list],
					hasMore: newChat.messages.hasMore,
				};
			} else {
				patched.messages = newChat.messages;
			}
		}

		patched.last_id = newChat.last_id;
		return patched;
	}, []);

	/**
	 * Refresh inbox (called when polling detects activity)
	 * Reference: voxel-messages.beautified.js line 911-953
	 */
	const refreshInbox = useCallback(async () => {
		if (!messagesConfig) return;

		try {
			const formData = new FormData();
			formData.append('pg', '1');
			formData.append('_wpnonce', messagesConfig.nonce);

			const chatParam = getSearchParam('chat');
			if (chatParam) {
				formData.append('load', chatParam);
			}

			const response = await fetch(getAjaxUrl('inbox.list_chats'), {
				method: 'POST',
				body: formData,
			});

			const data = await response.json();

			if (data.success) {
				setState((prev) => {
					const updatedChats: VoxelChat[] = [];
					const newList = data.list || [];

					newList.forEach((newChat: VoxelChat) => {
						const existingIndex = prev.chats.list.findIndex((c) => c.key === newChat.key);

						if (existingIndex !== -1) {
							const existing = prev.chats.list[existingIndex];
							const patched = patchChat(existing, newChat);
							updatedChats.push(patched);
						} else {
							updatedChats.push(newChat);
						}
					});

					// Remove processed chats and add updated ones at the beginning
					const remainingChats = prev.chats.list.filter(
						(c) => !newList.find((nc: VoxelChat) => nc.key === c.key)
					);

					const result = {
						...prev,
						chats: {
							...prev.chats,
							list: [...updatedChats, ...remainingChats],
						},
					};

					// Update active chat if it was patched
					if (prev.activeChat) {
						const patchedActive = updatedChats.find((c) => c.key === prev.activeChat?.key);
						if (patchedActive) {
							result.activeChat = {
								...prev.activeChat,
								...patchedActive,
								messages: patchedActive.messages || prev.activeChat.messages,
								state: prev.activeChat.state,
							};
						}
					}

					return result;
				});
			}

			// Continue polling
			if (messagesConfig.polling?.enabled) {
				pollingTimeoutRef.current = setTimeout(checkActivity, messagesConfig.polling.frequency || 30000);
			}
		} catch (error) {
			console.error('[messages] Failed to refresh inbox:', error);
			if (messagesConfig.polling?.enabled) {
				pollingTimeoutRef.current = setTimeout(checkActivity, messagesConfig.polling.frequency || 30000);
			}
		}
	}, [messagesConfig, getAjaxUrl, patchChat, checkActivity]);

	/**
	 * Load emojis from JSON file
	 * Reference: voxel-messages.beautified.js line 1040-1059
	 */
	const loadEmojis = useCallback(async () => {
		if (state.emojis.list !== null) return;

		setState((prev) => ({
			...prev,
			emojis: { ...prev.emojis, loading: true },
		}));

		try {
			const emojisUrl = messagesConfig?.emojis?.url || '/wp-content/themes/voxel/assets/emojis.json';
			const response = await fetch(emojisUrl);
			const data = await response.json();

			setState((prev) => ({
				...prev,
				emojis: {
					...prev.emojis,
					loading: false,
					list: data,
				},
			}));
		} catch (error) {
			console.error('[messages] Failed to load emojis:', error);
			setState((prev) => ({
				...prev,
				emojis: { ...prev.emojis, loading: false },
			}));
		}

		// Load recent emojis from localStorage
		const recents = localStorage.getItem('voxel:recent_emojis');
		if (recents) {
			setState((prev) => ({
				...prev,
				emojis: { ...prev.emojis, recents: [...recents] },
			}));
		}
	}, [state.emojis.list, messagesConfig]);

	/**
	 * Insert emoji at cursor position
	 * Reference: voxel-messages.beautified.js line 1064-1094
	 */
	const insertEmoji = useCallback((emoji: string) => {
		if (!composerRef.current || !state.activeChat) return;

		const composer = composerRef.current;
		let content = state.activeChat.state.content;

		if (composer.selectionStart !== null) {
			const startPos = composer.selectionStart;
			const endPos = composer.selectionEnd;
			content = content.substring(0, startPos) + emoji + content.substring(endPos);

			setTimeout(() => {
				composer.setSelectionRange(startPos + emoji.length, startPos + emoji.length);
				composer.focus();
			}, 10);
		} else {
			content += emoji;
		}

		setState((prev) => {
			if (!prev.activeChat) return prev;
			return {
				...prev,
				activeChat: {
					...prev.activeChat,
					state: { content },
				},
			};
		});

		// Save to recent emojis
		let recents: string[] = [];
		const stored = localStorage.getItem('voxel:recent_emojis');
		if (stored) {
			recents = [...stored];
		}
		recents = recents.filter((e) => e !== emoji);
		recents.unshift(emoji);
		const newRecents = recents.slice(0, 16);

		localStorage.setItem('voxel:recent_emojis', newRecents.join(''));
		setState((prev) => ({
			...prev,
			emojis: { ...prev.emojis, recents: newRecents },
		}));
	}, [state.activeChat]);

	/**
	 * Search emojis
	 * Reference: voxel-messages.beautified.js line 1099-1118
	 */
	const searchEmojis = useCallback(() => {
		if (!state.emojis.list || !state.emojis.search.term.trim()) {
			setState((prev) => ({
				...prev,
				emojis: { ...prev.emojis, search: { ...prev.emojis.search, list: [] } },
			}));
			return;
		}

		const results: string[] = [];
		const searchTerm = state.emojis.search.term.trim().toLowerCase();

		Object.values(state.emojis.list as EmojiCategory).some((category) => {
			category.some((emoji: { name: string; emoji: string }) => {
				if (emoji.name.toLowerCase().includes(searchTerm)) {
					results.push(emoji.emoji);
				}
				return results.length >= 80;
			});
			return results.length >= 80;
		});

		setState((prev) => ({
			...prev,
			emojis: { ...prev.emojis, search: { ...prev.emojis.search, list: results } },
		}));
	}, [state.emojis.list, state.emojis.search.term]);

	/**
	 * Handle file selection
	 * Reference: voxel-messages.beautified.js line 326-359
	 */
	const pushFile = useCallback((file: File) => {
		const maxCount = messagesConfig?.files?.max_count || 5;

		const fileData: FileData = {
			source: 'new_upload',
			name: file.name,
			type: file.type,
			size: file.size,
			preview: URL.createObjectURL(file),
			item: file,
			_id: randomId(8),
		};

		// Initialize global cache if needed
		const windowWithCache = window as unknown as { _vx_file_upload_cache?: FileData[] };
		if (!windowWithCache._vx_file_upload_cache) {
			windowWithCache._vx_file_upload_cache = [];
		}

		// Check for duplicate
		const existingFile = windowWithCache._vx_file_upload_cache.find(
			(cached) =>
				cached.item?.name === file.name &&
				cached.item?.type === file.type &&
				cached.item?.size === file.size &&
				cached.item?.lastModified === file.lastModified
		);

		if (existingFile) {
			setState((prev) => {
				if (maxCount === 1) {
					return { ...prev, files: [existingFile] };
				}
				if (prev.files.length >= maxCount) return prev;
				return { ...prev, files: [...prev.files, existingFile] };
			});
		} else {
			windowWithCache._vx_file_upload_cache.unshift(fileData);
			setState((prev) => {
				if (maxCount === 1) {
					return { ...prev, files: [fileData] };
				}
				if (prev.files.length >= maxCount) return prev;
				return { ...prev, files: [...prev.files, fileData] };
			});
		}
	}, [messagesConfig]);

	/**
	 * Handle file input change
	 */
	const handleFileInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (!files) return;

		for (let i = 0; i < files.length; i++) {
			pushFile(files[i]);
		}

		// Reset input
		event.target.value = '';
	}, [pushFile]);

	/**
	 * Handle drag and drop
	 * Reference: voxel-messages.beautified.js line 361-377
	 */
	const handleDrop = useCallback((event: React.DragEvent) => {
		event.preventDefault();
		setState((prev) => ({ ...prev, dragActive: false }));

		if (event.dataTransfer.items) {
			[...event.dataTransfer.items].forEach((item) => {
				if (item.kind === 'file') {
					const file = item.getAsFile();
					if (file) pushFile(file);
				}
			});
		} else {
			[...event.dataTransfer.files].forEach((file) => {
				pushFile(file);
			});
		}
	}, [pushFile]);

	/**
	 * Remove file from list
	 */
	const removeFile = useCallback((fileToRemove: FileData) => {
		setState((prev) => ({
			...prev,
			files: prev.files.filter((f) => f._id !== fileToRemove._id && f.id !== fileToRemove.id),
		}));

		// Revoke object URL to free memory
		if (fileToRemove.source === 'new_upload') {
			URL.revokeObjectURL(fileToRemove.preview);
		}
	}, []);

	/**
	 * Handle MediaPopup save - add selected files from media library
	 * Reference: voxel-messages.beautified.js line 379-399
	 */
	const onMediaPopupSave = useCallback((selectedFiles: FileData[]) => {
		const maxCount = messagesConfig?.files?.max_count || 5;

		// Get existing file IDs to avoid duplicates
		const existingIds: Record<string | number, boolean> = {};
		state.files.forEach((file) => {
			if (file.source === 'existing' && file.id) existingIds[file.id] = true;
			if (file.source === 'new_upload' && file._id) existingIds[file._id] = true;
		});

		// Add selected files that aren't already in the list
		const newFiles: FileData[] = [];
		selectedFiles.forEach((file) => {
			if (file.source === 'existing' && file.id && !existingIds[file.id]) {
				newFiles.push(file);
			}
			if (file.source === 'new_upload' && file._id && !existingIds[file._id]) {
				newFiles.push(file);
			}
		});

		setState((prev) => {
			const combinedFiles = [...prev.files, ...newFiles];
			// Respect max count limit
			return {
				...prev,
				files: combinedFiles.slice(0, maxCount),
			};
		});
	}, [messagesConfig, state.files]);

	/**
	 * Handle search input with debounce
	 * Reference: voxel-messages.beautified.js line 1172-1184
	 */
	const debouncedServerSearch = useMemo(
		() =>
			debounce(async (term: string, nonce: string) => {
				try {
					const formData = new FormData();
					formData.append('search', term);
					formData.append('_wpnonce', nonce);

					const response = await fetch(getAjaxUrl('inbox.search_chats'), {
						method: 'POST',
						body: formData,
					});

					const data = await response.json();

					if (data.success) {
						setState((prev) => ({
							...prev,
							search: {
								...prev.search,
								loading: false,
								list: data.list || [],
							},
						}));
					}
				} catch (error) {
					console.error('[messages] Failed to search chats:', error);
					setState((prev) => ({
						...prev,
						search: { ...prev.search, loading: false },
					}));
				}
			}, 300),
		[getAjaxUrl]
	);

	/**
	 * Handle search input
	 * Reference: voxel-messages.beautified.js line 1151-1206
	 */
	const handleSearch = useCallback(
		(term: string) => {
			setState((prev) => ({
				...prev,
				search: { ...prev.search, term, loading: term.trim().length > 0 },
			}));

			if (!term.trim() || !messagesConfig) {
				setState((prev) => ({
					...prev,
					search: { term, loading: false, list: [] },
				}));
				return;
			}

			// Client-side search for short queries or when all chats are loaded
			if (!state.chats.hasMore || term.trim().length <= 2) {
				const results = state.chats.list.filter((chat) =>
					chat.target.name.toLowerCase().includes(term.trim().toLowerCase())
				).slice(0, 10);

				setState((prev) => ({
					...prev,
					search: { term, loading: false, list: results },
				}));
			} else {
				// Server-side search for longer queries
				debouncedServerSearch(term.trim(), messagesConfig.nonce);
			}
		},
		[messagesConfig, state.chats.hasMore, state.chats.list, debouncedServerSearch]
	);

	/**
	 * Handle composer key press (Enter to send)
	 */
	const handleComposerKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
			// Ignore IME composition
			if (e.nativeEvent.isComposing || e.keyCode === 229) return;
			if (e.shiftKey) return;

			if (e.key === 'Enter') {
				e.preventDefault();
				sendMessage();
			}
		},
		[sendMessage]
	);

	/**
	 * Update composer content
	 */
	const updateComposerContent = useCallback((content: string) => {
		setState((prev) => ({
			...prev,
			activeChat: prev.activeChat
				? {
					...prev.activeChat,
					state: { ...prev.activeChat.state, content },
				}
				: null,
		}));
		setTimeout(resizeComposer, 10);
	}, [resizeComposer]);

	/**
	 * Toggle emoji popup
	 */
	const toggleEmojiPopup = useCallback(() => {
		setState((prev) => ({
			...prev,
			activePopup: prev.activePopup === 'emoji' ? null : 'emoji',
		}));
		if (state.activePopup !== 'emoji') {
			loadEmojis();
		}
	}, [state.activePopup, loadEmojis]);

	/**
	 * Toggle actions popup
	 */
	const toggleActionsPopup = useCallback(() => {
		setState((prev) => ({
			...prev,
			activePopup: prev.activePopup === 'actions' ? null : 'actions',
		}));
	}, []);

	// Initialize chats on frontend
	useEffect(() => {
		if (context === 'frontend' && messagesConfig) {
			loadChats(true);

			// Start polling
			if (messagesConfig.polling?.enabled) {
				pollingTimeoutRef.current = setTimeout(checkActivity, messagesConfig.polling.frequency || 30000);
			}

			// Load emojis in background
			setTimeout(loadEmojis, 100);
		}

		// Cleanup polling on unmount
		return () => {
			if (pollingTimeoutRef.current) {
				clearTimeout(pollingTimeoutRef.current);
			}
		};
	}, [context, messagesConfig, loadChats, checkActivity, loadEmojis]);

	// Search emojis when search term changes
	useEffect(() => {
		if (state.emojis.search.term.trim() && state.emojis.list) {
			searchEmojis();
		}
	}, [state.emojis.search.term, state.emojis.list, searchEmojis]);

	// Re-render vxconfig for DevTools visibility (Plan C+ pattern)
	const vxConfigData = config
		? JSON.stringify(config)
		: JSON.stringify({
			icons: attributes.icons,
			settings: {
				enableCalcHeight: attributes.enableCalcHeight,
				calcHeight: attributes.calcHeight,
			},
		});

	return (
		<>
			{/* Hidden textarea for auto-resize calculation */}
			<textarea
				ref={hiddenComposerRef}
				style={{
					position: 'absolute',
					visibility: 'hidden',
					height: 'auto',
					overflow: 'hidden',
				}}
				aria-hidden="true"
				tabIndex={-1}
			/>

			{/* Hidden file input */}
			<input
				ref={fileInputRef}
				type="file"
				multiple
				accept={messagesConfig?.files?.allowed_file_types?.join(',') || '*'}
				style={{ display: 'none' }}
				onChange={handleFileInputChange}
			/>

			{/* Re-render vxconfig for DevTools visibility */}
			<script
				type="text/json"
				className="vxconfig"
				dangerouslySetInnerHTML={{ __html: vxConfigData }}
			/>

			{/* Main inbox container - matches Voxel HTML 1:1 */}
			<div
				className={`ts-inbox ${state.dragActive ? 'drag-active' : ''}`}
				onDragOver={(e) => {
					e.preventDefault();
					setState((prev) => ({ ...prev, dragActive: true }));
				}}
				onDragLeave={() => setState((prev) => ({ ...prev, dragActive: false }))}
				onDrop={handleDrop}
			>
				{/* Left sidebar - chat list */}
				<div className={`inbox-left ${!state.activeChat ? 'ts-no-chat' : ''}`}>
					{state.chats.loading ? (
						<div className="ts-empty-user-tab">
							<span className="ts-loader"></span>
						</div>
					) : !state.chats.list.length ? (
						<div className="ts-empty-user-tab">
							<span
								dangerouslySetInnerHTML={{
									__html: getIcon(attributes.icons.chat, DEFAULT_ICONS.inbox),
								}}
							/>
							<p>{__('No chats available', 'voxel-fse')}</p>
						</div>
					) : (
						<>
							{/* Search input */}
							<div className="ts-form ts-inbox-top">
								<div className="ts-input-icon flexify">
									<span
										dangerouslySetInnerHTML={{
											__html: getIcon(attributes.icons.search, DEFAULT_ICONS.search),
										}}
									/>
									<input
										type="text"
										value={state.search.term}
										onChange={(e) => handleSearch(e.target.value)}
										placeholder={__('Search inbox', 'voxel-fse')}
										className="autofocus"
									/>
								</div>
							</div>

							{/* Chat list */}
							<ul
								className={`ts-convo-list simplify-ul min-scroll ${state.search.loading ? 'vx-disabled' : ''
									}`}
							>
								{(state.search.term.trim() ? state.search.list : state.chats.list).map(
									(chat) => (
										<li
											key={chat.key || chat.id}
											className={`
												${chat.is_new ? 'ts-new-message' : ''}
												${!chat.seen ? 'ts-unread-message' : ''}
												${state.activeChat?.id === chat.id ? 'ts-active-chat' : ''}
											`}
										>
											<a
												href="#"
												onClick={(e) => {
													e.preventDefault();
													openChat(chat);
												}}
											>
												{chat.target.avatar && (
													<div className="convo-avatars">
														<div
															className="convo-avatar"
															dangerouslySetInnerHTML={{ __html: chat.target.avatar }}
														/>
														{chat.author.type === 'post' && (
															<div
																className="post-avatar"
																dangerouslySetInnerHTML={{ __html: chat.author.avatar }}
															/>
														)}
													</div>
												)}
												<div className="message-details">
													<b>{chat.target.name}</b>
													<span>{chat.excerpt}</span>
													<span>{chat.time}</span>
												</div>
											</a>
										</li>
									)
								)}

								{/* Load more button */}
								{state.chats.hasMore && !state.search.term.trim() && (
									<div className="ts-btn-group">
										<div className="n-load-more">
											<a
												href="#"
												onClick={(e) => {
													e.preventDefault();
													loadMoreChats();
												}}
												className={`ts-btn ts-btn-4 ${state.chats.loadingMore ? 'vx-pending' : ''
													}`}
											>
												<span
													dangerouslySetInnerHTML={{
														__html: getIcon(attributes.icons.loadMore, DEFAULT_ICONS.reload),
													}}
												/>
												{__('Load more', 'voxel-fse')}
											</a>
										</div>
									</div>
								)}
							</ul>
						</>
					)}
				</div>

				{/* Right side - message body */}
				<div
					className={`ts-message-body ${state.activeChat?.processing ? 'vx-disabled' : ''
						} ${!state.activeChat ? 'ts-no-chat' : ''}`}
				>
					{state.activeChat ? (
						<>
							{/* Conversation header */}
							<div className="ts-inbox-top add-spacing flexify">
								<div className="convo-head">
									<div className="ts-convo-name flexify">
										<a className="convo-pic" href={state.activeChat.target.link}>
											<span
												dangerouslySetInnerHTML={{
													__html: state.activeChat.target.avatar,
												}}
											/>
										</a>
										<a className="convo-name" href={state.activeChat.target.link}>
											<span>{state.activeChat.target.name}</span>
										</a>
									</div>
									<ul className="flexify simplify-ul inbox-top-btns">
										<li className="flexify">
											<a
												href="#"
												onClick={(e) => {
													e.preventDefault();
													closeActiveChat();
												}}
												className="ts-icon-btn"
											>
												<span
													dangerouslySetInnerHTML={{
														__html: getIcon(attributes.icons.back, DEFAULT_ICONS.chevronLeft),
													}}
												/>
											</a>
										</li>
										<li className="flexify ts-popup-target">
											<button
												ref={chatActionsRef}
												onClick={toggleActionsPopup}
												className="ts-icon-btn"
											>
												<span
													dangerouslySetInnerHTML={{
														__html: getIcon(attributes.icons.more, DEFAULT_ICONS.menu),
													}}
												/>
											</button>

											{/* Actions popup */}
											{state.activePopup === 'actions' && (
												<div className="ts-popup-content ts-popup-visible">
													<ul className="simplify-ul ts-popup-list">
														<li>
															<a
																href="#"
																onClick={(e) => {
																	e.preventDefault();
																	blockChat();
																	setState((prev) => ({ ...prev, activePopup: null }));
																}}
															>
																<span
																	dangerouslySetInnerHTML={{
																		__html: getIcon(attributes.icons.ban, DEFAULT_ICONS.block),
																	}}
																/>
																{isChatBlocked()
																	? __('Unblock user', 'voxel-fse')
																	: __('Block user', 'voxel-fse')}
															</a>
														</li>
														<li>
															<a
																href="#"
																onClick={(e) => {
																	e.preventDefault();
																	clearChat(true);
																	setState((prev) => ({ ...prev, activePopup: null }));
																}}
															>
																<span
																	dangerouslySetInnerHTML={{
																		__html: getIcon(attributes.icons.clear, DEFAULT_ICONS.trash),
																	}}
																/>
																{__('Clear conversation', 'voxel-fse')}
															</a>
														</li>
													</ul>
												</div>
											)}
										</li>
									</ul>
								</div>
							</div>

							{/* Blocked chat notice */}
							{isChatBlocked() && (
								<div className="ts-chat-blocked-notice">
									<p>{__('This conversation is blocked.', 'voxel-fse')}</p>
								</div>
							)}

							{/* Messages list */}
							{state.activeChat.messages.loading ? (
								<div className="start-convo">
									<span className="ts-loader"></span>
								</div>
							) : !state.activeChat.messages.list.length ? (
								<div className="start-convo">
									<a href={state.activeChat.target.link}>
										<span
											dangerouslySetInnerHTML={{
												__html: state.activeChat.target.avatar,
											}}
										/>
									</a>
									<span>{__('Start a conversation with', 'voxel-fse')}</span>
									<a href={state.activeChat.target.link}>
										<h4>{state.activeChat.target.name}</h4>
									</a>
								</div>
							) : (
								<div
									className="ts-conversation-body min-scroll"
									ref={bodyRef}
								>
									{/* Load more messages button */}
									{state.activeChat.messages.hasMore && (
										<div className="load-more-messages">
											<a
												href="#"
												onClick={(e) => {
													e.preventDefault();
													loadMoreMessages();
												}}
												className={`ts-btn ts-btn-4 ${state.activeChat.messages.loadingMore ? 'vx-pending' : ''
													}`}
											>
												{state.activeChat.messages.loadingMore
													? __('Loading...', 'voxel-fse')
													: __('Load older messages', 'voxel-fse')}
											</a>
										</div>
									)}

									<ul className="ts-message-list simplify-ul">
										{[...state.activeChat.messages.list].reverse().map((message) => (
											<li
												key={message.id}
												className={`
													ts-single-message
													ts-responder-${message.sent_by === 'author' ? 2 : 1}
													ts-message-id-${message.id}
													${message.sent_by === 'author' && message.seen ? 'ts-message-seen' : ''}
													${message.tmp ? 'inserted-message' : ''}
													${message.is_deleted ? 'ts-message-deleted' : ''}
													${message.is_hidden ? 'ts-message-hidden' : ''}
													${(message as VoxelMessage & { processing?: boolean }).processing ? 'vx-disabled' : ''}
												`}
											>
												{message.is_deleted ? (
													<>
														<p className="vx-disabled">{__('Deleted', 'voxel-fse')}</p>
														<ul className="flexify simplify-ul ms-info">
															<li>{message.time}</li>
														</ul>
													</>
												) : message.is_hidden ? (
													<>
														<p className="vx-disabled">{__('Hidden', 'voxel-fse')}</p>
														<ul className="flexify simplify-ul ms-info">
															<li>{message.time}</li>
														</ul>
													</>
												) : (
													<>
														{/* File attachments - rendered BEFORE content (matches Voxel order) */}
														{/* Reference: messages-widget.php lines 181-198 */}
														{message.files && message.files.length > 0 && (
															<>
																{message.files.map((file: VoxelMessageFile, fileIndex: number) => (
																	file.is_image ? (
																		<a
																			key={`${message.id}-file-${fileIndex}`}
																			href={file.url}
																			target="_blank"
																			rel="noopener noreferrer"
																			className="ts-image-attachment"
																		>
																			<img
																				src={file.preview || file.url}
																				alt={file.alt || file.name}
																				width={file.width}
																				height={file.height}
																				loading="lazy"
																			/>
																		</a>
																	) : (
																		<p key={`${message.id}-file-${fileIndex}`}>
																			<a
																				href={file.url}
																				target="_blank"
																				rel="noopener noreferrer"
																			>
																				{file.name}
																			</a>
																		</p>
																	)
																))}
															</>
														)}
														{/* Message content - rendered AFTER files */}
														{message.has_content && (
															<p dangerouslySetInnerHTML={{ __html: message.content }} />
														)}
														<ul className="flexify simplify-ul ms-info">
															{message.sent_by === 'author' && !message.tmp && (
																<>
																	<li className="message-actions">
																		<a
																			href="#"
																			onClick={(e) => {
																				e.preventDefault();
																				deleteMessage(message);
																			}}
																		>
																			{__('Delete', 'voxel-fse')}
																		</a>
																	</li>
																	<li className="message-actions">&middot;</li>
																</>
															)}
															<li>
																{message.sending
																	? __('Sending', 'voxel-fse')
																	: message.time}
															</li>
														</ul>
														{message.sent_by === 'author' &&
															message.seen &&
															messagesConfig?.seen_badge?.enabled && (
																<div className="seen-badge">{__('Seen', 'voxel-fse')}</div>
															)}
													</>
												)}
											</li>
										))}
									</ul>
								</div>
							)}

							{/* File attachments preview */}
							{state.files.length > 0 && (
								<div className="ts-file-attachments">
									{state.files.map((file) => (
										<div key={file._id || file.id} className="ts-file-preview">
											{file.type.startsWith('image/') ? (
												<img src={file.preview} alt={file.name} />
											) : (
												<span>{file.name}</span>
											)}
											<button
												className="ts-remove-file"
												onClick={() => removeFile(file)}
											>
												<span
													dangerouslySetInnerHTML={{
														__html: getIcon(attributes.icons.trash, DEFAULT_ICONS.close),
													}}
												/>
											</button>
										</div>
									))}
								</div>
							)}

							{/* Compose area */}
							{!isChatBlocked() && (
								<div className="ts-inbox-bottom">
									<div className="flexify ts-convo-form">
										<span
											className="active-avatar"
											dangerouslySetInnerHTML={{ __html: state.activeChat.author.avatar }}
										/>

										{/* Emoji button */}
										<div className="ts-popup-target">
											<button
												onClick={toggleEmojiPopup}
												className="ts-icon-btn ts-emoji-btn"
											>
												<span
													dangerouslySetInnerHTML={{
														__html: getIcon(attributes.icons.emoji, DEFAULT_ICONS.emoji),
													}}
												/>
											</button>

											{/* Emoji popup */}
											{state.activePopup === 'emoji' && (
												<div className="ts-popup-content ts-emoji-popup ts-popup-visible">
													<div className="ts-form">
														<input
															type="text"
															placeholder={__('Search emojis', 'voxel-fse')}
															value={state.emojis.search.term}
															onChange={(e) =>
																setState((prev) => ({
																	...prev,
																	emojis: {
																		...prev.emojis,
																		search: { ...prev.emojis.search, term: e.target.value },
																	},
																}))
															}
														/>
													</div>
													{state.emojis.loading ? (
														<div className="ts-loader"></div>
													) : (
														<div className="ts-emoji-list">
															{/* Recent emojis */}
															{state.emojis.recents.length > 0 &&
																!state.emojis.search.term.trim() && (
																	<div className="ts-emoji-category">
																		<span>{__('Recent', 'voxel-fse')}</span>
																		<div className="ts-emoji-grid">
																			{state.emojis.recents.map((emoji, i) => (
																				<button
																					key={`recent-${i}`}
																					onClick={() => insertEmoji(emoji)}
																				>
																					{emoji}
																				</button>
																			))}
																		</div>
																	</div>
																)}

															{/* Search results */}
															{state.emojis.search.term.trim() ? (
																<div className="ts-emoji-grid">
																	{state.emojis.search.list.map((emoji, i) => (
																		<button
																			key={`search-${i}`}
																			onClick={() => insertEmoji(emoji)}
																		>
																			{emoji}
																		</button>
																	))}
																</div>
															) : (
																/* Emoji categories */
																state.emojis.list &&
																Object.entries(state.emojis.list as EmojiCategory).map(
																	([category, emojis]) => (
																		<div key={category} className="ts-emoji-category">
																			<span>{category}</span>
																			<div className="ts-emoji-grid">
																				{emojis.map((emoji: { emoji: string }, i: number) => (
																					<button
																						key={`${category}-${i}`}
																						onClick={() => insertEmoji(emoji.emoji)}
																					>
																						{emoji.emoji}
																					</button>
																				))}
																			</div>
																		</div>
																	)
																)
															)}
														</div>
													)}
												</div>
											)}
										</div>

										{/* Attach file button (upload new files) */}
										<button
											onClick={() => fileInputRef.current?.click()}
											className="ts-icon-btn ts-attach-btn"
											title={__('Upload file', 'voxel-fse')}
										>
											<span
												dangerouslySetInnerHTML={{
													__html: getIcon(attributes.icons.upload, DEFAULT_ICONS.attach),
												}}
											/>
										</button>

										{/* Media library button (select existing files) */}
										<MediaPopup
											multiple={true}
											saveLabel={__('Add files', 'voxel-fse')}
											onSave={(files) => {
												// Convert MediaPopup files to FileData format
												const fileDataList: FileData[] = files.map((file) => ({
													source: (file.source || 'existing') as 'existing' | 'new_upload',
													id: file.id,
													_id: file.id ? String(file.id) : undefined,
													name: file.name,
													type: file.type || '',
													size: 0,
													preview: file.preview || '',
												}));
												onMediaPopupSave(fileDataList);
											}}
										>
											<button
												className="ts-icon-btn ts-gallery-btn"
												title={__('Media library', 'voxel-fse')}
											>
												<span
													dangerouslySetInnerHTML={{
														__html: getIcon(attributes.icons.gallery, DEFAULT_ICONS.gallery),
													}}
												/>
											</button>
										</MediaPopup>

										<div className="compose-message min-scroll">
											<textarea
												ref={composerRef}
												value={state.activeChat.state.content}
												onKeyDown={handleComposerKeyDown}
												onChange={(e) => updateComposerContent(e.target.value)}
											/>
											{!state.activeChat.state.content && (
												<span className="compose-placeholder">
													{state.activeChat.author.type === 'post'
														? __('Reply as', 'voxel-fse') + ' ' + state.activeChat.author.name
														: __('Your message', 'voxel-fse')}
												</span>
											)}
										</div>
										<a
											href="#"
											onClick={(e) => {
												e.preventDefault();
												sendMessage();
											}}
											className="ts-icon-btn"
										>
											<span
												dangerouslySetInnerHTML={{
													__html: getIcon(attributes.icons.send, DEFAULT_ICONS.send),
												}}
											/>
										</a>
									</div>
								</div>
							)}
						</>
					) : (
						<div className="ts-empty-user-tab">
							{state.chats.loading ? (
								<span className="ts-loader"></span>
							) : (
								<>
									<span
										dangerouslySetInnerHTML={{
											__html: getIcon(attributes.icons.chat, DEFAULT_ICONS.inbox),
										}}
									/>
									<p>{__('No conversation selected', 'voxel-fse')}</p>
								</>
							)}
						</div>
					)}
				</div>
			</div>
		</>
	);
}
