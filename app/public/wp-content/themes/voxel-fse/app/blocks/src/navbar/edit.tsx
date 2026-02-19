/**
 * Navbar Block - Editor Component
 *
 * 1:1 match with Voxel's Navbar (VX) widget.
 * Provides InspectorControls for all configuration options.
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/widgets/navbar.php
 * - Control sections: Source, Settings, Icons, Content (repeater), Style tabs
 *
 * @package VoxelFSE
 */

import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { useEffect, useState, useMemo } from 'react';
import { useSelect } from '@wordpress/data';
import apiFetch from '@wordpress/api-fetch';
import type {
	NavbarAttributes,
	NavbarMenuApiResponse,
	MenuLocation,
	LinkedTabData,
	LinkedPostTypeData,
} from './types';
import NavbarComponent from './shared/NavbarComponent';
import { InspectorTabs } from '@shared/controls';
import { ContentTab, StyleTab } from './inspector';
import { getAdvancedVoxelTabProps } from '@shared/utils';
import { useExpandedLoopItems } from '@shared/utils/useExpandedLoopItems';
import { generateNavbarResponsiveCSS } from './styles';

interface EditProps {
	attributes: NavbarAttributes;
	setAttributes: (attrs: Partial<NavbarAttributes>) => void;
	clientId: string;
}

/**
 * Get pre-injected editor config from window.__voxelFseEditorConfig
 */
function getInlineNavbarLocations(): MenuLocation[] | null {
	try {
		const config = (window as any).__voxelFseEditorConfig?.navbarLocations;
		if (Array.isArray(config) && config.length > 0) {
			return config;
		}
	} catch {}
	return null;
}

/**
 * Fetch WordPress menu locations
 */
async function fetchMenuLocations(): Promise<MenuLocation[]> {
	// Check for pre-injected data first (eliminates initial REST call)
	const inlineData = getInlineNavbarLocations();
	if (inlineData) {
		return inlineData;
	}

	try {
		const response = (await apiFetch({
			path: '/voxel-fse/v1/navbar/locations',
		})) as { locations: MenuLocation[] };
		return response.locations || [];
	} catch (error) {
		console.error('Failed to fetch menu locations:', error);
		return [];
	}
}

/**
 * Fetch menu items for a location
 */
async function fetchMenuItems(
	location: string
): Promise<NavbarMenuApiResponse | null> {
	if (!location) return null;

	try {
		const response = (await apiFetch({
			path: `/voxel-fse/v1/navbar/menu?location=${encodeURIComponent(location)}`,
		})) as NavbarMenuApiResponse;
		return response;
	} catch (error) {
		console.error('Failed to fetch menu items:', error);
		return null;
	}
}

export default function Edit({
	attributes,
	setAttributes,
	clientId,
}: EditProps) {
	const blockId = attributes.blockId || clientId;

	// Expand manualItems with loop configuration for editor preview
	const { items: expandedManualItems } = useExpandedLoopItems({
		items: attributes.manualItems || [],
	});

	// State for menu data
	const [menuLocations, setMenuLocations] = useState<MenuLocation[]>([]);
	const [menuData, setMenuData] = useState<NavbarMenuApiResponse | null>(null);
	const [mobileMenuData, setMobileMenuData] =
		useState<NavbarMenuApiResponse | null>(null);
	const [isLoading, setIsLoading] = useState(
		attributes.source === 'select_wp_menu' && !!attributes.menuLocation
	);
	const [error, setError] = useState<string | null>(null);

	// Get linked block data for template_tabs and search_form sources
	const { linkedTabs, linkedPostTypes, linkedBlockId } = (useSelect as any)(
		(select: any) => {
			const { getBlock, getBlocks } = select('core/block-editor');

			// Helper to find block by clientId recursively
			const findBlockById = (blocks: any[], targetId: string): any | null => {
				for (const block of blocks) {
					if (block.clientId === targetId) return block;
					if (block.innerBlocks?.length) {
						const found = findBlockById(block.innerBlocks, targetId);
						if (found) return found;
					}
				}
				return null;
			};

			// Template Tabs linking
			if (attributes.source === 'template_tabs' && attributes.templateTabsId) {
				const allBlocks = getBlocks();
				const linkedBlock = findBlockById(allBlocks, attributes.templateTabsId);
				if (linkedBlock?.attributes?.tabs) {
					const tabs: LinkedTabData[] = linkedBlock.attributes.tabs.map((tab: any, index: number) => ({
						id: tab.id || `tab-${index}`,
						title: tab.title || `Tab #${index + 1}`,
						urlKey: tab.cssId || tab.id || `tab-${index}`,
						icon: tab.icon?.value ? `<i class="${tab.icon.value}" aria-hidden="true"></i>` : null,
						isActive: index === 0, // First tab is active by default
					}));
					return {
						linkedTabs: tabs,
						linkedPostTypes: undefined,
						linkedBlockId: linkedBlock.attributes.blockId || linkedBlock.clientId,
					};
				}
			}

			// Search Form linking
			if (attributes.source === 'search_form' && attributes.searchFormId) {
				const allBlocks = getBlocks();
				const linkedBlock = findBlockById(allBlocks, attributes.searchFormId);
				if (linkedBlock?.attributes?.postTypes) {
					// For search form, we need to get the post type labels from Voxel config
					// For now, use the key as label (will be enhanced with API call if needed)
					const postTypes: LinkedPostTypeData[] = linkedBlock.attributes.postTypes.map(
						(key: string, index: number) => ({
							key,
							label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
							icon: null, // Post type icons would need to come from Voxel API
							isActive: index === 0 || key === linkedBlock.attributes.selectedPostType,
						})
					);
					return {
						linkedTabs: undefined,
						linkedPostTypes: postTypes,
						linkedBlockId: linkedBlock.attributes.blockId || linkedBlock.clientId,
					};
				}
			}

			return {
				linkedTabs: undefined,
				linkedPostTypes: undefined,
				linkedBlockId: undefined,
			};
		},
		[attributes.source, attributes.templateTabsId, attributes.searchFormId]
	) as any;

	// Set blockId if not set
	useEffect(() => {
		if (!attributes.blockId) {
			setAttributes({ blockId: clientId });
		}
	}, [attributes.blockId, clientId, setAttributes]);

	// Use shared utility for AdvancedTab + VoxelTab wiring
	const advancedProps = getAdvancedVoxelTabProps(attributes as any, {
		blockId,
		baseClass: 'voxel-fse-navbar',
		selectorPrefix: 'voxel-fse-navbar',
	});

	// Generate navbar-specific responsive CSS for Content tab and Style tab controls
	const navbarResponsiveCSS = useMemo(
		() => generateNavbarResponsiveCSS(attributes, blockId),
		[attributes, blockId]
	);

	// Combine all responsive CSS
	// Layer 1 (AdvancedTab + VoxelTab) + Layer 2 (Content tab + Style tab)
	const combinedResponsiveCSS = useMemo(
		() => [advancedProps.responsiveCSS, navbarResponsiveCSS].filter(Boolean).join('\n'),
		[advancedProps.responsiveCSS, navbarResponsiveCSS]
	);

	// Inject popup-specific CSS into parent frame for editor live preview.
	// Popup elements are portaled to the parent frame's body, so CSS in the
	// editor iframe doesn't reach them. Extract .voxel-popup-* rules and
	// inject into the parent document.
	useEffect(() => {
		if (!combinedResponsiveCSS) return;

		// Extract lines containing popup selectors
		const popupCssLines = combinedResponsiveCSS
			.split('\n')
			.filter(line => line.includes('.voxel-popup-'));

		if (popupCssLines.length === 0) return;

		const styleId = `navbar-popup-css-${blockId}`;
		let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
		if (!styleEl) {
			styleEl = document.createElement('style');
			styleEl.id = styleId;
			document.head.appendChild(styleEl);
		}
		styleEl.textContent = popupCssLines.join('\n');

		return () => {
			styleEl?.remove();
		};
	}, [combinedResponsiveCSS, blockId]);

	const blockProps = useBlockProps({
		id: advancedProps.elementId,
		className: advancedProps.className,
		style: advancedProps.styles,
		...advancedProps.customAttrs,
	});

	// Fetch menu locations on mount
	useEffect(() => {
		let cancelled = false;

		async function loadLocations() {
			const locations = await fetchMenuLocations();
			if (!cancelled) {
				setMenuLocations(locations);
			}
		}

		loadLocations();

		return () => {
			cancelled = true;
		};
	}, []);

	// Fetch menu data when location changes
	useEffect(() => {
		let cancelled = false;

		async function loadMenuData() {
			if (
				attributes.source !== 'select_wp_menu' ||
				!attributes.menuLocation
			) {
				setMenuData(null);
				return;
			}

			setIsLoading(true);
			setError(null);

			try {
				const data = await fetchMenuItems(attributes.menuLocation);
				if (!cancelled) {
					setMenuData(data);
				}
			} catch (err) {
				if (!cancelled) {
					setError(
						err instanceof Error ? err.message : 'Failed to load menu'
					);
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false);
				}
			}
		}

		loadMenuData();

		return () => {
			cancelled = true;
		};
	}, [attributes.source, attributes.menuLocation]);

	// Fetch mobile menu data when location changes
	useEffect(() => {
		let cancelled = false;

		async function loadMobileMenuData() {
			if (
				attributes.source !== 'select_wp_menu' ||
				!attributes.mobileMenuLocation
			) {
				setMobileMenuData(null);
				return;
			}

			try {
				const data = await fetchMenuItems(attributes.mobileMenuLocation);
				if (!cancelled) {
					setMobileMenuData(data);
				}
			} catch (err) {
				// Silent fail for mobile menu
				console.warn('Failed to load mobile menu:', err);
			}
		}

		loadMobileMenuData();

		return () => {
			cancelled = true;
		};
	}, [attributes.source, attributes.mobileMenuLocation]);

	// Build menu location options for select
	const menuLocationOptions = [
		{ value: '', label: __('Select a menu', 'voxel-fse') },
		...menuLocations.map((loc) => ({
			value: loc.slug,
			label: loc.name,
		})),
	];

	return (
		<div {...blockProps}>
			{/* Output combined responsive CSS */}
			{combinedResponsiveCSS && (
				<style dangerouslySetInnerHTML={{ __html: combinedResponsiveCSS }} />
			)}

			<InspectorControls>
				<InspectorTabs
					tabs={[
						{
							id: 'content',
							label: __('Content', 'voxel-fse'),
							icon: '\ue92c',
							render: () => (
								<ContentTab
									attributes={attributes}
									setAttributes={setAttributes}
									menuLocationOptions={menuLocationOptions}
								/>
							),
						},
						{
							id: 'style',
							label: __('Style', 'voxel-fse'),
							icon: '\ue921',
							render: () => (
								<StyleTab
									attributes={attributes}
									setAttributes={setAttributes}
								/>
							),
						},
					]}
					includeAdvancedTab={true}
					includeVoxelTab={true}
					attributes={attributes}
					setAttributes={setAttributes}
				/>
			</InspectorControls>

			{/* Editor Preview */}
			<NavbarComponent
				attributes={{ ...attributes, manualItems: expandedManualItems }}
				menuData={menuData}
				mobileMenuData={mobileMenuData}
				isLoading={isLoading}
				error={error}
				context="editor"
				linkedTabs={linkedTabs}
				linkedPostTypes={linkedPostTypes}
				linkedBlockId={linkedBlockId}
			/>
		</div>
	);
}
