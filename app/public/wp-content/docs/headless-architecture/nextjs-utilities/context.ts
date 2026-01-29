/**
 * Block Context Provider for Next.js
 *
 * Provides context data for visibility rules and loop iteration.
 * Copy to: apps/musicalwheel-frontend/lib/blocks/context.ts
 */

import { createContext, useContext } from 'react';
import type { LoopItem } from './loop';

// ============================================================================
// Types
// ============================================================================

export interface UserContext {
    id: number | string;
    roles: string[];
    verified: boolean;
    plan?: string;
    canCreate?: string[];      // Post types user can create
    bookmarks?: number[];      // Bookmarked post IDs
    following?: number[];      // User IDs being followed
}

export interface PostAuthor {
    id: number | string;
    verified: boolean;
    rating?: number;
    following?: number[];
}

export interface PostContext {
    id: number | string;
    type: string;
    status: string;
    authorId: number | string;
    author?: PostAuthor;
    fields?: Record<string, any>;
    reviewCount?: number;
    claimed?: boolean;
    claimCount?: number;
    boosted?: boolean;
    productsEnabled?: boolean;
    orderCount?: number;
}

export interface TermContext {
    id: number | string;
    taxonomy: string;
    slug: string;
    name: string;
    parent?: number;
    children?: TermContext[];
}

export interface SiteContext {
    url: string;
    name: string;
    timezone?: string;
}

export interface PageContext {
    slug: string;
    template?: string;
}

export interface BlockContext {
    // Core context objects
    user: UserContext | null;
    post: PostContext | null;
    term: TermContext | null;
    site: SiteContext;
    page: PageContext | null;

    // URL query parameters
    queryParams?: Record<string, string>;

    // Loop context (set by withVoxelFeatures)
    loopItem?: LoopItem;
    loopIndex?: number;
}

// ============================================================================
// React Context
// ============================================================================

const defaultContext: BlockContext = {
    user: null,
    post: null,
    term: null,
    site: {
        url: '',
        name: '',
    },
    page: null,
    queryParams: {},
};

export const BlockContextReact = createContext<BlockContext>(defaultContext);

/**
 * Hook to access block context
 */
export function useBlockContext(): BlockContext {
    return useContext(BlockContextReact);
}

// ============================================================================
// Context Builder
// ============================================================================

/**
 * Build block context from Next.js page props
 *
 * Call this in your page component and pass to BlockContextProvider
 */
export function buildBlockContext(props: {
    user?: any;
    post?: any;
    term?: any;
    site?: any;
    page?: any;
    queryParams?: Record<string, string>;
}): BlockContext {
    return {
        user: props.user ? normalizeUserContext(props.user) : null,
        post: props.post ? normalizePostContext(props.post) : null,
        term: props.term ? normalizeTermContext(props.term) : null,
        site: normalizeSiteContext(props.site),
        page: props.page ? { slug: props.page.slug, template: props.page.template } : null,
        queryParams: props.queryParams ?? {},
    };
}

// ============================================================================
// Normalizers (adapt to your API response shape)
// ============================================================================

function normalizeUserContext(user: any): UserContext {
    return {
        id: user.id,
        roles: user.roles ?? [],
        verified: user.verified ?? false,
        plan: user.plan,
        canCreate: user.canCreate ?? user.can_create ?? [],
        bookmarks: user.bookmarks ?? [],
        following: user.following ?? [],
    };
}

function normalizePostContext(post: any): PostContext {
    return {
        id: post.id,
        type: post.type ?? post.post_type,
        status: post.status ?? post.post_status,
        authorId: post.authorId ?? post.author_id ?? post.author?.id,
        author: post.author ? {
            id: post.author.id,
            verified: post.author.verified ?? false,
            rating: post.author.rating,
            following: post.author.following ?? [],
        } : undefined,
        fields: post.fields ?? post.meta ?? {},
        reviewCount: post.reviewCount ?? post.review_count ?? 0,
        claimed: post.claimed ?? false,
        claimCount: post.claimCount ?? post.claim_count ?? 0,
        boosted: post.boosted ?? false,
        productsEnabled: post.productsEnabled ?? post.products_enabled ?? false,
        orderCount: post.orderCount ?? post.order_count ?? 0,
    };
}

function normalizeTermContext(term: any): TermContext {
    return {
        id: term.id,
        taxonomy: term.taxonomy,
        slug: term.slug,
        name: term.name,
        parent: term.parent,
        children: term.children?.map(normalizeTermContext),
    };
}

function normalizeSiteContext(site: any): SiteContext {
    return {
        url: site?.url ?? '',
        name: site?.name ?? '',
        timezone: site?.timezone,
    };
}

// ============================================================================
// Provider Component
// ============================================================================

export { BlockContextReact as BlockContextProvider };
