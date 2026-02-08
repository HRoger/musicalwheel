import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';

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
 * Search icon matching Voxel's icon-search (exact match from original)
 */
const SearchIcon = () => (
	<svg width="80" height="80" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M11.25 2.75C6.14154 2.75 2 6.89029 2 11.998C2 17.1056 6.14154 21.2459 11.25 21.2459C13.5335 21.2459 15.6238 20.4187 17.2373 19.0475L20.7182 22.5287C21.011 22.8216 21.4859 22.8217 21.7788 22.5288C22.0717 22.2359 22.0718 21.761 21.7789 21.4681L18.2983 17.9872C19.6714 16.3736 20.5 14.2826 20.5 11.998C20.5 6.89029 16.3585 2.75 11.25 2.75ZM3.5 11.998C3.5 7.71905 6.96962 4.25 11.25 4.25C15.5304 4.25 19 7.71905 19 11.998C19 16.2769 15.5304 19.7459 11.25 19.7459C6.96962 19.7459 3.5 16.2769 3.5 11.998Z"
			fill="#343C54"
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
	/** Target element for positioning */
	target?: HTMLElement | null;
	/** Element whose width the popup should match (typically the composer wrapper) */
	widthElement?: HTMLElement | null;
	/** Reference to the composer for positioning */
	composer?: { uniqueId: string };
}

/**
 * EmojiPicker Component
 */
export function EmojiPicker({
	isOpen,
	onClose,
	onSelect,
	target,
	widthElement,
}: EmojiPickerProps): JSX.Element | null {
	const [searchTerm, setSearchTerm] = useState('');
	const [recents, setRecents] = useState<string[]>([]);
	const searchInputRef = useRef<HTMLInputElement>(null);
	const popupRef = useRef<HTMLDivElement>(null);
	const popupBoxRef = useRef<HTMLDivElement>(null);
	const [styles, setStyles] = useState<React.CSSProperties>({});

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

	/**
	 * Position popup
	 */
	const reposition = useCallback(() => {
		if (!popupRef.current || !popupBoxRef.current || !target) {
			return;
		}

		const triggerRect = target.getBoundingClientRect();
		const triggerOffset = {
			left: triggerRect.left + window.scrollX,
			top: triggerRect.top + window.scrollY,
		};

		// Use widthElement if provided, otherwise fall back to target
		const widthRef = widthElement || target;
		const widthRect = widthRef.getBoundingClientRect();
		const popupWidth = widthRect.width;
		const widthOffset = {
			left: widthRect.left + window.scrollX,
		};

		// Position horizontally based on widthElement's position (left edge)
		const leftPosition = widthOffset.left;

		// Position vertically below the trigger element
		let topPosition = triggerOffset.top + triggerRect.height;
		const viewportHeight = window.innerHeight;
		const popupBoxRect = popupBoxRef.current.getBoundingClientRect();
		const popupHeight = popupBoxRect.height;
		const isBottomTruncated = triggerRect.bottom + popupHeight > viewportHeight;
		const isRoomAbove = triggerRect.top - popupHeight >= 0;

		if (isBottomTruncated && isRoomAbove) {
			topPosition = triggerOffset.top - popupHeight;
		}

		setStyles({
			position: 'absolute',
			top: `${topPosition}px`,
			left: `${leftPosition}px`,
			width: `${popupWidth}px`,
		});
	}, [target, widthElement]);

	// Reposition on scroll/resize/mount
	useEffect(() => {
		if (!isOpen) return;
		reposition();
		const handleScroll = () => reposition();
		const handleResize = () => reposition();
		window.addEventListener('scroll', handleScroll, true);
		window.addEventListener('resize', handleResize, true);
		return () => {
			window.removeEventListener('scroll', handleScroll, true);
			window.removeEventListener('resize', handleResize, true);
		};
	}, [isOpen, reposition]);

	useEffect(() => {
		if (isOpen) {
			// Initial reposition after render
			requestAnimationFrame(reposition);
		}
	}, [isOpen, reposition]);

	// Click outside to close
	useEffect(() => {
		if (!isOpen) return;
		const handleMouseDown = (e: MouseEvent) => {
			const clickTarget = e.target as HTMLElement;
			// Don't close if clicking inside the popup box
			if (popupBoxRef.current?.contains(clickTarget)) return;
			// Don't close if clicking on the trigger (if accessible)
			if (target && target.contains(clickTarget)) return;

			onClose();
		};
		document.addEventListener('mousedown', handleMouseDown);
		return () => document.removeEventListener('mousedown', handleMouseDown);
	}, [isOpen, target, onClose]);

	if (!isOpen || !target) return null;

	return createPortal(
		<div className="elementor vx-popup ts-emoji-popup">
			<div className="ts-popup-root elementor-element elementor-element-2168fda-wrap">
				<div ref={popupRef} className="ts-form elementor-element elementor-element-2168fda" style={styles}>
					<div className="ts-field-popup-container">
						<div
							ref={popupBoxRef}
							className="ts-field-popup triggers-blur"
						>
							<div className="ts-popup-content-wrapper min-scroll">
								{/* Search bar */}
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

								{/* Emoji list */}
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
							</div>
							<template></template>
						</div>
					</div>
				</div>
			</div>
		</div>,
		document.body
	);
}

export default EmojiPicker;
