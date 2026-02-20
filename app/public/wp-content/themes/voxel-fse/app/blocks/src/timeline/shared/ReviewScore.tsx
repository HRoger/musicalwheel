/**
 * ReviewScore Component
 *
 * Rating input component for review statuses.
 * Matches Voxel's _review-score.php template EXACTLY for CSS compatibility.
 *
 * Voxel HTML Structure (from templates/widgets/timeline/status-composer/_review-score.php):
 * Stars mode:
 * <div class="vxf-create-section review-cats">
 *   <div class="ts-form-group review-category">
 *     <label>Category <span>Active Label</span></label>
 *     <ul class="rs-stars simplify-ul flexify">
 *       <li class="flexify [active] [selected]" style="--active-accent: color">
 *         <div class="ts-star-icon">svg</div>
 *         <div class="ray-holder"><div class="ray" x8></div>
 *       </li>
 *     </ul>
 *   </div>
 * </div>
 *
 * Numeric mode:
 * <div class="vxf-create-section review-cats">
 *   <div class="ts-form-group review-category">
 *     <label>Category</label>
 *     <ul class="rs-num simplify-ul flexify">
 *       <li [class="active"] style="--active-accent: color">
 *         {{ level.score + 3 }}
 *         <span>Label</span>
 *       </li>
 *     </ul>
 *   </div>
 * </div>
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
 * Matches Voxel's _review-score.php template structure exactly
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
	 * Matches Voxel's setScore method (timeline-composer.beautified.js line 267-268)
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
		<div className={`vxf-create-section review-cats ${className}`}>
			{categories.map((category) => {
				const activeLevel = getActiveLevel(category.key);

				return (
					<div key={category.key} className="ts-form-group review-category">
						{/* Category label - Voxel uses <label> not <div> */}
						<label>
							{category.label}
							{activeLevel && (
								<span>{activeLevel.label}</span>
							)}
						</label>

						{/* Rating input based on mode */}
						{config.input_mode === 'stars' ? (
							<ul className="rs-stars simplify-ul flexify">
								{config.rating_levels.map((level, index) => {
									// Score is typically index - 2 (so 0=-2, 1=-1, 2=0, 3=1, 4=2)
									const score = index - 2;
									const isCovered = isScoreCovered(category.key, score);
									const isSelected = isScoreSelected(category.key, score);

									return (
										<li
											key={level.score}
											className={`flexify ${isCovered ? 'active' : ''} ${isSelected ? 'selected' : ''}`}
											onClick={() => setScore(category.key, score)}
											style={{
												'--active-accent': isCovered && activeLevel ? activeLevel.color : undefined,
											} as React.CSSProperties}
										>
											{isCovered ? (
												<div
													className="ts-star-icon"
													dangerouslySetInnerHTML={{
														__html: config.active_icon ?? config.default_icon ?? '',
													}}
												/>
											) : (
												<div
													className="ts-star-icon"
													dangerouslySetInnerHTML={{
														__html: config.inactive_icon ?? config.default_icon ?? '',
													}}
												/>
											)}
											<div className="ray-holder">
												{[...Array(8)].map((_, i) => (
													<div key={i} className="ray" />
												))}
											</div>
										</li>
									);
								})}
							</ul>
						) : (
							<ul className="rs-num simplify-ul flexify">
								{config.rating_levels.map((level, index) => {
									const score = index - 2;
									const isSelected = isScoreSelected(category.key, score);

									return (
										<li
											key={level.score}
											className={isSelected ? 'active' : ''}
											onClick={() => setScore(category.key, score)}
											style={isSelected ? { '--active-accent': level.color } as React.CSSProperties : undefined}
										>
											{/* Voxel displays level.score + 3 */}
											{level.score + 3}
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
