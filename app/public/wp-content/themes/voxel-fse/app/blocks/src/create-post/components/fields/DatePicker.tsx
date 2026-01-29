/**
 * DatePicker Component - Pikaday Wrapper
 * 
 * Wraps the Pikaday date picker library used by Voxel.
 * Evidence: themes/voxel/templates/widgets/create-post/recurring-date-field.php:222-226
 * 
 * Pikaday is loaded by Voxel via: wp_enqueue_script('pikaday')
 * CSS is loaded via: wp_enqueue_style('pikaday')
 * 
 * NOTE: Voxel's customized Pikaday already has:
 * - Empty i18n.previousMonth/nextMonth (no text)
 * - Built-in SVG arrow icons (lni-arrow-left/right)
 * - ts-icon-btn class on nav buttons
 */
import React, { useRef, useEffect } from 'react';

// Declare Pikaday global (loaded by Voxel)
declare global {
    interface Window {
        Pikaday: any;
    }
}

interface DatePickerProps {
    value: string | null; // 'YYYY-MM-DD' format
    onChange: (date: string | null) => void;
    onSelect?: () => void; // Called when a date is selected (for auto-close)
    minDate?: Date;
    maxDate?: Date;
}

export const DatePicker: React.FC<DatePickerProps> = ({
    value,
    onChange,
    onSelect,
    minDate,
    maxDate,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const pickerRef = useRef<any>(null);

    useEffect(() => {
        if (!containerRef.current || !inputRef.current || !window.Pikaday) {
            return;
        }

        // Create Pikaday instance
        // Voxel's customized Pikaday already includes:
        // - Empty previousMonth/nextMonth strings (no text labels)
        // - Built-in SVG arrow icons
        // - Voxel_Config.l10n for months/weekdays
        pickerRef.current = new window.Pikaday({
            field: inputRef.current,
            container: containerRef.current,
            bound: false, // Inline mode - always visible
            format: 'YYYY-MM-DD',
            firstDay: 1, // Start week on Monday
            minDate: minDate,
            maxDate: maxDate,
            defaultDate: value ? new Date(value) : new Date(),
            setDefaultDate: !!value,
            showDaysInNextAndPreviousMonths: true,
            enableSelectionDaysInNextAndPreviousMonths: true,
            // Don't override i18n - let Voxel's defaults handle it
            onSelect: function (date: Date) {
                // Format as YYYY-MM-DD
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const formattedDate = `${year}-${month}-${day}`;
                onChange(formattedDate);
                if (onSelect) {
                    onSelect();
                }
            }
        });

        // Set initial value if provided
        if (value) {
            pickerRef.current.setDate(new Date(value), true);
        }

        return () => {
            if (pickerRef.current) {
                pickerRef.current.destroy();
                pickerRef.current = null;
            }
        };
    }, []); // Only run once on mount

    // Update picker when value changes externally
    useEffect(() => {
        if (pickerRef.current && value) {
            const currentDate = pickerRef.current.getDate();
            const newDate = new Date(value);
            if (!currentDate || currentDate.getTime() !== newDate.getTime()) {
                pickerRef.current.setDate(newDate, true);
            }
        }
    }, [value]);

    return (
        <div className="ts-form-group ts-booking-date ts-booking-date-single" ref={containerRef}>
            <input type="hidden" ref={inputRef} />
        </div>
    );
};

export default DatePicker;
