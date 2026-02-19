/**
 * LoopElementModal Component
 *
 * Modal for selecting loop source - matches Voxel's "Select loop source" modal.
 * Uses expandable modules with nested loopable properties and "Use loop" buttons.
 * Renders directly without WordPress Modal wrapper to use Voxel's backend.css styling.
 *
 * Evidence:
 * - Voxel template: themes/voxel/templates/backend/dynamic-data/mode-edit-loop/edit-loop.php
 * - Loop sources: themes/voxel/app/utils/utils.php lines 84-96
 * - Post data group: themes/voxel/app/dynamic-data/data-groups/post/post-data-group.php
 * - User data group: themes/voxel/app/dynamic-data/data-groups/user/user-data-group.php
 * - Visit stats: themes/voxel/app/dynamic-data/data-groups/post/visits-data.php
 *
 * @package VoxelFSE
 */

// @ts-nocheck - WordPress types incomplete
import { __ } from '@wordpress/i18n';
import { useState, useEffect } from 'react';

export interface LoopConfig {
	loopSource: string;
	loopLimit: string | number;
	loopOffset: string | number;
	loopProperty?: string;
}

interface LoopElementModalProps {
	isOpen: boolean;
	onClose: () => void;
	config: LoopConfig;
	onSave: (config: LoopConfig) => void;
}

/**
 * Loopable property definition.
 * Matches Voxel's property structure where:
 * - type 'object-list' = directly loopable (shows "Use loop" button)
 * - type 'object' with children = expandable container (shows arrow to drill down)
 */
interface LoopableProperty {
	key: string;
	label: string;
	type: 'object-list' | 'object';
	children?: LoopableProperty[];
}

/**
 * Loop source module definition.
 * Matches Voxel's render groups from utils.php lines 89-95.
 */
interface LoopModule {
	key: string;
	label: string;
	properties: LoopableProperty[];
}

/**
 * Visit stats loopable properties - shared between Post, User/Author, and Site groups.
 * Evidence: themes/voxel/app/dynamic-data/data-groups/post/visits-data.php lines 49-258
 */
const visitStatsProperties: LoopableProperty[] = [
	{ key: 'countries', label: __('Top countries', 'voxel-fse'), type: 'object-list' },
	{ key: 'ref_domains', label: __('Top referrers (domains)', 'voxel-fse'), type: 'object-list' },
	{ key: 'ref_urls', label: __('Top referrers (URLs)', 'voxel-fse'), type: 'object-list' },
	{ key: 'browsers', label: __('Top browsers', 'voxel-fse'), type: 'object-list' },
	{ key: 'platforms', label: __('Top platforms', 'voxel-fse'), type: 'object-list' },
	{ key: 'devices', label: __('Devices', 'voxel-fse'), type: 'object-list' },
];

/**
 * All available loop source modules.
 *
 * Post: visit_stats sub-properties are always loopable. Field-based loops
 * (taxonomy, relation, repeater, multiselect, file fields) are dynamic per
 * post type and resolved at render time by the PHP loop processor.
 *
 * Author/User: role is the only directly loopable property.
 */
const loopModules: LoopModule[] = [
	{
		key: 'post',
		label: __('Post', 'voxel-fse'),
		properties: [
			{
				key: 'visit_stats',
				label: __('Visit stats', 'voxel-fse'),
				type: 'object',
				children: visitStatsProperties,
			},
		],
	},
	{
		key: 'author',
		label: __('Author', 'voxel-fse'),
		properties: [
			{ key: 'role', label: __('Role', 'voxel-fse'), type: 'object-list' },
		],
	},
	{
		key: 'user',
		label: __('User', 'voxel-fse'),
		properties: [
			{ key: 'role', label: __('Role', 'voxel-fse'), type: 'object-list' },
		],
	},
];

/**
 * Recursive component for rendering loopable properties.
 * Matches Voxel's <loopable-property-list> Vue component from edit-loop.php lines 52-82.
 */
function LoopablePropertyList({
	properties,
	path,
	groupKey,
	onSelect,
}: {
	properties: LoopableProperty[];
	path: string[];
	groupKey: string;
	onSelect: (source: string, property: string) => void;
}) {
	const [activeProperty, setActiveProperty] = useState<string | null>(null);

	// Arrow down SVG icon for expand button
	const arrowDownIcon = (
		<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
			<path d="M6.75002 2.74951C6.75002 2.3353 7.08581 1.99951 7.50002 1.99951H16.5C16.9142 1.99951 17.25 2.3353 17.25 2.74951C17.25 3.16373 16.9142 3.49951 16.5 3.49951H12.752L12.752 15.8752H16.625C16.9284 15.8752 17.2019 16.0579 17.318 16.3383C17.434 16.6186 17.3698 16.9412 17.1552 17.1557L12.5791 21.7286C12.4415 21.8941 12.234 21.9995 12.002 21.9995C11.7881 21.9995 11.5951 21.91 11.4585 21.7664L6.84486 17.1557C6.63026 16.9412 6.56601 16.6186 6.68207 16.3383C6.79812 16.0579 7.07163 15.8752 7.37502 15.8752H11.252L11.252 3.49951H7.50002C7.08581 3.49951 6.75002 3.16373 6.75002 2.74951Z" fill="#343C54" />
		</svg>
	);

	return (
		<>
			{properties.map((property) => {
				const isExpanded = activeProperty === property.key;
				const propertyPath = [...path, property.key].join('.');

				return (
					<div key={property.key} className={`nvx-mod ${isExpanded ? 'mod-open' : ''}`}>
						<div
							className="nvx-mod-title"
							onClick={(e) => {
								e.preventDefault();
								setActiveProperty(isExpanded ? null : property.key);
							}}
						>
							{property.label}
							<div className="nvx-mod-actions">
								{property.type === 'object' && property.children && (
									<a
										href="#"
										className="ts-button ts-outline icon-only"
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											setActiveProperty(isExpanded ? null : property.key);
										}}
									>
										{arrowDownIcon}
									</a>
								)}
								{property.type === 'object-list' && (
									<a
										className="ts-button ts-outline"
										href="#"
										style={{ width: 'auto' }}
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											onSelect(groupKey, propertyPath);
										}}
									>
										{__('Use loop', 'voxel-fse')}
									</a>
								)}
							</div>
						</div>
						{isExpanded && property.type === 'object' && property.children && (
							<div className="nvx-mod-content">
								<LoopablePropertyList
									properties={property.children}
									path={[...path, property.key]}
									groupKey={groupKey}
									onSelect={onSelect}
								/>
							</div>
						)}
					</div>
				);
			})}
		</>
	);
}

export default function LoopElementModal({
	isOpen,
	onClose,
	config,
	onSave,
}: LoopElementModalProps) {
	const [expandedModule, setExpandedModule] = useState<string | null>(null);

	// Reset expanded state when modal opens
	useEffect(() => {
		if (isOpen) {
			setExpandedModule(null);
		}
	}, [isOpen]);

	// Dynamically load Voxel's backend.css when modal opens
	useEffect(() => {
		if (!isOpen) return;

		const styleId = 'voxel-backend-css-dynamic';

		// Check if already loaded
		if (document.getElementById(styleId)) return;

		// Create link element to load Voxel's backend.css
		const link = document.createElement('link');
		link.id = styleId;
		link.rel = 'stylesheet';
		link.href = '/wp-content/themes/voxel/assets/dist/backend.css';
		document.head.appendChild(link);
	}, [isOpen]);

	const handleSelectLoop = (source: string, property: string) => {
		onSave({
			...config,
			loopSource: source,
			loopProperty: property,
		});
		onClose();
	};

	// Don't render if not open
	if (!isOpen) {
		return null;
	}

	// Arrow down SVG icon for expand button
	const arrowDownIcon = (
		<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
			<path d="M6.75002 2.74951C6.75002 2.3353 7.08581 1.99951 7.50002 1.99951H16.5C16.9142 1.99951 17.25 2.3353 17.25 2.74951C17.25 3.16373 16.9142 3.49951 16.5 3.49951H12.752L12.752 15.8752H16.625C16.9284 15.8752 17.2019 16.0579 17.318 16.3383C17.434 16.6186 17.3698 16.9412 17.1552 17.1557L12.5791 21.7286C12.4415 21.8941 12.234 21.9995 12.002 21.9995C11.7881 21.9995 11.5951 21.91 11.4585 21.7664L6.84486 17.1557C6.63026 16.9412 6.56601 16.6186 6.68207 16.3383C6.79812 16.0579 7.07163 15.8752 7.37502 15.8752H11.252L11.252 3.49951H7.50002C7.08581 3.49951 6.75002 3.16373 6.75002 2.74951Z" fill="#343C54" />
		</svg>
	);

	return (
		<div id="vx-dynamic-data" data-v-app="">
			<div className="nvx-editor nvx-editor-loop">
				{/* Top bar */}
				<div className="nvx-topbar">
					<div className="nvx-topbar__title nvx-flex nvx-v-center">
						<h2>{__('Select loop source', 'voxel-fse')}</h2>
					</div>
					<div className="nvx-topbar__buttons nvx-flex nvx-v-center">
						<button
							type="button"
							className="ts-button ts-outline"
							onClick={onClose}
						>
							{__('Discard', 'voxel-fse')}
						</button>
					</div>
				</div>

				{/* Editor body */}
				<div className="nvx-editor-body">
					<div className="nvx-scrollable nvx-loops">
						<div className="nvx-loops-container">
							<div className="nvx-mod-list">
								{loopModules.map((module) => {
									const isExpanded = expandedModule === module.key;

									return (
										<div key={module.key} className={`nvx-mod ${isExpanded ? 'mod-open' : ''}`}>
											<div
												className="nvx-mod-title"
												onClick={(e) => {
													e.preventDefault();
													setExpandedModule(isExpanded ? null : module.key);
												}}
											>
												{module.label}
												<div className="nvx-mod-actions">
													<a
														href="#"
														className="ts-button ts-outline icon-only"
														onClick={(e) => {
															e.preventDefault();
															e.stopPropagation();
															setExpandedModule(isExpanded ? null : module.key);
														}}
													>
														{arrowDownIcon}
													</a>
												</div>
											</div>
											{isExpanded && (
												<div className="nvx-mod-content">
													<LoopablePropertyList
														properties={module.properties}
														path={[]}
														groupKey={module.key}
														onSelect={handleSelectLoop}
													/>
												</div>
											)}
										</div>
									);
								})}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
