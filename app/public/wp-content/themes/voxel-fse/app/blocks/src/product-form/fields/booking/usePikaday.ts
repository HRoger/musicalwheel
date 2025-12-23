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
	gotoDate: ( date: Date ) => void;
	gotoMonth: ( month: number ) => void;
	gotoYear: ( year: number ) => void;
	show: () => void;
	hide: () => void;
	isVisible: () => boolean;
	draw: ( force?: boolean ) => void;
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
}

export interface UsePikadayReturn {
	inputRef: React.RefObject<HTMLInputElement>;
	pickerRef: React.MutableRefObject<PikadayInstance | null>;
	setDate: ( date: Date | string | null ) => void;
	getDate: () => Date | null;
	show: () => void;
	hide: () => void;
	gotoDate: ( date: Date ) => void;
	redraw: () => void;
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

	return {
		inputRef: inputRef as React.RefObject<HTMLInputElement>,
		pickerRef,
		setDate,
		getDate,
		show,
		hide,
		gotoDate,
		redraw,
	};
}

export default usePikaday;
