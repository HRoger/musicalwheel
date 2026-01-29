/**
 * LoopElementModal Component
 *
 * Modal for selecting loop source - matches Voxel's "Select loop source" modal.
 * Uses expandable Author/User modules with "Use loop" buttons.
 * Renders directly without WordPress Modal wrapper to use Voxel's backend.css styling.
 *
 * Based on: VoxelTab.tsx loop source modal implementation
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
								{/* Author module */}
								<div className={`nvx-mod ${expandedModule === 'author' ? 'mod-open' : ''}`}>
									<div className="nvx-mod-title">
										{__('Author', 'voxel-fse')}
										<div className="nvx-mod-actions">
											<a
												href="#"
												className="ts-button ts-outline icon-only"
												onClick={(e) => {
													e.preventDefault();
													setExpandedModule(expandedModule === 'author' ? null : 'author');
												}}
											>
												{arrowDownIcon}
											</a>
										</div>
									</div>
									{expandedModule === 'author' && (
										<div className="nvx-mod-content">
											<div className="nvx-mod mod-open mod-active">
												<div className="nvx-mod-title">
													{__('Role', 'voxel-fse')}
													<div className="nvx-mod-actions">
														<a
															className="ts-button ts-outline"
															href="#"
															style={{ width: 'auto' }}
															onClick={(e) => {
																e.preventDefault();
																handleSelectLoop('author', 'role');
															}}
														>
															{__('Use loop', 'voxel-fse')}
														</a>
													</div>
												</div>
											</div>
										</div>
									)}
								</div>

								{/* User module */}
								<div className={`nvx-mod ${expandedModule === 'user' ? 'mod-open' : ''}`}>
									<div className="nvx-mod-title">
										{__('User', 'voxel-fse')}
										<div className="nvx-mod-actions">
											<a
												href="#"
												className="ts-button ts-outline icon-only"
												onClick={(e) => {
													e.preventDefault();
													setExpandedModule(expandedModule === 'user' ? null : 'user');
												}}
											>
												{arrowDownIcon}
											</a>
										</div>
									</div>
									{expandedModule === 'user' && (
										<div className="nvx-mod-content">
											<div className="nvx-mod mod-open mod-active">
												<div className="nvx-mod-title">
													{__('Role', 'voxel-fse')}
													<div className="nvx-mod-actions">
														<a
															className="ts-button ts-outline"
															href="#"
															style={{ width: 'auto' }}
															onClick={(e) => {
																e.preventDefault();
																handleSelectLoop('user', 'role');
															}}
														>
															{__('Use loop', 'voxel-fse')}
														</a>
													</div>
												</div>
											</div>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
