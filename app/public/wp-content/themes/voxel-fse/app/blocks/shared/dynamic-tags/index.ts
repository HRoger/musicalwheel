/**
 * Dynamic Tags Module Index
 *
 * Exports all dynamic tag related components and utilities.
 * Core VoxelScript functionality for Gutenberg blocks.
 *
 * @package VoxelFSE
 */

// Main components
export { default as DynamicTagBuilder } from './DynamicTagBuilder';
export { DynamicTagPanel, default as DynamicTagPanelDefault } from './DynamicTagPanel';
export { withDynamicTags, default as withDynamicTagsDefault } from './withDynamicTags';

// Types
export type {
	DataGroup,
	TagExport,
	Modifier,
	ModifierArg,
	DynamicToken,
	AppliedModifier,
	DynamicTagBuilderProps,
} from './DynamicTagBuilder/types';
