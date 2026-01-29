/**
 * Loop Element Iterator for Next.js
 *
 * Resolves loop sources and iterates block content.
 * Copy to: apps/musicalwheel-frontend/lib/blocks/loop.ts
 */

import type { BlockContext } from './context';

// ============================================================================
// Types
// ============================================================================

export interface LoopConfig {
    loopEnabled?: boolean;
    loopSource?: string;      // e.g., "@post.related_posts"
    loopProperty?: string;    // Optional sub-property path
    loopLimit?: number | '';
    loopOffset?: number | '';
}

export interface LoopItem {
    data: any;
    index: number;
    isFirst: boolean;
    isLast: boolean;
    total: number;
}

// ============================================================================
// Main Iterator
// ============================================================================

/**
 * Resolve loop source and return items to iterate
 *
 * @returns Array of LoopItem objects, or [null] if loop disabled/empty
 */
export function resolveLoop(
    config: LoopConfig,
    context: BlockContext
): LoopItem[] {
    // Loop disabled or no source = single null item (render once)
    if (!config.loopEnabled || !config.loopSource) {
        return [createLoopItem(null, 0, 1)];
    }

    // Resolve the source data
    let items = resolveDynamicPath(config.loopSource, context);

    // Apply property path if specified
    if (config.loopProperty && items) {
        items = getNestedProperty(items, config.loopProperty);
    }

    // Must be an array
    if (!Array.isArray(items)) {
        console.warn(`Loop source "${config.loopSource}" did not resolve to array`);
        return [createLoopItem(null, 0, 1)];
    }

    // Apply offset
    if (config.loopOffset) {
        const offset = Number(config.loopOffset);
        if (offset > 0) {
            items = items.slice(offset);
        }
    }

    // Apply limit
    if (config.loopLimit) {
        const limit = Number(config.loopLimit);
        if (limit > 0) {
            items = items.slice(0, limit);
        }
    }

    // Empty result = single null item
    if (items.length === 0) {
        return [createLoopItem(null, 0, 1)];
    }

    // Map to LoopItem objects
    return items.map((data, index) =>
        createLoopItem(data, index, items.length)
    );
}

/**
 * Check if loop is enabled and has items
 */
export function hasLoopItems(config: LoopConfig, context: BlockContext): boolean {
    if (!config.loopEnabled || !config.loopSource) {
        return false;
    }

    const items = resolveLoop(config, context);
    return items.length > 0 && items[0].data !== null;
}

// ============================================================================
// Dynamic Path Resolution
// ============================================================================

/**
 * Resolve a dynamic tag path to its value
 *
 * Supports formats:
 * - @post.related_posts
 * - @user.orders
 * - @term.children
 * - @site.recent_posts
 */
export function resolveDynamicPath(path: string, context: BlockContext): any {
    if (!path) return null;

    // Remove @ prefix if present
    const cleanPath = path.startsWith('@') ? path.slice(1) : path;
    const parts = cleanPath.split('.');

    if (parts.length === 0) return null;

    const [contextKey, ...propertyPath] = parts;

    // Get the root context object
    let value: any;
    switch (contextKey) {
        case 'post':
            value = context.post;
            break;
        case 'user':
            value = context.user;
            break;
        case 'term':
            value = context.term;
            break;
        case 'site':
            value = context.site;
            break;
        case 'loop':
            value = context.loopItem;
            break;
        default:
            console.warn(`Unknown context key: ${contextKey}`);
            return null;
    }

    // Navigate the property path
    for (const prop of propertyPath) {
        if (value === null || value === undefined) {
            return null;
        }
        value = value[prop];
    }

    return value;
}

// ============================================================================
// Helper Functions
// ============================================================================

function createLoopItem(data: any, index: number, total: number): LoopItem {
    return {
        data,
        index,
        isFirst: index === 0,
        isLast: index === total - 1,
        total,
    };
}

function getNestedProperty(obj: any, path: string): any {
    if (!path) return obj;

    const parts = path.split('.');
    let value = obj;

    for (const part of parts) {
        if (value === null || value === undefined) {
            return null;
        }
        value = value[part];
    }

    return value;
}

// ============================================================================
// Loop Context Helpers
// ============================================================================

/**
 * Get the current loop item from context
 */
export function getCurrentLoopItem(context: BlockContext): LoopItem | null {
    return context.loopItem ?? null;
}

/**
 * Get a value from the current loop item
 */
export function getLoopValue(context: BlockContext, path?: string): any {
    const item = context.loopItem;
    if (!item?.data) return null;

    if (!path) return item.data;

    return getNestedProperty(item.data, path);
}

/**
 * Check if currently inside a loop
 */
export function isInLoop(context: BlockContext): boolean {
    return context.loopItem?.data !== null && context.loopItem?.data !== undefined;
}
