export interface IconValue {
    library: 'icon' | 'svg' | 'dynamic' | 'fa-solid' | 'fa-regular' | 'fa-brands' | 'line-awesome' | '';
    value: string;
}

// Alias for backwards compatibility
export type IconConfig = IconValue;
