/**
 * usePikaday Hook
 *
 * React hook for integrating Pikaday date picker (loaded globally by Voxel).
 * Handles initialization, cleanup, and date selection callbacks.
 *
 * Evidence: Voxel loads Pikaday globally for all date pickers
 *
 * @package VoxelFSE
 */

import { useEffect, useRef, useCallback } from 'react';

// Pikaday global type declaration
declare global {
	interface Window {
		Pikaday: new ( options: PikadayOptions ) => PikadayInstance;
	}
}

/**
 * Day render data passed to dayRenderHook
 * Evidence: voxel-product-form.beautified.js lines 1992-1998
 */
export interface PikadayDayData {
	year: number;
	month: number;
	day: number;
	isDisabled: boolean;
	isSelected: boolean;
	isToday: boolean;
	isEmpty: boolean;
}

/**
 * Day element data with mutable beforeCloseTd for adding content
 * Evidence: voxel-product-form.beautified.js line 1998 - dayEl.beforeCloseTd += tooltip;
 */
export interface PikadayDayElement {
	beforeCloseTd: string;
}

interface PikadayOptions {
	field?: HTMLElement;
	bound?: boolean;
	container?: HTMLElement;
	format?: string;
	defaultDate?: Date;
	setDefaultDate?: boolean;
	minDate?: Date;
	maxDate?: Date;
	disableDayFn?: ( date: Date ) => boolean;
	onSelect?: ( date: Date ) => void;
	onOpen?: () => void;
	onClose?: () => void;
	onDraw?: ( picker: PikadayInstance ) => void;
	/**
	 * Custom day render hook for adding content to calendar cells
	 * Evidence: voxel-product-form.beautified.js lines 1992-1999
	 */
	dayRenderHook?: ( dayData: PikadayDayData, dayEl: PikadayDayElement ) => void;
	i18n?: {
		previousMonth?: string;
		nextMonth?: string;
		months?: string[];
		weekdays?: string[];
		weekdaysShort?: string[];
	};
	firstDay?: number;
	showDaysInNextAndPreviousMonths?: boolean;
	enableSelectionDaysInNextAndPreviousMonths?: boolean;
	numberOfMonths?: number;
	mainCalendar?: 'left' | 'right';
	theme?: string;
	toString?: ( date: Date, format: string ) => string;
	parse?: ( dateString: string, format: string ) => Date;
}

interface PikadayInstance {
	destroy: () => void;
	getDate: () => Date | null;
	setDate: ( date: Date | string | null, preventOnSelect?: boolean ) => void;
	setMinDate: ( date: Date ) => void;
	setMaxDate: ( date: Date ) => void;
	setStartRange: ( date: Date | null ) => void;
	setEndRange: ( date: Date | null ) => void;
	gotoDate: ( date: Date ) => void;
	gotoMonth: ( month: number ) => void;
	gotoYear: ( year: number ) => void;
	show: () => void;
	hide: () => void;
	isVisible: () => boolean;
	draw: ( force?: boolean ) => void;
	/** The picker's DOM element */
	el: HTMLElement;
}

export interface UsePikadayOptions {
	onSelect?: ( date: Date ) => void;
	minDate?: Date;
	maxDate?: Date;
	defaultDate?: Date;
	disableDayFn?: ( date: Date ) => boolean;
	format?: string;
	bound?: boolean;
	container?: HTMLElement | null;
	numberOfMonths?: number;
	onDraw?: ( picker: PikadayInstance ) => void;
	/**
	 * Custom day render hook for adding content (e.g., price tooltips) to calendar cells
	 * Evidence: voxel-product-form.beautified.js lines 1992-1999
	 */
	dayRenderHook?: ( dayData: PikadayDayData, dayEl: PikadayDayElement ) => void;
	/** Initial start range for range selection */
	startRange?: Date | null;
	/** Initial end range for range selection */
	endRange?: Date | null;
}

export interface UsePikadayReturn {
	inputRef: React.RefObject<HTMLInputElement>;
	pickerRef: React.MutableRefObject<PikadayInstance | null>;
	setDate: ( date: Date | string | null ) => void;
	getDate: () => Date | null;
	setStartRange: ( date: Date | null ) => void;
	setEndRange: ( date: Date | null ) => void;
	show: () => void;
	hide: () => void;
	gotoDate: ( date: Date ) => void;
	redraw: () => void;
	/** Get the picker's DOM element for event handling */
	getPickerElement: () => HTMLElement | null;
}

/**
 * Hook for using Pikaday date picker in React
 */
export function usePikaday( options: UsePikadayOptions ): UsePikadayReturn {
	const inputRef = useRef<HTMLInputElement>( null );
	const pickerRef = useRef<PikadayInstance | null>( null );
	const optionsRef = useRef( options );

	// Keep options ref updated
	optionsRef.current = options;

	useEffect( () => {
		if ( ! inputRef.current || typeof window.Pikaday === 'undefined' ) {
			return;
		}

		const pikadayOptions: PikadayOptions = {
			field: inputRef.current,
			bound: optionsRef.current.bound ?? true,
			format: optionsRef.current.format ?? 'YYYY-MM-DD',
			minDate: optionsRef.current.minDate,
			maxDate: optionsRef.current.maxDate,
			defaultDate: optionsRef.current.defaultDate,
			setDefaultDate: !! optionsRef.current.defaultDate,
			disableDayFn: optionsRef.current.disableDayFn,
			numberOfMonths: optionsRef.current.numberOfMonths ?? 1,
			showDaysInNextAndPreviousMonths: true,
			enableSelectionDaysInNextAndPreviousMonths: false,
			firstDay: 1, // Monday
			onSelect: ( date: Date ) => {
				optionsRef.current.onSelect?.( date );
			},
			onDraw: ( picker: PikadayInstance ) => {
				optionsRef.current.onDraw?.( picker );
			},
			// Evidence: voxel-product-form.beautified.js lines 1992-1999
			dayRenderHook: optionsRef.current.dayRenderHook,
		};

		if ( optionsRef.current.container ) {
			pikadayOptions.container = optionsRef.current.container;
			pikadayOptions.bound = false;
		}

		pickerRef.current = new window.Pikaday( pikadayOptions );

		return () => {
			pickerRef.current?.destroy();
			pickerRef.current = null;
		};
	}, [] );

	// Update min/max dates when they change
	useEffect( () => {
		if ( pickerRef.current && options.minDate ) {
			pickerRef.current.setMinDate( options.minDate );
		}
	}, [ options.minDate ] );

	useEffect( () => {
		if ( pickerRef.current && options.maxDate ) {
			pickerRef.current.setMaxDate( options.maxDate );
		}
	}, [ options.maxDate ] );

	const setDate = useCallback( ( date: Date | string | null ) => {
		pickerRef.current?.setDate( date, true );
	}, [] );

	const getDate = useCallback( (): Date | null => {
		return pickerRef.current?.getDate() ?? null;
	}, [] );

	const show = useCallback( () => {
		pickerRef.current?.show();
	}, [] );

	const hide = useCallback( () => {
		pickerRef.current?.hide();
	}, [] );

	const gotoDate = useCallback( ( date: Date ) => {
		pickerRef.current?.gotoDate( date );
	}, [] );

	const redraw = useCallback( () => {
		pickerRef.current?.draw( true );
	}, [] );

	const setStartRange = useCallback( ( date: Date | null ) => {
		pickerRef.current?.setStartRange( date );
	}, [] );

	const setEndRange = useCallback( ( date: Date | null ) => {
		pickerRef.current?.setEndRange( date );
	}, [] );

	const getPickerElement = useCallback( (): HTMLElement | null => {
		return pickerRef.current?.el ?? null;
	}, [] );

	return {
		inputRef: inputRef as React.RefObject<HTMLInputElement>,
		pickerRef,
		setDate,
		getDate,
		setStartRange,
		setEndRange,
		show,
		hide,
		gotoDate,
		redraw,
		getPickerElement,
	};
}

export default usePikaday;
