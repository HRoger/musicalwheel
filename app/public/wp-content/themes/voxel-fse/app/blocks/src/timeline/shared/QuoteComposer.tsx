/**
 * QuoteComposer Component
 *
 * Inline composer for quoting a status.
 * Matches Voxel's quote composer behavior from timeline-main.beautified.js lines 688-705
 *
 * Voxel behavior:
 * - showQuoteBox: false toggles to true when quoteStatus() is called
 * - Uses status-composer component with quoteOf prop
 * - On publish, calls reset() on quoter ref and emits 'quote' event
 *
 * @package VoxelFSE
 */

import { useState, useCallback, useRef, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { useTimelineContext, useStrings, useFileUpload } from '../hooks';
import { quoteStatusApi } from '../api';
import { countCharacters } from '../utils';
import type { Status } from '../types';
import EmojiPicker from './EmojiPicker';

/**
 * Props
 */
interface QuoteComposerProps {
	quoteOf: Status;
	onQuotePublished: (quotedStatus: Status) => void;
	onCancel: () => void;
	className?: string;
}

/**
 * Icon components matching Voxel's SVG icons
 */
const EmojiIcon = () => (
	<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
		<path d="M12 2C6.49 2 2 6.49 2 12C2 17.51 6.49 22 12 22C17.51 22 22 17.51 22 12C22 6.49 17.51 2 12 2ZM12 20.5C7.31 20.5 3.5 16.69 3.5 12C3.5 7.31 7.31 3.5 12 3.5C16.69 3.5 20.5 7.31 20.5 12C20.5 16.69 16.69 20.5 12 20.5Z" fill="currentColor"></path>
		<path d="M17.6 13.19C17.37 13.04 17.07 13.02 16.83 13.15C16.81 13.16 14.56 14.35 12 14.35C9.44 14.35 7.19 13.16 7.17 13.15C6.93 13.02 6.63 13.03 6.4 13.19C6.17 13.34 6.04 13.61 6.07 13.89C6.3 16.26 8.46 18.78 12 18.78C15.54 18.78 17.69 16.26 17.93 13.89C17.96 13.61 17.83 13.35 17.6 13.19ZM12 17.27C10.07 17.27 8.7 16.31 8.02 15.13C9.04 15.48 10.45 15.85 12 15.85C13.55 15.85 14.96 15.49 15.98 15.13C15.3 16.31 13.93 17.27 12 17.27Z" fill="currentColor"></path>
		<path d="M7.33 10.14C7.36 10.22 7.4 10.29 7.44 10.36C7.49 10.43 7.54 10.49 7.6 10.55C7.65 10.61 7.72 10.66 7.79 10.7C7.85 10.75 7.93 10.79 8 10.82C8.08 10.85 8.16 10.87 8.24 10.89C8.32 10.91 8.4 10.92 8.48 10.92C8.56 10.92 8.64 10.92 8.72 10.89C8.8 10.86 8.88 10.85 8.96 10.82C9.03 10.79 9.11 10.75 9.17 10.7C9.24 10.66 9.31 10.61 9.36 10.55C9.6 10.32 9.73 9.99 9.73 9.67C9.73 9.35 9.6 9.01 9.36 8.78C9.31 8.72 9.24 8.67 9.17 8.63C9.11 8.58 9.03 8.54 8.96 8.51C8.88 8.48 8.8 8.46 8.72 8.44C8.56 8.41 8.4 8.41 8.24 8.44C8.16 8.46 8.08 8.48 8 8.51C7.93 8.54 7.85 8.58 7.79 8.63C7.72 8.67 7.65 8.72 7.6 8.78C7.36 9.01 7.23 9.33 7.23 9.67C7.23 9.75 7.23 9.83 7.26 9.91C7.27 9.99 7.29 10.07 7.33 10.14Z" fill="currentColor"></path>
		<path d="M12.99 11.02C13.38 11.16 13.8 10.95 13.94 10.56C13.97 10.48 14.25 9.76 14.97 9.76C15.69 9.76 15.97 10.48 16 10.55C16.1 10.86 16.4 11.06 16.71 11.06C16.79 11.06 16.87 11.05 16.95 11.02C17.34 10.89 17.55 10.46 17.42 10.07C17.19 9.4 16.42 8.25 14.97 8.25C13.52 8.25 12.75 9.39 12.52 10.07C12.39 10.46 12.6 10.88 12.99 11.01V11.02Z" fill="currentColor"></path>
	</svg>
);

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

/**
 * QuoteComposer Component
 * Matches Voxel's quote composer behavior
 */
export function QuoteComposer({
	quoteOf,
	onQuotePublished,
	onCancel,
	className = '',
}: QuoteComposerProps): JSX.Element | null {
	const { config } = useTimelineContext();
	const strings = useStrings();

	// Content state
	const [content, setContent] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Emoji picker state
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);

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

	// Refs
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const wrapperRef = useRef<HTMLDivElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Character count
	const charCount = countCharacters(content);
	const maxChars = config?.character_limits.status_max ?? 5000;
	const isOverLimit = charCount > maxChars;

	// Can submit check
	const canSubmit = !isOverLimit && !isSubmitting && !isUploading;

	// Focus textarea on mount
	useEffect(() => {
		textareaRef.current?.focus();
	}, []);

	/**
	 * Handle content change
	 */
	const handleContentChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
		setContent(e.target.value);
		setError(null);

		// Auto-resize textarea
		const textarea = e.target;
		textarea.style.height = 'auto';
		textarea.style.height = `${textarea.scrollHeight}px`;
	}, []);

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
	 * Reset the composer
	 */
	const reset = useCallback(() => {
		setContent('');
		clearUploads();
		setError(null);
		if (textareaRef.current) {
			textareaRef.current.style.height = 'auto';
		}
	}, [clearUploads]);

	/**
	 * Handle cancel
	 */
	const handleCancel = useCallback((e: React.MouseEvent) => {
		e.preventDefault();
		reset();
		onCancel();
	}, [reset, onCancel]);

	/**
	 * Handle form submission - create quote status
	 * Matches Voxel's timeline-composer.beautified.js lines 371-396
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

			// Get nonce from config
			const nonce = config?.nonces?.status_quote ?? config?.nonces?.status_publish ?? '';
			if (!nonce) {
				throw new Error('Configuration not loaded');
			}

			// Call quote API
			const quotedStatus = await quoteStatusApi({
				quote_of: quoteOf.id,
				content: content.trim(),
				files: newFileIds,
			}, nonce);

			// Reset and notify parent (matches Voxel's behavior)
			reset();
			onQuotePublished(quotedStatus);
		} catch (err) {
			setError(err instanceof Error ? err.message : strings.error_generic);
		} finally {
			setIsSubmitting(false);
		}
	}, [canSubmit, content, quoteOf.id, uploads, completedFiles, uploadAll, config?.nonces?.status_quote, config?.nonces?.status_publish, reset, onQuotePublished, strings.error_generic]);

	/**
	 * Open file picker
	 */
	const openFilePicker = useCallback((e: React.MouseEvent) => {
		e.preventDefault();
		fileInputRef.current?.click();
	}, []);

	/**
	 * Insert emoji at cursor position
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

	// Get current user for avatar
	const currentUser = config?.current_user;

	// Safety check - don't render if user not loaded
	if (!currentUser) {
		return null;
	}

	const avatarUrl = currentUser.avatar_url ?? '';
	const displayName = currentUser.display_name ?? '';

	// Get placeholder from quotes config (matches Voxel's computed placeholder)
	const placeholderText = config?.strings.compose_placeholder ?? "What's on your mind?";

	return (
		<>
			{/* "Quote post" separator - matches Voxel's vxf-split structure */}
			<div className="vxf-split flexify">
				<span>Quote post</span>
			</div>

			{/* Composer - matches Voxel's standard vxf-create-post structure */}
			<div
				ref={wrapperRef}
				className={`vxf-create-post flexify vxf-expanded ${className}`}
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
						placeholder={placeholderText}
						maxLength={maxChars}
						disabled={isSubmitting}
					/>
				</div>

				{/* Footer wrapper - matches Voxel's transition-height > vxf-footer-wrapper */}
				<div className="vxf-footer-wrapper" style={{ height: 'auto' }}>
					{/* File upload previews - if any */}
					{(uploads.length > 0 || completedFiles.length > 0) && (
						<div className="ts-form-group ts-file-upload vxf-create-section">
							<div className="ts-file-list">
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
												&times;
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
							{config?.features.file_upload && (
								<>
									<a href="#" onClick={openFilePicker} className="vxf-icon">
										<GalleryIcon />
									</a>
									<a href="#" onClick={openFilePicker} className="vxf-icon">
										<UploadIcon />
									</a>
								</>
							)}
							<a href="#" className="vxf-icon vxf-emoji-picker" onClick={toggleEmojiPicker}>
								<EmojiIcon />
							</a>
							<EmojiPicker
								isOpen={showEmojiPicker}
								onClose={() => setShowEmojiPicker(false)}
								onSelect={insertEmoji}
								target={wrapperRef.current}
							/>
						</div>

						{/* Buttons - Cancel and Publish (matches Voxel's button text) */}
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
								) : (
									'Publish'
								)}
							</a>
						</div>
					</div>
				</div>

				{/* Hidden file input */}
				{config?.features.file_upload && (
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

				{/* Error message */}
				{error && (
					<div className="vxf-create-post__error ts-form-error">
						{error}
					</div>
				)}
			</div>
		</>
	);
}

export default QuoteComposer;
