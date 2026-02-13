/**
 * Current Role Block - Save Function (Plan C+)
 *
 * Saves static HTML with vxconfig data for frontend hydration.
 * This eliminates the need for render.php (server-side PHP rendering).
 *
 * Evidence:
 * - Voxel widget template: themes/voxel/templates/widgets/current-role.php
 * - Plan C+ pattern: docs/conversions/voxel-widget-conversion-master-guide.md
 *
 * @package VoxelFSE
 */

import { useBlockProps } from '@wordpress/block-editor';
import type { CurrentRoleAttributes, CurrentRoleVxConfig } from './types';
import {
	generateAdvancedStyles,
	generateAdvancedResponsiveCSS,
	combineBlockClasses,
} from '../../shared/utils/generateAdvancedStyles';
import { generateCurrentRoleResponsiveCSS } from './styles';

interface SaveProps {
	attributes: CurrentRoleAttributes;
}

function createSaveFn(includePlaceholder: boolean) {
	return function save({ attributes }: SaveProps) {
		const blockId = attributes.blockId || 'block';
		const uniqueSelector = `.voxel-fse-current-role-${blockId}`;

		// Generate advanced styles
		const advancedStyles = generateAdvancedStyles(attributes);

		// Generate responsive CSS (block-specific + advanced)
		const blockCSS = generateCurrentRoleResponsiveCSS(attributes, blockId);
		const advancedCSS = generateAdvancedResponsiveCSS(attributes, uniqueSelector);
		const responsiveCSS = `${blockCSS}\n${advancedCSS}`;

		// Build class list matching Voxel's current-role pattern
		const blockProps = useBlockProps.save({
			className: combineBlockClasses(
				`voxel-fse-current-role voxel-fse-current-role-${blockId}`,
				attributes
			),
			style: advancedStyles,
		});

		// Build vxconfig JSON (matching Voxel pattern)
		// Contains all configuration needed by frontend.tsx
		const vxConfig: CurrentRoleVxConfig = {
			roleIcon: attributes.roleIcon ?? { library: '', value: '' },
			switchIcon: attributes.switchIcon ?? { library: '', value: '' },
		};

		return (
			<div {...blockProps}>
				{/* Responsive CSS */}
				{responsiveCSS && (
					<style dangerouslySetInnerHTML={{ __html: responsiveCSS }} />
				)}
				{/* Voxel vxconfig pattern - configuration stored in JSON script */}
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
				/>
				{/* Placeholder for React hydration - will be replaced by CurrentRoleComponent */}
				{includePlaceholder && (
					<div
						className="voxel-fse-block-placeholder"
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							backgroundColor: '#e0e0e0',
							padding: '16px',
							minHeight: '48px',
						}}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							width="24"
							height="24"
							fill="currentColor"
							style={{ opacity: 0.4 }}
						>
							<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
						</svg>
					</div>
				)}
			</div>
		);
	};
}

export default createSaveFn(false);
export const saveWithPlaceholder = createSaveFn(true);
