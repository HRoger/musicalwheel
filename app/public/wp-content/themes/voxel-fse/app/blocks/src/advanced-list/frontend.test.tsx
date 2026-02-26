import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdvancedListComponent } from './shared/AdvancedListComponent';
import type { AdvancedListAttributes, PostContext } from './types';
import { DEFAULT_ACTION_ITEM } from './types';

// Note: We no longer use window.confirm - Voxel handles this via data-confirm attribute

// Mock clipboard API
Object.assign(navigator, {
    clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
    },
});

const mockAttributes: AdvancedListAttributes = {
    items: [],
    closeIcon: { value: '', library: '' },
    messageIcon: { value: '', library: '' },
    linkIcon: { value: '', library: '' },
    shareIcon: { value: '', library: '' },
    enableCssGrid: false,
    gridColumns: 3,
    itemWidth: 'auto',
    customItemWidth: 100,
    customItemWidthUnit: 'px',
    listJustify: 'left',
    itemGap: 10,
    itemGapUnit: 'px',
    itemJustifyContent: 'flex-start',
    itemPadding: { top: '', right: '', bottom: '', left: '' },
    itemPaddingUnit: 'px',
    itemHeight: 48,
    itemHeightUnit: 'px',
    itemBorderType: 'none',
    itemBorderWidth: { top: '', right: '', bottom: '', left: '' },
    itemBorderWidthUnit: 'px',
    itemBorderColor: '',
    itemBorderRadius: 0,
    itemBorderRadiusUnit: 'px',
    itemBoxShadow: { horizontal: 0, vertical: 0, blur: 0, spread: 0, color: '' },
    itemTypography: {},
    itemTextColor: '',
    itemBackgroundColor: '',
    itemMargin: { top: '', right: '', bottom: '', left: '' },
    itemMarginUnit: 'px',
    iconContainerBackground: '',
    iconContainerSize: 36,
    iconContainerSizeUnit: 'px',
    iconContainerBorderType: 'solid',
    iconContainerBorderWidth: { top: '', right: '', bottom: '', left: '' },
    iconContainerBorderWidthUnit: 'px',
    iconContainerBorderColor: '',
    iconContainerBorderRadius: 50,
    iconContainerBorderRadiusUnit: 'px',
    iconContainerBoxShadow: { horizontal: 0, vertical: 0, blur: 0, spread: 0, color: '' },
    iconTextSpacing: 0,
    iconTextSpacingUnit: 'px',
    iconOnTop: false,
    iconSize: 18,
    iconSizeUnit: 'px',
    iconColor: '',
    itemBoxShadowHover: { horizontal: 0, vertical: 0, blur: 0, spread: 0, color: '' },
    itemBorderColorHover: '',
    itemTextColorHover: '',
    itemBackgroundColorHover: '',
    iconContainerBackgroundHover: '',
    iconContainerBorderColorHover: '',
    iconColorHover: '',
    itemBoxShadowActive: { horizontal: 0, vertical: 0, blur: 0, spread: 0, color: '' },
    itemTextColorActive: '',
    itemBackgroundColorActive: '',
    itemBorderColorActive: '',
    iconContainerBackgroundActive: '',
    iconContainerBorderColorActive: '',
    iconColorActive: '',
    tooltipBottom: false,
    tooltipTextColor: '',
    tooltipTypography: {},
    tooltipBackgroundColor: '',
    tooltipBorderRadius: 0,
    tooltipBorderRadiusUnit: 'px',
};

const mockPostContext: PostContext = {
    postId: 123,
    postTitle: 'Test Post',
    postLink: 'http://example.com/post/123',
    editLink: 'http://example.com/post/123/edit',
    isEditable: true,
    timelineEnabled: false,
    isFollowed: false,
    isFollowRequested: false,
    isAuthorFollowed: false,
    isAuthorFollowRequested: false,
    authorId: 456,
    editSteps: [],
    permissions: {
        delete: true,
        publish: true,
    },
    status: 'publish',
    product: null,
    location: null,
    postStatsLink: null,
    promote: null,
    nonces: {
        delete_post: 'nonce_delete',
        modify_post: 'nonce_modify',
        follow: 'nonce_follow',
    },
    confirmMessages: {
        delete: 'Are you sure?',
    },
};

describe('AdvancedListComponent', () => {
    it('renders delete post action with data-confirm attribute and vx-action', () => {
        const props = {
            attributes: {
                ...mockAttributes,
                items: [{ ...DEFAULT_ACTION_ITEM, id: '1', actionType: 'delete_post' as const, text: 'Delete Post' }]
            },
            context: 'frontend' as const,
            postContext: mockPostContext,
        };

        render(<AdvancedListComponent {...props} />);

        const deleteLink = screen.getByText('Delete Post').closest('a');
        expect(deleteLink).toBeInTheDocument();
        expect(deleteLink).toHaveAttribute('href', expect.stringContaining('action=user.posts.delete_post'));
        expect(deleteLink).toHaveAttribute('href', expect.stringContaining('_wpnonce=nonce_delete'));
        // Voxel uses data-confirm attribute instead of JS confirm()
        expect(deleteLink).toHaveAttribute('data-confirm', 'Are you sure?');
        // Voxel AJAX attribute
        expect(deleteLink).toHaveAttribute('vx-action');
    });

    it('hides delete action if permission denied', () => {
        const readOnlyContext = {
            ...mockPostContext,
            permissions: { delete: false, publish: false }
        };

        const props = {
            attributes: {
                ...mockAttributes,
                items: [{ ...DEFAULT_ACTION_ITEM, id: '1', actionType: 'delete_post' as const, text: 'Delete Post' }]
            },
            context: 'frontend' as const,
            postContext: readOnlyContext,
        };

        render(<AdvancedListComponent {...props} />);
        expect(screen.queryByText('Delete Post')).not.toBeInTheDocument();
    });

    it('hides unpublish action if permission denied', () => {
        const readOnlyContext = {
            ...mockPostContext,
            permissions: { delete: false, publish: false }
        };

        const props = {
            attributes: {
                ...mockAttributes,
                items: [{ ...DEFAULT_ACTION_ITEM, id: '1', actionType: 'unpublish_post' as const, text: 'Unpublish' }]
            },
            context: 'frontend' as const,
            postContext: readOnlyContext,
        };

        render(<AdvancedListComponent {...props} />);
        expect(screen.queryByText('Unpublish')).not.toBeInTheDocument();
    });

    it('renders follow post action with intermediate class when pending', () => {
        const pendingFollowContext = {
            ...mockPostContext,
            isFollowed: false,
            isFollowRequested: true, // Pending follow request
        };

        const props = {
            attributes: {
                ...mockAttributes,
                items: [{ ...DEFAULT_ACTION_ITEM, id: '1', actionType: 'action_follow_post' as const, text: 'Follow' }]
            },
            context: 'frontend' as const,
            postContext: pendingFollowContext,
        };

        render(<AdvancedListComponent {...props} />);

        const followLink = screen.getByText('Follow').closest('a');
        expect(followLink).toBeInTheDocument();
        expect(followLink).toHaveClass('ts-action-follow');
        expect(followLink).toHaveClass('intermediate');
        expect(followLink).not.toHaveClass('active');
    });

    it('renders follow post action with active class when followed', () => {
        const followedContext = {
            ...mockPostContext,
            isFollowed: true,
            isFollowRequested: false,
        };

        const props = {
            attributes: {
                ...mockAttributes,
                items: [{ ...DEFAULT_ACTION_ITEM, id: '1', actionType: 'action_follow_post' as const, text: 'Following' }]
            },
            context: 'frontend' as const,
            postContext: followedContext,
        };

        render(<AdvancedListComponent {...props} />);

        const followLink = screen.getByText('Following').closest('a');
        expect(followLink).toBeInTheDocument();
        expect(followLink).toHaveClass('ts-action-follow');
        expect(followLink).toHaveClass('active');
        expect(followLink).not.toHaveClass('intermediate');
    });

    it('hides show_post_on_map when no location data', () => {
        const props = {
            attributes: {
                ...mockAttributes,
                items: [{ ...DEFAULT_ACTION_ITEM, id: '1', actionType: 'show_post_on_map' as const, text: 'Show on Map' }]
            },
            context: 'frontend' as const,
            postContext: mockPostContext, // location is null
        };

        render(<AdvancedListComponent {...props} />);
        expect(screen.queryByText('Show on Map')).not.toBeInTheDocument();
    });

    it('renders show_post_on_map when location data exists', () => {
        const contextWithLocation = {
            ...mockPostContext,
            location: {
                latitude: 40.7128,
                longitude: -74.0060,
                address: 'New York, NY',
                mapLink: 'http://example.com/places?location=New+York',
            },
        };

        const props = {
            attributes: {
                ...mockAttributes,
                items: [{ ...DEFAULT_ACTION_ITEM, id: '1', actionType: 'show_post_on_map' as const, text: 'Show on Map' }]
            },
            context: 'frontend' as const,
            postContext: contextWithLocation,
        };

        render(<AdvancedListComponent {...props} />);

        const mapLink = screen.getByText('Show on Map').closest('a');
        expect(mapLink).toBeInTheDocument();
        expect(mapLink).toHaveAttribute('href', 'http://example.com/places?location=New+York');
        expect(mapLink).toHaveClass('ts-action-show-on-map');
    });

    it('hides promote_post when not promotable', () => {
        const props = {
            attributes: {
                ...mockAttributes,
                items: [{ ...DEFAULT_ACTION_ITEM, id: '1', actionType: 'promote_post' as const, text: 'Promote' }]
            },
            context: 'frontend' as const,
            postContext: mockPostContext, // promote is null
        };

        render(<AdvancedListComponent {...props} />);
        expect(screen.queryByText('Promote')).not.toBeInTheDocument();
    });

    it('renders promote_post with active class when promotion is active', () => {
        const contextWithActivePromotion = {
            ...mockPostContext,
            promote: {
                isPromotable: true,
                isActive: true,
                orderLink: 'http://example.com/orders/123',
            },
        };

        const props = {
            attributes: {
                ...mockAttributes,
                items: [{ ...DEFAULT_ACTION_ITEM, id: '1', actionType: 'promote_post' as const, text: 'View Promotion' }]
            },
            context: 'frontend' as const,
            postContext: contextWithActivePromotion,
        };

        render(<AdvancedListComponent {...props} />);

        const promoteLink = screen.getByText('View Promotion').closest('a');
        expect(promoteLink).toBeInTheDocument();
        expect(promoteLink).toHaveAttribute('href', 'http://example.com/orders/123');
        expect(promoteLink).toHaveClass('active');
    });

    it('renders follow action with tooltip-inactive and tooltip-active attributes', () => {
        const props = {
            attributes: {
                ...mockAttributes,
                items: [{
                    ...DEFAULT_ACTION_ITEM,
                    id: '1',
                    actionType: 'action_follow_post' as const,
                    text: 'Follow',
                    enableTooltip: true,
                    tooltipText: 'Click to follow',
                    activeEnableTooltip: true,
                    activeTooltipText: 'Click to unfollow',
                }]
            },
            context: 'frontend' as const,
            postContext: mockPostContext,
        };

        render(<AdvancedListComponent {...props} />);

        const listItem = screen.getByText('Follow').closest('li');
        expect(listItem).toBeInTheDocument();
        // Uses tooltip-inactive/tooltip-active instead of data-tooltip for follow actions
        expect(listItem).toHaveAttribute('tooltip-inactive', 'Click to follow');
        expect(listItem).toHaveAttribute('tooltip-active', 'Click to unfollow');
        expect(listItem).not.toHaveAttribute('data-tooltip');
    });

    it('renders edit_post with multi-step popup when multiple edit steps exist', () => {
        const contextWithMultipleSteps = {
            ...mockPostContext,
            editSteps: [
                { key: 'general', label: 'General', link: 'http://example.com/edit?step=general' },
                { key: 'details', label: 'Details', link: 'http://example.com/edit?step=details' },
                { key: 'media', label: 'Media', link: 'http://example.com/edit?step=media' },
            ],
        };

        const props = {
            attributes: {
                ...mockAttributes,
                items: [{ ...DEFAULT_ACTION_ITEM, id: '1', actionType: 'edit_post' as const, text: 'Edit' }]
            },
            context: 'frontend' as const,
            postContext: contextWithMultipleSteps,
        };

        render(<AdvancedListComponent {...props} />);

        const editLink = screen.getByText('Edit').closest('a');
        expect(editLink).toBeInTheDocument();
        // Should have href=# for popup trigger (anchor elements don't need role=button)
        expect(editLink).toHaveAttribute('href', '#');

        // Wrapper should have ts-popup-component class
        const wrapper = screen.getByText('Edit').closest('.ts-action-wrap');
        expect(wrapper).toHaveClass('ts-popup-component');
    });

    it('renders edit_post as direct link when single edit step', () => {
        const contextWithSingleStep = {
            ...mockPostContext,
            editSteps: [
                { key: 'general', label: 'Edit post', link: 'http://example.com/post/123/edit' },
            ],
        };

        const props = {
            attributes: {
                ...mockAttributes,
                items: [{ ...DEFAULT_ACTION_ITEM, id: '1', actionType: 'edit_post' as const, text: 'Edit' }]
            },
            context: 'frontend' as const,
            postContext: contextWithSingleStep,
        };

        render(<AdvancedListComponent {...props} />);

        const editLink = screen.getByText('Edit').closest('a');
        expect(editLink).toBeInTheDocument();
        // Should be direct link, not popup trigger
        expect(editLink).toHaveAttribute('href', 'http://example.com/post/123/edit');
        expect(editLink).not.toHaveAttribute('role', 'button');
    });

    it('renders share_post with popup trigger and ts-share-post wrapper', () => {
        const props = {
            attributes: {
                ...mockAttributes,
                items: [{ ...DEFAULT_ACTION_ITEM, id: '1', actionType: 'share_post' as const, text: 'Share' }]
            },
            context: 'frontend' as const,
            postContext: mockPostContext,
        };

        render(<AdvancedListComponent {...props} />);

        const shareLink = screen.getByText('Share').closest('a');
        expect(shareLink).toBeInTheDocument();
        // Should have href=# for popup trigger (anchor elements don't need role=button)
        expect(shareLink).toHaveAttribute('href', '#');

        // Wrapper should have ts-share-post class
        const wrapper = screen.getByText('Share').closest('.ts-action-wrap');
        expect(wrapper).toHaveClass('ts-share-post');
    });

    it('opens share popup when share action is clicked', () => {
        const props = {
            attributes: {
                ...mockAttributes,
                items: [{ ...DEFAULT_ACTION_ITEM, id: '1', actionType: 'share_post' as const, text: 'Share' }]
            },
            context: 'frontend' as const,
            postContext: mockPostContext,
        };

        render(<AdvancedListComponent {...props} />);

        const shareLink = screen.getByText('Share').closest('a');
        expect(shareLink).toBeInTheDocument();

        // Click to open popup
        fireEvent.click(shareLink!);

        // Popup should be visible with share options
        expect(screen.getByText('Share post')).toBeInTheDocument();
        expect(screen.getByText('Facebook')).toBeInTheDocument();
        expect(screen.getByText('Twitter')).toBeInTheDocument();
        expect(screen.getByText('Copy link')).toBeInTheDocument();
    });

    it('opens edit steps popup when edit action with multiple steps is clicked', () => {
        const contextWithMultipleSteps = {
            ...mockPostContext,
            editSteps: [
                { key: 'general', label: 'General', link: 'http://example.com/edit?step=general' },
                { key: 'details', label: 'Details', link: 'http://example.com/edit?step=details' },
            ],
        };

        const props = {
            attributes: {
                ...mockAttributes,
                items: [{ ...DEFAULT_ACTION_ITEM, id: '1', actionType: 'edit_post' as const, text: 'Edit' }]
            },
            context: 'frontend' as const,
            postContext: contextWithMultipleSteps,
        };

        render(<AdvancedListComponent {...props} />);

        const editLink = screen.getByText('Edit').closest('a');
        expect(editLink).toBeInTheDocument();

        // Click to open popup
        fireEvent.click(editLink!);

        // Popup should be visible with edit steps
        expect(screen.getByText('General')).toBeInTheDocument();
        expect(screen.getByText('Details')).toBeInTheDocument();
    });
});
