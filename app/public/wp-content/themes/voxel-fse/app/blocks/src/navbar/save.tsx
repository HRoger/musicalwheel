/**
 * Navbar Block - Save Function (Plan C+)
 *
 * Saves static HTML with vxconfig data for frontend hydration.
 * This eliminates the need for render.php (server-side PHP rendering).
 *
 * Pattern matches Voxel widget output structure:
 * - Minimal storage in database
 * - vxconfig JSON for configuration
 * - Placeholder for React to mount into
 *
 * Evidence:
 * - Voxel template: themes/voxel/templates/widgets/navbar.php
 * - CSS classes: ts-nav-menu, ts-nav, ts-item-link, etc.
 *
 * @package VoxelFSE
 */

import { useBlockProps } from '@wordpress/block-editor';
import { getAdvancedVoxelTabProps, renderBackgroundElements } from '@shared/utils';
import type { NavbarAttributes, NavbarVxConfig } from './types';
import { generateNavbarResponsiveCSS } from './styles';

interface SaveProps {
	attributes: NavbarAttributes;
}

function createSaveFn(includePlaceholder: boolean) {
	return function save({ attributes }: SaveProps) {
		const blockId = attributes.blockId || 'navbar';

		// Use shared utility for AdvancedTab + VoxelTab wiring
		const advancedProps = getAdvancedVoxelTabProps(attributes, {
			blockId,
			baseClass: 'voxel-fse-navbar ts-nav-menu',
		});

		// Generate navbar-specific responsive CSS for Content tab and Style tab controls
		const navbarResponsiveCSS = generateNavbarResponsiveCSS(attributes, blockId);

		// Combine all responsive CSS
		// Layer 1 (AdvancedTab + VoxelTab) + Layer 2 (Content tab + Style tab)
		const combinedResponsiveCSS = [advancedProps.responsiveCSS, navbarResponsiveCSS]
			.filter(Boolean)
			.join('\n');

		// Build class list matching Voxel's navbar pattern
		const blockProps = useBlockProps.save({
			id: advancedProps.elementId,
			className: advancedProps.className,
			style: advancedProps.styles,
			'data-source': attributes.source,
			// Headless-ready: Visibility rules configuration
			'data-visibility-behavior': attributes.visibilityBehavior || undefined,
			'data-visibility-rules': attributes.visibilityRules?.length
				? JSON.stringify(attributes.visibilityRules)
				: undefined,
			// Headless-ready: Loop element configuration
			'data-loop-source': attributes.loopSource || undefined,
			'data-loop-limit': attributes.loopLimit || undefined,
			'data-loop-offset': attributes.loopOffset || undefined,
			...advancedProps.customAttrs,
		});

		// Build vxconfig JSON (matching Voxel pattern)
		// Contains all configuration needed by frontend.tsx
		const vxConfig: NavbarVxConfig = {
			source: attributes.source,
			menuLocation: attributes.menuLocation,
			mobileMenuLocation: attributes.mobileMenuLocation,
			orientation: attributes.orientation,
			justify: attributes.justify,
			collapsible: attributes.collapsible,
			collapsedWidth: attributes.collapsedWidth,
			expandedWidth: attributes.expandedWidth,
			hamburgerTitle: attributes.hamburgerTitle,
			showBurgerDesktop: attributes.showBurgerDesktop,
			showBurgerTablet: attributes.showBurgerTablet,
			showMenuLabel: attributes.showMenuLabel,
			hamburgerIcon: attributes.hamburgerIcon,
			closeIcon: attributes.closeIcon,
			manualItems: attributes.manualItems,
			showIcon: attributes.showIcon,
			iconOnTop: attributes.iconOnTop,
			customPopupEnabled: attributes.customPopupEnabled,
			multiColumnMenu: attributes.multiColumnMenu,
			menuColumns: attributes.menuColumns,
			searchFormId: attributes.searchFormId,
			templateTabsId: attributes.templateTabsId,
		};

		return (
			<div {...blockProps}>
				{/* Responsive CSS from AdvancedTab + VoxelTab + Content Tab + Style Tab */}
				{combinedResponsiveCSS && (
					<style dangerouslySetInnerHTML={{ __html: combinedResponsiveCSS }} />
				)}

				{/* Background elements: video, slideshow, overlay, shape dividers */}
				{renderBackgroundElements(attributes, false, undefined, undefined, advancedProps.uniqueSelector)}

				{/* Voxel vxconfig pattern - configuration stored in JSON script */}
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
				/>
				{/* Placeholder for React hydration - will be replaced by NavbarComponent */}
				{includePlaceholder && (
					<div
						className="voxel-fse-block-placeholder"
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							backgroundColor: '#e0e0e0',
							padding: '16px',
							minHeight: '48px',
						}}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							width="24"
							height="24"
							fill="currentColor"
							style={{ opacity: 0.4 }}
						>
							<rect x="4" y="4" width="4" height="4" rx="0.5" />
							<rect x="10" y="4" width="4" height="4" rx="0.5" />
							<rect x="16" y="4" width="4" height="4" rx="0.5" />
							<rect x="4" y="10" width="4" height="4" rx="0.5" />
							<rect x="10" y="10" width="4" height="4" rx="0.5" />
							<rect x="16" y="10" width="4" height="4" rx="0.5" />
							<rect x="4" y="16" width="4" height="4" rx="0.5" />
							<rect x="10" y="16" width="4" height="4" rx="0.5" />
							<rect x="16" y="16" width="4" height="4" rx="0.5" />
						</svg>
					</div>
				)}
			</div>
		);
	};
}

export default createSaveFn(false);
export const saveWithPlaceholder = createSaveFn(true);
