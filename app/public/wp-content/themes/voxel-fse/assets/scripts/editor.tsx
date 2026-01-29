/**
 * MusicalWheel FSE Theme - Editor Entry Point
 *
 * JavaScript/TypeScript entry point for the WordPress block editor.
 * This file is loaded only in the admin/editor context.
 */

// Import editor-specific styles
import '@styles/main.css';

// Development-only code
if (__DEV__) {
	//console.log('MusicalWheel FSE Theme - Editor Mode');
}

/**
 * Initialize editor functionality
 */
function initEditor(): void {
	// Editor initialization code will go here
	// Examples: custom block registrations, editor extensions, etc.

	//console.log('MusicalWheel FSE Editor initialized');
}

// WordPress domReady equivalent
if (typeof window !== 'undefined') {
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initEditor);
	} else {
		initEditor();
	}
}
