/**
 * Voxel Features HOC for Next.js
 *
 * Wraps block components to add visibility and loop support.
 * Copy to: apps/musicalwheel-frontend/lib/blocks/withVoxelFeatures.tsx
 */

import React, { useMemo } from 'react';
import { evaluateVisibility, type VisibilityConfig } from './visibility';
import { resolveLoop, type LoopConfig, type LoopItem } from './loop';
import { BlockContextReact, useBlockContext, type BlockContext } from './context';

// ============================================================================
// Types
// ============================================================================

export interface VoxelBlockConfig extends VisibilityConfig, LoopConfig {
    blockId?: string;
    elementId?: string;
    customClasses?: string;
    [key: string]: any;
}

export interface VoxelBlockProps {
    config: VoxelBlockConfig;
    children?: React.ReactNode;
}

// ============================================================================
// HOC: withVoxelFeatures
// ============================================================================

/**
 * Higher-Order Component that adds Voxel features to a block
 *
 * Features:
 * - Visibility rule evaluation
 * - Loop iteration
 * - Loop context injection
 *
 * @example
 * ```tsx
 * function FlexContainerBlock({ config, children }) {
 *   return <div className="voxel-fse-flex-container">{children}</div>;
 * }
 *
 * export default withVoxelFeatures(FlexContainerBlock);
 * ```
 */
export function withVoxelFeatures<P extends VoxelBlockProps>(
    WrappedComponent: React.ComponentType<P>
): React.FC<P> {
    function VoxelFeatureWrapper(props: P) {
        const context = useBlockContext();
        const { config } = props;

        // Evaluate visibility rules
        const isVisible = useMemo(
            () => evaluateVisibility(config, context),
            [config, context]
        );

        // If not visible, render nothing
        if (!isVisible) {
            return null;
        }

        // Resolve loop items
        const loopItems = useMemo(
            () => resolveLoop(config, context),
            [config, context]
        );

        // Single item with null data = no loop, render once
        if (loopItems.length === 1 && loopItems[0].data === null) {
            return <WrappedComponent {...props} />;
        }

        // Loop: render multiple times with loop context
        return (
            <>
                {loopItems.map((loopItem) => (
                    <LoopContextProvider
                        key={loopItem.index}
                        context={context}
                        loopItem={loopItem}
                    >
                        <WrappedComponent {...props} />
                    </LoopContextProvider>
                ))}
            </>
        );
    }

    // Copy display name for debugging
    VoxelFeatureWrapper.displayName = `withVoxelFeatures(${
        WrappedComponent.displayName || WrappedComponent.name || 'Component'
    })`;

    return VoxelFeatureWrapper;
}

// ============================================================================
// Loop Context Provider
// ============================================================================

interface LoopContextProviderProps {
    context: BlockContext;
    loopItem: LoopItem;
    children: React.ReactNode;
}

function LoopContextProvider({
    context,
    loopItem,
    children,
}: LoopContextProviderProps) {
    // Create new context with loop data
    const loopContext = useMemo<BlockContext>(
        () => ({
            ...context,
            loopItem,
            loopIndex: loopItem.index,
        }),
        [context, loopItem]
    );

    return (
        <BlockContextReact.Provider value={loopContext}>
            {children}
        </BlockContextReact.Provider>
    );
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Hook to get current loop item data
 *
 * @example
 * ```tsx
 * function PostCard() {
 *   const { data: post, index, isLast } = useLoopItem();
 *   return <div>{post?.title}</div>;
 * }
 * ```
 */
export function useLoopItem(): LoopItem | null {
    const context = useBlockContext();
    return context.loopItem ?? null;
}

/**
 * Hook to get a value from loop item
 *
 * @example
 * ```tsx
 * const title = useLoopValue('title');
 * const authorName = useLoopValue('author.name');
 * ```
 */
export function useLoopValue<T = any>(path?: string): T | null {
    const context = useBlockContext();
    const loopItem = context.loopItem;

    if (!loopItem?.data) return null;
    if (!path) return loopItem.data as T;

    // Navigate path
    const parts = path.split('.');
    let value: any = loopItem.data;

    for (const part of parts) {
        if (value === null || value === undefined) return null;
        value = value[part];
    }

    return value as T;
}

/**
 * Hook to check if inside a loop
 */
export function useIsInLoop(): boolean {
    const context = useBlockContext();
    return context.loopItem?.data !== null && context.loopItem?.data !== undefined;
}

/**
 * Hook to get loop metadata
 */
export function useLoopMeta(): {
    index: number;
    total: number;
    isFirst: boolean;
    isLast: boolean;
} | null {
    const loopItem = useLoopItem();

    if (!loopItem) return null;

    return {
        index: loopItem.index,
        total: loopItem.total,
        isFirst: loopItem.isFirst,
        isLast: loopItem.isLast,
    };
}
