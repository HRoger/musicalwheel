/**
 * Example Usage: Voxel Block Utilities
 *
 * This file demonstrates how to use the utilities in a Next.js app.
 * NOT a real file - just documentation.
 */

// ============================================================================
// 1. Page Setup with Context Provider
// ============================================================================

// apps/musicalwheel-frontend/app/posts/[slug]/page.tsx

import { BlockContextReact, buildBlockContext } from '@/lib/blocks';

export default async function PostPage({ params }: { params: { slug: string } }) {
    // Fetch data from API
    const post = await fetchPost(params.slug);
    const user = await getCurrentUser();
    const site = await getSiteConfig();

    // Build context
    const blockContext = buildBlockContext({
        post,
        user,
        site,
        page: { slug: params.slug },
    });

    return (
        <BlockContextReact.Provider value={blockContext}>
            <BlockRenderer blocks={post.content} />
        </BlockContextReact.Provider>
    );
}

// ============================================================================
// 2. Block Component with Voxel Features
// ============================================================================

// apps/musicalwheel-frontend/components/blocks/FlexContainerBlock.tsx

import { withVoxelFeatures, type VoxelBlockProps } from '@/lib/blocks';

interface FlexContainerConfig {
    blockId: string;
    direction?: string;
    gap?: number;
    gapUnit?: string;
    // ... other flex attributes
}

function FlexContainerBlock({
    config,
    children,
}: VoxelBlockProps & { config: FlexContainerConfig }) {
    // Build inline styles from config
    const style: React.CSSProperties = {
        display: 'flex',
        flexDirection: (config.direction as any) || 'row',
        gap: config.gap ? `${config.gap}${config.gapUnit || 'px'}` : undefined,
    };

    // Sticky position (already in CSS from save.tsx, but can apply here too)
    if (config.stickyEnabled && config.stickyDesktop === 'sticky') {
        style.position = 'sticky';
        style.top = config.stickyTop
            ? `${config.stickyTop}${config.stickyTopUnit || 'px'}`
            : undefined;
    }

    return (
        <div
            className={`voxel-fse-flex-container voxel-fse-flex-container-${config.blockId}`}
            style={style}
        >
            {children}
        </div>
    );
}

// Wrap with HOC - adds visibility + loop support automatically
export default withVoxelFeatures(FlexContainerBlock);

// ============================================================================
// 3. Using Loop Data in Child Components
// ============================================================================

// apps/musicalwheel-frontend/components/blocks/PostCardBlock.tsx

import { useLoopItem, useLoopValue, useIsInLoop } from '@/lib/blocks';

function PostCardBlock({ config }) {
    // Check if we're inside a loop
    const isInLoop = useIsInLoop();

    // Get the current loop item (the post being iterated)
    const loopItem = useLoopItem();

    // Or get specific values directly
    const title = useLoopValue<string>('title');
    const thumbnail = useLoopValue<string>('thumbnail.url');

    if (!isInLoop) {
        // Not in a loop - use static config or current post context
        return <div>Static post card</div>;
    }

    return (
        <article className="post-card">
            {thumbnail && <img src={thumbnail} alt={title} />}
            <h3>{title}</h3>
            <span>Item {loopItem.index + 1} of {loopItem.total}</span>
        </article>
    );
}

export default withVoxelFeatures(PostCardBlock);

// ============================================================================
// 4. Block Renderer (parses vxconfig and renders blocks)
// ============================================================================

// apps/musicalwheel-frontend/components/BlockRenderer.tsx

import FlexContainerBlock from './blocks/FlexContainerBlock';
import PostCardBlock from './blocks/PostCardBlock';
// ... other block imports

const BLOCK_COMPONENTS: Record<string, React.ComponentType<any>> = {
    'voxel-fse/flex-container': FlexContainerBlock,
    'voxel-fse/post-card': PostCardBlock,
    // ... other blocks
};

interface BlockData {
    blockName: string;
    innerHTML: string;
    attrs: Record<string, any>;
    innerBlocks?: BlockData[];
}

export function BlockRenderer({ blocks }: { blocks: BlockData[] }) {
    return (
        <>
            {blocks.map((block, index) => {
                const Component = BLOCK_COMPONENTS[block.blockName];

                if (!Component) {
                    // Unknown block - render as HTML
                    return (
                        <div
                            key={index}
                            dangerouslySetInnerHTML={{ __html: block.innerHTML }}
                        />
                    );
                }

                // Render with Voxel features (visibility + loop handled by HOC)
                return (
                    <Component key={index} config={block.attrs}>
                        {block.innerBlocks && (
                            <BlockRenderer blocks={block.innerBlocks} />
                        )}
                    </Component>
                );
            })}
        </>
    );
}

// ============================================================================
// 5. Manual Visibility Check (without HOC)
// ============================================================================

import { evaluateVisibility, useBlockContext } from '@/lib/blocks';

function ConditionalContent({ config, children }) {
    const context = useBlockContext();

    // Manual visibility check
    const shouldShow = evaluateVisibility(
        {
            visibilityBehavior: config.visibilityBehavior,
            visibilityRules: config.visibilityRules,
        },
        context
    );

    if (!shouldShow) {
        return null;
    }

    return <>{children}</>;
}

// ============================================================================
// 6. Manual Loop Iteration (without HOC)
// ============================================================================

import { resolveLoop, useBlockContext } from '@/lib/blocks';

function ManualLoopExample({ config }) {
    const context = useBlockContext();

    // Manual loop resolution
    const items = resolveLoop(
        {
            loopEnabled: config.loopEnabled,
            loopSource: config.loopSource,
            loopLimit: config.loopLimit,
            loopOffset: config.loopOffset,
        },
        context
    );

    return (
        <div className="manual-loop">
            {items.map((item) => (
                <div key={item.index}>
                    {item.data ? (
                        <span>{item.data.title}</span>
                    ) : (
                        <span>No data</span>
                    )}
                </div>
            ))}
        </div>
    );
}
