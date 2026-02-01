/**
 * Messages Block - Style Tab Inspector Controls
 *
 * Extracted from edit.tsx for maintainability.
 * Maps directly to Voxel's messages-widget.php Style tab sections.
 *
 * NOTE: Some type mismatches exist due to dynamic attribute generation.
 * @ts-nocheck
 *
 * @package VoxelFSE
 */

// @ts-nocheck
import { __ } from '@wordpress/i18n';
import { ToggleControl } from '@wordpress/components';
import {
	ResponsiveRangeControl,
	ColorControl,
	DimensionsControl,
	BorderGroupControl,
	BoxShadowPopup,
	TypographyControl,
	BackgroundControl,
	StateTabPanel,
	AccordionPanelGroup,
	AccordionPanel,
	SectionHeading,
	DynamicTagTextControl,
} from '@shared/controls';
import type { MessagesAttributes } from '../types';

interface StyleTabProps {
	attributes: MessagesAttributes;
	setAttributes: (attrs: Partial<MessagesAttributes>) => void;
}

export default function StyleTab({
	attributes,
	setAttributes,
}: StyleTabProps): JSX.Element {
	return (
		<AccordionPanelGroup
			attributes={attributes as Record<string, any>}
			setAttributes={setAttributes as (attrs: Record<string, any>) => void}
			stateAttribute="styleTabOpenPanel"
			defaultPanel="general"
		>
			{/* 1. General */}
			<AccordionPanel id="general" title={__('General', 'voxel-fse')}>
				<ResponsiveRangeControl
					label={__('Height', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="generalHeight"
					min={200}
					max={1200}
					step={1}
					units={['px', '%', 'vh']}
				/>

				<ToggleControl
					label={__('Calculate height?', 'voxel-fse')}
					checked={attributes.enableCalcHeight || false}
					onChange={(value) => setAttributes({ enableCalcHeight: value })}
				/>

				{attributes.enableCalcHeight && (
					<DynamicTagTextControl
						label={__('Calculation', 'voxel-fse')}
						help={__('Use CSS calc() to calculate height e.g calc(100vh - 215px)', 'voxel-fse')}
						attributes={attributes as Record<string, any>}
						setAttributes={setAttributes as (attrs: Record<string, any>) => void}
						attributeName="calcHeight"
					/>
				)}

				<ColorControl
					label={__('Background color', 'voxel-fse')}
					value={attributes.generalBackground}
					onChange={(value) => setAttributes({ generalBackground: value })}
				/>

				<BorderGroupControl
					label={__('Border', 'voxel-fse')}
					value={{
						borderType: attributes.generalBorderType,
						borderWidth: attributes.generalBorderWidth,
						borderColor: attributes.generalBorderColor,
					}}
					onChange={(value) =>
						setAttributes({
							generalBorderType: value.borderType,
							generalBorderWidth: value.borderWidth,
							generalBorderColor: value.borderColor,
						})
					}
					hideRadius={true}
				/>

				<ResponsiveRangeControl
					label={__('Border radius', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="generalBorderRadius"
					min={0}
					max={100}
					step={1}
					units={['px', '%']}
				/>

				<BoxShadowPopup
					label={__('Box Shadow', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					shadowAttributeName="generalBoxShadow"
				/>

				<ResponsiveRangeControl
					label={__('Sidebar width', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="sidebarWidth"
					min={200}
					max={1200}
					step={1}
					units={['px']}
				/>

				<ColorControl
					label={__('Separator color', 'voxel-fse')}
					value={attributes.separatorColor}
					onChange={(value) => setAttributes({ separatorColor: value })}
				/>

				<ColorControl
					label={__('Scrollbar color', 'voxel-fse')}
					value={attributes.scrollbarColor}
					onChange={(value) => setAttributes({ scrollbarColor: value })}
				/>
			</AccordionPanel>

			{/* 2. Inbox: Message */}
			<AccordionPanel id="inbox-message" title={__('Inbox: Message', 'voxel-fse')}>
				<StateTabPanel
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'hover', title: __('Hover', 'voxel-fse') },
						{ name: 'active', title: __('Active', 'voxel-fse') },
						{ name: 'unread', title: __('Unread', 'voxel-fse') },
						{ name: 'new', title: __('New', 'voxel-fse') },
					]}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeName="inboxMessageActiveTab"
				>
					{(tab) =>
						tab.name === 'normal' ? (
							<>
								<SectionHeading label={__('General', 'voxel-fse')} />
								<DimensionsControl
					label={__('Padding', 'voxel-fse')}
									values={attributes.inboxMessagePadding || {}}
									onChange={(values) => setAttributes({ inboxMessagePadding: values })}
								/>

								<SectionHeading label={__('Content', 'voxel-fse')} />
								<ResponsiveRangeControl
									label={__('Content gap', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={setAttributes as (attrs: Record<string, any>) => void}
									attributeBaseName="inboxMessageContentGap"
									min={0}
									max={100}
									step={1}
									units={['px']}
								/>

								<ColorControl
									label={__('Title color', 'voxel-fse')}
									value={attributes.inboxMessageTitleColor}
									onChange={(value) => setAttributes({ inboxMessageTitleColor: value })}
								/>

								<TypographyControl
									label={__('Title typography', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={setAttributes as (attrs: Record<string, any>) => void}
									attributeBaseName="inboxMessageTitleTypography"
								/>

								<ColorControl
									label={__('Subtitle color', 'voxel-fse')}
									value={attributes.inboxMessageSubtitleColor}
									onChange={(value) => setAttributes({ inboxMessageSubtitleColor: value })}
								/>

								<TypographyControl
									label={__('Subtitle typography', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={setAttributes as (attrs: Record<string, any>) => void}
									attributeBaseName="inboxMessageSubtitleTypography"
								/>

								<SectionHeading label={__('Avatar / Logo', 'voxel-fse')} />
								<ResponsiveRangeControl
									label={__('Size', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={setAttributes as (attrs: Record<string, any>) => void}
									attributeBaseName="inboxMessageAvatarSize"
									min={20}
									max={40}
									step={1}
									units={['px']}
								/>

								<ResponsiveRangeControl
									label={__('Gap against content', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={setAttributes as (attrs: Record<string, any>) => void}
									attributeBaseName="inboxMessageAvatarGap"
									min={0}
									max={100}
									step={1}
									units={['px']}
								/>

								<SectionHeading label={__('Secondary logo', 'voxel-fse')} />
								<ResponsiveRangeControl
									label={__('Size', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={setAttributes as (attrs: Record<string, any>) => void}
									attributeBaseName="inboxMessageSecondaryLogoSize"
									min={20}
									max={40}
									step={1}
									units={['px']}
								/>

								<BorderGroupControl
									label={__('Border', 'voxel-fse')}
									value={attributes.inboxMessageSecondaryLogoBorder || {}}
									onChange={(value) =>
										setAttributes({ inboxMessageSecondaryLogoBorder: value })
									}
									hideRadius={true}
								/>
							</>
						) : tab.name === 'hover' ? (
							<>
								<ColorControl
									label={__('Background', 'voxel-fse')}
									value={attributes.inboxMessageHoverBg}
									onChange={(value) => setAttributes({ inboxMessageHoverBg: value })}
								/>

								<ColorControl
									label={__('Title color', 'voxel-fse')}
									value={attributes.inboxMessageHoverTitleColor}
									onChange={(value) => setAttributes({ inboxMessageHoverTitleColor: value })}
								/>

								<ColorControl
									label={__('Subtitle color', 'voxel-fse')}
									value={attributes.inboxMessageHoverSubtitleColor}
									onChange={(value) =>
										setAttributes({ inboxMessageHoverSubtitleColor: value })
									}
								/>
							</>
						) : tab.name === 'active' ? (
							<>
								<ColorControl
									label={__('Background', 'voxel-fse')}
									value={attributes.inboxMessageActiveBg}
									onChange={(value) => setAttributes({ inboxMessageActiveBg: value })}
								/>

								<ResponsiveRangeControl
									label={__('Border width', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={setAttributes as (attrs: Record<string, any>) => void}
									attributeBaseName="inboxMessageActiveBorderWidth"
									min={0}
									max={40}
									step={1}
									units={['px']}
								/>

								<ColorControl
									label={__('Border color', 'voxel-fse')}
									value={attributes.inboxMessageActiveBorderColor}
									onChange={(value) =>
										setAttributes({ inboxMessageActiveBorderColor: value })
									}
								/>

								<ColorControl
									label={__('Title color', 'voxel-fse')}
									value={attributes.inboxMessageActiveTitleColor}
									onChange={(value) =>
										setAttributes({ inboxMessageActiveTitleColor: value })
									}
								/>

								<ColorControl
									label={__('Subtitle color', 'voxel-fse')}
									value={attributes.inboxMessageActiveSubtitleColor}
									onChange={(value) =>
										setAttributes({ inboxMessageActiveSubtitleColor: value })
									}
								/>
							</>
						) : tab.name === 'unread' ? (
							<>
								<TypographyControl
									label={__('Title typography', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={setAttributes as (attrs: Record<string, any>) => void}
									attributeBaseName="inboxMessageUnreadTitleTypography"
								/>
							</>
						) : (
							<>
								<BorderGroupControl
									label={__('Avatar border', 'voxel-fse')}
									value={attributes.inboxMessageNewAvatarBorder || {}}
									onChange={(value) =>
										setAttributes({ inboxMessageNewAvatarBorder: value })
									}
									hideRadius={true}
								/>
							</>
						)
					}
				</StateTabPanel>
			</AccordionPanel>

			{/* 3. Inbox: Search */}
			<AccordionPanel id="inbox-search" title={__('Inbox: Search', 'voxel-fse')}>
				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="inboxSearchTypography"
				/>

				<ColorControl
					label={__('Value color', 'voxel-fse')}
					value={attributes.inboxSearchValueColor}
					onChange={(value) => setAttributes({ inboxSearchValueColor: value })}
				/>

				<ColorControl
					label={__('Input placeholder color', 'voxel-fse')}
					value={attributes.inboxSearchPlaceholderColor}
					onChange={(value) => setAttributes({ inboxSearchPlaceholderColor: value })}
				/>

				<ColorControl
					label={__('Icon color', 'voxel-fse')}
					value={attributes.inboxSearchIconColor}
					onChange={(value) => setAttributes({ inboxSearchIconColor: value })}
				/>

				<ResponsiveRangeControl
					label={__('Icon size', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="inboxSearchIconSize"
					min={0}
					max={40}
					step={1}
					units={['px']}
				/>
			</AccordionPanel>

			{/* 4. Conversation: Top */}
			<AccordionPanel id="conversation-top" title={__('Conversation: Top', 'voxel-fse')}>
				<ResponsiveRangeControl
					label={__('Avatar radius', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="conversationTopAvatarRadius"
					min={0}
					max={100}
					step={1}
					units={['px']}
				/>

				<ResponsiveRangeControl
					label={__('Avatar / Text gap', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="conversationTopAvatarGap"
					min={0}
					max={100}
					step={1}
					units={['px']}
				/>

				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="conversationTopTypography"
				/>

				<ColorControl
					label={__('Text color', 'voxel-fse')}
					value={attributes.conversationTopTextColor}
					onChange={(value) => setAttributes({ conversationTopTextColor: value })}
				/>
			</AccordionPanel>

			{/* 5. Conversation: Intro */}
			<AccordionPanel id="conversation-intro" title={__('Conversation: Intro', 'voxel-fse')}>
				<ResponsiveRangeControl
					label={__('Content gap', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="conversationIntroContentGap"
					min={0}
					max={100}
					step={1}
					units={['px']}
				/>

				<ResponsiveRangeControl
					label={__('Avatar size', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="conversationIntroAvatarSize"
					min={20}
					max={40}
					step={1}
					units={['px']}
				/>

				<ResponsiveRangeControl
					label={__('Avatar border radius', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="conversationIntroAvatarRadius"
					min={0}
					max={100}
					step={1}
					units={['px', '%']}
				/>

				<TypographyControl
					label={__('Name typography', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="conversationIntroNameTypography"
				/>

				<ColorControl
					label={__('Name color', 'voxel-fse')}
					value={attributes.conversationIntroNameColor}
					onChange={(value) => setAttributes({ conversationIntroNameColor: value })}
				/>

				<TypographyControl
					label={__('Subtitle typography', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="conversationIntroSubtitleTypography"
				/>

				<ColorControl
					label={__('Subtitle color', 'voxel-fse')}
					value={attributes.conversationIntroSubtitleColor}
					onChange={(value) => setAttributes({ conversationIntroSubtitleColor: value })}
				/>
			</AccordionPanel>

			{/* 6. Conversation: Body */}
			<AccordionPanel id="conversation-body" title={__('Conversation: Body', 'voxel-fse')}>
				<ResponsiveRangeControl
					label={__('Message gap', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="conversationBodyMessageGap"
					min={0}
					max={100}
					step={1}
					units={['px']}
				/>

				<SectionHeading label={__('Single message', 'voxel-fse')} />
				<DimensionsControl
					label={__('Padding', 'voxel-fse')}
					values={attributes.conversationBodyMessagePadding || {}}
					onChange={(values) => setAttributes({ conversationBodyMessagePadding: values })}
				/>

				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="conversationBodyMessageTypography"
				/>

				<ResponsiveRangeControl
					label={__('Border radius', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="conversationBodyMessageRadius"
					min={0}
					max={100}
					step={1}
					units={['px', '%']}
				/>

				<SectionHeading label={__('Responder 1', 'voxel-fse')} />
				<BackgroundControl
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					showHoverState={false}
				/>

				<ColorControl
					label={__('Color', 'voxel-fse')}
					value={attributes.responder1Color}
					onChange={(value) => setAttributes({ responder1Color: value })}
				/>

				<SectionHeading label={__('Responder 2', 'voxel-fse')} />
				<BackgroundControl
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					showHoverState={false}
				/>

				<ColorControl
					label={__('Color', 'voxel-fse')}
					value={attributes.responder2Color}
					onChange={(value) => setAttributes({ responder2Color: value })}
				/>

				<SectionHeading label={__('Error', 'voxel-fse')} />
				<BackgroundControl
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					showHoverState={false}
				/>

				<ColorControl
					label={__('Color', 'voxel-fse')}
					value={attributes.errorColor}
					onChange={(value) => setAttributes({ errorColor: value })}
				/>

				<SectionHeading label={__('Message info', 'voxel-fse')} />
				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="messageInfoTypography"
				/>

				<ColorControl
					label={__('Default Color', 'voxel-fse')}
					value={attributes.messageInfoDefaultColor}
					onChange={(value) => setAttributes({ messageInfoDefaultColor: value })}
				/>

				<ColorControl
					label={__('Delete color', 'voxel-fse')}
					value={attributes.messageInfoDeleteColor}
					onChange={(value) => setAttributes({ messageInfoDeleteColor: value })}
				/>

				<SectionHeading label={__('Seen', 'voxel-fse')} />
				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="seenTypography"
				/>

				<ColorControl
					label={__('Color', 'voxel-fse')}
					value={attributes.seenColor}
					onChange={(value) => setAttributes({ seenColor: value })}
				/>

				<SectionHeading label={__('Images', 'voxel-fse')} />
				<ResponsiveRangeControl
					label={__('Border radius', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="imagesRadius"
					min={0}
					max={100}
					step={1}
					units={['px', '%']}
				/>
			</AccordionPanel>

			{/* 7. Conversation: Compose */}
			<AccordionPanel id="conversation-compose" title={__('Conversation: Compose', 'voxel-fse')}>
				<ResponsiveRangeControl
					label={__('Avatar radius', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="composeAvatarRadius"
					min={0}
					max={100}
					step={1}
					units={['px']}
				/>

				<SectionHeading label={__('Placeholder', 'voxel-fse')} />
				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="composePlaceholderTypography"
				/>

				<ColorControl
					label={__('Color', 'voxel-fse')}
					value={attributes.composePlaceholderColor}
					onChange={(value) => setAttributes({ composePlaceholderColor: value })}
				/>

				<SectionHeading label={__('Value', 'voxel-fse')} />
				<TypographyControl
					label={__('Typography', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="composeValueTypography"
				/>

				<ColorControl
					label={__('Color', 'voxel-fse')}
					value={attributes.composeValueColor}
					onChange={(value) => setAttributes({ composeValueColor: value })}
				/>
			</AccordionPanel>

			{/* 8. Icon button */}
			<AccordionPanel id="icon-button" title={__('Icon button', 'voxel-fse')}>
				<StateTabPanel
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'hover', title: __('Hover', 'voxel-fse') },
					]}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeName="iconButtonActiveTab"
				>
					{(tab) =>
						tab.name === 'normal' ? (
							<>
								<SectionHeading label={__('Button styling', 'voxel-fse')} />
								<ColorControl
									label={__('Button icon color', 'voxel-fse')}
									value={attributes.iconButtonColor}
									onChange={(value) => setAttributes({ iconButtonColor: value })}
								/>

								<ColorControl
									label={__('Button background', 'voxel-fse')}
									value={attributes.iconButtonBackground}
									onChange={(value) => setAttributes({ iconButtonBackground: value })}
								/>

								<BorderGroupControl
									label={__('Button border', 'voxel-fse')}
									value={{
										borderType: attributes.iconButtonBorderType,
										borderWidth: attributes.iconButtonBorderWidth,
										borderColor: attributes.iconButtonBorderColor,
									}}
									onChange={(value) =>
										setAttributes({
											iconButtonBorderType: value.borderType,
											iconButtonBorderWidth: value.borderWidth,
											iconButtonBorderColor: value.borderColor,
										})
									}
									hideRadius={true}
								/>

								<ResponsiveRangeControl
									label={__('Button border radius', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={setAttributes as (attrs: Record<string, any>) => void}
									attributeBaseName="iconButtonRadius"
									min={0}
									max={100}
									step={1}
									units={['px', '%']}
								/>
							</>
						) : (
							<>
								<ColorControl
									label={__('Button icon color', 'voxel-fse')}
									value={attributes.iconButtonHoverColor}
									onChange={(value) => setAttributes({ iconButtonHoverColor: value })}
								/>

								<ColorControl
									label={__('Button background color', 'voxel-fse')}
									value={attributes.iconButtonHoverBackground}
									onChange={(value) => setAttributes({ iconButtonHoverBackground: value })}
								/>

								<ColorControl
									label={__('Button border color', 'voxel-fse')}
									value={attributes.iconButtonHoverBorderColor}
									onChange={(value) =>
										setAttributes({ iconButtonHoverBorderColor: value })
									}
								/>
							</>
						)
					}
				</StateTabPanel>
			</AccordionPanel>

			{/* 9. Tertiary button */}
			<AccordionPanel id="tertiary-button" title={__('Tertiary button', 'voxel-fse')}>
				<StateTabPanel
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'hover', title: __('Hover', 'voxel-fse') },
					]}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeName="tertiaryButtonActiveTab"
				>
					{(tab) =>
						tab.name === 'normal' ? (
							<>
								<ColorControl
									label={__('Button icon color', 'voxel-fse')}
									value={attributes.tertiaryButtonIconColor}
									onChange={(value) => setAttributes({ tertiaryButtonIconColor: value })}
								/>

								<ResponsiveRangeControl
									label={__('Button icon size', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={setAttributes as (attrs: Record<string, any>) => void}
									attributeBaseName="tertiaryButtonIconSize"
									min={0}
									max={100}
									step={1}
									units={['px']}
								/>

								<ColorControl
									label={__('Button background', 'voxel-fse')}
									value={attributes.tertiaryButtonBackground}
									onChange={(value) => setAttributes({ tertiaryButtonBackground: value })}
								/>

								<BorderGroupControl
									label={__('Button border', 'voxel-fse')}
									value={{
										borderType: attributes.tertiaryButtonBorderType,
										borderWidth: attributes.tertiaryButtonBorderWidth,
										borderColor: attributes.tertiaryButtonBorderColor,
									}}
									onChange={(value) =>
										setAttributes({
											tertiaryButtonBorderType: value.borderType,
											tertiaryButtonBorderWidth: value.borderWidth,
											tertiaryButtonBorderColor: value.borderColor,
										})
									}
									hideRadius={true}
								/>

								<ResponsiveRangeControl
									label={__('Button border radius', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={setAttributes as (attrs: Record<string, any>) => void}
									attributeBaseName="tertiaryButtonRadius"
									min={0}
									max={100}
									step={1}
									units={['px', '%']}
								/>

								<TypographyControl
									label={__('Typography', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={setAttributes as (attrs: Record<string, any>) => void}
									attributeBaseName="tertiaryButtonTypography"
								/>

								<ColorControl
									label={__('Text color', 'voxel-fse')}
									value={attributes.tertiaryButtonTextColor}
									onChange={(value) => setAttributes({ tertiaryButtonTextColor: value })}
								/>
							</>
						) : (
							<>
								<ColorControl
									label={__('Button icon color', 'voxel-fse')}
									value={attributes.tertiaryButtonHoverIconColor}
									onChange={(value) =>
										setAttributes({ tertiaryButtonHoverIconColor: value })
									}
								/>

								<ColorControl
									label={__('Button background', 'voxel-fse')}
									value={attributes.tertiaryButtonHoverBackground}
									onChange={(value) =>
										setAttributes({ tertiaryButtonHoverBackground: value })
									}
								/>

								<ColorControl
									label={__('Border color', 'voxel-fse')}
									value={attributes.tertiaryButtonHoverBorderColor}
									onChange={(value) =>
										setAttributes({ tertiaryButtonHoverBorderColor: value })
									}
								/>

								<ColorControl
									label={__('Text color', 'voxel-fse')}
									value={attributes.tertiaryButtonHoverTextColor}
									onChange={(value) =>
										setAttributes({ tertiaryButtonHoverTextColor: value })
									}
								/>
							</>
						)
					}
				</StateTabPanel>
			</AccordionPanel>

			{/* 10. No messages / No chat selected */}
			<AccordionPanel
				id="no-messages"
				title={__('No messages / No chat selected', 'voxel-fse')}
			>
				<ResponsiveRangeControl
					label={__('Icon size', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="emptyIconSize"
					min={20}
					max={50}
					step={1}
					units={['px']}
				/>

				<ColorControl
					label={__('Icon color', 'voxel-fse')}
					value={attributes.emptyIconColor}
					onChange={(value) => setAttributes({ emptyIconColor: value })}
				/>

				<ColorControl
					label={__('Title color', 'voxel-fse')}
					value={attributes.emptyTitleColor}
					onChange={(value) => setAttributes({ emptyTitleColor: value })}
				/>

				<TypographyControl
					label={__('Title typography', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="emptyTitleTypography"
				/>
			</AccordionPanel>

			{/* 11. Loading */}
			<AccordionPanel id="loading" title={__('Loading', 'voxel-fse')}>
				<SectionHeading label={__('Loading', 'voxel-fse')} />
				<ColorControl
					label={__('Color 1', 'voxel-fse')}
					value={attributes.loadingColor1}
					onChange={(value) => setAttributes({ loadingColor1: value })}
				/>

				<ColorControl
					label={__('Color 2', 'voxel-fse')}
					value={attributes.loadingColor2}
					onChange={(value) => setAttributes({ loadingColor2: value })}
				/>
			</AccordionPanel>
		</AccordionPanelGroup>
	);
}
