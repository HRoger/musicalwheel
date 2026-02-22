/**
 * TagTree Component
 *
 * Displays hierarchical tree of available dynamic tags grouped by data source.
 *
 * @package MusicalWheel
 */

import React, { useState, useEffect } from 'react';
import { DataGroup, TagExport } from './types';

interface TagTreeProps {
	groups: DataGroup[];
	searchQuery: string;
	onSelectTag: (group: string, property: string, tagType?: string) => void;
	onLoadChildren?: (groupType: string, parent?: string) => Promise<any[]>;
}

interface TagItemProps {
	group: string;
	tag: TagExport;
	level: number;
	searchQuery: string;
	onSelectTag: (group: string, property: string, tagType?: string) => void;
	onLoadChildren?: (groupType: string, parent?: string) => Promise<any[]>;
	parentPath?: string; // Accumulated path from root to this tag's parent
	expandedPath: string; // Path of currently expanded item at this level
	onExpandChange: (path: string) => void; // Callback when expansion changes
}

const TagItem: React.FC<TagItemProps> = ({
	group,
	tag,
	level,
	searchQuery,
	onSelectTag,
	onLoadChildren,
	parentPath = '',
	expandedPath,
	onExpandChange
}) => {
	const [isLoading, setIsLoading] = useState(false);
	const [localChildren, setLocalChildren] = useState<TagExport[]>(tag.children || []);
	const [childExpandedPath, setChildExpandedPath] = useState('');

	const hasChildren = tag.hasChildren || (tag.children && tag.children.length > 0);
	const needsLazyLoad = tag.hasChildren && !tag.isLoaded && localChildren.length === 0;

	// Build the full path to this tag
	const currentPath = parentPath ? `${parentPath}.${tag.key}` : tag.key;

	// Check if this item is expanded (accordion behavior)
	const isExpanded = expandedPath === currentPath;

	// Filter based on search query
	const matchesSearch = searchQuery === '' ||
		tag.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
		tag.key.toLowerCase().includes(searchQuery.toLowerCase());

	if (!matchesSearch && !hasChildren) {
		return null;
	}

	const handleToggle = async () => {
		if (hasChildren) {
			// Toggle: if already expanded, collapse; otherwise expand
			const willExpand = !isExpanded;

			if (willExpand) {
				// Notify parent to expand this item (and collapse siblings)
				onExpandChange(currentPath);

				// Lazy load if needed
				if (needsLazyLoad && onLoadChildren) {
					setIsLoading(true);
					try {
						const children = await onLoadChildren(group, `${group}.${currentPath}`);
						setLocalChildren(children);
					} catch (err) {
						console.error(`Failed to load children for ${tag.key}:`, err);
					} finally {
						setIsLoading(false);
					}
				}
			} else {
				// Collapse this item
				onExpandChange('');
			}
		} else {
			// Pass the FULL PATH from root to this leaf, including type for methods
			onSelectTag(group, currentPath, tag.type);
		}
	};

	// Build className with proper states
	const classNames = [];
	if (hasChildren) {
		classNames.push('is-group');
		if (isExpanded) classNames.push('is-open');
	}
	const className = classNames.join(' ');

	// Check if this is a method (Evidence: voxel/_group-list.php:69 uses <i class="las la-code"></i>)
	const isMethod = tag.type === 'method';

	return (
		<li className={className}>
			<span
				draggable={!hasChildren}
				onClick={handleToggle}
			>
				{isMethod && <i className="las la-code"></i>}
				{tag.label}
			</span>
			{hasChildren && isExpanded && (
				<ul style={{ height: 'auto' }}>
					{isLoading ? (
						<li className="mw-tag-item__loading">
							Loading...
						</li>
					) : (
						localChildren.map((child) => (
							<TagItem
								key={child.key}
								group={group}
								tag={child}
								level={level + 1}
								searchQuery={searchQuery}
								onSelectTag={onSelectTag}
								onLoadChildren={onLoadChildren}
								parentPath={currentPath}
								expandedPath={childExpandedPath}
								onExpandChange={setChildExpandedPath}
							/>
						))
					)}
				</ul>
			)}
		</li>
	);
};

interface GroupItemProps {
	group: DataGroup;
	searchQuery: string;
	onSelectTag: (group: string, property: string, tagType?: string) => void;
	onLoadChildren?: (groupType: string, parent?: string) => Promise<any[]>;
	expandedPath: string; // Path of currently expanded group
	onExpandChange: (path: string) => void; // Callback when expansion changes
}

const GroupItem: React.FC<GroupItemProps> = ({
	group,
	searchQuery,
	onSelectTag,
	onLoadChildren,
	expandedPath,
	onExpandChange
}) => {
	const [isLoading, setIsLoading] = useState(false);
	const [localExports, setLocalExports] = useState<TagExport[]>(group.exports || []);
	const [childExpandedPath, setChildExpandedPath] = useState('');

	// Check if this group is expanded
	const isExpanded = expandedPath === group.type;

	// Auto-load children when expanded with no children (handles default-expanded state)
	useEffect(() => {
		if (isExpanded && group.hasChildren && localExports.length === 0 && onLoadChildren && !isLoading) {
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
	}, [isExpanded]);

	const handleToggle = async () => {
		// Toggle: if already expanded, collapse; otherwise expand
		const willExpand = !isExpanded;

		if (willExpand) {
			// Notify parent to expand this group (and collapse siblings)
			onExpandChange(group.type);

			// Lazy load if needed
			if (group.hasChildren && localExports.length === 0 && onLoadChildren) {
				setIsLoading(true);
				try {
					const children = await onLoadChildren(group.type);
					setLocalExports(children);
				} catch (err) {
					console.error(`Failed to load children for ${group.type}:`, err);
				} finally {
					setIsLoading(false);
				}
			}
		} else {
			// Collapse this group
			onExpandChange('');
		}
	};

	// Build className with proper states
	const classNames = ['is-group'];
	if (isExpanded) classNames.push('is-open');
	const className = classNames.join(' ');

	return (
		<li className={className}>
			<span onClick={handleToggle}>
				{group.label}
			</span>
			{isExpanded && (
				<ul style={{ height: 'auto' }}>
					{isLoading ? (
						<li className="mw-tag-group__loading">Loading...</li>
					) : (
						localExports.map((tag) => (
							<TagItem
								key={tag.key}
								group={group.type}
								tag={tag}
								level={0}
								searchQuery={searchQuery}
								onSelectTag={onSelectTag}
								onLoadChildren={onLoadChildren}
								expandedPath={childExpandedPath}
								onExpandChange={setChildExpandedPath}
							/>
						))
					)}
				</ul>
			)}
		</li>
	);
};

export const TagTree: React.FC<TagTreeProps> = ({ groups, searchQuery, onSelectTag, onLoadChildren }) => {
	// Track which top-level group is expanded (accordion behavior)
	// First group is expanded by default
	const [expandedGroup, setExpandedGroup] = useState<string>(
		groups && groups.length > 0 ? groups[0].type : ''
	);

	// Reset expanded group only when the set of group types actually changes
	// (e.g., context switched from post to term).  We derive a stable key from
	// the group types so that new array references with the same content don't
	// trigger a reset — which was causing the flicker/double-click bug.
	const groupTypesKey = groups?.map((g) => g.type).join(',') ?? '';
	useEffect(() => {
		if (groups && groups.length > 0) {
			setExpandedGroup(groups[0].type);
		}
	}, [groupTypesKey]);

	if (!groups || groups.length === 0) {
		return (
			<div className="mw-tag-tree mw-tag-tree--empty">
				<p>No data groups available.</p>
			</div>
		);
	}

	return (
		<div className="nvx-tagslist mw-tag-tree">
			<ul>
				{groups.map((group) => (
					<GroupItem
						key={group.type}
						group={group}
						searchQuery={searchQuery}
						onSelectTag={onSelectTag}
						onLoadChildren={onLoadChildren}
						expandedPath={expandedGroup}
						onExpandChange={setExpandedGroup}
					/>
				))}
			</ul>
		</div>
	);
};
