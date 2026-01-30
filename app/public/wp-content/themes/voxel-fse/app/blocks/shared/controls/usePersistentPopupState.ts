import { useState, useEffect, useCallback, useRef } from 'react';

declare global {
    interface Window {
        __voxelDeviceChangeTimestamp?: number;
        __voxelOpenPopups?: Record<string, boolean>;
    }
}

// Initialize global storage
if (typeof window !== 'undefined') {
    window.__voxelOpenPopups = window.__voxelOpenPopups || {};
}

/**
 * Hook to manage popup state that survives:
 * 1. WordPress device/viewport changes (Desktop -> Tablet -> Mobile)
 * 2. Normal re-renders caused by attribute changes
 *
 * This is critical because:
 * - WordPress unmounts and remounts Inspector controls on device changes
 * - Parent component re-renders can cause child popups to lose state
 *
 * The hook uses a global window object to persist state across all scenarios.
 *
 * @param key Unique key for the popup. If not provided, persistence is disabled.
 * @param defaultState Initial state.
 * @returns [isOpen, setIsOpen] tuple
 */
export function usePersistentPopupState(key: string | undefined, defaultState: boolean = false) {
    // Track if this is the initial mount
    const isInitialMount = useRef(true);

    // Initialize from global state - ALWAYS check global state first, not just on device changes
    // This ensures popup survives any kind of re-render
    const initializeState = (): boolean => {
        if (!key) return defaultState;

        // Check global state - if popup is marked as open, restore it
        const hasGlobalState = window.__voxelOpenPopups?.[key];
        if (hasGlobalState) {
            return true;
        }

        return defaultState;
    };

    const [isOpen, internalSetIsOpen] = useState<boolean>(initializeState);

    // On mount, check if global state says we should be open
    // This handles cases where React recreates the component but global state persists
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            if (key && window.__voxelOpenPopups?.[key] && !isOpen) {
                internalSetIsOpen(true);
            }
        }
    }, [key, isOpen]);

    // Sync local state to global state
    useEffect(() => {
        if (!key) return;

        if (isOpen) {
            if (!window.__voxelOpenPopups) window.__voxelOpenPopups = {};
            window.__voxelOpenPopups[key] = true;
        } else {
            // Only clear global state if this is an explicit close (not unmount)
            // We check if we're still mounted before clearing
            if (window.__voxelOpenPopups && window.__voxelOpenPopups[key]) {
                delete window.__voxelOpenPopups[key];
            }
        }
    }, [isOpen, key]);

    // Custom setter that transparently handles global state
    const setIsOpen = useCallback((newState: boolean | ((prev: boolean) => boolean)) => {
        internalSetIsOpen((prevState) => {
            const nextValue = typeof newState === 'function' ? newState(prevState) : newState;

            // Update global store immediately to be ready for any unmount/remount
            if (key) {
                if (nextValue) {
                    if (!window.__voxelOpenPopups) window.__voxelOpenPopups = {};
                    window.__voxelOpenPopups[key] = true;
                } else {
                    if (window.__voxelOpenPopups) {
                        delete window.__voxelOpenPopups[key];
                    }
                }
            }

            return nextValue;
        });
    }, [key]);

    return [isOpen, setIsOpen] as const;
}

/**
 * Helper to register a device change event timestamp.
 * Call this BEFORE dispatching the device change to WordPress.
 */
export function notifyDeviceChange() {
    if (typeof window !== 'undefined') {
        // console.log('[Voxel Persistence] Device change notified');
        window.__voxelDeviceChangeTimestamp = Date.now();
    }
}
