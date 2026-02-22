/**
 * Timeslot Editor Component
 *
 * Two-mode editor for timeslots:
 * 1. Manual entry mode - add/remove individual slots
 * 2. Generator mode - auto-generate slots from time range
 *
 * EXACT Voxel HTML: themes/voxel/templates/widgets/create-post/product-field/booking/timeslots.php:70-147
 */
import React, { useState } from 'react';
import type { Timeslot, GeneratorConfig } from './types';
import { MAX_SLOTS_PER_GROUP } from './types';
import {
	generateTimeslots,
	createDefaultSlot,
	normalizeSlots,
	DEFAULT_GENERATOR_CONFIG,
} from './utils';
import { PLUS_ICON, COG_ICON, TRASH_CAN_ICON } from './icons';

interface TimeslotEditorProps {
	slots: Timeslot[];
	onSlotsChange: (slots: Timeslot[]) => void;
}

export const TimeslotEditor: React.FC<TimeslotEditorProps> = ({
	slots,
	onSlotsChange,
}) => {
	const [showGenerator, setShowGenerator] = useState(false);
	const [generator, setGenerator] = useState<GeneratorConfig>(DEFAULT_GENERATOR_CONFIG);

	/**
	 * Add a new manual slot
	 */
	const handleAddSlot = () => {
		if (slots.length >= MAX_SLOTS_PER_GROUP) return;
		const newSlot = createDefaultSlot();
		onSlotsChange([...slots, newSlot]);
	};

	/**
	 * Remove a slot by index
	 */
	const handleRemoveSlot = (index: number) => {
		const newSlots = slots.filter((_, i) => i !== index);
		onSlotsChange(newSlots);
	};

	/**
	 * Update slot from/to time
	 */
	const handleSlotChange = (index: number, field: 'from' | 'to', value: string) => {
		const newSlots = [...slots];
		newSlots[index] = { ...newSlots[index], [field]: value };
		onSlotsChange(newSlots);
	};

	/**
	 * Generate slots from generator config
	 */
	const handleGenerate = () => {
		const generatedSlots = generateTimeslots(generator);
		const mergedSlots = normalizeSlots([...slots, ...generatedSlots]);
		onSlotsChange(mergedSlots.slice(0, MAX_SLOTS_PER_GROUP));
		setShowGenerator(false);
	};

	/**
	 * Cancel generator and return to manual mode
	 */
	const handleCancelGenerator = () => {
		setShowGenerator(false);
		setGenerator(DEFAULT_GENERATOR_CONFIG);
	};

	const canAddSlots = slots.length < MAX_SLOTS_PER_GROUP;

	// ========================================
	// GENERATOR MODE
	// Evidence: timeslots.php lines 92-147
	// ========================================
	if (showGenerator) {
		return (
			<div className="form-field-grid medium">
				{/* Header */}
				<div className="ts-form-group ui-heading-field">
					<label>Generate timeslots</label>
				</div>

				{/* Time Range */}
				{/* Evidence: timeslots.php lines 98-112 */}
				<div className="ts-form-group">
					<label>Time range</label>
					<div className="form-field-grid medium">
						<div className="ts-form-group vx-1-2">
							<input
								type="time"
								value={generator.from}
								onChange={(e) => setGenerator({ ...generator, from: e.target.value })}
								onFocus={(e) => {
									// Show native time picker on focus
									try {
										e.target.showPicker?.();
									} catch {}
								}}
								className="ts-filter"
							/>
						</div>
						<div className="ts-form-group vx-1-2">
							<input
								type="time"
								value={generator.to}
								onChange={(e) => setGenerator({ ...generator, to: e.target.value })}
								onFocus={(e) => {
									try {
										e.target.showPicker?.();
									} catch {}
								}}
								className="ts-filter"
							/>
						</div>
					</div>
				</div>

				{/* Slot Length */}
				{/* Evidence: timeslots.php lines 114-118 */}
				<div className="ts-form-group vx-1-2">
					<label>Slot length (Minutes)</label>
					<input
						type="number"
						value={generator.length}
						onChange={(e) => setGenerator({ ...generator, length: Math.max(5, parseInt(e.target.value) || 5) })}
						min={5}
						className="ts-filter"
					/>
				</div>

				{/* Gap Between Slots */}
				{/* Evidence: timeslots.php lines 120-124 */}
				<div className="ts-form-group vx-1-2">
					<label>Time between slots (Minutes)</label>
					<input
						type="number"
						value={generator.gap}
						onChange={(e) => setGenerator({ ...generator, gap: Math.max(0, parseInt(e.target.value) || 0) })}
						min={0}
						className="ts-filter"
					/>
				</div>

				{/* Action Buttons */}
				{/* Evidence: timeslots.php lines 126-145 */}
				<div className="ts-form-group vx-2-3">
					<a
						href="#"
						onClick={(e) => {
							e.preventDefault();
							handleGenerate();
						}}
						className="ts-repeater-add ts-btn ts-btn-2 form-btn"
					>
						Generate
					</a>
				</div>
				<div className="ts-form-group vx-1-3">
					<a
						href="#"
						onClick={(e) => {
							e.preventDefault();
							handleCancelGenerator();
						}}
						className="ts-btn ts-btn-1 form-btn"
					>
						Cancel
					</a>
				</div>
			</div>
		);
	}

	// ========================================
	// MANUAL ENTRY MODE
	// Evidence: timeslots.php lines 70-91
	// ========================================
	return (
		<div className="form-field-grid medium">
			{/* Header */}
			<div className="ts-form-group ui-heading-field">
				<label>Time slots</label>
			</div>

			{/* Slot List */}
			{/* Evidence: timeslots.php lines 72-89 */}
			{slots.map((slot, index) => (
				<React.Fragment key={index}>
					{/* From Time */}
					<div className="ts-form-group vx-1-3">
						<input
							type="time"
							value={slot.from}
							onChange={(e) => handleSlotChange(index, 'from', e.target.value)}
							onFocus={(e) => {
								try {
									e.target.showPicker?.();
								} catch {}
							}}
							className="ts-filter"
						/>
					</div>

					{/* To Time */}
					<div className="ts-form-group vx-1-3">
						<input
							type="time"
							value={slot.to}
							onChange={(e) => handleSlotChange(index, 'to', e.target.value)}
							onFocus={(e) => {
								try {
									e.target.showPicker?.();
								} catch {}
							}}
							className="ts-filter"
						/>
					</div>

					{/* Remove Button */}
					<div className="ts-form-group vx-1-3 vx-center-right">
						<a
							href="#"
							onClick={(e) => {
								e.preventDefault();
								handleRemoveSlot(index);
							}}
							className="ts-btn ts-btn-1 form-btn"
						>
							<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: TRASH_CAN_ICON }} />
							Remove
						</a>
					</div>
				</React.Fragment>
			))}

			{/* Create Timeslot Button */}
			{/* Evidence: timeslots.php lines 82-85 */}
			<div className={`ts-form-group vx-1-2${!canAddSlots ? ' vx-disabled' : ''}`}>
				<a
					href="#"
					onClick={(e) => {
						e.preventDefault();
						if (canAddSlots) handleAddSlot();
					}}
					className="ts-repeater-add ts-btn ts-btn-4 form-btn"
				>
					<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: PLUS_ICON }} />
					Create timeslot
				</a>
			</div>

			{/* Generate Timeslots Button */}
			{/* Evidence: timeslots.php lines 86-89 */}
			<div className="ts-form-group vx-1-2">
				<a
					href="#"
					onClick={(e) => {
						e.preventDefault();
						setShowGenerator(true);
					}}
					className="ts-repeater-add ts-btn ts-btn-4 form-btn"
				>
					<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: COG_ICON }} />
					Generate timeslots
				</a>
			</div>
		</div>
	);
};

export default TimeslotEditor;
