/**
 * StatusComposer Component
 *
 * Rich text composer for creating timeline status posts.
 * Matches Voxel's timeline composer HTML structure EXACTLY for CSS compatibility.
 *
 * Voxel HTML Structure (from status-composer.php):
 * <div class="vxf-create-post flexify" :class="{'vxf-expanded': isExpanded}">
 *   <div class="vxf-avatar flexify"><img :src="avatarUrl"></div>
 *   <div class="vxf-create-post__content">
 *     <div class="vxf-content__highlighter"></div>
 *     <textarea class="vxf-content__textarea"></textarea>
 *   </div>
 *   <div class="vxf-footer-wrapper"> <!-- Only when expanded -->
 *     <file-upload></file-upload>
 *     <div class="vxf-footer flexify">
 *       <div class="vxf-actions flexify">
 *         <a class="vxf-icon vxf-media-target"><icon-gallery/></a>
 *         <a class="vxf-icon"><icon-upload/></a>
 *         <emoji-picker></emoji-picker>
 *       </div>
 *       <div class="vxf-buttons flexify">
 *         <a class="ts-btn ts-btn-1">Cancel</a>
 *         <a class="ts-btn ts-btn-2">Publish</a>
 *       </div>
 *     </div>
 *   </div>
 * </div>
 *
 * @package VoxelFSE
 */

import { useState, useCallback, useRef, useEffect, useMemo, type ChangeEvent, type FormEvent, type KeyboardEvent } from 'react';
import { useTimelineContext, usePermissions, useStrings, useFileUpload } from '../hooks';
import { publishStatus, editStatus, getLinkPreview, type LinkPreviewResponse } from '../api';
import { countCharacters, getMentionTrigger, insertMention } from '../utils';
import type { Status, StatusCreatePayload, StatusEditPayload, MediaFile, ReviewConfig } from '../types';
import EmojiPicker from './EmojiPicker';
import { ReviewScore } from './ReviewScore';
import { MentionsAutocomplete } from './MentionsAutocomplete';
import type { MentionResult } from '../api';
import MediaPopup from '../../../shared/MediaPopup';

/**
 * Props
 */
interface StatusComposerProps {
	feed?: string;
	postId?: number;
	placeholder?: string;
	onStatusCreated?: (status: Status) => void;
	className?: string;
	// Edit mode props
	status?: Status; // If provided, composer is in edit mode
	onCancel?: () => void;
	onUpdate?: (status: Status) => void;
}

/**
 * Icon components matching Voxel's SVG icons EXACTLY
 * Source: themes/voxel/templates/widgets/timeline-kit.php
 */
const GalleryIcon = () => (
	<svg width="80" height="80" viewBox="0 0 25 24" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
		<path d="M8.25016 10.5C7.5598 10.5 7.00016 11.0596 7.00016 11.75C7.00016 12.4404 7.5598 13 8.25016 13H8.26016C8.95051 13 9.51016 12.4404 9.51016 11.75C9.51016 11.0596 8.95051 10.5 8.26016 10.5H8.25016Z" fill="currentColor"></path>
		<path fillRule="evenodd" clipRule="evenodd" d="M7.75016 5.5C7.75016 4.25736 8.75751 3.25 10.0002 3.25H19.0002C20.2428 3.25 21.2502 4.25736 21.2502 5.5V14.5C21.2502 15.7426 20.2428 16.75 19.0002 16.75H17.2502V18.5C17.2502 19.7426 16.2428 20.75 15.0002 20.75H6.00016C4.75751 20.75 3.75016 19.7426 3.75016 18.5V17.6916C3.74995 17.6814 3.74995 17.6712 3.75016 17.6611V9.5C3.75016 8.25736 4.75751 7.25 6.00016 7.25H7.75016V5.5ZM15.7502 9.5V15.9558L13.4851 13.8525C12.789 13.206 11.7619 13.0665 10.9186 13.5037L5.25016 16.4421L5.25016 9.5C5.25016 9.08579 5.58594 8.75 6.00016 8.75H15.0002C15.4144 8.75 15.7502 9.08579 15.7502 9.5ZM5.25016 18.5V18.1317L11.6089 14.8354C11.89 14.6896 12.2324 14.7362 12.4644 14.9516L15.7502 18.0028V18.5C15.7502 18.9142 15.4144 19.25 15.0002 19.25H6.00016C5.58594 19.25 5.25016 18.9142 5.25016 18.5ZM9.25016 7.25H15.0002C16.2428 7.25 17.2502 8.25736 17.2502 9.5V15.25H19.0002C19.4144 15.25 19.7502 14.9142 19.7502 14.5V5.5C19.7502 5.08579 19.4144 4.75 19.0002 4.75H10.0002C9.58594 4.75 9.25016 5.08579 9.25016 5.5V7.25Z" fill="currentColor"></path>
	</svg>
);

const UploadIcon = () => (
	<svg viewBox="0 0 25 24" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
		<path d="M6.80747 9.56843C6.80747 6.46718 9.32153 3.95312 12.4228 3.95312C15.524 3.95312 18.0381 6.46718 18.0381 9.56843V9.87773H18.098C20.9007 9.87773 23.1727 12.1498 23.1727 14.9524C23.1727 17.7551 20.9007 20.0272 18.098 20.0272H14.2524C14.5162 19.6585 14.6715 19.2069 14.6715 18.719V18.5272H18.098C20.0723 18.5272 21.6727 16.9267 21.6727 14.9524C21.6727 12.9782 20.0723 11.3777 18.098 11.3777H17.2881C16.8739 11.3777 16.5381 11.0419 16.5381 10.6277V9.56843C16.5381 7.29561 14.6956 5.45312 12.4228 5.45312C10.15 5.45312 8.30747 7.29561 8.30747 9.56843L8.30747 10.6277C8.30747 11.0419 7.97169 11.3777 7.55747 11.3777H6.74659C4.77233 11.3777 3.17188 12.9782 3.17188 14.9524C3.17188 16.9267 4.77233 18.5272 6.74659 18.5272H10.1715V18.719C10.1715 19.2069 10.3268 19.6585 10.5906 20.0272H6.74659C3.94391 20.0272 1.67188 17.7551 1.67188 14.9524C1.67188 12.1498 3.9439 9.87773 6.74659 9.87773H6.80747V9.56843Z" fill="currentColor"></path>
		<path d="M12.4246 11.0874C12.2107 11.0874 12.0178 11.1768 11.8812 11.3204L9.24138 13.9585C8.94839 14.2513 8.94824 14.7262 9.24104 15.0192C9.53384 15.3122 10.0087 15.3123 10.3017 15.0195L11.6746 13.6475V18.718C11.6746 19.1322 12.0104 19.468 12.4246 19.468C12.8388 19.468 13.1746 19.1322 13.1746 18.718V13.6499L14.5452 15.0196C14.8382 15.3124 15.3131 15.3122 15.6059 15.0192C15.8987 14.7262 15.8985 14.2513 15.6055 13.9585L12.9916 11.3465C12.8541 11.1878 12.6511 11.0874 12.4246 11.0874Z" fill="currentColor"></path>
	</svg>
);

const EmojiIcon = () => (
	<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
		<path d="M12 2C6.49 2 2 6.49 2 12C2 17.51 6.49 22 12 22C17.51 22 22 17.51 22 12C22 6.49 17.51 2 12 2ZM12 20.5C7.31 20.5 3.5 16.69 3.5 12C3.5 7.31 7.31 3.5 12 3.5C16.69 3.5 20.5 7.31 20.5 12C20.5 16.69 16.69 20.5 12 20.5Z" fill="currentColor"></path>
		<path d="M17.6 13.19C17.37 13.04 17.07 13.02 16.83 13.15C16.81 13.16 14.56 14.35 12 14.35C9.44 14.35 7.19 13.16 7.17 13.15C6.93 13.02 6.63 13.03 6.4 13.19C6.17 13.34 6.04 13.61 6.07 13.89C6.3 16.26 8.46 18.78 12 18.78C15.54 18.78 17.69 16.26 17.93 13.89C17.96 13.61 17.83 13.35 17.6 13.19ZM12 17.27C10.07 17.27 8.7 16.31 8.02 15.13C9.04 15.48 10.45 15.85 12 15.85C13.55 15.85 14.96 15.49 15.98 15.13C15.3 16.31 13.93 17.27 12 17.27Z" fill="currentColor"></path>
		<path d="M7.33 10.14C7.36 10.22 7.4 10.29 7.44 10.36C7.49 10.43 7.54 10.49 7.6 10.55C7.65 10.61 7.72 10.66 7.79 10.7C7.85 10.75 7.93 10.79 8 10.82C8.08 10.85 8.16 10.87 8.24 10.89C8.32 10.91 8.4 10.92 8.48 10.92C8.56 10.92 8.64 10.92 8.72 10.89C8.8 10.86 8.88 10.85 8.96 10.82C9.03 10.79 9.11 10.75 9.17 10.7C9.24 10.66 9.31 10.61 9.36 10.55C9.6 10.32 9.73 9.99 9.73 9.67C9.73 9.35 9.6 9.01 9.36 8.78C9.31 8.72 9.24 8.67 9.17 8.63C9.11 8.58 9.03 8.54 8.96 8.51C8.88 8.48 8.8 8.46 8.72 8.44C8.56 8.41 8.4 8.41 8.24 8.44C8.16 8.46 8.08 8.48 8 8.51C7.93 8.54 7.85 8.58 7.79 8.63C7.72 8.67 7.65 8.72 7.6 8.78C7.36 9.01 7.23 9.33 7.23 9.67C7.23 9.75 7.23 9.83 7.26 9.91C7.27 9.99 7.29 10.07 7.33 10.14Z" fill="currentColor"></path>
		<path d="M12.99 11.02C13.38 11.16 13.8 10.95 13.94 10.56C13.97 10.48 14.25 9.76 14.97 9.76C15.69 9.76 15.97 10.48 16 10.55C16.1 10.86 16.4 11.06 16.71 11.06C16.79 11.06 16.87 11.05 16.95 11.02C17.34 10.89 17.55 10.46 17.42 10.07C17.19 9.4 16.42 8.25 14.97 8.25C13.52 8.25 12.75 9.39 12.52 10.07C12.39 10.46 12.6 10.88 12.99 11.01V11.02Z" fill="currentColor"></path>
	</svg>
);

/**
 * Trash icon for file removal - matches Voxel exactly
 */
const TrashIcon = () => (
	<svg width="80" height="80" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
		<path d="M10 9.75C10.4142 9.75 10.75 10.0858 10.75 10.5V16.5C10.75 16.9142 10.4142 17.25 10 17.25C9.58579 17.25 9.25 16.9142 9.25 16.5V10.5C9.25 10.0858 9.58579 9.75 10 9.75Z" fill="currentColor"></path>
		<path d="M14.75 10.5C14.75 10.0858 14.4142 9.75 14 9.75C13.5858 9.75 13.25 10.0858 13.25 10.5V16.5C13.25 16.9142 13.5858 17.25 14 17.25C14.4142 17.25 14.75 16.9142 14.75 16.5V10.5Z" fill="currentColor"></path>
		<path fillRule="evenodd" clipRule="evenodd" d="M7.99951 4.25C7.99951 3.00736 9.00687 2 10.2495 2H13.7495C14.9922 2 15.9995 3.00736 15.9995 4.25V5H19.999C20.4132 5 20.749 5.33579 20.749 5.75C20.749 6.16421 20.4132 6.5 19.999 6.5H19.5V19.75C19.5 20.9926 18.4926 22 17.25 22H6.75C5.50736 22 4.5 20.9926 4.5 19.75V6.5H4C3.58579 6.5 3.25 6.16421 3.25 5.75C3.25 5.33579 3.58579 5 4 5H7.99951V4.25ZM18 6.5H6V19.75C6 20.1642 6.33579 20.5 6.75 20.5H17.25C17.6642 20.5 18 20.1642 18 19.75V6.5ZM9.49951 5H14.4995V4.25C14.4995 3.83579 14.1637 3.5 13.7495 3.5H10.2495C9.8353 3.5 9.49951 3.83579 9.49951 4.25V5Z" fill="currentColor"></path>
	</svg>
);

/**
 * File upload icon for file info - matches Voxel exactly
 */
const FileUploadIcon = () => (
	<svg viewBox="0 0 25 24" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
		<path d="M6.80747 9.56843C6.80747 6.46718 9.32153 3.95312 12.4228 3.95312C15.524 3.95312 18.0381 6.46718 18.0381 9.56843V9.87773H18.098C20.9007 9.87773 23.1727 12.1498 23.1727 14.9524C23.1727 17.7551 20.9007 20.0272 18.098 20.0272H14.2524C14.5162 19.6585 14.6715 19.2069 14.6715 18.719V18.5272H18.098C20.0723 18.5272 21.6727 16.9267 21.6727 14.9524C21.6727 12.9782 20.0723 11.3777 18.098 11.3777H17.2881C16.8739 11.3777 16.5381 11.0419 16.5381 10.6277V9.56843C16.5381 7.29561 14.6956 5.45312 12.4228 5.45312C10.15 5.45312 8.30747 7.29561 8.30747 9.56843L8.30747 10.6277C8.30747 11.0419 7.97169 11.3777 7.55747 11.3777H6.74659C4.77233 11.3777 3.17188 12.9782 3.17188 14.9524C3.17188 16.9267 4.77233 18.5272 6.74659 18.5272H10.1715V18.719C10.1715 19.2069 10.3268 19.6585 10.5906 20.0272H6.74659C3.94391 20.0272 1.67188 17.7551 1.67188 14.9524C1.67188 12.1498 3.9439 9.87773 6.74659 9.87773H6.80747V9.56843Z" fill="currentColor"></path>
		<path d="M12.4246 11.0874C12.2107 11.0874 12.0178 11.1768 11.8812 11.3204L9.24138 13.9585C8.94839 14.2513 8.94824 14.7262 9.24104 15.0192C9.53384 15.3122 10.0087 15.3123 10.3017 15.0195L11.6746 13.6475V18.718C11.6746 19.1322 12.0104 19.468 12.4246 19.468C12.8388 19.468 13.1746 19.1322 13.1746 18.718V13.6499L14.5452 15.0196C14.8382 15.3124 15.3131 15.3122 15.6059 15.0192C15.8987 14.7262 15.8985 14.2513 15.6055 13.9585L12.9916 11.3465C12.8541 11.1878 12.6511 11.0874 12.4246 11.0874Z" fill="currentColor"></path>
	</svg>
);

/**
 * StatusComposer Component
 * Matches Voxel's vxf-create-post structure exactly
 *
 * Supports both create and edit modes:
 * - Create mode: Default behavior, publishes new status
 * - Edit mode: When `status` prop is provided, edits existing status
 */
export function StatusComposer({
	feed = 'user_timeline',
	postId,
	placeholder,
	onStatusCreated,
	className = '',
	// Edit mode props
	status,
	onCancel,
	onUpdate,
}: StatusComposerProps): JSX.Element | null {
	const { config } = useTimelineContext();
	const permissions = usePermissions();
	const strings = useStrings();

	// Determine if we're in edit mode
	const isEditMode = !!status;

	// IMPORTANT: Permission checks must happen AFTER all hooks are called to comply with Rules of Hooks.
	// We compute these values here but check them after all hooks.
	const hasEditPermission = isEditMode ? status?.current_user.can_edit : true;
	const hasPostPermission = !isEditMode ? permissions.can_post : true;

	// Expanded state (shows footer when focused, always expanded in edit mode)
	const [isExpanded, setIsExpanded] = useState(isEditMode);

	// Content state - initialize from status if editing
	const [content, setContent] = useState(status?.content ?? '');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Existing files from status (for edit mode)
	const [existingFiles, setExistingFiles] = useState<MediaFile[]>(status?.files ?? []);

	// Rating state for reviews (matches Voxel's data.rating)
	// See: timeline-composer.beautified.js line 295
	const [rating, setRating] = useState<Record<string, number>>(status?.review?.rating ?? {});

	// Emoji picker state
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);

	// Mentions autocomplete state (matches Voxel's mentions object)
	const [mentionQuery, setMentionQuery] = useState('');
	const [mentionActive, setMentionActive] = useState(false);
	const [mentionStyle, setMentionStyle] = useState<React.CSSProperties>({});

	// Media popup state
	const [showMediaPopup, setShowMediaPopup] = useState(false);

	// Link preview state (for client-side detection while typing)
	// Matches Voxel's timeline-main.beautified.js lines 696-720
	const [linkPreview, setLinkPreview] = useState<{
		url: string | null;
		loading: boolean;
		data: LinkPreviewResponse | null;
	}>({ url: null, loading: false, data: null });
	const linkPreviewAbortRef = useRef<AbortController | null>(null);

	// File upload
	const {
		uploads,
		completedFiles,
		isUploading,
		addFiles,
		removeFile,
		clearAll: clearUploads,
		uploadAll,
	} = useFileUpload({
		maxFiles: config?.upload_config.max_files ?? 5,
		maxFileSize: config?.upload_config.max_file_size ?? 2 * 1024 * 1024,
		allowedTypes: config?.upload_config.allowed_types ?? ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
	});

	// Initialize content and expand when entering edit mode
	useEffect(() => {
		if (isEditMode && status) {
			setContent(status.content);
			setExistingFiles(status.files ?? []);
			setRating(status.review?.rating ?? {});
			setIsExpanded(true);
		}
	}, [isEditMode, status]);

	// URL regex for link detection (matches Voxel's pattern)
	const urlRegex = useMemo(() => /(https?:\/\/[^\s]+)/g, []);

	/**
	 * Debounced link preview detection while typing
	 * Matches Voxel's detectLink method (500ms debounce)
	 * See voxel-timeline-main.beautified.js lines 696-720
	 */
	useEffect(() => {
		// Skip in edit mode - link preview is already attached to status
		if (isEditMode) return;

		// Debounce detection
		const timeoutId = setTimeout(() => {
			const matches = content.match(urlRegex);

			if (matches && matches[0] !== linkPreview.url) {
				// New URL detected - fetch preview
				const newUrl = matches[0];
				setLinkPreview((prev) => ({ ...prev, url: newUrl, loading: true }));

				// Abort any previous request
				linkPreviewAbortRef.current?.abort();
				const controller = new AbortController();
				linkPreviewAbortRef.current = controller;

				const nonce = config?.nonces?.status_publish ?? '';
				getLinkPreview(newUrl, nonce, controller.signal)
					.then((preview) => {
						if (!controller.signal.aborted) {
							setLinkPreview({ url: newUrl, loading: false, data: preview });
						}
					})
					.catch(() => {
						if (!controller.signal.aborted) {
							setLinkPreview({ url: newUrl, loading: false, data: null });
						}
					});
			} else if (!matches && linkPreview.url) {
				// No URL in content - clear preview
				setLinkPreview({ url: null, loading: false, data: null });
			}
		}, 500); // 500ms debounce like Voxel

		return () => {
			clearTimeout(timeoutId);
		};
	}, [content, urlRegex, linkPreview.url, isEditMode, config?.nonces?.status_publish]);

	// Cleanup abort controller on unmount
	useEffect(() => {
		return () => {
			linkPreviewAbortRef.current?.abort();
		};
	}, []);

	// Refs
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const emojiButtonRef = useRef<HTMLAnchorElement>(null);
	const wrapperRef = useRef<HTMLDivElement>(null);

	// Character count
	const charCount = countCharacters(content);
	const maxChars = config?.character_limits.status_max ?? 5000;
	const isOverLimit = charCount > maxChars;

	// Can submit check
	// In edit mode, user must have edit permission on the status
	// In create mode, user must have post permission
	const hasPermission = isEditMode ? status?.current_user.can_edit : permissions.can_post;
	const hasContent = content.trim().length > 0 || existingFiles.length > 0 || completedFiles.length > 0;
	const canSubmit =
		hasPermission &&
		hasContent &&
		!isOverLimit &&
		!isSubmitting &&
		!isUploading;

	/**
	 * Handle focus - expand composer
	 */
	const handleFocus = useCallback(() => {
		setIsExpanded(true);
	}, []);

	/**
	 * Handle content change + detect @mention trigger
	 */
	const handleContentChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
		const newContent = e.target.value;
		setContent(newContent);
		setError(null);

		// Auto-resize textarea
		const textarea = e.target;
		textarea.style.height = 'auto';
		textarea.style.height = `${textarea.scrollHeight}px`;

		// Detect @mention trigger (matches Voxel's mention detection)
		const trigger = getMentionTrigger(newContent, textarea.selectionStart);
		if (trigger?.active) {
			setMentionQuery(trigger.query);
			setMentionActive(true);

			// Position the dropdown below the textarea
			const rect = textarea.getBoundingClientRect();
			setMentionStyle({
				position: 'fixed',
				top: rect.bottom + 4,
				left: rect.left,
				width: rect.width,
			});
		} else {
			setMentionActive(false);
			setMentionQuery('');
		}
	}, []);

	/**
	 * Handle mention selection from autocomplete
	 */
	const handleMentionSelect = useCallback((mention: MentionResult) => {
		const textarea = textareaRef.current;
		if (!textarea) return;

		const result = insertMention(content, textarea.selectionStart, {
			name: mention.username ?? mention.name,
			id: mention.id,
			type: mention.type,
		});

		setContent(result.content);
		setMentionActive(false);
		setMentionQuery('');

		// Restore cursor position
		requestAnimationFrame(() => {
			textarea.focus();
			textarea.setSelectionRange(result.cursorPosition, result.cursorPosition);
		});
	}, [content]);

	/**
	 * Handle file selection
	 */
	const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (files && files.length > 0) {
			addFiles(files);
		}
		e.target.value = '';
	}, [addFiles]);

	/**
	 * Handle cancel - collapse and reset (or call onCancel in edit mode)
	 */
	const handleCancel = useCallback((e: React.MouseEvent) => {
		e.preventDefault();

		// In edit mode, just call onCancel callback
		if (isEditMode && onCancel) {
			onCancel();
			return;
		}

		// In create mode, reset the form
		setContent('');
		clearUploads();
		setExistingFiles([]);
		setIsExpanded(false);
		setError(null);

		// Reset textarea height
		if (textareaRef.current) {
			textareaRef.current.style.height = 'auto';
			textareaRef.current.blur();
		}
	}, [isEditMode, onCancel, clearUploads]);

	/**
	 * Handle form submission - create or update based on mode
	 */
	const handleSubmit = useCallback(async (e?: React.MouseEvent | FormEvent) => {
		e?.preventDefault();

		if (!canSubmit) return;

		setIsSubmitting(true);
		setError(null);

		try {
			// Upload any pending files first
			let newFileIds: number[] = [];
			if (uploads.some(u => u.status === 'pending')) {
				const uploadedFiles = await uploadAll();
				newFileIds = uploadedFiles.map(f => f.id);
			} else {
				newFileIds = completedFiles.map(f => f.id);
			}

			// Combine existing files with newly uploaded files
			const existingFileIds = existingFiles.map(f => f.id);
			const allFileIds = [...existingFileIds, ...newFileIds];

			if (isEditMode && status) {
				// Edit mode - update existing status
				const nonce = config?.nonces?.status_edit ?? '';
				const payload: StatusEditPayload = {
					status_id: status.id,
					content: content.trim(),
					files: allFileIds,
					rating: rating, // Use current rating state (user can edit review scores)
				};

				const updatedStatus = await editStatus(payload, nonce);

				// Notify parent
				onUpdate?.(updatedStatus);
			} else {
				// Create mode - publish new status
				const publishNonce = config?.nonces?.status_publish ?? '';
				if (!publishNonce) {
					throw new Error('Configuration not loaded');
				}

				const payload: StatusCreatePayload = {
					feed,
					content: content.trim(),
					files: allFileIds,
					rating: Object.keys(rating).length > 0 ? rating : undefined, // Include rating if set
				};

				if (postId) {
					payload.post_id = postId;
				}

				// Add link preview URL if detected (matches Voxel's submit method)
				if (linkPreview.data && linkPreview.url) {
					payload.link_preview = linkPreview.url;
				}

				const newStatus = await publishStatus(payload, publishNonce);

				// Success - clear form and collapse (matches Voxel's timeline-main.beautified.js lines 680-686)
				setContent('');
				clearUploads();
				setExistingFiles([]);
				setRating({}); // Reset rating on success
				setLinkPreview({ url: null, loading: false, data: null });
				setIsExpanded(false);

				// Reset textarea height
				if (textareaRef.current) {
					textareaRef.current.style.height = 'auto';
				}

				// Notify parent
				onStatusCreated?.(newStatus);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : strings.error_generic);
		} finally {
			setIsSubmitting(false);
		}
	}, [canSubmit, content, feed, postId, uploads, completedFiles, existingFiles, uploadAll, clearUploads, isEditMode, status, config?.nonces?.status_edit, config?.nonces?.status_publish, onStatusCreated, onUpdate, strings.error_generic, linkPreview, rating]);

	/**
	 * Handle keyboard shortcuts
	 */
	const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
		// Cmd/Ctrl + Enter to submit
		if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
			e.preventDefault();
			handleSubmit();
		}
	}, [handleSubmit]);

	/**
	 * Open file picker
	 */
	const openFilePicker = useCallback((e: React.MouseEvent) => {
		e.preventDefault();
		fileInputRef.current?.click();
	}, []);

	/**
	 * Insert emoji at cursor position
	 * Matches Voxel's insertText method
	 */
	const insertEmoji = useCallback((emoji: string) => {
		const textarea = textareaRef.current;
		if (!textarea) return;

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const newContent = content.substring(0, start) + emoji + content.substring(end);

		setContent(newContent);

		// Restore cursor position after emoji
		requestAnimationFrame(() => {
			textarea.focus();
			textarea.setSelectionRange(start + emoji.length, start + emoji.length);
		});
	}, [content]);

	/**
	 * Toggle emoji picker
	 */
	const toggleEmojiPicker = useCallback((e: React.MouseEvent) => {
		e.preventDefault();
		setShowEmojiPicker((prev) => !prev);
	}, []);

	/**
	 * Remove existing file (for edit mode)
	 */
	const removeExistingFile = useCallback((fileId: number) => {
		setExistingFiles(prev => prev.filter(f => f.id !== fileId));
	}, []);

	/**
	 * Compute review config for this composer
	 * Matches Voxel's reviewConfig computed property (timeline-composer.beautified.js lines 461-471)
	 * - If editing a review status, use the status's review post type
	 * - If creating in post_reviews feed, use the configured reviews_post_type
	 * - Otherwise, no review config (no rating UI)
	 *
	 * IMPORTANT: This useMemo MUST be placed BEFORE any early returns to comply with React Rules of Hooks.
	 */
	const reviewConfig = useMemo((): ReviewConfig | null => {
		// Not for quote posts
		// if (quoteOf) return null; // Uncomment if quoteOf support added

		// Check if we should show review score
		const isReviewFeed = feed === 'post_reviews';
		const isEditingReview = isEditMode && status?.feed === 'post_reviews' && status?.review;

		if (!isReviewFeed && !isEditingReview) {
			return null;
		}

		// Get reviews config from timeline config
		const reviewsConfig = config?.review_config;
		if (!reviewsConfig) return null;

		// Determine post type to use for review config
		let postType: string | undefined;
		if (isEditingReview && status?.review?.post_type) {
			postType = status.review.post_type;
		} else {
			// Use the current post's type for new reviews
			postType = config?.current_post?.post_type;
		}

		if (!postType || !reviewsConfig[postType]) {
			return null;
		}

		return reviewsConfig[postType];
	}, [feed, isEditMode, status, config?.review_config, config?.current_post]);

	// Build placeholder text - matches Voxel format
	// MUST be before early returns to comply with React Rules of Hooks
	const currentUser = config?.current_user;
	const placeholderText = useMemo(() => {
		const defaultText = strings.compose_placeholder ?? "What's on your mind?";
		let text = placeholder ?? defaultText;
		if (text === "What's on your mind?" && currentUser?.display_name) {
			text = `What's on your mind, ${currentUser.display_name}?`;
		}
		return text;
	}, [placeholder, strings.compose_placeholder, currentUser?.display_name]);

	// Don't render if user can't post (in create mode) or can't edit (in edit mode)
	// This check is placed AFTER all hooks to comply with React Rules of Hooks.
	if (isEditMode && !hasEditPermission) {
		return null;
	}
	if (!isEditMode && !hasPostPermission) {
		return null;
	}

	// Don't render if current user is not loaded yet (prevents undefined avatar_url errors in editor)
	if (!currentUser) {
		return null;
	}

	const avatarUrl = currentUser.avatar_url ?? '';
	const displayName = currentUser.display_name ?? '';

	return (
		<div style={{ minHeight: '61px' }}>
			{/* Matches Voxel's vxf-create-post structure exactly */}
			<div
				ref={wrapperRef}
				className={`vxf-create-post flexify ${isExpanded ? 'vxf-expanded' : ''} ${className}`}
			>
				{/* Avatar */}
				{currentUser && (
					<div className="vxf-avatar flexify">
						<img src={avatarUrl} alt={displayName} />
					</div>
				)}

				{/* Content area */}
				<div className="vxf-create-post__content">
					<div className="vxf-content__highlighter"></div>
					<textarea
						ref={textareaRef}
						className="vxf-content__textarea"
						value={content}
						onChange={handleContentChange}
						onFocus={handleFocus}
						onKeyDown={handleKeyDown}
						placeholder={placeholderText}
						maxLength={maxChars}
						disabled={isSubmitting}
					/>
				</div>

				{/* Footer wrapper - only shown when expanded (matches Voxel's transition-height) */}
				{isExpanded && (
					<div className="vxf-footer-wrapper" style={{ height: 'auto' }}>
						{/* Review score input - shown for post_reviews feed (matches Voxel's review-score component) */}
						{reviewConfig && (
							<div className="vxf-review-score-section">
								<ReviewScore
									config={reviewConfig}
									value={rating}
									onChange={setRating}
								/>
							</div>
						)}

						{/* File upload previews - matches Voxel's ts-file-upload structure exactly */}
						{(uploads.length > 0 || completedFiles.length > 0 || existingFiles.length > 0) && (
							<div className="ts-form-group ts-file-upload vxf-create-section">
								<div className="ts-file-list">
									{/* Existing files (from status being edited) */}
									{existingFiles.map((file) => {
										const isImage = file.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
										return (
											<div
												key={`existing-${file.id}`}
												className={`ts-file ${isImage ? 'ts-file-img' : ''}`}
												style={isImage ? { backgroundImage: `url(${file.preview || file.url})` } : {}}
											>
												<div className="ts-file-info">
													<FileUploadIcon />
													<code>{file.alt || 'File'}</code>
												</div>
												<a
													href="#"
													className="ts-remove-file flexify"
													onClick={(e) => {
														e.preventDefault();
														removeExistingFile(file.id);
													}}
												>
													<TrashIcon />
												</a>
											</div>
										);
									})}
									{/* New uploads */}
									{uploads.map((upload) => {
										const isImage = upload.file.type.startsWith('image/');
										const previewUrl = isImage ? URL.createObjectURL(upload.file) : '';
										return (
											<div
												key={upload.id}
												className={`ts-file ${isImage ? 'ts-file-img' : ''}`}
												style={isImage ? { backgroundImage: `url(${previewUrl})` } : {}}
											>
												<div className="ts-file-info">
													<FileUploadIcon />
													<code>{upload.file.name}</code>
												</div>
												<a
													href="#"
													className="ts-remove-file flexify"
													onClick={(e) => {
														e.preventDefault();
														removeFile(upload.id);
													}}
												>
													<TrashIcon />
												</a>
												{upload.status === 'uploading' && (
													<div
														className="vxf-file-progress"
														style={{ width: `${upload.progress}%` }}
													/>
												)}
											</div>
										);
									})}
								</div>
							</div>
						)}

						{/* Footer with actions and buttons */}
						<div className="vxf-footer flexify">
							{/* Actions - upload/emoji buttons */}
							<div className="vxf-actions flexify">
								{permissions.can_upload && config?.features.file_upload && (
									<>
										{/* Gallery button - opens media library popup */}
										<MediaPopup
											multiple={true}
											saveLabel="Insert"
											target={wrapperRef.current}
											onSave={(files) => {
												// Convert media library files (from MediaPopup) to StatusMedia format (for StatusComposer)
												// MediaPopup returns its own MediaFile format which differs slightly from types.MediaFile
												const mappedFiles: MediaFile[] = files.map(f => ({
													id: f.id,
													url: f.preview || '', // Use preview as URL for existing files
													preview: f.preview || '',
													alt: f.name
												}));

												setExistingFiles(prev => {
													// Avoid duplicates by ID
													const existingIds = new Set(prev.map(p => p.id));
													const uniqueNew = mappedFiles.filter(f => !existingIds.has(f.id));
													return [...prev, ...uniqueNew];
												});

												console.log('[StatusComposer] Media added:', mappedFiles);
											}}
										>
											<a
												href="#"
												onClick={(e) => e.preventDefault()}
												className="vxf-icon vxf-media-target"
											>
												<GalleryIcon />
											</a>
										</MediaPopup>
										{/* Upload button - opens file picker */}
										<a href="#" onClick={openFilePicker} className="vxf-icon">
											<UploadIcon />
										</a>
									</>
								)}
								<a href="#" ref={emojiButtonRef} className="vxf-icon vxf-emoji-picker" onClick={toggleEmojiPicker}>
									<EmojiIcon />
								</a>
								<EmojiPicker
									isOpen={showEmojiPicker}
									onClose={() => setShowEmojiPicker(false)}
									onSelect={insertEmoji}
									target={emojiButtonRef.current}
									widthElement={wrapperRef.current}
								/>
							</div>

							{/* Buttons - Cancel and Publish/Update */}
							<div className="vxf-buttons flexify">
								<a href="#" onClick={handleCancel} className="ts-btn ts-btn-1">
									{strings.cancel ?? 'Cancel'}
								</a>
								<a
									href="#"
									onClick={handleSubmit}
									className={`ts-btn ts-btn-2 ${isSubmitting ? 'vx-pending' : ''}`}
								>
									{isSubmitting ? (
										<div className="ts-loader-wrapper">
											<span className="ts-loader"></span>
										</div>
									) : isEditMode ? (
										strings.update ?? 'Update'
									) : (
										strings.compose_submit ?? 'Publish'
									)}
								</a>
							</div>
						</div>
					</div>
				)}

				{/* Hidden file input */}
				{permissions.can_upload && config?.features.file_upload && (
					<input
						ref={fileInputRef}
						type="file"
						accept={config.upload_config.allowed_types.join(',')}
						multiple
						onChange={handleFileSelect}
						style={{ display: 'none' }}
						aria-hidden="true"
					/>
				)}
			</div>

			{/* Mentions autocomplete - portaled to body (matches Voxel's teleport) */}
			<MentionsAutocomplete
				query={mentionQuery}
				isActive={mentionActive}
				onSelect={handleMentionSelect}
				onClose={() => { setMentionActive(false); setMentionQuery(''); }}
				style={mentionStyle}
			/>

			{/* Error message */}
			{error && (
				<div className="vxf-create-post__error ts-form-error">
					{error}
				</div>
			)}
		</div>
	);
}

export default StatusComposer;
