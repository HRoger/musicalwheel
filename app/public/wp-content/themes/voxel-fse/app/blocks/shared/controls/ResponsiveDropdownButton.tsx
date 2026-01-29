/**
 * Responsive Dropdown Button Component
 *
 * Matches Elementor's responsive control pattern - small icon button on the right
 * that opens a dropdown with desktop/tablet/mobile icons.
 *
 * IMPORTANT: This component ALWAYS syncs with WordPress global device preview.
 * When device is changed:
 * 1. The editor canvas changes to show that device preview
 * 2. ALL responsive dropdowns in the inspector sync to the same device
 * 3. The user stays on the same tab they were editing
 *
 * This matches Elementor's behavior where changing any responsive dropdown
 * updates the global preview and all other responsive controls.
 *
 * The dropdown stays OPEN when switching devices, allowing quick comparison
 * across breakpoints. Click outside to close.
 *
 * Evidence:
 * - Elementor pattern: themes/voxel/app/widgets/option-groups/popup-general.php:44-62
 */

import { useRef, useEffect } from 'react';
import { dispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { usePersistentPopupState, notifyDeviceChange } from './usePersistentPopupState';
import { getCurrentDeviceType, setDeviceType as setDeviceTypeUtil, type DeviceType } from '@shared/utils/deviceType';

interface ResponsiveDropdownButtonProps {
	/**
	 * Optional callback when device changes. Called AFTER dispatching to WordPress store.
	 * Most consumers don't need this - they should read from WordPress store directly.
	 */
	onDeviceChange?: (device: DeviceType) => void;
	/**
	 * Unique key for persisting open state across device changes (remounts).
	 * Pass a unique string (e.g. attribute name) if you want the dropdown to stay open
	 * when switching devices.
	 */
	controlKey?: string;
}

// Get Elementor icon class for device
const getDeviceIconClass = (device: DeviceType): string => {
	switch (device) {
		case 'desktop':
			return 'eicon-device-desktop';
		case 'tablet':
			return 'eicon-device-tablet';
		case 'mobile':
			return 'eicon-device-mobile';
	}
};

export default function ResponsiveDropdownButton({
	onDeviceChange,
	controlKey,
}: ResponsiveDropdownButtonProps) {
	// Use persistent state if controlKey is provided, otherwise normal state
	const [isOpen, setIsOpen] = usePersistentPopupState(
		controlKey ? `responsive_dropdown_${controlKey}` : undefined,
		false
	);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// ALWAYS read from WordPress device store - this ensures all dropdowns stay in sync
	const currentDevice = useSelect((select: (store: string) => any) => {
		return getCurrentDeviceType(select);
	});

	// Handle device change - ALWAYS dispatch to WordPress store
	// NOTE: We do NOT close the dropdown here - it stays open for quick device switching
	const handleDeviceChange = (device: DeviceType) => {
		// Notify global state that a device change is happening
		// This sets the timestamp allow popups to survive the remount
		notifyDeviceChange();

		// Call callback BEFORE dispatching to WordPress
		// This allows parent components to set flags before viewport transition starts
		onDeviceChange?.(device);

		// Use centralized utility to set device type
		setDeviceTypeUtil(device);
	};

	// Position and click-outside handling
	useEffect(() => {
		if (!isOpen || !dropdownRef.current || !buttonRef.current) return;

		// Position the dropdown relative to the button using fixed positioning
		const updatePosition = () => {
			if (!dropdownRef.current || !buttonRef.current) return;
			const buttonRect = buttonRef.current.getBoundingClientRect();
			const dropdown = dropdownRef.current;

			// Position below the button, aligned to the left of the button
			dropdown.style.top = `${buttonRect.bottom + 4}px`;
			dropdown.style.left = `${buttonRect.left}px`;

			// Ensure it doesn't go off-screen
			const dropdownRect = dropdown.getBoundingClientRect();
			if (dropdownRect.right > window.innerWidth - 8) {
				dropdown.style.left = `${window.innerWidth - dropdownRect.width - 8}px`;
			}
			if (dropdownRect.left < 8) {
				dropdown.style.left = '8px';
			}
			if (dropdownRect.bottom > window.innerHeight - 8) {
				// Position above if not enough space below
				dropdown.style.top = `${buttonRect.top - dropdown.offsetHeight - 4}px`;
			}
		};

		// Initial position
		requestAnimationFrame(updatePosition);

		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as HTMLElement;

			// Don't close if clicking inside the dropdown
			if (dropdownRef.current?.contains(target)) {
				return;
			}

			// Don't close if clicking the toggle button
			if (buttonRef.current?.contains(target)) {
				return;
			}

			// Don't close if clicking inside another popover (nested dropdowns, typography popup, etc.)
			if (
				target.closest('.components-popover') ||
				target.closest('.elementor-control-popover') ||
				target.closest('.responsive-dropdown-popover') ||
				target.closest('.components-dropdown-menu__popover')
			) {
				return;
			}

			setIsOpen(false);
		};

		window.addEventListener('resize', updatePosition);
		window.addEventListener('scroll', updatePosition, true);
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			window.removeEventListener('resize', updatePosition);
			window.removeEventListener('scroll', updatePosition, true);
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen]);

	const devices: DeviceType[] = ['desktop', 'tablet', 'mobile'];

	return (
		<div style={{ position: 'relative', display: 'inline-block' }}>
			<button
				ref={buttonRef}
				type="button"
				aria-label={__('Responsive', 'voxel-fse')}
				onClick={() => setIsOpen(!isOpen)}
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					width: '22px',
					height: '22px',
					padding: 0,
					border: 'none',
					background: 'transparent',
					cursor: 'pointer',
					color: '#007cba',
				}}
			>
				<i className={getDeviceIconClass(currentDevice)} style={{ fontSize: '12px' }} />
			</button>
			{isOpen && (
				<div
					ref={dropdownRef}
					className="components-popover responsive-dropdown-popover"
					style={{
						position: 'fixed',
						zIndex: 999999,
						backgroundColor: '#fff',
						border: '1px solid #ddd',
						borderRadius: '3px',
						boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
						padding: '4px',
						display: 'flex',
						flexDirection: 'column',
						gap: '2px',
					}}
					role="menu"
				>
					{devices.map((device) => (
						<button
							key={device}
							type="button"
							role="menuitem"
							aria-label={device}
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								handleDeviceChange(device);
							}}
							style={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								width: '26px',
								height: '26px',
								padding: 0,
								border: 'none',
								borderRadius: '2px',
								background: currentDevice === device ? '#007cba' : 'transparent',
								color: currentDevice === device ? '#fff' : '#007cba',
								cursor: 'pointer',
								transition: 'all 0.15s ease',
							}}
							onMouseEnter={(e) => {
								if (currentDevice !== device) {
									e.currentTarget.style.background = '#f0f0f1';
								}
							}}
							onMouseLeave={(e) => {
								if (currentDevice !== device) {
									e.currentTarget.style.background = 'transparent';
								}
							}}
						>
							<i className={getDeviceIconClass(device)} style={{ fontSize: '13px' }} />
						</button>
					))}
				</div>
			)}
		</div>
	);
}
