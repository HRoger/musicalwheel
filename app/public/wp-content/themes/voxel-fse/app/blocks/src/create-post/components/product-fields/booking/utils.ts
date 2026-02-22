/**
 * Booking Field Utilities
 *
 * Helper functions for timeslot management, generation, and validation.
 *
 * Evidence:
 * - Voxel Vue logic in create-post.js (groupLabelShort, generateSlots, etc.)
 * - Template: themes/voxel/templates/widgets/create-post/product-field/booking/timeslots.php
 */

import type { Timeslot, TimeslotGroup, GeneratorConfig } from './types';
import { MAX_SLOTS_PER_GROUP } from './types';

/**
 * Convert time string 'HH:MM' to total minutes
 */
export const timeToMinutes = (time: string): number => {
	const [hours, minutes] = time.split(':').map(Number);
	return hours * 60 + minutes;
};

/**
 * Convert total minutes to time string 'HH:MM'
 */
export const minutesToTime = (totalMinutes: number): string => {
	const hours = Math.floor(totalMinutes / 60) % 24;
	const minutes = totalMinutes % 60;
	return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

/**
 * Get short label for group (e.g., "Mon, Tue, Wed")
 * Evidence: timeslots.php line 6 ({{ groupLabelShort(group) || 'Schedule' }})
 */
export const getGroupLabelShort = (
	group: TimeslotGroup,
	weekdaysShort: Record<string, string>
): string => {
	if (!group.days.length) return '';
	return group.days.map(day => weekdaysShort[day] || day).join(', ');
};

/**
 * Get full label for group (e.g., "Monday, Tuesday, Wednesday")
 */
export const getGroupLabelFull = (
	group: TimeslotGroup,
	weekdays: Record<string, string>
): string => {
	if (!group.days.length) return '';
	return group.days.map(day => weekdays[day] || day).join(', ');
};

/**
 * Get unused days (not assigned to any group)
 * Evidence: timeslots.php line 148 (v-if="unusedDays.length")
 */
export const getUnusedDays = (
	groups: TimeslotGroup[],
	allDays: readonly string[]
): string[] => {
	const usedDays = new Set(groups.flatMap(g => g.days));
	return allDays.filter(day => !usedDays.has(day));
};

/**
 * Check if day is available for a specific group
 * Day is available if it's in the current group OR not in any other group
 */
export const isDayAvailable = (
	day: string,
	currentGroup: TimeslotGroup,
	allGroups: TimeslotGroup[]
): boolean => {
	// Day is always available if it's already in current group
	if (currentGroup.days.includes(day)) {
		return true;
	}

	// Check if day is used in any other group
	const otherGroups = allGroups.filter(g => g !== currentGroup);
	return !otherGroups.some(g => g.days.includes(day));
};

/**
 * Check if a day is used in any group other than the current one
 */
export const isDayUsedElsewhere = (
	day: string,
	currentGroup: TimeslotGroup,
	allGroups: TimeslotGroup[]
): boolean => {
	const otherGroups = allGroups.filter(g => g !== currentGroup);
	return otherGroups.some(g => g.days.includes(day));
};

/**
 * Validate a single timeslot (ensure to > from)
 */
export const isValidSlot = (slot: Timeslot): boolean => {
	const fromMinutes = timeToMinutes(slot.from);
	const toMinutes = timeToMinutes(slot.to);
	return toMinutes > fromMinutes;
};

/**
 * Sort slots by start time
 */
export const sortSlots = (slots: Timeslot[]): Timeslot[] => {
	return [...slots].sort((a, b) => {
		const aMinutes = timeToMinutes(a.from);
		const bMinutes = timeToMinutes(b.from);
		return aMinutes - bMinutes;
	});
};

/**
 * Remove duplicate slots
 */
export const deduplicateSlots = (slots: Timeslot[]): Timeslot[] => {
	return slots.filter((slot, index, self) =>
		index === self.findIndex(s => s.from === slot.from && s.to === slot.to)
	);
};

/**
 * Normalize slots: sort, deduplicate, filter invalid
 */
export const normalizeSlots = (slots: Timeslot[]): Timeslot[] => {
	const validSlots = slots.filter(isValidSlot);
	const uniqueSlots = deduplicateSlots(validSlots);
	return sortSlots(uniqueSlots);
};

/**
 * Generate timeslots from configuration
 * Evidence: timeslots.php lines 92-123 (generator UI)
 *
 * @param config - Generator configuration
 * @returns Array of generated timeslots (max MAX_SLOTS_PER_GROUP)
 */
export const generateTimeslots = (config: GeneratorConfig): Timeslot[] => {
	const { from, to, length, gap } = config;

	// Validate inputs
	if (!from || !to || length < 1) {
		return [];
	}

	const slots: Timeslot[] = [];
	const startMinutes = timeToMinutes(from);
	const endMinutes = timeToMinutes(to);

	let current = startMinutes;

	while (current + length <= endMinutes && slots.length < MAX_SLOTS_PER_GROUP) {
		slots.push({
			from: minutesToTime(current),
			to: minutesToTime(current + length),
		});
		current += length + gap;
	}

	return slots;
};

/**
 * Format slot for display (e.g., "09:00 - 10:00")
 */
export const formatSlot = (slot: Timeslot): string => {
	return `${slot.from} - ${slot.to}`;
};

/**
 * Get slot count label for group header
 * Evidence: timeslots.php lines 11-15 (slot count display)
 */
export const getSlotCountLabel = (count: number): string => {
	if (count === 0) return 'No slots';
	if (count === 1) return '1 slot';
	return `${count} slots`;
};

/**
 * Create a new empty group
 */
export const createEmptyGroup = (): TimeslotGroup => ({
	days: [],
	slots: [],
});

/**
 * Create a new slot with default times
 */
export const createDefaultSlot = (): Timeslot => ({
	from: '09:00',
	to: '10:00',
});

/**
 * Format date as YYYY-MM-DD
 */
export const formatDate = (date: Date): string => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
};

/**
 * Parse YYYY-MM-DD string to Date
 */
export const parseDate = (dateStr: string): Date => {
	const [year, month, day] = dateStr.split('-').map(Number);
	return new Date(year, month - 1, day);
};

/**
 * Check if two dates are the same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
	return (
		date1.getFullYear() === date2.getFullYear() &&
		date1.getMonth() === date2.getMonth() &&
		date1.getDate() === date2.getDate()
	);
};

/**
 * Default generator configuration
 */
export const DEFAULT_GENERATOR_CONFIG: GeneratorConfig = {
	from: '09:00',
	to: '17:00',
	length: 60,
	gap: 0,
};
