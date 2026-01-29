/**
 * DateRangePicker Component - Pikaday Range Wrapper
 * 
 * Wraps Pikaday for date range selection (multi-day events).
 * Evidence: themes/voxel/templates/widgets/create-post/recurring-date-field.php:228-246
 * Evidence: themes/voxel/templates/widgets/popup-kit.php:759-761
 * 
 * Features:
 * - Two-month calendar view (numberOfMonths: 2)
 * - Range selection with startRange/endRange highlighting
 * - Header shows current selection state with clickable labels
 * 
 * NOTE: Voxel's customized Pikaday already has:
 * - Empty i18n.previousMonth/nextMonth (no text labels)
 * - Built-in SVG arrow icons (lni-arrow-left/right)
 * - ts-icon-btn class on nav buttons
 */
import React, { useState, useRef, useEffect } from 'react';

// Declare Pikaday global (loaded by Voxel)
declare global {
    interface Window {
        Pikaday: any;
    }
}

// Exact Voxel calendar.svg icon
const CalendarIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.75 2.75C8.75 2.33579 8.41421 2 8 2C7.58579 2 7.25 2.33579 7.25 2.75V3.75H5.5C4.25736 3.75 3.25 4.75736 3.25 6V8.25H20.75V6C20.75 4.75736 19.7426 3.75 18.5 3.75H16.75V2.75C16.75 2.33579 16.4142 2 16 2C15.5858 2 15.25 2.33579 15.25 2.75V3.75H8.75V2.75Z" fill="currentColor" />
        <path d="M3.25 19V9.75H20.75V19C20.75 20.2426 19.7426 21.25 18.5 21.25H5.5C4.25736 21.25 3.25 20.2426 3.25 19ZM7.98438 11.95C7.54255 11.95 7.18438 12.3082 7.18438 12.75C7.18438 13.1918 7.54255 13.55 7.98438 13.55H7.99438C8.4362 13.55 8.79437 13.1918 8.79437 12.75C8.79437 12.3082 8.4362 11.95 7.99438 11.95H7.98438ZM11.9941 11.95C11.5523 11.95 11.1941 12.3082 11.1941 12.75C11.1941 13.1918 11.5523 13.55 11.9941 13.55H12.0041C12.446 13.55 12.8041 13.1918 12.8041 12.75C12.8041 12.3082 12.446 11.95 12.0041 11.95H11.9941ZM16.0039 11.95C15.5621 11.95 15.2039 12.3082 15.2039 12.75C15.2039 13.1918 15.5621 13.55 16.0039 13.55H16.0139C16.4557 13.55 16.8139 13.1918 16.8139 12.75C16.8139 12.3082 16.4557 11.95 16.0139 11.95H16.0039ZM7.98438 15.95C7.54255 15.95 7.18438 16.3082 7.18438 16.75C7.18438 17.1918 7.54255 17.55 7.98438 17.55H7.99438C8.4362 17.55 8.79437 17.1918 8.79437 16.75C8.79437 16.3082 8.4362 15.95 7.99438 15.95H7.98438ZM11.9941 15.95C11.5523 15.95 11.1941 16.3082 11.1941 16.75C11.1941 17.1918 11.5523 17.55 11.9941 17.55H12.0041C12.446 17.55 12.8041 17.1918 12.8041 16.75C12.8041 16.3082 12.446 15.95 12.0041 15.95H11.9941ZM16.0039 15.95C15.5621 15.95 15.2039 16.3082 15.2039 16.75C15.2039 17.1918 15.5621 17.55 16.0039 17.55H16.0139C16.4557 17.55 16.8139 17.1918 16.8139 16.75C16.8139 16.3082 16.4557 15.95 16.0139 15.95H16.0039Z" fill="currentColor" />
    </svg>
);

interface DateRangePickerProps {
    startDate: string | null;
    endDate: string | null;
    onChange: (start: string | null, end: string | null) => void;
    onSave?: () => void;
    l10n?: {
        from: string;
        to: string;
    };
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
    startDate,
    endDate,
    onChange,
    onSave,
    l10n = { from: 'From', to: 'To' },
}) => {
    const [activePicker, setActivePicker] = useState<'start' | 'end'>('start');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const pickerRef = useRef<any>(null);

    // Format date for display
    const formatDate = (dateStr: string | null): string => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    // Get labels for header
    const startLabel = startDate ? formatDate(startDate) : l10n.from;
    const endLabel = endDate ? formatDate(endDate) : l10n.to;

    useEffect(() => {
        if (!containerRef.current || !inputRef.current || !window.Pikaday) {
            return;
        }

        // Determine which date to use for the picker
        const currentValue = activePicker === 'start' ? startDate : endDate;
        const minDateVal = activePicker === 'end' && startDate ? new Date(startDate) : undefined;

        // Create or recreate picker when active picker changes
        if (pickerRef.current) {
            pickerRef.current.destroy();
        }

        // Parse start/end dates for range highlighting
        const startRangeDate = startDate ? new Date(startDate) : null;
        const endRangeDate = endDate ? new Date(endDate) : null;

        pickerRef.current = new window.Pikaday({
            field: inputRef.current,
            container: containerRef.current,
            bound: false,
            format: 'YYYY-MM-DD',
            firstDay: 1,
            minDate: minDateVal,
            defaultDate: currentValue ? new Date(currentValue) : new Date(),
            setDefaultDate: !!currentValue,
            showDaysInNextAndPreviousMonths: true,
            enableSelectionDaysInNextAndPreviousMonths: true,
            numberOfMonths: 2, // Two-month view for range picker
            // Range highlighting
            startRange: startRangeDate,
            endRange: endRangeDate,
            // Don't override i18n - let Voxel's defaults handle it
            onSelect: function (date: Date) {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const formattedDate = `${year}-${month}-${day}`;

                if (activePicker === 'start') {
                    // When selecting start date, auto-switch to end picker
                    onChange(formattedDate, endDate);
                    setActivePicker('end');
                } else {
                    // When selecting end date, update and optionally save
                    onChange(startDate, formattedDate);
                    if (onSave) {
                        onSave();
                    }
                }
            }
        });

        return () => {
            if (pickerRef.current) {
                pickerRef.current.destroy();
                pickerRef.current = null;
            }
        };
    }, [activePicker, startDate, endDate]); // Include endDate for range highlighting

    return (
        <>
            {/* Header - matches Voxel's recurring-date-range-picker template */}
            <div className="ts-popup-head flexify">
                <div className="ts-popup-name flexify">
                    <CalendarIcon />
                    <span>
                        <span
                            className={activePicker === 'start' ? 'chosen' : ''}
                            onClick={() => setActivePicker('start')}
                            style={{ cursor: 'pointer' }}
                        >
                            {startLabel}
                        </span>
                        {startDate && <span> — </span>}
                        {startDate && (
                            <span
                                className={activePicker === 'end' ? 'chosen' : ''}
                                onClick={() => setActivePicker('end')}
                                style={{ cursor: 'pointer' }}
                            >
                                {endLabel}
                            </span>
                        )}
                    </span>
                </div>
            </div>

            {/* Calendar - uses ts-booking-date-range class for proper two-month styling */}
            <div className="ts-booking-date ts-booking-date-range ts-form-group" ref={containerRef}>
                <input type="hidden" ref={inputRef} />
            </div>
        </>
    );
};

export default DateRangePicker;
