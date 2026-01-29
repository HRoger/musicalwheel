/**
 * Voxel Block Utilities for Next.js
 *
 * Copy entire folder to: apps/musicalwheel-frontend/lib/blocks/
 *
 * @example
 * ```tsx
 * import {
 *   withVoxelFeatures,
 *   useBlockContext,
 *   useLoopItem,
 *   evaluateVisibility,
 *   resolveLoop,
 * } from '@/lib/blocks';
 * ```
 */

// Context
export {
    BlockContextReact,
    BlockContextReact as BlockContextProvider,
    useBlockContext,
    buildBlockContext,
    type BlockContext,
    type UserContext,
    type PostContext,
    type TermContext,
    type SiteContext,
    type PageContext,
} from './context';

// Visibility
export {
    evaluateVisibility,
    type VisibilityConfig,
    type VisibilityRule,
} from './visibility';

// Loop
export {
    resolveLoop,
    resolveDynamicPath,
    hasLoopItems,
    getCurrentLoopItem,
    getLoopValue,
    isInLoop,
    type LoopConfig,
    type LoopItem,
} from './loop';

// HOC and Hooks
export {
    withVoxelFeatures,
    useLoopItem,
    useLoopValue,
    useIsInLoop,
    useLoopMeta,
    type VoxelBlockConfig,
    type VoxelBlockProps,
} from './withVoxelFeatures';
