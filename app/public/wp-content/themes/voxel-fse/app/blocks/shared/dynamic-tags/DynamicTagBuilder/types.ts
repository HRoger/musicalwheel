/**
 * TypeScript type definitions for Dynamic Tag Builder
 *
 * @package MusicalWheel
 */

export interface DataGroup {
	type: string;
	label: string;
	exports: TagExport[];
	hasChildren?: boolean;  // Indicates if group has children that need to be lazy loaded
	isLoaded?: boolean;     // Indicates if children have been loaded
}

export interface TagExport {
	key: string;
	label: string;
	type: 'string' | 'number' | 'email' | 'url' | 'bool' | 'boolean' | 'date' | 'object' | 'object_list' | 'object-list' | 'method';
	description?: string;
	children?: TagExport[];
	hasChildren?: boolean;  // Indicates if this export has children that need to be lazy loaded
	isLoaded?: boolean;     // Indicates if children have been loaded
}

export interface Modifier {
	key: string;
	label: string;
	category: 'text' | 'number' | 'date' | 'control' | 'other';
	args?: ModifierArg[];
}

export interface ModifierArg {
	type: 'text' | 'number' | 'select';
	label: string;
	description?: string;
	options?: { label: string; value: string }[];
	default?: string | number;
}

export interface DynamicToken {
	type: 'tag' | 'text';
	raw: string;
	group?: string;
	property?: string;
	modifiers?: AppliedModifier[];
	start: number;
	end: number;
}

export interface AppliedModifier {
	key: string;
	args: (string | number)[];
}

export interface DynamicTagBuilderProps {
	value: string;
	onChange: (value: string) => void;
	label?: string;
	context?: string;
	onClose?: () => void;
	autoOpen?: boolean; // Auto-open modal without showing trigger button
}
