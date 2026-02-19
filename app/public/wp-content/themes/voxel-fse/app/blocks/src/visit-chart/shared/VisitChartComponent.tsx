/**
 * Visit Chart Shared Component
 *
 * Main component used by both editor (edit.tsx) and frontend (frontend.tsx).
 * Matches Voxel's HTML structure 1:1 for CSS inheritance.
 *
 * HTML Structure Reference: themes/voxel/templates/widgets/visits-chart.php
 * CSS Reference: themes/voxel/assets/dist/bar-chart.css
 *
 * @package VoxelFSE
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import type {
	VisitChartComponentProps,
	ChartTimeframe,
	ChartItem,
	ChartState,
	ChartDataResponse,
	VisitChartVxConfig,
} from '../types';

/**
 * Tab labels for timeframes
 */
const TAB_LABELS: Record<ChartTimeframe, string> = {
	'24h': __('24 hours', 'voxel-fse'),
	'7d': __('7 days', 'voxel-fse'),
	'30d': __('30 days', 'voxel-fse'),
	'12m': __('12 months', 'voxel-fse'),
};

/**
 * Default chart icon SVG (fallback when no icon configured)
 * Source: themes/voxel/assets/images/svgs/chart.svg
 */
const DefaultChartIcon = () => (
	<svg
		width="80"
		height="80"
		viewBox="0 0 24 25"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		transform="rotate(0 0 0)"
	>
		<path
			d="M11.833 3.75C10.5904 3.75 9.58301 4.75736 9.58301 6V18.9991C9.58301 20.2417 10.5904 21.2491 11.833 21.2491H12.1663C13.409 21.2491 14.4163 20.2417 14.4163 18.9991V6C14.4163 4.75736 13.409 3.75 12.1663 3.75H11.833Z"
			fill="#343C54"
		/>
		<path
			d="M5.5 12.5625C4.25736 12.5625 3.25 13.5699 3.25 14.8125V19C3.25 20.2426 4.25736 21.25 5.5 21.25H5.83333C7.07597 21.25 8.08333 20.2426 8.08333 19V14.8125C8.08333 13.5699 7.07598 12.5625 5.83333 12.5625H5.5Z"
			fill="#343C54"
		/>
		<path
			d="M18.166 8.66016C16.9234 8.66016 15.916 9.66752 15.916 10.9102V19.0001C15.916 20.2427 16.9234 21.2501 18.166 21.2501H18.4993C19.742 21.2501 20.7493 20.2427 20.7493 19.0001V10.9102C20.7493 9.66752 19.742 8.66016 18.4993 8.66016H18.166Z"
			fill="#343C54"
		/>
	</svg>
);

/**
 * Render icon from AdvancedIconControl value
 * Supports: font icons, SVG, library icons, images
 */
const renderIcon = (iconValue: any) => {
	if (!iconValue) return <DefaultChartIcon />;

	// Handle different icon types from AdvancedIconControl
	// Type 1: Font icon (Elementor Icons, FontAwesome, etc.)
	if (iconValue.library && iconValue.value && !iconValue.value.includes('.')) {
		return <i className={iconValue.value} aria-hidden="true" />;
	}

	// Type 2: SVG code
	if (iconValue.value && iconValue.value.includes('<svg')) {
		return (
			<span
				dangerouslySetInnerHTML={{ __html: iconValue.value }}
				aria-hidden="true"
			/>
		);
	}

	// Type 3: Image URL
	if (iconValue.url) {
		return (
			<img
				src={iconValue.url}
				alt=""
				aria-hidden="true"
				style={{ width: '48px', height: '48px' }}
			/>
		);
	}

	// Fallback to default
	return <DefaultChartIcon />;
};

/**
 * Main Visit Chart Component
 */
export default function VisitChartComponent({
	attributes,
	context,
	vxconfig,
}: VisitChartComponentProps) {
	// State management (matching Voxel Vue data)
	const [activeChart, setActiveChart] = useState<ChartTimeframe>(
		attributes.activeChart || '7d'
	);
	const [charts, setCharts] = useState<Record<ChartTimeframe, ChartState>>({
		'24h': { loaded: false },
		'7d': { loaded: false },
		'30d': { loaded: false },
		'12m': { loaded: false },
	});
	const [loading, setLoading] = useState(false);
	const [activeItem, setActiveItem] = useState<ChartItem | null>(null);

	// Refs for DOM elements
	const scrollAreaRef = useRef<HTMLDivElement>(null);
	const popupRef = useRef<HTMLUListElement>(null);

	// Drag scroll state
	const scrollState = useRef({
		isDown: false,
		startX: 0,
		scrollLeft: 0,
	});

	/**
	 * Get REST API URL
	 */
	const getRestUrl = useCallback((): string => {
		if (typeof window !== 'undefined' && window.wpApiSettings?.root) {
			return window.wpApiSettings.root;
		}
		return '/wp-json/';
	}, []);

	/**
	 * Load chart data from REST API
	 */
	const loadChart = useCallback(
		async (timeframe: ChartTimeframe) => {
			// Skip loading in editor context - show placeholder
			if (context === 'editor') {
				return;
			}

			if (!vxconfig) {
				return;
			}

			setLoading(true);

			try {
				const params = new URLSearchParams({
					source: vxconfig.source,
					timeframe,
					view_type: vxconfig.viewType,
					_wpnonce: vxconfig.nonce,
				});

				if (vxconfig.source === 'post' && vxconfig.postId) {
					params.append('post_id', String(vxconfig.postId));
				}

				// Use Voxel's AJAX endpoint
				const ajaxUrl = window.Voxel_Config?.ajax_url || '/wp-admin/admin-ajax.php?';
				const url = `${ajaxUrl}&action=tracking.get_chart_data&${params.toString()}`;

				const response = await fetch(url);
				const data: ChartDataResponse = await response.json();

				if (data.success && data.data) {
					setCharts((prev) => ({
						...prev,
						[timeframe]: {
							loaded: true,
							steps: data.data.steps,
							items: data.data.items,
							meta: data.data.meta,
						},
					}));
				} else {
					// Voxel parity: Use Voxel.alert() for error notifications (line 146-147 of beautified reference)
					const errorMessage = data.message || window.Voxel_Config?.l10n?.ajaxError || 'An error occurred';
					if (window.Voxel?.alert) {
						window.Voxel.alert(errorMessage, 'error');
					}
					setCharts((prev) => ({
						...prev,
						[timeframe]: {
							loaded: true,
							error: true,
						},
					}));
				}
			} catch {
				// Voxel parity: Use Voxel.alert() for error notifications (line 146-147 of beautified reference)
				const errorMessage = window.Voxel_Config?.l10n?.ajaxError || 'An error occurred';
				if (window.Voxel?.alert) {
					window.Voxel.alert(errorMessage, 'error');
				}
				setCharts((prev) => ({
					...prev,
					[timeframe]: {
						loaded: true,
						error: true,
					},
				}));
			} finally {
				setLoading(false);
			}
		},
		[context, vxconfig]
	);

	/**
	 * Load chart data when active chart changes
	 */
	useEffect(() => {
		const currentChart = charts[activeChart];
		if (currentChart && !currentChart.loaded && context === 'frontend') {
			loadChart(activeChart);
		}
	}, [activeChart, charts, context, loadChart]);

	/**
	 * Setup drag scroll functionality
	 */
	useEffect(() => {
		const scrollArea = scrollAreaRef.current;
		if (!scrollArea) return;

		const handleMouseUp = () => {
			scrollState.current.isDown = false;
		};

		const handleMouseLeave = () => {
			scrollState.current.isDown = false;
		};

		const handleMouseDown = (e: MouseEvent) => {
			scrollState.current.isDown = true;
			scrollState.current.startX = e.pageX - scrollArea.offsetLeft;
			scrollState.current.scrollLeft = scrollArea.scrollLeft;
		};

		const handleMouseMove = (e: MouseEvent) => {
			if (!scrollState.current.isDown) return;
			e.preventDefault();
			const x = e.pageX - scrollArea.offsetLeft;
			const walk = x - scrollState.current.startX;
			scrollArea.scrollLeft = scrollState.current.scrollLeft - walk;
		};

		scrollArea.addEventListener('mouseup', handleMouseUp);
		scrollArea.addEventListener('mouseleave', handleMouseLeave);
		scrollArea.addEventListener('mousedown', handleMouseDown);
		scrollArea.addEventListener('mousemove', handleMouseMove);

		// Scroll to right on initial load
		requestAnimationFrame(() => {
			scrollArea.scrollLeft = scrollArea.scrollWidth;
		});

		return () => {
			scrollArea.removeEventListener('mouseup', handleMouseUp);
			scrollArea.removeEventListener('mouseleave', handleMouseLeave);
			scrollArea.removeEventListener('mousedown', handleMouseDown);
			scrollArea.removeEventListener('mousemove', handleMouseMove);
		};
	}, [activeChart]);

	/**
	 * Show popup on bar hover
	 */
	const showPopup = useCallback(
		(event: React.MouseEvent<HTMLDivElement>, item: ChartItem) => {
			setActiveItem(item);
			const popup = popupRef.current;
			if (!popup) return;

			const rect = event.currentTarget.getBoundingClientRect();
			popup.style.top = `${rect.top}px`;

			// Position popup on left or right depending on available space
			if (window.innerWidth - rect.right >= popup.offsetWidth + 10) {
				popup.style.left = `${rect.left + rect.width + 10}px`;
			} else {
				popup.style.left = `${rect.left - popup.offsetWidth - 10}px`;
			}
		},
		[]
	);

	/**
	 * Hide popup on mouse leave
	 */
	const hidePopup = useCallback(() => {
		setActiveItem(null);
	}, []);

	/**
	 * Get current chart state
	 */
	const currentChart = charts[activeChart];

	/**
	 * Render the vxconfig script tag (required for Plan C+ - visible in DevTools)
	 */
	const renderVxConfig = () => {
		if (context !== 'frontend' || !vxconfig) return null;

		return (
			<script
				type="text/json"
				className="vxconfig"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(vxconfig),
				}}
			/>
		);
	};

	/**
	 * Render editor placeholder
	 * Matches Voxel's Elementor preview: tabs + "Loading data" icon state
	 */
	if (context === 'editor') {
		return (
			<div className="ts-visits-chart voxel-fse-editor-preview">
				{/* Tabs */}
				<ul className="ts-generic-tabs simplify-ul flexify bar-chart-tabs">
					{(Object.keys(TAB_LABELS) as ChartTimeframe[]).map((key) => (
						<li
							key={key}
							className={activeChart === key ? 'ts-tab-active' : ''}
						>
							<a
								href="#"
								onClick={(e) => {
									e.preventDefault();
									setActiveChart(key);
								}}
							>
								{TAB_LABELS[key]}
							</a>
						</li>
					))}
				</ul>

				{/* Loading data state - matches Voxel's editor preview */}
				<div className={`ts-chart chart-${activeChart}`}>
					<div className="chart-contain">
						<div className="ts-no-posts">
							{renderIcon(attributes.chartIcon)}
							<p>{__('Loading data', 'voxel-fse')}</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	/**
	 * Render frontend component
	 */
	return (
		<>
			{renderVxConfig()}

			{/* Tabs - matching Voxel HTML structure */}
			<ul className="ts-generic-tabs simplify-ul flexify bar-chart-tabs">
				{(Object.keys(TAB_LABELS) as ChartTimeframe[]).map((key) => (
					<li
						key={key}
						className={activeChart === key ? 'ts-tab-active' : ''}
					>
						<a
							href="#"
							onClick={(e) => {
								e.preventDefault();
								setActiveChart(key);
							}}
						>
							{TAB_LABELS[key]}
						</a>
					</li>
				))}
			</ul>

			{/* Chart Container */}
			{currentChart && (
				<div
					className={`ts-chart chart-${activeChart}${loading ? ' vx-pending' : ''}`}
				>
					{/* Loading State */}
					{!currentChart.loaded && (
						<div className="chart-contain">
							<div className="ts-no-posts">
								{renderIcon(attributes.chartIcon)}
								<p>{__('Loading data', 'voxel-fse')}</p>
							</div>
						</div>
					)}

					{/* Loaded State */}
					{currentChart.loaded && (
						<>
							{/* Has Activity */}
							{currentChart.meta?.has_activity && currentChart.items && (
								<div className="chart-contain">
									{/* Y-Axis Values */}
									<div className="chart-content">
										<div className="bar-item-con bar-values">
											{currentChart.steps?.map((step, index) => (
												<span key={index}>{step}</span>
											))}
										</div>
									</div>

									{/* Bar Items */}
									<div
										className="chart-content min-scroll min-scroll-h"
										ref={scrollAreaRef}
									>
										{currentChart.items.map((item, index) => (
											<div key={index} className="bar-item-con">
												<div className="bi-hold">
													<div
														className="bar-item bar-animate"
														style={{ height: `${item.percent}%` }}
														onMouseOver={(e) => showPopup(e, item)}
														onMouseLeave={hidePopup}
													/>
												</div>
												<span>{item.label}</span>
											</div>
										))}
									</div>

									{/* Popup Tooltip */}
									<ul
										ref={popupRef}
										className={`flexify simplify-ul bar-item-data${activeItem ? ' active' : ''}`}
									>
										<li>
											<small>{__('Views', 'voxel-fse')}</small>
											{activeItem?.count || ''}
										</li>
										<li>
											<small>{__('Unique views', 'voxel-fse')}</small>
											{activeItem?.unique_count || ''}
										</li>
									</ul>
								</div>
							)}

							{/* No Activity */}
							{!currentChart.meta?.has_activity && (
								<div className="ts-no-posts">
									{renderIcon(attributes.chartIcon)}
									<p>{__('No activity', 'voxel-fse')}</p>
								</div>
							)}
						</>
					)}
				</div>
			)}
		</>
	);
}
