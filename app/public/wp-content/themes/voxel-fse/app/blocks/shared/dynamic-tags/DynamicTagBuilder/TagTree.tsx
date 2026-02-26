/**
 * TagTree Component
 *
 * React port of Voxel's `group-list` + `property-list` Vue components.
 *
 * Key architectural decisions (matching Voxel exactly):
 * - In NORMAL mode: accordion behavior (one group open, one child-group open per level)
 *   with lazy loading of children via onLoadChildren callback.
 * - In SEARCH mode: the parent passes a fully pre-filtered tree. The tree renders it
 *   with the first group auto-expanded recursively. No lazy loading.
 * - When search clears, the parent passes the original unfiltered groups.
 *   The component re-renders fresh with no stale state.
 *
 * Evidence: themes/voxel/assets/dist/dynamic-data.js (group-list, property-list components)
 * Evidence: themes/voxel/templates/backend/dynamic-data/_group-list.php
 *
 * @package MusicalWheel
 */

import React, { useState, useEffect, useCallback } from 'react';
import { DataGroup, TagExport } from './types';

// ─── Public API ────────────────────────────────────────────────

interface TagTreeProps {
	groups: DataGroup[];
	searchQuery: string;
	onSelectTag: (group: string, property: string, tagType?: string) => void;
	onLoadChildren?: (groupType: string, parent?: string) => Promise<any[]>;
}

// ─── PropertyList (mirrors Voxel's property-list component) ────

interface PropertyListProps {
	groupType: string;
	exports: TagExport[];
	parentPath: string;
	onSelectTag: (group: string, property: string, tagType?: string) => void;
	onLoadChildren?: (groupType: string, parent?: string) => Promise<any[]>;
	isSearchMode: boolean;
	/** In search mode, auto-expand the first group at each level */
	autoExpandFirst?: boolean;
}

const PropertyList: React.FC<PropertyListProps> = ({
	groupType,
	exports: propExports,
	parentPath,
	onSelectTag,
	onLoadChildren,
	isSearchMode,
	autoExpandFirst = false,
}) => {
	// Which sub-group key is open (accordion: only one at a time per level)
	const [openKey, setOpenKey] = useState<string>('');
	// Cache of lazily loaded children keyed by tag key
	const [loadedChildren, setLoadedChildren] = useState<Record<string, TagExport[]>>({});
	const [loadingKey, setLoadingKey] = useState<string>('');

	// In search mode with autoExpandFirst: mirrors Voxel's $nextTick recursive expand.
	// Voxel uses `:scope > ul > li.is-group:first-child > span` which means it ONLY
	// auto-expands if the FIRST child at this level is a group node. If the first child
	// is a leaf, the recursion stops (no auto-expand at this level).
	useEffect(() => {
		if (isSearchMode && autoExpandFirst && propExports.length > 0) {
			const firstExport = propExports[0];
			const firstIsGroup = firstExport &&
				(firstExport.type === 'object' || firstExport.type === 'object-list' || firstExport.type === 'object_list') &&
				(firstExport.hasChildren || (firstExport.children && firstExport.children.length > 0));
			if (firstIsGroup) {
				setOpenKey(firstExport.key);
			}
		}
	}, [isSearchMode, autoExpandFirst, propExports]);

	// Reset openKey when exports change (e.g., different group expanded, search changed)
	const exportsKey = propExports.map(e => e.key).join(',');
	useEffect(() => {
		if (!isSearchMode) {
			setOpenKey('');
		}
	}, [exportsKey, isSearchMode]);

	const toggleSubgroup = useCallback(async (tag: TagExport) => {
		// Accordion: close current, open clicked (or close if same)
		const newOpen = openKey === tag.key ? '' : tag.key;
		setOpenKey(newOpen);

		// Lazy load children if needed
		if (newOpen && tag.hasChildren && !loadedChildren[tag.key] && !(tag.children && tag.children.length > 0) && onLoadChildren) {
			const fullPath = parentPath ? `${parentPath}.${tag.key}` : `${groupType}.${tag.key}`;
			setLoadingKey(tag.key);
			try {
				const children = await onLoadChildren(groupType, `${groupType}.${fullPath.replace(`${groupType}.`, '')}`);
				setLoadedChildren(prev => ({ ...prev, [tag.key]: children || [] }));
			} catch (err) {
				console.error(`Failed to load children for ${tag.key}:`, err);
			} finally {
				setLoadingKey('');
			}
		}
	}, [isSearchMode, openKey, loadedChildren, onLoadChildren, groupType, parentPath]);

	const handleLeafClick = useCallback((tag: TagExport) => {
		const path = parentPath ? `${parentPath}.${tag.key}` : tag.key;
		onSelectTag(groupType, path, tag.type);
	}, [groupType, parentPath, onSelectTag]);

	return (
		<ul style={{ height: 'auto' }}>
			{propExports.map((tag) => {
				const isObject = tag.type === 'object' || tag.type === 'object-list' || tag.type === 'object_list';
				const hasChildren = isObject && (tag.hasChildren || (tag.children && tag.children.length > 0));

				if (hasChildren) {
					// Group/object node — openKey is set by user click or auto-expand useEffect
					const isOpen = openKey === tag.key;

					// Get children: prefer pre-resolved (search mode), then lazy-loaded, then inline
					const children = tag.children && tag.children.length > 0
						? tag.children
						: loadedChildren[tag.key] || [];

					const isLoading = loadingKey === tag.key;
					const childPath = parentPath ? `${parentPath}.${tag.key}` : tag.key;

					return (
						<li key={tag.key} className={`is-group${isOpen ? ' is-open' : ''}`}>
							<span onClick={() => toggleSubgroup(tag)}>{tag.label}</span>
							{isOpen && (
								isLoading ? (
									<ul style={{ height: 'auto' }}>
										<li className="mw-tag-item__loading">Loading...</li>
									</ul>
								) : children.length > 0 ? (
									<PropertyList
										groupType={groupType}
										exports={children}
										parentPath={childPath}
										onSelectTag={onSelectTag}
										onLoadChildren={onLoadChildren}
										isSearchMode={isSearchMode}
										autoExpandFirst={autoExpandFirst && isOpen}
									/>
								) : null
							)}
						</li>
					);
				} else {
					// Leaf node
					const isMethod = tag.type === 'method';
					return (
						<li key={tag.key}>
							<span
								draggable={true}
								onClick={() => handleLeafClick(tag)}
							>
								{isMethod && <i className="las la-code"></i>}
								{tag.label}
							</span>
						</li>
					);
				}
			})}
		</ul>
	);
};

// ─── GroupItem (mirrors a single group in Voxel's group-list) ──

interface GroupItemProps {
	group: DataGroup;
	isOpen: boolean;
	onToggle: () => void;
	onSelectTag: (group: string, property: string, tagType?: string) => void;
	onLoadChildren?: (groupType: string, parent?: string) => Promise<any[]>;
	isSearchMode: boolean;
	autoExpandFirst: boolean;
}

const GroupItem: React.FC<GroupItemProps> = ({
	group,
	isOpen,
	onToggle,
	onSelectTag,
	onLoadChildren,
	isSearchMode,
	autoExpandFirst,
}) => {
	const [localExports, setLocalExports] = useState<TagExport[]>(group.exports || []);
	const [isLoading, setIsLoading] = useState(false);

	// Sync exports from props (when parent changes groups, e.g., search results update)
	useEffect(() => {
		if (group.exports && group.exports.length > 0) {
			setLocalExports(group.exports);
		}
	}, [group.exports]);

	// Auto-load children when opened with no exports (normal mode lazy loading)
	useEffect(() => {
		if (isOpen && !isSearchMode && group.hasChildren && localExports.length === 0 && onLoadChildren && !isLoading) {
			(async () => {
				setIsLoading(true);
				try {
					const children = await onLoadChildren(group.type);
					setLocalExports(children);
				} catch (err) {
					console.error(`Failed to auto-load children for ${group.type}:`, err);
				} finally {
					setIsLoading(false);
				}
			})();
		}
	}, [isOpen, isSearchMode, group.hasChildren, group.type]);

	return (
		<li className={`is-group${isOpen ? ' is-open' : ''}`}>
			<span onClick={onToggle}>{group.label}</span>
			{isOpen && (
				isLoading ? (
					<ul style={{ height: 'auto' }}>
						<li className="mw-tag-group__loading">Loading...</li>
					</ul>
				) : localExports.length > 0 ? (
					<PropertyList
						groupType={group.type}
						exports={localExports}
						parentPath=""
						onSelectTag={onSelectTag}
						onLoadChildren={onLoadChildren}
						isSearchMode={isSearchMode}
						autoExpandFirst={autoExpandFirst}
					/>
				) : null
			)}
		</li>
	);
};

// ─── TagTree (mirrors Voxel's group-list component) ────────────

export const TagTree: React.FC<TagTreeProps> = ({ groups, searchQuery, onSelectTag, onLoadChildren }) => {
	// Which top-level group is open (accordion: one at a time)
	const [openGroupType, setOpenGroupType] = useState<string>('');

	const isSearchMode = searchQuery.trim() !== '';

	// When groups change: in search mode expand first group, in normal mode expand first group
	// This mirrors Voxel's behavior: getGroups() auto-expands first group via $nextTick click
	useEffect(() => {
		if (groups && groups.length > 0) {
			setOpenGroupType(groups[0].type);
		} else {
			setOpenGroupType('');
		}
	}, [groups]);

	const handleToggleGroup = useCallback((groupType: string) => {
		// Accordion: one group open at a time. Users CAN toggle in search mode.
		setOpenGroupType(prev => prev === groupType ? '' : groupType);
	}, []);

	if (!groups || groups.length === 0) {
		if (isSearchMode) {
			return (
				<div className="nvx-tagslist mw-tag-tree">
					<ul><li>No results</li></ul>
				</div>
			);
		}
		return (
			<div className="mw-tag-tree mw-tag-tree--empty">
				<p>No data groups available.</p>
			</div>
		);
	}

	return (
		<div className="nvx-tagslist mw-tag-tree">
			<ul>
				{groups.map((group, index) => (
					<GroupItem
						key={`${group.type}-${isSearchMode ? 's' : 'n'}`}
						group={group}
						isOpen={openGroupType === group.type}
						onToggle={() => handleToggleGroup(group.type)}
						onSelectTag={onSelectTag}
						onLoadChildren={onLoadChildren}
						isSearchMode={isSearchMode}
						autoExpandFirst={isSearchMode && index === 0}
					/>
				))}
			</ul>
		</div>
	);
};
