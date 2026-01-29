/**
 * Formatter Utilities
 *
 * Functions for formatting dates, numbers, and other display values.
 *
 * @package VoxelFSE
 */

/**
 * Time difference thresholds in seconds
 */
const TIME_THRESHOLDS = {
	minute: 60,
	hour: 60 * 60,
	day: 60 * 60 * 24,
	week: 60 * 60 * 24 * 7,
	month: 60 * 60 * 24 * 30,
	year: 60 * 60 * 24 * 365,
};

/**
 * Format relative time (e.g., "5 minutes ago")
 *
 * @param dateString - ISO date string or timestamp
 * @param strings - i18n strings for time labels
 */
export function formatRelativeTime(
	dateString: string,
	strings?: {
		just_now?: string;
		minutes_ago?: string;
		hours_ago?: string;
		days_ago?: string;
	}
): string {
	const date = new Date(dateString);
	const now = new Date();
	const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

	// Default strings
	const defaultStrings = {
		just_now: 'Just now',
		minutes_ago: '%d minutes ago',
		hours_ago: '%d hours ago',
		days_ago: '%d days ago',
	};

	const s = { ...defaultStrings, ...strings };

	if (diffSeconds < TIME_THRESHOLDS.minute) {
		return s.just_now;
	}

	if (diffSeconds < TIME_THRESHOLDS.hour) {
		const minutes = Math.floor(diffSeconds / TIME_THRESHOLDS.minute);
		return s.minutes_ago.replace('%d', String(minutes));
	}

	if (diffSeconds < TIME_THRESHOLDS.day) {
		const hours = Math.floor(diffSeconds / TIME_THRESHOLDS.hour);
		return s.hours_ago.replace('%d', String(hours));
	}

	if (diffSeconds < TIME_THRESHOLDS.week) {
		const days = Math.floor(diffSeconds / TIME_THRESHOLDS.day);
		return s.days_ago.replace('%d', String(days));
	}

	// Fall back to formatted date for older content
	return formatDate(dateString);
}

/**
 * Format date in readable format
 *
 * @param dateString - ISO date string
 * @param options - Intl.DateTimeFormat options
 */
export function formatDate(
	dateString: string,
	options: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	}
): string {
	const date = new Date(dateString);
	return date.toLocaleDateString(undefined, options);
}

/**
 * Format date and time
 *
 * @param dateString - ISO date string
 */
export function formatDateTime(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleString(undefined, {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
}

/**
 * Format number with thousands separator
 *
 * @param num - Number to format
 * @param locale - Locale for formatting
 */
export function formatNumber(num: number, locale?: string): string {
	return num.toLocaleString(locale);
}

/**
 * Format compact number (e.g., 1.2K, 5M)
 *
 * @param num - Number to format
 */
export function formatCompactNumber(num: number): string {
	if (num < 1000) {
		return String(num);
	}

	if (num < 1000000) {
		const k = num / 1000;
		return k % 1 === 0 ? `${k}K` : `${k.toFixed(1)}K`;
	}

	const m = num / 1000000;
	return m % 1 === 0 ? `${m}M` : `${m.toFixed(1)}M`;
}

/**
 * Format count with singular/plural label
 *
 * @param count - Number count
 * @param singular - Singular form
 * @param plural - Plural form
 */
export function formatCount(count: number, singular: string, plural: string): string {
	const formatted = formatCompactNumber(count);
	const label = count === 1 ? singular : plural;
	return `${formatted} ${label}`;
}

/**
 * Format file size in human-readable format
 *
 * @param bytes - File size in bytes
 */
export function formatFileSize(bytes: number): string {
	if (bytes === 0) return '0 B';

	const units = ['B', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(1024));
	const size = bytes / Math.pow(1024, i);

	return `${size.toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

/**
 * Generate initials from name
 *
 * @param name - Full name
 * @param maxLength - Maximum initials length
 */
export function getInitials(name: string, maxLength: number = 2): string {
	if (!name) return '';

	const words = name.trim().split(/\s+/);
	const initials = words
		.slice(0, maxLength)
		.map((word) => word[0]?.toUpperCase() || '')
		.join('');

	return initials;
}

/**
 * Truncate text with ellipsis
 *
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 */
export function truncateText(text: string, maxLength: number): string {
	if (text.length <= maxLength) return text;
	return text.slice(0, maxLength - 3).trim() + '...';
}

/**
 * Generate a color from string (for avatars)
 *
 * @param str - Input string (e.g., username)
 */
export function stringToColor(str: string): string {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}

	const hue = Math.abs(hash % 360);
	return `hsl(${hue}, 65%, 50%)`;
}

/**
 * Calculate reading time
 *
 * @param text - Content text
 * @param wordsPerMinute - Reading speed (default 200)
 */
export function calculateReadingTime(text: string, wordsPerMinute: number = 200): number {
	const wordCount = text.trim().split(/\s+/).length;
	return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Check if date is today
 */
export function isToday(dateString: string): boolean {
	const date = new Date(dateString);
	const today = new Date();
	return (
		date.getDate() === today.getDate() &&
		date.getMonth() === today.getMonth() &&
		date.getFullYear() === today.getFullYear()
	);
}

/**
 * Check if date is this week
 */
export function isThisWeek(dateString: string): boolean {
	const date = new Date(dateString);
	const now = new Date();
	const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
	return date >= weekAgo && date <= now;
}

/**
 * Format review score as stars
 *
 * @param score - Review score (-2 to 2 scale)
 * @param maxStars - Maximum stars to display
 */
export function formatReviewScore(score: number, maxStars: number = 5): {
	filled: number;
	half: boolean;
	empty: number;
} {
	// Convert -2 to 2 scale to 0-5 stars
	const normalizedScore = ((score + 2) / 4) * maxStars;
	const filled = Math.floor(normalizedScore);
	const half = normalizedScore - filled >= 0.5;
	const empty = maxStars - filled - (half ? 1 : 0);

	return { filled, half, empty };
}
