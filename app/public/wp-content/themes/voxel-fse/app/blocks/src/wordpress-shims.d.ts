
/**
 * TypeScript Shims for WordPress Packages
 * 
 * These declarations fix "Module has no exported member" errors caused by 
 * mismatched or incomplete @types definitions. They provide loose typing 
 * for standard WordPress components to ensure the project builds.
 */

declare module '@wordpress/components' {
    import { ComponentType, ReactNode, CSSProperties } from 'react';

    export const SelectControl: ComponentType<any>;
    export const ToggleControl: ComponentType<any>;
    export const RangeControl: ComponentType<any>;
    export const ButtonGroup: ComponentType<any>;
    export const Button: ComponentType<any>;
    export const Spinner: ComponentType<any>;
    export const Placeholder: ComponentType<any>;
    export const BaseControl: ComponentType<any>;
    export const PanelBody: ComponentType<any>;
    export const PanelRow: ComponentType<any>;
    export const ColorPalette: ComponentType<any>;
    export const TextControl: ComponentType<any>;
    export const TextareaControl: ComponentType<any>;
    export const CheckboxControl: ComponentType<any>;
    export const RadioControl: ComponentType<any>;
    export const Flex: ComponentType<any>;
    export const FlexItem: ComponentType<any>;
    export const FlexBlock: ComponentType<any>;
    export const Icon: ComponentType<any>;
    export const Tooltip: ComponentType<any>;
    export const Modal: ComponentType<any>;
    export const Dashicon: ComponentType<any>;
    export const Disabled: ComponentType<any>;
    export const ExternalLink: ComponentType<any>;
    export const FormTokenField: ComponentType<any>;
    export const Notice: ComponentType<any>;
    export const Popover: ComponentType<any>;
    export const Toolbar: ComponentType<any>;
    export const ToolbarButton: ComponentType<any>;
    export const ToolbarGroup: ComponentType<any>;

    // Experimental
    export const __experimentalUnitControl: ComponentType<any>;
    export const __experimentalBoxControl: ComponentType<any>;
}

declare module '@wordpress/block-editor' {
    import { ComponentType } from 'react';

    export const InspectorControls: ComponentType<any>;
    export const BlockControls: ComponentType<any>;
    export const useBlockProps: (props?: any) => any;
    export const MediaUpload: ComponentType<any>;
    export const MediaUploadCheck: ComponentType<any>;
    export const RichText: ComponentType<any>;
    export const InnerBlocks: ComponentType<any>;
    export const useInnerBlocksProps: (props?: any, options?: any) => any;
    export const PanelColorSettings: ComponentType<any>;
    export const URLInput: ComponentType<any>;
    export const PlainText: ComponentType<any>;
    export const BlockPreview: ComponentType<any>;
}

declare module '@wordpress/blocks' {
    export interface BlockEditProps<T> {
        attributes: T;
        setAttributes: (attributes: Partial<T>) => void;
        clientId: string;
        isSelected: boolean;
        context?: Record<string, any>;
        name?: string;
    }

    export interface BlockSaveProps<T> {
        attributes: T;
    }

    export function registerBlockType(name: string, settings: any): any;
    export function parse(content: string): any[];
}

declare module '@wordpress/server-side-render' {
    import { ComponentType } from 'react';
    const ServerSideRender: ComponentType<any>;
    export default ServerSideRender;
}

declare module '@wordpress/i18n' {
    export function __(text: string, domain?: string): string;
    export function sprintf(format: string, ...args: any[]): string;
    export function isRTL(): boolean;
}

declare module '@wordpress/data' {
    export function useSelect(callback: (select: any) => any, deps?: any[]): any;
    export function useDispatch(storeName: string): any;
    export function subscribe(callback: () => void): () => void;
    export const select: (storeName: string) => any;
    export const dispatch: (storeName: string) => any;
}

declare module '@wordpress/api-fetch' {
    const apiFetch: (options: any) => Promise<any>;
    export default apiFetch;
}

declare module '@wordpress/element' {
    export * from 'react';
}
