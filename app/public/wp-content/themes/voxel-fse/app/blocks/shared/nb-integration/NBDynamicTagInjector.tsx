/**
 * NB Dynamic Tag Injector
 *
 * Injects Voxel's EnableTagsButton inline next to NectarBlocks' inspector
 * controls using MutationObserver + React createPortal.
 *
 * Architecture:
 * 1. Watches the inspector sidebar for NB control rows (.nectar-control-row)
 * 2. Matches control labels by text content (from nectarBlocksConfig)
 * 3. Creates portal containers next to matched labels
 * 4. Renders EnableTagsButton via createPortal into those containers
 * 5. Manages DynamicTagBuilder modal state per field
 * 6. Reads/writes voxelDynamicTags attribute on the block
 *
 * @package VoxelFSE
 */

import { createPortal } from 'react-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import EnableTagsButton from '@shared/controls/EnableTagsButton';
import { DynamicTagBuilder } from '@shared/dynamic-tags';
import VoxelTab from '@shared/controls/VoxelTab';
import { useTemplateContext, useTemplatePostType } from '@shared/utils/useTemplateContext';
import type { NBBlockConfig } from './nectarBlocksConfig';
import './nb-dynamic-tag-injector.css';

// WordPress data stores — accessed via globals to avoid ESM import map issues
const wpData = (window as any).wp?.data;

/**
 * Body-observer field configs — these fields live outside the sidebar
 * (WP Advanced panel, NB Custom Attributes popover) and are injected
 * by the body MutationObserver instead of scanAndInject.
 */
/**
 * Returns true if a field key belongs to a body-observer-managed field
 * (CSS Classes or Custom Attribute repeater items).
 * Custom attribute keys follow the pattern: customAttr_{id}_name / customAttr_{id}_value
 */
function isBodyField(fieldKey: string): { label: string; type: string } | null {
	if (fieldKey === 'cssClasses') {
		return { label: 'Additional CSS class(es)', type: 'css-class' };
	}
	if (fieldKey.startsWith('customAttr_') && fieldKey.endsWith('_name')) {
		return { label: 'Custom Attribute Name', type: 'text' };
	}
	if (fieldKey.startsWith('customAttr_') && fieldKey.endsWith('_value')) {
		return { label: 'Custom Attribute Value', type: 'text' };
	}
	return null;
}

interface NBDynamicTagInjectorProps {
	blockConfig: NBBlockConfig;
	clientId: string;
	attributes: Record<string, unknown>;
	setAttributes: (attrs: Record<string, unknown>) => void;
}

/**
 * Portal container for a single field's EnableTag button.
 * Tracks the DOM element we're portaling into.
 */
interface FieldPortal {
	fieldKey: string;
	container: HTMLElement;
}

export default function NBDynamicTagInjector({ blockConfig, clientId, attributes, setAttributes }: NBDynamicTagInjectorProps) {
	const [portals, setPortals] = useState<FieldPortal[]>([]);
	const [activeModalField, setActiveModalField] = useState<string | null>(null);
	const observerRef = useRef<MutationObserver | null>(null);
	const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const overlayCleanupRef = useRef<(() => void) | null>(null);
	const bodyObserverRef = useRef<MutationObserver | null>(null);

	// Track which custom attribute index was last clicked in the sidebar.
	// NB opens a popover for the clicked item — we use this index to
	// determine the item's unique ID instead of unreliable value-matching.
	const activeCustomAttrIndexRef = useRef<number>(-1);

	// ── Voxel Tab injection ──
	// Refs for the injected Voxel tab elements (DOM nodes for createPortal)
	const voxelTabRef = useRef<HTMLLIElement | null>(null);
	const voxelTabPanelRef = useRef<HTMLDivElement | null>(null);
	const [isVoxelTabActive, setIsVoxelTabActive] = useState(false);

	// Template context for dynamic image resolution (same pattern as VX image block)
	const templateContext = useTemplateContext();
	const templatePostType = useTemplatePostType();

	// Resolved dynamic image URL for editor preview
	const [dynamicImageUrl, setDynamicImageUrl] = useState<string | null>(null);

	// Read voxelDynamicTags from block attributes
	const getBlockAttributes = useCallback(() => {
		if (!wpData) return {};
		const block = wpData.select('core/block-editor').getBlock(clientId);
		return block?.attributes ?? {};
	}, [clientId]);

	const getVoxelTags = useCallback((): Record<string, string> => {
		const attrs = getBlockAttributes();
		return (attrs as Record<string, unknown>)['voxelDynamicTags'] as Record<string, string> ?? {};
	}, [getBlockAttributes]);

	// Write a single field's tag value
	const setFieldTag = useCallback((fieldKey: string, value: string) => {
		if (!wpData) return;
		const currentTags = getVoxelTags();
		const updatedTags = { ...currentTags };

		if (value) {
			updatedTags[fieldKey] = value;
		} else {
			delete updatedTags[fieldKey];
		}

		wpData.dispatch('core/block-editor').updateBlockAttributes(clientId, {
			voxelDynamicTags: updatedTags,
		});
	}, [clientId, getVoxelTags]);

	/**
	 * Resolve a dynamic tag expression and write the resolved value into
	 * NB's native `link.customAttributes[i].attribute` or `.value` field.
	 * This makes NB's sidebar display the resolved text (e.g. "Roger")
	 * instead of "Empty".
	 */
	const resolveAndWriteCustomAttr = useCallback((wrappedExpression: string, itemId: string, prop: string): Promise<void> => {
		if (!wpData) return Promise.resolve();

		const previewContext: Record<string, string> = { type: templateContext };
		if (templatePostType) {
			previewContext['post_type'] = templatePostType;
		}

		return apiFetch<{ rendered: string }>({
			path: '/voxel-fse/v1/dynamic-data/render',
			method: 'POST',
			data: {
				expression: wrappedExpression,
				preview_context: previewContext,
			},
		}).then((result) => {
			let resolved = result.rendered;
			const wrapperMatch = resolved.match(/@tags\(\)(.*?)@endtags\(\)/s);
			if (wrapperMatch) {
				resolved = wrapperMatch[1];
			}

			if (!resolved) return;

			// Read current block attributes fresh (avoids stale closures)
			const block = wpData.select('core/block-editor').getBlock(clientId);
			if (!block) return;
			const link = (block.attributes as Record<string, unknown>)['link'] as Record<string, unknown> | undefined;
			const customAttrs = (link?.['customAttributes'] ?? []) as Array<{
				id: string; attribute?: string; value?: string;
			}>;

			// Find the item and update the appropriate field
			const updated = customAttrs.map((item) => {
				if (item.id !== itemId) return item;
				if (prop === 'name') {
					return { ...item, attribute: resolved };
				} else {
					return { ...item, value: resolved };
				}
			});

			wpData.dispatch('core/block-editor').updateBlockAttributes(clientId, {
				link: { ...link, customAttributes: updated },
			});
		}).catch((err: unknown) => {
			console.error('[NB] Failed to resolve custom attr tag:', err);
		});
	}, [clientId, templateContext, templatePostType]);

	/**
	 * Watch for NB clearing custom attribute resolved values.
	 * NB resets all items' attribute/value to "" when the user clicks
	 * "Add Link Attribute". We detect this by subscribing to the block
	 * store and re-resolving any tags whose NB fields were emptied.
	 */
	const resyncPendingRef = useRef(false);
	useEffect(() => {
		if (!wpData) return;

		const unsubscribe = wpData.subscribe(() => {
			if (resyncPendingRef.current) return;

			const block = wpData.select('core/block-editor').getBlock(clientId);
			if (!block) return;
			const tags = (block.attributes as Record<string, unknown>)['voxelDynamicTags'] as Record<string, string> | undefined;
			if (!tags) return;

			const link = (block.attributes as Record<string, unknown>)['link'] as Record<string, unknown> | undefined;
			const customAttrs = (link?.['customAttributes'] ?? []) as Array<{
				id: string; attribute?: string; value?: string;
			}>;

			// Check if any tag-bound field has been emptied in NB's native attribute
			const needsResync: Array<{ itemId: string; prop: string; expression: string }> = [];
			for (const [key, expression] of Object.entries(tags)) {
				const m = key.match(/^customAttr_(.+)_(name|value)$/);
				if (!m || !expression) continue;
				const itemId = m[1];
				const prop = m[2]; // 'name' or 'value'
				const item = customAttrs.find((a) => a.id === itemId);
				if (!item) continue;

				const nbValue = prop === 'name' ? (item.attribute ?? '') : (item.value ?? '');
				if (nbValue === '') {
					needsResync.push({ itemId, prop, expression });
				}
			}

			if (needsResync.length > 0) {
				resyncPendingRef.current = true;
				// Batch re-resolve all cleared fields
				Promise.all(
					needsResync.map(({ itemId, prop, expression }) =>
						resolveAndWriteCustomAttr(expression, itemId, prop)
					)
				).finally(() => {
					resyncPendingRef.current = false;
				});
			}
		});

		return () => { unsubscribe(); };
	}, [clientId, resolveAndWriteCustomAttr]);

	/**
	 * Scan the inspector sidebar for NB control rows that match our config.
	 * For each match, create a portal container next to the label if not already present.
	 */
	const scanAndInject = useCallback(() => {
		// Only inject when this block is the currently selected block.
		// All HOC instances run simultaneously; the sidebar only shows controls
		// for the selected block, so other instances must not inject.
		if (!wpData) return;
		const selectedId = wpData.select('core/block-editor').getSelectedBlockClientId();
		if (selectedId !== clientId) {
			// Remove any stale portals this instance may have left behind
			document.querySelectorAll(`.voxel-nb-tag-portal[data-client-id="${clientId}"]`).forEach((el) => el.remove());
			setPortals([]);
			return;
		}

		const sidebar = document.querySelector('.interface-interface-skeleton__sidebar');
		if (!sidebar) return;

		// Remove portals from OTHER instances that are no longer selected
		document.querySelectorAll(`.voxel-nb-tag-portal:not([data-client-id="${clientId}"])`).forEach((el) => el.remove());

		const newPortals: FieldPortal[] = [];
		const controlRows = sidebar.querySelectorAll('.nectar-control-row');

		for (const field of blockConfig.fields) {
			// Check if portal already exists for this field — scoped to this clientId
			const existingPortal = sidebar.querySelector(
				`.voxel-nb-tag-portal[data-field-key="${field.fieldKey}"][data-client-id="${clientId}"]`
			);
			if (existingPortal) {
				newPortals.push({ fieldKey: field.fieldKey, container: existingPortal as HTMLElement });
				continue;
			}

			// Find the matching control row by label text
			let matchedRow: Element | null = null;
			controlRows.forEach((row) => {
				const labelEl = row.querySelector('.nectar-control-row__label');
				if (!labelEl) return;

				const labelText = getLabelText(labelEl);
				if (labelText !== field.labelText) return;

				// If parentLabelText is set, verify this row is nested inside
				// a parent control row whose label matches parentLabelText
				if (field.parentLabelText) {
					const parentRow = row.parentElement?.closest('.nectar-control-row');
					if (!parentRow) return;
					const parentLabel = parentRow.querySelector(':scope > .nectar-control-row__label');
					if (!parentLabel || getLabelText(parentLabel) !== field.parentLabelText) return;
				}

				matchedRow = row;
			});

			if (!matchedRow) continue;

			// Create portal container
			const container = document.createElement('span');
			container.className = 'voxel-nb-tag-portal';
			container.setAttribute('data-field-key', field.fieldKey);
			container.setAttribute('data-client-id', clientId);

			if (field.placement === 'corner') {
				// Corner placement: position the button in the top-right of the component area
				container.classList.add('voxel-nb-tag-portal--corner');
				const componentDiv = (matchedRow as Element).querySelector('.nectar-control-row__component');
				if (componentDiv) {
					(componentDiv as HTMLElement).style.position = 'relative';
					componentDiv.appendChild(container);
				}
			} else {
				// Inline placement (default): insert inside the label element
				const labelDiv = (matchedRow as Element).querySelector('.nectar-control-row__label');

				// If NB wraps this label in its own dynamic-data inline selector, append
				// our button inside that wrapper (after NB's own button) so both sit inline.
				const inlineWrap = labelDiv?.querySelector('.nectar__dynamic-data-selector__inline');
				if (inlineWrap) {
					inlineWrap.appendChild(container);
				} else {
					// Plain label: append to the reset-wrap so it sits inline with the text
					const resetWrap = labelDiv?.querySelector('.nectar-control-row__reset-wrap');
					if (resetWrap) {
						resetWrap.appendChild(container);
					} else if (labelDiv) {
						labelDiv.appendChild(container);
					}
				}
			}

			newPortals.push({ fieldKey: field.fieldKey, container });
		}

		// Preserve body-observer portals (cssClasses, customAttr_*) that live
		// outside the sidebar — scanAndInject must not wipe them.
		const existingBodyPortals = document.querySelectorAll(
			`.voxel-nb-tag-portal[data-client-id="${clientId}"]`
		);
		existingBodyPortals.forEach((el) => {
			const key = el.getAttribute('data-field-key');
			if (key && isBodyField(key)) {
				newPortals.push({ fieldKey: key, container: el as HTMLElement });
			}
		});

		setPortals(newPortals);
	}, [blockConfig.fields, clientId]);

	/**
	 * Debounced scan — MutationObserver fires many times, we batch
	 */
	const debouncedScan = useCallback(() => {
		if (scanTimeoutRef.current) {
			clearTimeout(scanTimeoutRef.current);
		}
		scanTimeoutRef.current = setTimeout(() => {
			scanAndInject();
		}, 150);
	}, [scanAndInject]);

	// Set up MutationObserver on the sidebar
	useEffect(() => {
		// Initial scan after a short delay (NB controls render async)
		const initialTimeout = setTimeout(() => {
			scanAndInject();
		}, 300);

		// Observe mutations in the sidebar for tab switches, panel expand/collapse
		const sidebar = document.querySelector('.interface-interface-skeleton__sidebar');
		if (sidebar) {
			observerRef.current = new MutationObserver(() => {
				debouncedScan();
			});

			observerRef.current.observe(sidebar, {
				childList: true,
				subtree: true,
			});
		}

		return () => {
			clearTimeout(initialTimeout);
			if (scanTimeoutRef.current) {
				clearTimeout(scanTimeoutRef.current);
			}
			if (observerRef.current) {
				observerRef.current.disconnect();
				observerRef.current = null;
			}

			// Clean up only this instance's portal containers
			document.querySelectorAll(`.voxel-nb-tag-portal[data-client-id="${clientId}"]`).forEach((el) => el.remove());
		};
	}, [scanAndInject, debouncedScan]);

	/**
	 * Inject Voxel tab into NB's .nectar-blocks-tab-list.
	 * Creates a 4th <li> tab element and a panel container for VoxelTab content.
	 *
	 * Strategy for tab switching:
	 * - We do NOT remove react-tabs__tab--selected from NB tabs (react-tabs manages its own state).
	 * - Instead, we add a data attribute [data-voxel-tab-active] on the tab list container.
	 * - CSS uses this attribute to hide NB's ::after marker and tab panels when Voxel tab is active.
	 * - When an NB tab is clicked, we simply remove our active state and let react-tabs handle the rest.
	 */
	useEffect(() => {
		if (!wpData) return;

		const injectVoxelTab = () => {
			// Only inject when this block is selected
			const selectedId = wpData.select('core/block-editor').getSelectedBlockClientId();
			if (selectedId !== clientId) return;

			const sidebar = document.querySelector('.interface-interface-skeleton__sidebar');
			if (!sidebar) return;

			const tabList = sidebar.querySelector('.nectar-blocks-tab-list');
			if (!tabList) return;

			// Check if already injected
			if (tabList.querySelector('[data-voxel-tab="true"]')) return;

			// Create the Voxel tab <li>
			const voxelLi = document.createElement('li');
			voxelLi.setAttribute('data-voxel-tab', 'true');
			voxelLi.setAttribute('data-client-id', clientId);
			voxelLi.setAttribute('role', 'tab');
			voxelLi.setAttribute('tabindex', '0');

			// Icon: Voxel logo
			const img = document.createElement('img');
			img.src = '/wp-content/themes/voxel/assets/images/post-types/logo.svg';
			img.alt = '';
			voxelLi.appendChild(img);

			// Label
			const label = document.createTextNode('Voxel');
			voxelLi.appendChild(label);

			tabList.appendChild(voxelLi);
			voxelTabRef.current = voxelLi;

			// Create the tab panel container (placed after NB's react-tabs container)
			const reactTabs = sidebar.querySelector('.react-tabs');
			if (!reactTabs) return;

			const panel = document.createElement('div');
			panel.className = 'voxel-nb-tab-panel';
			panel.setAttribute('data-client-id', clientId);
			reactTabs.parentElement?.insertBefore(panel, reactTabs.nextSibling);
			voxelTabPanelRef.current = panel;

			// Click handler for Voxel tab
			voxelLi.addEventListener('click', () => {
				// Mark Voxel tab as active via data attribute on the container
				// CSS will hide NB's markers and panels based on this attribute
				tabList.setAttribute('data-voxel-tab-active', 'true');

				// Select Voxel tab visually
				voxelLi.classList.add('react-tabs__tab--selected');

				// Hide NB tab panels via inline style (CSS can't target react-tabs panels
				// inside the .react-tabs container reliably across all NB versions)
				const nbPanels = reactTabs.querySelectorAll(':scope > .react-tabs__tab-panel');
				nbPanels.forEach((p) => {
					(p as HTMLElement).style.display = 'none';
				});

				// Show Voxel panel
				panel.classList.add('is-active');
				setIsVoxelTabActive(true);
			});

			// Use event delegation on the tab list to intercept NB tab clicks.
			// This catches clicks on NB tabs regardless of when they were created.
			tabList.addEventListener('click', (e: Event) => {
				const target = e.target as HTMLElement;
				const clickedTab = target.closest('.react-tabs__tab');

				// Only handle if an NB tab was clicked (not our Voxel tab)
				if (!clickedTab || clickedTab.hasAttribute('data-voxel-tab')) return;

				// Deactivate Voxel tab
				tabList.removeAttribute('data-voxel-tab-active');
				voxelLi.classList.remove('react-tabs__tab--selected');

				// Hide Voxel panel
				panel.classList.remove('is-active');
				setIsVoxelTabActive(false);

				// Restore NB tab panel display (let react-tabs handle selection)
				const nbPanels = reactTabs.querySelectorAll(':scope > .react-tabs__tab-panel');
				nbPanels.forEach((p) => {
					(p as HTMLElement).style.display = '';
				});
			});
		};

		// Delay to allow NB's tabs to render
		const timeout = setTimeout(injectVoxelTab, 400);

		// Also re-check on sidebar mutations (NB tabs may render after initial load)
		const sidebarForTab = document.querySelector('.interface-interface-skeleton__sidebar');
		let tabObserver: MutationObserver | null = null;
		if (sidebarForTab) {
			tabObserver = new MutationObserver(() => {
				const tabList = sidebarForTab.querySelector('.nectar-blocks-tab-list');
				if (tabList && !tabList.querySelector('[data-voxel-tab="true"]')) {
					injectVoxelTab();
				}
			});
			tabObserver.observe(sidebarForTab, { childList: true, subtree: true });
		}

		return () => {
			clearTimeout(timeout);
			tabObserver?.disconnect();

			// Clean up injected elements
			if (voxelTabRef.current) {
				voxelTabRef.current.remove();
				voxelTabRef.current = null;
			}
			if (voxelTabPanelRef.current) {
				voxelTabPanelRef.current.remove();
				voxelTabPanelRef.current = null;
			}
			setIsVoxelTabActive(false);
		};
	}, [clientId]);

	/**
	 * Watch document.body for:
	 * 1. Custom Attributes popover (.nectar__link-control__custom-attr__popover)
	 * 2. WordPress Advanced panel (.block-editor-block-inspector__advanced)
	 * Both are outside the sidebar so the sidebar MutationObserver misses them.
	 */
	/**
	 * Track clicks on sidebar custom attribute items to know which item is
	 * being edited. Uses event delegation on the sidebar container.
	 */
	useEffect(() => {
		const sidebar = document.querySelector('.interface-interface-skeleton__sidebar');
		if (!sidebar) return;

		const handleClick = (e: Event) => {
			const target = e.target as HTMLElement;
			const attrItem = target.closest('.nectar__link-control__custom-attr');
			if (!attrItem) return;

			// Find index among sibling .nectar__link-control__custom-attr elements
			const allItems = sidebar.querySelectorAll('.nectar__link-control__custom-attr');
			let clickedIdx = -1;
			allItems.forEach((item, i) => {
				if (item === attrItem) clickedIdx = i;
			});

			activeCustomAttrIndexRef.current = clickedIdx;
		};

		sidebar.addEventListener('click', handleClick, true);
		return () => { sidebar.removeEventListener('click', handleClick, true); };
	}, [clientId]);

	useEffect(() => {
		const injectBodyTargets = () => {
			// Only act when this block is selected
			if (!wpData) return;
			const selectedId = wpData.select('core/block-editor').getSelectedBlockClientId();
			if (selectedId !== clientId) return;

			// 1. Custom Attributes popover (fixed-position, rendered in body)
			// Use item-scoped keys: customAttr_{id}_name / customAttr_{id}_value
			const popover = document.querySelector('.nectar__link-control__custom-attr__popover');
			if (popover) {
				const attrs = getBlockAttributes() as Record<string, unknown>;
				const link = attrs['link'] as { customAttributes?: Array<{ id: string; attribute?: string; value?: string }> } | undefined;
				const customAttrs = link?.customAttributes ?? [];

				// Use the tracked click index to identify which item is active
				const idx = activeCustomAttrIndexRef.current;
				const itemId = (idx >= 0 && idx < customAttrs.length)
					? customAttrs[idx].id
					: (customAttrs.length > 0 ? customAttrs[customAttrs.length - 1].id : 'idx0');

				(['Attribute', 'Value'] as const).forEach((labelText) => {
					const suffix = labelText === 'Attribute' ? 'name' : 'value';
					const fieldKey = `customAttr_${itemId}_${suffix}`;
					const existingPortal = popover.querySelector(
						`.voxel-nb-tag-portal[data-field-key="${fieldKey}"][data-client-id="${clientId}"]`
					);
					if (existingPortal) return;

					// Clean up stale portals from different items
					popover.querySelectorAll(
						`.voxel-nb-tag-portal[data-client-id="${clientId}"][data-field-key^="customAttr_"][data-field-key$="_${suffix}"]`
					).forEach((el) => el.remove());

					const rows = popover.querySelectorAll('.nectar-control-row');
					let matchedRow: Element | null = null;
					rows.forEach((row) => {
						const lbl = row.querySelector('.nectar-control-row__label');
						if (!lbl) return;
						const txt = (lbl.querySelector('.nectar-control-row__reset-wrap') || lbl).textContent?.trim();
						if (txt === labelText) matchedRow = row;
					});
					if (!matchedRow) return;

					const container = document.createElement('span');
					container.className = 'voxel-nb-tag-portal voxel-nb-tag-portal--corner';
					container.setAttribute('data-field-key', fieldKey);
					container.setAttribute('data-client-id', clientId);

					const componentDiv = (matchedRow as Element).querySelector('.nectar-control-row__component');
					if (componentDiv) {
						(componentDiv as HTMLElement).style.position = 'relative';
						componentDiv.appendChild(container);
						setPortals((prev) => [...prev, { fieldKey, container }]);
					}
				});

				// Also clean up orphan custom attr portals from the portal state
				// that belong to a different item than the one currently being edited
				setPortals((prev) => prev.filter((p) => {
					if (!p.fieldKey.startsWith('customAttr_')) return true;
					// Keep this portal only if its container is still in the DOM
					return document.body.contains(p.container);
				}));
			}

			// 2. Additional CSS class(es) in WP Advanced panel
			const cssFieldKey = 'cssClasses';
			const existingCssPortal = document.querySelector(
				`.voxel-nb-tag-portal[data-field-key="${cssFieldKey}"][data-client-id="${clientId}"]`
			);
			if (!existingCssPortal) {
				const advPanel = document.querySelector('.block-editor-block-inspector__advanced');
				if (advPanel) {
					// Find the label element with text "Additional CSS class(es)"
					const labels = advPanel.querySelectorAll('label');
					let cssLabel: HTMLLabelElement | null = null;
					labels.forEach((lbl) => {
						if ((lbl.textContent || '').trim() === 'Additional CSS class(es)') {
							cssLabel = lbl;
						}
					});
					if (cssLabel !== null) {
						const wrapper = ((cssLabel as HTMLLabelElement).closest('.components-base-control__field') ?? (cssLabel as HTMLLabelElement).parentElement) as HTMLElement | null;
						if (wrapper) {
							const container = document.createElement('span');
							container.className = 'voxel-nb-tag-portal voxel-nb-tag-portal--corner';
							container.setAttribute('data-field-key', cssFieldKey);
							container.setAttribute('data-client-id', clientId);
							wrapper.style.position = 'relative';
							wrapper.appendChild(container);
							setPortals((prev) => [...prev, { fieldKey: cssFieldKey, container }]);
						}
					}
				}
			}
		};

		// Observe document.body for the popover and Advanced panel appearing
		bodyObserverRef.current = new MutationObserver(() => {
			injectBodyTargets();
		});
		bodyObserverRef.current.observe(document.body, { childList: true, subtree: true });

		// Initial check
		injectBodyTargets();

		return () => {
			bodyObserverRef.current?.disconnect();
			bodyObserverRef.current = null;
		};
	}, [clientId]);

	// Get current tags for rendering
	const voxelTags = getVoxelTags();

	/**
	 * Resolve imageSource dynamic tag to an actual image URL.
	 * Same two-step process as VX image block's ImageComponent.tsx.
	 */
	useEffect(() => {
		const imageTag = voxelTags['imageSource'];
		if (!imageTag) {
			setDynamicImageUrl(null);
			return;
		}

		let cancelled = false;

		(async () => {
			try {
				const previewContext: Record<string, string> = { type: templateContext };
				if (templatePostType) {
					previewContext['post_type'] = templatePostType;
				}

				// Step 1: Resolve the dynamic tag to get the attachment ID
				const renderResult = await apiFetch<{ rendered: string }>({
					path: '/voxel-fse/v1/dynamic-data/render',
					method: 'POST',
					data: {
						expression: imageTag,
						preview_context: previewContext,
					},
				});

				if (cancelled) return;

				let rendered = renderResult.rendered;
				const wrapperMatch = rendered.match(/@tags\(\)(.*?)@endtags\(\)/s);
				if (wrapperMatch) {
					rendered = wrapperMatch[1];
				}

				const attachmentId = parseInt(rendered, 10);
				if (!attachmentId || isNaN(attachmentId)) {
					if (!cancelled) setDynamicImageUrl(null);
					return;
				}

				// Step 2: Get the image URL from WordPress media REST API
				const media = await apiFetch<{
					source_url: string;
					media_details?: { sizes?: Record<string, { source_url: string }> };
				}>({
					path: `/wp/v2/media/${attachmentId}?context=edit`,
				});

				if (cancelled) return;

				if (media) {
					const sizedUrl = media.media_details?.sizes?.['large']?.source_url;
					setDynamicImageUrl(sizedUrl || media.source_url);
				}
			} catch (err) {
				if (!cancelled) {
					console.error('[NB] Failed to resolve dynamic image tag:', err);
					setDynamicImageUrl(null);
				}
			}
		})();

		return () => { cancelled = true; };
	}, [voxelTags, clientId, templateContext, templatePostType]);

	/**
	 * Inject the resolved image (or remove it) in the NB block's iframe DOM.
	 * Uses a MutationObserver on the block element to keep the placeholder hidden
	 * even if NB's React re-renders restore it.
	 */
	useEffect(() => {
		// Clean up previous injected preview
		if (overlayCleanupRef.current) {
			overlayCleanupRef.current();
			overlayCleanupRef.current = null;
		}

		if (!dynamicImageUrl) return;

		// Find the editor iframe document
		const iframe = document.querySelector('iframe[name="editor-canvas"]') as HTMLIFrameElement | null;
		const iframeDoc = iframe?.contentDocument;
		if (!iframeDoc) return;

		// Find the NB image block by clientId
		const blockEl = iframeDoc.querySelector(`[data-block="${clientId}"]`) as HTMLElement | null;
		if (!blockEl) return;

		// Inject CSS into iframe once
		const styleId = 'voxel-nb-image-preview-css';
		if (!iframeDoc.getElementById(styleId)) {
			const style = iframeDoc.createElement('style');
			style.id = styleId;
			style.textContent = `
				.voxel-nb-image-preview {
					display: block;
					width: 100%;
					height: auto;
				}
				[data-voxel-has-dynamic-image="true"] .components-placeholder {
					display: none !important;
				}
			`;
			iframeDoc.head.appendChild(style);
		}

		// Mark the block so our CSS hides the placeholder automatically on re-renders
		blockEl.setAttribute('data-voxel-has-dynamic-image', 'true');

		// Create an <img> element
		const img = iframeDoc.createElement('img');
		img.className = 'voxel-nb-image-preview';
		img.setAttribute('data-voxel-dynamic', 'imageSource');
		img.src = dynamicImageUrl;
		img.alt = '';
		blockEl.insertBefore(img, blockEl.firstChild);

		// Cleanup
		overlayCleanupRef.current = () => {
			img.remove();
			blockEl.removeAttribute('data-voxel-has-dynamic-image');
		};

		return () => {
			if (overlayCleanupRef.current) {
				overlayCleanupRef.current();
				overlayCleanupRef.current = null;
			}
		};
	}, [dynamicImageUrl, clientId]);

	return (
		<>
			{/* Render EnableTagsButton into each portal container */}
			{portals.map((portal) => {
				const fieldConfig = blockConfig.fields.find((f) => f.fieldKey === portal.fieldKey);
				// Body-observer fields (cssClasses, customAttr*) aren't in blockConfig
				if (!fieldConfig && !isBodyField(portal.fieldKey)) return null;

				const hasTag = Boolean(voxelTags[portal.fieldKey]);

				return createPortal(
					<EnableTagsButton
						onClick={() => setActiveModalField(portal.fieldKey)}
						title={
							hasTag
								? __('Edit Voxel tag', 'voxel-fse')
								: __('Enable Voxel tags', 'voxel-fse')
						}
					/>,
					portal.container,
					portal.fieldKey
				);
			})}

			{/* Active tag indicator overlays — show dark preview replacing control when tag is set */}
			{portals.map((portal) => {
				const tag = voxelTags[portal.fieldKey];
				const fieldConfig = blockConfig.fields.find((f) => f.fieldKey === portal.fieldKey);

				// Determine the correct component div for the preview.
				// For nested fields (parentLabelText set), place preview in the PARENT
				// row's component area so it spans full width — not the narrow sub-row.
				let targetComponentDiv: Element | null = null;
				const controlRow = portal.container.closest('.nectar-control-row');

				if (fieldConfig?.parentLabelText && controlRow) {
					// This is a nested row — go up to the parent row's component
					const parentRow = controlRow.parentElement?.closest('.nectar-control-row');
					targetComponentDiv = parentRow?.querySelector(':scope > .nectar-control-row__component') ?? null;
				}
				if (!targetComponentDiv) {
					targetComponentDiv = controlRow?.querySelector('.nectar-control-row__component') ?? null;
				}
				if (!targetComponentDiv) return null;

				// If no tag, remove any leftover preview container and skip
				if (!tag) {
					const stalePreview = targetComponentDiv.querySelector(
						`.voxel-nb-tag-preview[data-field-key="${portal.fieldKey}"]`
					);
					if (stalePreview) stalePreview.remove();
					return null;
				}

				// Create or find preview container
				let previewContainer = targetComponentDiv.querySelector(
					`.voxel-nb-tag-preview[data-field-key="${portal.fieldKey}"]`
				) as HTMLElement | null;

				if (!previewContainer) {
					previewContainer = document.createElement('div');
					previewContainer.className = 'voxel-nb-tag-preview';
					previewContainer.setAttribute('data-field-key', portal.fieldKey);
					targetComponentDiv.appendChild(previewContainer);
				}

				return createPortal(
					<TagPreview
						tag={tag}
						onEdit={() => setActiveModalField(portal.fieldKey)}
						onDisable={() => {
							setFieldTag(portal.fieldKey, '');

							// For custom attribute fields, also clear the resolved
							// value from NB's native block attribute
							const m = portal.fieldKey.match(/^customAttr_(.+)_(name|value)$/);
							if (m && wpData) {
								const block = wpData.select('core/block-editor').getBlock(clientId);
								if (block) {
									const link = (block.attributes as Record<string, unknown>)['link'] as Record<string, unknown> | undefined;
									const customAttrs = (link?.['customAttributes'] ?? []) as Array<{
										id: string; attribute?: string; value?: string;
									}>;
									const updated = customAttrs.map((item) => {
										if (item.id !== m[1]) return item;
										return m[2] === 'name'
											? { ...item, attribute: '' }
											: { ...item, value: '' };
									});
									wpData.dispatch('core/block-editor').updateBlockAttributes(clientId, {
										link: { ...link, customAttributes: updated },
									});
								}
							}
						}}
					/>,
					previewContainer,
					`preview-${portal.fieldKey}`
				);
			})}

			{/* DynamicTagBuilder modal — portal to top-level document body.
			 * In the Site Editor, the BlockEdit HOC's DOM gets placed in an iframe
			 * by WordPress, but our editor.css (with .nvx-editor styles) is only loaded
			 * in the main document. Using createPortal to document.body ensures the
			 * modal renders where the CSS exists and appears as a full-screen overlay.
			 * Note: `document` in this HOC context IS the top-level document (confirmed
			 * by sidebar querySelector working from this context). */}
			{activeModalField && createPortal(
				<DynamicTagBuilder
					value={extractTagContent(voxelTags[activeModalField] || '')}
					onChange={(newValue: string) => {
						if (newValue) {
							const wrappedValue = wrapWithTags(newValue);
							setFieldTag(activeModalField, wrappedValue);

							// For custom attribute fields, resolve the tag and write
							// the resolved value into NB's native block attribute
							// so the sidebar shows the resolved value instead of "Empty".
							const customAttrMatch = activeModalField.match(/^customAttr_(.+)_(name|value)$/);
							if (customAttrMatch) {
								const itemId = customAttrMatch[1];
								const prop = customAttrMatch[2]; // 'name' or 'value'
								resolveAndWriteCustomAttr(wrappedValue, itemId, prop);
							}
						}
						setActiveModalField(null);
					}}
					label={
						blockConfig.fields.find((f) => f.fieldKey === activeModalField)?.label
						?? isBodyField(activeModalField)?.label
						?? ''
					}
					context="post"
					onClose={() => setActiveModalField(null)}
					autoOpen={true}
				/>,
				document.body
			)}

			{/* Voxel Tab panel — rendered via createPortal into the injected panel container */}
			{isVoxelTabActive && voxelTabPanelRef.current && createPortal(
				<VoxelTab
					attributes={attributes as any}
					setAttributes={setAttributes as any}
				/>,
				voxelTabPanelRef.current,
				'voxel-tab-panel'
			)}
		</>
	);
}

/**
 * Dark preview panel shown below a control when a Voxel tag is active.
 * Matches the existing DynamicTagTextControl pattern.
 */
function TagPreview({
	tag,
	onEdit,
	onDisable,
}: {
	tag: string;
	onEdit: () => void;
	onDisable: () => void;
}) {
	const content = extractTagContent(tag);

	return (
		<div className="voxel-nb-tag-preview__inner">
			<span className="voxel-nb-tag-preview__content">{content}</span>
			<div className="voxel-nb-tag-preview__divider" />
			<div className="voxel-nb-tag-preview__actions">
				<button type="button" className="voxel-nb-tag-preview__btn" onClick={onEdit}>
					{__('EDIT TAGS', 'voxel-fse')}
				</button>
				<button
					type="button"
					className="voxel-nb-tag-preview__btn voxel-nb-tag-preview__btn--disable"
					onClick={() => {
						if (window.confirm(__('Are you sure?', 'voxel-fse'))) {
							onDisable();
						}
					}}
				>
					{__('DISABLE TAGS', 'voxel-fse')}
				</button>
			</div>
		</div>
	);
}

// ────────────────────────────────────────────
// Utility functions
// ────────────────────────────────────────────

/** Extract label text from a .nectar-control-row__label element, ignoring NB's dynamic data button text */
function getLabelText(labelEl: Element): string {
	// NB wraps some labels in .nectar__dynamic-data-selector__inline
	// which contains: <span>Label</span><button>...</button>
	const inlineWrap = labelEl.querySelector('.nectar__dynamic-data-selector__inline');
	if (inlineWrap) {
		const labelSpan = inlineWrap.querySelector('span');
		return labelSpan?.textContent?.trim() ?? '';
	}

	// Standard label: .nectar-control-row__reset-wrap contains direct text
	const resetWrap = labelEl.querySelector('.nectar-control-row__reset-wrap');
	if (resetWrap) {
		return resetWrap.textContent?.trim() ?? '';
	}

	return labelEl.textContent?.trim() ?? '';
}

/** Extract tag content from @tags()...@endtags() wrapper */
function extractTagContent(value: string): string {
	if (!value) return '';
	const match = value.match(/@tags\(\)(.*?)@endtags\(\)/s);
	return match ? match[1] : value;
}

/** Wrap content with @tags()...@endtags() */
function wrapWithTags(content: string): string {
	if (!content) return '';
	return `@tags()${content}@endtags()`;
}

