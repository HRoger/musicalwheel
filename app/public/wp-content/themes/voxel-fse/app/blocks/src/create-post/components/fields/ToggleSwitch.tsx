/**
 * Toggle Switch Component - Reusable Voxel-style switch
 * 
 * Matches Voxel's onoffswitch HTML structure exactly.
 * Evidence: themes/voxel/templates/widgets/create-post/recurring-date-field.php:31-36
 * 
 * HTML Structure:
 * <div class="switch-slider">
 *   <div class="onoffswitch">
 *     <input type="checkbox" class="onoffswitch-checkbox" />
 *     <label class="onoffswitch-label"></label>
 *   </div>
 * </div>
 */
import React from 'react';

interface ToggleSwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    className?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
    checked,
    onChange,
    label,
    className = '',
}) => {
    return (
        <div className={`ts-form-group switcher-label ${className}`}>
            <label>
                <div className="switch-slider">
                    <div className="onoffswitch">
                        <input
                            type="checkbox"
                            className="onoffswitch-checkbox"
                            checked={checked}
                            onChange={(e) => onChange(e.target.checked)}
                        />
                        <label
                            className="onoffswitch-label"
                            onClick={(e) => {
                                e.preventDefault();
                                onChange(!checked);
                            }}
                        ></label>
                    </div>
                </div>
                {label && <span>{label}</span>}
            </label>
        </div>
    );
};

export default ToggleSwitch;
