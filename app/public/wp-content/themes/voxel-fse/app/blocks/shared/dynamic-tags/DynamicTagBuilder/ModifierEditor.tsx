/**
 * ModifierEditor Component
 *
 * Allows adding and configuring modifiers for a selected tag.
 *
 * @package MusicalWheel
 */

import React, { useState } from 'react';
import { Modifier, AppliedModifier } from './types';

interface ModifierEditorProps {
	modifiers: AppliedModifier[];
	availableModifiers: Modifier[];
	onUpdate: (modifiers: AppliedModifier[]) => void;
}

interface ModifierItemProps {
	modifier: AppliedModifier;
	modifierDef: Modifier | undefined;
	index: number;
	onUpdate: (index: number, modifier: AppliedModifier) => void;
	onRemove: (index: number) => void;
	isOpen: boolean;
	onToggle: (index: number) => void;
	onDragStart: (index: number) => void;
	onDragOver: (e: React.DragEvent, index: number) => void;
	onDrop: (index: number) => void;
}

const ModifierItem: React.FC<ModifierItemProps> = ({
	modifier,
	modifierDef,
	index,
	onUpdate,
	onRemove,
	isOpen,
	onToggle,
	onDragStart,
	onDragOver,
	onDrop,
}) => {
	if (!modifierDef) {
		return null;
	}

	const handleArgChange = (argIndex: number, value: string | number) => {
		const newArgs = [...modifier.args];
		newArgs[argIndex] = value;
		onUpdate(index, { ...modifier, args: newArgs });
	};

	const hasArgs = modifierDef.args && modifierDef.args.length > 0;

	return (
		<div
			className={`nvx-mod${isOpen ? ' mod-open' : ''}`}
			data-draggable="true"
			draggable={true}
			onDragStart={() => onDragStart(index)}
			onDragOver={(e) => onDragOver(e, index)}
			onDrop={() => onDrop(index)}
		>
			<div
				className="nvx-mod-title"
				onClick={() => onToggle(index)}
			>
				{modifierDef.label}
				<button
					type="button"
					className="ts-button ts-outline icon-only"
					onClick={(e) => {
						e.stopPropagation();
						onRemove(index);
					}}
					title="Remove modifier"
				>
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M9.5 2C9.08579 2 8.75 2.33579 8.75 2.75C8.75 3.16421 9.08579 3.5 9.5 3.5H14.5C14.9142 3.5 15.25 3.16421 15.25 2.75C15.25 2.33579 14.9142 2 14.5 2H9.5Z" fill="currentColor"/>
						<path d="M4 5C3.74924 5 3.51506 5.12533 3.37597 5.33397C3.23687 5.54262 3.21125 5.80699 3.3077 6.03846L4.44231 8.76154C4.4804 8.85294 4.5 8.95098 4.5 9.05V19.75C4.5 20.9926 5.50736 22 6.75 22H17.25C18.4926 22 19.5 20.9926 19.5 19.75V9.04978C19.5 8.95083 19.5196 8.85286 19.5576 8.76151L20.6914 6.03827C20.7878 5.8068 20.7621 5.54249 20.623 5.33389C20.4839 5.12529 20.2498 5 19.999 5H4ZM10.75 10.5V16.5C10.75 16.9142 10.4142 17.25 10 17.25C9.58579 17.25 9.25 16.9142 9.25 16.5V10.5C9.25 10.0858 9.58579 9.75 10 9.75C10.4142 9.75 10.75 10.0858 10.75 10.5ZM14.75 10.5V16.5C14.75 16.9142 14.4142 17.25 14 17.25C13.5858 17.25 13.25 16.9142 13.25 16.5V10.5C13.25 10.0858 13.5858 9.75 14 9.75C14.4142 9.75 14.75 10.0858 14.75 10.5Z" fill="currentColor"/>
					</svg>
				</button>
			</div>
			{isOpen && (
				<div className="nvx-mod-content">
					{hasArgs ? (
						modifierDef.args!.map((arg, argIndex) => (
							<div key={argIndex} className="ts-form-group">
								<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
									<label style={{ margin: 0 }}>{arg.label}</label>
									{arg.description && (
										<span className="vx-info-box">
											<svg width="80" height="80" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
												<path d="M2 12.3906C2 6.86778 6.47715 2.39062 12 2.39062C17.5228 2.39062 22 6.86778 22 12.3906C22 17.9135 17.5228 22.3906 12 22.3906C6.47715 22.3906 2 17.9135 2 12.3906ZM11.9993 9.96045C12.4964 9.96045 12.9001 9.5575 12.9001 9.06045C12.9001 8.56339 12.4971 8.16045 12.0001 8.16045C11.503 8.16045 11.0993 8.56339 11.0993 9.06045C11.0993 9.5575 11.5023 9.96045 11.9993 9.96045ZM11.2501 15.8298C11.2501 16.244 11.5859 16.5798 12.0001 16.5798C12.4143 16.5798 12.7501 16.244 12.7501 15.8298V11.6054C12.7501 11.1912 12.4143 10.8554 12.0001 10.8554C11.5858 10.8554 11.2501 11.1912 11.2501 11.6054V15.8298Z" fill="#343C54"/>
											</svg>
											<p>{arg.description}</p>
										</span>
									)}
								</div>
								{arg.type === 'select' ? (
									<select
										value={modifier.args[argIndex] as string || arg.default as string || ''}
										onChange={(e) => handleArgChange(argIndex, e.target.value)}
									>
										{arg.options?.map((opt: any) => (
											<option key={opt.value} value={opt.value}>
												{opt.label}
											</option>
										))}
									</select>
								) : arg.type === 'number' ? (
									<input
										type="number"
										value={modifier.args[argIndex]?.toString() || arg.default?.toString() || ''}
										onChange={(e) => handleArgChange(argIndex, parseInt(e.target.value, 10) || 0)}
									/>
								) : (
									<input
										type="text"
										value={modifier.args[argIndex] as string || arg.default as string || ''}
										onChange={(e) => handleArgChange(argIndex, e.target.value)}
									/>
								)}
							</div>
						))
					) : (
						<div className="ts-form-group">
							<p>No additional settings.</p>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

interface ModifierEditorPropsExtended extends ModifierEditorProps {
	currentTag?: {
		group: string;
		property: string;
		breadcrumb?: string;
	};
}

export const ModifierEditor: React.FC<ModifierEditorPropsExtended> = ({
	modifiers,
	availableModifiers,
	onUpdate,
	currentTag,
}) => {
	const [selectedModifier, setSelectedModifier] = useState<string>('');
	const [openPanels, setOpenPanels] = useState<Set<number>>(new Set());
	const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

	// Voxel pattern: Auto-add on selection (no "Add" button)
	const handleModifierSelect = (modifierKey: string) => {
		if (!modifierKey) {
			setSelectedModifier('');
			return;
		}

		const modifierDef = allModifiers.find(m => m.key === modifierKey);
		if (!modifierDef) {
			setSelectedModifier('');
			return;
		}

		const newModifier: AppliedModifier = {
			key: modifierKey,
			args: modifierDef.args?.map(arg => arg.default || '') || [],
		};

		onUpdate([...modifiers, newModifier]);

		// Reset dropdown to placeholder (Voxel pattern)
		setSelectedModifier('');
	};

	const handleUpdateModifier = (index: number, modifier: AppliedModifier) => {
		const newModifiers = [...modifiers];
		newModifiers[index] = modifier;
		onUpdate(newModifiers);
	};

	const handleRemoveModifier = (index: number) => {
		const newModifiers = modifiers.filter((_, i) => i !== index);
		// Update open panels - remove deleted index and adjust remaining indices
		const newOpenPanels = new Set<number>();
		openPanels.forEach(i => {
			if (i < index) newOpenPanels.add(i);
			else if (i > index) newOpenPanels.add(i - 1);
		});
		setOpenPanels(newOpenPanels);
		onUpdate(newModifiers);
	};

	const handleTogglePanel = (index: number) => {
		// Voxel pattern: Close all panels, then open clicked one
		// If clicking already-open panel, just close it
		if (openPanels.has(index)) {
			setOpenPanels(new Set());
		} else {
			setOpenPanels(new Set([index]));
		}
	};

	const handleDragStart = (index: number) => {
		setDraggedIndex(index);
	};

	const handleDragOver = (e: React.DragEvent, _index: number) => {
		e.preventDefault(); // Required to allow drop
	};

	const handleDrop = (dropIndex: number) => {
		if (draggedIndex === null || draggedIndex === dropIndex) {
			setDraggedIndex(null);
			return;
		}

		const newModifiers = [...modifiers];
		const [draggedItem] = newModifiers.splice(draggedIndex, 1);
		newModifiers.splice(dropIndex, 0, draggedItem);

		// Update open panels to reflect new indices
		const newOpenPanels = new Set<number>();
		openPanels.forEach(i => {
			if (i === draggedIndex) {
				newOpenPanels.add(dropIndex);
			} else if (i > draggedIndex && i <= dropIndex) {
				newOpenPanels.add(i - 1);
			} else if (i < draggedIndex && i >= dropIndex) {
				newOpenPanels.add(i + 1);
			} else {
				newOpenPanels.add(i);
			}
		});
		setOpenPanels(newOpenPanels);

		onUpdate(newModifiers);
		setDraggedIndex(null);
	};

	// Group modifiers by category
	// Evidence: Voxel UI has 5 categories: text, number, date, other, control
	const categoryOrder = ['text', 'number', 'date', 'other', 'control'];
	const categoryLabels: Record<string, string> = {
		text: 'Text',
		number: 'Number',
		date: 'Date',
		other: 'Other',
		control: 'Conditionals'
	};

	// Debug: Log availableModifiers to inspect structure
	console.log('[ModifierEditor] Available modifiers:', availableModifiers);
	console.log('[ModifierEditor] First modifier:', availableModifiers[0]);
	console.log('[ModifierEditor] Current tag:', currentTag);

	// Add group methods to modifiers based on current tag's group
	// Evidence: themes/voxel/app/dynamic-data/data-groups/*/methods()
	const getGroupMethods = (group: string): Modifier[] => {
		const methods: Record<string, Modifier[]> = {
			'post': [
				{ key: 'meta', label: 'Post meta', category: 'other', args: [{ type: 'text', label: 'Meta key', default: '' }] }
			],
			'author': [
				{ key: 'meta', label: 'User meta', category: 'other', args: [{ type: 'text', label: 'Meta key', default: '' }] }
			],
			'user': [
				{ key: 'meta', label: 'User meta', category: 'other', args: [{ type: 'text', label: 'Meta key', default: '' }] }
			],
			'site': [
				{ key: 'query_var', label: 'Query variable', category: 'other', args: [{ type: 'text', label: 'Variable name', default: '' }] },
				{ key: 'math', label: 'Math expression', category: 'other', args: [{ type: 'text', label: 'Math expression', default: '' }] }
			]
		};
		return methods[group] || [];
	};

	// Combine regular modifiers with group methods for current tag
	const allModifiers = currentTag
		? [...availableModifiers, ...getGroupMethods(currentTag.group)]
		: availableModifiers;

	// Group modifiers by category
	// Evidence: Voxel excludes 'then' and 'else' from dropdown (they're only in autocomplete)
	const modifiersByCategory = allModifiers.reduce((acc, m) => {
		// Ensure we have a valid modifier object
		if (!m || typeof m.key !== 'string') {
			console.warn('[ModifierEditor] Invalid modifier object:', m);
			return acc;
		}

		// Exclude 'then' and 'else' from dropdown (autocomplete-only modifiers)
		if (m.key === 'then' || m.key === 'else') {
			return acc;
		}

		const category = m.category || 'other';
		if (!acc[category]) {
			acc[category] = [];
		}
		acc[category].push(m);
		return acc;
	}, {} as Record<string, typeof availableModifiers>);

	console.log('[ModifierEditor] Modifiers by category:', modifiersByCategory);

	// Parse breadcrumb into individual spans (Voxel pattern)
	const renderBreadcrumb = () => {
		if (!currentTag?.breadcrumb) return null;

		const parts = currentTag.breadcrumb.split(' / ');
		const elements: React.ReactNode[] = [];

		parts.forEach((part, index) => {
			elements.push(<span key={`part-${index}`}>{part}</span>);
			if (index < parts.length - 1) {
				elements.push(<span key={`sep-${index}`}> / </span>);
			}
		});

		return elements;
	};

	// VOXEL HTML STRUCTURE - Direct children of nvx-right-sidebar
	return (
		<>
			{/* Tag header - Voxel structure */}
			<div className="mod-head">
				<h3>{currentTag?.property
					? (() => {
						const p = currentTag.property.startsWith(':') ? currentTag.property.slice(1) : currentTag.property;
						return p.charAt(0).toUpperCase() + p.slice(1).replace(/_/g, ' ');
					})()
					: 'Select a tag'
				}</h3>
				<div className="nvx-placeholder nvx-tag-path">
					{renderBreadcrumb()}
				</div>
			</div>

			{/* Modifier selector dropdown - Voxel structure: direct ts-form-group */}
			<div className="ts-form-group">
				<select
					value={selectedModifier}
					onChange={(e) => handleModifierSelect(e.target.value)}
					disabled={!currentTag}
				>
					<option value="" disabled>Add a mod</option>
					{categoryOrder.map((category) => {
						if (!modifiersByCategory[category]) return null;
						return (
							<optgroup key={category} label={categoryLabels[category]}>
								{modifiersByCategory[category].map((mod) => {
									// Ensure key is a string for the value attribute
									const keyValue = typeof mod.key === 'string' ? mod.key : String(mod.key || '');
									console.log('[ModifierEditor] Rendering modifier:', { key: mod.key, keyValue, label: mod.label });
									return (
										<option key={keyValue} value={keyValue}>
											{mod.label}
										</option>
									);
								})}
							</optgroup>
						);
					})}
				</select>
			</div>

			{/* Voxel divider */}
			{modifiers.length > 0 && <div className="nvx-divider"></div>}

			{/* Modifier list - Voxel structure */}
			{modifiers.length > 0 && (
				<div className="nvx-mod-list">
					{modifiers.map((modifier, index) => {
						const modifierDef = allModifiers.find(m => m.key === modifier.key);
						return (
							<ModifierItem
								key={index}
								modifier={modifier}
								modifierDef={modifierDef}
								index={index}
								onUpdate={handleUpdateModifier}
								onRemove={handleRemoveModifier}
								isOpen={openPanels.has(index)}
								onToggle={handleTogglePanel}
								onDragStart={handleDragStart}
								onDragOver={handleDragOver}
								onDrop={handleDrop}
							/>
						);
					})}
				</div>
			)}
		</>
	);
};
