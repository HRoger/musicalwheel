/**
 * Timeline Kit Block - TypeScript Interfaces
 *
 * @package VoxelFSE
 */

export interface DimensionsConfig {
	top?: number;
	right?: number;
	bottom?: number;
	left?: number;
	unit?: string;
	isLinked?: boolean;
}

export interface Attributes {
	blockId: string;

	// Accordion state
	styleTabOpenPanel?: string;
	buttonsState?: string;

	// General accordion
	vxfText1?: string;
	vxfText2?: string;
	vxfText3?: string;
	vxfBg?: string;
	vxfBorder?: string;
	vxfDetail?: string;
	vxfShadow?: any; // BoxShadowConfig
	xlRadius?: number;
	xlRadius_tablet?: number;
	xlRadius_mobile?: number;
	lgRadius?: number;
	lgRadius_tablet?: number;
	lgRadius_mobile?: number;
	mdRadius?: number;
	mdRadius_tablet?: number;
	mdRadius_mobile?: number;

	// Icons accordion
	mainIconSize?: number;
	mainIconSize_tablet?: number;
	mainIconSize_mobile?: number;
	replyIconSize?: number;
	replyIconSize_tablet?: number;
	replyIconSize_mobile?: number;
	vxfAction1?: string;
	vxfAction2?: string;
	vxfAction3?: string;
	vxfAction4?: string;
	vxfAction5?: string;

	// Post reviews accordion
	revMinWidth?: number;
	revMinWidth_tablet?: number;
	revMinWidth_mobile?: number;

	// Buttons accordion - General
	tsPopupBtnTypo?: any; // TypographyConfig
	tsPopupBtnRadius?: number;
	tsPopupBtnRadius_tablet?: number;
	tsPopupBtnRadius_mobile?: number;
	tsPopupBtnRadiusUnit?: string;

	// Buttons accordion - Primary button (Normal)
	tsPopupButton1?: string;
	tsPopupButton1C?: string;
	tsPopupButton1Icon?: string;
	tsPopupButton1BorderType?: string;
	tsPopupButton1BorderWidth?: DimensionsConfig;
	tsPopupButton1BorderColor?: string;

	// Buttons accordion - Primary button (Hover)
	tsPopupButton1H?: string;
	tsPopupButton1CH?: string;
	tsPopupButton1IconH?: string;
	tsPopupButton1BH?: string;

	// Buttons accordion - Accent button (Normal)
	tsPopupButton2?: string;
	tsPopupButton2C?: string;
	tsPopupButton2Icon?: string;
	tsPopupButton2BorderType?: string;
	tsPopupButton2BorderWidth?: DimensionsConfig;
	tsPopupButton2BorderColor?: string;

	// Buttons accordion - Accent button (Hover)
	tsPopupButton2H?: string;
	tsPopupButton2CH?: string;
	tsPopupButton2IconH?: string;
	tsPopupButton2BH?: string;

	// Buttons accordion - Tertiary button (Normal)
	tsPopuptertiary2?: string;
	tsPopupTertiary2C?: string;
	tsPopupButton3Icon?: string;

	// Buttons accordion - Tertiary button (Hover)
	tsPopupTertiary2H?: string;
	tsPopupTertiary2CH?: string;
	tsPopupTertiaryIconH?: string;

	// Loading spinner accordion
	tmColor1?: string;
	tmColor2?: string;

	// Voxel Tab attributes
	visibilityBehavior?: 'show' | 'hide';
	visibilityRules?: any[];
	loopEnabled?: boolean;
	loopSource?: string;
	loopProperty?: string;
	loopLimit?: string;
	loopOffset?: string;

	// Index signature for dynamic access
	[key: string]: any;
}

export interface EditProps {
	attributes: Attributes;
	setAttributes: (attrs: Partial<Attributes>) => void;
	clientId: string;
}
