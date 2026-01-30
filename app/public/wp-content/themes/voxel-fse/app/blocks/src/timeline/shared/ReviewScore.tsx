/**
 * ReviewScore Component
 *
 * Rating input component for review statuses.
 * Matches Voxel's Review_Score component from timeline-composer.beautified.js lines 259-287
 *
 * Voxel behavior:
 * - Displays rating categories with clickable levels
 * - Each category has multiple levels (e.g., -2, -1, 0, 1, 2 for 5-star)
 * - Clicking a level toggles it (same level = deselect, different = select)
 * - Levels up to and including selected are highlighted (covered)
 *
 * Template: #vxfeed__review-score
 *
 * @package VoxelFSE
 */

import { useState, useCallback, useEffect } from 'react';
import type { ReviewConfig, ReviewLevel } from '../types';

/**
 * Props
 */
interface ReviewScoreProps {
	config: ReviewConfig;
	value: Record<string, number>;
	onChange: (rating: Record<string, number>) => void;
	className?: string;
}

/**
 * ReviewScore Component
 * Matches Voxel's review-score component structure
 */
export function ReviewScore({
	config,
	value,
	onChange,
	className = '',
}: ReviewScoreProps): JSX.Element {
	const [rating, setRating] = useState<Record<string, number>>(value);

	// Sync with parent value changes
	useEffect(() => {
		setRating(value);
	}, [value]);

	/**
	 * Set score for a category
	 * Matches Voxel's setScore method (line 267-268)
	 * - If same score clicked, delete (deselect)
	 * - Otherwise, set the new score
	 */
	const setScore = useCallback((categoryKey: string, levelScore: number) => {
		setRating((prev) => {
			const newRating = { ...prev };
			if (prev[categoryKey] === levelScore) {
				// Clicking same score = deselect
				delete newRating[categoryKey];
			} else {
				// Set new score
				newRating[categoryKey] = levelScore;
			}
			onChange(newRating);
			return newRating;
		});
	}, [onChange]);

	/**
	 * Check if a specific score is selected for a category
	 * Matches Voxel's isScoreSelected method (line 270-272)
	 */
	const isScoreSelected = useCallback((categoryKey: string, levelScore: number): boolean => {
		return rating[categoryKey] === levelScore;
	}, [rating]);

	/**
	 * Check if a score level is covered (at or below selected)
	 * Matches Voxel's isScoreCovered method (line 273-276)
	 * Used for highlighting filled stars/bars
	 */
	const isScoreCovered = useCallback((categoryKey: string, levelScore: number): boolean => {
		const selectedScore = rating[categoryKey];
		return typeof selectedScore === 'number' && selectedScore >= levelScore;
	}, [rating]);

	/**
	 * Get the active level for a category (for label display)
	 * Matches Voxel's getActiveScore method (line 277-280)
	 */
	const getActiveLevel = useCallback((categoryKey: string): ReviewLevel | null => {
		const selectedScore = rating[categoryKey];
		// Valid scores are typically -2, -1, 0, 1, 2 (index 0-4 in rating_levels)
		if (typeof selectedScore !== 'number') return null;
		// Map score to index: -2=0, -1=1, 0=2, 1=3, 2=4
		const index = selectedScore + 2;
		if (index >= 0 && index < config.rating_levels.length) {
			return config.rating_levels[index];
		}
		return null;
	}, [rating, config.rating_levels]);

	// Get categories from config
	const categories = config.categories || [];

	return (
		<div className={`rev-score-input ${className}`}>
			{categories.map((category) => {
				const activeLevel = getActiveLevel(category.key);

				return (
					<div
						key={category.key}
						className="rev-category"
						style={activeLevel ? { '--ts-accent-1': activeLevel.color } as React.CSSProperties : undefined}
					>
						{/* Category label */}
						<div className="rev-category-label">
							<span>{category.label}</span>
							{activeLevel && (
								<span className="rev-active-label">{activeLevel.label}</span>
							)}
						</div>

						{/* Rating input based on mode */}
						{config.input_mode === 'stars' ? (
							<ul className="rev-star-input flexify simplify-ul">
								{config.rating_levels.map((level, index) => {
									// Score is typically index - 2 (so 0=-2, 1=-1, 2=0, 3=1, 4=2)
									const score = index - 2;
									const isCovered = isScoreCovered(category.key, score);
									const isSelected = isScoreSelected(category.key, score);

									return (
										<li
											key={level.score}
											className={`${isCovered ? 'active' : ''} ${isSelected ? 'selected' : ''}`}
											onClick={() => setScore(category.key, score)}
										>
											<span
												dangerouslySetInnerHTML={{
													__html: isCovered
														? (config.active_icon ?? config.default_icon ?? '')
														: (config.default_icon ?? '')
												}}
											/>
										</li>
									);
								})}
							</ul>
						) : (
							<ul className="rev-num-input flexify simplify-ul">
								{config.rating_levels.map((level, index) => {
									const score = index - 2;
									const isSelected = isScoreSelected(category.key, score);

									return (
										<li
											key={level.score}
											className={isSelected ? 'active' : ''}
											onClick={() => setScore(category.key, score)}
											style={isSelected ? { '--ts-accent-1': level.color } as React.CSSProperties : undefined}
										>
											<span>{level.label}</span>
										</li>
									);
								})}
							</ul>
						)}
					</div>
				);
			})}
		</div>
	);
}

export default ReviewScore;
