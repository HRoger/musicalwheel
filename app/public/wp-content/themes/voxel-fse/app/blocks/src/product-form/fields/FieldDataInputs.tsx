/**
 * FieldDataInputs Component
 *
 * Renders data input fields for collecting additional information during checkout.
 * Supports 10 input types: text, textarea, number, select, multiselect,
 * email, phone, url, switcher, date.
 *
 * Evidence: Voxel PHP templates form-data-inputs/*.php
 *
 * @package VoxelFSE
 */

import { useCallback, useMemo } from 'react';
import type {
	DataInputsFieldConfig,
	DataInputConfig,
	DataInputValue,
	DataInputChoice,
} from '../types';

export interface FieldDataInputsProps {
	field: DataInputsFieldConfig;
	values: Record<string, DataInputValue>;
	onValueChange: ( key: string, value: DataInputValue ) => void;
	icons?: {
		minusIcon?: { library?: string; value?: string } | null;
		plusIcon?: { library?: string; value?: string } | null;
	};
}

/**
 * Render icon from IconValue
 */
function renderIcon( icon: { library?: string; value?: string } | undefined | null ): React.ReactNode {
	if ( ! icon?.value ) return null;

	if ( icon.library === 'line-awesome' || icon.value.startsWith( 'la-' ) ) {
		return <i className={ `las ${ icon.value }` } />;
	}

	return <i className={ `las ${ icon.value }` } />;
}

/**
 * Text Input Component
 * Evidence: text-data-input.php
 */
function DataInputText( {
	dataInput,
	value,
	onChange,
}: {
	dataInput: DataInputConfig;
	value: string;
	onChange: ( value: string ) => void;
} ) {
	return (
		<div className="ts-form-group">
			<label>{ dataInput.label }</label>
			<div className="input-container">
				<input
					type="text"
					className="ts-filter"
					value={ value || '' }
					onChange={ ( e ) => onChange( e.target.value ) }
					placeholder={ dataInput.props.placeholder }
					minLength={ dataInput.props.minlength }
					maxLength={ dataInput.props.maxlength }
				/>
			</div>
		</div>
	);
}

/**
 * Textarea Input Component
 * Evidence: textarea-data-input.php
 */
function DataInputTextarea( {
	dataInput,
	value,
	onChange,
}: {
	dataInput: DataInputConfig;
	value: string;
	onChange: ( value: string ) => void;
} ) {
	return (
		<div className="ts-form-group">
			<label>{ dataInput.label }</label>
			<div className="input-container">
				<textarea
					className="ts-filter min-scroll"
					value={ value || '' }
					onChange={ ( e ) => onChange( e.target.value ) }
					placeholder={ dataInput.props.placeholder }
					minLength={ dataInput.props.minlength }
					maxLength={ dataInput.props.maxlength }
				/>
			</div>
		</div>
	);
}

/**
 * Email Input Component
 * Evidence: email-data-input.php
 */
function DataInputEmail( {
	dataInput,
	value,
	onChange,
}: {
	dataInput: DataInputConfig;
	value: string;
	onChange: ( value: string ) => void;
} ) {
	return (
		<div className="ts-form-group">
			<label>{ dataInput.label }</label>
			<div className="input-container">
				<input
					type="email"
					className="ts-filter"
					value={ value || '' }
					onChange={ ( e ) => onChange( e.target.value ) }
					placeholder={ dataInput.props.placeholder }
				/>
			</div>
		</div>
	);
}

/**
 * Phone Input Component
 * Evidence: phone-data-input.php (same structure as email)
 */
function DataInputPhone( {
	dataInput,
	value,
	onChange,
}: {
	dataInput: DataInputConfig;
	value: string;
	onChange: ( value: string ) => void;
} ) {
	return (
		<div className="ts-form-group">
			<label>{ dataInput.label }</label>
			<div className="input-container">
				<input
					type="tel"
					className="ts-filter"
					value={ value || '' }
					onChange={ ( e ) => onChange( e.target.value ) }
					placeholder={ dataInput.props.placeholder }
				/>
			</div>
		</div>
	);
}

/**
 * URL Input Component
 * Evidence: url-data-input.php (same structure as email)
 */
function DataInputUrl( {
	dataInput,
	value,
	onChange,
}: {
	dataInput: DataInputConfig;
	value: string;
	onChange: ( value: string ) => void;
} ) {
	return (
		<div className="ts-form-group">
			<label>{ dataInput.label }</label>
			<div className="input-container">
				<input
					type="url"
					className="ts-filter"
					value={ value || '' }
					onChange={ ( e ) => onChange( e.target.value ) }
					placeholder={ dataInput.props.placeholder }
				/>
			</div>
		</div>
	);
}

/**
 * Date Input Component
 * Evidence: date-data-input.php
 */
function DataInputDate( {
	dataInput,
	value,
	onChange,
}: {
	dataInput: DataInputConfig;
	value: string;
	onChange: ( value: string ) => void;
} ) {
	return (
		<div className="ts-form-group">
			<label>{ dataInput.label }</label>
			<div className="input-container">
				<input
					type="date"
					className="ts-filter"
					value={ value || '' }
					onChange={ ( e ) => onChange( e.target.value ) }
					placeholder={ dataInput.props.placeholder }
					style={ { display: 'block' } }
				/>
			</div>
		</div>
	);
}

/**
 * Switcher Input Component
 * Evidence: switcher-data-input.php
 */
function DataInputSwitcher( {
	dataInput,
	value,
	onChange,
}: {
	dataInput: DataInputConfig;
	value: boolean;
	onChange: ( value: boolean ) => void;
} ) {
	return (
		<div className="ts-form-group switcher-label">
			<label>
				<div className="switch-slider">
					<div className="onoffswitch">
						<input
							type="checkbox"
							className="onoffswitch-checkbox"
							checked={ value || false }
							onChange={ ( e ) => onChange( e.target.checked ) }
						/>
						<label
							className="onoffswitch-label"
							onClick={ ( e ) => {
								e.preventDefault();
								onChange( ! value );
							} }
						/>
					</div>
				</div>
				{ dataInput.label }
			</label>
		</div>
	);
}

/**
 * Number Input Component
 * Evidence: number-data-input.php
 */
function DataInputNumber( {
	dataInput,
	value,
	onChange,
	icons,
}: {
	dataInput: DataInputConfig;
	value: number | null;
	onChange: ( value: number | null ) => void;
	icons?: FieldDataInputsProps['icons'];
} ) {
	const { min = 0, max = 999999, step = 1, display_mode = 'default' } = dataInput.props;

	const validateValueInBounds = useCallback( ( val: number | null ): number | null => {
		if ( val === null ) return null;
		if ( val < min ) return min;
		if ( val > max ) return max;
		return val;
	}, [ min, max ] );

	const increment = useCallback( () => {
		const current = typeof value === 'number' ? value : min;
		const newVal = validateValueInBounds( current + step );
		onChange( newVal );
	}, [ value, min, step, validateValueInBounds, onChange ] );

	const decrement = useCallback( () => {
		const current = typeof value === 'number' ? value : min;
		const newVal = validateValueInBounds( current - step );
		onChange( newVal );
	}, [ value, min, step, validateValueInBounds, onChange ] );

	const handleInputChange = useCallback( ( e: React.ChangeEvent<HTMLInputElement> ) => {
		const val = e.target.value === '' ? null : parseInt( e.target.value, 10 );
		onChange( validateValueInBounds( val ) );
	}, [ validateValueInBounds, onChange ] );

	// Stepper mode
	if ( display_mode === 'stepper' ) {
		return (
			<div className="ts-form-group">
				<label>{ dataInput.label }</label>
				<div className="ts-stepper-input flexify">
					<button
						className={ `ts-stepper-left ts-icon-btn${ ( value ?? 0 ) <= min ? ' vx-disabled' : '' }` }
						onClick={ ( e ) => {
							e.preventDefault();
							decrement();
						} }
						type="button"
					>
						{ renderIcon( icons?.minusIcon ) || <i className="las la-minus" /> }
					</button>
					<input
						type="number"
						className="ts-input-box"
						value={ value ?? '' }
						onChange={ handleInputChange }
						placeholder={ dataInput.props.placeholder }
						step={ step }
					/>
					<button
						className={ `ts-stepper-right ts-icon-btn${ ( value ?? 0 ) >= max ? ' vx-disabled' : '' }` }
						onClick={ ( e ) => {
							e.preventDefault();
							increment();
						} }
						type="button"
					>
						{ renderIcon( icons?.plusIcon ) || <i className="las la-plus" /> }
					</button>
				</div>
			</div>
		);
	}

	// Default mode
	return (
		<div className="ts-form-group">
			<label>{ dataInput.label }</label>
			<div className="input-container">
				<input
					type="number"
					className="ts-filter"
					value={ value ?? '' }
					onChange={ handleInputChange }
					placeholder={ dataInput.props.placeholder }
					min={ min }
					max={ max }
					step={ step }
				/>
			</div>
		</div>
	);
}

/**
 * Select Input Component
 * Evidence: select-data-input.php
 */
function DataInputSelect( {
	dataInput,
	value,
	onChange,
}: {
	dataInput: DataInputConfig;
	value: string | null;
	onChange: ( value: string | null ) => void;
} ) {
	const { display_mode = 'default', choices = {}, placeholder, l10n } = dataInput.props;
	const choicesList = useMemo( () => Object.values( choices ), [ choices ] );

	const isChecked = useCallback( ( choice: DataInputChoice ) => {
		return value === choice.value;
	}, [ value ] );

	const toggleChoice = useCallback( ( choice: DataInputChoice ) => {
		if ( value === choice.value ) {
			onChange( null );
		} else {
			onChange( choice.value );
		}
	}, [ value, onChange ] );

	// Buttons mode
	if ( display_mode === 'buttons' ) {
		return (
			<div className="ts-form-group">
				<label>{ dataInput.label }</label>
				<ul className="simplify-ul addon-buttons flexify">
					{ choicesList.map( ( choice ) => (
						<li
							key={ choice.value }
							className={ `flexify${ isChecked( choice ) ? ' adb-selected' : '' }` }
							onClick={ ( e ) => {
								e.preventDefault();
								toggleChoice( choice );
							} }
						>
							{ choice.label }
						</li>
					) ) }
				</ul>
			</div>
		);
	}

	// Radio mode
	if ( display_mode === 'radio' ) {
		return (
			<div className="ts-form-group inline-terms-wrapper ts-inline-filter">
				<label>{ dataInput.label }</label>
				<ul className="simplify-ul ts-addition-list flexify">
					{ choicesList.map( ( choice ) => (
						<li
							key={ choice.value }
							className={ `flexify${ isChecked( choice ) ? ' ts-checked' : '' }` }
						>
							<div
								className="addition-body"
								onClick={ ( e ) => {
									e.preventDefault();
									toggleChoice( choice );
								} }
							>
								<label className="container-radio">
									<input
										type="radio"
										value={ choice.value }
										checked={ isChecked( choice ) }
										className="onoffswitch-checkbox"
										disabled
										hidden
										readOnly
									/>
									<span className="checkmark" />
								</label>
								<span>{ choice.label }</span>
							</div>
						</li>
					) ) }
				</ul>
			</div>
		);
	}

	// Default dropdown mode
	return (
		<div className="ts-form-group">
			<label>{ dataInput.label }</label>
			<div className="ts-filter">
				<select
					value={ value ?? '' }
					onChange={ ( e ) => onChange( e.target.value || null ) }
				>
					<option value="">
						{ placeholder || l10n?.default_placeholder || 'Select...' }
					</option>
					{ choicesList.map( ( choice ) => (
						<option key={ choice.value } value={ choice.value }>
							{ choice.label }
						</option>
					) ) }
				</select>
				<div className="ts-down-icon" />
			</div>
		</div>
	);
}

/**
 * Multiselect Input Component
 * Evidence: multiselect-data-input.php
 */
function DataInputMultiselect( {
	dataInput,
	value,
	onChange,
}: {
	dataInput: DataInputConfig;
	value: string[];
	onChange: ( value: string[] ) => void;
} ) {
	const { display_mode = 'default', choices = {} } = dataInput.props;
	const choicesList = useMemo( () => Object.values( choices ), [ choices ] );

	const isChecked = useCallback( ( choice: DataInputChoice ) => {
		return ( value || [] ).includes( choice.value );
	}, [ value ] );

	const toggleChoice = useCallback( ( choice: DataInputChoice ) => {
		const currentValue = value || [];
		if ( currentValue.includes( choice.value ) ) {
			onChange( currentValue.filter( ( v ) => v !== choice.value ) );
		} else {
			onChange( [ ...currentValue, choice.value ] );
		}
	}, [ value, onChange ] );

	// Buttons mode
	if ( display_mode === 'buttons' ) {
		return (
			<div className="ts-form-group">
				<label>{ dataInput.label }</label>
				<ul className="simplify-ul addon-buttons flexify">
					{ choicesList.map( ( choice ) => (
						<li
							key={ choice.value }
							className={ `flexify${ isChecked( choice ) ? ' adb-selected' : '' }` }
							onClick={ ( e ) => {
								e.preventDefault();
								toggleChoice( choice );
							} }
						>
							{ choice.label }
						</li>
					) ) }
				</ul>
			</div>
		);
	}

	// Default checkbox list mode
	return (
		<div className="ts-form-group ts-custom-additions">
			<label>{ dataInput.label }</label>
			<ul className="simplify-ul ts-addition-list flexify">
				{ choicesList.map( ( choice ) => (
					<li
						key={ choice.value }
						className={ `flexify${ isChecked( choice ) ? ' ts-checked' : '' }` }
					>
						<div
							className="addition-body"
							onClick={ ( e ) => {
								e.preventDefault();
								toggleChoice( choice );
							} }
						>
							<label className="container-checkbox">
								<input
									type="checkbox"
									checked={ isChecked( choice ) }
									className="onoffswitch-checkbox"
									disabled
									hidden
									readOnly
								/>
								<span className="checkmark" />
							</label>
							<span>{ choice.label }</span>
						</div>
					</li>
				) ) }
			</ul>
		</div>
	);
}

/**
 * FieldDataInputs - Main data inputs field component
 *
 * Renders all configured data inputs for a product.
 */
export default function FieldDataInputs( {
	field,
	values,
	onValueChange,
	icons,
}: FieldDataInputsProps ) {
	const dataInputs = useMemo( () => {
		return Object.values( field.props.data_inputs || {} );
	}, [ field.props.data_inputs ] );

	if ( ! dataInputs.length ) {
		return null;
	}

	return (
		<>
			{ dataInputs.map( ( dataInput ) => {
				const key = dataInput.key;
				const value = values[ key ];

				switch ( dataInput.type ) {
					case 'text':
						return (
							<DataInputText
								key={ key }
								dataInput={ dataInput }
								value={ value as string }
								onChange={ ( v ) => onValueChange( key, v ) }
							/>
						);

					case 'textarea':
						return (
							<DataInputTextarea
								key={ key }
								dataInput={ dataInput }
								value={ value as string }
								onChange={ ( v ) => onValueChange( key, v ) }
							/>
						);

					case 'email':
						return (
							<DataInputEmail
								key={ key }
								dataInput={ dataInput }
								value={ value as string }
								onChange={ ( v ) => onValueChange( key, v ) }
							/>
						);

					case 'phone':
						return (
							<DataInputPhone
								key={ key }
								dataInput={ dataInput }
								value={ value as string }
								onChange={ ( v ) => onValueChange( key, v ) }
							/>
						);

					case 'url':
						return (
							<DataInputUrl
								key={ key }
								dataInput={ dataInput }
								value={ value as string }
								onChange={ ( v ) => onValueChange( key, v ) }
							/>
						);

					case 'date':
						return (
							<DataInputDate
								key={ key }
								dataInput={ dataInput }
								value={ value as string }
								onChange={ ( v ) => onValueChange( key, v ) }
							/>
						);

					case 'switcher':
						return (
							<DataInputSwitcher
								key={ key }
								dataInput={ dataInput }
								value={ value as boolean }
								onChange={ ( v ) => onValueChange( key, v ) }
							/>
						);

					case 'number':
						return (
							<DataInputNumber
								key={ key }
								dataInput={ dataInput }
								value={ value as number | null }
								onChange={ ( v ) => onValueChange( key, v ) }
								icons={ icons }
							/>
						);

					case 'select':
						return (
							<DataInputSelect
								key={ key }
								dataInput={ dataInput }
								value={ value as string | null }
								onChange={ ( v ) => onValueChange( key, v ) }
							/>
						);

					case 'multiselect':
						return (
							<DataInputMultiselect
								key={ key }
								dataInput={ dataInput }
								value={ value as string[] }
								onChange={ ( v ) => onValueChange( key, v ) }
							/>
						);

					default:
						return null;
				}
			} ) }
		</>
	);
}
