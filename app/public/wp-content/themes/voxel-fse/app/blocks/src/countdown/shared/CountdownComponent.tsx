/**
 * Countdown Component - Shared between Editor and Frontend
 *
 * Reference: docs/block-conversions/countdown/voxel-countdown.beautified.js
 *
 * VOXEL PARITY CHECKLIST:
 * ✅ Time unit calculations match (days, hours, minutes, seconds from total seconds)
 * ✅ Animation timing matches (500ms fade-out, update, fade-in)
 * ✅ Animation CSS classes match (vx-fade-out-up, vx-fade-in-up)
 * ✅ DOM structure matches (.countdown-timer, .timer-days, etc.)
 * ✅ Completion handling matches (hide timer, show ended message)
 * ✅ Event listening matches (voxel:markup-update for AJAX content)
 * ✅ Re-initialization prevention (data-react-mounted vs .vx-event-timer)
 *
 * INTENTIONAL DIFFERENCES (Next.js Ready):
 * ✨ Time calculation: Uses Date.now() instead of server timestamp + local increment
 *    - Voxel: config.now++ each second (avoids timezone issues with server sync)
 *    - FSE: Date.now() recalculation (more accurate, works without server data)
 *    - Why: Better for Next.js where we'll fetch from REST API, not server-rendered
 * ✨ vxconfig format: Extended with enhancement props (spacing, colors, typography)
 *    - Voxel: { now: number, due: number }
 *    - FSE: { dueDate: string, ...enhancement props }
 *    - Why: FSE block is a replacement with more features, not a wrapper
 * ✨ Enhancements: Responsive spacing, colors, typography, show/hide units, orientation
 *
 * NEXT.JS READY:
 * ✅ No server timestamp dependency (uses Date.now())
 * ✅ Props-based component (config passed as prop)
 * ✅ No WordPress globals required
 * ✅ Pure React (no jQuery dependencies)
 */
import { useState, useEffect, useRef } from 'react';
import { __ } from '@wordpress/i18n';
import type { CountdownComponentProps, CountdownState, CountdownConfig } from '../types';
import type { TypographyValue } from '../../../shared/controls/TypographyPopup';

/**
 * Generate CSS properties from typography object
 */
function getTypographyStyles(typography: TypographyValue | undefined): React.CSSProperties {
	if (!typography || typeof typography !== 'object') {
		return {};
	}

	const styles: React.CSSProperties = {};

	if (typography.fontFamily) {
		styles.fontFamily = typography.fontFamily;
	}
	if (typeof typography.fontSize === 'number') {
		styles.fontSize = `${typography.fontSize}${typography.fontSizeUnit || 'px'}`;
	}
	if (typography.fontWeight) {
		styles.fontWeight = typography.fontWeight;
	}
	if (typography.fontStyle && typography.fontStyle !== 'default') {
		styles.fontStyle = typography.fontStyle;
	}
	if (typography.textTransform && typography.textTransform !== 'none') {
		styles.textTransform = typography.textTransform as React.CSSProperties['textTransform'];
	}
	if (typography.textDecoration && typography.textDecoration !== 'none') {
		styles.textDecoration = typography.textDecoration;
	}
	if (typeof typography.lineHeight === 'number') {
		styles.lineHeight = `${typography.lineHeight}${typography.lineHeightUnit || 'px'}`;
	}
	if (typeof typography.letterSpacing === 'number') {
		styles.letterSpacing = `${typography.letterSpacing}${typography.letterSpacingUnit || 'px'}`;
	}
	if (typeof typography.wordSpacing === 'number') {
		styles.wordSpacing = `${typography.wordSpacing}${typography.wordSpacingUnit || 'px'}`;
	}

	return styles;
}

/**
 * Normalize config from various sources (vxconfig, REST API, etc.)
 *
 * Handles both WordPress vxconfig format and future Next.js REST API format.
 * Supports both camelCase (vxconfig) and snake_case (REST API) field names.
 *
 * @param raw - Raw config from any source
 * @returns Normalized CountdownConfig
 */
function normalizeConfig(raw: any): CountdownConfig {
	return {
		// Required: Due date (supports multiple field name variants)
		dueDate: raw.dueDate ?? raw.due_date ?? raw.target_date ?? '',

		// Required: Ended text
		countdownEndedText:
			raw.countdownEndedText ?? raw.countdown_ended_text ?? raw.ended_text ?? 'Countdown ended',

		// Optional: Hide/show units (defaults to false = show all)
		hideSeconds: raw.hideSeconds ?? raw.hide_seconds ?? false,
		hideMinutes: raw.hideMinutes ?? raw.hide_minutes ?? false,
		hideHours: raw.hideHours ?? raw.hide_hours ?? false,
		hideDays: raw.hideDays ?? raw.hide_days ?? false,

		// Optional: Style options
		disableAnimation: raw.disableAnimation ?? raw.disable_animation ?? false,
		horizontalOrientation: raw.horizontalOrientation ?? raw.horizontal_orientation ?? false,

		// Optional: Responsive spacing
		itemSpacing: raw.itemSpacing ?? raw.item_spacing ?? 15,
		itemSpacing_tablet: raw.itemSpacing_tablet ?? raw.item_spacing_tablet ?? 10,
		itemSpacing_mobile: raw.itemSpacing_mobile ?? raw.item_spacing_mobile ?? 5,
		itemSpacingUnit: raw.itemSpacingUnit ?? raw.item_spacing_unit ?? 'px',

		contentSpacing: raw.contentSpacing ?? raw.content_spacing ?? 10,
		contentSpacing_tablet: raw.contentSpacing_tablet ?? raw.content_spacing_tablet ?? 8,
		contentSpacing_mobile: raw.contentSpacing_mobile ?? raw.content_spacing_mobile ?? 5,
		contentSpacingUnit: raw.contentSpacingUnit ?? raw.content_spacing_unit ?? 'px',

		// Optional: Colors
		textColor: raw.textColor ?? raw.text_color ?? '',
		numberColor: raw.numberColor ?? raw.number_color ?? '',
		endedColor: raw.endedColor ?? raw.ended_color ?? '',

		// Optional: Typography (objects)
		textTypography: raw.textTypography ?? raw.text_typography ?? {},
		numberTypography: raw.numberTypography ?? raw.number_typography ?? {},
		endedTypography: raw.endedTypography ?? raw.ended_typography ?? {},
	};
}

export function CountdownComponent({ config: rawConfig, isEditor = false }: CountdownComponentProps): JSX.Element {
	// Normalize config to handle both vxconfig and REST API formats
	const config = normalizeConfig(rawConfig);
	// State for countdown values
	const [state, setState] = useState<CountdownState>({
		days: 0,
		hours: 0,
		minutes: 0,
		seconds: 0,
		isExpired: false,
	});

	// Refs for animation
	const daysRef = useRef<HTMLSpanElement>(null);
	const hoursRef = useRef<HTMLSpanElement>(null);
	const minutesRef = useRef<HTMLSpanElement>(null);
	const secondsRef = useRef<HTMLSpanElement>(null);

	// Calculate countdown
	const calculateCountdown = (): CountdownState => {
		if (!config.dueDate) {
			return {
				days: 0,
				hours: 0,
				minutes: 0,
				seconds: 0,
				isExpired: true,
			};
		}

		const now = new Date().getTime();
		const due = new Date(config.dueDate).getTime();
		const diff = Math.floor((due - now) / 1000); // difference in seconds

		// Match Voxel completion check exactly (line 185: if (remainingSeconds < 0))
		if (diff < 0) {
			return {
				days: 0,
				hours: 0,
				minutes: 0,
				seconds: 0,
				isExpired: true,
			};
		}

		const days = Math.floor(diff / 86400);
		const hours = Math.floor((diff % 86400) / 3600);
		const minutes = Math.floor((diff % 3600) / 60);
		const seconds = Math.floor(diff % 60);

		return {
			days,
			hours,
			minutes,
			seconds,
			isExpired: false,
		};
	};

	// Animate number change (matches Voxel pattern)
	const animateNumber = (ref: React.RefObject<HTMLSpanElement>, newValue: number) => {
		if (!ref.current || config.disableAnimation) {
			if (ref.current) {
				ref.current.innerText = newValue.toString();
			}
			return;
		}

		// Fade out
		ref.current.style.animationName = 'vx-fade-out-up';

		// Update after 500ms (matches Voxel timing)
		setTimeout(() => {
			if (ref.current) {
				ref.current.innerText = newValue.toString();
				ref.current.style.animationName = 'vx-fade-in-up';
			}
		}, 500);
	};

	// Update countdown every second
	useEffect(() => {
		// Initial calculation
		const newState = calculateCountdown();
		setState(newState);

		// Update every second
		// Note: Voxel checks `if (!widgetElement)` before each tick for DOM removal safety.
		// React handles this automatically via the cleanup function below.
		const interval = setInterval(() => {
			const newState = calculateCountdown();
			const prevState = state;

			// Animate numbers that changed
			if (newState.days !== prevState.days) {
				animateNumber(daysRef, newState.days);
			}
			if (newState.hours !== prevState.hours) {
				animateNumber(hoursRef, newState.hours);
			}
			if (newState.minutes !== prevState.minutes) {
				animateNumber(minutesRef, newState.minutes);
			}
			if (newState.seconds !== prevState.seconds) {
				animateNumber(secondsRef, newState.seconds);
			}

			setState(newState);
		}, 1000);

		return () => clearInterval(interval);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [rawConfig.dueDate, rawConfig.disableAnimation]);

	// Build inline styles for responsive spacing
	const getResponsiveStyles = (): React.CSSProperties => {
		const styles: React.CSSProperties = {};

		// Item spacing (gap between countdown items)
		if (config.itemSpacing >= 0) {
			styles['--item-spacing-desktop'] = `${config.itemSpacing}${config.itemSpacingUnit}`;
		}
		if (config.itemSpacing_tablet >= 0) {
			styles['--item-spacing-tablet'] = `${config.itemSpacing_tablet}${config.itemSpacingUnit}`;
		}
		if (config.itemSpacing_mobile >= 0) {
			styles['--item-spacing-mobile'] = `${config.itemSpacing_mobile}${config.itemSpacingUnit}`;
		}

		// Content spacing (gap within each item)
		if (config.contentSpacing >= 0) {
			styles['--content-spacing-desktop'] = `${config.contentSpacing}${config.contentSpacingUnit}`;
		}
		if (config.contentSpacing_tablet >= 0) {
			styles['--content-spacing-tablet'] = `${config.contentSpacing_tablet}${config.contentSpacingUnit}`;
		}
		if (config.contentSpacing_mobile >= 0) {
			styles['--content-spacing-mobile'] = `${config.contentSpacing_mobile}${config.contentSpacingUnit}`;
		}

		return styles;
	};

	// Build inline styles for colors
	const getColorStyles = (): React.CSSProperties => {
		const styles: React.CSSProperties = {};

		if (config.textColor) {
			styles['--text-color'] = config.textColor;
		}
		if (config.numberColor) {
			styles['--number-color'] = config.numberColor;
		}
		if (config.endedColor) {
			styles['--ended-color'] = config.endedColor;
		}

		return styles;
	};

	// Combine all inline styles
	const inlineStyles = {
		...getResponsiveStyles(),
		...getColorStyles(),
	};

	// Re-render vxconfig (CRITICAL for DevTools visibility)
	const vxconfigScript = (
		<script
			type="application/json"
			className="vxconfig"
			dangerouslySetInnerHTML={{
				__html: JSON.stringify(config),
			}}
		/>
	);

	return (
		<>
			{vxconfigScript}

			{/* Matches Voxel HTML structure 1:1 */}
			<div
				className="ts-countdown-widget flexify"
				style={inlineStyles}
				data-config={JSON.stringify({
					days: state.days,
					hours: state.hours,
					minutes: state.minutes,
					seconds: state.seconds,
					due: new Date(config.dueDate).getTime() / 1000,
					now: Date.now() / 1000,
				})}
			>
				{/* Countdown timer (shown when not expired) */}
				{!state.isExpired && (
					<ul
						className={`countdown-timer flexify simplify-ul${
							config.horizontalOrientation ? ' ts-ct-inline' : ''
						}${config.disableAnimation ? ' ts-disable-animation' : ''}`}
						style={{
							gap: `${config.itemSpacing}${config.itemSpacingUnit}`,
						}}
					>
						{!config.hideDays && (
							<li
								style={{
									display: 'flex',
									flexDirection: config.horizontalOrientation ? 'row' : 'column',
									alignItems: 'center',
									justifyContent: 'center',
									gap: `${config.contentSpacing}${config.contentSpacingUnit}`,
								}}
							>
								<span
									ref={daysRef}
									className="timer-days"
									style={{
										color: config.numberColor || undefined,
										animation: config.disableAnimation ? 'none' : undefined,
										...getTypographyStyles(config.numberTypography),
									}}
								>
									{state.days}
								</span>
								<p style={{ color: config.textColor || undefined, ...getTypographyStyles(config.textTypography) }}>
									{__('Days', 'voxel-fse')}
								</p>
							</li>
						)}

						{!config.hideHours && (
							<li
								style={{
									display: 'flex',
									flexDirection: config.horizontalOrientation ? 'row' : 'column',
									alignItems: 'center',
									justifyContent: 'center',
									gap: `${config.contentSpacing}${config.contentSpacingUnit}`,
								}}
							>
								<span
									ref={hoursRef}
									className="timer-hours"
									style={{
										color: config.numberColor || undefined,
										animation: config.disableAnimation ? 'none' : undefined,
										...getTypographyStyles(config.numberTypography),
									}}
								>
									{state.hours}
								</span>
								<p style={{ color: config.textColor || undefined, ...getTypographyStyles(config.textTypography) }}>
									{__('Hours', 'voxel-fse')}
								</p>
							</li>
						)}

						{!config.hideMinutes && (
							<li
								style={{
									display: 'flex',
									flexDirection: config.horizontalOrientation ? 'row' : 'column',
									alignItems: 'center',
									justifyContent: 'center',
									gap: `${config.contentSpacing}${config.contentSpacingUnit}`,
								}}
							>
								<span
									ref={minutesRef}
									className="timer-minutes"
									style={{
										color: config.numberColor || undefined,
										animation: config.disableAnimation ? 'none' : undefined,
										...getTypographyStyles(config.numberTypography),
									}}
								>
									{state.minutes}
								</span>
								<p style={{ color: config.textColor || undefined, ...getTypographyStyles(config.textTypography) }}>
									{__('Minutes', 'voxel-fse')}
								</p>
							</li>
						)}

						{!config.hideSeconds && (
							<li
								style={{
									display: 'flex',
									flexDirection: config.horizontalOrientation ? 'row' : 'column',
									alignItems: 'center',
									justifyContent: 'center',
									gap: `${config.contentSpacing}${config.contentSpacingUnit}`,
								}}
							>
								<span
									ref={secondsRef}
									className="timer-seconds"
									style={{
										color: config.numberColor || undefined,
										animation: config.disableAnimation ? 'none' : undefined,
										...getTypographyStyles(config.numberTypography),
									}}
								>
									{state.seconds}
								</span>
								<p style={{ color: config.textColor || undefined, ...getTypographyStyles(config.textTypography) }}>
									{__('Seconds', 'voxel-fse')}
								</p>
							</li>
						)}
					</ul>
				)}

				{/* Countdown ended message (shown when expired) */}
				<div
					className="countdown-ended"
					style={{
						display: state.isExpired ? 'flex' : 'none',
						color: config.endedColor || undefined,
						...getTypographyStyles(config.endedTypography),
					}}
				>
					{config.countdownEndedText}
				</div>
			</div>
		</>
	);
}
