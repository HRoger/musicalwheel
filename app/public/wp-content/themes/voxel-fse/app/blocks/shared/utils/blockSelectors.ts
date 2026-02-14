
/**
 * Cache for block searches to prevent unnecessary re-computations
 * Key: The blocks array (root of the search)
 * Value: Map of query keys to results
 */
const blocksCache = new WeakMap<object, Map<string, any>>();

/**
 * Helper to get cache for a given blocks array
 */
function getCache(blocks: any[]): Map<string, any> {
    let cache = blocksCache.get(blocks);
    if (!cache) {
        cache = new Map();
        blocksCache.set(blocks, cache);
    }
    return cache;
}

/**
 * Find all blocks with a specific name recursively.
 * Memoized based on the input blocks array reference.
 */
export function getBlocksByNameRecursive(
    blocks: any[],
    blockName: string
): any[] {
    if (!blocks || !Array.isArray(blocks)) return [];

    const cache = getCache(blocks);
    const cacheKey = `name:${blockName}`;

    if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
    }

    const found: any[] = [];
    const traverse = (nodes: any[]) => {
        nodes.forEach((node) => {
            if (node.name === blockName) {
                found.push(node);
            }
            if (node.innerBlocks && node.innerBlocks.length > 0) {
                traverse(node.innerBlocks);
            }
        });
    };

    traverse(blocks);
    cache.set(cacheKey, found);
    return found;
}

/**
 * Find a block by its blockId attribute recursively.
 * Memoized based on the input blocks array reference.
 */
export function getBlockByBlockIdRecursive(
    blocks: any[],
    targetId: string,
    targetName?: string // Optional block name filter
): any | null {
    if (!blocks || !Array.isArray(blocks)) return null;

    const cache = getCache(blocks);
    const cacheKey = `id:${targetId}:${targetName || '*'}`;

    if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
    }

    let result: any | null = null;

    const traverse = (nodes: any[]) => {
        for (const node of nodes) {
            // Check direct block match
            let match = false;

            // Check blockId attribute
            if (node.attributes && node.attributes.blockId === targetId) {
                match = true;
            }
            // Check clientId fallback
            else if (node.clientId === targetId) {
                match = true;
            }

            if (match) {
                // Apply name filter if provided
                if (!targetName || node.name === targetName) {
                    result = node;
                    return; // Stop traversal immediately
                }
            }

            if (node.innerBlocks && node.innerBlocks.length > 0) {
                traverse(node.innerBlocks);
                if (result) return; // Stop if found in children
            }
        }
    };

    traverse(blocks);
    cache.set(cacheKey, result);
    return result;
}
