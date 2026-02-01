/**
 * NoPermissionScreen Component
 *
 * Displays when user lacks permission to create/edit posts.
 * Implements 1:1 parity with Voxel's no-permission.php template.
 *
 * Evidence: themes/voxel/templates/widgets/create-post/no-permission.php:6-10
 *
 * @package VoxelFSE
 */

import type { PostContext } from '../types';

interface NoPermissionScreenProps {
	context: PostContext;
}

/**
 * NoPermissionScreen
 *
 * Renders the no-permission screen matching Voxel's structure:
 * - ts-form wrapper
 * - ts-no-posts container
 * - Icon + message
 *
 * Evidence: themes/voxel/templates/widgets/create-post/no-permission.php
 */
export function NoPermissionScreen({ context }: NoPermissionScreenProps) {
	return (
		<div className="ts-form ts-create-post">
			<div className="ts-no-posts">
				{/* Icon - matches Voxel's no-permission template */}
				<span className="ts-icon-wrapper">
					<svg
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 52 52"
						width="40"
						height="40"
					>
						<path
							d="M26 5.85c11.13 0 20.15 9.02 20.15 20.15S37.13 46.15 26 46.15 5.85 37.13 5.85 26 14.87 5.85 26 5.85zM26 2C12.75 2 2 12.75 2 26s10.75 24 24 24 24-10.75 24-24S39.25 2 26 2z"
							fill="currentColor"
						/>
						<path
							d="M26 17a2 2 0 00-2 2v10a2 2 0 104 0V19a2 2 0 00-2-2zm0 16a2 2 0 100 4 2 2 0 000-4z"
							fill="currentColor"
						/>
					</svg>
				</span>
				{/* Message - from context.noPermission.title */}
				<p>{context.noPermission.title}</p>
			</div>
		</div>
	);
}
