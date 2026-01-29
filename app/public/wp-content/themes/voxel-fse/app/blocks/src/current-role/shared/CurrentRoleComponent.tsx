/**
 * Current Role Block - Shared Component
 *
 * Renders the Current Role UI, used by both editor and frontend.
 * Matches Voxel's current-role widget HTML structure 1:1.
 *
 * Evidence:
 * - Voxel template: themes/voxel/templates/widgets/current-role.php
 * - CSS classes: ts-panel, active-plan, role-panel, ac-head, ac-body, ac-bottom
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import type {
	CurrentRoleAttributes,
	CurrentRoleApiResponse,
	CurrentRoleComponentProps,
	CurrentRoleVxConfig,
	SwitchableRoleData,
} from '../types';

/**
 * Render icon markup based on IconValue
 */
function renderIcon(icon: { library: string; value: string }): JSX.Element | null {
	if (!icon || !icon.value) {
		return null;
	}

	if (icon.library === 'svg') {
		// SVG URL
		return <img src={icon.value} alt="" className="voxel-icon-svg" />;
	}

	if (icon.library === 'icon') {
		// Icon font class (e.g., "las la-user")
		return <i className={icon.value} aria-hidden="true" />;
	}

	return null;
}

/**
 * Default user icon SVG (matches Voxel's user.svg)
 */
function DefaultUserIcon(): JSX.Element {
	return (
		<svg
			fill="currentColor"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			width="24"
			height="24"
		>
			<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
		</svg>
	);
}

/**
 * Default switch icon SVG (matches Voxel's switch.svg)
 */
function DefaultSwitchIcon(): JSX.Element {
	return (
		<svg
			fill="currentColor"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			width="24"
			height="24"
		>
			<path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z" />
		</svg>
	);
}

export default function CurrentRoleComponent({
	attributes,
	roleData,
	isLoading,
	error,
	context,
}: CurrentRoleComponentProps): JSX.Element {
	// Build vxconfig for re-rendering (required for Plan C+)
	const vxConfig: CurrentRoleVxConfig = {
		roleIcon: attributes.roleIcon ?? { library: '', value: '' },
		switchIcon: attributes.switchIcon ?? { library: '', value: '' },
	};

	// Render role icon
	const roleIconElement =
		renderIcon(attributes.roleIcon) ?? <DefaultUserIcon />;

	// Render switch icon
	const switchIconElement =
		renderIcon(attributes.switchIcon) ?? <DefaultSwitchIcon />;

	// Loading state
	if (isLoading) {
		return (
			<>
				{/* Re-render vxconfig for DevTools visibility */}
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
				/>
				<div className="ts-panel active-plan role-panel">
					<div className="ac-head">
						{roleIconElement}
						<b>{__('User role', 'voxel-fse')}</b>
					</div>
					<div className="ac-body">
						<p>{__('Loading...', 'voxel-fse')}</p>
					</div>
				</div>
			</>
		);
	}

	// Error state
	if (error) {
		return (
			<>
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
				/>
				<div className="ts-panel active-plan role-panel">
					<div className="ac-head">
						{roleIconElement}
						<b>{__('User role', 'voxel-fse')}</b>
					</div>
					<div className="ac-body">
						<p>{error}</p>
					</div>
				</div>
			</>
		);
	}

	// Not logged in state
	if (!roleData?.isLoggedIn) {
		return (
			<>
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
				/>
				<div className="ts-panel active-plan role-panel">
					<div className="ac-head">
						{roleIconElement}
						<b>{__('User role', 'voxel-fse')}</b>
					</div>
					<div className="ac-body">
						<p>{__('Please log in to view your role.', 'voxel-fse')}</p>
					</div>
				</div>
			</>
		);
	}

	// Determine role display message
	const hasRoles = roleData.currentRoles && roleData.currentRoles.length > 0;
	const rolesMessage = hasRoles
		? roleData.rolesLabel
		: __('You do not have a role assigned currently.', 'voxel-fse');

	// Render switchable roles
	const renderSwitchableRoles = (): JSX.Element | null => {
		if (
			!roleData.canSwitch ||
			!roleData.switchableRoles ||
			roleData.switchableRoles.length === 0
		) {
			return null;
		}

		return (
			<div className="ac-bottom">
				<ul className="simplify-ul current-plan-btn">
					{roleData.switchableRoles.map((role: SwitchableRoleData) => (
						<li key={role.key}>
							<a
								{...(context === 'frontend' ? { 'vx-action': '' } : {})}
								className="ts-btn ts-btn-1"
								href={role.switchUrl}
								onClick={
									context === 'editor'
										? (e: React.MouseEvent) => e.preventDefault()
										: undefined
								}
							>
								{switchIconElement}
								{__('Switch to ', 'voxel-fse')}
								{role.label}
							</a>
						</li>
					))}
				</ul>
			</div>
		);
	};

	return (
		<>
			{/* Re-render vxconfig for DevTools visibility */}
			<script
				type="text/json"
				className="vxconfig"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
			/>

			<div className="ts-panel active-plan role-panel">
				{/* Panel head - matches Voxel's .ac-head */}
				<div className="ac-head">
					{roleIconElement}
					<b>{__('User role', 'voxel-fse')}</b>
				</div>

				{/* Panel body - matches Voxel's .ac-body */}
				<div className="ac-body">
					<p>{rolesMessage}</p>

					{/* Switchable roles buttons */}
					{renderSwitchableRoles()}
				</div>
			</div>
		</>
	);
}
