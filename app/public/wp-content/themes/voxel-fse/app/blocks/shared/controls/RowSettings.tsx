/**
 * RowSettings Component
 *
 * PanelBody wrapper around the shared LoopVisibilityControl for NB child/inner blocks.
 * Provides the attributes → callback prop wiring and modal state management.
 *
 * Used by: tab-section, accordion-section, column, icon-list-item, carousel-item
 *
 * @see docs/nectarblocks/nb_tabs-accordion_plan.md
 * @see LoopVisibilityControl.tsx — the reusable control this composes
 *
 * @package VoxelFSE
 */

import { PanelBody } from '@wordpress/components';
import { useState } from 'react';
import { __ } from '@wordpress/i18n';
import LoopVisibilityControl from './LoopVisibilityControl';
import ElementVisibilityModal, { type VisibilityRule } from './ElementVisibilityModal';
import LoopElementModal, { type LoopConfig } from './LoopElementModal';

// ============================================================================
// TYPES
// ============================================================================

export interface RowSettingsAttributes {
	loopEnabled?: boolean;
	loopSource?: string;
	loopProperty?: string;
	loopLimit?: number | string;
	loopOffset?: number | string;
	visibilityBehavior?: 'show' | 'hide';
	visibilityRules?: VisibilityRule[];
	[key: string]: unknown;
}

export interface RowSettingsProps {
	attributes: RowSettingsAttributes;
	setAttributes: (attrs: Partial<RowSettingsAttributes>) => void;
}

// ============================================================================
// HELPERS
// ============================================================================

function normalizeVisibilityRules(rules: unknown): VisibilityRule[] {
	if (!rules) return [];
	if (!Array.isArray(rules)) {
		if (typeof rules === 'object') {
			return Object.values(rules as Record<string, unknown>).filter(
				(rule): rule is VisibilityRule =>
					rule != null && typeof rule === 'object' && typeof (rule as VisibilityRule).id === 'string'
			);
		}
		return [];
	}
	return rules.filter(
		(rule): rule is VisibilityRule =>
			rule != null && typeof rule === 'object' && typeof (rule as VisibilityRule).id === 'string'
	);
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function RowSettings({ attributes, setAttributes }: RowSettingsProps) {
	const [isVisibilityModalOpen, setIsVisibilityModalOpen] = useState(false);
	const [isLoopModalOpen, setIsLoopModalOpen] = useState(false);

	const normalizedRules = normalizeVisibilityRules(attributes.visibilityRules);

	return (
		<PanelBody title={__('Row Settings', 'voxel-fse')} initialOpen={false}>
			<LoopVisibilityControl
				showLoopSection={true}
				loopSource={attributes.loopSource}
				loopProperty={attributes.loopProperty}
				loopLimit={String(attributes.loopLimit ?? '')}
				loopOffset={String(attributes.loopOffset ?? '')}
				onEditLoop={() => setIsLoopModalOpen(true)}
				onClearLoop={() =>
					setAttributes({
						loopEnabled: false,
						loopSource: '',
						loopProperty: '',
						loopLimit: '',
						loopOffset: '',
					})
				}
				onLoopLimitChange={(value) => setAttributes({ loopLimit: value })}
				onLoopOffsetChange={(value) => setAttributes({ loopOffset: value })}
				rowVisibility={attributes.visibilityBehavior ?? 'show'}
				visibilityRules={normalizedRules}
				onRowVisibilityChange={(value) => setAttributes({ visibilityBehavior: value })}
				onEditVisibilityRules={() => setIsVisibilityModalOpen(true)}
				onClearVisibilityRules={() => setAttributes({ visibilityRules: [] })}
			/>

			<LoopElementModal
				isOpen={isLoopModalOpen}
				onClose={() => setIsLoopModalOpen(false)}
				config={{
					loopSource: attributes.loopSource ?? '',
					loopLimit: attributes.loopLimit ?? '',
					loopOffset: attributes.loopOffset ?? '',
					loopProperty: attributes.loopProperty,
				}}
				onSave={(loopConfig: LoopConfig) => {
					setAttributes({
						loopEnabled: true,
						loopSource: loopConfig.loopSource,
						loopProperty: loopConfig.loopProperty,
						loopLimit: loopConfig.loopLimit,
						loopOffset: loopConfig.loopOffset,
					});
				}}
			/>

			<ElementVisibilityModal
				isOpen={isVisibilityModalOpen}
				onClose={() => setIsVisibilityModalOpen(false)}
				rules={normalizedRules}
				onSave={(rules) => setAttributes({ visibilityRules: rules })}
			/>
		</PanelBody>
	);
}
