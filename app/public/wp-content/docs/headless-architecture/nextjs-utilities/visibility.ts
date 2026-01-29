/**
 * Visibility Rule Evaluator for Next.js
 *
 * Evaluates Voxel visibility rules against current context.
 * Copy to: apps/musicalwheel-frontend/lib/blocks/visibility.ts
 */

import type { BlockContext } from './context';

// ============================================================================
// Types
// ============================================================================

/**
 * Visibility rule - supports both formats:
 *
 * Next.js style (original):
 *   { type: 'user:logged_in', args: { value: 'subscriber' } }
 *
 * FSE/Voxel style (from WordPress blocks):
 *   { filterKey: 'user:logged_in', operator: 'equals', value: 'subscriber' }
 */
export interface VisibilityRule {
    // Next.js style
    type?: string;
    args?: {
        value?: string | string[] | boolean;
        compare?: string;
        [key: string]: any;
    };
    // FSE/Voxel style (flat structure)
    filterKey?: string;
    operator?: string;
    value?: string | string[] | boolean;
    id?: string;
}

export interface VisibilityConfig {
    visibilityBehavior?: 'show' | 'hide';
    visibilityRules?: VisibilityRule[];
}

/**
 * Normalized rule structure used internally
 */
interface NormalizedRule {
    type: string;
    value: any;
    operator: string;
    args: Record<string, any>;
}

// ============================================================================
// Main Evaluator
// ============================================================================

/**
 * Evaluate visibility rules and determine if block should render
 */
export function evaluateVisibility(
    config: VisibilityConfig,
    context: BlockContext
): boolean {
    // No rules = always visible
    if (!config.visibilityRules?.length) {
        return true;
    }

    // Evaluate all rules
    const allRulesPass = config.visibilityRules.every(rule =>
        evaluateRule(rule, context)
    );

    // Apply behavior logic
    if (config.visibilityBehavior === 'hide') {
        // Hide if all rules pass, show if any fails
        return !allRulesPass;
    }

    // Default 'show': Show if all rules pass, hide if any fails
    return allRulesPass;
}

// ============================================================================
// Rule Evaluators
// ============================================================================

/**
 * Normalize a visibility rule to internal format
 * Handles both Next.js style and FSE/Voxel style
 */
function normalizeRule(rule: VisibilityRule): NormalizedRule {
    // Determine the rule type (Next.js uses 'type', FSE uses 'filterKey')
    const type = rule.type || rule.filterKey || '';

    // Determine the value (Next.js uses 'args.value', FSE uses flat 'value')
    const value = rule.args?.value ?? rule.value;

    // Determine the operator (Next.js uses 'args.compare', FSE uses flat 'operator')
    const operator = rule.args?.compare ?? rule.operator ?? 'equals';

    // Merge all args for complex rules
    const args = {
        ...rule.args,
        value,
        compare: operator,
        // Include any other flat properties that might be used
        start: rule.args?.start,
        end: rule.args?.end,
        key: rule.args?.key,
        tag: rule.args?.tag,
    };

    return { type, value, operator, args };
}

/**
 * Evaluate a single visibility rule
 * Supports both Next.js style and FSE/Voxel style formats
 */
function evaluateRule(rule: VisibilityRule, context: BlockContext): boolean {
    const { type, value, operator, args } = normalizeRule(rule);

    switch (type) {
        // ---- User Rules ----
        case 'user:logged_in':
            return !!context.user;

        case 'user:logged_out':
            return !context.user;

        case 'user:role':
            return context.user?.roles?.includes(value as string) ?? false;

        case 'user:verified':
            return context.user?.verified ?? false;

        case 'user:plan':
            return context.user?.plan === value;

        case 'user:can_create_post':
            return context.user?.canCreate?.includes(value as string) ?? false;

        case 'user:owns_post':
            return context.post?.authorId === context.user?.id;

        case 'user:bookmarked_post':
            return context.user?.bookmarks?.includes(context.post?.id) ?? false;

        case 'user:following_author':
            return context.user?.following?.includes(context.post?.authorId) ?? false;

        case 'user:followed_by_author':
            return context.post?.author?.following?.includes(context.user?.id) ?? false;

        // ---- Author Rules ----
        case 'author:verified':
            return context.post?.author?.verified ?? false;

        case 'author:rating':
            return evaluateComparison(
                context.post?.author?.rating,
                operator,
                value
            );

        // ---- Post Rules ----
        case 'post:status':
            return context.post?.status === value;

        case 'post:type':
            return context.post?.type === value;

        case 'post:has_reviews':
            return (context.post?.reviewCount ?? 0) > 0;

        case 'post:is_claimed':
            return context.post?.claimed ?? false;

        case 'post:has_claims':
            return (context.post?.claimCount ?? 0) > 0;

        case 'post:field_is_set':
            return hasFieldValue(context.post, value as string);

        case 'post:is_boosted':
            return context.post?.boosted ?? false;

        case 'post:product_enabled':
            return context.post?.productsEnabled ?? false;

        case 'post:has_orders':
            return (context.post?.orderCount ?? 0) > 0;

        // ---- Date/Time Rules ----
        case 'datetime:day':
            return evaluateDayRule(value as string[]);

        case 'datetime:time':
            return evaluateTimeRange(args.start as string, args.end as string);

        case 'datetime:date':
            return evaluateDateRange(args.start as string, args.end as string);

        // ---- Other Rules ----
        case 'site:page_is':
            return context.page?.slug === value;

        case 'request:param':
            return context.queryParams?.[args.key as string] === value;

        case 'dtag:equals':
            return resolveDynamicTag(args.tag as string, context) === value;

        default:
            console.warn(`Unknown visibility rule type: ${type}`);
            return true; // Unknown rules pass by default
    }
}

// ============================================================================
// Helper Functions
// ============================================================================

function evaluateComparison(
    actual: any,
    operator: string,
    expected: any
): boolean {
    switch (operator) {
        case 'equals':
        case '=':
            return actual === expected;
        case 'not_equals':
        case '!=':
            return actual !== expected;
        case 'greater':
        case '>':
            return Number(actual) > Number(expected);
        case 'greater_or_equals':
        case '>=':
            return Number(actual) >= Number(expected);
        case 'less':
        case '<':
            return Number(actual) < Number(expected);
        case 'less_or_equals':
        case '<=':
            return Number(actual) <= Number(expected);
        default:
            return actual === expected;
    }
}

function hasFieldValue(post: any, fieldKey: string): boolean {
    if (!post || !fieldKey) return false;
    const value = post.fields?.[fieldKey];
    if (value === null || value === undefined || value === '') return false;
    if (Array.isArray(value)) return value.length > 0;
    return true;
}

function evaluateDayRule(days: string[]): boolean {
    if (!days?.length) return true;
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = dayNames[new Date().getDay()];
    return days.map(d => d.toLowerCase()).includes(today);
}

function evaluateTimeRange(start: string, end: string): boolean {
    if (!start && !end) return true;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const parseTime = (time: string): number => {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + (m || 0);
    };

    if (start && currentMinutes < parseTime(start)) return false;
    if (end && currentMinutes > parseTime(end)) return false;
    return true;
}

function evaluateDateRange(start: string, end: string): boolean {
    if (!start && !end) return true;
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (start) {
        const startDate = new Date(start);
        startDate.setHours(0, 0, 0, 0);
        if (now < startDate) return false;
    }

    if (end) {
        const endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999);
        if (now > endDate) return false;
    }

    return true;
}

function resolveDynamicTag(tag: string, context: BlockContext): any {
    // Basic dynamic tag resolution
    // Format: @context.property.subproperty
    if (!tag?.startsWith('@')) return tag;

    const path = tag.slice(1).split('.');
    const [contextKey, ...props] = path;

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
        default:
            return null;
    }

    for (const prop of props) {
        value = value?.[prop];
    }

    return value;
}
