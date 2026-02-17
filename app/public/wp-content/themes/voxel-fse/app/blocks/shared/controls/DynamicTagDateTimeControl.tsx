/**
 * Dynamic Tag DateTime Control Component
 *
 * Matches Elementor/Voxel's datetime control pattern:
 * - Shows text input with datetime value (format: YYYY-MM-DD HH:mm:ss)
 * - Flatpickr calendar popup when clicking input
 * - Voxel icon button to enable dynamic tags
 * - When tags active, shows dark panel with EDIT/DISABLE buttons
 *
 * Evidence:
 * - Elementor DATE_TIME: themes/voxel/app/widgets/countdown.php:41
 * - Voxel dynamic tags: themes/voxel/assets/src/js/backend/elementor.js
 */

import { useState, useEffect, useRef } from 'react';
import { __ } from '@wordpress/i18n';
import { DynamicTagBuilder } from '../../shared/dynamic-tags';
import EnableTagsButton from './EnableTagsButton';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

interface DynamicTagDateTimeControlProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	help?: string;
	context?: string;
}

export default function DynamicTagDateTimeControl({
	label,
	value,
	onChange,
	placeholder = 'YYYY-MM-DD HH:mm:ss',
	help,
	context = 'post',
}: DynamicTagDateTimeControlProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const flatpickrInstance = useRef<flatpickr.Instance | null>(null);

	// Check if value contains dynamic tags (wrapped with @tags())
	const hasDynamicTags = () => {
		return typeof value === 'string' && value.startsWith('@tags()') && value.includes('@endtags()');
	};

	// Extract the tag content (remove @tags() wrapper)
	const getTagContent = () => {
		if (!hasDynamicTags()) return value || '';

		const match = value.match(/@tags\(\)(.*?)@endtags\(\)/s);
		return match ? match[1] : value;
	};

	// Wrap content with @tags() markers
	const wrapWithTags = (content: string) => {
		if (!content) return '';
		return `@tags()${content}@endtags()`;
	};

	// Enable tags - open modal
	const handleEnableTags = () => {
		setIsModalOpen(true);
	};

	// Edit tags - open modal with existing tag content
	const handleEditTags = () => {
		setIsModalOpen(true);
	};

	// Disable tags - clear the input field
	const handleDisableTags = () => {
		if (window.confirm(__('Are you sure?', 'voxel-fse'))) {
			onChange('');
		}
	};

	// Handle modal save
	const handleModalSave = (newValue: string) => {
		if (newValue) {
			onChange(wrapWithTags(newValue));
		}
		setIsModalOpen(false);
	};

	// Format date for display
	const formatDateForInput = (dateStr: string): string => {
		if (!dateStr || hasDynamicTags()) return dateStr;

		// Try to parse and format the date
		try {
			const date = new Date(dateStr);
			if (isNaN(date.getTime())) return dateStr;

			// Format as YYYY-MM-DD HH:mm:ss
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, '0');
			const day = String(date.getDate()).padStart(2, '0');
			const hours = String(date.getHours()).padStart(2, '0');
			const minutes = String(date.getMinutes()).padStart(2, '0');
			const seconds = String(date.getSeconds()).padStart(2, '0');

			return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
		} catch {
			return dateStr;
		}
	};

	const isTagsActive = hasDynamicTags();
	const displayValue = hasDynamicTags() ? value : formatDateForInput(value);

	// Initialize flatpickr when not in tag mode
	useEffect(() => {
		if (!inputRef.current || isTagsActive) {
			// Destroy flatpickr if tags are active
			if (flatpickrInstance.current) {
				flatpickrInstance.current.destroy();
				flatpickrInstance.current = null;
			}
			return;
		}

		// Initialize flatpickr with datetime
		flatpickrInstance.current = flatpickr(inputRef.current, {
			enableTime: true,
			enableSeconds: true,
			dateFormat: 'Y-m-d H:i:S',
			time_24hr: true,
			defaultDate: value || undefined,
			onChange: (selectedDates, dateStr) => {
				onChange(dateStr);
			},
		});

		return () => {
			if (flatpickrInstance.current) {
				flatpickrInstance.current.destroy();
				flatpickrInstance.current = null;
			}
		};
	}, [isTagsActive, value, onChange]);

	return (
		<div className="voxel-dynamic-tag-datetime-control" style={{ marginBottom: '16px' }}>
			{/* Label with Voxel icon button */}
			<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
				<EnableTagsButton onClick={handleEnableTags} />
				<label style={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', color: '#1e1e1e', margin: 0 }}>
					{label}
				</label>
			</div>

			{/* DateTime input CSS */}
			<style>{`
				.voxel-dynamic-tag-datetime-control .datetime-text-input {
					width: 100%;
					padding: 8px;
					border: 1px solid #949494;
					border-radius: 2px;
					font-size: 13px;
					line-height: 1.4;
					background: #fff;
					color: #1e1e1e;
				}
				.voxel-dynamic-tag-datetime-control .datetime-text-input:focus {
					border-color: var(--vxfse-accent-color, #3858e9);
					box-shadow: 0 0 0 1px var(--vxfse-accent-color, #3858e9);
					outline: none;
				}
				.voxel-dynamic-tag-datetime-control .datetime-text-input::placeholder {
					color: #757575;
				}
			`}</style>

			{/* Text input or tag preview panel */}
			<div>
				{!isTagsActive ? (
					<>
						<input
							ref={inputRef}
							type="text"
							className="datetime-text-input"
							defaultValue={displayValue || ''}
							placeholder={placeholder}
							autoComplete="off"
						/>
						{help && (
							<p className="components-base-control__help" style={{ marginTop: '8px', fontSize: '12px', color: '#757575' }}>
								{help}
							</p>
						)}
					</>
				) : (
					<div className="edit-voxel-tags" style={{
						backgroundColor: 'rgb(47, 47, 49)',
						borderRadius: '10px',
						overflow: 'hidden',
						padding: '12px',
					}}>
						{/* Tag content row */}
						<div style={{ marginBottom: '12px' }}>
							<span style={{
								color: '#fff',
								fontSize: '13px',
								fontFamily: 'inherit',
								wordBreak: 'break-all',
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
				)}
			</div>

			{/* Dynamic Tag Builder Modal */}
			{isModalOpen && (
				<DynamicTagBuilder
					value={getTagContent()}
					onChange={handleModalSave}
					label={label}
					context={context}
					onClose={() => setIsModalOpen(false)}
					autoOpen={true}
				/>
			)}
		</div>
	);
}
