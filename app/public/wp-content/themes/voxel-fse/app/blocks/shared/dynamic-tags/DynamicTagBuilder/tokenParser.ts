/**
 * Token Parser Utility
 *
 * Parses dynamic tag expressions and extracts tokens with modifiers.
 * Based on Voxel's VoxelScript parser architecture.
 *
 * @package MusicalWheel
 */

import { DynamicToken, AppliedModifier } from './types';

/**
 * Parse a dynamic tag expression into tokens
 * Pattern: @group(property)|modifier(arg1,arg2)|modifier2()
 */
export function parseExpression(content: string): DynamicToken[] {
	const tokens: DynamicToken[] = [];

	// Regex to match @group(property)|modifier(args) pattern
	const tagRegex = /@(\w+)\(([^)]+)\)((?:\.\w+(?:\([^)]*\)))*)/g;
	let lastIndex = 0;
	let match;

	while ((match = tagRegex.exec(content)) !== null) {
		// Add plain text before the tag
		if (match.index > lastIndex) {
			tokens.push({
				type: 'text',
				raw: content.substring(lastIndex, match.index),
				start: lastIndex,
				end: match.index,
			});
		}

		// Parse the tag
		const group = match[1];
		const property = match[2];
		const modifiersStr = match[3] || '';
		const modifiers = parseModifiers(modifiersStr);

		tokens.push({
			type: 'tag',
			raw: match[0],
			group,
			property,
			modifiers,
			start: match.index,
			end: match.index + match[0].length,
		});

		lastIndex = match.index + match[0].length;
	}

	// Add remaining plain text
	if (lastIndex < content.length) {
		tokens.push({
			type: 'text',
			raw: content.substring(lastIndex),
			start: lastIndex,
			end: content.length,
		});
	}

	return tokens;
}

/**
 * Parse modifier chain from a tag
 * Pattern: .modifier(arg1,arg2).modifier2()
 */
function parseModifiers(modifiersStr: string): AppliedModifier[] {
	if (!modifiersStr) {
		return [];
	}

	const modifiers: AppliedModifier[] = [];

	// Regex to match .modifier(args) pattern
	const modifierRegex = /\.(\w+)(?:\(([^)]*)\))?/g;
	let match;

	while ((match = modifierRegex.exec(modifiersStr)) !== null) {
		const key = match[1];
		const argsStr = match[2] || '';
		const args = parseArguments(argsStr);

		modifiers.push({ key, args });
	}

	return modifiers;
}

/**
 * Parse arguments from a modifier
 * Pattern: arg1,arg2,arg3
 */
function parseArguments(argsStr: string): (string | number)[] {
	if (!argsStr.trim()) {
		return [];
	}

	return argsStr.split(',').map((arg) => {
		const trimmed = arg.trim();
		// Try to parse as number
		const num = parseFloat(trimmed);
		if (!isNaN(num) && trimmed === num.toString()) {
			return num;
		}
		// Remove quotes if present
		return trimmed.replace(/^['"]|['"]$/g, '');
	});
}

/**
 * Find the token at a specific cursor position
 */
export function findTokenAtPosition(tokens: DynamicToken[], position: number): DynamicToken | null {
	for (const token of tokens) {
		if (position >= token.start && position <= token.end) {
			return token;
		}
	}
	return null;
}

/**
 * Serialize a token back to string format
 */
export function serializeToken(token: DynamicToken): string {
	if (token.type === 'text') {
		return token.raw;
	}

	let result = `@${token.group}(${token.property})`;

	if (token.modifiers && token.modifiers.length > 0) {
		for (const modifier of token.modifiers) {
			result += `.${modifier.key}`;
			if (modifier.args.length > 0) {
				const argsStr = modifier.args.map(arg => {
					if (typeof arg === 'string') {
						return `'${arg}'`;
					}
					return arg.toString();
				}).join(',');
				result += `(${argsStr})`;
			} else {
				result += '()';
			}
		}
	}

	return result;
}

/**
 * Update a token in the content string
 */
export function updateTokenInContent(content: string, tokenIndex: number, newToken: DynamicToken): string {
	const tokens = parseExpression(content);

	if (tokenIndex < 0 || tokenIndex >= tokens.filter(t => t.type === 'tag').length) {
		return content;
	}

	const tagTokens = tokens.filter(t => t.type === 'tag');
	const oldToken = tagTokens[tokenIndex];
	const newTokenStr = serializeToken(newToken);

	return content.substring(0, oldToken.start) + newTokenStr + content.substring(oldToken.end);
}

/**
 * Get cursor position in textarea
 */
export function getCursorCoordinates(textarea: HTMLTextAreaElement, position: number): { top: number; left: number } {
	// Create a mirror div with same styles
	const div = document.createElement('div');
	const computed = window.getComputedStyle(textarea);
	const properties = [
		'font-family', 'font-size', 'font-weight', 'font-style',
		'letter-spacing', 'text-transform', 'word-spacing',
		'text-indent', 'white-space', 'line-height',
		'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
		'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
		'box-sizing', 'width', 'height'
	];

	properties.forEach(prop => {
		div.style[prop as any] = computed[prop as any];
	});

	div.style.position = 'absolute';
	div.style.visibility = 'hidden';
	div.style.whiteSpace = 'pre-wrap';
	div.style.wordWrap = 'break-word';
	div.style.overflow = 'hidden';

	document.body.appendChild(div);

	// Get text up to cursor position
	const textBeforeCursor = textarea.value.substring(0, position);
	div.textContent = textBeforeCursor;

	// Create a span for the cursor position
	const span = document.createElement('span');
	span.textContent = textarea.value.substring(position, position + 1) || '.';
	div.appendChild(span);

	// Get coordinates relative to textarea
	const textareaRect = textarea.getBoundingClientRect();
	const spanRect = span.getBoundingClientRect();

	const coordinates = {
		top: spanRect.top - textareaRect.top + textarea.scrollTop,
		left: spanRect.left - textareaRect.left + textarea.scrollLeft,
	};

	document.body.removeChild(div);

	return coordinates;
}
