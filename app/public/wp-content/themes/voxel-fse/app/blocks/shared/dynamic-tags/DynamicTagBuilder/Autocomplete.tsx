/**
 * Autocomplete Component
 *
 * Shows autocomplete suggestions when typing @ or . in the code editor.
 *
 * @package MusicalWheel
 */

import React, { useState, useEffect, useRef } from 'react';
import { DataGroup, TagExport, Modifier } from './types';

interface AutocompleteProps {
	visible: boolean;
	position: { top: number; left: number };
	items: AutocompleteItem[];
	selectedIndex: number;
	onSelect: (item: AutocompleteItem) => void;
	onClose: () => void;
}

export interface AutocompleteItem {
	type: 'group' | 'property' | 'modifier';
	key: string;
	label: string;
	description?: string;
	group?: string; // For properties
	valueType?: string; // For properties
}

export const Autocomplete: React.FC<AutocompleteProps> = ({
	visible,
	position,
	items,
	selectedIndex,
	onSelect,
	onClose,
}) => {
	const listRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (visible && listRef.current) {
			const selectedItem = listRef.current.children[selectedIndex] as HTMLElement;
			if (selectedItem) {
				selectedItem.scrollIntoView({ block: 'nearest' });
			}
		}
	}, [selectedIndex, visible]);

	if (!visible || items.length === 0) {
		return null;
	}

	return (
		<div
			className="mw-autocomplete"
			style={{
				position: 'absolute',
				top: `${position.top + 20}px`,
				left: `${position.left}px`,
				zIndex: 10000,
			}}
		>
			<div className="mw-autocomplete__list" ref={listRef}>
				{items.map((item, index) => (
					<div
						key={item.key}
						className={`mw-autocomplete__item ${index === selectedIndex ? 'mw-autocomplete__item--selected' : ''}`}
						onClick={() => onSelect(item)}
						onMouseEnter={() => {
							// Could update selectedIndex on hover
						}}
					>
						<div className="mw-autocomplete__item-label">
							{item.label}
							{item.valueType && (
								<span className="mw-autocomplete__item-type">{item.valueType}</span>
							)}
						</div>
						{item.description && (
							<div className="mw-autocomplete__item-description">
								{item.description}
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
};

/**
 * Build autocomplete items for data groups
 */
export function buildGroupItems(groups: DataGroup[]): AutocompleteItem[] {
	return groups.map(group => ({
		type: 'group',
		key: group.type,
		label: `@${group.type}`,
		description: group.label,
	}));
}

/**
 * Build autocomplete items for properties
 */
export function buildPropertyItems(group: DataGroup, searchQuery: string = ''): AutocompleteItem[] {
	const items: AutocompleteItem[] = [];

	function addProperties(exports: TagExport[], prefix: string = '') {
		for (const tag of exports) {
			const fullKey = prefix ? `${prefix}.${tag.key}` : tag.key;

			// Filter by search query
			if (searchQuery && !tag.label.toLowerCase().includes(searchQuery.toLowerCase()) &&
				!fullKey.toLowerCase().includes(searchQuery.toLowerCase())) {
				continue;
			}

			items.push({
				type: 'property',
				key: fullKey,
				label: tag.label,
				valueType: tag.type,
				group: group.type,
			});

			// Add nested properties
			if (tag.children && tag.children.length > 0) {
				addProperties(tag.children, fullKey);
			}
		}
	}

	addProperties(group.exports);
	return items;
}

/**
 * Build autocomplete items for modifiers
 */
export function buildModifierItems(modifiers: Modifier[], searchQuery: string = ''): AutocompleteItem[] {
	return modifiers
		.filter(mod => {
			if (!searchQuery) return true;
			return mod.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
				mod.key.toLowerCase().includes(searchQuery.toLowerCase());
		})
		.map(mod => ({
			type: 'modifier',
			key: mod.key,
			label: `.${mod.key}`,
			description: `${mod.label} (${mod.category})`,
		}));
}
