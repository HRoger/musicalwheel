/**
 * EmojiPicker Component
 *
 * 1:1 match with Voxel's emoji picker implementation.
 * Template: themes/voxel/templates/widgets/timeline/partials/_emoji-picker.php
 *
 * Uses FormPopup wrapper with ts-emoji-popup class (no footer).
 * Features:
 * - Search with ts-input-icon structure
 * - Recently used emojis (localStorage)
 * - Grouped by categories with labels
 *
 * @package VoxelFSE
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
// TODO: FormPopup component needs to be created or imported from popup-kit
// import { FormPopup } from '../../shared';
import { FormPopup } from '../../popup-kit/shared';

/**
 * Emoji item with searchable name
 */
interface EmojiItem {
	emoji: string;
	name: string;
}

/**
 * Emoji data grouped by category with searchable names
 * Matches Voxel's emoji list structure
 */
const EMOJI_GROUPS: Record<string, EmojiItem[]> = {
	smileys: [
		{ emoji: '😀', name: 'grinning face happy smile' },
		{ emoji: '😃', name: 'grinning face big eyes happy' },
		{ emoji: '😄', name: 'grinning face smiling eyes happy' },
		{ emoji: '😁', name: 'beaming face grin happy' },
		{ emoji: '😅', name: 'grinning face sweat nervous' },
		{ emoji: '😂', name: 'face tears joy laughing lol' },
		{ emoji: '🤣', name: 'rolling floor laughing rofl lol' },
		{ emoji: '😊', name: 'smiling face blush happy' },
		{ emoji: '😇', name: 'smiling face halo angel innocent' },
		{ emoji: '🙂', name: 'slightly smiling face' },
		{ emoji: '🙃', name: 'upside down face silly' },
		{ emoji: '😉', name: 'winking face wink' },
		{ emoji: '😌', name: 'relieved face peaceful' },
		{ emoji: '😍', name: 'heart eyes love smitten' },
		{ emoji: '🥰', name: 'smiling face hearts love' },
		{ emoji: '😘', name: 'face blowing kiss love' },
		{ emoji: '😋', name: 'face savoring food yummy delicious' },
		{ emoji: '😛', name: 'face tongue out playful' },
		{ emoji: '😜', name: 'winking face tongue playful crazy' },
		{ emoji: '🤪', name: 'zany face crazy wild silly' },
		{ emoji: '😎', name: 'face sunglasses cool' },
		{ emoji: '🤩', name: 'star struck excited amazing' },
		{ emoji: '🥳', name: 'partying face celebration party' },
		{ emoji: '😏', name: 'smirking face smirk' },
		{ emoji: '😒', name: 'unamused face annoyed' },
		{ emoji: '😔', name: 'pensive face sad thoughtful' },
		{ emoji: '😢', name: 'crying face sad tear' },
		{ emoji: '😭', name: 'loudly crying face sob' },
		{ emoji: '😱', name: 'face screaming fear shocked' },
		{ emoji: '😡', name: 'pouting face angry mad' },
		{ emoji: '🤔', name: 'thinking face hmm wonder' },
		{ emoji: '🤗', name: 'hugging face hug' },
		{ emoji: '🤫', name: 'shushing face quiet secret' },
		{ emoji: '🤭', name: 'face hand over mouth giggle oops' },
		{ emoji: '🤐', name: 'zipper mouth face quiet secret' },
		{ emoji: '🥱', name: 'yawning face tired sleepy bored' },
		{ emoji: '😴', name: 'sleeping face zzz sleep tired' },
	],
	people: [
		{ emoji: '👋', name: 'waving hand wave hello hi bye' },
		{ emoji: '🤚', name: 'raised back hand stop' },
		{ emoji: '✋', name: 'raised hand high five stop' },
		{ emoji: '🖐️', name: 'hand fingers splayed' },
		{ emoji: '👌', name: 'ok hand okay perfect' },
		{ emoji: '🤌', name: 'pinched fingers italian' },
		{ emoji: '✌️', name: 'victory hand peace' },
		{ emoji: '🤞', name: 'crossed fingers luck hope' },
		{ emoji: '🤟', name: 'love you gesture hand' },
		{ emoji: '🤘', name: 'sign horns rock metal' },
		{ emoji: '👍', name: 'thumbs up good like yes approve' },
		{ emoji: '👎', name: 'thumbs down bad dislike no' },
		{ emoji: '✊', name: 'raised fist power' },
		{ emoji: '👊', name: 'oncoming fist punch bump' },
		{ emoji: '🤝', name: 'handshake deal agree' },
		{ emoji: '👏', name: 'clapping hands applause bravo' },
		{ emoji: '🙌', name: 'raising hands celebration hooray' },
		{ emoji: '💪', name: 'flexed biceps strong muscle' },
		{ emoji: '🙏', name: 'folded hands pray please thanks' },
	],
	animals: [
		{ emoji: '🐱', name: 'cat face kitty meow' },
		{ emoji: '🐶', name: 'dog face puppy woof' },
		{ emoji: '🐭', name: 'mouse face rat' },
		{ emoji: '🐰', name: 'rabbit face bunny' },
		{ emoji: '🦊', name: 'fox face' },
		{ emoji: '🐻', name: 'bear face teddy' },
		{ emoji: '🐼', name: 'panda face' },
		{ emoji: '🐨', name: 'koala face' },
		{ emoji: '🐯', name: 'tiger face' },
		{ emoji: '🦁', name: 'lion face' },
		{ emoji: '🐮', name: 'cow face moo' },
		{ emoji: '🐷', name: 'pig face oink' },
		{ emoji: '🐸', name: 'frog face ribbit' },
		{ emoji: '🐵', name: 'monkey face' },
		{ emoji: '🐔', name: 'chicken face hen' },
		{ emoji: '🦄', name: 'unicorn face magic' },
		{ emoji: '🐝', name: 'honeybee bee buzz' },
		{ emoji: '🦋', name: 'butterfly insect' },
	],
	food: [
		{ emoji: '🍎', name: 'red apple fruit' },
		{ emoji: '🍕', name: 'pizza slice' },
		{ emoji: '🍔', name: 'hamburger burger' },
		{ emoji: '🍟', name: 'french fries' },
		{ emoji: '🌭', name: 'hot dog' },
		{ emoji: '🍿', name: 'popcorn movie snack' },
		{ emoji: '🍩', name: 'doughnut donut' },
		{ emoji: '🍪', name: 'cookie biscuit' },
		{ emoji: '🎂', name: 'birthday cake celebration' },
		{ emoji: '🍰', name: 'shortcake cake slice' },
		{ emoji: '☕', name: 'hot beverage coffee tea' },
		{ emoji: '🍺', name: 'beer mug drink' },
		{ emoji: '🍷', name: 'wine glass drink' },
		{ emoji: '🍸', name: 'cocktail glass martini drink' },
	],
	travel: [
		{ emoji: '✈️', name: 'airplane plane flight travel' },
		{ emoji: '🚗', name: 'automobile car vehicle' },
		{ emoji: '🚕', name: 'taxi cab car' },
		{ emoji: '🚌', name: 'bus vehicle' },
		{ emoji: '🚀', name: 'rocket space launch' },
		{ emoji: '🏠', name: 'house home building' },
		{ emoji: '🏢', name: 'office building' },
		{ emoji: '🌍', name: 'globe earth world planet' },
		{ emoji: '🗽', name: 'statue liberty new york' },
		{ emoji: '🗼', name: 'tokyo tower' },
		{ emoji: '🏰', name: 'castle palace' },
		{ emoji: '🏖️', name: 'beach umbrella vacation' },
		{ emoji: '⛰️', name: 'mountain nature' },
	],
	activities: [
		{ emoji: '⚽', name: 'soccer ball football sport' },
		{ emoji: '🏀', name: 'basketball sport' },
		{ emoji: '🏈', name: 'american football sport' },
		{ emoji: '⚾', name: 'baseball sport' },
		{ emoji: '🎾', name: 'tennis sport' },
		{ emoji: '🎮', name: 'video game controller gaming' },
		{ emoji: '🎯', name: 'bullseye target dart' },
		{ emoji: '🎸', name: 'guitar music instrument rock' },
		{ emoji: '🎤', name: 'microphone singing karaoke' },
		{ emoji: '🎬', name: 'clapper board movie film' },
		{ emoji: '🎨', name: 'artist palette painting art' },
		{ emoji: '🎭', name: 'performing arts theater drama' },
	],
	objects: [
		{ emoji: '💡', name: 'light bulb idea' },
		{ emoji: '📱', name: 'mobile phone smartphone' },
		{ emoji: '💻', name: 'laptop computer' },
		{ emoji: '📷', name: 'camera photo' },
		{ emoji: '📚', name: 'books reading study' },
		{ emoji: '📝', name: 'memo note write' },
		{ emoji: '✏️', name: 'pencil write draw' },
		{ emoji: '🔑', name: 'key unlock' },
		{ emoji: '💰', name: 'money bag cash' },
		{ emoji: '💎', name: 'gem stone diamond jewel' },
		{ emoji: '🎁', name: 'wrapped gift present' },
		{ emoji: '🔔', name: 'bell notification alert' },
	],
	symbols: [
		{ emoji: '❤️', name: 'red heart love' },
		{ emoji: '🧡', name: 'orange heart love' },
		{ emoji: '💛', name: 'yellow heart love' },
		{ emoji: '💚', name: 'green heart love' },
		{ emoji: '💙', name: 'blue heart love' },
		{ emoji: '💜', name: 'purple heart love' },
		{ emoji: '🖤', name: 'black heart love dark' },
		{ emoji: '💔', name: 'broken heart sad' },
		{ emoji: '✨', name: 'sparkles stars magic' },
		{ emoji: '⭐', name: 'star' },
		{ emoji: '🌟', name: 'glowing star shine' },
		{ emoji: '💯', name: 'hundred points perfect score' },
		{ emoji: '✅', name: 'check mark yes done complete' },
		{ emoji: '❌', name: 'cross mark no wrong' },
		{ emoji: '⚠️', name: 'warning sign alert caution' },
		{ emoji: '🔥', name: 'fire hot flame lit' },
		{ emoji: '💥', name: 'collision boom explosion' },
		{ emoji: '🎉', name: 'party popper celebration confetti' },
	],
	flags: [
		{ emoji: '🏳️', name: 'white flag surrender' },
		{ emoji: '🏴', name: 'black flag' },
		{ emoji: '🚩', name: 'triangular flag red flag' },
	],
};

/**
 * Category labels matching Voxel's l10n.emoji_groups
 */
const EMOJI_GROUP_LABELS: Record<string, string> = {
	smileys: 'Smileys & Emotion',
	people: 'People & Body',
	animals: 'Animals & Nature',
	food: 'Food & Drink',
	travel: 'Travel & Places',
	activities: 'Activities',
	objects: 'Objects',
	symbols: 'Symbols',
	flags: 'Flags',
};

/**
 * LocalStorage key for recently used emojis
 */
const RECENTS_STORAGE_KEY = 'vxfeed_emoji_recents';
const MAX_RECENTS = 20;

/**
 * Get recently used emojis from localStorage
 */
const getRecents = (): string[] => {
	try {
		const stored = localStorage.getItem(RECENTS_STORAGE_KEY);
		return stored ? JSON.parse(stored) : [];
	} catch {
		return [];
	}
};

/**
 * Save emoji to recents
 */
const saveToRecents = (emoji: string): void => {
	try {
		const recents = getRecents().filter((e) => e !== emoji);
		recents.unshift(emoji);
		localStorage.setItem(
			RECENTS_STORAGE_KEY,
			JSON.stringify(recents.slice(0, MAX_RECENTS))
		);
	} catch {
		// Ignore storage errors
	}
};

/**
 * Search icon matching Voxel's icon-search
 */
const SearchIcon = () => (
	<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			d="M12.5 11H11.71L11.43 10.73C12.41 9.59 13 8.11 13 6.5C13 2.91 10.09 0 6.5 0C2.91 0 0 2.91 0 6.5C0 10.09 2.91 13 6.5 13C8.11 13 9.59 12.41 10.73 11.43L11 11.71V12.5L16 17.49L17.49 16L12.5 11ZM6.5 11C4.01 11 2 8.99 2 6.5C2 4.01 4.01 2 6.5 2C8.99 2 11 4.01 11 6.5C11 8.99 8.99 11 6.5 11Z"
			fill="currentColor"
		/>
	</svg>
);

/**
 * Props
 */
interface EmojiPickerProps {
	/** Whether popup is open */
	isOpen: boolean;
	/** Called when popup closes (blur) */
	onClose: () => void;
	/** Called when emoji is selected */
	onSelect: (emoji: string) => void;
	/** Target element for positioning (Voxel uses composer.uniqueId) */
	target?: HTMLElement | null;
	/** Reference to the composer for positioning */
	composer?: { uniqueId: string };
}

/**
 * EmojiPicker Component
 *
 * 1:1 match with Voxel's _emoji-picker.php structure:
 * - FormPopup with ts-emoji-popup class
 * - Search with ts-sticky-top and ts-input-icon
 * - ts-emoji-list with ts-form-group sections
 * - Recently used section
 */
export function EmojiPicker({
	isOpen,
	onClose,
	onSelect,
	target,
}: EmojiPickerProps): JSX.Element | null {
	const [searchTerm, setSearchTerm] = useState('');
	const [recents, setRecents] = useState<string[]>([]);
	const searchInputRef = useRef<HTMLInputElement>(null);

	// Load recents on mount
	useEffect(() => {
		setRecents(getRecents());
	}, []);

	// Focus search input when popup opens
	useEffect(() => {
		if (isOpen && searchInputRef.current) {
			setTimeout(() => {
				searchInputRef.current?.focus();
			}, 100);
		}
	}, [isOpen]);

	// Reset search when popup closes
	useEffect(() => {
		if (!isOpen) {
			setSearchTerm('');
		}
	}, [isOpen]);

	/**
	 * Search results - flatten all emojis and filter by name
	 */
	const searchResults = useMemo(() => {
		if (!searchTerm.trim()) return [];
		const query = searchTerm.toLowerCase();
		const allEmojis = Object.values(EMOJI_GROUPS).flat();
		// Search by name keywords
		return allEmojis.filter((item) => item.name.toLowerCase().includes(query));
	}, [searchTerm]);

	/**
	 * Handle emoji selection
	 */
	const handleSelect = useCallback(
		(emoji: string) => {
			saveToRecents(emoji);
			setRecents(getRecents());
			onSelect(emoji);
			// Don't close - let the consumer decide
		},
		[onSelect]
	);

	if (!isOpen) return null;

	return (
		<FormPopup
			isOpen={isOpen}
			popupId="emoji-picker-popup"
			target={target}
			onClose={onClose}
			showHeader={false}
			showFooter={false}
			popupClass="ts-emoji-popup"
		>
			{/* Search bar - matches Voxel's ts-sticky-top structure */}
			<div className="ts-sticky-top uib b-bottom">
				<div className="ts-input-icon flexify">
					<SearchIcon />
					<input
						ref={searchInputRef}
						type="text"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						placeholder="Search emojis"
						className="autofocus"
					/>
				</div>
			</div>

			{/* Emoji list - matches Voxel's ts-emoji-list structure */}
			<div className="ts-emoji-list">
				{searchTerm.trim() ? (
					/* Search results */
					<div className="ts-form-group">
						<label>
							{searchResults.length > 0
								? 'Search results'
								: 'No emojis found'}
						</label>
						<ul className="flexify simplify-ul">
							{searchResults.map((item, index) => (
								<li key={`search-${index}`}>
									<span onClick={() => handleSelect(item.emoji)}>
										{item.emoji}
									</span>
								</li>
							))}
						</ul>
					</div>
				) : (
					/* Categories view */
					<>
						{/* Recently used */}
						{recents.length > 0 && (
							<div className="ts-form-group">
								<label>Recently used</label>
								<ul className="flexify simplify-ul">
									{recents.map((emoji, index) => (
										<li key={`recent-${index}`}>
											<span onClick={() => handleSelect(emoji)}>
												{emoji}
											</span>
										</li>
									))}
								</ul>
							</div>
						)}

						{/* Emoji groups */}
						{Object.entries(EMOJI_GROUPS).map(([groupKey, items]) => (
							<div key={groupKey} className="ts-form-group">
								<label className="hidden">
									{EMOJI_GROUP_LABELS[groupKey] || groupKey}
								</label>
								<ul className="flexify simplify-ul">
									{items.map((item, index) => (
										<li key={`${groupKey}-${index}`}>
											<span onClick={() => handleSelect(item.emoji)}>
												{item.emoji}
											</span>
										</li>
									))}
								</ul>
							</div>
						))}
					</>
				)}
			</div>
		</FormPopup>
	);
}

export default EmojiPicker;
