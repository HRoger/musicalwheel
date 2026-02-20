/**
 * Texteditor Field Component - ENHANCED to Level 2
 * Handles: texteditor field type with TinyMCE WYSIWYG editor
 *
 * Voxel Template: themes/voxel/templates/widgets/create-post/texteditor-field.php
 *
 * Enhancement Level: Level 2 (Full Parity)
 * Enhancement Date: 2025-11-27
 *
 * Features Added:
 * - TinyMCE WYSIWYG editor integration using WordPress wp.editor API
 * - Character counter (current/max) - Voxel texteditor-field.php line 10, 36
 * - Description tooltip (vx-dialog) - Voxel texteditor-field.php lines 12-17, 38-43
 * - Plain-text mode fallback (auto-resizing textarea)
 * - Shows "Optional" when not required and empty
 *
 * TinyMCE Configuration (from Voxel texteditor-field.php lines 74-111):
 * - Basic mode: bold, italic, lists, links
 * - Advanced mode: formatting, alignment, strikethrough, underline, hr, color
 */
import React, { useState, useRef, useEffect } from 'react';
import type { VoxelField, FieldIcons } from '../../types';
import { InfoIcon } from '../icons/InfoIcon';

/**
 * TinyMCE Editor instance interface
 */
interface TinyMCEEditor {
	on: (event: string, callback: (e: any) => void) => void;
	off: (event: string, callback: (e: any) => void) => void;
	setContent: (content: string) => void;
	getContent: () => string;
	remove: () => void;
	save: () => void;
}

/**
 * TinyMCE global interface
 */
interface TinyMCEGlobal {
	init: (settings: Record<string, unknown>) => void;
	get: (id: string) => TinyMCEEditor | null;
	activeEditor?: TinyMCEEditor | null;
}

/**
 * TinyMCE initialization settings interface
 * Based on Voxel's texteditor-field.php configuration
 */
interface TinyMCESettings {
	wpautop: boolean;
	paste_as_text: boolean;
	paste_auto_cleanup_on_paste: boolean;
	paste_remove_spans: boolean;
	paste_remove_styles: boolean;
	paste_remove_styles_if_webkit: boolean;
	paste_strip_class_attributes: boolean;
	autoresize_min_height: number;
	autoresize_max_height: number;
	wp_autoresize_on: boolean;
	content_style: string;
	plugins?: string;
	toolbar?: string;
	selector?: string;
	setup?: (editor: TinyMCEEditor) => void;
}

interface TexteditorFieldProps {
	field: VoxelField;
	value: string;
	onChange: (value: string) => void;
	onBlur?: () => void;
	icons?: FieldIcons;
}

declare global {
	interface Window {
		tinymce?: TinyMCEGlobal;
	}
}

export const TexteditorField: React.FC<TexteditorFieldProps> = ({ field, value, onChange, onBlur }) => {
	const editorContainerRef = useRef<HTMLDivElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const hiddenTextareaRef = useRef<HTMLTextAreaElement>(null);
	const [_editorInstance, setEditorInstance] = useState<TinyMCEEditor | null>(null);
	const editorIdRef = useRef<string>(`texteditor-${field.key}-${Math.random().toString(36).substr(2, 9)}`);
	const [localError, setLocalError] = useState<string>('');

	// Determine editor type
	const editorType = field.props?.['editorType'] || 'plain-text';
	const isPlainText = editorType === 'plain-text';
	const isBasic = editorType === 'wp-editor-basic';
	const isAdvanced = editorType === 'wp-editor-advanced';

	// Character count (strip HTML for WYSIWYG editors)
	const getContentLength = () => {
		if (isPlainText) {
			return value ? value.length : 0;
		}
		// For TinyMCE, count text content only (no HTML tags)
		const tempDiv = document.createElement('div');
		tempDiv.innerHTML = value || '';
		return tempDiv.textContent?.length || 0;
	};

	const contentLength = getContentLength();
	const maxLength = field.props?.['maxlength'];

	// Real-time validation for minlength/maxlength
	const validateContent = (newValue: string) => {
		// Only validate if there's content
		if (newValue && newValue.length > 0) {
			const minlength = field.props?.['minlength'];
			const maxlength = field.props?.['maxlength'];

			// Get content length (strip HTML for WYSIWYG)
			let length: number;
			if (isPlainText) {
				length = newValue.length;
			} else {
				const tempDiv = document.createElement('div');
				tempDiv.innerHTML = newValue;
				length = tempDiv.textContent?.length || 0;
			}

			if (minlength && length < Number(minlength)) {
				setLocalError(`Value cannot be shorter than ${minlength} characters`);
			} else if (maxlength && length > Number(maxlength)) {
				setLocalError(`Value cannot be longer than ${maxlength} characters`);
			} else {
				setLocalError('');
			}
		} else {
			setLocalError('');
		}
	};

	// Auto-resize textarea to fit content (plain-text mode only)
	const resizeTextarea = () => {
		if (!isPlainText || !textareaRef.current || !hiddenTextareaRef.current) return;

		const textarea = textareaRef.current;
		const hiddenTextarea = hiddenTextareaRef.current;

		// Copy value to hidden textarea
		hiddenTextarea.value = textarea.value;

		// Get computed height
		const newHeight = hiddenTextarea.scrollHeight;

		// Apply height to visible textarea
		textarea.style.height = `${newHeight}px`;
	};

	// Initialize WordPress editor (for wp-editor-basic and wp-editor-advanced modes)
	// Matching Voxel's FieldTextEditor.renderEditor() pattern:
	//   1. Set innerHTML on container BEFORE init (done in JSX: {value || ''})
	//   2. Call wp.oldEditor.initialize() — TinyMCE picks up DOM content
	//   3. Never call editor.setContent() — that triggers St.setDocument → unload violation
	// Evidence: voxel-create-post.beautified.js lines 593-601
	useEffect(() => {
		if (isPlainText || !editorContainerRef.current) return;

		const initWPEditor = () => {
			const wp = (window as any).wp;
			// Use wp.oldEditor (classic TinyMCE) like Voxel does, fallback to wp.editor
			const wpEditor = wp?.oldEditor || wp?.editor;
			if (!wpEditor) {
				console.warn('WordPress editor API is not loaded. Make sure WordPress editor assets are enqueued.');
				return;
			}

			const editorId = editorIdRef.current;

			// Set innerHTML before init (Voxel pattern: this.$refs.editor.innerHTML = this.field.value)
			// This lets TinyMCE pick up existing content without needing setContent() after init
			if (editorContainerRef.current) {
				editorContainerRef.current.innerHTML = value || '';
			}

			// Determine TinyMCE settings based on editor type
			// Matching Voxel's configuration from texteditor-field.php lines 74-111
			const tinymceSettings: TinyMCESettings = {
				wpautop: true,
				paste_as_text: false,
				paste_auto_cleanup_on_paste: true,
				paste_remove_spans: true,
				paste_remove_styles: true,
				paste_remove_styles_if_webkit: true,
				paste_strip_class_attributes: true,
				// Voxel-specific settings (texteditor-field.php lines 83-92)
				autoresize_min_height: 150,
				autoresize_max_height: 800,
				wp_autoresize_on: true,
				content_style: `
					body > :first-child { margin-top: 0; }
					body > :last-child { margin-bottom: 0; }
					a[data-wplink-url-error], a[data-wplink-url-error]:hover, a[data-wplink-url-error]:focus {
						outline: none;
					}
				`,
			};

			// Basic mode configuration (texteditor-field.php lines 97-102)
			if (isBasic) {
				tinymceSettings.plugins = 'lists,paste,tabfocus,wplink,wordpress,wpautoresize';
				tinymceSettings.toolbar = 'bold,italic,bullist,numlist,link,unlink';
			}

			// Advanced mode configuration (texteditor-field.php lines 105-111)
			if (isAdvanced) {
				tinymceSettings.plugins = 'lists,paste,tabfocus,wplink,wordpress,colorpicker,hr,wpautoresize';
				tinymceSettings.toolbar = 'formatselect,bold,italic,bullist,numlist,link,unlink,strikethrough,alignleft,aligncenter,alignright,underline,hr';
			}

			// Remove any previous instance before initializing (Voxel pattern: line 595)
			wpEditor.remove(editorId);

			// Initialize using WordPress oldEditor API (classic TinyMCE) like Voxel
			wpEditor.initialize(editorId, {
				tinymce: tinymceSettings,
				quicktags: false, // Disable quicktags (visual mode only)
				mediaButtons: false,
			});

			// Wait for TinyMCE to be ready, then get the editor instance
			// Voxel accesses tinyMCE.editors[id] directly after jQuery ready callback
			const checkInterval = setInterval(() => {
				if (window.tinymce) {
					const editor = window.tinymce.get(editorId);
					if (editor) {
						clearInterval(checkInterval);

						// Do NOT call editor.setContent() — Voxel never does this.
						// TinyMCE picks up the content from the DOM element set above.
						// Calling setContent() triggers St.setDocument() which registers
						// an 'unload' listener causing Chrome permission violations.
						setEditorInstance(editor);

						// Listen for content changes (Voxel: change, keyup, input + editor.save())
						editor.on('change', ((e: { target?: { getContent?: () => string } }) => {
							const content = e.target?.getContent?.() || editor.getContent();
							onChange(content);
							validateContent(content);
						}) as any);
						editor.on('keyup', () => {
							editor.save();
						});
						editor.on('input', () => {
							editor.save();
						});

						// Listen for blur
						editor.on('blur', () => {
							if (onBlur) {
								onBlur();
							}
						});
					}
				}
			}, 100);

			// Timeout after 5 seconds
			setTimeout(() => clearInterval(checkInterval), 5000);
		};

		// Wait for WordPress editor API to load
		const wp = (window as any).wp;
		const wpEditor = wp?.oldEditor || wp?.editor;
		if (wpEditor) {
			initWPEditor();
		} else {
			const checkInterval = setInterval(() => {
				const currentWp = (window as any).wp;
				const currentWpEditor = currentWp?.oldEditor || currentWp?.editor;
				if (currentWpEditor) {
					clearInterval(checkInterval);
					initWPEditor();
				}
			}, 100);

			// Timeout after 5 seconds
			setTimeout(() => clearInterval(checkInterval), 5000);
		}

		// Cleanup on unmount (Voxel pattern: line 584-587)
		return () => {
			const editorId = editorIdRef.current;
			const cleanupWp = (window as any).wp;
			const cleanupWpEditor = cleanupWp?.oldEditor || cleanupWp?.editor;
			if (cleanupWpEditor) {
				cleanupWpEditor.remove(editorId);
			}
		};
	}, [isPlainText, isBasic, isAdvanced]);

	// Resize on mount and when value changes (plain-text mode only)
	useEffect(() => {
		if (isPlainText) {
			resizeTextarea();
		}
	}, [value, isPlainText]);

	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const newValue = e.target.value;
		onChange(newValue);
		validateContent(newValue);
		resizeTextarea();
	};

	// Use server error or local error (matches TextField pattern)
	const displayError = field.validation?.errors?.[0] || localError;
	const hasError = displayError.length > 0;

	return (
		<div className={`ts-form-group field-key-${field.key} ${hasError ? 'ts-has-errors' : ''} ${field.css_class || ''} ${field.hidden ? 'hidden' : ''}`}>
			{/* Label with character counter - matches Voxel lines 3-18 and 29-44 */}
			<label>
				{field.label}

				{/* Error message, Optional label, or Character counter - matches Voxel logic */}
				{hasError ? (
					<span className="is-required">{displayError}</span>
				) : (
					<>
						{!field.required && contentLength === 0 && (
							<span className="is-required">Optional</span>
						)}
						{/* Character counter - only show if maxlength is set AND content exists */}
						{maxLength && contentLength > 0 && (
							<span className="is-required ts-char-counter">
								{contentLength}/{String(maxLength)}
							</span>
						)}
					</>
				)}

				{/* ENHANCEMENT: Description tooltip (vx-dialog) - Voxel texteditor-field.php lines 12-17, 38-43 */}
				{field.description && (
					<div className="vx-dialog">
						<InfoIcon />
						<div className="vx-dialog-content min-scroll">
							<p>{field.description}</p>
						</div>
					</div>
				)}
			</label>

			{/* Plain-text mode: Textarea - matches Voxel lines 19-26 */}
			{isPlainText && (
				<>
					<textarea
						ref={textareaRef}
						value={value || ''}
						onChange={handleChange}
						onBlur={onBlur}
						placeholder={String(field.props?.['placeholder'] ?? field.placeholder ?? '')}
						className="ts-filter"
						required={field.required}
					/>

					{/* Hidden textarea for height calculation - matches Voxel line 26 */}
					<textarea
						ref={hiddenTextareaRef}
						className="ts-filter"
						disabled
						style={{
							height: '5px',
							position: 'fixed',
							top: '-9999px',
							left: '-9999px',
							visibility: 'hidden'
						}}
						aria-hidden="true"
						tabIndex={-1}
					/>
				</>
			)}

			{/* WYSIWYG mode: WordPress editor container - matches Voxel line 45 */}
			{!isPlainText && (
				<div
					ref={editorContainerRef}
					id={editorIdRef.current}
					className="editor-container mce-content-body"
				>
					{value || ''}
				</div>
			)}
		</div>
	);
};
