/**
 * MusicalWheel FSE Theme - Main Entry Point
 *
 * Frontend JavaScript/TypeScript entry point for theme functionality.
 * This file is loaded on the public-facing site.
 */

// Import main stylesheet (Tailwind CSS)
import '@styles/main.css';

// Development-only code
if (__DEV__) {
	console.log('MusicalWheel FSE Theme - Development Mode');
}

/**
 * Initialize theme functionality
 */
function initTheme(): void {
	// Theme initialization code will go here
	// Examples: custom interactions, API calls, etc.

	console.log('MusicalWheel FSE Theme initialized');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initTheme);
} else {
	initTheme();
}
