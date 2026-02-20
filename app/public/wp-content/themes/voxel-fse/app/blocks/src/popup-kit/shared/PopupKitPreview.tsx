/**
 * Popup Kit Preview - Shared Component
 * 
 * Renders a comprehensive preview of all popup styling components.
 * Used by BOTH editor (edit.tsx) and frontend (frontend.tsx).
 * 
 * This component matches the Voxel popup-kit.php template structure,
 * showing visual examples of all popup elements with applied styles.
 * 
 * @package VoxelFSE
 */

import React from 'react';
import type { PopupKitAttributes } from '../types';

// Placeholder matching Voxel's gradient demo image (avoids hardcoded URLs that break across environments)
const PLACEHOLDER_IMG = 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150">' +
    '<defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">' +
    '<stop offset="0%" stop-color="#818cf8"/><stop offset="50%" stop-color="#6366f1"/><stop offset="100%" stop-color="#06b6d4"/>' +
    '</linearGradient></defs>' +
    '<rect fill="url(#g)" width="150" height="150" rx="75"/>' +
    '</svg>'
);

interface PopupKitPreviewProps {
    attributes: PopupKitAttributes;
    context: 'editor' | 'frontend';
}

/**
 * Main preview component
 * Renders static HTML previews of popup components with dynamic styling
 */
export default function PopupKitPreview({ attributes, context }: PopupKitPreviewProps) {
    // Helper to prevent link navigation in editor
    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (context === 'editor') {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    return (
        <>
            <div className="ts-form elementor-element">
                <div className="popup-kit-holder">
                    <style type="text/css">{`
                    .popup-kit-holder {
                        padding: 30px;
                        width: 450px;
                        margin: auto;
                        display: flex;
                        flex-direction: column;
                        gap: 20px;
                    }
                    .popup-kit-holder1 {
                        padding: 30px;
                        width: 700px;
                        margin: auto;
                        display: flex;
                        flex-direction: column;
                    }
                    @media (max-width:1024px) {
                        .popup-kit-holder, .popup-kit-holder1 {
                            display: none !important;
                        }
                    }
                    .popup-kit-holder .ts-popup-content-wrapper,
                    .popup-kit-holder1 .ts-popup-content-wrapper {
                        max-height: none;
                    }
                `}</style>

                    {/* Info Section */}
                    <details>
                        <summary>What's the purpose of this widget?</summary>
                        <br />
                        <p>
                            This widget is used to apply global styles to Voxel popups. <br /><br />
                            It should be added in <code>WP-admin &gt; Design &gt; General &gt; Style kits &gt; Popup styles.</code><br /><br />
                            This is a static representation of each popup component. Click on the widget and browse styling options in the widget area. <br /><br />
                            Once saving changes, your settings are applied to all popups sitewide.
                        </p>
                    </details>

                    {/* Popup Head Preview */}
                    <PopupHeadPreview attributes={attributes} onLinkClick={handleLinkClick} />

                    {/* Form Controls Preview */}
                    <FormControlsPreview attributes={attributes} />

                    {/* No Results Preview */}
                    <NoResultsPreview attributes={attributes} />

                    {/* Notifications Preview */}
                    <NotificationsPreview attributes={attributes} onLinkClick={handleLinkClick} />

                    {/* Menu Dropdown Preview */}
                    <MenuDropdownPreview attributes={attributes} onLinkClick={handleLinkClick} />

                    {/* Menu Dropdown (Radio) Preview */}
                    <MenuDropdownRadioPreview attributes={attributes} onLinkClick={handleLinkClick} />

                    {/* Menu Dropdown (Submenu) Preview */}
                    <MenuDropdownSubmenuPreview attributes={attributes} onLinkClick={handleLinkClick} />

                    {/* Cart Preview */}
                    <CartPreview attributes={attributes} onLinkClick={handleLinkClick} />

                    {/* Booking Slots Preview (includes calendar) */}
                    <BookingSlotsPreview attributes={attributes} onLinkClick={handleLinkClick} />
                </div>

                {/* Booking Range Preview (Wide) */}
                <BookingRangePreview attributes={attributes} onLinkClick={handleLinkClick} />

                {/* Alert Preview (in its own container) */}
                <div className="popup-kit-holder">
                    <AlertPreview attributes={attributes} onLinkClick={handleLinkClick} />
                </div>
            </div>
        </>
    );
}

/**
 * Popup Head Component
 * Shows popup header with icon, title, and close button
 */
function PopupHeadPreview({ attributes, onLinkClick }: { attributes: PopupKitAttributes; onLinkClick: (e: React.MouseEvent<HTMLAnchorElement>) => void }) {
    return (
        <div className="ts-form elementor-element">
            <div className="ts-field-popup-container">
                <div className="ts-field-popup triggers-blur">
                    <div className="ts-popup-head flexify ts-sticky-top">
                        <div className="ts-popup-name flexify">
                            <NotificationIcon />
                            <span>{attributes.title || 'Popup head'}</span>
                        </div>
                        <ul className="flexify simplify-ul">
                            <li className="flexify">
                                <a href="#" className="ts-icon-btn" onClick={onLinkClick}>
                                    <TrashIcon />
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div className="ts-popup-content-wrapper min-scroll">
                        <div className="ts-form-group" style={{ paddingBottom: 0 }}>
                            <label>
                                Label <small>Some description</small>
                            </label>
                        </div>
                    </div>
                    <div className="ts-popup-controller">
                        <ul className="flexify simplify-ul">
                            {attributes.showClear && (
                                <li className="flexify">
                                    <a href="#" className="ts-btn ts-btn-1" onClick={onLinkClick}>
                                        {attributes.clearLabel || 'Clear'}
                                    </a>
                                </li>
                            )}
                            {attributes.showSave && (
                                <li className="flexify">
                                    <a href="#" className="ts-btn ts-btn-2" onClick={onLinkClick}>
                                        {attributes.saveLabel || 'Save'}
                                    </a>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Form Controls Preview
 * Shows switchers, steppers, and range sliders
 */
function FormControlsPreview({ attributes: _attributes }: { attributes: PopupKitAttributes }) {
    return (
        <div className="ts-form elementor-element">
            <div className="ts-field-popup-container">
                <div className="ts-field-popup triggers-blur">
                    <div className="ts-popup-content-wrapper min-scroll">
                        {/* Switcher */}
                        <div className="ts-form-group">
                            <label>Switcher</label>
                            <div className="switch-slider">
                                <div className="onoffswitch">
                                    <input type="checkbox" className="onoffswitch-checkbox" tabIndex={0} />
                                    <label className="onoffswitch-label"></label>
                                </div>
                            </div>
                        </div>

                        {/* Switcher (checked) */}
                        <div className="ts-form-group">
                            <div className="switch-slider">
                                <div className="onoffswitch">
                                    <input type="checkbox" checked className="onoffswitch-checkbox" tabIndex={0} readOnly />
                                    <label className="onoffswitch-label"></label>
                                </div>
                            </div>
                        </div>

                        {/* Stepper */}
                        <div className="ts-form-group">
                            <label>Stepper</label>
                            <div className="ts-stepper-input flexify">
                                <button className="ts-stepper-left ts-icon-btn">
                                    <MinusIcon />
                                </button>
                                <input type="number" className="ts-input-box" min="0" max="1000" step="1" placeholder="0" />
                                <button className="ts-stepper-right ts-icon-btn">
                                    <PlusIcon />
                                </button>
                            </div>
                        </div>

                        {/* Range Slider */}
                        <div className="ts-form-group">
                            <label>Range</label>
                            <div className="range-slider-wrapper">
                                <div className="range-value">276 — 774</div>
                                <div className="range-slider noUi-target noUi-ltr noUi-horizontal noUi-txt-dir-ltr">
                                    <div className="noUi-base">
                                        <div className="noUi-connects">
                                            <div className="noUi-connect" style={{ transform: 'translate(27.6%, 0px) scale(0.498, 1)' }}></div>
                                        </div>
                                        <div className="noUi-origin" style={{ transform: 'translate(-724%, 0px)', zIndex: 5 }}>
                                            <div className="noUi-handle noUi-handle-lower" data-handle="0" tabIndex={0} role="slider" aria-orientation="horizontal" aria-valuemin={0.0} aria-valuemax={774.0} aria-valuenow={276.0} aria-valuetext="276.00">
                                                <div className="noUi-touch-area"></div>
                                            </div>
                                        </div>
                                        <div className="noUi-origin" style={{ transform: 'translate(-226%, 0px)', zIndex: 4 }}>
                                            <div className="noUi-handle noUi-handle-upper" data-handle="1" tabIndex={0} role="slider" aria-orientation="horizontal" aria-valuemin={276.0} aria-valuemax={1000.0} aria-valuenow={774.0} aria-valuetext="774.00">
                                                <div className="noUi-touch-area"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * No Results Preview
 * Shows empty state styling
 */
function NoResultsPreview({ attributes: _attributes }: { attributes: PopupKitAttributes }) {
    return (
        <div className="ts-form elementor-element">
            <div className="ts-field-popup-container">
                <div className="ts-field-popup triggers-blur">
                    <div className="ts-popup-head flexify ts-sticky-top">
                        <div className="ts-popup-name flexify">
                            <NotificationIcon />
                            <span>No results</span>
                        </div>
                    </div>
                    <div className="ts-popup-content-wrapper min-scroll">
                        <div className="ts-empty-user-tab">
                            <NotificationIcon />
                            <p>No notifications received.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Notifications Preview
 * Shows notification list with different states
 */
function NotificationsPreview({ attributes: _attributes, onLinkClick }: { attributes: PopupKitAttributes; onLinkClick: (e: React.MouseEvent<HTMLAnchorElement>) => void }) {
    return (
        <div className="ts-form elementor-element">
            <div className="ts-field-popup triggers-blur">
                <div className="ts-popup-content-wrapper min-scroll" style={{ maxHeight: 'none' }}>
                    <div className="ts-popup-head flexify ts-sticky-top">
                        <div className="ts-popup-name flexify">
                            <NotificationIcon />
                            <span>Notifications</span>
                        </div>
                    </div>
                    <ul className="ts-notification-list simplify-ul">
                        <li className="ts-unread-notification ts-new-notification">
                            <a href="#" onClick={onLinkClick}>
                                <div className="notification-image">
                                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M14.6191 6.31451C14.6191 4.62179 15.9914 3.24951 17.6841 3.24951C19.3769 3.24951 20.7491 4.62179 20.7491 6.31451C20.7491 8.00724 19.3769 9.37951 17.6841 9.37951C15.9914 9.37951 14.6191 8.00724 14.6191 6.31451Z" fill="#343C54"></path>
                                        <path d="M13.1191 6.31451C13.1191 5.53442 13.3148 4.80001 13.6598 4.15771H5.5918C4.34916 4.15771 3.3418 5.16507 3.3418 6.40772V18.4077C3.3418 19.6504 4.34916 20.6577 5.5918 20.6577H17.5916C18.8342 20.6577 19.8416 19.6504 19.8416 18.4077V10.3385C19.1992 10.6837 18.4645 10.8795 17.6841 10.8795C15.1629 10.8795 13.1191 8.83564 13.1191 6.31451ZM7.09375 13.1582C7.09375 12.744 7.42954 12.4082 7.84375 12.4082H11.5938C12.008 12.4082 12.3438 12.744 12.3438 13.1582C12.3438 13.5724 12.008 13.9082 11.5938 13.9082H7.84375C7.42954 13.9082 7.09375 13.5724 7.09375 13.1582ZM7.84375 15.4082H15.3438C15.758 15.4082 16.0938 15.744 16.0938 16.1582C16.0938 16.5724 15.758 16.9082 15.3438 16.9082H7.84375C7.42954 16.9082 7.09375 16.5724 7.09375 16.1582C7.09375 15.744 7.42954 15.4082 7.84375 15.4082Z" fill="#343C54"></path>
                                    </svg>
                                </div>
                                <div className="notification-details">
                                    <b>Unseen and unvisited notification</b>
                                    <span>9 hours ago</span>
                                </div>
                            </a>
                        </li>
                        <li className="ts-unread-notification">
                            <a href="#" onClick={onLinkClick}>
                                <div className="notification-image">
                                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M14.6191 6.31451C14.6191 4.62179 15.9914 3.24951 17.6841 3.24951C19.3769 3.24951 20.7491 4.62179 20.7491 6.31451C20.7491 8.00724 19.3769 9.37951 17.6841 9.37951C15.9914 9.37951 14.6191 8.00724 14.6191 6.31451Z" fill="#343C54"></path>
                                        <path d="M13.1191 6.31451C13.1191 5.53442 13.3148 4.80001 13.6598 4.15771H5.5918C4.34916 4.15771 3.3418 5.16507 3.3418 6.40772V18.4077C3.3418 19.6504 4.34916 20.6577 5.5918 20.6577H17.5916C18.8342 20.6577 19.8416 19.6504 19.8416 18.4077V10.3385C19.1992 10.6837 18.4645 10.8795 17.6841 10.8795C15.1629 10.8795 13.1191 8.83564 13.1191 6.31451ZM7.09375 13.1582C7.09375 12.744 7.42954 12.4082 7.84375 12.4082H11.5938C12.008 12.4082 12.3438 12.744 12.3438 13.1582C12.3438 13.5724 12.008 13.9082 11.5938 13.9082H7.84375C7.42954 13.9082 7.09375 13.5724 7.09375 13.1582ZM7.84375 15.4082H15.3438C15.758 15.4082 16.0938 15.744 16.0938 16.1582C16.0938 16.5724 15.758 16.9082 15.3438 16.9082H7.84375C7.42954 16.9082 7.09375 16.5724 7.09375 16.1582C7.09375 15.744 7.42954 15.4082 7.84375 15.4082Z" fill="#343C54"></path>
                                    </svg>
                                </div>
                                <div className="notification-details">
                                    <b>Unvisited notification</b>
                                    <span>9 hours ago</span>
                                </div>
                            </a>
                        </li>
                        <li className="">
                            <a href="#" onClick={onLinkClick}>
                                <div className="notification-image">
                                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M14.6191 6.31451C14.6191 4.62179 15.9914 3.24951 17.6841 3.24951C19.3769 3.24951 20.7491 4.62179 20.7491 6.31451C20.7491 8.00724 19.3769 9.37951 17.6841 9.37951C15.9914 9.37951 14.6191 8.00724 14.6191 6.31451Z" fill="#343C54"></path>
                                        <path d="M13.1191 6.31451C13.1191 5.53442 13.3148 4.80001 13.6598 4.15771H5.5918C4.34916 4.15771 3.3418 5.16507 3.3418 6.40772V18.4077C3.3418 19.6504 4.34916 20.6577 5.5918 20.6577H17.5916C18.8342 20.6577 19.8416 19.6504 19.8416 18.4077V10.3385C19.1992 10.6837 18.4645 10.8795 17.6841 10.8795C15.1629 10.8795 13.1191 8.83564 13.1191 6.31451ZM7.09375 13.1582C7.09375 12.744 7.42954 12.4082 7.84375 12.4082H11.5938C12.008 12.4082 12.3438 12.744 12.3438 13.1582C12.3438 13.5724 12.008 13.9082 11.5938 13.9082H7.84375C7.42954 13.9082 7.09375 13.5724 7.09375 13.1582ZM7.84375 15.4082H15.3438C15.758 15.4082 16.0938 15.744 16.0938 16.1582C16.0938 16.5724 15.758 16.9082 15.3438 16.9082H7.84375C7.42954 16.9082 7.09375 16.5724 7.09375 16.1582C7.09375 15.744 7.42954 15.4082 7.84375 15.4082Z" fill="#343C54"></path>
                                    </svg>
                                </div>
                                <div className="notification-details">
                                    <b>Seen and visited notification</b>
                                    <span>9 hours ago</span>
                                </div>
                            </a>
                        </li>
                        <li className="ts-unread-notification ts-new-notification">
                            <a href="#" onClick={onLinkClick}>
                                <div className="notification-image">
                                    <img src={PLACEHOLDER_IMG} alt="" />
                                </div>
                                <div className="notification-details">
                                    <b>Unseen and unvisited with image</b>
                                    <span>9 hours ago</span>
                                </div>
                            </a>
                        </li>
                        <li className="ts-unread-notification">
                            <a href="#" onClick={onLinkClick}>
                                <div className="notification-image">
                                    <img src={PLACEHOLDER_IMG} alt="" />
                                </div>
                                <div className="notification-details">
                                    <b>Unvisited with image</b>
                                    <span>15 hours ago</span>
                                </div>
                            </a>
                        </li>
                        <li className="">
                            <a href="#" onClick={onLinkClick}>
                                <div className="notification-image">
                                    <img src={PLACEHOLDER_IMG} alt="" />
                                </div>
                                <div className="notification-details">
                                    <b>Seen and visited with image</b>
                                    <span>15 hours ago</span>
                                </div>
                            </a>
                        </li>
                        <li>
                            <a href="#" onClick={onLinkClick}>
                                <div className="notification-image">
                                    <img src={PLACEHOLDER_IMG} className="ts-status-avatar" alt="" width="150" height="150" />
                                </div>
                                <div className="notification-details">
                                    <b>Notification prompt with actions</b>
                                </div>
                            </a>
                            <div className="ts-notification-actions">
                                <a href="#" className="ts-btn ts-btn-1" onClick={onLinkClick}>Approve</a>
                                <a href="#" className="ts-btn ts-btn-1" onClick={onLinkClick}>Decline</a>
                            </div>
                        </li>
                    </ul>
                    <div className="ts-form-group">
                        <div className="n-load-more">
                            <a href="#" className="ts-btn ts-btn-4" onClick={onLinkClick}>
                                <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '20px', height: '20px' }}>
                                    <path d="M21.6009 10.4593C22.001 10.3521 22.2384 9.94088 22.1312 9.54078C21.59 7.52089 20.3974 5.73603 18.7384 4.46302C17.0793 3.19001 15.0466 2.5 12.9555 2.5C10.8644 2.5 8.83164 3.19001 7.17262 4.46302C6.12405 5.26762 5.26179 6.2767 4.63257 7.42036L2.86504 6.92617C2.76093 6.89707 2.65423 6.89133 2.55153 6.9068C2.46222 6.91962 2.37374 6.94889 2.29039 6.99582C1.92945 7.19903 1.80158 7.65636 2.00479 8.0173L3.73942 11.0983C3.83701 11.2717 3.99946 11.3991 4.19104 11.4527C4.30333 11.4841 4.42023 11.4886 4.53266 11.4673C4.61373 11.4524 4.69254 11.4242 4.7657 11.383L7.84641 9.64831C8.11073 9.49948 8.25936 9.20608 8.22302 8.90493C8.18668 8.60378 7.9725 8.35417 7.68037 8.27249L6.1241 7.83737C6.6343 6.99996 7.29751 6.2579 8.08577 5.65305C9.48282 4.58106 11.1946 4 12.9555 4C14.7164 4 16.4282 4.58106 17.8252 5.65305C19.2223 6.72504 20.2266 8.22807 20.6823 9.92901C20.7895 10.3291 21.2008 10.5665 21.6009 10.4593Z" fill="currentColor"></path>
                                    <path d="M4.30739 13.5387C3.90729 13.6459 3.66985 14.0572 3.77706 14.4573C4.31829 16.4771 5.51089 18.262 7.16991 19.535C8.82892 20.808 10.8616 21.498 12.9528 21.498C15.0439 21.498 17.0766 20.808 18.7356 19.535C19.7859 18.7291 20.6493 17.7181 21.2787 16.5722L23.0083 17.0557C23.1218 17.0961 23.2447 17.1091 23.3661 17.0917C23.5554 17.0658 23.7319 16.968 23.8546 16.8116C24.0419 16.573 24.0669 16.245 23.9181 15.9807L22.1835 12.8996C22.0859 12.7263 21.9234 12.5988 21.7319 12.5453C21.64 12.5196 21.5451 12.5119 21.4521 12.5216C21.3493 12.5317 21.2488 12.5629 21.1571 12.6146L18.0764 14.3493C17.7155 14.5525 17.5876 15.0099 17.7909 15.3708C17.9016 15.5675 18.0879 15.695 18.2929 15.7373L19.7875 16.1552C19.2768 16.9949 18.6125 17.7388 17.8225 18.345C16.4255 19.417 14.7137 19.998 12.9528 19.998C11.1918 19.998 9.4801 19.417 8.08305 18.345C6.686 17.273 5.68171 15.77 5.22595 14.069C5.11874 13.6689 4.70749 13.4315 4.30739 13.5387Z" fill="currentColor"></path>
                                </svg>
                                Load more
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Menu Dropdown Preview
 * Shows hierarchical menu with checkboxes
 */
function MenuDropdownPreview({ attributes: _attributes, onLinkClick }: { attributes: PopupKitAttributes; onLinkClick: (e: React.MouseEvent<HTMLAnchorElement>) => void }) {
    return (
        <div className="ts-form elementor-element">
            <div className="ts-field-popup-container">
                <div className="ts-field-popup triggers-blur">
                    <div className="ts-popup-content-wrapper min-scroll">
                        <div className="ts-sticky-top uib b-bottom">
                            <div className="ts-input-icon flexify">
                                <SearchIcon />
                                <input type="text" placeholder="Search" className="autofocus" maxLength={100} />
                            </div>
                        </div>
                        <div className="ts-term-dropdown ts-multilevel-dropdown ts-md-group">
                            <ul className="simplify-ul ts-term-dropdown-list">
                                <li className="ts-selected">
                                    <a href="#" className="flexify" onClick={onLinkClick}>
                                        <div className="ts-checkbox-container">
                                            <label className="container-checkbox">
                                                <input type="checkbox" hidden value="attractions" checked readOnly />
                                                <span className="checkmark"></span>
                                            </label>
                                        </div>
                                        <span>Attractions</span>
                                        <div className="ts-term-icon">
                                            <FileIcon />
                                        </div>
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="flexify" onClick={onLinkClick}>
                                        <div className="ts-checkbox-container">
                                            <label className="container-checkbox">
                                                <input type="checkbox" hidden value="bars" />
                                                <span className="checkmark"></span>
                                            </label>
                                        </div>
                                        <span>Bars</span>
                                        <div className="ts-right-icon"></div>
                                        <div className="ts-term-icon">
                                            <FileIcon />
                                        </div>
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="flexify" onClick={onLinkClick}>
                                        <div className="ts-checkbox-container">
                                            <label className="container-checkbox">
                                                <input type="checkbox" hidden value="cinema" />
                                                <span className="checkmark"></span>
                                            </label>
                                        </div>
                                        <span>Cinema</span>
                                        <div className="ts-term-icon">
                                            <FileIcon />
                                        </div>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Cart Preview
 * Shows shopping cart with items
 */
function CartPreview({ attributes: _attributes, onLinkClick }: { attributes: PopupKitAttributes; onLinkClick: (e: React.MouseEvent<HTMLAnchorElement>) => void }) {
    return (
        <div className="ts-form elementor-element">
            <div className="ts-field-popup-container">
                <div className="ts-field-popup triggers-blur">
                    <div className="ts-popup-content-wrapper min-scroll">
                        <div className="ts-popup-head flexify ts-sticky-top">
                            <div className="ts-popup-name flexify">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="#1C2033" width="52" height="52" viewBox="0 0 24 24">
                                    <path d="M4 2.00001L20 2C21.1046 2 22 2.89543 22 4V17C22 19.7614 19.7614 22 17 22H7C4.23858 22 2 19.7614 2 17V4.00001C2 2.89544 2.89543 2.00001 4 2.00001ZM8.75 7.00001V5.00001C8.75 4.58579 8.41421 4.25001 8 4.25001C7.58579 4.25001 7.25 4.58579 7.25 5.00001V7.00001C7.25 9.62336 9.37665 11.75 12 11.75C14.6234 11.75 16.75 9.62336 16.75 7.00001V5.00001C16.75 4.58579 16.4142 4.25001 16 4.25001C15.5858 4.25001 15.25 4.58579 15.25 5.00001V7.00001C15.25 8.79493 13.7949 10.25 12 10.25C10.2051 10.25 8.75 8.79493 8.75 7.00001Z"></path>
                                </svg>
                                <span>Cart</span>
                            </div>
                            <ul className="flexify simplify-ul">
                                <li className="flexify">
                                    <a href="#" className="ts-icon-btn" role="button" onClick={onLinkClick}>
                                        <svg fill="#1C2033" width="52" height="52" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 1.25C9.92893 1.25 8.25 2.92893 8.25 5H4.5C3.67157 5 3 5.67157 3 6.5C3 7.32843 3.67157 8 4.5 8H19.5C20.3284 8 21 7.32843 21 6.5C21 5.67157 20.3284 5 19.5 5H15.75C15.75 2.92893 14.0711 1.25 12 1.25ZM12 2.75C13.2426 2.75 14.25 3.75736 14.25 5H9.75C9.75 3.75736 10.7574 2.75 12 2.75Z"></path>
                                            <path d="M5 20V9.5H19V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20ZM10 16.25C9.58579 16.25 9.25 16.5858 9.25 17C9.25 17.4142 9.58579 17.75 10 17.75H14C14.4142 17.75 14.75 17.4142 14.75 17C14.75 16.5858 14.4142 16.25 14 16.25H10ZM7.75 13.5C7.75 13.9142 8.08579 14.25 8.5 14.25H15.5C15.9142 14.25 16.25 13.9142 16.25 13.5C16.25 13.0858 15.9142 12.75 15.5 12.75H8.5C8.08579 12.75 7.75 13.0858 7.75 13.5Z"></path>
                                        </svg>
                                    </a>
                                </li>
                                <li className="flexify ts-popup-close">
                                    <a href="#" className="ts-icon-btn" role="button" onClick={onLinkClick}>
                                        <svg fill="#1C2033" width="52" height="52" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1.46967 1.46967C1.76256 1.17678 2.23744 1.17678 2.53033 1.46967L12 10.9393L21.4697 1.46967C21.7626 1.17678 22.2374 1.17678 22.5303 1.46967C22.8232 1.76256 22.8232 2.23744 22.5303 2.53033L13.0607 12L22.5303 21.4697C22.8232 21.7626 22.8232 22.2374 22.5303 22.5303C22.2374 22.8232 21.7626 22.8232 21.4697 22.5303L12 13.0607L2.53033 22.5303C2.23744 22.8232 1.76256 22.8232 1.46967 22.5303C1.17678 22.2374 1.17678 21.7626 1.46967 21.4697L10.9393 12L1.46967 2.53033C1.17678 2.23744 1.17678 1.76256 1.46967 1.46967Z"></path>
                                        </svg>
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div className="ts-form-group">
                            <ul className="ts-cart-list simplify-ul">
                                <li>
                                    <div className="cart-image">
                                        <img width="150" height="150" src={PLACEHOLDER_IMG} className="ts-status-avatar" alt="" />
                                    </div>
                                    <div className="cart-item-details">
                                        <a href="#" onClick={onLinkClick}>
                                            Product Name
                                        </a>
                                        <span>Color: Blue, Size: M</span>
                                        <span>€1,949.00</span>
                                    </div>
                                    <div className="cart-stepper">
                                        <a href="#" className="ts-icon-btn ts-smaller" onClick={onLinkClick}>
                                            <svg fill="#1C2033" width="52" height="52" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M1.25 12C1.25 11.5858 1.58579 11.25 2 11.25H22C22.4142 11.25 22.75 11.5858 22.75 12C22.75 12.4142 22.4142 12.75 22 12.75H2C1.58579 12.75 1.25 12.4142 1.25 12Z"></path>
                                            </svg>
                                        </a>
                                        <span>1</span>
                                        <a href="#" className="ts-icon-btn ts-smaller" onClick={onLinkClick}>
                                            <svg fill="#1C2033" width="52" height="52" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 1.25C12.4142 1.25 12.75 1.58579 12.75 2V11.25H22C22.4142 11.25 22.75 11.5858 22.75 12C22.75 12.4142 22.4142 12.75 22 12.75H12.75V22C12.75 22.4142 12.4142 22.75 12 22.75C11.5858 22.75 11.25 22.4142 11.25 22V12.75H2C1.58579 12.75 1.25 12.4142 1.25 12C1.25 11.5858 1.58579 11.25 2 11.25H11.25V2C11.25 1.58579 11.5858 1.25 12 1.25Z"></path>
                                            </svg>
                                        </a>
                                    </div>
                                </li>
                                <li>
                                    <div className="cart-image">
                                        <img width="150" height="150" src={PLACEHOLDER_IMG} className="ts-status-avatar" alt="" />
                                    </div>
                                    <div className="cart-item-details">
                                        <a href="#" onClick={onLinkClick}>
                                            Line icon pack
                                        </a>
                                        <span>€99.00</span>
                                    </div>
                                    <div className="cart-stepper">
                                        <a href="#" className="ts-icon-btn ts-smaller" onClick={onLinkClick}>
                                            <svg fill="#1C2033" width="52" height="52" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 1.25C9.92893 1.25 8.25 2.92893 8.25 5H4.5C3.67157 5 3 5.67157 3 6.5C3 7.32843 3.67157 8 4.5 8H19.5C20.3284 8 21 7.32843 21 6.5C21 5.67157 20.3284 5 19.5 5H15.75C15.75 2.92893 14.0711 1.25 12 1.25ZM12 2.75C13.2426 2.75 14.25 3.75736 14.25 5H9.75C9.75 3.75736 10.7574 2.75 12 2.75Z"></path>
                                                <path d="M5 20V9.5H19V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20ZM10 16.25C9.58579 16.25 9.25 16.5858 9.25 17C9.25 17.4142 9.58579 17.75 10 17.75H14C14.4142 17.75 14.75 17.4142 14.75 17C14.75 16.5858 14.4142 16.25 14 16.25H10ZM7.75 13.5C7.75 13.9142 8.08579 14.25 8.5 14.25H15.5C15.9142 14.25 16.25 13.9142 16.25 13.5C16.25 13.0858 15.9142 12.75 15.5 12.75H8.5C8.08579 12.75 7.75 13.0858 7.75 13.5Z"></path>
                                            </svg>
                                        </a>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="ts-cart-controller">
                        <div className="cart-subtotal">
                            <span>Subtotal</span>
                            <span>€1,949.00</span>
                        </div>
                        <a href="#" className="ts-btn ts-btn-2" onClick={onLinkClick}>
                            Continue <ArrowRightIcon />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Shared Datepicker Markup Component
 * Reusable calendar table structure used by both CalendarPreview and BookingSlotsPreview
 */
function DatepickerMarkup() {
    return (
        <div className="ts-booking-date ts-booking-date-single ts-form-group">
            <input type="hidden" />
            <div className="pika-single">
                <div className="pika-lendar">
                    <div id="pika-title-sd" className="pika-title" role="heading" aria-live="assertive">
                        <div className="pika-label">March <select className="pika-select pika-select-month" tabIndex={-1}>
                            <option value="0" disabled>January</option>
                            <option value="1" disabled>February</option>
                            <option value="2" selected>March</option>
                            <option value="3">April</option>
                            <option value="4" disabled>May</option>
                            <option value="5" disabled>June</option>
                            <option value="6" disabled>July</option>
                            <option value="7" disabled>August</option>
                            <option value="8" disabled>September</option>
                            <option value="9" disabled>October</option>
                            <option value="10" disabled>November</option>
                            <option value="11" disabled>December</option>
                        </select>
                        </div>
                        <div className="pika-label">2024 <select className="pika-select pika-select-year" tabIndex={-1}>
                            <option value="2024" selected>2024</option>
                        </select>
                        </div>
                        <button className="pika-prev ts-icon-btn is-disabled" type="button">
                            <svg fill="#1C2033" width="52" height="52" version="1.1" id="lni_lni-arrow-left" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 64 64" style={{} as any} xmlSpace="preserve">
                                <path d="M56,29.8H13.3l17-17.3c0.9-0.9,0.9-2.3,0-3.2c-0.9-0.9-2.3-0.9-3.2,0l-20.7,21c-0.9,0.9-0.9,2.3,0,3.2l20.7,21 c0.4,0.4,1,0.7,1.6,0.7c0.6,0,1.1-0.2,1.6-0.6c0.9-0.9,0.9-2.3,0-3.2L13.4,34.3H56c1.2,0,2.2-1,2.2-2.2C58.2,30.8,57.2,29.8,56,29.8 z"></path>
                            </svg>
                        </button>
                        <button className="pika-next ts-icon-btn" type="button">
                            <svg fill="#1C2033" width="52" height="52" version="1.1" id="lni_lni-arrow-right" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 64 64" style={{} as any} xmlSpace="preserve">
                                <path d="M57.6,30.4l-20.7-21c-0.9-0.9-2.3-0.9-3.2,0c-0.9,0.9-0.9,2.3,0,3.2l16.8,17.1H8c-1.2,0-2.2,1-2.2,2.2s1,2.3,2.2,2.3h42.7 l-17,17.3c-0.9,0.9-0.9,2.3,0,3.2c0.4,0.4,1,0.6,1.6,0.6c0.6,0,1.2-0.2,1.6-0.7l20.7-21C58.5,32.7,58.5,31.3,57.6,30.4z"></path>
                            </svg>
                        </button>
                    </div>
                    <table cellPadding="0" cellSpacing="0" className="pika-table" role="grid" aria-labelledby="pika-title-sd">
                        <thead>
                            <tr>
                                <th scope="col"><abbr title="Monday">Mon</abbr></th>
                                <th scope="col"><abbr title="Tuesday">Tue</abbr></th>
                                <th scope="col"><abbr title="Wednesday">Wed</abbr></th>
                                <th scope="col"><abbr title="Thursday">Thu</abbr></th>
                                <th scope="col"><abbr title="Friday">Fri</abbr></th>
                                <th scope="col"><abbr title="Saturday">Sat</abbr></th>
                                <th scope="col"><abbr title="Sunday">Sun</abbr></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="pika-row">
                                <td className="is-empty"></td>
                                <td className="is-empty"></td>
                                <td className="is-empty"></td>
                                <td className="is-empty"></td>
                                <td data-day="1" className="is-disabled" aria-selected="false">
                                    <button className="pika-button pika-day" type="button" data-pika-year="2024" data-pika-month="2" data-pika-day="1">1</button>
                                </td>
                                <td data-day="2" className="is-disabled" aria-selected="false">
                                    <button className="pika-button pika-day" type="button" data-pika-year="2024" data-pika-month="2" data-pika-day="2">2</button>
                                </td>
                                <td data-day="3" className="is-disabled" aria-selected="false">
                                    <button className="pika-button pika-day" type="button" data-pika-year="2024" data-pika-month="2" data-pika-day="3">3</button>
                                </td>
                            </tr>
                            <tr className="pika-row">
                                <td data-day="4" className="is-disabled" aria-selected="false">
                                    <button className="pika-button pika-day" type="button" data-pika-year="2024" data-pika-month="2" data-pika-day="4">4</button>
                                </td>
                                <td data-day="5" className="is-disabled" aria-selected="false">
                                    <button className="pika-button pika-day" type="button" data-pika-year="2024" data-pika-month="2" data-pika-day="5">5</button>
                                </td>
                                <td data-day="6" className="is-disabled" aria-selected="false">
                                    <button className="pika-button pika-day" type="button" data-pika-year="2024" data-pika-month="2" data-pika-day="6">6</button>
                                </td>
                                <td data-day="7" className="is-disabled" aria-selected="false">
                                    <button className="pika-button pika-day" type="button" data-pika-year="2024" data-pika-month="2" data-pika-day="7">7</button>
                                </td>
                                <td data-day="8" className="is-disabled" aria-selected="false">
                                    <button className="pika-button pika-day" type="button" data-pika-year="2024" data-pika-month="2" data-pika-day="8">8</button>
                                </td>
                                <td data-day="9" className="is-disabled" aria-selected="false">
                                    <button className="pika-button pika-day" type="button" data-pika-year="2024" data-pika-month="2" data-pika-day="9">9</button>
                                </td>
                                <td data-day="10" className="is-disabled" aria-selected="false">
                                    <button className="pika-button pika-day" type="button" data-pika-year="2024" data-pika-month="2" data-pika-day="10">10</button>
                                </td>
                            </tr>
                            <tr className="pika-row">
                                <td data-day="11" className="is-disabled" aria-selected="false">
                                    <button className="pika-button pika-day" type="button" data-pika-year="2024" data-pika-month="2" data-pika-day="11">11</button>
                                </td>
                                <td data-day="12" className="is-disabled" aria-selected="false">
                                    <button className="pika-button pika-day" type="button" data-pika-year="2024" data-pika-month="2" data-pika-day="12">12</button>
                                </td>
                                <td data-day="13" className="is-disabled" aria-selected="false">
                                    <button className="pika-button pika-day" type="button" data-pika-year="2024" data-pika-month="2" data-pika-day="13">13</button>
                                </td>
                                <td data-day="14" className="is-disabled" aria-selected="false">
                                    <button className="pika-button pika-day" type="button" data-pika-year="2024" data-pika-month="2" data-pika-day="14">14</button>
                                </td>
                                <td data-day="15" className="is-today" aria-selected="false">
                                    <button className="pika-button pika-day" type="button" data-pika-year="2024" data-pika-month="2" data-pika-day="15">15</button>
                                    <div className="pika-tooltip">3+ available</div>
                                </td>
                                <td data-day="16" className="is-disabled" aria-selected="false">
                                    <button className="pika-button pika-day" type="button" data-pika-year="2024" data-pika-month="2" data-pika-day="16">16</button>
                                </td>
                                <td data-day="17" className="is-disabled" aria-selected="false">
                                    <button className="pika-button pika-day" type="button" data-pika-year="2024" data-pika-month="2" data-pika-day="17">17</button>
                                </td>
                            </tr>
                            <tr className="pika-row">
                                <td data-day="18" className="" aria-selected="false">
                                    <button className="pika-button pika-day" type="button" data-pika-year="2024" data-pika-month="2" data-pika-day="18">18</button>
                                    <div className="pika-tooltip">3+ available</div>
                                </td>
                                <td data-day="19" className="is-disabled" aria-selected="false">
                                    <button className="pika-button pika-day" type="button" data-pika-year="2024" data-pika-month="2" data-pika-day="19">19</button>
                                </td>
                                <td data-day="20" className="" aria-selected="false">
                                    <button className="pika-button pika-day" type="button" data-pika-year="2024" data-pika-month="2" data-pika-day="20">20</button>
                                    <div className="pika-tooltip">3+ available</div>
                                </td>
                                <td data-day="21" className="is-disabled" aria-selected="false">
                                    <button className="pika-button pika-day" type="button" data-pika-year="2024" data-pika-month="2" data-pika-day="21">21</button>
                                </td>
                                <td data-day="22" className="" aria-selected="false">
                                    <button className="pika-button pika-day" type="button" data-pika-year="2024" data-pika-month="2" data-pika-day="22">22</button>
                                    <div className="pika-tooltip">3+ available</div>
                                </td>
                                <td data-day="23" className="is-disabled" aria-selected="false">
                                    <button className="pika-button pika-day" type="button" data-pika-year="2024" data-pika-month="2" data-pika-day="23">23</button>
                                </td>
                                <td data-day="24" className="is-disabled" aria-selected="false">
                                    <button className="pika-button pika-day" type="button" data-pika-year="2024" data-pika-month="2" data-pika-day="24">24</button>
                                </td>
                            </tr>
                            <tr className="pika-row">
                                <td data-day="25" className="" aria-selected="false">
                                    <button className="pika-button pika-day" type="button" data-pika-year="2024" data-pika-month="2" data-pika-day="25">25</button>
                                    <div className="pika-tooltip">3+ available</div>
                                </td>
                                <td data-day="26" className="is-disabled" aria-selected="false">
                                    <button className="pika-button pika-day" type="button" data-pika-year="2024" data-pika-month="2" data-pika-day="26">26</button>
                                </td>
                                <td data-day="27" className="" aria-selected="false">
                                    <button className="pika-button pika-day" type="button" data-pika-year="2024" data-pika-month="2" data-pika-day="27">27</button>
                                    <div className="pika-tooltip">3+ available</div>
                                </td>
                                <td data-day="28" className="is-disabled" aria-selected="false">
                                    <button className="pika-button pika-day" type="button" data-pika-year="2024" data-pika-month="2" data-pika-day="28">28</button>
                                </td>
                                <td data-day="29" className="" aria-selected="false">
                                    <button className="pika-button pika-day" type="button" data-pika-year="2024" data-pika-month="2" data-pika-day="29">29</button>
                                    <div className="pika-tooltip">3+ available</div>
                                </td>
                                <td data-day="30" className="is-disabled" aria-selected="false">
                                    <button className="pika-button pika-day" type="button" data-pika-year="2024" data-pika-month="2" data-pika-day="30">30</button>
                                </td>
                                <td data-day="31" className="is-disabled" aria-selected="false">
                                    <button className="pika-button pika-day" type="button" data-pika-year="2024" data-pika-month="2" data-pika-day="31">31</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

/**
 * Calendar Preview
 * Shows date picker calendar
 */
// @ts-ignore -- unused but kept for future use
function _CalendarPreview({ attributes: _attributes, onLinkClick: _onLinkClick }: { attributes: PopupKitAttributes; onLinkClick: (e: React.MouseEvent<HTMLAnchorElement>) => void }) {
    return (
        <div className="ts-form elementor-element">
            <div className="ts-field-popup-container">
                <div className="ts-field-popup triggers-blur">
                    <div className="ts-popup-content-wrapper min-scroll">
                        <div className="ts-form-group datepicker-head">
                            <h3>
                                <svg fill="#1C2033" width="52" height="52" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.75 3C17.75 2.58579 17.4142 2.25 17 2.25C16.5858 2.25 16.25 2.58579 16.25 3V4H7.75V3C7.75 2.58579 7.41421 2.25 7 2.25C6.58579 2.25 6.25 2.58579 6.25 3V4H4C2.89543 4 2 4.89543 2 6V7.25H22V6C22 4.89543 21.1046 4 20 4H17.75V3Z"></path>
                                    <path d="M22 8.75H2V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V8.75Z"></path>
                                </svg> Select date
                            </h3>
                            <p>Select a date to view available timeslots</p>
                        </div>
                        <DatepickerMarkup />
                    </div>
                </div>
            </div>
        </div>
    );
}


/**
 * Menu Dropdown (Radio/Back) Preview
 */
function MenuDropdownRadioPreview({ attributes: _attributes, onLinkClick }: { attributes: PopupKitAttributes; onLinkClick: (e: React.MouseEvent<HTMLAnchorElement>) => void }) {
    return (
        <div className="ts-form elementor-element">
            <div className="ts-field-popup-container">
                <div className="ts-field-popup triggers-blur">
                    <div className="ts-term-dropdown ts-multilevel-dropdown ts-md-group">
                        <ul className="simplify-ul ts-term-dropdown-list">
                            <li className="ts-term-centered">
                                <a href="#" className="flexify" onClick={onLinkClick}>
                                    <div className="ts-left-icon"></div>
                                    <span>Go back</span>
                                </a>
                            </li>
                            <li className="ts-parent-item">
                                <a href="#" className="flexify" onClick={onLinkClick}>
                                    <div className="ts-checkbox-container">
                                        <label className="container-radio">
                                            <input type="radio" hidden value="bars" disabled />
                                            <span className="checkmark"></span>
                                        </label>
                                    </div>
                                    <span>All in Bars</span>
                                    <div className="ts-term-icon">
                                        <FileIcon />
                                    </div>
                                </a>
                            </li>
                            <li>
                                <a href="#" className="flexify" onClick={onLinkClick}>
                                    <div className="ts-checkbox-container">
                                        <label className="container-radio">
                                            <input type="radio" hidden value="nightlife" disabled />
                                            <span className="checkmark"></span>
                                        </label>
                                    </div>
                                    <span>Nightlife</span>
                                    <div className="ts-term-icon">
                                        <FileIcon />
                                    </div>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Menu Dropdown (Submenu) Preview
 * Shows navigation menu with submenu items
 */
function MenuDropdownSubmenuPreview({ attributes: _attributes, onLinkClick }: { attributes: PopupKitAttributes; onLinkClick: (e: React.MouseEvent<HTMLAnchorElement>) => void }) {
    return (
        <div className="ts-form elementor-element">
            <div className="ts-field-popup-container">
                <div className="ts-field-popup triggers-blur">
                    <div className="ts-popup-content-wrapper min-scroll">
                        <div className="ts-term-dropdown ts-md-group ts-multilevel-dropdown">
                            <ul className="simplify-ul ts-term-dropdown-list sub-menu">
                                <li className="menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children">
                                    <a href="#" className="flexify" onClick={onLinkClick}>
                                        <div className="ts-term-icon">
                                            <FileIcon />
                                        </div>
                                        <span>Places</span>
                                        <div className="ts-right-icon"></div>
                                    </a>
                                </li>
                                <li className="menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children">
                                    <a href="#" className="flexify" onClick={onLinkClick}>
                                        <div className="ts-term-icon">
                                            <FileIcon />
                                        </div>
                                        <span>Events</span>
                                        <div className="ts-right-icon"></div>
                                    </a>
                                </li>
                                <li className="menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children">
                                    <a href="#" className="flexify" onClick={onLinkClick}>
                                        <div className="ts-term-icon">
                                            <FileIcon />
                                        </div>
                                        <span>Jobs</span>
                                        <div className="ts-right-icon"></div>
                                    </a>
                                </li>
                                <li className="menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children">
                                    <a href="#" className="flexify" onClick={onLinkClick}>
                                        <div className="ts-term-icon">
                                            <FileIcon />
                                        </div>
                                        <span>Groups</span>
                                        <div className="ts-right-icon"></div>
                                    </a>
                                </li>
                                <li className="menu-item menu-item-type-custom menu-item-object-custom">
                                    <a href="#" className="flexify" onClick={onLinkClick}>
                                        <div className="ts-term-icon">
                                            <FileIcon />
                                        </div>
                                        <span>Collections</span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Alert/Notice Preview
 */
function AlertPreview({ attributes: _attributes, onLinkClick }: { attributes: PopupKitAttributes; onLinkClick: (e: React.MouseEvent<HTMLAnchorElement>) => void }) {
    return (
        <div className="popup-kit-holder">
            <div className="ts-notice ts-notice-info" style={{ position: 'static', transform: 'none', left: 'auto', animation: 'none' }}>
                <div className="alert-msg">
                    <div className="alert-ic">
                        <CheckmarkIcon />
                        <CrossIcon />
                        <AlarmIcon />
                    </div>
                    An account is required to perform this action
                </div>

                <div className="a-btn alert-actions">
                    <a className="ts-btn ts-btn-4" href="#" onClick={onLinkClick}>Log in</a>
                    <a className="ts-btn ts-btn-4" href="#" onClick={onLinkClick}>Register</a>
                    <a href="#" className="ts-btn ts-btn-4 close-alert" onClick={onLinkClick}>Close</a>
                </div>
            </div>
        </div>
    );
}

/**
 * Booking Slots Preview
 * Shows booking date picker and time slot selection
 */
function BookingSlotsPreview({ attributes: _attributes, onLinkClick }: { attributes: PopupKitAttributes; onLinkClick: (e: React.MouseEvent<HTMLAnchorElement>) => void }) {
    return (
        <div className="ts-field-popup-container">
            <div className="ts-field-popup triggers-blur">
                <div className="ts-popup-content-wrapper min-scroll">
                    <div className="ts-form-group datepicker-head">
                        <h3>
                            <svg fill="#1C2033" width="52" height="52" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.75 3C17.75 2.58579 17.4142 2.25 17 2.25C16.5858 2.25 16.25 2.58579 16.25 3V4H7.75V3C7.75 2.58579 7.41421 2.25 7 2.25C6.58579 2.25 6.25 2.58579 6.25 3V4H4C2.89543 4 2 4.89543 2 6V7.25H22V6C22 4.89543 21.1046 4 20 4H17.75V3Z"></path>
                                <path d="M22 8.75H2V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V8.75Z"></path>
                            </svg> Select date
                        </h3>
                        <p>Select a date to view available timeslots</p>
                    </div>
                    <DatepickerMarkup />
                </div>
                <div className="ts-popup-content-wrapper min-scroll">
                    <div className="ts-form-group datepicker-head">
                        <h3>
                            <svg fill="#1C2033" width="52" height="52" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM12.75 6V11.6893L16.0303 14.9697C16.3232 15.2626 16.3232 15.7374 16.0303 16.0303C15.7374 16.3232 15.2626 16.3232 14.9697 16.0303L11.4697 12.5303C11.329 12.3897 11.25 12.1989 11.25 12V6C11.25 5.58579 11.5858 5.25 12 5.25C12.4142 5.25 12.75 5.58579 12.75 6Z"></path>
                            </svg> Choose slot
                        </h3>
                        <p>Pick a slot for Mar 15, 2024</p>
                        <a href="#" className="ts-icon-btn" onClick={onLinkClick}>
                            <svg fill="#1C2033" width="52" height="52" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.75 3C17.75 2.58579 17.4142 2.25 17 2.25C16.5858 2.25 16.25 2.58579 16.25 3V4H7.75V3C7.75 2.58579 7.41421 2.25 7 2.25C6.58579 2.25 6.25 2.58579 6.25 3V4H4C2.89543 4 2 4.89543 2 6V7.25H22V6C22 4.89543 21.1046 4 20 4H17.75V3Z"></path>
                                <path d="M22 8.75H2V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V8.75Z"></path>
                            </svg>
                        </a>
                    </div>
                    <div className="ts-booking-slot ts-form-group">
                        <div className="simplify-ul flexify ts-slot-list">
                            <a className="ts-btn ts-btn-1 ts-filled" href="#" onClick={onLinkClick}>9:00 AM - 9:30 AM</a>
                            <a className="ts-btn ts-btn-1" href="#" onClick={onLinkClick}>4:00 PM - 4:30 PM</a>
                            <a className="ts-btn ts-btn-1" href="#" onClick={onLinkClick}>4:30 PM - 5:00 PM</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Booking Range Preview (Wide)
 */
function BookingRangePreview({ attributes: _attributes, onLinkClick: _onLinkClick }: { attributes: PopupKitAttributes; onLinkClick: (e: React.MouseEvent<HTMLAnchorElement>) => void }) {
    return (
        <div className="popup-kit-holder1">
            <div className="ts-form elementor-element" style={{ gridColumnEnd: 'span 2' }}>
                <div className="ts-field-popup-container">
                    <div className="ts-field-popup triggers-blur">
                        <div className="ts-popup-content-wrapper min-scroll">
                            <div className="ts-form-group datepicker-head">
                                <h3>
                                    <CalendarIcon /> 10 nights
                                </h3>
                                <p>Apr 1, 2024 - Apr 11, 2024</p>
                            </div>
                            <div className="ts-booking-date ts-booking-date-range ts-form-group">
                                <div className="pika-single">
                                    <div className="pika-lendar">
                                        <div className="pika-title" role="heading">
                                            <div className="pika-label">
                                                April <select className="pika-select pika-select-month" tabIndex={-1}>
                                                    <option value="3" selected>April</option>
                                                </select>
                                            </div>
                                            <div className="pika-label">
                                                2024 <select className="pika-select pika-select-year" tabIndex={-1}>
                                                    <option value="2024" selected>2024</option>
                                                </select>
                                            </div>
                                            <button className="pika-prev ts-icon-btn" type="button">
                                                <ArrowLeftIcon />
                                            </button>
                                        </div>
                                        <table cellPadding="0" cellSpacing="0" className="pika-table" role="grid">
                                            <thead>
                                                <tr>
                                                    <th scope="col"><abbr title="Monday">Mon</abbr></th>
                                                    <th scope="col"><abbr title="Tuesday">Tue</abbr></th>
                                                    <th scope="col"><abbr title="Wednesday">Wed</abbr></th>
                                                    <th scope="col"><abbr title="Thursday">Thu</abbr></th>
                                                    <th scope="col"><abbr title="Friday">Fri</abbr></th>
                                                    <th scope="col"><abbr title="Saturday">Sat</abbr></th>
                                                    <th scope="col"><abbr title="Sunday">Sun</abbr></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="pika-row">
                                                    <td data-day="1" className="is-selected is-startrange"><button className="pika-button pika-day" type="button">1</button></td>
                                                    <td data-day="2" className="is-inrange"><button className="pika-button pika-day" type="button">2</button></td>
                                                    <td data-day="3" className="is-inrange"><button className="pika-button pika-day" type="button">3</button></td>
                                                    <td data-day="4" className="is-inrange"><button className="pika-button pika-day" type="button">4</button></td>
                                                    <td data-day="5" className="is-inrange"><button className="pika-button pika-day" type="button">5</button></td>
                                                    <td data-day="6" className="is-inrange"><button className="pika-button pika-day" type="button">6</button></td>
                                                    <td data-day="7" className="is-inrange"><button className="pika-button pika-day" type="button">7</button></td>
                                                </tr>
                                                <tr className="pika-row">
                                                    <td data-day="8" className="is-inrange"><button className="pika-button pika-day" type="button">8</button></td>
                                                    <td data-day="9" className="is-inrange"><button className="pika-button pika-day" type="button">9</button></td>
                                                    <td data-day="10" className="is-inrange"><button className="pika-button pika-day" type="button">10</button></td>
                                                    <td data-day="11" className="is-selected is-endrange"><button className="pika-button pika-day" type="button">11</button></td>
                                                    <td data-day="12"><button className="pika-button pika-day" type="button">12</button></td>
                                                    <td data-day="13" className="is-disabled"><button className="pika-button pika-day" type="button">13</button></td>
                                                    <td data-day="14" className="is-disabled"><button className="pika-button pika-day" type="button">14</button></td>
                                                </tr>
                                                <tr className="pika-row">
                                                    <td data-day="15" className="is-disabled"><button className="pika-button pika-day" type="button">15</button></td>
                                                    <td data-day="16" className="is-disabled"><button className="pika-button pika-day" type="button">16</button></td>
                                                    <td data-day="17" className="is-disabled"><button className="pika-button pika-day" type="button">17</button></td>
                                                    <td data-day="18" className="is-disabled"><button className="pika-button pika-day" type="button">18</button></td>
                                                    <td data-day="19" className="is-disabled"><button className="pika-button pika-day" type="button">19</button></td>
                                                    <td data-day="20" className="is-disabled"><button className="pika-button pika-day" type="button">20</button></td>
                                                    <td data-day="21" className="is-disabled"><button className="pika-button pika-day" type="button">21</button></td>
                                                </tr>
                                                <tr className="pika-row">
                                                    <td data-day="22" className="is-disabled"><button className="pika-button pika-day" type="button">22</button></td>
                                                    <td data-day="23" className="is-disabled"><button className="pika-button pika-day" type="button">23</button></td>
                                                    <td data-day="24" className="is-disabled"><button className="pika-button pika-day" type="button">24</button></td>
                                                    <td data-day="25" className="is-disabled"><button className="pika-button pika-day" type="button">25</button></td>
                                                    <td data-day="26" className="is-disabled"><button className="pika-button pika-day" type="button">26</button></td>
                                                    <td data-day="27" className="is-disabled"><button className="pika-button pika-day" type="button">27</button></td>
                                                    <td data-day="28" className="is-disabled"><button className="pika-button pika-day" type="button">28</button></td>
                                                </tr>
                                                <tr className="pika-row">
                                                    <td data-day="29" className="is-disabled"><button className="pika-button pika-day" type="button">29</button></td>
                                                    <td data-day="30" className="is-disabled"><button className="pika-button pika-day" type="button">30</button></td>
                                                    <td className="is-empty"></td>
                                                    <td className="is-empty"></td>
                                                    <td className="is-empty"></td>
                                                    <td className="is-empty"></td>
                                                    <td className="is-empty"></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="pika-lendar">
                                        <div className="pika-title" role="heading">
                                            <div className="pika-label">
                                                May <select className="pika-select pika-select-month" tabIndex={-1}>
                                                    <option value="3" disabled>May</option>
                                                </select>
                                            </div>
                                            <div className="pika-label">
                                                2024 <select className="pika-select pika-select-year" tabIndex={-1}>
                                                    <option value="2024" selected>2024</option>
                                                </select>
                                            </div>
                                            <button className="pika-next ts-icon-btn is-disabled" type="button">
                                                <ArrowRightIcon />
                                            </button>
                                        </div>
                                        <table cellPadding="0" cellSpacing="0" className="pika-table" role="grid">
                                            <thead>
                                                <tr>
                                                    <th scope="col"><abbr title="Monday">Mon</abbr></th>
                                                    <th scope="col"><abbr title="Tuesday">Tue</abbr></th>
                                                    <th scope="col"><abbr title="Wednesday">Wed</abbr></th>
                                                    <th scope="col"><abbr title="Thursday">Thu</abbr></th>
                                                    <th scope="col"><abbr title="Friday">Fri</abbr></th>
                                                    <th scope="col"><abbr title="Saturday">Sat</abbr></th>
                                                    <th scope="col"><abbr title="Sunday">Sun</abbr></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="pika-row">
                                                    <td className="is-empty"></td>
                                                    <td className="is-empty"></td>
                                                    <td data-day="1" className="is-disabled"><button className="pika-button pika-day" type="button">1</button></td>
                                                    <td data-day="2" className="is-disabled"><button className="pika-button pika-day" type="button">2</button></td>
                                                    <td data-day="3" className="is-disabled"><button className="pika-button pika-day" type="button">3</button></td>
                                                    <td data-day="4" className="is-disabled"><button className="pika-button pika-day" type="button">4</button></td>
                                                    <td data-day="5" className="is-disabled"><button className="pika-button pika-day" type="button">5</button></td>
                                                </tr>
                                                <tr className="pika-row">
                                                    <td data-day="6" className="is-disabled"><button className="pika-button pika-day" type="button">6</button></td>
                                                    <td data-day="7" className="is-disabled"><button className="pika-button pika-day" type="button">7</button></td>
                                                    <td data-day="8" className="is-disabled"><button className="pika-button pika-day" type="button">8</button></td>
                                                    <td data-day="9" className="is-disabled"><button className="pika-button pika-day" type="button">9</button></td>
                                                    <td data-day="10" className="is-disabled"><button className="pika-button pika-day" type="button">10</button></td>
                                                    <td data-day="11" className="is-disabled"><button className="pika-button pika-day" type="button">11</button></td>
                                                    <td data-day="12" className="is-disabled"><button className="pika-button pika-day" type="button">12</button></td>
                                                </tr>
                                                <tr className="pika-row">
                                                    <td data-day="13" className="is-disabled"><button className="pika-button pika-day" type="button">13</button></td>
                                                    <td data-day="14" className="is-disabled"><button className="pika-button pika-day" type="button">14</button></td>
                                                    <td data-day="15" className="is-disabled"><button className="pika-button pika-day" type="button">15</button></td>
                                                    <td data-day="16" className="is-disabled"><button className="pika-button pika-day" type="button">16</button></td>
                                                    <td data-day="17" className="is-disabled"><button className="pika-button pika-day" type="button">17</button></td>
                                                    <td data-day="18" className="is-disabled"><button className="pika-button pika-day" type="button">18</button></td>
                                                    <td data-day="19" className="is-disabled"><button className="pika-button pika-day" type="button">19</button></td>
                                                </tr>
                                                <tr className="pika-row">
                                                    <td data-day="20" className="is-disabled"><button className="pika-button pika-day" type="button">20</button></td>
                                                    <td data-day="21" className="is-disabled"><button className="pika-button pika-day" type="button">21</button></td>
                                                    <td data-day="22" className="is-disabled"><button className="pika-button pika-day" type="button">22</button></td>
                                                    <td data-day="23" className="is-disabled"><button className="pika-button pika-day" type="button">23</button></td>
                                                    <td data-day="24" className="is-disabled"><button className="pika-button pika-day" type="button">24</button></td>
                                                    <td data-day="25" className="is-disabled"><button className="pika-button pika-day" type="button">25</button></td>
                                                    <td data-day="26" className="is-disabled"><button className="pika-button pika-day" type="button">26</button></td>
                                                </tr>
                                                <tr className="pika-row">
                                                    <td data-day="27" className="is-disabled"><button className="pika-button pika-day" type="button">27</button></td>
                                                    <td data-day="28" className="is-disabled"><button className="pika-button pika-day" type="button">28</button></td>
                                                    <td data-day="29" className="is-disabled"><button className="pika-button pika-day" type="button">29</button></td>
                                                    <td data-day="30" className="is-disabled"><button className="pika-button pika-day" type="button">30</button></td>
                                                    <td data-day="31" className="is-disabled"><button className="pika-button pika-day" type="button">31</button></td>
                                                    <td className="is-empty"></td>
                                                    <td className="is-empty"></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// SVG ICONS
// ============================================================================

function NotificationIcon() {
    return (
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.6191 6.31451C14.6191 4.62179 15.9914 3.24951 17.6841 3.24951C19.3769 3.24951 20.7491 4.62179 20.7491 6.31451C20.7491 8.00724 19.3769 9.37951 17.6841 9.37951C15.9914 9.37951 14.6191 8.00724 14.6191 6.31451Z" fill="#343C54"></path>
            <path d="M13.1191 6.31451C13.1191 5.53442 13.3148 4.80001 13.6598 4.15771H5.5918C4.34916 4.15771 3.3418 5.16507 3.3418 6.40772V18.4077C3.3418 19.6504 4.34916 20.6577 5.5918 20.6577H17.5916C18.8342 20.6577 19.8416 19.6504 19.8416 18.4077V10.3385C19.1992 10.6837 18.4645 10.8795 17.6841 10.8795C15.1629 10.8795 13.1191 8.83564 13.1191 6.31451ZM7.09375 13.1582C7.09375 12.744 7.42954 12.4082 7.84375 12.4082H11.5938C12.008 12.4082 12.3438 12.744 12.3438 13.1582C12.3438 13.5724 12.008 13.9082 11.5938 13.9082H7.84375C7.42954 13.9082 7.09375 13.5724 7.09375 13.1582ZM7.84375 15.4082H15.3438C15.758 15.4082 16.0938 15.744 16.0938 16.1582C16.0938 16.5724 15.758 16.9082 15.3438 16.9082H7.84375C7.42954 16.9082 7.09375 16.5724 7.09375 16.1582C7.09375 15.744 7.42954 15.4082 7.84375 15.4082Z" fill="#343C54"></path>
        </svg>
    );
}

function TrashIcon() {
    return (
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.5 2C9.08579 2 8.75 2.33579 8.75 2.75C8.75 3.16421 9.08579 3.5 9.5 3.5H14.5C14.9142 3.5 15.25 3.16421 15.25 2.75C15.25 2.33579 14.9142 2 14.5 2H9.5Z" fill="#343C54"></path>
            <path d="M4 5C3.74924 5 3.51506 5.12533 3.37597 5.33397C3.23687 5.54262 3.21125 5.80699 3.3077 6.03846L4.44231 8.76154C4.4804 8.85294 4.5 8.95098 4.5 9.05V19.75C4.5 20.9926 5.50736 22 6.75 22H17.25C18.4926 22 19.5 20.9926 19.5 19.75V9.04978C19.5 8.95083 19.5196 8.85286 19.5576 8.76151L20.6914 6.03827C20.7878 5.8068 20.7621 5.54249 20.623 5.33389C20.4839 5.12529 20.2498 5 19.999 5H4ZM10.75 10.5V16.5C10.75 16.9142 10.4142 17.25 10 17.25C9.58579 17.25 9.25 16.9142 9.25 16.5V10.5C9.25 10.0858 9.58579 9.75 10 9.75C10.4142 9.75 10.75 10.0858 10.75 10.5ZM14.75 10.5V16.5C14.75 16.9142 14.4142 17.25 14 17.25C13.5858 17.25 13.25 16.9142 13.25 16.5V10.5C13.25 10.0858 13.5858 9.75 14 9.75C14.4142 9.75 14.75 10.0858 14.75 10.5Z" fill="#343C54"></path>
        </svg>
    );
}

function MinusIcon() {
    return (
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.875 12C4.875 11.3787 5.37868 10.875 6 10.875H18.0007C18.622 10.875 19.1257 11.3787 19.1257 12C19.1257 12.6213 18.622 13.125 18.0007 13.125H6C5.37868 13.125 4.875 12.6213 4.875 12Z" fill="#343C54"></path>
        </svg>
    );
}

function PlusIcon() {
    return (
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.0002 4.875C12.6216 4.875 13.1252 5.37868 13.1252 6V10.8752H18.0007C18.622 10.8752 19.1257 11.3789 19.1257 12.0002C19.1257 12.6216 18.622 13.1252 18.0007 13.1252H13.1252V18.0007C13.1252 18.622 12.6216 19.1257 12.0002 19.1257C11.3789 19.1257 10.8752 18.622 10.8752 18.0007V13.1252H6C5.37868 13.1252 4.875 12.6216 4.875 12.0002C4.875 11.3789 5.37868 10.8752 6 10.8752H10.8752V6C10.8752 5.37868 11.3789 4.875 12.0002 4.875Z" fill="#343C54"></path>
        </svg>
    );
}

// @ts-ignore -- unused but kept for future use

function _ReloadIcon() {
    return (
        <svg fill="currentColor" width="52" height="52" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2.75C6.89137 2.75 2.75 6.89137 2.75 12C2.75 17.1086 6.89137 21.25 12 21.25C17.1086 21.25 21.25 17.1086 21.25 12C21.25 11.5858 21.5858 11.25 22 11.25C22.4142 11.25 22.75 11.5858 22.75 12C22.75 17.9371 17.9371 22.75 12 22.75C6.06294 22.75 1.25 17.9371 1.25 12C1.25 6.06294 6.06294 1.25 12 1.25C15.0949 1.25 17.8677 2.63214 19.75 4.79167V2C19.75 1.58579 20.0858 1.25 20.5 1.25C20.9142 1.25 21.25 1.58579 21.25 2V6.5C21.25 6.91421 20.9142 7.25 20.5 7.25H16C15.5858 7.25 15.25 6.91421 15.25 6.5C15.25 6.08579 15.5858 5.75 16 5.75H18.5104C16.9449 3.92289 14.6098 2.75 12 2.75Z"></path>
        </svg>
    );
}

function SearchIcon() {
    return (
        <svg fill="currentColor" width="52" height="52" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.25 2.25C5.69365 2.25 2 5.94365 2 10.5C2 15.0563 5.69365 18.75 10.25 18.75C12.2869 18.75 14.1404 18.0191 15.5827 16.8085L20.6367 21.8625C20.9296 22.1554 21.4045 22.1554 21.6974 21.8625C21.9903 21.5696 21.9903 21.0947 21.6974 20.8018L16.6434 15.7478C17.854 14.3055 18.5849 12.452 18.5849 10.415C18.5849 5.85865 14.8913 2.165 10.335 2.165L10.25 2.25ZM3.5 10.5C3.5 6.77208 6.52208 3.75 10.25 3.75C13.9779 3.75 17 6.77208 17 10.5C17 14.2279 13.9779 17.25 10.25 17.25C6.52208 17.25 3.5 14.2279 3.5 10.5Z"></path>
        </svg>
    );
}

function FileIcon() {
    return (
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.7477 2.46516C10.6701 2.52471 10.5961 2.58957 10.5262 2.65951L5.15851 8.03055C5.08902 8.10008 5.02455 8.1737 4.96533 8.25084H10.0004C10.4148 8.25084 10.7507 7.91473 10.7504 7.5003L10.7477 2.46516Z" fill="#343C54"></path>
            <path d="M4.5 9.75084V19.75C4.5 20.9926 5.50736 22 6.75 22H17.25C18.4926 22 19.5 20.9926 19.5 19.75V4.25C19.5 3.00736 18.4926 2 17.25 2H12.2474L12.2504 7.49924C12.2512 8.74244 11.2436 9.75084 10.0004 9.75084H4.5ZM9 13.75H15C15.4142 13.75 15.75 14.0858 15.75 14.5C15.75 14.9142 15.4142 15.25 15 15.25H9C8.58579 15.25 8.25 14.9142 8.25 14.5C8.25 14.0858 8.58579 13.75 9 13.75ZM9 16.75H12C12.4142 16.75 12.75 17.0858 12.75 17.5C12.75 17.9142 12.4142 18.25 12 18.25H9C8.58579 18.25 8.25 17.9142 8.25 17.5C8.25 17.0858 8.58579 16.75 9 16.75Z" fill="#343C54"></path>
        </svg>
    );
// @ts-ignore -- unused but kept for future use
}

// @ts-ignore -- unused but kept for future use
function _BagIcon() {
    return (
        <svg fill="currentColor" width="52" height="52" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 1.25C9.92893 1.25 8.25 2.92893 8.25 5H4.5C3.67157 5 3 5.67157 3 6.5C3 7.32843 3.67157 8 4.5 8H19.5C20.3284 8 21 7.32843 21 6.5C21 5.67157 20.3284 5 19.5 5H15.75C15.75 2.92893 14.0711 1.25 12 1.25ZM12 2.75C13.2426 2.75 14.25 3.75736 14.25 5H9.75C9.75 3.75736 10.7574 2.75 12 2.75Z"></path>
            <path d="M5 20V9.5H19V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20ZM10 16.25C9.58579 16.25 9.25 16.5858 9.25 17C9.25 17.4142 9.58579 17.75 10 17.75H14C14.4142 17.75 14.75 17.4142 14.75 17C14.75 16.5858 14.4142 16.25 14 16.25H10ZM7.75 13.5C7.75 13.9142 8.08579 14.25 8.5 14.25H15.5C15.9142 14.25 16.25 13.9142 16.25 13.5C16.25 13.0858 15.9142 12.75 15.5 12.75H8.5C8.08579 12.75 7.75 13.0858 7.75 13.5Z"></path>
        </svg>
    // @ts-ignore -- unused but kept for future use
    );
}

// @ts-ignore -- unused but kept for future use
function _CloseIcon() {
    return (
        <svg fill="currentColor" width="52" height="52" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.46967 1.46967C1.76256 1.17678 2.23744 1.17678 2.53033 1.46967L12 10.9393L21.4697 1.46967C21.7626 1.17678 22.2374 1.17678 22.5303 1.46967C22.8232 1.76256 22.8232 2.23744 22.5303 2.53033L13.0607 12L22.5303 21.4697C22.8232 21.7626 22.8232 22.2374 22.5303 22.5303C22.2374 22.8232 21.7626 22.8232 21.4697 22.5303L12 13.0607L2.53033 22.5303C2.23744 22.8232 1.76256 22.8232 1.46967 22.5303C1.17678 22.2374 1.17678 21.7626 1.46967 21.4697L10.9393 12L1.46967 2.53033C1.17678 2.23744 1.17678 1.76256 1.46967 1.46967Z"></path>
        </svg>
    );
}

function ArrowRightIcon() {
    return (
        <svg fill="currentColor" width="52" height="52" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.5303 3.46969C14.3158 3.25519 13.9932 3.19103 13.713 3.30711C13.4327 3.4232 13.25 3.69668 13.25 4.00002V11.25H2C1.58579 11.25 1.25 11.5858 1.25 12C1.25 12.4142 1.58579 12.75 2 12.75H13.25V20C13.25 20.3034 13.4327 20.5768 13.713 20.6929C13.9932 20.809 14.3158 20.7449 14.5303 20.5304L22.5303 12.5304C22.8232 12.2375 22.8232 11.7626 22.5303 11.4697L14.5303 3.46969Z"></path>
        </svg>
    );
}

function ArrowLeftIcon() {
    return (
        <svg fill="currentColor" width="52" height="52" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <path d="M56,29.8H13.3l17-17.3c0.9-0.9,0.9-2.3,0-3.2c-0.9-0.9-2.3-0.9-3.2,0l-20.7,21c-0.9,0.9-0.9,2.3,0,3.2l20.7,21 c0.4,0.4,1,0.7,1.6,0.7c0.6,0,1.1-0.2,1.6-0.6c0.9-0.9,0.9-2.3,0-3.2L13.4,34.3H56c1.2,0,2.2-1,2.2-2.2C58.2,30.8,57.2,29.8,56,29.8 z"></path>
        </svg>
    );
}

function CalendarIcon() {
    return (
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.75 2.75C8.75 2.33579 8.41421 2 8 2C7.58579 2 7.25 2.33579 7.25 2.75V3.75H5.5C4.25736 3.75 3.25 4.75736 3.25 6V8.25H20.75V6C20.75 4.75736 19.7426 3.75 18.5 3.75H16.75V2.75C16.75 2.33579 16.4142 2 16 2C15.5858 2 15.25 2.33579 15.25 2.75V3.75H8.75V2.75Z" fill="#343C54"></path>
            <path d="M3.25 19V9.75H20.75V19C20.75 20.2426 19.7426 21.25 18.5 21.25H5.5C4.25736 21.25 3.25 20.2426 3.25 19ZM7.98438 11.95C7.54255 11.95 7.18438 12.3082 7.18438 12.75C7.18438 13.1918 7.54255 13.55 7.98438 13.55H7.99438C8.4362 13.55 8.79437 13.1918 8.79437 12.75C8.79437 12.3082 8.4362 11.95 7.99438 11.95H7.98438ZM11.9941 11.95C11.5523 11.95 11.1941 12.3082 11.1941 12.75C11.1941 13.1918 11.5523 13.55 11.9941 13.55H12.0041C12.446 13.55 12.8041 13.1918 12.8041 12.75C12.8041 12.3082 12.446 11.95 12.0041 11.95H11.9941ZM16.0039 11.95C15.5621 11.95 15.2039 12.3082 15.2039 12.75C15.2039 13.1918 15.5621 13.55 16.0039 13.55H16.0139C16.4557 13.55 16.8139 13.1918 16.8139 12.75C16.8139 12.3082 16.4557 11.95 16.0139 11.95H16.0039ZM7.98438 15.95C7.54255 15.95 7.18438 16.3082 7.18438 16.75C7.18438 17.1918 7.54255 17.55 7.98438 17.55H7.99438C8.4362 17.55 8.79437 17.1918 8.79437 16.75C8.79437 16.3082 8.4362 15.95 7.99438 15.95H7.98438ZM11.9941 15.95C11.5523 15.95 11.1941 16.3082 11.1941 16.75C11.1941 17.1918 11.5523 17.55 11.9941 17.55H12.0041C12.446 17.55 12.8041 17.1918 12.8041 16.75C12.8041 16.3082 12.446 15.95 12.0041 15.95H11.9941ZM16.0039 15.95C15.5621 15.95 15.2039 16.3082 15.2039 16.75C15.2039 17.1918 15.5621 17.55 16.0039 17.55H16.0139C16.4557 17.55 16.8139 17.1918 16.8139 16.75C16.8139 16.3082 16.4557 15.95 16.0139 15.95H16.0039Z" fill="#343C54"></path>
        </svg>
    );
}

function CheckmarkIcon() {
    return (
        <svg fill="currentColor" width="52" height="52" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <g>
                <path d="M32,1.8C15.3,1.8,1.8,15.3,1.8,32S15.3,62.3,32,62.3S62.3,48.7,62.3,32S48.7,1.8,32,1.8z M32,57.8 C17.8,57.8,6.3,46.2,6.3,32C6.3,17.8,17.8,6.3,32,6.3c14.2,0,25.8,11.6,25.8,25.8C57.8,46.2,46.2,57.8,32,57.8z"></path>
                <path d="M40.6,22.7L28.7,34.3L23.3,29c-0.9-0.9-2.3-0.8-3.2,0c-0.9,0.9-0.8,2.3,0,3.2l6.4,6.2c0.6,0.6,1.4,0.9,2.2,0.9 c0.8,0,1.6-0.3,2.2-0.9L43.8,26c0.9-0.9,0.9-2.3,0-3.2S41.5,21.9,40.6,22.7z"></path>
            </g>
        </svg>
    );
}

function CrossIcon() {
    return (
        <svg fill="currentColor" width="52" height="52" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <g>
                <path d="M32,1.8C15.3,1.8,1.8,15.3,1.8,32S15.3,62.3,32,62.3S62.3,48.7,62.3,32S48.7,1.8,32,1.8z M32,57.8 C17.8,57.8,6.3,46.2,6.3,32C6.3,17.8,17.8,6.3,32,6.3c14.2,0,25.8,11.6,25.8,25.8C57.8,46.2,46.2,57.8,32,57.8z"></path>
                <path d="M41.2,22.7c-0.9-0.9-2.3-0.9-3.2,0L32,28.8l-6.1-6.1c-0.9-0.9-2.3-0.9-3.2,0c-0.9,0.9-0.9,2.3,0,3.2l6.1,6.1l-6.1,6.1 c-0.9,0.9-0.9,2.3,0,3.2c0.4,0.4,1,0.7,1.6,0.7c0.6,0,1.2-0.2,1.6-0.7l6.1-6.1l6.1,6.1c0.4,0.4,1,0.7,1.6,0.7 c0.6,0,1.2-0.2,1.6-0.7c0.9-0.9,0.9-2.3,0-3.2L35.2,32l6.1-6.1C42.1,25,42.1,23.6,41.2,22.7z"></path>
            </g>
        </svg>
    );
}

function AlarmIcon() {
    return (
        <svg fill="currentColor" width="52" height="52" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <path d="M57.6,53.1l-2-3.1c-0.4-0.6-0.6-1.2-0.6-1.9V27.3c0-5.9-2.5-11.4-7.1-15.5C44.2,8.5,39.4,6.4,34.3,6V4c0-1.2-1-2.3-2.3-2.3 c-1.2,0-2.3,1-2.3,2.3v1.9c-0.2,0-0.4,0-0.6,0.1C17.5,7.3,8.8,16.6,8.8,27.7v20.4c-0.1,1-0.3,1.5-0.5,1.8l-1.9,3.2 c-0.6,1-0.6,2.2,0,3.2c0.6,0.9,1.6,1.5,2.7,1.5h20.7V60c0,1.2,1,2.3,2.3,2.3c1.2,0,2.3-1,2.3-2.3v-2.2H55c1.1,0,2.1-0.6,2.7-1.5 C58.3,55.3,58.3,54.1,57.6,53.1z M11.5,53.3l0.7-1.2c0.6-1,0.9-2.2,1.1-3.6l0-20.8c0-8.8,7-16.2,16.3-17.2 c5.7-0.6,11.3,1.1,15.4,4.7c3.6,3.2,5.6,7.5,5.6,12.1v20.8c0,1.5,0.4,2.9,1.3,4.3l0.6,0.9H11.5z"></path>
        // @ts-ignore -- unused but kept for future use
        </svg>
    );
}

// @ts-ignore -- unused but kept for future use
function _SlotIcon() {
    return (
        <svg fill="currentColor" width="52" height="52" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM12.75 6V11.6893L16.0303 14.9697C16.3232 15.2626 16.3232 15.7374 16.0303 16.0303C15.7374 16.3232 15.2626 16.3232 14.9697 16.0303L11.4697 12.5303C11.329 12.3897 11.25 12.1989 11.25 12V6C11.25 5.58579 11.5858 5.25 12 5.25C12.4142 5.25 12.75 5.58579 12.75 6Z"></path>
        </svg>
    );
}
