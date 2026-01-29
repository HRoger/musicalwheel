/**
 * Template Select Control
 *
 * Specialized Select2Control for FSE templates.
 * - FSE templates and template-parts only (no pages, posts, blocks)
 * - Grouped by type with visual separators
 * - Lazy loads templates when dropdown opens
 * - Dynamic tag support with @tags() wrapper
 *
 * @package VoxelFSE
 */

// @ts-nocheck - WordPress components types are incomplete
import { useCallback } from 'react';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import Select2Control from './Select2Control';
import type { Select2Group, Select2Option } from './Select2Control';

export interface TemplateSelectControlProps {
	/** Control label */
	label: string;
	/** Current value (template id or dynamic tag expression) */
	value: string;
	/** Change handler */
	onChange: (value: string) => void;
	/** Placeholder text */
	placeholder?: string;
	/** Context for dynamic tag builder */
	context?: string;
}

/**
 * Fetch all FSE templates (templates + template-parts)
 * Returns grouped results for dropdown display
 */
async function fetchAllFSETemplates(): Promise<Select2Group[]> {
	const [templates, templateParts] = await Promise.all([
		apiFetch<Array<{ id: string; title: { rendered: string }; slug: string }>>({
			path: '/wp/v2/templates',
		}).catch(() => []),
		apiFetch<Array<{ id: string; title: { rendered: string }; slug: string; area: string }>>({
			path: '/wp/v2/template-parts',
		}).catch(() => []),
	]);

	// Map and sort templates alphabetically by title
	const sortedTemplates = templates
		.map((item) => ({
			id: item.id,
			title: item.title?.rendered || item.slug || `Template ${item.id}`,
			type: 'fse-template',
		}))
		.sort((a, b) => a.title.localeCompare(b.title));

	const sortedTemplateParts = templateParts
		.map((item) => ({
			id: item.id,
			title: `${item.title?.rendered || item.slug} (${item.area || 'part'})`,
			type: 'template-part',
		}))
		.sort((a, b) => a.title.localeCompare(b.title));

	return [
		{
			label: __('FSE Templates', 'voxel-fse'),
			type: 'fse-template',
			items: sortedTemplates,
		},
		{
			label: __('Template Parts', 'voxel-fse'),
			type: 'template-part',
			items: sortedTemplateParts,
		},
	];
}

/**
 * Fetch a single template by ID (for initial load when value is set)
 */
async function fetchTemplate(id: string): Promise<Select2Option | null> {
	if (!id || !id.includes('//')) return null;

	// Try templates first
	try {
		const data = await apiFetch<{ id: string; title: { rendered: string }; slug: string }>({
			path: `/wp/v2/templates/${encodeURIComponent(id)}`,
		});
		return {
			id: data.id,
			title: data.title?.rendered || data.slug || `Template ${id}`,
			type: 'fse-template',
		};
	} catch {
		// Not found, try template-parts
	}

	// Try template-parts
	try {
		const data = await apiFetch<{ id: string; title: { rendered: string }; slug: string }>({
			path: `/wp/v2/template-parts/${encodeURIComponent(id)}`,
		});
		return {
			id: data.id,
			title: data.title?.rendered || data.slug || `Template Part ${id}`,
			type: 'template-part',
		};
	} catch {
		// Not found
	}

	return null;
}

export default function TemplateSelectControl({
	label,
	value,
	onChange,
	placeholder = __('Select template...', 'voxel-fse'),
	context = 'post',
}: TemplateSelectControlProps) {
	// Memoized fetch callbacks
	const handleFetch = useCallback(() => fetchAllFSETemplates(), []);
	const handleFetchSingle = useCallback((id: string) => fetchTemplate(id), []);

	return (
		<Select2Control
			label={label}
			value={value}
			onChange={onChange}
			placeholder={placeholder}
			onFetch={handleFetch}
			onFetchSingle={handleFetchSingle}
			enableDynamicTags={true}
			context={context}
			emptyMessage={__('No templates found', 'voxel-fse')}
			filterPlaceholder={__('Filter templates...', 'voxel-fse')}
		/>
	);
}
