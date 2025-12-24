/**
 * DatePicker Component
 *
 * EXACT 1:1 match with Voxel's datePicker Vue component
 * Evidence: themes/voxel/assets/dist/auth.js (datePicker component in minified code)
 *
 * CRITICAL: Uses Voxel's CUSTOM Pikaday fork with:
 * - ts-icon-btn classes already on navigation buttons (pikaday.js:510, 513)
 * - Custom Line Awesome SVG arrow icons baked into rendering (pikaday.js:496-507)
 * - NO post-render DOM manipulation needed - icons are built-in!
 *
 * Voxel's exact Pikaday configuration:
 * ```javascript
 * new Pikaday({
 *   field: this.$refs.input,
 *   container: this.$refs.calendar,
 *   bound: false,              // ← Inline rendering (NOT popup)
 *   firstDay: 1,               // ← Monday as first day
 *   keyboardInput: false,      // ← No manual typing
 *   defaultDate: this.parent.date,
 *   onSelect: (date) => {
 *     this.parent.date = date;
 *     this.parent.onSave();    // ← Immediate save callback
 *   },
 *   selectDayFn: (date) => {
 *     // Highlights selected date
 *     return this.parent.date && this.parent.date.toDateString() === date.toDateString();
 *   }
 * })
 * ```
 *
 * Cleanup on unmount:
 * ```javascript
 * unmounted() {
 *   setTimeout(() => this.picker.destroy(), 200);  // ← 200ms delay
 * }
 * ```
 *
 * @package VoxelFSE
 */
import React, { useEffect, useRef } from 'react';

/**
 * CRITICAL: Pikaday is NOT bundled, it's enqueued via WordPress!
 *
 * Voxel's custom Pikaday fork is loaded via wp_enqueue_script('pikaday')
 * in the render.php enqueue handler.
 *
 * This ensures we use Voxel's EXACT custom fork with:
 * - Custom Line Awesome SVG arrow icons baked into pikaday.js:496-507
 * - ts-icon-btn classes on navigation buttons (pikaday.js:510, 513)
 * - All Voxel customizations intact
 *
 * IMPORTANT: We access window.Pikaday INSIDE the component (not at module level)
 * to ensure the script has loaded before we try to use it.
 */

export interface DatePickerProps {
	/** Currently selected date */
	value: Date | null;
	/** Called when a date is selected */
	onChange: (date: Date | null) => void;
	/** Called immediately after date selection (Voxel's immediate save behavior) */
	onSelect?: (date: Date) => void;
	/** Optional Pikaday configuration overrides (e.g., theme: 'pika-range') */
	pickerConfig?: any;
	/** Callback to receive the Pikaday instance for advanced control (e.g., setStartRange/setEndRange) */
	onPickerReady?: (picker: PikadayInstance) => void;
}

// TypeScript interface for Pikaday (minimal definition)
interface PikadayInstance {
	setDate(date: Date, preventOnSelect?: boolean): void;
	setStartRange(date: Date | null): void;
	setEndRange(date: Date | null): void;
	draw(force?: boolean): void;
	destroy(): void;
}

interface PikadayConstructor {
	new(options: any): PikadayInstance;
}

export const DatePicker: React.FC<DatePickerProps> = ({
	value,
	onChange,
	onSelect,
	pickerConfig,
	onPickerReady,
}) => {
	const calendarRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const pickerRef = useRef<PikadayInstance | null>(null);

	// CRITICAL: Use refs to always access the latest callbacks
	// This prevents stale closure issues where Pikaday captures old callbacks
	const onChangeRef = useRef(onChange);
	const onSelectRef = useRef(onSelect);

	// Update refs on each render to keep callbacks fresh
	onChangeRef.current = onChange;
	onSelectRef.current = onSelect;

	// Initialize Pikaday - EXACT Voxel configuration
	useEffect(() => {
		if (!calendarRef.current || !inputRef.current) return;

		// CRITICAL: Access window.Pikaday HERE (when component renders), not at module level
		// This ensures the Pikaday script has loaded before we try to use it
		const Pikaday = (window as any).Pikaday as PikadayConstructor;

		if (!Pikaday) {
			console.error('Pikaday not loaded - window.Pikaday is undefined');
			return;
		}

		// CRITICAL: Wait for container to be visible in DOM before initializing Pikaday
		// Using requestAnimationFrame ensures the popup is fully rendered
		const rafId = requestAnimationFrame(() => {
			pickerRef.current = new Pikaday({
				field: inputRef.current!,
				container: calendarRef.current!,
				bound: false,              // ← EXACT Voxel: inline rendering, NOT popup
				firstDay: 1,               // ← EXACT Voxel: Monday as first day
				keyboardInput: false,      // ← EXACT Voxel: no manual typing
				numberOfMonths: 2,         // ← EXACT Voxel: show 2 months side-by-side
				defaultDate: value || undefined,
				onSelect: (date: Date) => {
					// CRITICAL: Use refs to always call the LATEST callback
					// This prevents stale closures when callbacks change during range selection
					onChangeRef.current(date);

					// EXACT Voxel: call onSelect immediately (triggers save & close)
					// CRITICAL: Pass date directly to avoid React state timing issues
					if (onSelectRef.current) {
						onSelectRef.current(date);
					}
				},
				// Note: selectDayFn exists in Voxel but not in @types/pikaday
				// It's used to highlight the selected date - handled by Pikaday internally
				...pickerConfig, // Allow overriding configuration (e.g., theme: 'pika-range')
			});

			// Notify parent of picker instance for advanced control
			if (onPickerReady && pickerRef.current) {
				onPickerReady(pickerRef.current);
			}
		});

		// EXACT Voxel: cleanup with 200ms delay
		return () => {
			cancelAnimationFrame(rafId);
			setTimeout(() => {
				pickerRef.current?.destroy();
				pickerRef.current = null;
			}, 200);
		};
	}, []); // Initialize once - refs handle callback updates

	// Update calendar when value changes externally
	useEffect(() => {
		if (pickerRef.current) {
			if (value) {
				pickerRef.current.setDate(value, true); // true = don't trigger onSelect
			}
			// Redraw to update selection highlight (force = true)
			pickerRef.current.draw(true);
		}
	}, [value]);

	// EXACT Voxel HTML structure
	// Template: '<div class="ts-booking-date ts-booking-date-range ts-form-group" ref="calendar"><input type="hidden" ref="input"></div>'
	// CRITICAL: ts-booking-date ts-booking-date-range classes required for CSS grid layout (2 months side-by-side)
	// Evidence: themes/voxel/assets/dist/forms.css (.ts-booking-date.ts-booking-date-range .pika-single)
	return (
		<div className="ts-booking-date ts-booking-date-range ts-form-group" ref={calendarRef}>
			<input type="hidden" ref={inputRef} />
		</div>
	);
};

export default DatePicker;
