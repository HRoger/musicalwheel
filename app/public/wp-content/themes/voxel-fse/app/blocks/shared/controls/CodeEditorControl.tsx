/**
 * Code Editor Control Component
 *
 * A CSS code editor with syntax highlighting, line numbers, and autocomplete.
 * Uses WordPress's built-in CodeMirror (same as theme/plugin editors).
 * Matches Elementor's Ace editor pattern for Custom CSS.
 *
 * Features:
 * - CSS syntax highlighting
 * - Line numbers (gutter)
 * - Auto-closing brackets
 * - CSS property autocomplete
 * - Dark/light theme support
 * - Resizable editor area
 *
 * @package VoxelFSE
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { __ } from '@wordpress/i18n';
import { DynamicTagBuilder } from '../../shared/dynamic-tags';
import EnableTagsButton from './EnableTagsButton';

declare global {
	interface Window {
		wp: {
			codeEditor?: {
				initialize: (
					textarea: HTMLTextAreaElement,
					settings?: CodeMirrorSettings
				) => CodeMirrorInstance;
				defaultSettings?: {
					codemirror: CodeMirrorOptions;
				};
			};
		};
		CodeMirror?: any;
	}
}

interface CodeMirrorOptions {
	mode?: string;
	lineNumbers?: boolean;
	lineWrapping?: boolean;
	autoCloseBrackets?: boolean;
	matchBrackets?: boolean;
	indentUnit?: number;
	tabSize?: number;
	indentWithTabs?: boolean;
	theme?: string;
	gutters?: string[];
	lint?: boolean;
	autoRefresh?: boolean;
	extraKeys?: Record<string, string>;
}

interface CodeMirrorSettings {
	codemirror?: CodeMirrorOptions;
}

interface CodeMirrorInstance {
	codemirror: {
		getValue: () => string;
		setValue: (value: string) => void;
		on: (event: string, callback: () => void) => void;
		off: (event: string, callback: () => void) => void;
		refresh: () => void;
		setOption: (option: string, value: any) => void;
		getOption: (option: string) => any;
		focus: () => void;
	};
}

export interface CodeEditorControlProps {
	/** Control label */
	label?: string;
	/** Current value */
	value: string;
	/** Change handler */
	onChange: (value: string) => void;
	/** Help text (can be string or React node) */
	help?: React.ReactNode;
	/** Placeholder text */
	placeholder?: string;
	/** Editor height in pixels (default: 200) */
	height?: number;
	/** Code language mode (default: 'css') */
	mode?: 'css' | 'javascript' | 'htmlmixed';
	/** Show line numbers (default: true) */
	lineNumbers?: boolean;
	/** Enable dynamic tags support */
	enableDynamicTags?: boolean;
	/** Dynamic tag context (default: 'post') */
	context?: string;
}

/**
 * CodeEditorControl - CSS/JS code editor with syntax highlighting
 *
 * Uses WordPress's built-in CodeMirror for a consistent editing experience.
 *
 * @example
 * <CodeEditorControl
 *   label="Custom CSS"
 *   value={attributes.customCSS}
 *   onChange={(css) => setAttributes({ customCSS: css })}
 *   help="Use 'selector' to target this block."
 * />
 */
export default function CodeEditorControl({
	label,
	value,
	onChange,
	help,
	placeholder = '',
	height = 200,
	mode = 'css',
	lineNumbers = true,
	enableDynamicTags = false,
	context = 'post',
}: CodeEditorControlProps) {
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const editorRef = useRef<CodeMirrorInstance | null>(null);
	const [isCodeMirrorAvailable, setIsCodeMirrorAvailable] = useState(false);
	const isInternalChange = useRef(false);
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Dynamic tag helpers
	const hasDynamicTags = () => {
		return typeof value === 'string' && value.startsWith('@tags()') && value.includes('@endtags()');
	};

	const getTagContent = () => {
		if (!hasDynamicTags()) return value || '';
		const match = value.match(/@tags\(\)(.*?)@endtags\(\)/s);
		return match ? match[1] : value;
	};

	const wrapWithTags = (content: string) => {
		if (!content) return '';
		return `@tags()${content}@endtags()`;
	};

	const handleEnableTags = () => {
		setIsModalOpen(true);
	};

	const handleEditTags = () => {
		setIsModalOpen(true);
	};

	const handleDisableTags = () => {
		if (window.confirm(__('Are you sure?', 'voxel-fse'))) {
			onChange('');
		}
	};

	const handleModalSave = (newValue: string) => {
		if (newValue) {
			onChange(wrapWithTags(newValue));
		}
		setIsModalOpen(false);
	};

	const isTagsActive = hasDynamicTags();

	// Check if CodeMirror is available
	useEffect(() => {
		const checkCodeMirror = () => {
			if (window.wp?.codeEditor && window.CodeMirror) {
				setIsCodeMirrorAvailable(true);
				return true;
			}
			return false;
		};

		if (!checkCodeMirror()) {
			// CodeMirror might load async, check again after a short delay
			const timer = setTimeout(checkCodeMirror, 500);
			return () => clearTimeout(timer);
		}
	}, []);

	// Initialize CodeMirror
	useEffect(() => {
		if (!isCodeMirrorAvailable || !textareaRef.current || editorRef.current) {
			return;
		}

		// Build gutters array - lint markers first, then line numbers
		const gutters: string[] = ['CodeMirror-lint-markers'];
		if (lineNumbers) {
			gutters.push('CodeMirror-linenumbers');
		}

		const settings: CodeMirrorSettings = {
			codemirror: {
				mode: mode,
				lineNumbers: lineNumbers,
				lineWrapping: true,
				autoCloseBrackets: true,
				matchBrackets: true,
				indentUnit: 2,
				tabSize: 2,
				indentWithTabs: true,
				theme: 'default',
				gutters: gutters,
				lint: true, // Enable CSS linting for syntax error detection
				autoRefresh: true,
				extraKeys: {
					'Ctrl-Space': 'autocomplete',
				},
			},
		};

		try {
			const editor = window.wp!.codeEditor!.initialize(textareaRef.current, settings);
			editorRef.current = editor;

			// Set initial value
			if (value) {
				editor.codemirror.setValue(value);
			}

			// Handle changes
			const handleChange = () => {
				if (isInternalChange.current) return;
				const newValue = editor.codemirror.getValue();
				if (newValue !== value) {
					onChange(newValue);
				}
			};

			editor.codemirror.on('change', handleChange);

			// Refresh after a short delay to fix sizing issues
			setTimeout(() => {
				editor.codemirror.refresh();
			}, 100);

			return () => {
				editor.codemirror.off('change', handleChange);
			};
		} catch (error) {
			console.warn('Failed to initialize CodeMirror:', error);
		}
	}, [isCodeMirrorAvailable, mode, lineNumbers]);

	// Sync external value changes
	useEffect(() => {
		if (editorRef.current && value !== editorRef.current.codemirror.getValue()) {
			isInternalChange.current = true;
			editorRef.current.codemirror.setValue(value || '');
			isInternalChange.current = false;
		}
	}, [value]);

	// Fallback change handler for textarea
	const handleTextareaChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			onChange(e.target.value);
		},
		[onChange]
	);

	return (
		<div className="voxel-fse-code-editor-control">
			{label && (
				<div className="voxel-fse-code-editor-control__header">
					{enableDynamicTags && <EnableTagsButton onClick={handleEnableTags} />}
					<label className="voxel-fse-code-editor-control__label">{label}</label>
				</div>
			)}

			{/* Show code editor OR dynamic tag panel */}
			{enableDynamicTags && isTagsActive ? (
				<div className="edit-voxel-tags" style={{
					backgroundColor: 'rgb(47, 47, 49)',
					borderRadius: '10px',
					overflow: 'hidden',
					padding: '12px',
				}}>
					{/* Tag content row */}
					<div style={{ marginBottom: '12px', maxHeight: '120px', overflow: 'auto' }}>
						<span style={{
							color: '#fff',
							fontSize: '13px',
							fontFamily: 'monospace',
							wordBreak: 'break-all',
							whiteSpace: 'pre-wrap',
						}}>
							{getTagContent()}
						</span>
					</div>

					{/* Light gray divider */}
					<div style={{
						height: '1px',
						backgroundColor: 'rgba(255, 255, 255, 0.15)',
						marginBottom: '8px',
					}} />

					{/* Action buttons row */}
					<div style={{ display: 'flex' }}>
						<button
							type="button"
							className="edit-tags"
							onClick={handleEditTags}
							style={{
								flex: 1,
								background: 'transparent',
								border: 'none',
								color: 'rgba(255, 255, 255, 0.8)',
								fontSize: '10px',
								fontWeight: 600,
								letterSpacing: '0.5px',
								cursor: 'pointer',
								padding: '6px 0',
								textAlign: 'left',
							}}
						>
							{__('EDIT TAGS', 'voxel-fse')}
						</button>
						<button
							type="button"
							className="disable-tags"
							onClick={handleDisableTags}
							style={{
								flex: 1,
								background: 'transparent',
								border: 'none',
								color: 'rgba(255, 255, 255, 0.5)',
								fontSize: '10px',
								fontWeight: 600,
								letterSpacing: '0.5px',
								cursor: 'pointer',
								padding: '6px 0',
								textAlign: 'right',
							}}
						>
							{__('DISABLE TAGS', 'voxel-fse')}
						</button>
					</div>
				</div>
			) : (
				<div
					className="voxel-fse-code-editor-control__editor"
					style={{ minHeight: `${height}px` }}
				>
					<textarea
						ref={textareaRef}
						value={value || ''}
						onChange={handleTextareaChange}
						placeholder={placeholder}
						className="voxel-fse-code-editor-control__textarea"
						style={{
							width: '100%',
							minHeight: `${height}px`,
							fontFamily: 'monospace',
							fontSize: '12px',
							display: isCodeMirrorAvailable ? 'none' : 'block',
						}}
					/>
				</div>
			)}

			{help && <div className="voxel-fse-code-editor-control__help">{help}</div>}

			{/* Dynamic Tag Builder Modal */}
			{enableDynamicTags && isModalOpen && (
				<DynamicTagBuilder
					value={getTagContent()}
					onChange={handleModalSave}
					label={label || __('Custom CSS', 'voxel-fse')}
					context={context}
					onClose={() => setIsModalOpen(false)}
					autoOpen={true}
				/>
			)}

			<style>{`
				.voxel-fse-code-editor-control {
					margin-bottom: 16px;
				}
				.voxel-fse-code-editor-control__header {
					display: flex;
					align-items: center;
					gap: 8px;
					margin-bottom: 8px;
				}
				.voxel-fse-code-editor-control__label {
					font-weight: 500;
					font-size: 11px;
					text-transform: uppercase;
					color: #6d7882;
				}
				.voxel-fse-code-editor-control__editor {
					border: 1px solid #d5d8dc;
					border-radius: 3px;
					overflow: hidden;
					background: #fff;
				}
				.voxel-fse-code-editor-control__editor .CodeMirror {
					height: auto;
					min-height: 140px;
					font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
					font-size: 12px;
					line-height: 1.5;
					border: none;
				}
				.voxel-fse-code-editor-control__editor .CodeMirror-scroll {
					min-height: 140px;
				}
				.voxel-fse-code-editor-control__editor .CodeMirror-gutters {
					background: #f5f5f5;
					border-right: 1px solid #e0e0e0;
				}
				.voxel-fse-code-editor-control__editor .CodeMirror-linenumber {
					color: #999;
					padding: 0 3px 0 5px;
					min-width: 20px;
				}
				.voxel-fse-code-editor-control__editor .CodeMirror-lines {
					padding: 8px 0;
					min-height: 120px;
				}
				.voxel-fse-code-editor-control__editor .CodeMirror pre.CodeMirror-line {
					padding: 0 8px;
				}
				.voxel-fse-code-editor-control__textarea {
					padding: 8px;
					border: none;
					resize: vertical;
					background: #fff;
				}
				.voxel-fse-code-editor-control__help {
					margin: 8px 0 0;
					font-size: 12px;
					color: #6d7882;
					font-style: italic;
				}
				.voxel-fse-code-editor-control__help a {
					color: #93003f;
				}
				/* CSS Lint marker styles */
				.voxel-fse-code-editor-control__editor .CodeMirror-lint-markers {
					width: 16px;
				}
				.voxel-fse-code-editor-control__editor .CodeMirror-lint-marker-error {
					color: #d63638;
				}
				.voxel-fse-code-editor-control__editor .CodeMirror-lint-marker-warning {
					color: #dba617;
				}
				/* Lint tooltip styling */
				.CodeMirror-lint-tooltip {
					background-color: #f5f5f5;
					border: 1px solid #d5d8dc;
					border-radius: 3px;
					padding: 6px 10px;
					font-size: 12px;
					font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
					max-width: 300px;
					z-index: 100000;
				}
				.CodeMirror-lint-message-error {
					color: #d63638;
				}
				.CodeMirror-lint-message-warning {
					color: #996800;
				}
			`}</style>
		</div>
	);
}
