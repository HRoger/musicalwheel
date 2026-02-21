# Block Issues Documentation

## 1. HEADER & FOOTER

### 1.1 HEADER

#### 1.1.1 DEFAULT HEADER

##### 1.1.1.1 FLEX-CONTAINER (VX)

###### Layout Tab

**Container Accordion**

- **Width does not work**: When the `e-con-inner.block-editor-block-list__layout` outer div does not change, the width is wrongly controlling the inner div `block-editor-block-list__block`
- **Min-Height**: When changing the height in one Flex-container block instance on the page it wrongly changes ALL flex-container blocks on the page. If you duplicate the parent Flex Container and duplicate the header and try to change the min-height you will see it changing ALL flex-container blocks on the page at the same time.

###### Style Tab

**Border Accordion**

- The BORDER TYPE inspector control is hardcoded instead of using our reusable Border Control Group from our shared library

###### Advanced Tab

**CSS ID**

- Add a `margin-top: 10px;` to the control, because it is glued to the Z-index control

##### 1.1.1.2 NAVBAR (VX)

###### Block

- Popup shows in the wrong position (too much to the left)
- When clicking a parent link that has no children instead of doing nothing, when clicking it navigates to the page linked

###### Inspector Controls

**Content Tab**

*SOURCE Accordion*

**CHOOSE SOURCE:**

1. **Select existing Menu**
   - When selecting a menu that doesn't exist it should show the EmptyPlaceholder component, instead it shows empty white space

2. **Add links manually**
   - In the repeater item Link: you should create a new link search inspector control for our shared library like Elementor does. Use select2 library and when I input something it starts searching showing a list of the page/post/post types in the dropdown. There is also a settings (cog) icon that opens other features: Open in new window, Add nofollow, and a Custom Attributes input field (key|value). Check Elementor counterpart control and copy it 1:1 parity

*SETTINGS Accordion*

- Justify Dropdown control doesn't work, it is not wired
- Hamburger Menu Control doesn't work, not wired
- Show label has no effect
- Icon Upload Control: the icon library doesn't load on the templates page

**Style Tab**

*NAVBAR: General Accordion*

- **Color Control**: Can't add custom color when clicking the `.components-color-palette__custom-color-button` (the top color background area on the color popup) it opens another popup where I supposed should select my custom color, but when I click this popup the parent color popup closes instead of keeping the 2 popups opened to allow the selection of a custom color
- **Margin and Padding Controls** are not wired, have no functionality
- **Border Radius, Item Content Gap, Icon color, Container size, Container Border Radius, Icon size, Icon color, Scroll background color, chevron color**: NOTHING WORKS, they are not wired

*POPUPS: Custom Style*

- Everything broken, nothing is wired at all

##### 1.1.1.3 USERBAR (VX)

###### Block

- When page loads the first time, the avatar doesn't show, it shows only if we click inside the userbar block
- The User Menu (the one with avatar) popup position is wrong: too much to the top instead of being under the avatar trigger and in the frontend it doesn't display at all
- All popups position are wrong on the backend Gutenberg editor
- When clicking an item that is also a link it should do nothing on the Gutenberg editor, but instead the link is working and leads to leaving the page. It should be deactivated on the Gutenberg editor!
- The popup should stay opened (backdrop not being affected by the sidebar controls) when editing using the sidebar inspector controls, but when clicking in the Gutenberg editor body the popups should disappear
- Labels for links and User Menu (avatar) are not showing

###### Inspector Controls

**Content Tab**

*USER AREA COMPONENTS ACCORDION*

- Repeater fields item label head are wrong (`.voxel-fse-repeater-item-label`), they should display the Select value option and not the Label. For instance the User Menu Component Type when selected should show "user_menu" and not "User Menu" label
- When mouse hovering the UploadImage Control `.voxel-fse-image-upload-control__content` it should display the "Icon library" | "Upload SVG" options and not only when the Control is empty
- The `.voxel-fse-enable-tags` Button is missing in the "Label" Input field control
- The "Enable label visibility" controls don't work at all, are not wired to the block

*ICONS ACCORDION*

- ARE NOT WIRED, don't work at all

**Style Tab**

*USER AREA: GENERAL ACCORDION*

- **Item**: Gap, Item background (should be per item), Item background (hover), item border radius, margin, padding, icon size, icon color, icon color (hover)
- **Item Icon**: Nothing works! Not wired!
- **Unread indicator**: Nothing works! Not wired!
- **Avatar**: Nothing works! Not wired!
- **Item Label**: Nothing works! Not wired!

*POPUPS: CUSTOM STYLE*

- Nothing works!
