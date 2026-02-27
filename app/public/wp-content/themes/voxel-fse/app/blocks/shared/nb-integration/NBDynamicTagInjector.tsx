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
import DynamicTagPopoverPanel, { extractTagContent, wrapWithTags } from '@shared/controls/DynamicTagPopoverPanel';
import { DynamicTagBuilder } from '@shared/dynamic-tags';
import VoxelTab from '@shared/controls/VoxelTab';
import { useTemplateContext, useTemplatePostType } from '@shared/utils/useTemplateContext';
import { useDeviceType } from '@shared/utils/deviceType';
import { NB_TOOLBAR_TAG_BLOCK_NAMES, NB_CHILD_TITLE_BLOCK_NAMES, type NBBlockConfig } from './nectarBlocksConfig';
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
	if (fieldKey === 'galleryImages') {
		return { label: 'Gallery Images', type: 'image' };
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

	// Track whether we injected gallery images via dynamic tag (to restore originals on disable)
	const galleryInjectedRef = useRef(false);
	const originalGalleryImagesRef = useRef<unknown[] | null>(null);
	// Track whether we injected a video URL via dynamic tag (to restore original on disable)
	const videoInjectedRef = useRef(false);
	const originalVideoRef = useRef<unknown>(null);
	// Track whether we injected a link.href placeholder via dynamic tag (to restore original on disable)
	const linkInjectedRef = useRef(false);
	const originalLinkRef = useRef<unknown>(null);
	// Track whether we injected videoUrl or videoLocal into the link attribute (combined — both share `link`)
	const videoLinkInjectedRef = useRef(false);
	const originalVideoLinkRef = useRef<unknown>(null);
	// Track whether we injected previewImage (video-lightbox preview.image or video-player image)
	const previewImageInjectedRef = useRef(false);
	const originalPreviewImageRef = useRef<unknown>(null);
	// Track whether we injected previewVideo (video-lightbox preview.video)
	const previewVideoInjectedRef = useRef(false);
	const originalPreviewVideoRef = useRef<unknown>(null);
	// Track whether we injected backgroundImage (image-gallery/row/column bgImage)
	const bgImageInjectedRef = useRef(false);
	const originalBgImageRef = useRef<unknown>(null);
	// Track whether we injected backgroundVideo (row/column bgVideo)
	const bgVideoInjectedRef = useRef(false);
	const originalBgVideoRef = useRef<unknown>(null);
	// Track whether we injected imageSource into NB's native `image` attribute
	const nbImageInjectedRef = useRef(false);
	const originalNBImageRef = useRef<unknown>(null);
	// Stable ref for current attributes (avoids infinite loop when setAttributes triggers re-render)
	const attributesRef = useRef(attributes);
	attributesRef.current = attributes;

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
		// Spread to avoid mutating the store object in place
		const tags = { ...((attrs as Record<string, unknown>)['voxelDynamicTags'] as Record<string, string> ?? {}) };

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

	// ── Bi-directional title sync (child blocks: native title → voxelDynamicTitle) ──
	// accordion-section / icon-list-item: watch native `title` attribute
	// tab-section: watch parent tabs block's `tabItems[idx].label`
	// Guard: skip sync when voxelDynamicTitle contains @tags() (user set a dynamic expression).
	const isChildTitleBlock = NB_CHILD_TITLE_BLOCK_NAMES.has(blockConfig.blockName);
	const isTabSection = blockConfig.blockName === 'nectar-blocks/tab-section';
	const prevNativeTitleRef = useRef<string | null>(null);

	useEffect(() => {
		if (!isChildTitleBlock || !wpData) return;

		const unsubscribe = wpData.subscribe(() => {
			const block = wpData.select('core/block-editor').getBlock(clientId);
			if (!block) return;

			let nativeTitle: string | undefined;

			if (isTabSection) {
				// Tab-section: read title from parent tabs block's tabItems[idx].label
				const parents = wpData.select('core/block-editor').getBlockParents(clientId) as string[];
				for (const parentId of parents) {
					const parentBlock = wpData.select('core/block-editor').getBlock(parentId);
					if (parentBlock?.name === 'nectar-blocks/tabs') {
						const idx = (parentBlock.innerBlocks || []).findIndex(
							(ib: { clientId: string }) => ib.clientId === clientId
						);
						if (idx >= 0) {
							const tabItems = (parentBlock.attributes as Record<string, unknown>)['tabItems'] as Array<{ label?: string }> | undefined;
							nativeTitle = tabItems?.[idx]?.label ?? '';
						}
						break;
					}
				}
			} else {
				// accordion-section / icon-list-item: use native title attribute
				nativeTitle = (block.attributes as Record<string, unknown>)['title'] as string | undefined;
			}

			if (nativeTitle === undefined) return;

			// Skip if unchanged from last seen value
			if (nativeTitle === prevNativeTitleRef.current) return;
			prevNativeTitleRef.current = nativeTitle;

			const currentDynamic = (block.attributes as Record<string, unknown>)['voxelDynamicTitle'] as string ?? '';
			// Don't overwrite a dynamic tag expression
			if (currentDynamic.includes('@tags(')) return;

			// Sync native title → voxelDynamicTitle (plain text, no @tags wrapper)
			if (nativeTitle !== currentDynamic) {
				setAttributes({ voxelDynamicTitle: nativeTitle });
			}
		});

		return () => { unsubscribe(); };
	}, [isChildTitleBlock, isTabSection, clientId, setAttributes]);

	// ── Reverse sync: voxelDynamicTitle (plain text) → NB native title ──
	// When user types plain text in "Edit Title as HTML", update NB's native title
	// so the iframe title matches. Skip when value contains @tags() (overlay handles it).
	const dynamicTitleAttr = (attributes['voxelDynamicTitle'] as string) ?? '';
	useEffect(() => {
		if (!isChildTitleBlock || !wpData) return;
		if (!dynamicTitleAttr) return;
		if (dynamicTitleAttr.includes('@tags(')) return;

		const block = wpData.select('core/block-editor').getBlock(clientId);
		if (!block) return;

		if (isTabSection) {
			// Tab-section: update parent tabs block's tabItems[idx].label
			const parents = wpData.select('core/block-editor').getBlockParents(clientId) as string[];
			for (const parentId of parents) {
				const parentBlock = wpData.select('core/block-editor').getBlock(parentId);
				if (parentBlock?.name === 'nectar-blocks/tabs') {
					const idx = (parentBlock.innerBlocks || []).findIndex(
						(ib: { clientId: string }) => ib.clientId === clientId
					);
					if (idx >= 0) {
						const tabItems = [...((parentBlock.attributes as Record<string, unknown>)['tabItems'] as Array<Record<string, unknown>> || [])];
						const currentLabel = (tabItems[idx]?.['label'] as string) ?? '';
						if (currentLabel === dynamicTitleAttr) break;
						tabItems[idx] = { ...tabItems[idx], label: dynamicTitleAttr };
						prevNativeTitleRef.current = dynamicTitleAttr;
						wpData.dispatch('core/block-editor').updateBlockAttributes(parentId, { tabItems });
					}
					break;
				}
			}
		} else {
			// accordion-section / icon-list-item: update native title attribute
			const nativeTitle = (block.attributes as Record<string, unknown>)['title'] as string | undefined;
			if (nativeTitle === undefined) return;
			if (nativeTitle === dynamicTitleAttr) return;

			prevNativeTitleRef.current = dynamicTitleAttr;
			wpData.dispatch('core/block-editor').updateBlockAttributes(clientId, {
				title: dynamicTitleAttr,
			});
		}
	}, [isChildTitleBlock, isTabSection, clientId, dynamicTitleAttr]);

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

		// Multiple portals can share the same fieldKey (e.g. the sidebar corner portal
		// AND the inline URL-field portal both use 'imageSource'). Try ALL matching
		// portals and return the first non-empty value found.
		const matchingPortals = portals.filter((p) => p.fieldKey === fieldKey);
		if (!matchingPortals.length) return '';

		for (const portal of matchingPortals) {
			// Strategy 1: WP controls (Advanced panel — components-base-control)
			const wpWrapper = portal.container.closest('.components-base-control__field')
				?? portal.container.closest('.components-base-control');
			if (wpWrapper) {
				const wpInput = wpWrapper.querySelector('input') ?? wpWrapper.querySelector('textarea');
				if (wpInput?.value) return wpInput.value;
			}

			// Strategy 2: NB sidebar — inline portals live in __label,
			// input is in the sibling __component div
			const controlRow = portal.container.closest('.nectar-control-row');
			if (controlRow) {
				const componentDiv = controlRow.querySelector('.nectar-control-row__component');
				if (componentDiv) {
					const nbInput = componentDiv.querySelector('input') ?? componentDiv.querySelector('textarea');
					if (nbInput?.value) return nbInput.value;
				}
			}

			// Strategy 3: Corner portals / URL-field portals — container is a sibling
			// of the input inside the same parent wrapper
			const parent = portal.container.parentElement;
			if (parent) {
				const fallbackInput = parent.querySelector('input') ?? parent.querySelector('textarea');
				if (fallbackInput?.value) return fallbackInput.value;
			}
		}

		return '';
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

			// Find the matching control row by label text.
			// Uses for-of + break to take the FIRST match (not last).
			let matchedRow: Element | null = null;
			for (const row of controlRows) {
				const labelEl = row.querySelector('.nectar-control-row__label');
				if (!labelEl) continue;

				const labelText = getLabelText(labelEl);
				if (labelText !== field.labelText) continue;

				// If parentLabelText is set, verify this row is nested inside
				// a section whose heading/button matches parentLabelText.
				// NB uses three patterns for section containers:
				// 1. Nested .nectar-control-row (e.g. Z-Index > Value)
				// 2. .components-panel__body > h2 > button (e.g. Background > Image)
				// 3. .nectar-component__toggle-panel > .toggle button (e.g. Preview > Image)
				if (field.parentLabelText) {
					if (!matchesParentSection(row, field.parentLabelText)) continue;
				}

				matchedRow = row;
				break;
			}

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

			// 5. NB Image Gallery "Edit Photos" dialog
			// The dialog appears in document.body when clicking the gallery block.
			// We inject EnableTag next to the "+ Add Media" button inside
			// .nectar-gallery-editor__grid-controls__right
			const galleryDialog = document.querySelector('.image-gallery-modal');
			if (galleryDialog) {
				const galleryFieldKey = 'galleryImages';
				const existingGalleryPortal = galleryDialog.querySelector(
					`.voxel-nb-tag-portal[data-field-key="${galleryFieldKey}"][data-client-id="${clientId}"]`
				);
				if (!existingGalleryPortal) {
					const galleryFieldConfig = blockConfig.fields.find((f) => f.fieldKey === galleryFieldKey);
					if (galleryFieldConfig) {
						const controlsRight = galleryDialog.querySelector('.nectar-gallery-editor__grid-controls__right');
						if (controlsRight) {
							const container = document.createElement('span');
							container.className = 'voxel-nb-tag-portal voxel-nb-tag-portal--gallery-dialog';
							container.setAttribute('data-field-key', galleryFieldKey);
							container.setAttribute('data-client-id', clientId);
							controlsRight.insertBefore(container, controlsRight.firstChild);
							setPortals((prev) => [...prev, { fieldKey: galleryFieldKey, container }]);
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
				// If rendered is a plain URL (not an attachment ID), use it directly
				if (!attachmentId || isNaN(attachmentId)) {
					if (rendered.startsWith("http://") || rendered.startsWith("https://") || rendered.startsWith("/")) {
						if (!cancelled) setDynamicImageUrl(rendered);
					} else {
						if (!cancelled) setDynamicImageUrl(null);
					}
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
	 * Sync imageSource dynamic tag into NB's native `image` attribute.
	 * This ensures NB's save generates <img src="..."> so PHP can replace it at render time.
	 * When tag is removed, restores the original `image` attribute.
	 */
	useEffect(() => {
		if (blockConfig.blockName !== 'nectar-blocks/image') return;

		const tag = voxelTags['imageSource'];

		// When tag is removed, restore original image attribute
		if (!tag) {
			if (nbImageInjectedRef.current && originalNBImageRef.current !== null) {
				setAttributes({ image: originalNBImageRef.current } as Record<string, unknown>);
				nbImageInjectedRef.current = false;
				originalNBImageRef.current = null;
			}
			return;
		}

		// Already injected — skip to prevent infinite loop
		if (nbImageInjectedRef.current) return;

		let cancelled = false;

		(async () => {
			try {
				const previewContext: Record<string, string> = { type: templateContext };
				if (templatePostType) previewContext['post_type'] = templatePostType;

				const renderResult = await apiFetch<{ rendered: string }>({
					path: '/voxel-fse/v1/dynamic-data/render',
					method: 'POST',
					data: { expression: tag, preview_context: previewContext },
				});
				if (cancelled) return;

				let rendered = renderResult.rendered;
				const wm = rendered.match(/@tags\(\)(.*?)@endtags\(\)/s);
				if (wm) rendered = wm[1];

				let imageUrl = '';
				let nbSizes: Record<string, { url: string; width: number; height: number }> = {};
				let nbSize = 'full';
				let attachId: number | undefined;

				// Plain URL
				if (rendered.startsWith('http://') || rendered.startsWith('https://') || rendered.startsWith('/')) {
					imageUrl = rendered;
					// No attachment ID available — provide a single "full" entry so the dropdown isn't empty
					nbSizes = { full: { url: rendered, width: 0, height: 0 } };
				} else {
					// Numeric attachment ID — fetch URL and sizes
					const attachmentId = parseInt(rendered, 10);
					if (attachmentId && !isNaN(attachmentId)) {
						const media = await apiFetch<{
							id: number;
							source_url: string;
							media_details?: {
								width?: number;
								height?: number;
								sizes?: Record<string, { source_url: string; width: number; height: number }>;
							};
						}>({
							path: `/wp/v2/media/${attachmentId}?context=edit`,
						});
						if (cancelled) return;
						if (media) {
							attachId = media.id;
							imageUrl = media.media_details?.sizes?.['large']?.source_url || media.source_url;
							nbSize = media.media_details?.sizes?.['large'] ? 'large' : 'full';

							// Build NB-compatible sizes object from WP media_details
							const wpSizes = media.media_details?.sizes;
							if (wpSizes) {
								for (const [key, sizeData] of Object.entries(wpSizes)) {
									nbSizes[key] = {
										url: sizeData.source_url,
										width: sizeData.width,
										height: sizeData.height,
									};
								}
							}
							// Always include "full" from source_url
							if (!nbSizes['full']) {
								nbSizes['full'] = {
									url: media.source_url,
									width: media.media_details?.width ?? 0,
									height: media.media_details?.height ?? 0,
								};
							}
						}
					}
				}

				if (cancelled || !imageUrl) return;

				// Save original before overwriting
				if (!nbImageInjectedRef.current) {
					originalNBImageRef.current = attributesRef.current['image'];
				}

				// Set NB's native image attribute with sizes for Resolution dropdown
				const nbImage: Record<string, unknown> = {
					url: imageUrl, alt: '', title: '', type: 'wpm',
					sizes: nbSizes, size: nbSize,
				};
				if (attachId) nbImage['id'] = attachId;
				setAttributes({ image: nbImage } as Record<string, unknown>);
				nbImageInjectedRef.current = true;
			} catch (err) {
				if (!cancelled) console.error('[NB] Failed to sync imageSource to NB attribute:', err);
			}
		})();

		return () => { cancelled = true; };
	// eslint-disable-next-line react-hooks/exhaustive-deps -- attributes accessed via ref
	}, [voxelTags, clientId, setAttributes, blockConfig.blockName, templateContext, templatePostType]);

	/**
	 * Resolve galleryImages dynamic tag and set imageGalleryImages attribute natively.
	 * This lets NB handle all rendering (Swiper, columns, spacing, etc.) so every
	 * inspector control works out of the box.
	 */
	useEffect(() => {
		const galleryTag = voxelTags['galleryImages'];

		// When tag is removed, restore original images
		if (!galleryTag) {
			if (galleryInjectedRef.current && originalGalleryImagesRef.current !== null) {
				setAttributes({ imageGalleryImages: originalGalleryImagesRef.current } as Record<string, unknown>);
				galleryInjectedRef.current = false;
				originalGalleryImagesRef.current = null;
			}
			return;
		}

		// Already injected — skip re-fetching (prevents infinite loop from setAttributes re-render)
		if (galleryInjectedRef.current) return;

		let cancelled = false;

		(async () => {
			try {
				const previewContext: Record<string, string> = { type: templateContext };
				if (templatePostType) {
					previewContext['post_type'] = templatePostType;
				}

				// Step 1: Resolve the dynamic tag to get comma-separated attachment IDs
				const renderResult = await apiFetch<{ rendered: string }>({
					path: '/voxel-fse/v1/dynamic-data/render',
					method: 'POST',
					data: {
						expression: galleryTag,
						preview_context: previewContext,
					},
				});

				if (cancelled) return;

				let rendered = renderResult.rendered;
				const wrapperMatch = rendered.match(/@tags\(\)(.*?)@endtags\(\)/s);
				if (wrapperMatch) {
					rendered = wrapperMatch[1];
				}

				// Parse comma-separated IDs (e.g. "123,456,789")
				const ids = rendered.split(',').map((s) => s.trim()).filter(Boolean);
				if (ids.length === 0) return;

				// Step 2: Fetch full media objects for each attachment ID (NB needs the full structure)
				const mediaObjects: Record<string, unknown>[] = [];
				for (const idStr of ids) {
					if (cancelled) return;
					const attachmentId = parseInt(idStr, 10);
					if (!attachmentId || isNaN(attachmentId)) continue;

					try {
						const media = await apiFetch<Record<string, unknown>>({
							path: `/wp/v2/media/${attachmentId}?context=edit`,
						});

						if (media) {
							// Build the media object in NB's expected format
							const details = media['media_details'] as Record<string, unknown> | undefined;
							const wpSizes = (details?.['sizes'] ?? {}) as Record<string, { source_url?: string; width?: number; height?: number }>;

							// Convert WP REST sizes format to NB format (url instead of source_url)
							const nbSizes: Record<string, { url: string; width?: number; height?: number }> = {};
							for (const [sizeName, sizeData] of Object.entries(wpSizes)) {
								if (sizeData.source_url) {
									nbSizes[sizeName] = {
										url: sizeData.source_url,
										width: sizeData.width,
										height: sizeData.height,
									};
								}
							}

							mediaObjects.push({
								id: media['id'],
								url: (media['source_url'] as string) || '',
								alt: ((media['alt_text'] as string) || ''),
								title: ((media['title'] as Record<string, string>)?.['rendered'] || ''),
								sizes: nbSizes,
								height: details?.['height'],
								width: details?.['width'],
							});
						}
					} catch {
						// Skip individual media fetch errors
					}
				}

				if (cancelled || mediaObjects.length === 0) return;

				// Save original images before overwriting (only on first injection)
				if (!galleryInjectedRef.current) {
					originalGalleryImagesRef.current = (attributesRef.current['imageGalleryImages'] as unknown[]) || [];
				}

				// Set the attribute natively — NB handles all rendering
				setAttributes({ imageGalleryImages: mediaObjects } as Record<string, unknown>);
				galleryInjectedRef.current = true;
			} catch (err) {
				if (!cancelled) {
					console.error('[NB] Failed to resolve dynamic gallery tag:', err);
				}
			}
		})();

		return () => { cancelled = true; };
	// eslint-disable-next-line react-hooks/exhaustive-deps -- attributes accessed via ref to avoid infinite loop
	}, [voxelTags, clientId, templateContext, templatePostType, setAttributes]);

	/**
	 * Resolve video dynamic tag and set the NB video attribute natively.
	 * The tag resolves to a video URL (self-hosted or external).
	 * NB stores video as: { desktop: { source: { url, type } }, tablet: {}, mobile: {} }
	 */
	useEffect(() => {
		const videoTag = voxelTags['video'];

		// When tag is removed, restore original video attribute
		if (!videoTag) {
			if (videoInjectedRef.current && originalVideoRef.current !== null) {
				setAttributes({ video: originalVideoRef.current } as Record<string, unknown>);
				videoInjectedRef.current = false;
				originalVideoRef.current = null;
			}
			return;
		}

		// Already injected — skip re-fetching (prevents infinite loop from setAttributes re-render)
		if (videoInjectedRef.current) return;

		let cancelled = false;

		(async () => {
			try {
				const previewContext: Record<string, string> = { type: templateContext };
				if (templatePostType) {
					previewContext['post_type'] = templatePostType;
				}

				// Step 1: Resolve the dynamic tag
				const renderResult = await apiFetch<{ rendered: string }>({
					path: '/voxel-fse/v1/dynamic-data/render',
					method: 'POST',
					data: {
						expression: videoTag,
						preview_context: previewContext,
					},
				});

				if (cancelled) return;

				let rendered = renderResult.rendered;
				const wrapperMatch = rendered.match(/@tags\(\)(.*?)@endtags\(\)/s);
				if (wrapperMatch) {
					rendered = wrapperMatch[1];
				}

				const videoUrl = rendered.trim();
				if (!videoUrl) return;

				// Check if the resolved value is an attachment ID (numeric) — fetch the URL + mime_type
				const attachmentId = parseInt(videoUrl, 10);
				let finalUrl = videoUrl;
				let mediaMimeType: string | undefined;
				if (attachmentId && !isNaN(attachmentId) && String(attachmentId) === videoUrl) {
					try {
						const media = await apiFetch<{ source_url: string; mime_type?: string }>({
							path: `/wp/v2/media/${attachmentId}?context=edit`,
						});
						if (cancelled) return;
						if (media?.source_url) {
							finalUrl = media.source_url;
							mediaMimeType = media.mime_type;
						}
					} catch {
						// If media fetch fails, try using the raw value as URL
					}
				}

				if (cancelled || !finalUrl) return;

				// Save original video attribute before overwriting
				if (!videoInjectedRef.current) {
					originalVideoRef.current = attributesRef.current['video'];
				}

				// Determine MIME type: prefer media API response, fall back to URL extension
				let mime = mediaMimeType || '';
				if (!mime) {
					const ext = finalUrl.split('?')[0].split('.').pop()?.toLowerCase();
					const mimeMap: Record<string, string> = {
						mp4: 'video/mp4', webm: 'video/webm', ogg: 'video/ogg', ogv: 'video/ogg',
					};
					mime = (ext && mimeMap[ext]) || 'video/mp4';
				}

				// Set video attribute in NB's expected structure.
				// Include source on all breakpoints to prevent NB Controls
				// from crashing on `v.source.type` when responsive mode != desktop.
				const sourceObj = {
					id: 0,
					url: finalUrl,
					type: 'self-hosted' as const,
					mime,
				};
				setAttributes({
					video: {
						desktop: { source: sourceObj },
						tablet: { source: sourceObj },
						mobile: { source: sourceObj },
					},
				} as Record<string, unknown>);
				videoInjectedRef.current = true;
			} catch (err) {
				if (!cancelled) {
					console.error('[NB] Failed to resolve dynamic video tag:', err);
				}
			}
		})();

		return () => { cancelled = true; };
	// eslint-disable-next-line react-hooks/exhaustive-deps -- attributes accessed via ref to avoid infinite loop
	}, [voxelTags, clientId, templateContext, templatePostType, setAttributes]);

	/**
	 * Sync linkUrl dynamic tag into NB's native `link.href` attribute.
	 * When a linkUrl tag is active, we set a placeholder href (`#voxel-dynamic`)
	 * so NB's save function generates the `<a class="nectar__link">` wrapper.
	 * PHP render_block then replaces the placeholder with the resolved URL.
	 * When the tag is removed, we restore the original link attribute.
	 */
	useEffect(() => {
		const linkTag = voxelTags['linkUrl'];

		// When tag is removed, restore original link attribute
		if (!linkTag) {
			if (linkInjectedRef.current && originalLinkRef.current !== null) {
				setAttributes({ link: originalLinkRef.current } as Record<string, unknown>);
				linkInjectedRef.current = false;
				originalLinkRef.current = null;
			}
			return;
		}

		// Already injected — skip (prevents infinite loop from setAttributes re-render)
		if (linkInjectedRef.current) return;

		// Save original link attribute before overwriting
		originalLinkRef.current = attributesRef.current['link'];

		// Set placeholder href so NB's save creates the <a class="nectar__link"> wrapper
		const currentLink = (attributesRef.current['link'] ?? {}) as Record<string, unknown>;
		setAttributes({
			link: { ...currentLink, href: '#voxel-dynamic' },
		} as Record<string, unknown>);
		linkInjectedRef.current = true;
	// eslint-disable-next-line react-hooks/exhaustive-deps -- attributes accessed via ref to avoid infinite loop
	}, [voxelTags, clientId, setAttributes]);

	/**
	 * Sync videoUrl and/or videoLocal dynamic tags into NB's native `link` attribute.
	 * Both fields share the `link` attribute, so we handle them in a single effect to avoid races.
	 * Resolves via REST API → sets actual URL so NB generates valid HTML natively.
	 * PHP replaces the preview URL with the per-post resolved URL at render time.
	 */
	useEffect(() => {
		const videoUrlTag = voxelTags['videoUrl'];
		const videoLocalTag = voxelTags['videoLocal'];

		// When both tags are removed, restore original link
		if (!videoUrlTag && !videoLocalTag) {
			if (videoLinkInjectedRef.current && originalVideoLinkRef.current !== null) {
				setAttributes({ link: originalVideoLinkRef.current } as Record<string, unknown>);
				videoLinkInjectedRef.current = false;
				originalVideoLinkRef.current = null;
			}
			return;
		}

		// Already injected — skip
		if (videoLinkInjectedRef.current) return;

		let cancelled = false;

		(async () => {
			try {
				const previewContext: Record<string, string> = { type: templateContext };
				if (templatePostType) {
					previewContext['post_type'] = templatePostType;
				}

				// Save original link before overwriting
				originalVideoLinkRef.current = attributesRef.current['link'];
				const currentLink = (attributesRef.current['link'] ?? {}) as Record<string, unknown>;
				const linkUpdate = { ...currentLink } as Record<string, unknown>;

				// Resolve videoLocal if present (local video takes priority for link.type)
				if (videoLocalTag) {
					const renderResult = await apiFetch<{ rendered: string }>({
						path: '/voxel-fse/v1/dynamic-data/render',
						method: 'POST',
						data: { expression: videoLocalTag, preview_context: previewContext },
					});
					if (cancelled) return;

					let rendered = renderResult.rendered;
					const wrapperMatch = rendered.match(/@tags\(\)(.*?)@endtags\(\)/s);
					if (wrapperMatch) rendered = wrapperMatch[1];
					const videoUrl = rendered.trim();

					if (videoUrl) {
						// Determine MIME type from URL extension
						const ext = videoUrl.split('?')[0].split('.').pop()?.toLowerCase();
						const mimeMap: Record<string, string> = {
							mp4: 'video/mp4', webm: 'video/webm', ogg: 'video/ogg', ogv: 'video/ogg',
						};
						const mime = (ext && mimeMap[ext]) || 'video/mp4';

						const currentLocalVideo = (currentLink['localVideo'] ?? {}) as Record<string, unknown>;
						linkUpdate['type'] = 'local';
						linkUpdate['localVideo'] = {
							...currentLocalVideo,
							source: { url: videoUrl, type: 'self-hosted', mime },
						};
					}
				}

				// Resolve videoUrl if present
				if (videoUrlTag) {
					const renderResult = await apiFetch<{ rendered: string }>({
						path: '/voxel-fse/v1/dynamic-data/render',
						method: 'POST',
						data: { expression: videoUrlTag, preview_context: previewContext },
					});
					if (cancelled) return;

					let rendered = renderResult.rendered;
					const wrapperMatch = rendered.match(/@tags\(\)(.*?)@endtags\(\)/s);
					if (wrapperMatch) rendered = wrapperMatch[1];
					const externalUrl = rendered.trim();

					if (externalUrl) {
						linkUpdate['externalVideo'] = externalUrl;
						// Only set type to 'external' if no local video tag
						if (!videoLocalTag) {
							linkUpdate['type'] = 'external';
						}
					}
				}

				if (cancelled) return;

				setAttributes({ link: linkUpdate } as Record<string, unknown>);
				videoLinkInjectedRef.current = true;
			} catch (err) {
				if (!cancelled) {
					console.error('[NB] Failed to resolve dynamic video link tags:', err);
				}
			}
		})();

		return () => { cancelled = true; };
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [voxelTags, clientId, templateContext, templatePostType, setAttributes]);

	/**
	 * Sync previewImage dynamic tag into NB's native attribute.
	 * - video-lightbox: `preview.image` (full media object)
	 * - video-player: `image` (simple `{ url, type }`)
	 *
	 * Pattern B: resolve via REST API → fetch media details → set full object.
	 */
	useEffect(() => {
		const tag = voxelTags['previewImage'];

		if (!tag) {
			if (previewImageInjectedRef.current && originalPreviewImageRef.current !== null) {
				const isVideoPlayer = blockConfig.blockName === 'nectar-blocks/video-player';
				if (isVideoPlayer) {
					setAttributes({ image: originalPreviewImageRef.current } as Record<string, unknown>);
				} else {
					// video-lightbox: restore preview.image
					const currentPreview = (attributesRef.current['preview'] ?? {}) as Record<string, unknown>;
					setAttributes({
						preview: { ...currentPreview, image: originalPreviewImageRef.current },
					} as Record<string, unknown>);
				}
				previewImageInjectedRef.current = false;
				originalPreviewImageRef.current = null;
			}
			return;
		}

		if (previewImageInjectedRef.current) return;

		let cancelled = false;

		(async () => {
			try {
				const previewContext: Record<string, string> = { type: templateContext };
				if (templatePostType) {
					previewContext['post_type'] = templatePostType;
				}

				const renderResult = await apiFetch<{ rendered: string }>({
					path: '/voxel-fse/v1/dynamic-data/render',
					method: 'POST',
					data: { expression: tag, preview_context: previewContext },
				});

				if (cancelled) return;

				let rendered = renderResult.rendered;
				const wrapperMatch = rendered.match(/@tags\(\)(.*?)@endtags\(\)/s);
				if (wrapperMatch) rendered = wrapperMatch[1];

				const value = rendered.trim();
				if (!value) return;

				// Try to parse as attachment ID for full media object
				const attachmentId = parseInt(value, 10);
				const isVideoPlayer = blockConfig.blockName === 'nectar-blocks/video-player';

				if (attachmentId && !isNaN(attachmentId) && String(attachmentId) === value) {
					const media = await apiFetch<Record<string, unknown>>({
						path: `/wp/v2/media/${attachmentId}?context=edit`,
					});
					if (cancelled || !media) return;

					if (isVideoPlayer) {
						// video-player: simple { url, type } structure
						if (!previewImageInjectedRef.current) {
							originalPreviewImageRef.current = attributesRef.current['image'];
						}
						setAttributes({
							image: { url: media['source_url'] as string, type: 'wpm' },
						} as Record<string, unknown>);
					} else {
						// video-lightbox: full media object in preview.image
						const details = media['media_details'] as Record<string, unknown> | undefined;
						const wpSizes = (details?.['sizes'] ?? {}) as Record<string, { source_url?: string; width?: number; height?: number }>;
						const nbSizes: Record<string, { url: string; width?: number; height?: number }> = {};
						for (const [sizeName, sizeData] of Object.entries(wpSizes)) {
							if (sizeData.source_url) {
								nbSizes[sizeName] = { url: sizeData.source_url, width: sizeData.width, height: sizeData.height };
							}
						}

						const imageObj = {
							id: media['id'],
							url: (media['source_url'] as string) || '',
							alt: (media['alt_text'] as string) || '',
							title: ((media['title'] as Record<string, string>)?.['rendered'] || ''),
							size: 'large',
							sizes: nbSizes,
							type: 'wpm',
						};

						if (!previewImageInjectedRef.current) {
							const currentPreview = (attributesRef.current['preview'] ?? {}) as Record<string, unknown>;
							originalPreviewImageRef.current = currentPreview['image'];
						}
						const currentPreview = (attributesRef.current['preview'] ?? {}) as Record<string, unknown>;
						setAttributes({
							preview: { ...currentPreview, image: imageObj },
						} as Record<string, unknown>);
					}
					previewImageInjectedRef.current = true;
				} else if (value.startsWith('http')) {
					// Direct URL — set as URL-only
					if (isVideoPlayer) {
						if (!previewImageInjectedRef.current) {
							originalPreviewImageRef.current = attributesRef.current['image'];
						}
						setAttributes({
							image: { url: value, type: 'external' },
						} as Record<string, unknown>);
					} else {
						if (!previewImageInjectedRef.current) {
							const currentPreview = (attributesRef.current['preview'] ?? {}) as Record<string, unknown>;
							originalPreviewImageRef.current = currentPreview['image'];
						}
						const currentPreview = (attributesRef.current['preview'] ?? {}) as Record<string, unknown>;
						setAttributes({
							preview: { ...currentPreview, image: { url: value, alt: '', title: '', type: 'external' } },
						} as Record<string, unknown>);
					}
					previewImageInjectedRef.current = true;
				}
			} catch (err) {
				if (!cancelled) {
					console.error('[NB] Failed to resolve dynamic previewImage tag:', err);
				}
			}
		})();

		return () => { cancelled = true; };
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [voxelTags, clientId, templateContext, templatePostType, setAttributes, blockConfig.blockName]);

	/**
	 * Sync previewVideo dynamic tag into NB's native `preview.video.source`.
	 * Resolves via REST API → sets actual URL so NB generates valid HTML natively.
	 */
	useEffect(() => {
		const tag = voxelTags['previewVideo'];

		if (!tag) {
			if (previewVideoInjectedRef.current && originalPreviewVideoRef.current !== null) {
				const currentPreview = (attributesRef.current['preview'] ?? {}) as Record<string, unknown>;
				setAttributes({
					preview: { ...currentPreview, video: originalPreviewVideoRef.current },
				} as Record<string, unknown>);
				previewVideoInjectedRef.current = false;
				originalPreviewVideoRef.current = null;
			}
			return;
		}

		if (previewVideoInjectedRef.current) return;

		let cancelled = false;

		(async () => {
			try {
				const previewContext: Record<string, string> = { type: templateContext };
				if (templatePostType) {
					previewContext['post_type'] = templatePostType;
				}

				const renderResult = await apiFetch<{ rendered: string }>({
					path: '/voxel-fse/v1/dynamic-data/render',
					method: 'POST',
					data: { expression: tag, preview_context: previewContext },
				});
				if (cancelled) return;

				let rendered = renderResult.rendered;
				const wrapperMatch = rendered.match(/@tags\(\)(.*?)@endtags\(\)/s);
				if (wrapperMatch) rendered = wrapperMatch[1];
				const videoUrl = rendered.trim();
				if (!videoUrl) return;

				// Determine MIME type from URL extension
				const ext = videoUrl.split('?')[0].split('.').pop()?.toLowerCase();
				const mimeMap: Record<string, string> = {
					mp4: 'video/mp4', webm: 'video/webm', ogg: 'video/ogg', ogv: 'video/ogg',
				};
				const mime = (ext && mimeMap[ext]) || 'video/mp4';

				const currentPreview = (attributesRef.current['preview'] ?? {}) as Record<string, unknown>;
				const currentVideo = (currentPreview['video'] ?? {}) as Record<string, unknown>;

				if (!previewVideoInjectedRef.current) {
					originalPreviewVideoRef.current = currentVideo;
				}

				setAttributes({
					preview: {
						...currentPreview,
						video: {
							...currentVideo,
							source: { url: videoUrl, type: 'self-hosted', mime },
						},
					},
				} as Record<string, unknown>);
				previewVideoInjectedRef.current = true;
			} catch (err) {
				if (!cancelled) {
					console.error('[NB] Failed to resolve dynamic previewVideo tag:', err);
				}
			}
		})();

		return () => { cancelled = true; };
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [voxelTags, clientId, templateContext, templatePostType, setAttributes]);

	/**
	 * Sync backgroundImage dynamic tag into NB's native `bgImage` attribute.
	 * Resolves via REST API → sets actual URL so NB generates valid HTML natively.
	 */
	useEffect(() => {
		const tag = voxelTags['backgroundImage'];

		if (!tag) {
			if (bgImageInjectedRef.current && originalBgImageRef.current !== null) {
				setAttributes({ bgImage: originalBgImageRef.current } as Record<string, unknown>);
				bgImageInjectedRef.current = false;
				originalBgImageRef.current = null;
			}
			return;
		}

		if (bgImageInjectedRef.current) return;

		let cancelled = false;

		(async () => {
			try {
				const previewContext: Record<string, string> = { type: templateContext };
				if (templatePostType) {
					previewContext['post_type'] = templatePostType;
				}

				const renderResult = await apiFetch<{ rendered: string }>({
					path: '/voxel-fse/v1/dynamic-data/render',
					method: 'POST',
					data: { expression: tag, preview_context: previewContext },
				});
				if (cancelled) return;

				let rendered = renderResult.rendered;
				const wrapperMatch = rendered.match(/@tags\(\)(.*?)@endtags\(\)/s);
				if (wrapperMatch) rendered = wrapperMatch[1];
				const value = rendered.trim();
				if (!value) return;

				// Try to resolve as attachment ID to get full URL
				let imageUrl = value;
				const attachmentId = parseInt(value, 10);
				if (attachmentId && !isNaN(attachmentId) && String(attachmentId) === value) {
					try {
						const media = await apiFetch<{ source_url: string }>({
							path: `/wp/v2/media/${attachmentId}?context=edit`,
						});
						if (cancelled) return;
						if (media?.source_url) {
							imageUrl = media.source_url;
						}
					} catch {
						// Fall back to using raw value as URL
					}
				}

				if (cancelled || !imageUrl) return;

				if (!bgImageInjectedRef.current) {
					originalBgImageRef.current = attributesRef.current['bgImage'];
				}

				const currentBgImage = (attributesRef.current['bgImage'] ?? {}) as Record<string, unknown>;
				const currentDesktop = (currentBgImage['desktop'] ?? {}) as Record<string, unknown>;
				setAttributes({
					bgImage: {
						...currentBgImage,
						desktop: { ...currentDesktop, url: imageUrl, type: 'wpm' },
					},
				} as Record<string, unknown>);
				bgImageInjectedRef.current = true;
			} catch (err) {
				if (!cancelled) {
					console.error('[NB] Failed to resolve dynamic backgroundImage tag:', err);
				}
			}
		})();

		return () => { cancelled = true; };
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [voxelTags, clientId, templateContext, templatePostType, setAttributes]);

	/**
	 * Sync backgroundVideo dynamic tag into NB's native `bgVideo` attribute.
	 * Resolves via REST API → sets actual URL so NB generates valid HTML natively.
	 * bgVideo structure: { desktop: { source: { url, id, type }, loop }, tablet: {...}, mobile: {...} }
	 */
	useEffect(() => {
		const tag = voxelTags['backgroundVideo'];

		if (!tag) {
			if (bgVideoInjectedRef.current && originalBgVideoRef.current !== null) {
				setAttributes({ bgVideo: originalBgVideoRef.current } as Record<string, unknown>);
				bgVideoInjectedRef.current = false;
				originalBgVideoRef.current = null;
			}
			return;
		}

		if (bgVideoInjectedRef.current) return;

		let cancelled = false;

		(async () => {
			try {
				const previewContext: Record<string, string> = { type: templateContext };
				if (templatePostType) {
					previewContext['post_type'] = templatePostType;
				}

				const renderResult = await apiFetch<{ rendered: string }>({
					path: '/voxel-fse/v1/dynamic-data/render',
					method: 'POST',
					data: { expression: tag, preview_context: previewContext },
				});
				if (cancelled) return;

				let rendered = renderResult.rendered;
				const wrapperMatch = rendered.match(/@tags\(\)(.*?)@endtags\(\)/s);
				if (wrapperMatch) rendered = wrapperMatch[1];
				const value = rendered.trim();
				if (!value) return;

				// Try to resolve as attachment ID to get full URL
				let videoUrl = value;
				const attachmentId = parseInt(value, 10);
				if (attachmentId && !isNaN(attachmentId) && String(attachmentId) === value) {
					try {
						const media = await apiFetch<{ source_url: string; mime_type?: string }>({
							path: `/wp/v2/media/${attachmentId}?context=edit`,
						});
						if (cancelled) return;
						if (media?.source_url) {
							videoUrl = media.source_url;
						}
					} catch {
						// Fall back to using raw value as URL
					}
				}

				if (cancelled || !videoUrl) return;

				if (!bgVideoInjectedRef.current) {
					originalBgVideoRef.current = attributesRef.current['bgVideo'];
				}

				const currentBgVideo = (attributesRef.current['bgVideo'] ?? {}) as Record<string, unknown>;
				const currentDesktop = (currentBgVideo['desktop'] ?? {}) as Record<string, unknown>;
				const currentSource = (currentDesktop['source'] ?? {}) as Record<string, unknown>;
				setAttributes({
					bgVideo: {
						...currentBgVideo,
						desktop: {
							...currentDesktop,
							source: { ...currentSource, url: videoUrl, type: 'wpm' },
						},
					},
				} as Record<string, unknown>);
				bgVideoInjectedRef.current = true;
			} catch (err) {
				if (!cancelled) {
					console.error('[NB] Failed to resolve dynamic backgroundVideo tag:', err);
				}
			}
		})();

		return () => { cancelled = true; };
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [voxelTags, clientId, templateContext, templatePostType, setAttributes]);

	/**
	 * Inject EnableTag portal into the Video Player's "Insert self-hosted URL" input area
	 * inside the editor iframe. The URL field (.nectar-component__video-placeholder__url-field)
	 * appears when the user clicks "Insert self-hosted URL" in the canvas placeholder.
	 */
	useEffect(() => {
		if (blockConfig.blockName !== 'nectar-blocks/video-player') return;
		if (!isSelected) return;

		const injectVideoUrlPortal = () => {
			const found = getBlockElement(clientId);
			if (!found) return;
			const { el: blockEl } = found;

			const urlField = blockEl.querySelector('.nectar-component__video-placeholder__url-field');
			if (!urlField) return;

			// Don't inject twice
			if (urlField.querySelector('.voxel-nb-tag-portal')) return;

			// Clean up any stale portal entries from previous DOM (block re-renders destroy old containers)
			setPortals((prev) => prev.filter((p) => !(p.fieldKey === 'video' && p.container.classList.contains('voxel-nb-tag-portal--video-url'))));

			const container = document.createElement('span');
			container.className = 'voxel-nb-tag-portal voxel-nb-tag-portal--video-url';
			container.setAttribute('data-field-key', 'video');
			container.setAttribute('data-client-id', clientId);

			urlField.appendChild(container);
			setPortals((prev) => [...prev, { fieldKey: 'video', container }]);
		};

		// The URL field appears after clicking "Insert self-hosted URL" — observe iframe for it
		const iframe = document.querySelector('iframe[name="editor-canvas"]') as HTMLIFrameElement | null;
		const iframeDoc = iframe?.contentDocument;
		if (!iframeDoc) return;

		// Inject CSS into iframe for the portal and EnableTag button
		const styleId = 'voxel-nb-video-url-portal-css';
		if (!iframeDoc.getElementById(styleId)) {
			const style = iframeDoc.createElement('style');
			style.id = styleId;
			style.textContent = `
				/* Input row: input + EnableTag button side by side */
				.nectar-component__video-placeholder__url-field {
					display: grid !important;
					grid-template-columns: 1fr auto;
					grid-template-rows: auto auto;
					gap: 0;
				}
				/* Input wrapper spans first column, vertically centered */
				.nectar-component__video-placeholder__url-field .nectar-component__text-control {
					grid-column: 1;
					grid-row: 1;
					align-self: center;
				}
				/* EnableTag portal in second column, first row, aligned with input */
				.voxel-nb-tag-portal--video-url {
					grid-column: 2;
					grid-row: 1;
					display: inline-flex;
					align-items: center;
					align-self: start;
					margin-left: 6px;
					margin-top: 4px;
					flex-shrink: 0;
				}
				/* Save/Cancel buttons span full width below */
				.nectar-component__video-placeholder__url-field__buttons {
					grid-column: 1 / -1;
					grid-row: 2;
				}
				/* EnableTagsButton styles (replicated for iframe context) */
				.voxel-fse-enable-tags {
					position: relative;
					display: flex;
					justify-content: center;
					align-items: center;
					width: 24px;
					height: 24px;
					border: none;
					background: transparent;
					cursor: pointer;
					padding: 0;
					transition: 0.2s ease;
				}
				.voxel-fse-enable-tags:hover {
					transform: scale(1.1);
				}
				.voxel-fse-enable-tags__icon {
					position: relative;
					z-index: 10;
					width: 16px;
					height: 16px;
					display: block;
					background-size: contain;
					background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 206.34 206.34'%3E%3Cpolygon fill='%23000' points='114.63 91.71 114.63 137.56 22.93 45.85 45.85 22.93 22.93 22.93 0 45.85 0 114.63 91.71 206.34 114.63 206.34 114.63 160.49 137.56 160.49 206.34 91.71 206.34 22.93 183.41 22.93 114.63 91.71'/%3E%3Cpolygon fill='%23000' points='160.49 0 68.78 0 45.85 22.93 183.41 22.93 160.49 0'/%3E%3C/svg%3E");
					background-repeat: no-repeat;
					background-position: center;
					filter: invert(1);
				}
				.voxel-fse-enable-tags::after {
					content: "";
					width: 28px;
					height: 28px;
					position: absolute;
					background: radial-gradient(in oklch 115% 150% at 30% 10%, oklch(0.75 0.13 227.09) -30%, oklch(0.63 0.13 250.54) 30%, oklch(0.71 0.23 6.03) 55%, oklch(0.86 0.11 56.4) 110%);
					border-radius: 50px;
					z-index: 1;
					pointer-events: none;
				}
			`;
			iframeDoc.head.appendChild(style);
		}

		// Debounced injection — NB does multiple render passes when the URL field
		// first appears (click → state update → React re-render). We wait 500ms after
		// the LAST mutation to ensure NB has settled before injecting the portal.
		let debounceTimer: ReturnType<typeof setTimeout> | null = null;
		let disposed = false;
		const debouncedInject = () => {
			if (disposed) return;
			if (debounceTimer) clearTimeout(debounceTimer);
			debounceTimer = setTimeout(() => {
				if (disposed) return;
				injectVideoUrlPortal();
			}, 500);
		};

		// Also observe for the URL field appearing/disappearing
		const blockEl = iframeDoc.querySelector(`[data-block="${clientId}"]`);
		if (!blockEl) {
			return () => { disposed = true; if (debounceTimer) clearTimeout(debounceTimer); };
		}

		const observer = new MutationObserver(() => { debouncedInject(); });
		observer.observe(blockEl, { childList: true, subtree: true });

		return () => {
			disposed = true;
			observer.disconnect();
			if (debounceTimer) clearTimeout(debounceTimer);
			// Clean up injected portal
			const found = getBlockElement(clientId);
			if (found) {
				const portal = found.el.querySelector('.voxel-nb-tag-portal--video-url');
				portal?.remove();
			}
			setPortals((prev) => prev.filter((p) => !(p.fieldKey === 'video' && p.container.classList.contains('voxel-nb-tag-portal--video-url'))));
		};
	}, [clientId, isSelected, blockConfig.blockName]);

	/**
	 * Inject EnableTag portal into the Image block's "Enter URL" input area
	 * inside the editor iframe. The URL field (.nectar-component__image-placeholder__url-field)
	 * appears when the user clicks "Insert from URL" in the canvas placeholder.
	 */
	useEffect(() => {
		if (blockConfig.blockName !== 'nectar-blocks/image') return;
		if (!isSelected) return;

		const injectImageUrlPortal = () => {
			const found = getBlockElement(clientId);
			if (!found) return;
			const { el: blockEl } = found;

			const urlField = blockEl.querySelector('.nectar-component__image-placeholder__url-field');
			if (!urlField) return;

			// Don't inject twice
			if (urlField.querySelector('.voxel-nb-tag-portal')) return;

			// Clean up stale portal entries
			setPortals((prev) => prev.filter((p) => !(p.fieldKey === 'imageSource' && p.container.classList.contains('voxel-nb-tag-portal--image-url'))));

			const container = document.createElement('span');
			container.className = 'voxel-nb-tag-portal voxel-nb-tag-portal--image-url';
			container.setAttribute('data-field-key', 'imageSource');
			container.setAttribute('data-client-id', clientId);

			urlField.appendChild(container);
			setPortals((prev) => [...prev, { fieldKey: 'imageSource', container }]);
		};

		const iframe = document.querySelector('iframe[name="editor-canvas"]') as HTMLIFrameElement | null;
		const iframeDoc = iframe?.contentDocument;
		if (!iframeDoc) return;

		// Inject CSS into iframe (same grid layout as video player)
		const styleId = 'voxel-nb-image-url-portal-css';
		if (!iframeDoc.getElementById(styleId)) {
			const style = iframeDoc.createElement('style');
			style.id = styleId;
			style.textContent = `
				.nectar-component__image-placeholder__url-field {
					display: grid !important;
					grid-template-columns: 1fr auto;
					grid-template-rows: auto auto;
					gap: 0;
				}
				.nectar-component__image-placeholder__url-field .nectar-component__text-control {
					grid-column: 1;
					grid-row: 1;
					align-self: center;
				}
				.voxel-nb-tag-portal--image-url {
					grid-column: 2;
					grid-row: 1;
					display: inline-flex;
					align-items: center;
					align-self: start;
					margin-left: 6px;
					margin-top: 4px;
					flex-shrink: 0;
				}
				.nectar-component__image-placeholder__url-field__buttons {
					grid-column: 1 / -1;
					grid-row: 2;
				}
				.voxel-fse-enable-tags {
					position: relative;
					display: flex;
					justify-content: center;
					align-items: center;
					width: 24px;
					height: 24px;
					border: none;
					background: transparent;
					cursor: pointer;
					padding: 0;
					transition: 0.2s ease;
				}
				.voxel-fse-enable-tags:hover { transform: scale(1.1); }
				.voxel-fse-enable-tags__icon {
					position: relative;
					z-index: 10;
					width: 16px;
					height: 16px;
					display: block;
					background-size: contain;
					background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 206.34 206.34'%3E%3Cpolygon fill='%23000' points='114.63 91.71 114.63 137.56 22.93 45.85 45.85 22.93 22.93 22.93 0 45.85 0 114.63 91.71 206.34 114.63 206.34 114.63 160.49 137.56 160.49 206.34 91.71 206.34 22.93 183.41 22.93 114.63 91.71'/%3E%3Cpolygon fill='%23000' points='160.49 0 68.78 0 45.85 22.93 183.41 22.93 160.49 0'/%3E%3C/svg%3E");
					background-repeat: no-repeat;
					background-position: center;
					filter: invert(1);
				}
				.voxel-fse-enable-tags::after {
					content: "";
					width: 28px;
					height: 28px;
					position: absolute;
					background: radial-gradient(in oklch 115% 150% at 30% 10%, oklch(0.75 0.13 227.09) -30%, oklch(0.63 0.13 250.54) 30%, oklch(0.71 0.23 6.03) 55%, oklch(0.86 0.11 56.4) 110%);
					border-radius: 50px;
					z-index: 1;
					pointer-events: none;
				}
			`;
			iframeDoc.head.appendChild(style);
		}

		let debounceTimer: ReturnType<typeof setTimeout> | null = null;
		let disposed = false;
		const debouncedInject = () => {
			if (disposed) return;
			if (debounceTimer) clearTimeout(debounceTimer);
			debounceTimer = setTimeout(() => {
				if (disposed) return;
				injectImageUrlPortal();
			}, 500);
		};

		const blockEl = iframeDoc.querySelector(`[data-block="${clientId}"]`);
		if (!blockEl) {
			return () => { disposed = true; if (debounceTimer) clearTimeout(debounceTimer); };
		}

		const observer = new MutationObserver(() => { debouncedInject(); });
		observer.observe(blockEl, { childList: true, subtree: true });

		return () => {
			disposed = true;
			observer.disconnect();
			if (debounceTimer) clearTimeout(debounceTimer);
			const found = getBlockElement(clientId);
			if (found) {
				const portal = found.el.querySelector('.voxel-nb-tag-portal--image-url');
				portal?.remove();
			}
			setPortals((prev) => prev.filter((p) => !(p.fieldKey === 'imageSource' && p.container.classList.contains('voxel-nb-tag-portal--image-url'))));
		};
	}, [clientId, isSelected, blockConfig.blockName]);

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

		// For the NB Image block (imageSource), NB renders natively via `image` attribute —
		// skip DOM overlay to prevent a duplicate image.
		if (!isIconImage && blockConfig.blockName === 'nectar-blocks/image') return;

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
					object-fit: contain;
				}
				/* Icon block: fill the .nectar-blocks-icon__inner container (NB controls the size) */
				.nectar-blocks-icon__inner > .voxel-nb-icon-image-preview {
					width: 100%;
					height: 100%;
				}
				/* Accordion-section: icon image inside title button */
				.nectar-blocks-accordion-section__title > .voxel-nb-icon-image-preview {
					width: 20px;
					height: 20px;
					flex-shrink: 0;
					margin-right: 0;
				}
				/* Button block: icon image inside <a> tag next to text */
				.nectar-blocks-button a > .voxel-nb-icon-image-preview {
					width: 20px;
					height: 20px;
					flex-shrink: 0;
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
			img.className = 'voxel-nb-icon-image-preview';
			img.setAttribute('data-voxel-dynamic', 'iconImage');

			// Accordion-section: inject into the title button, before the title text
			const accordionTitle = blockEl.querySelector('.nectar-blocks-accordion-section__title');
			if (accordionTitle) {
				accordionTitle.insertBefore(img, accordionTitle.firstChild);
			} else {
				// Button block: inject inside <a> tag, after .nectar-blocks-button__text span
				// NB positions icon AFTER text in DOM; CSS flex-direction: row-reverse flips for "left" alignment
				const buttonText = blockEl.querySelector('.nectar-blocks-button__text');
				if (buttonText && buttonText.parentElement?.tagName === 'A') {
					buttonText.parentElement.insertBefore(img, buttonText.nextSibling);
				} else {
					// Icon block: inject into .nectar-blocks-icon__inner
					const iconInner = blockEl.querySelector('.nectar-blocks-icon__inner');
					if (iconInner) {
						iconInner.insertBefore(img, iconInner.firstChild);
					} else {
						blockEl.insertBefore(img, blockEl.firstChild);
					}
				}
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

	// ── Apply voxelIconSize + voxelIconColor to block's icon container in editor iframe ──
	// Supports: accordion-section (child), button (parent), icon (parent, color only)
	const currentDevice = useDeviceType();
	const isAccordionSection = blockConfig.blockName === 'nectar-blocks/accordion-section';
	const isButtonBlock = blockConfig.blockName === 'nectar-blocks/button';
	const isIconBlock = blockConfig.blockName === 'nectar-blocks/icon';
	const hasIconStyles = isAccordionSection || isButtonBlock || isIconBlock;
	const supportsIconSize = isAccordionSection || isButtonBlock;

	const iconSizeValue = (() => {
		if (!supportsIconSize) return undefined;
		const deviceSuffix = currentDevice === 'desktop' ? '' : `_${currentDevice}`;
		const attrName = `voxelIconSize${deviceSuffix}`;
		let val = attributes[attrName] as number | undefined;
		if (val === undefined && currentDevice === 'tablet') {
			val = attributes['voxelIconSize'] as number | undefined;
		} else if (val === undefined && currentDevice === 'mobile') {
			val = (attributes['voxelIconSize_tablet'] as number | undefined)
				?? (attributes['voxelIconSize'] as number | undefined);
		}
		return val;
	})();
	const iconSizeUnit = (attributes['voxelIconSizeUnit'] as string) || 'px';
	const iconColor = (attributes['voxelIconColor'] as string) || '';

	useEffect(() => {
		if (!hasIconStyles) return;
		const found = getBlockElement(clientId);
		if (!found) return;
		const { el: blockEl, doc: iframeDoc } = found;

		// Inject CSS for icon size + color custom properties
		const styleId = 'voxel-nb-icon-style-css';
		if (!iframeDoc.getElementById(styleId)) {
			const style = iframeDoc.createElement('style');
			style.id = styleId;
			style.textContent = `
				/* Accordion-section: dynamic icon image inside title */
				[data-voxel-icon-size] .nectar-blocks-accordion-section__title > .voxel-nb-icon-image-preview {
					width: var(--voxel-icon-size) !important;
					height: var(--voxel-icon-size) !important;
				}
				/* Accordion-section: native NB icon inside title (non-dynamic) */
				[data-voxel-icon-size] .nectar-blocks-accordion-section__title .nectar-blocks-icon__inner {
					width: var(--voxel-icon-size) !important;
					height: var(--voxel-icon-size) !important;
				}
				[data-voxel-icon-size] .nectar-blocks-accordion-section__title .nectar-blocks-icon__inner .nectar-component__icon {
					width: var(--voxel-icon-size) !important;
					height: var(--voxel-icon-size) !important;
				}
				[data-voxel-icon-color] .nectar-blocks-accordion-section__title .nectar-blocks-icon__inner .nectar-component__icon {
					color: var(--voxel-icon-color) !important;
				}
				/* NB icon block: icon inside .nectar-blocks-icon__inner */
				[data-voxel-icon-color].wp-block-nectar-blocks-icon .nectar-blocks-icon__inner .nectar-component__icon {
					color: var(--voxel-icon-color) !important;
				}
				/* Button block: dynamic icon image inside <a> tag
				 * No space — in editor, [data-voxel-icon-size] and .nectar-blocks-button are the same element */
				[data-voxel-icon-size].nectar-blocks-button a > .voxel-nb-icon-image-preview {
					width: var(--voxel-icon-size) !important;
					height: var(--voxel-icon-size) !important;
				}
			`;
			iframeDoc.head.appendChild(style);
		}

		// Icon size (accordion-section + button)
		if (supportsIconSize && iconSizeValue !== undefined) {
			const sizeStr = `${iconSizeValue}${iconSizeUnit}`;
			blockEl.style.setProperty('--voxel-icon-size', sizeStr);
			blockEl.setAttribute('data-voxel-icon-size', sizeStr);
		} else {
			blockEl.style.removeProperty('--voxel-icon-size');
			blockEl.removeAttribute('data-voxel-icon-size');
		}

		// Icon color (accordion-section, button, icon block)
		if (iconColor) {
			blockEl.style.setProperty('--voxel-icon-color', iconColor);
			blockEl.setAttribute('data-voxel-icon-color', iconColor);
		} else {
			blockEl.style.removeProperty('--voxel-icon-color');
			blockEl.removeAttribute('data-voxel-icon-color');
		}

		// Apply color to SVG <img> via CSS mask technique.
		// CSS `color` doesn't work on <img> elements. Instead, use the img src
		// as a mask-image and apply background-color for recoloring.
		const iconImgSelector = isAccordionSection
			? '.nectar-blocks-accordion-section__title > .voxel-nb-icon-image-preview'
			: isButtonBlock
				? '.nectar-blocks-button a > .voxel-nb-icon-image-preview'
				: isIconBlock
					? '.nectar-blocks-icon__inner > .voxel-nb-icon-image-preview'
					: null;
		if (iconImgSelector) {
			const iconImg = blockEl.querySelector(iconImgSelector) as HTMLImageElement | null;
			if (iconImg) {
				if (iconColor) {
					// Use CSS mask to recolor the SVG image
					iconImg.style.setProperty('-webkit-mask-image', `url(${iconImg.src})`);
					iconImg.style.setProperty('mask-image', `url(${iconImg.src})`);
					iconImg.style.setProperty('-webkit-mask-size', 'contain');
					iconImg.style.setProperty('mask-size', 'contain');
					iconImg.style.setProperty('-webkit-mask-repeat', 'no-repeat');
					iconImg.style.setProperty('mask-repeat', 'no-repeat');
					iconImg.style.setProperty('-webkit-mask-position', 'center');
					iconImg.style.setProperty('mask-position', 'center');
					iconImg.style.setProperty('background-color', iconColor);
					// Make the original image invisible but keep layout
					iconImg.style.setProperty('object-position', '-9999px');
				} else {
					iconImg.style.removeProperty('-webkit-mask-image');
					iconImg.style.removeProperty('mask-image');
					iconImg.style.removeProperty('-webkit-mask-size');
					iconImg.style.removeProperty('mask-size');
					iconImg.style.removeProperty('-webkit-mask-repeat');
					iconImg.style.removeProperty('mask-repeat');
					iconImg.style.removeProperty('-webkit-mask-position');
					iconImg.style.removeProperty('mask-position');
					iconImg.style.removeProperty('background-color');
					iconImg.style.removeProperty('object-position');
				}
			}
		}

		return () => {
			blockEl.style.removeProperty('--voxel-icon-size');
			blockEl.removeAttribute('data-voxel-icon-size');
			blockEl.style.removeProperty('--voxel-icon-color');
			blockEl.removeAttribute('data-voxel-icon-color');
		};
	}, [hasIconStyles, isAccordionSection, isButtonBlock, isIconBlock, supportsIconSize, clientId, iconSizeValue, iconSizeUnit, iconColor, dynamicImageUrl]);

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
				// Body-observer fields (cssClasses, customAttr*, galleryImages) aren't in blockConfig
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

				// Gallery dialog — preview renders in the top-right controls area
				if (!targetComponentDiv && portal.fieldKey === 'galleryImages') {
					const galleryDialog = portal.container.closest('.image-gallery-modal');
					targetComponentDiv = galleryDialog?.querySelector('.nectar-gallery-editor__grid-controls__right')
						?? null;
				}

				// Video URL field — preview renders in the URL field area (inside iframe)
				if (!targetComponentDiv && portal.container.classList.contains('voxel-nb-tag-portal--video-url')) {
					targetComponentDiv = portal.container.closest('.nectar-component__video-placeholder__url-field')
						?? null;
				}

				// Image URL field — preview renders in the URL field area (inside iframe)
				if (!targetComponentDiv && portal.container.classList.contains('voxel-nb-tag-portal--image-url')) {
					targetComponentDiv = portal.container.closest('.nectar-component__image-placeholder__url-field')
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
					<DynamicTagPopoverPanel
						tagContent={tag}
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
				overlay.innerHTML = resolvedText;

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
				overlay.innerHTML = resolvedText;

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
				[data-voxel-has-dynamic-title="true"] .nectar-blocks-icon-list-item__content [role="textbox"],
				[data-voxel-has-dynamic-title="true"] .nectar-blocks-icon-list-item__content [data-rich-text-placeholder] {
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
			overlay.innerHTML = resolvedTitle;
			titleTextEl.appendChild(overlay);
			blockEl.setAttribute('data-voxel-has-dynamic-title', 'true');
			return;
		}

		// Icon-list-item: inject overlay into the list item content area
		const listItemContent = blockEl.querySelector('.nectar-blocks-icon-list-item__content');
		if (listItemContent) {
			const overlay = iframeDoc.createElement('span');
			overlay.className = 'voxel-nb-title-overlay';
			overlay.innerHTML = resolvedTitle;
			listItemContent.appendChild(overlay);
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
									overlay.innerHTML = resolvedTitle;
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

/**
 * Check if a control row is nested inside a section whose heading matches parentLabelText.
 * Walks up the DOM checking three NB section patterns:
 * 1. Nested .nectar-control-row — parent row's label matches (not a scope boundary)
 * 2. .components-panel__body — h2 > button text matches (e.g. "Background") — scope boundary
 * 3. .nectar-component__toggle-panel — toggle button text matches (e.g. "Preview") — scope boundary
 *
 * Toggle-panels and panel-bodies act as **scope boundaries**: if the closest one
 * doesn't match, we return false immediately instead of walking further up.
 * This prevents Preview > Video matching parentLabelText "General Settings"
 * when General Settings is a grandparent containing the Preview toggle-panel.
 */
function matchesParentSection(row: Element, parentLabelText: string): boolean {
	let el: Element | null = row.parentElement;
	while (el) {
		// Pattern 1: nested .nectar-control-row (NOT a scope boundary — keep walking)
		if (el.classList.contains('nectar-control-row')) {
			const parentLabel = el.querySelector(':scope > .nectar-control-row__label');
			if (parentLabel && getLabelText(parentLabel) === parentLabelText) return true;
		}
		// Pattern 2: .components-panel__body — scope boundary
		if (el.classList.contains('components-panel__body')) {
			const heading = el.querySelector(':scope > h2 > button');
			return heading?.textContent?.trim() === parentLabelText;
		}
		// Pattern 3: .nectar-component__toggle-panel — scope boundary
		if (el.classList.contains('nectar-component__toggle-panel')) {
			const toggleBtn = el.querySelector(':scope > .nectar-component__toggle-panel__toggle button');
			return toggleBtn?.textContent?.trim() === parentLabelText;
		}
		// Stop at the sidebar boundary
		if (el.classList.contains('interface-interface-skeleton__sidebar')) break;
		el = el.parentElement;
	}
	return false;
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


