/**
 * CommentComposer Component
 *
 * Reply input form that matches Voxel's comment-composer.php structure EXACTLY.
 *
 * Voxel HTML Structure (from templates/widgets/timeline/comment-composer/comment-composer.php):
 * <div class="vxf-create-post vxf-create-comment flexify [vxf-expanded when focused]">
 *   <div class="vxf-avatar flexify">
 *     <img src="...">
 *   </div>
 *   <div class="vxf-create-post__content">
 *     <div class="vxf-content__highlighter">...</div>
 *     <textarea class="vxf-content__textarea" placeholder="Post a reply">...</textarea>
 *   </div>
 *   <div class="vxf-footer-wrapper"> [only when expanded]
 *     <div class="vxf-footer flexify">
 *       <div class="vxf-actions flexify">
 *         <a href="#" class="vxf-icon vxf-media-target">...</a>
 *         <a href="#" class="vxf-icon">...</a>
 *       </div>
 *       <div class="vxf-buttons flexify">
 *         <a class="ts-btn ts-btn-1">Cancel</a>
 *         <a class="ts-btn ts-btn-2 [vx-pending when submitting]">Reply</a>
 *       </div>
 *     </div>
 *   </div>
 * </div>
 *
 * @package VoxelFSE
 */

import { useState, useCallback, useRef, type ChangeEvent, type KeyboardEvent } from 'react';
import { useCurrentUser, useTimelineConfig, useStrings } from '../hooks';
import { publishComment, editComment } from '../api';
import type { Comment, CommentCreatePayload, CommentEditPayload, MediaFile } from '../types';
import EmojiPicker from './EmojiPicker';
import MediaPopup from '../../../shared/MediaPopup';

/**
 * Props
 */
interface CommentComposerProps {
	statusId: number;
	parentId?: number;
	onCommentPublished?: (comment: Comment) => void;
	onCancel?: () => void;
	placeholder?: string;
	autoFocus?: boolean;
	comment?: Comment;
	onCommentUpdated?: (comment: Comment) => void;
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
 * CommentComposer Component
 * Matches Voxel's vxf-create-post vxf-create-comment structure
 */
export function CommentComposer({
	statusId,
	parentId,
	onCommentPublished,
	onCancel,
	placeholder,
	autoFocus = false,
	comment, // Existing comment for edit mode
	onCommentUpdated,
}: CommentComposerProps): JSX.Element | null {
	const currentUser = useCurrentUser();
	const { config } = useTimelineConfig();
	const strings = useStrings();

	// State
	const [content, setContent] = useState(comment?.content ?? '');
	const [isExpanded, setIsExpanded] = useState(autoFocus || !!comment);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);

	// File state
	const [existingFiles, setExistingFiles] = useState<MediaFile[]>(comment?.files ?? []);
	const [_newFiles, _setNewFiles] = useState<File[]>([]); // To be implemented with Upload
	const [_showMediaPopup, _setShowMediaPopup] = useState(false);

	const isEditMode = !!comment;

	// Refs
	const wrapperRef = useRef<HTMLDivElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const emojiButtonRef = useRef<HTMLAnchorElement>(null);

	const l10n = (config?.strings ?? {}) as any;

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
	 * Handle focus - expand the composer
	 */
	const handleFocus = useCallback(() => {
		setIsExpanded(true);
	}, []);

	/**
	 * Handle cancel - collapse and clear
	 */
	const handleCancel = useCallback(() => {
		if (!isEditMode) {
			setContent('');
			setExistingFiles([]);
		} else {
			// If editing, revert to original content
			setContent(comment?.content ?? '');
			setExistingFiles(comment?.files ?? []);
		}
		setIsExpanded(isEditMode); // Keep expanded if edit mode (user usually expects to see the form)
		setError(null);

		// Reset textarea height
		if (textareaRef.current) {
			textareaRef.current.style.height = 'auto';
		}

		// Call external cancel handler if provided
		if (onCancel) {
			onCancel();
		}
	}, [onCancel]);

	/**
	 * Handle keyboard shortcuts (Cmd/Ctrl + Enter to submit, Escape to cancel)
	 */
	const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
		// Cmd/Ctrl + Enter to submit
		if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && content.trim()) {
			e.preventDefault();
			handleSubmit();
		}

		// Escape to cancel
		if (e.key === 'Escape' && onCancel) {
			e.preventDefault();
			handleCancel();
		}
	}, [content, onCancel]);

	/**
	 * Handle submit
	 */
	const handleSubmit = useCallback(async () => {
		// Validate
		const trimmedContent = content.trim();
		if (!trimmedContent) {
			setError(strings.content_too_short ?? 'Please enter some content');
			return;
		}

		// Get nonce
		const nonce = config?.nonces?.comment_publish;
		if (!nonce) {
			setError('Configuration not loaded');
			return;
		}

		setIsSubmitting(true);
		setError(null);

		try {
			// Format files for submission (IDs only)
			// Note: Currently only supporting existing files (ID based). 
			// New file uploads would need to be uploaded first to get IDs.
			const fileIds = existingFiles.map(f => f.id);

			if (isEditMode && comment) {
				// Edit mode
				const payload: CommentEditPayload = {
					comment_id: comment.id,
					content: trimmedContent,
					files: fileIds,
				};

				console.log('[CommentComposer] Updating comment:', payload);

				const updatedComment = await editComment(payload, nonce);

				console.log('[CommentComposer] Comment updated:', updatedComment);

				if (onCommentUpdated) {
					onCommentUpdated(updatedComment);
				}

				// Close edit mode
				if (onCancel) onCancel();
			} else {
				// Create mode
				const payload: CommentCreatePayload = {
					status_id: statusId,
					parent_id: parentId,
					content: trimmedContent,
					files: fileIds,
				};

				console.log('[CommentComposer] Publishing comment:', payload);

				const newComment = await publishComment(payload, nonce);

				console.log('[CommentComposer] Comment published:', newComment);

				// Clear and collapse
				setContent('');
				setExistingFiles([]);
				setIsExpanded(false);

				// Reset textarea height
				if (textareaRef.current) {
					textareaRef.current.style.height = 'auto';
				}

				// Notify parent
				if (onCommentPublished) {
					onCommentPublished(newComment);
				}
			}
		} catch (err) {
			console.error('[CommentComposer] Failed to publish:', err);
			setError(err instanceof Error ? err.message : 'Failed to publish comment');
		} finally {
			setIsSubmitting(false);
		}
	}, [content, statusId, parentId, config?.nonces?.comment_publish, strings, onCommentPublished, isEditMode, comment, existingFiles, onCommentUpdated, onCancel]);

	/**
	 * Remove a file attachment
	 */
	const removeFile = useCallback((fileId: number) => {
		setExistingFiles(prev => prev.filter(f => f.id !== fileId));
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

	// Don't render if not logged in
	// This check is placed AFTER all hooks to comply with React Rules of Hooks.
	if (!currentUser) {
		return null;
	}

	// Build classes - matches Voxel's structure exactly
	const containerClasses = [
		'vxf-create-post',
		'vxf-create-comment',
		'flexify',
		isExpanded ? 'vxf-expanded' : '',
	].filter(Boolean).join(' ');

	return (
		<div ref={wrapperRef} className={containerClasses}>
			{/* Avatar - matches Voxel's structure */}
			<div className="vxf-avatar flexify">
				<img src={currentUser.avatar_url} alt={currentUser.display_name} />
			</div>

			{/* Content textarea - matches Voxel's structure */}
			<div className="vxf-create-post__content">
				{/* Highlighter for mentions/hashtags (mirrors textarea content) */}
				<div className="vxf-content__highlighter">
					{/* Highlighter content removed to prevent visual overlap until fully implemented */}
				</div>
				<textarea
					ref={textareaRef}
					className="vxf-content__textarea"
					placeholder={placeholder ?? l10n.post_reply ?? 'Post a reply'}
					value={content}
					onChange={handleContentChange}
					onFocus={handleFocus}
					onKeyDown={handleKeyDown}
					disabled={isSubmitting}
					autoFocus={autoFocus}
				/>

				{/* File attachments */}
				{existingFiles.length > 0 && (
					<div className="vxf-composer-files">
						{existingFiles.map((file) => (
							<div key={file.id} className="vxf-composer-file">
								<div className="vxf-file-preview" style={{ backgroundImage: `url(${file.preview || file.url})` }}></div>
								<a
									href="#"
									className="vxf-remove-file"
									onClick={(e) => { e.preventDefault(); removeFile(file.id); }}
								>
									<svg viewBox="0 0 24 24"><path d="M18.984 6.412l-1.408-1.412-5.576 5.576-5.576-5.576-1.412 1.412 5.576 5.576-5.576 5.576 1.412 1.412 5.576-5.576 5.576 5.576 1.408-1.412-5.576-5.576z" fill="currentColor"></path></svg>
								</a>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Expanded footer - only when focused (matches Voxel's structure) */}
			{isExpanded && (
				<div className="vxf-footer-wrapper" style={{ height: 'auto' }}>
					{/* Error message */}
					{error && (
						<div className="vxf-error" style={{ color: 'var(--ts-shade-5)', padding: '0 10px 10px', fontSize: '13px' }}>
							{error}
						</div>
					)}

					<div className="vxf-footer flexify">
						{/* Actions - media upload buttons */}
						<div className="vxf-actions flexify">
							{config?.features?.file_upload && (
								<>
									{/* TODO: Gallery button - MediaPopup component needs to be created */}
									<MediaPopup
										multiple={true}
										saveLabel="Insert"
										target={wrapperRef.current}
										onSave={(files) => {
											// Convert media library files to StatusMedia format
											const mappedFiles: MediaFile[] = files.map(f => ({
												id: f.id,
												url: f.preview || '',
												preview: f.preview || '',
												alt: f.name
											}));

											setExistingFiles(prev => {
												const existingIds = new Set(prev.map(p => p.id));
												const uniqueNew = mappedFiles.filter(f => !existingIds.has(f.id));
												return [...prev, ...uniqueNew];
											});
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
									<a
										href="#"
										className="vxf-icon"
										onClick={(e) => {
											e.preventDefault();
											// TODO: Implement file upload for comments
											console.log('[CommentComposer] Upload clicked - not yet implemented');
										}}
									>
										<UploadIcon />
									</a>
								</>
							)}
							{/* Emoji button */}
							<a href="#" ref={emojiButtonRef} className="vxf-icon vxf-emoji-picker" onClick={toggleEmojiPicker}>
								<EmojiIcon />
							</a>
							<EmojiPicker
								isOpen={showEmojiPicker}
								onClose={() => setShowEmojiPicker(false)}
								onSelect={insertEmoji}
								target={emojiButtonRef.current}
							/>
						</div>

						{/* Buttons - matches Voxel's ts-btn structure */}
						<div className="vxf-buttons flexify">
							<a
								href="#"
								className="ts-btn ts-btn-1"
								onClick={(e) => { e.preventDefault(); handleCancel(); }}
							>
								{l10n.cancel ?? 'Cancel'}
							</a>
							<a
								href="#"
								className={`ts-btn ts-btn-2 ${isSubmitting ? 'vx-pending' : ''}`}
								onClick={(e) => { e.preventDefault(); handleSubmit(); }}
							>
								{isSubmitting ? (
									<span className="ts-loader" />
								) : (
									l10n.reply ?? (isEditMode ? 'Update' : 'Reply')
								)}
							</a>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default CommentComposer;
