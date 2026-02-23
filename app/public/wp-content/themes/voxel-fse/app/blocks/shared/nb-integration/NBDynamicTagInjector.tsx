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
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import EnableTagsButton from '@shared/controls/EnableTagsButton';
import { DynamicTagBuilder } from '@shared/dynamic-tags';
import VoxelTab from '@shared/controls/VoxelTab';
import { useTemplateContext, useTemplatePostType } from '@shared/utils/useTemplateContext';
import { NB_TOOLBAR_TAG_BLOCK_NAMES, type NBBlockConfig } from './nectarBlocksConfig';
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
	if (fieldKey === 'customId') {
		return { label: 'Custom ID', type: 'text' };
	}
	if (fieldKey === 'textContent') {
		return { label: 'Text Content', type: 'textarea' };
	}
	if (fieldKey.startsWith('customAttr_') && fieldKey.endsWith('_name')) {
		return { label: 'Custom Attribute Name', type: 'text' };
	}
	if (fieldKey.startsWith('customAttr_') && fieldKey.endsWith('_value')) {
		return { label: 'Custom Attribute Value', type: 'text' };
	}
	if (fieldKey === 'iconImage') {
		return { label: 'Icon Image', type: 'image' };
	}
	return null;
}

interface NBDynamicTagInjectorProps {
	blockConfig: NBBlockConfig;
	clientId: string;
	attributes: Record<string, unknown>;
	setAttributes: (attrs: Record<string, unknown>) => void;
	/** When true, skip sidebar scanning, VoxelTab injection, and image resolution.
	 *  Only inject EnableTag buttons into the WP Advanced panel (CSS Classes + Custom ID). */
	bodyObserverOnly?: boolean;
}

/**
 * Portal container for a single field's EnableTag button.
 * Tracks the DOM element we're portaling into.
 */
interface FieldPortal {
	fieldKey: string;
	container: HTMLElement;
}

export default function NBDynamicTagInjector({ blockConfig, clientId, attributes, setAttributes, bodyObserverOnly = false }: NBDynamicTagInjectorProps) {
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

	// Reactively track whether THIS block is selected (for sidebar injection)
	const isSelected = useSelect(
		(select) => (select('core/block-editor') as { getSelectedBlockClientId: () => string | null }).getSelectedBlockClientId() === clientId,
		[clientId],
	);

	// Whether this block uses the toolbar EnableTag for text content
	const isToolbarBlock = NB_TOOLBAR_TAG_BLOCK_NAMES.has(blockConfig.blockName);

	// Read voxelDynamicTags from block attributes
	const getBlockAttributes = useCallback(() => {
		if (!wpData) return {};
		const block = wpData.select('core/block-editor').getBlock(clientId);
		return block?.attributes ?? {};
	}, [clientId]);

	const getVoxelTags = useCallback((): Record<string, string> => {
		const attrs = getBlockAttributes();
		const tags = (attrs as Record<string, unknown>)['voxelDynamicTags'] as Record<string, string> ?? {};

		// For toolbar blocks, sync textContent from voxelDynamicContent attribute
		if (isToolbarBlock) {
			const dynamicContent = (attrs as Record<string, unknown>)['voxelDynamicContent'] as string ?? '';
			if (dynamicContent) {
				tags['textContent'] = dynamicContent;
			} else {
				delete tags['textContent'];
			}
		}

		return tags;
	}, [getBlockAttributes, isToolbarBlock]);

	// Write a single field's tag value
	const setFieldTag = useCallback((fieldKey: string, value: string) => {
		if (!wpData) return;

		// For toolbar blocks, textContent maps to voxelDynamicContent
		if (isToolbarBlock && fieldKey === 'textContent') {
			wpData.dispatch('core/block-editor').updateBlockAttributes(clientId, {
				voxelDynamicContent: value,
			});
			return;
		}

		const currentTags = getVoxelTags();
		const updatedTags = { ...currentTags };

		if (value) {
			updatedTags[fieldKey] = value;
		} else {
			delete updatedTags[fieldKey];
		}

		// Remove textContent from voxelDynamicTags — it's stored in voxelDynamicContent
		if (isToolbarBlock) {
			delete updatedTags['textContent'];
		}

		wpData.dispatch('core/block-editor').updateBlockAttributes(clientId, {
			voxelDynamicTags: updatedTags,
		});
	}, [clientId, getVoxelTags, isToolbarBlock]);

	/**
	 * Read the current DOM value of a body-observer field (CSS Classes, Custom ID,
	 * Text Content) to pre-fill the DynamicTagBuilder when no tag exists yet.
	 */
	const getFieldInitialContent = useCallback((fieldKey: string): string => {
		// For toolbar blocks (text/button), read from the block's voxelDynamicContent
		// attribute or the editor DOM text — the portal isn't near any input.
		if (isToolbarBlock && fieldKey === 'textContent') {
			const attrs = getBlockAttributes();
			const dynamicContent = (attrs as Record<string, unknown>)['voxelDynamicContent'] as string ?? '';
			if (dynamicContent) return dynamicContent;

			// Fallback: read rendered text from the editor iframe DOM
			const iframe = document.querySelector<HTMLIFrameElement>('iframe[name="editor-canvas"]');
			const editorDoc = iframe?.contentDocument ?? document;
			const blockEl = editorDoc.querySelector(`[data-block="${clientId}"]`);
			if (blockEl) {
				// Button: NB uses .nectar-blocks-button__text [role="textbox"]
				const btnRichText = blockEl.querySelector('.nectar-blocks-button__text [role="textbox"]');
				if (btnRichText?.textContent) return btnRichText.textContent;
				// Also try .nectar__link (frontend selector)
				const nectarLink = blockEl.querySelector('.nectar__link');
				if (nectarLink?.textContent) return nectarLink.textContent;
				// Text: RichText content
				const richText = blockEl.querySelector('.nectar-blocks__rich-text [role="textbox"]');
				if (richText?.textContent) return richText.textContent;
				// Fallback: any heading/paragraph
				const textEl = blockEl.querySelector('p, h1, h2, h3, h4, h5, h6');
				if (textEl?.textContent) return textEl.textContent;
			}
			return '';
		}

		const portal = portals.find((p) => p.fieldKey === fieldKey);
		if (!portal) return '';
		// Find the nearest input/textarea sibling
		const wrapper = portal.container.closest('.components-base-control__field')
			?? portal.container.closest('.components-base-control')
			?? portal.container.parentElement;
		if (!wrapper) return '';
		const input = wrapper.querySelector('input') ?? wrapper.querySelector('textarea');
		return input?.value ?? '';
	}, [portals, isToolbarBlock, getBlockAttributes, clientId]);

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
		if (bodyObserverOnly) return;
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
					// Prefer placing inside .nectar-component__image-select-simple for scoped CSS
					const imageSelectSimple = componentDiv.querySelector('.nectar-component__image-select-simple');
					const target = imageSelectSimple ?? componentDiv;
					(target as HTMLElement).style.position = 'relative';
					target.appendChild(container);
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

	// Set up MutationObserver on the sidebar (skip for body-observer-only mode)
	useEffect(() => {
		if (bodyObserverOnly) return;
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
		if (bodyObserverOnly) return;
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
	 * Clean up the injected Voxel tab when this block is deselected.
	 * The HOC wrapper component persists even when other blocks are selected,
	 * so we must remove the injected DOM nodes reactively.
	 */
	useEffect(() => {
		if (bodyObserverOnly) return;
		if (!wpData) return;
		const unsubscribe = wpData.subscribe(() => {
			const selectedId = wpData.select('core/block-editor').getSelectedBlockClientId();
			if (selectedId !== clientId) {
				// Remove injected tab and panel when this block is no longer selected
				if (voxelTabRef.current) {
					voxelTabRef.current.remove();
					voxelTabRef.current = null;
				}
				if (voxelTabPanelRef.current) {
					voxelTabPanelRef.current.remove();
					voxelTabPanelRef.current = null;
				}
				setIsVoxelTabActive(false);
			}
		});
		return () => unsubscribe();
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
		if (bodyObserverOnly) return;
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

			// 2. WP Advanced panel fields (CSS Classes + Custom ID)
			const advPanel = document.querySelector('.block-editor-block-inspector__advanced');
			if (advPanel) {
				// 2a. Additional CSS class(es)
				injectAdvPanelField(advPanel, 'cssClasses', 'Additional CSS class(es)', clientId, setPortals);

				// 2b. Custom ID (NB text/button blocks)
				injectAdvPanelField(advPanel, 'customId', 'Custom ID', clientId, setPortals);
			}

			// 3. Text Content in NB "Edit as HTML" popover (rendered on body)
			const htmlPopover = document.querySelector('.nectar-component__popover__content--has-toolbar');
			if (htmlPopover) {
				const textFieldKey = 'textContent';
				const existingTextPortal = htmlPopover.querySelector(
					`.voxel-nb-tag-portal[data-field-key="${textFieldKey}"][data-client-id="${clientId}"]`
				);
				if (!existingTextPortal) {
					const labels = htmlPopover.querySelectorAll('label');
					let textLabel: HTMLLabelElement | null = null;
					labels.forEach((lbl) => {
						if ((lbl.textContent || '').trim() === 'Text Content') {
							textLabel = lbl;
						}
					});
					if (textLabel !== null) {
						const wrapper = ((textLabel as HTMLLabelElement).closest('.components-base-control__field') ?? (textLabel as HTMLLabelElement).parentElement) as HTMLElement | null;
						if (wrapper) {
							const container = document.createElement('span');
							container.className = 'voxel-nb-tag-portal voxel-nb-tag-portal--corner';
							container.setAttribute('data-field-key', textFieldKey);
							container.setAttribute('data-client-id', clientId);
							wrapper.style.position = 'relative';
							wrapper.appendChild(container);
							setPortals((prev) => [...prev, { fieldKey: textFieldKey, container }]);
						}
					}
				}
			}

			// 4. Select Icon popover — Image field (icon-list-item, icon, button custom image)
			const iconPopover = document.querySelector('.nectar-component__icon-select__popover');
			if (iconPopover) {
				const iconFieldKey = 'iconImage';
				const existingIconPortal = iconPopover.querySelector(
					`.voxel-nb-tag-portal[data-field-key="${iconFieldKey}"][data-client-id="${clientId}"]`
				);
				if (!existingIconPortal) {
					const rows = iconPopover.querySelectorAll('.nectar-control-row');
					let imageRow: Element | undefined;
					rows.forEach((row) => {
						const lbl = row.querySelector('.nectar-control-row__label');
						if (!lbl) return;
						const resetWrap = lbl.querySelector('.nectar-control-row__reset-wrap');
						const txt = (resetWrap ?? lbl).textContent?.trim();
						if (txt === 'Image') imageRow = row;
					});

					if (imageRow) {
						const container = document.createElement('span');
						container.className = 'voxel-nb-tag-portal voxel-nb-tag-portal--corner';
						container.setAttribute('data-field-key', iconFieldKey);
						container.setAttribute('data-client-id', clientId);

						// Place inside .nectar-component__image-select-simple for scoped CSS
						const imageSelectSimple = (imageRow as Element).querySelector('.nectar-component__image-select-simple');
						if (imageSelectSimple) {
							(imageSelectSimple as HTMLElement).style.position = 'relative';
							imageSelectSimple.appendChild(container);
							setPortals((prev) => [...prev, { fieldKey: iconFieldKey, container }]);
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
	 * Resolve imageSource or iconImage dynamic tag to an actual image URL.
	 * Same two-step process as VX image block's ImageComponent.tsx.
	 * Runs for both parent blocks (imageSource) and child blocks (iconImage).
	 */
	useEffect(() => {
		const imageTag = voxelTags['imageSource'] || voxelTags['iconImage'];
		// For bodyObserverOnly blocks, only proceed if there's an iconImage tag
		if (bodyObserverOnly && !voxelTags['iconImage']) return;
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

				// Handle Voxel icon format: "svg:72" → attachment ID 72
				let attachmentId: number;
				const svgMatch = rendered.match(/^svg:(\d+)$/);
				if (svgMatch) {
					attachmentId = parseInt(svgMatch[1], 10);
				} else {
					attachmentId = parseInt(rendered, 10);
				}
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
	 * Handles both image blocks (imageSource) and icon blocks (iconImage).
	 */
	useEffect(() => {
		// For bodyObserverOnly blocks, only proceed if there's an iconImage tag
		if (bodyObserverOnly && !voxelTags['iconImage']) return;
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

		// Find the NB block by clientId
		const blockEl = iframeDoc.querySelector(`[data-block="${clientId}"]`) as HTMLElement | null;
		if (!blockEl) return;

		// Determine if this is an icon image or a regular image
		const isIconImage = Boolean(voxelTags['iconImage']);

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
				.voxel-nb-icon-image-preview {
					display: block;
					width: 100%;
					height: 100%;
					object-fit: contain;
				}
				[data-voxel-has-dynamic-image="true"] .nectar-blocks-icon__inner > .nectar-component__icon {
					display: none !important;
				}
			`;
			iframeDoc.head.appendChild(style);
		}

		// Mark the block so our CSS hides the placeholder/icon automatically on re-renders
		blockEl.setAttribute('data-voxel-has-dynamic-image', 'true');

		// Create an <img> element
		const img = iframeDoc.createElement('img');
		img.src = dynamicImageUrl;
		img.alt = '';

		if (isIconImage) {
			// Icon block: inject into .nectar-blocks-icon__inner
			img.className = 'voxel-nb-icon-image-preview';
			img.setAttribute('data-voxel-dynamic', 'iconImage');
			const iconInner = blockEl.querySelector('.nectar-blocks-icon__inner');
			if (iconInner) {
				iconInner.insertBefore(img, iconInner.firstChild);
			} else {
				blockEl.insertBefore(img, blockEl.firstChild);
			}
		} else {
			// Image block: inject at block root
			img.className = 'voxel-nb-image-preview';
			img.setAttribute('data-voxel-dynamic', 'imageSource');
			blockEl.insertBefore(img, blockEl.firstChild);
		}

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
	}, [dynamicImageUrl, clientId, voxelTags]);

	/**
	 * Inject icon image preview into the inspector's .nectar-component__indicator-box.
	 * The indicator box is in the sidebar (inside .nectar-component__icon-select),
	 * AND optionally inside the popover when the icon selector is open.
	 */
	useEffect(() => {
		if (!dynamicImageUrl || !voxelTags['iconImage']) return;
		if (!isSelected) return;

		const injectIndicatorPreview = () => {
			// Only target indicator boxes inside .nectar-component__icon-select
			// (NOT .nectar-component__typography-select which also has indicator-box)
			const indicatorBoxes = document.querySelectorAll('.nectar-component__icon-select .nectar-component__indicator-box');
			indicatorBoxes.forEach((indicatorBox) => {
				// Skip if already injected
				if (indicatorBox.querySelector('.voxel-nb-icon-indicator-preview')) return;

				// Remove the "empty" class — its diagonal line background is for the no-icon state
			indicatorBox.classList.remove('empty');

			const img = document.createElement('img');
			img.className = 'voxel-nb-icon-indicator-preview';
				img.src = dynamicImageUrl;
				img.alt = '';
				img.style.cssText = 'width:20px;height:20px;object-fit:contain;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:2;';

				indicatorBox.appendChild(img);
			});
		};

		// Try immediately and also observe for sidebar/popover changes
		injectIndicatorPreview();

		const observer = new MutationObserver(() => { injectIndicatorPreview(); });
		observer.observe(document.body, { childList: true, subtree: true });

		return () => {
			observer.disconnect();
			document.querySelectorAll('.voxel-nb-icon-indicator-preview').forEach((el) => el.remove());
		};
	}, [dynamicImageUrl, voxelTags, isSelected]);

	return (
		<>
			{/* Resolve dynamic tags and apply to the editor iframe DOM */}
			<BodyFieldResolver
				clientId={clientId}
				voxelTags={voxelTags}
				templateContext={templateContext}
				templatePostType={templatePostType}
				dynamicTitle={(attributes['voxelDynamicTitle'] as string) || ''}
				dynamicCssId={(attributes['voxelDynamicCssId'] as string) || ''}
			/>

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

				// Body fields (CSS Classes, Custom ID, Text Content) use
				// .components-base-control__field instead of .nectar-control-row
				if (!targetComponentDiv && isBodyField(portal.fieldKey)) {
					targetComponentDiv = portal.container.closest('.components-base-control__field')
						?? portal.container.closest('.components-base-control')
						?? null;
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
					value={extractTagContent(voxelTags[activeModalField] || '') || getFieldInitialContent(activeModalField)}
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
			{!bodyObserverOnly && isVoxelTabActive && voxelTabPanelRef.current && createPortal(
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

/**
 * Helper: resolve a dynamic tag expression via the REST API.
 * Returns the unwrapped resolved string, or null on failure.
 */
async function resolveTag(
	expression: string,
	templateContext: string,
	templatePostType: string | undefined,
): Promise<string | null> {
	if (!expression) return null;
	const previewContext: Record<string, string> = { type: templateContext };
	if (templatePostType) previewContext['post_type'] = templatePostType;

	try {
		const result = await apiFetch<{ rendered: string }>({
			path: '/voxel-fse/v1/dynamic-data/render',
			method: 'POST',
			data: { expression, preview_context: previewContext },
		});
		let rendered = result.rendered;
		const m = rendered.match(/@tags\(\)(.*?)@endtags\(\)/s);
		if (m) rendered = m[1];
		return rendered || null;
	} catch {
		return null;
	}
}

/**
 * Helper: find the block element in the editor iframe.
 */
function getBlockElement(clientId: string): { el: HTMLElement; doc: Document } | null {
	const iframe = document.querySelector('iframe[name="editor-canvas"]') as HTMLIFrameElement | null;
	const iframeDoc = iframe?.contentDocument;
	if (!iframeDoc) return null;
	const el = iframeDoc.querySelector(`[data-block="${clientId}"]`) as HTMLElement | null;
	if (!el) return null;
	return { el, doc: iframeDoc };
}

/**
 * Resolves dynamic tags and applies resolved values to the block's DOM in the
 * editor iframe. Handles all field types:
 *
 * From voxelTags:
 * - cssClasses → appends resolved classes to block wrapper className
 * - customId → sets data-custom-id attribute on block wrapper
 * - textContent → injects resolved text into button/text span in iframe
 * - rating → sets data-rating attribute on star-rating block in iframe
 *
 * From direct attributes (child blocks):
 * - dynamicTitle → injects resolved text into accordion/tab title
 * - dynamicCssId → sets id attribute on block wrapper
 *
 * Uses MutationObserver for persistence against NB React re-renders.
 */
function BodyFieldResolver({
	clientId,
	voxelTags,
	templateContext,
	templatePostType,
	dynamicTitle,
	dynamicCssId,
}: {
	clientId: string;
	voxelTags: Record<string, string>;
	templateContext: string;
	templatePostType: string | undefined;
	dynamicTitle: string;
	dynamicCssId: string;
}) {
	const [resolvedClasses, setResolvedClasses] = useState<string | null>(null);
	const [resolvedId, setResolvedId] = useState<string | null>(null);
	const [resolvedText, setResolvedText] = useState<string | null>(null);
	const [resolvedRating, setResolvedRating] = useState<string | null>(null);
	const [resolvedTitle, setResolvedTitle] = useState<string | null>(null);
	const [resolvedCssId, setResolvedCssId] = useState<string | null>(null);
	const classesObserverRef = useRef<MutationObserver | null>(null);
	const idObserverRef = useRef<MutationObserver | null>(null);

	const cssClassesTag = voxelTags['cssClasses'] || '';
	const customIdTag = voxelTags['customId'] || '';
	const textContentTag = voxelTags['textContent'] || '';
	const ratingTag = voxelTags['rating'] || '';

	// ── Resolve cssClasses tag ──
	useEffect(() => {
		if (!cssClassesTag) { setResolvedClasses(null); return; }
		let cancelled = false;
		resolveTag(cssClassesTag, templateContext, templatePostType).then((v) => {
			if (!cancelled) setResolvedClasses(v);
		});
		return () => { cancelled = true; };
	}, [cssClassesTag, templateContext, templatePostType]);

	// ── Resolve customId tag ──
	useEffect(() => {
		if (!customIdTag) { setResolvedId(null); return; }
		let cancelled = false;
		resolveTag(customIdTag, templateContext, templatePostType).then((v) => {
			if (!cancelled) setResolvedId(v);
		});
		return () => { cancelled = true; };
	}, [customIdTag, templateContext, templatePostType]);

	// ── Resolve textContent tag (button/text blocks) ──
	useEffect(() => {
		if (!textContentTag) { setResolvedText(null); return; }
		let cancelled = false;
		resolveTag(textContentTag, templateContext, templatePostType).then((v) => {
			if (!cancelled) setResolvedText(v);
		});
		return () => { cancelled = true; };
	}, [textContentTag, templateContext, templatePostType]);

	// ── Resolve rating tag ──
	useEffect(() => {
		if (!ratingTag) { setResolvedRating(null); return; }
		let cancelled = false;
		resolveTag(ratingTag, templateContext, templatePostType).then((v) => {
			if (!cancelled) setResolvedRating(v);
		});
		return () => { cancelled = true; };
	}, [ratingTag, templateContext, templatePostType]);

	// ── Resolve dynamicTitle (child blocks like accordion-section) ──
	useEffect(() => {
		if (!dynamicTitle) { setResolvedTitle(null); return; }
		let cancelled = false;
		resolveTag(dynamicTitle, templateContext, templatePostType).then((v) => {
			if (!cancelled) setResolvedTitle(v);
		});
		return () => { cancelled = true; };
	}, [dynamicTitle, templateContext, templatePostType]);

	// ── Resolve dynamicCssId (child blocks) ──
	useEffect(() => {
		if (!dynamicCssId) { setResolvedCssId(null); return; }
		let cancelled = false;
		resolveTag(dynamicCssId, templateContext, templatePostType).then((v) => {
			if (!cancelled) setResolvedCssId(v);
		});
		return () => { cancelled = true; };
	}, [dynamicCssId, templateContext, templatePostType]);

	// ── Apply resolved CSS classes to block wrapper ──
	useEffect(() => {
		if (classesObserverRef.current) {
			classesObserverRef.current.disconnect();
			classesObserverRef.current = null;
		}

		const found = getBlockElement(clientId);
		if (!found) return;
		const blockEl = found.el;

		const applyClasses = () => {
			const prev = blockEl.getAttribute('data-voxel-dynamic-classes');
			if (prev) {
				prev.split(/\s+/).forEach((cls) => { if (cls) blockEl.classList.remove(cls); });
			}
			if (resolvedClasses) {
				const classes = resolvedClasses.trim().split(/\s+/).filter(Boolean);
				classes.forEach((cls) => blockEl.classList.add(cls));
				blockEl.setAttribute('data-voxel-dynamic-classes', classes.join(' '));
			} else {
				blockEl.removeAttribute('data-voxel-dynamic-classes');
			}
		};

		applyClasses();
		classesObserverRef.current = new MutationObserver(() => { applyClasses(); });
		classesObserverRef.current.observe(blockEl, { attributes: true, attributeFilter: ['class'] });

		return () => {
			classesObserverRef.current?.disconnect();
			classesObserverRef.current = null;
			const prev = blockEl.getAttribute('data-voxel-dynamic-classes');
			if (prev) {
				prev.split(/\s+/).forEach((cls) => { if (cls) blockEl.classList.remove(cls); });
				blockEl.removeAttribute('data-voxel-dynamic-classes');
			}
		};
	}, [resolvedClasses, clientId]);

	// ── Apply resolved Custom ID (from voxelTags) ──
	useEffect(() => {
		if (idObserverRef.current) {
			idObserverRef.current.disconnect();
			idObserverRef.current = null;
		}

		const found = getBlockElement(clientId);
		if (!found) return;
		const blockEl = found.el;

		const applyId = () => {
			if (resolvedId) {
				blockEl.setAttribute('data-custom-id', resolvedId);
			} else {
				blockEl.removeAttribute('data-custom-id');
			}
		};

		applyId();
		idObserverRef.current = new MutationObserver(() => { applyId(); });
		idObserverRef.current.observe(blockEl, { attributes: true, attributeFilter: ['data-custom-id'] });

		return () => {
			idObserverRef.current?.disconnect();
			idObserverRef.current = null;
			blockEl.removeAttribute('data-custom-id');
		};
	}, [resolvedId, clientId]);

	// ── Apply resolved text content (button/text blocks) ──
	// NB uses React RichText which re-renders and overwrites direct DOM changes.
	//
	// NB text block structure:
	//   <p role="textbox" class="nectar-blocks-text__rich-text">Hello</p>
	//   <div class="nectar-blocks-text__raw-text">...</div>
	//
	// NB button block structure:
	//   <span class="nectar-blocks-button__text">
	//     <div role="textbox" class="nectar-blocks__rich-text">...</div>
	//     <div class="nectar-blocks-button__raw-text">...</div>
	//   </span>
	//
	// Strategy: hide the RichText + raw-text, inject overlay span with same styles.
	useEffect(() => {
		const found = getBlockElement(clientId);
		if (!found) return;
		const { el: blockEl, doc: iframeDoc } = found;

		// Clean up previous overlay
		const prevOverlay = blockEl.querySelector('.voxel-nb-text-overlay');
		if (prevOverlay) prevOverlay.remove();
		blockEl.removeAttribute('data-voxel-has-dynamic-text');

		if (!resolvedText) return;

		// Inject CSS for the text overlay into the iframe
		const styleId = 'voxel-nb-dynamic-text-css';
		if (!iframeDoc.getElementById(styleId)) {
			const style = iframeDoc.createElement('style');
			style.id = styleId;
			style.textContent = `
				/* Text block: hide the <p> RichText and raw-text div */
				[data-voxel-has-dynamic-text="true"] .nectar-blocks-text__rich-text,
				[data-voxel-has-dynamic-text="true"] .nectar-blocks-text__raw-text {
					display: none !important;
				}
				/* Button block: hide the RichText div and raw-text div */
				[data-voxel-has-dynamic-text="true"] .nectar-blocks-button__text > .nectar-blocks__rich-text,
				[data-voxel-has-dynamic-text="true"] .nectar-blocks-button__text > .nectar-blocks-button__raw-text {
					display: none !important;
				}
				/* Text overlay — pointer-events none so clicks pass through */
				.voxel-nb-text-overlay {
					pointer-events: none;
				}
			`;
			iframeDoc.head.appendChild(style);
		}

		const isButton = Boolean(blockEl.querySelector('.nectar-blocks-button__text'));

		if (isButton) {
			// Button: place overlay inside .nectar-blocks-button__text
			const btnTextEl = blockEl.querySelector('.nectar-blocks-button__text');
			if (btnTextEl) {
				const overlay = iframeDoc.createElement('span');
				overlay.className = 'voxel-nb-text-overlay';
				overlay.textContent = resolvedText;

				// Copy computed styles from the RichText
				const richText = btnTextEl.querySelector('[role="textbox"]');
				if (richText) {
					const computed = iframeDoc.defaultView?.getComputedStyle(richText);
					if (computed) {
						overlay.style.fontSize = computed.fontSize;
						overlay.style.fontWeight = computed.fontWeight;
						overlay.style.fontFamily = computed.fontFamily;
						overlay.style.lineHeight = computed.lineHeight;
						overlay.style.color = computed.color;
						overlay.style.letterSpacing = computed.letterSpacing;
						overlay.style.textTransform = computed.textTransform;
					}
				}

				btnTextEl.appendChild(overlay);
			}
		} else {
			// Text block: the RichText is <p class="nectar-blocks-text__rich-text">
			// Place overlay as sibling inside the same parent container
			const richTextEl = blockEl.querySelector('.nectar-blocks-text__rich-text');
			const container = richTextEl?.parentElement;
			if (container) {
				const overlay = iframeDoc.createElement('p');
				overlay.className = 'voxel-nb-text-overlay';
				overlay.textContent = resolvedText;

				// Copy computed styles from the RichText <p> for identical appearance
				const computed = iframeDoc.defaultView?.getComputedStyle(richTextEl);
				if (computed) {
					overlay.style.display = computed.display;
					overlay.style.fontSize = computed.fontSize;
					overlay.style.fontWeight = computed.fontWeight;
					overlay.style.fontFamily = computed.fontFamily;
					overlay.style.lineHeight = computed.lineHeight;
					overlay.style.color = computed.color;
					overlay.style.letterSpacing = computed.letterSpacing;
					overlay.style.textTransform = computed.textTransform;
					overlay.style.textAlign = computed.textAlign;
					overlay.style.padding = computed.padding;
					overlay.style.margin = computed.margin;
					overlay.style.whiteSpace = computed.whiteSpace;
				}

				container.appendChild(overlay);
			}
		}

		blockEl.setAttribute('data-voxel-has-dynamic-text', 'true');

		return () => {
			const el = blockEl.querySelector('.voxel-nb-text-overlay');
			if (el) el.remove();
			blockEl.removeAttribute('data-voxel-has-dynamic-text');
		};
	}, [resolvedText, clientId]);

	// ── Apply resolved rating by updating NB's block attribute ──
	useEffect(() => {
		// Clean up previous overlay if any
		const found = getBlockElement(clientId);
		if (found) {
			const prevOverlay = found.el.querySelector('.voxel-nb-rating-overlay');
			if (prevOverlay) prevOverlay.remove();
			found.el.removeAttribute('data-voxel-has-dynamic-rating');
		}

		if (!resolvedRating) return;

		const ratingNum = parseFloat(resolvedRating);
		if (isNaN(ratingNum)) return;

		// Update NB's native `rating` attribute via the block editor store
		// This makes NB re-render with the correct number of stars
		if (wpData) {
			wpData.dispatch('core/block-editor').updateBlockAttributes(clientId, {
				rating: Math.min(Math.max(ratingNum, 0), 5),
			});
		}

		if (found) {
			found.el.setAttribute('data-voxel-has-dynamic-rating', 'true');
		}
	}, [resolvedRating, clientId]);

	// ── Apply resolved dynamic title (accordion-section + tab-section) ──
	// For accordion-section: overlay text on the title RichText area.
	// For tab-section: overlay text on the tab nav link in the PARENT tabs block.
	useEffect(() => {
		const found = getBlockElement(clientId);
		if (!found) return;
		const { el: blockEl, doc: iframeDoc } = found;

		// Clean up previous overlay
		const prevOverlay = blockEl.querySelector('.voxel-nb-title-overlay');
		if (prevOverlay) prevOverlay.remove();
		blockEl.removeAttribute('data-voxel-has-dynamic-title');

		// Also clean up tab nav overlays
		const prevNavOverlay = iframeDoc.querySelector(`.voxel-nb-tab-title-overlay[data-tab-client-id="${clientId}"]`);
		if (prevNavOverlay) prevNavOverlay.remove();

		if (!resolvedTitle) return;

		// Inject CSS
		const styleId = 'voxel-nb-dynamic-title-css';
		if (!iframeDoc.getElementById(styleId)) {
			const style = iframeDoc.createElement('style');
			style.id = styleId;
			style.textContent = `
				[data-voxel-has-dynamic-title="true"] .nectar-blocks-accordion-section__title__text [role="textbox"],
				[data-voxel-has-dynamic-title="true"] .nectar-blocks-accordion-section__title__text [data-rich-text-placeholder] {
					visibility: hidden !important;
					position: absolute !important;
				}
				.voxel-nb-title-overlay {
					pointer-events: none;
					z-index: 1;
					font: inherit;
					color: inherit;
				}
				.voxel-nb-tab-title-overlay ~ .nectar-blocks-tabs__nav__link__text {
					visibility: hidden !important;
					position: absolute !important;
				}
				.voxel-nb-tab-title-overlay {
					pointer-events: none;
					font: inherit;
					color: inherit;
				}
			`;
			iframeDoc.head.appendChild(style);
		}

		// Accordion-section: inject overlay into the title text area
		const titleTextEl = blockEl.querySelector('.nectar-blocks-accordion-section__title__text');
		if (titleTextEl) {
			const overlay = iframeDoc.createElement('span');
			overlay.className = 'voxel-nb-title-overlay';
			overlay.textContent = resolvedTitle;
			titleTextEl.appendChild(overlay);
			blockEl.setAttribute('data-voxel-has-dynamic-title', 'true');
			return;
		}

		// Tab-section: find the corresponding tab nav link in the parent tabs block.
		// Tab-sections are inner blocks of the tabs parent — find this block's index.
		if (wpData) {
			const block = wpData.select('core/block-editor').getBlock(clientId);
			if (block) {
				const parents = wpData.select('core/block-editor').getBlockParents(clientId);
				for (const parentId of parents) {
					const parentBlock = wpData.select('core/block-editor').getBlock(parentId);
					if (parentBlock?.name === 'nectar-blocks/tabs') {
						const idx = (parentBlock.innerBlocks || []).findIndex(
							(ib: { clientId: string }) => ib.clientId === clientId
						);
						if (idx >= 0) {
							const parentEl = iframeDoc.querySelector(`[data-block="${parentId}"]`);
							if (parentEl) {
								const navLinks = parentEl.querySelectorAll('.nectar-blocks-tabs__nav__link');
								const navLink = navLinks[idx] as HTMLElement | undefined;
								if (navLink) {
									const overlay = iframeDoc.createElement('span');
									overlay.className = 'voxel-nb-tab-title-overlay';
									overlay.setAttribute('data-tab-client-id', clientId);
									overlay.textContent = resolvedTitle;
									navLink.insertBefore(overlay, navLink.firstChild);
									blockEl.setAttribute('data-voxel-has-dynamic-title', 'true');
								}
							}
						}
						break;
					}
				}
			}
		}
	}, [resolvedTitle, clientId]);

	// ── Apply resolved dynamic CSS ID (child blocks) ──
	useEffect(() => {
		const found = getBlockElement(clientId);
		if (!found) return;
		const blockEl = found.el;

		if (resolvedCssId) {
			blockEl.setAttribute('data-voxel-dynamic-css-id', resolvedCssId);
		} else {
			blockEl.removeAttribute('data-voxel-dynamic-css-id');
		}
	}, [resolvedCssId, clientId]);

	return null;
}

// ────────────────────────────────────────────
// Utility functions
// ────────────────────────────────────────────

/**
 * Inject an EnableTag portal into a WordPress Advanced panel field.
 * Matches by label text (e.g. "Additional CSS class(es)", "Custom ID").
 */
function injectAdvPanelField(
	advPanel: Element,
	fieldKey: string,
	labelText: string,
	clientId: string,
	setPortals: (updater: (prev: FieldPortal[]) => FieldPortal[]) => void,
): void {
	const existingPortal = document.querySelector(
		`.voxel-nb-tag-portal[data-field-key="${fieldKey}"][data-client-id="${clientId}"]`
	);
	if (existingPortal) return;

	const labels = advPanel.querySelectorAll('label');
	let matchedLabel: HTMLLabelElement | null = null;
	labels.forEach((lbl) => {
		if ((lbl.textContent || '').trim() === labelText) {
			matchedLabel = lbl;
		}
	});
	if (matchedLabel === null) return;

	const wrapper = ((matchedLabel as HTMLLabelElement).closest('.components-base-control__field') ?? (matchedLabel as HTMLLabelElement).parentElement) as HTMLElement | null;
	if (!wrapper) return;

	const container = document.createElement('span');
	container.className = 'voxel-nb-tag-portal voxel-nb-tag-portal--corner';
	container.setAttribute('data-field-key', fieldKey);
	container.setAttribute('data-client-id', clientId);
	wrapper.style.position = 'relative';
	wrapper.appendChild(container);
	setPortals((prev) => [...prev, { fieldKey, container }]);
}

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

