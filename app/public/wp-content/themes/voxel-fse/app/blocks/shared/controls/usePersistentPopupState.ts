import { useState, useEffect, useCallback } from 'react';

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
 * Hook to manage popup state that survives WordPress device/viewport changes.
 * 
 * This is critical because WordPress unmounts and remounts the Inspector controls
 * whenever the device preview mode changes (Desktop -> Tablet -> Mobile).
 * Without this hook, popups would close immediately upon switching devices.
 * 
 * @param key Unique key for the popup. If not provided, persistence is disabled.
 * @param defaultState Initial state.
 * @returns [isOpen, setIsOpen] tuple
 */
export function usePersistentPopupState(key: string | undefined, defaultState: boolean = false) {
    // Initialize from global state if a device change happened recently
    const initializeState = (): boolean => {
        if (!key) return defaultState;

        const timestamp = window.__voxelDeviceChangeTimestamp || 0;
        // 2000ms window to catch re-renders after device change
        const timeDiff = Date.now() - timestamp;
        const isRecentDeviceChange = timeDiff < 2500; // Increased to 2500ms for safety
        const hasGlobalState = window.__voxelOpenPopups?.[key];

        if (isRecentDeviceChange && hasGlobalState) {
            // console.log(`[Voxel Persistence] Restoring open state for ${key} (Diff: ${timeDiff}ms)`);
            return true;
        }

        return defaultState;
    };

    const [isOpen, internalSetIsOpen] = useState<boolean>(initializeState);

    // Sync local state to global state
    useEffect(() => {
        if (!key) return;

        if (isOpen) {
            if (!window.__voxelOpenPopups) window.__voxelOpenPopups = {};
            window.__voxelOpenPopups[key] = true;
        } else {
            // Only clear if we are NOT in the middle of a device transition
            // If we just unmounted (because of device change), the effect cleanup
            // would run (if we had one), but we don't.
            // This logic runs when isOpen changes to FALSE.
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
