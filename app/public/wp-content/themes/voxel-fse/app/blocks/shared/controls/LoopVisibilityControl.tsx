/**
 * LoopVisibilityControl Component
 *
 * Reusable control for Loop Repeater Row and Row Visibility features.
 * Used in repeater fields across blocks (advanced-list, search-form, listing-plans).
 *
 * Usage:
 * - For blocks needing BOTH loop + visibility: showLoopSection={true}
 * - For blocks needing visibility ONLY: showLoopSection={false} (default)
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import {
    SelectControl,
    TextControl,
    Button,
} from '@wordpress/components';
import { SectionHeading } from './SectionHeading';
import { getVisibilityRuleLabel, type VisibilityRule } from './ElementVisibilityModal';
import './LoopVisibilityControl.css';

export interface LoopVisibilityControlProps {
    /** Unique ID of the item (for debugging/keys) */
    itemId?: string;

    // ===== VISIBILITY SECTION (always shown) =====
    /** Current visibility mode: 'show' or 'hide' */
    rowVisibility: 'show' | 'hide';
    /** Array of visibility rules */
    visibilityRules: VisibilityRule[];
    /** Callback when visibility mode changes */
    onRowVisibilityChange: (value: 'show' | 'hide') => void;
    /** Callback to open visibility rules modal */
    onEditVisibilityRules: () => void;
    /** Callback to clear all visibility rules */
    onClearVisibilityRules: () => void;

    // ===== LOOP SECTION (optional) =====
    /** Whether to show the Loop Repeater Row section */
    showLoopSection?: boolean;
    /** Loop source (e.g., 'author', 'user') */
    loopSource?: string;
    /** Loop property (e.g., 'role') */
    loopProperty?: string;
    /** Loop limit value */
    loopLimit?: string;
    /** Loop offset value */
    loopOffset?: string;
    /** Callback to open loop editor modal */
    onEditLoop?: () => void;
    /** Callback to clear loop configuration */
    onClearLoop?: () => void;
    /** Callback when loop limit changes */
    onLoopLimitChange?: (value: string) => void;
    /** Callback when loop offset changes */
    onLoopOffsetChange?: (value: string) => void;

    // ===== STYLING OPTIONS =====
    /** Use inline layout for row visibility (label + dropdown side by side) */
    inlineVisibilityLayout?: boolean;
    /** Custom className for the wrapper */
    className?: string;
}

/**
 * LoopVisibilityControl
 *
 * Renders Loop Repeater Row and/or Row Visibility sections inside a
 * styled wrapper that matches Voxel's inspector styling.
 */
export default function LoopVisibilityControl({
    rowVisibility = 'show',
    visibilityRules = [],
    onRowVisibilityChange,
    onEditVisibilityRules,
    onClearVisibilityRules,
    showLoopSection = false,
    loopSource,
    loopProperty,
    loopLimit,
    loopOffset,
    onEditLoop,
    onClearLoop,
    onLoopLimitChange,
    onLoopOffsetChange,
    inlineVisibilityLayout = false,
    className = '',
}: LoopVisibilityControlProps): JSX.Element {
    const hasVisibilityRules = visibilityRules && visibilityRules.length > 0;
    const hasLoopConfigured = Boolean(loopSource);

    return (
        <div className={`voxel-fse-loop-visibility-wrapper ${className}`.trim()}>
            {/* ===== LOOP REPEATER ROW SECTION ===== */}
            {showLoopSection && (
                <div className="voxel-fse-loop-section">
                    <SectionHeading label={__('Loop repeater row', 'voxel-fse')} />

                    {hasLoopConfigured ? (
                        <p className="voxel-fse-loop-source">
                            @{loopSource}({loopProperty || ''})
                        </p>
                    ) : (
                        <p className="voxel-fse-control-note">
                            {__('No loop configured', 'voxel-fse')}
                        </p>
                    )}

                    <div className="voxel-fse-filter-actions-row">
                        <Button
                            variant="primary"
                            onClick={onEditLoop}
                        >
                            {__('Edit loop', 'voxel-fse')}
                        </Button>
                        {hasLoopConfigured && onClearLoop && (
                            <Button
                                variant="secondary"
                                onClick={onClearLoop}
                            >
                                {__('Remove', 'voxel-fse')}
                            </Button>
                        )}
                    </div>

                    {/* Loop limit and offset - only show when loop is configured */}
                    {hasLoopConfigured && (
                        <>
                            <div className="voxel-fse-loop-field">
                                <TextControl
                                    label={__('Loop limit', 'voxel-fse')}
                                    help={__('If a hard limit is set, the loop will stop there even if there are additional items left', 'voxel-fse')}
                                    value={String(loopLimit ?? '')}
                                    onChange={(value: string) => onLoopLimitChange?.(value)}
                                    type="number"
                                />
                            </div>
                            <div className="voxel-fse-loop-field">
                                <TextControl
                                    label={__('Loop offset', 'voxel-fse')}
                                    help={__('Skip a set amount of items from the start of the loop', 'voxel-fse')}
                                    value={String(loopOffset ?? '')}
                                    onChange={(value: string) => onLoopOffsetChange?.(value)}
                                    type="number"
                                />
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* ===== ROW VISIBILITY SECTION ===== */}
            <div className="voxel-fse-visibility-section">
                <SectionHeading label={__('Row visibility', 'voxel-fse')} />

                {inlineVisibilityLayout ? (
                    <div className="voxel-fse-row-visibility-header">
                        <label className="components-base-control__label">
                            {__('Row visibility', 'voxel-fse')}
                        </label>
                        <SelectControl
                            value={rowVisibility}
                            options={[
                                { label: __('Show this row if', 'voxel-fse'), value: 'show' },
                                { label: __('Hide this row if', 'voxel-fse'), value: 'hide' },
                            ]}
                            onChange={(value: string) => onRowVisibilityChange(value as 'show' | 'hide')}
                            __nextHasNoMarginBottom
                        />
                    </div>
                ) : (
                    <SelectControl
                        value={rowVisibility}
                        options={[
                            { label: __('Show this row if', 'voxel-fse'), value: 'show' },
                            { label: __('Hide this row if', 'voxel-fse'), value: 'hide' },
                        ]}
                        onChange={(value: string) => onRowVisibilityChange(value as 'show' | 'hide')}
                        __nextHasNoMarginBottom
                    />
                )}

                {/* Display visibility rules */}
                {hasVisibilityRules ? (
                    <div className="voxel-fse-visibility-rules-display">
                        {visibilityRules.map((rule, index) => (
                            <p key={rule.id || index} className="voxel-fse-visibility-rule-text">
                                {getVisibilityRuleLabel(rule)}
                            </p>
                        ))}
                    </div>
                ) : (
                    <p className="voxel-fse-control-note">
                        {__('No visibility rules added.', 'voxel-fse')}
                    </p>
                )}

                <div className="voxel-fse-filter-actions-row">
                    <Button
                        variant="primary"
                        onClick={onEditVisibilityRules}
                    >
                        {__('Edit rules', 'voxel-fse')}
                    </Button>
                    {hasVisibilityRules && (
                        <Button
                            variant="secondary"
                            onClick={onClearVisibilityRules}
                        >
                            {__('Remove', 'voxel-fse')}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

// Re-export VisibilityRule type for convenience
export type { VisibilityRule };
