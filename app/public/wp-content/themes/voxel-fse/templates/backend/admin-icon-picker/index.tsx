/**
 * Admin Icon Picker Entry Point
 * 
 * Creates a global Voxel_Icon_Picker API that bridges between Voxel's Vue.js
 * backend expectations and our React-based IconPickerControl component.
 * 
 * This is loaded on WordPress taxonomy admin pages (edit-tags.php) to provide
 * icon picker functionality for category/term fields.
 */
import { createRoot, Root } from 'react-dom/client';
import { IconPickerControl, type IconValue } from '@shared/controls';

interface VoxelIconPickerInstance {
    $root: HTMLElement;
    reactRoot: Root | null;
    value: IconValue;
    onChange: (value: IconValue) => void;
    preview: () => void;
    openLibrary: () => void;
    uploadSVG: () => void;
}

/**
 * Global Voxel Icon Picker Constructor
 * Matches the API expected by Voxel's backend.js Vue component
 */
class VoxelIconPicker implements VoxelIconPickerInstance {
    $root: HTMLElement;
    reactRoot: Root | null = null;
    value: IconValue = { library: '', value: '' };
    onChange: (value: IconValue) => void;

    constructor($root: HTMLElement, onChange: (value: IconValue) => void) {
        this.$root = $root;
        this.onChange = onChange;
        this.mount();
    }

    /**
     * Mount the React icon picker component
     */
    private mount() {
        // Create a container for the React component
        const container = document.createElement('div');
        container.className = 'fse-icon-picker-wrapper';
        this.$root.appendChild(container);

        // Create React root and render the IconPickerControl
        this.reactRoot = createRoot(container);
        this.render();
    }

    /**
     * Render the React component
     */
    private render() {
        if (!this.reactRoot) return;

        this.reactRoot.render(
            <IconPickerControl
                label=""
                value={this.value}
                onChange={(newValue: IconValue) => {
                    this.value = newValue;
                    this.onChange(newValue);
                }}
            />
        );
    }

    /**
     * Preview method - called by Voxel backend when component is created
     * Updates the visual preview of the selected icon
     */
    preview() {
        // The IconPickerControl handles its own preview display
        // This method is called by Voxel but we don't need to do anything
        // as React handles the state updates automatically
    }

    /**
     * Open the icon library modal
     * This is triggered when the user clicks the "Icon Library" button
     */
    openLibrary() {
        // Find and click the Icon Library button in our React component
        const iconLibraryButton = this.$root.querySelector('button[title="Icon Library"]') as HTMLButtonElement;
        if (iconLibraryButton) {
            iconLibraryButton.click();
        }
    }

    /**
     * Open WordPress media library for SVG upload
     * This is triggered when the user clicks the "Upload SVG" button
     */
    uploadSVG() {
        // Find and click the Upload SVG button in our React component
        const uploadButton = this.$root.querySelector('button[title="Upload SVG"]') as HTMLButtonElement;
        if (uploadButton) {
            uploadButton.click();
        }
    }

    /**
     * Destroy the instance and clean up React root
     */
    destroy() {
        if (this.reactRoot) {
            this.reactRoot.unmount();
            this.reactRoot = null;
        }
    }
}

/**
 * Expose the Voxel_Icon_Picker constructor globally
 * This is what Voxel's backend.js expects to find
 */
declare global {
    interface Window {
        Voxel_Icon_Picker: typeof VoxelIconPicker;
    }
}

// Make the constructor available globally
window.Voxel_Icon_Picker = VoxelIconPicker;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('Voxel Icon Picker (React) loaded');
    });
} else {
    console.log('Voxel Icon Picker (React) loaded');
}
