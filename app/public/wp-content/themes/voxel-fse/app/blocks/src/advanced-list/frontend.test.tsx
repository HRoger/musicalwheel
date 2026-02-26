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
    timelineEnabled: true,
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

// ─────────────────────────────────────────────────────────────────
// Helper: create props for a single action item
// ─────────────────────────────────────────────────────────────────
function makeProps(
    overrides: Partial<typeof DEFAULT_ACTION_ITEM>,
    context: 'frontend' | 'editor' = 'frontend',
    postContext: PostContext | null = mockPostContext,
) {
    return {
        attributes: {
            ...mockAttributes,
            items: [{ ...DEFAULT_ACTION_ITEM, id: '1', ...overrides }],
        },
        context,
        postContext,
    };
}

// ═════════════════════════════════════════════════════════════════
//  1. NON-POST-DEPENDENT ACTIONS
// ═════════════════════════════════════════════════════════════════

describe('AdvancedListComponent — none', () => {
    it('renders as a div (no link) with text', () => {
        const props = makeProps({ actionType: 'none', text: 'Plain Action' }, 'frontend', null);
        render(<AdvancedListComponent {...props} />);
        const el = screen.getByText('Plain Action');
        expect(el).toBeInTheDocument();
        // Should NOT be a link
        expect(el.closest('a')).toBeNull();
    });

    it('renders icon when provided', () => {
        const props = makeProps({
            actionType: 'none',
            text: 'With Icon',
            icon: { value: 'las la-star', library: 'icon' },
        }, 'frontend', null);
        render(<AdvancedListComponent {...props} />);
        expect(screen.getByText('With Icon')).toBeInTheDocument();
        const icon = document.querySelector('i.las.la-star');
        expect(icon).toBeInTheDocument();
    });
});

describe('AdvancedListComponent — action_link', () => {
    it('renders as <a> with correct href, target, and rel', () => {
        const props = makeProps({
            actionType: 'action_link',
            text: 'Visit Website',
            link: { url: 'https://example.com', isExternal: true, nofollow: true },
        }, 'frontend', null);
        render(<AdvancedListComponent {...props} />);

        const link = screen.getByText('Visit Website').closest('a');
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', 'https://example.com');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'nofollow');
    });

    it('renders without target/rel when not external/nofollow', () => {
        const props = makeProps({
            actionType: 'action_link',
            text: 'Internal Link',
            link: { url: '/about', isExternal: false, nofollow: false },
        }, 'frontend', null);
        render(<AdvancedListComponent {...props} />);

        const link = screen.getByText('Internal Link').closest('a');
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/about');
        expect(link).not.toHaveAttribute('target');
        expect(link).not.toHaveAttribute('rel');
    });

    it('prevents navigation in editor context', () => {
        const props = makeProps({
            actionType: 'action_link',
            text: 'Editor Link',
            link: { url: 'https://external.com', isExternal: true, nofollow: false },
        }, 'editor', null);
        render(<AdvancedListComponent {...props} />);

        const link = screen.getByText('Editor Link').closest('a')!;
        const event = new MouseEvent('click', { bubbles: true, cancelable: true });
        Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
        link.dispatchEvent(event);
        expect(event.preventDefault).toHaveBeenCalled();
    });
});

describe('AdvancedListComponent — back_to_top', () => {
    it('renders as <a> with href="#" and calls scrollTo on click', () => {
        const scrollToSpy = vi.fn();
        window.scrollTo = scrollToSpy;

        const props = makeProps({ actionType: 'back_to_top', text: 'Back to Top' }, 'frontend', null);
        render(<AdvancedListComponent {...props} />);

        const link = screen.getByText('Back to Top').closest('a');
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '#');

        fireEvent.click(link!);
        expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });
});

describe('AdvancedListComponent — go_back', () => {
    it('renders as <a> with href="#" and calls history.back on frontend', () => {
        const props = makeProps({ actionType: 'go_back', text: 'Go Back' }, 'frontend', null);
        render(<AdvancedListComponent {...props} />);

        const link = screen.getByText('Go Back').closest('a');
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '#');

        fireEvent.click(link!);
        expect(window.history.back).toHaveBeenCalled();
    });

    it('does NOT call history.back in editor context', () => {
        const props = makeProps({ actionType: 'go_back', text: 'Go Back' }, 'editor', null);
        render(<AdvancedListComponent {...props} />);

        const link = screen.getByText('Go Back').closest('a');
        fireEvent.click(link!);
        expect(window.history.back).not.toHaveBeenCalled();
    });
});

describe('AdvancedListComponent — scroll_to_section', () => {
    it('renders as <a> with href="#" and scrolls to element on click', () => {
        // Create a target element in the DOM
        const target = document.createElement('div');
        target.id = 'my-section';
        target.scrollIntoView = vi.fn();
        document.body.appendChild(target);

        const props = makeProps({
            actionType: 'scroll_to_section',
            text: 'Go to Section',
            scrollToId: 'my-section',
        }, 'frontend', null);
        render(<AdvancedListComponent {...props} />);

        const link = screen.getByText('Go to Section').closest('a');
        expect(link).toHaveAttribute('href', '#');

        fireEvent.click(link!);
        expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });

        document.body.removeChild(target);
    });
});

// ═════════════════════════════════════════════════════════════════
//  2. POST-DEPENDENT: delete_post
// ═════════════════════════════════════════════════════════════════

describe('AdvancedListComponent — delete_post', () => {
    it('renders with data-confirm and vx-action attributes', () => {
        const props = makeProps({ actionType: 'delete_post', text: 'Delete Post' });
        render(<AdvancedListComponent {...props} />);

        const deleteLink = screen.getByText('Delete Post').closest('a');
        expect(deleteLink).toBeInTheDocument();
        expect(deleteLink).toHaveAttribute('href', expect.stringContaining('action=user.posts.delete_post'));
        expect(deleteLink).toHaveAttribute('href', expect.stringContaining('_wpnonce=nonce_delete'));
        expect(deleteLink).toHaveAttribute('data-confirm', 'Are you sure?');
        expect(deleteLink).toHaveAttribute('vx-action');
    });

    it('hides when permission denied', () => {
        const ctx = { ...mockPostContext, permissions: { delete: false, publish: false } };
        const props = makeProps({ actionType: 'delete_post', text: 'Delete Post' }, 'frontend', ctx);
        render(<AdvancedListComponent {...props} />);
        expect(screen.queryByText('Delete Post')).not.toBeInTheDocument();
    });

    it('prevents navigation in editor context', () => {
        const props = makeProps({ actionType: 'delete_post', text: 'Delete' }, 'editor');
        render(<AdvancedListComponent {...props} />);

        const link = screen.getByText('Delete').closest('a')!;
        const event = new MouseEvent('click', { bubbles: true, cancelable: true });
        Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
        link.dispatchEvent(event);
        expect(event.preventDefault).toHaveBeenCalled();
    });
});

// ═════════════════════════════════════════════════════════════════
//  3. POST-DEPENDENT: publish_post
// ═════════════════════════════════════════════════════════════════

describe('AdvancedListComponent — publish_post', () => {
    it('renders when post is unpublished and has publish permission', () => {
        const ctx = { ...mockPostContext, status: 'unpublished' };
        const props = makeProps({ actionType: 'publish_post', text: 'Publish' }, 'frontend', ctx);
        render(<AdvancedListComponent {...props} />);

        const link = screen.getByText('Publish').closest('a');
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', expect.stringContaining('action=user.posts.republish_post'));
        expect(link).toHaveAttribute('vx-action');
    });

    it('hides when post is already published', () => {
        const ctx = { ...mockPostContext, status: 'publish' };
        const props = makeProps({ actionType: 'publish_post', text: 'Publish' }, 'frontend', ctx);
        render(<AdvancedListComponent {...props} />);
        expect(screen.queryByText('Publish')).not.toBeInTheDocument();
    });

    it('hides when publish permission denied', () => {
        const ctx = { ...mockPostContext, status: 'unpublished', permissions: { delete: false, publish: false } };
        const props = makeProps({ actionType: 'publish_post', text: 'Publish' }, 'frontend', ctx);
        render(<AdvancedListComponent {...props} />);
        expect(screen.queryByText('Publish')).not.toBeInTheDocument();
    });
});

// ═════════════════════════════════════════════════════════════════
//  4. POST-DEPENDENT: unpublish_post
// ═════════════════════════════════════════════════════════════════

describe('AdvancedListComponent — unpublish_post', () => {
    it('renders when post is published and has publish permission', () => {
        const ctx = { ...mockPostContext, status: 'publish' };
        const props = makeProps({ actionType: 'unpublish_post', text: 'Unpublish' }, 'frontend', ctx);
        render(<AdvancedListComponent {...props} />);

        const link = screen.getByText('Unpublish').closest('a');
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', expect.stringContaining('action=user.posts.unpublish_post'));
        expect(link).toHaveAttribute('vx-action');
    });

    it('hides when post is already unpublished', () => {
        const ctx = { ...mockPostContext, status: 'unpublished' };
        const props = makeProps({ actionType: 'unpublish_post', text: 'Unpublish' }, 'frontend', ctx);
        render(<AdvancedListComponent {...props} />);
        expect(screen.queryByText('Unpublish')).not.toBeInTheDocument();
    });

    it('hides when publish permission denied', () => {
        const ctx = { ...mockPostContext, permissions: { delete: false, publish: false } };
        const props = makeProps({ actionType: 'unpublish_post', text: 'Unpublish' }, 'frontend', ctx);
        render(<AdvancedListComponent {...props} />);
        expect(screen.queryByText('Unpublish')).not.toBeInTheDocument();
    });
});

// ═════════════════════════════════════════════════════════════════
//  5. POST-DEPENDENT: view_post_stats
// ═════════════════════════════════════════════════════════════════

describe('AdvancedListComponent — view_post_stats', () => {
    it('renders with stats link when available', () => {
        const ctx = { ...mockPostContext, postStatsLink: 'http://example.com/stats/123' };
        const props = makeProps({ actionType: 'view_post_stats', text: 'View Stats' }, 'frontend', ctx);
        render(<AdvancedListComponent {...props} />);

        const link = screen.getByText('View Stats').closest('a');
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', 'http://example.com/stats/123');
        expect(link).toHaveAttribute('rel', 'nofollow');
    });

    it('hides when no stats link available', () => {
        const ctx = { ...mockPostContext, postStatsLink: null };
        const props = makeProps({ actionType: 'view_post_stats', text: 'View Stats' }, 'frontend', ctx);
        render(<AdvancedListComponent {...props} />);
        expect(screen.queryByText('View Stats')).not.toBeInTheDocument();
    });
});

// ═════════════════════════════════════════════════════════════════
//  6. POST-DEPENDENT: action_follow_post
// ═════════════════════════════════════════════════════════════════

describe('AdvancedListComponent — action_follow_post', () => {
    it('renders with ts-action-follow class', () => {
        const props = makeProps({ actionType: 'action_follow_post', text: 'Follow' });
        render(<AdvancedListComponent {...props} />);

        const link = screen.getByText('Follow').closest('a');
        expect(link).toBeInTheDocument();
        expect(link).toHaveClass('ts-action-follow');
        expect(link).toHaveAttribute('href', expect.stringContaining('action=user.follow_post'));
    });

    it('shows intermediate class when follow is pending', () => {
        const ctx = { ...mockPostContext, isFollowed: false, isFollowRequested: true };
        const props = makeProps({ actionType: 'action_follow_post', text: 'Follow' }, 'frontend', ctx);
        render(<AdvancedListComponent {...props} />);

        const link = screen.getByText('Follow').closest('a');
        expect(link).toHaveClass('intermediate');
        expect(link).not.toHaveClass('active');
    });

    it('shows active class when followed', () => {
        const ctx = { ...mockPostContext, isFollowed: true, isFollowRequested: false };
        const props = makeProps({ actionType: 'action_follow_post', text: 'Following' }, 'frontend', ctx);
        render(<AdvancedListComponent {...props} />);

        const link = screen.getByText('Following').closest('a');
        expect(link).toHaveClass('active');
        expect(link).not.toHaveClass('intermediate');
    });

    it('renders tooltip-inactive and tooltip-active attributes for follow', () => {
        const props = makeProps({
            actionType: 'action_follow_post',
            text: 'Follow',
            enableTooltip: true,
            tooltipText: 'Click to follow',
            activeEnableTooltip: true,
            activeTooltipText: 'Click to unfollow',
        });
        render(<AdvancedListComponent {...props} />);

        const listItem = screen.getByText('Follow').closest('li');
        expect(listItem).toHaveAttribute('tooltip-inactive', 'Click to follow');
        expect(listItem).toHaveAttribute('tooltip-active', 'Click to unfollow');
        expect(listItem).not.toHaveAttribute('data-tooltip');
    });

    it('renders dual-span active state (ts-initial + ts-reveal)', () => {
        const props = makeProps({
            actionType: 'action_follow_post',
            text: 'Follow',
            activeText: 'Unfollow',
        });
        render(<AdvancedListComponent {...props} />);

        const initial = document.querySelector('.ts-initial');
        const reveal = document.querySelector('.ts-reveal');
        expect(initial).toBeInTheDocument();
        expect(reveal).toBeInTheDocument();
        expect(initial).toHaveTextContent('Follow');
        expect(reveal).toHaveTextContent('Unfollow');
    });

    it('hides when timeline is disabled', () => {
        const ctx = { ...mockPostContext, timelineEnabled: false };
        const props = makeProps({ actionType: 'action_follow_post', text: 'Follow' }, 'frontend', ctx);
        render(<AdvancedListComponent {...props} />);
        expect(screen.queryByText('Follow')).not.toBeInTheDocument();
    });
});

// ═════════════════════════════════════════════════════════════════
//  7. POST-DEPENDENT: action_follow (post author)
// ═════════════════════════════════════════════════════════════════

describe('AdvancedListComponent — action_follow (author)', () => {
    it('renders with author follow URL', () => {
        const props = makeProps({ actionType: 'action_follow', text: 'Follow Author' });
        render(<AdvancedListComponent {...props} />);

        const link = screen.getByText('Follow Author').closest('a');
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', expect.stringContaining('action=user.follow_user'));
        expect(link).toHaveAttribute('href', expect.stringContaining('user_id=456'));
        expect(link).toHaveClass('ts-action-follow');
    });

    it('shows active class when author is followed', () => {
        const ctx = { ...mockPostContext, isAuthorFollowed: true };
        const props = makeProps({ actionType: 'action_follow', text: 'Following Author' }, 'frontend', ctx);
        render(<AdvancedListComponent {...props} />);

        const link = screen.getByText('Following Author').closest('a');
        expect(link).toHaveClass('active');
    });

    it('shows intermediate class when author follow is pending', () => {
        const ctx = { ...mockPostContext, isAuthorFollowRequested: true };
        const props = makeProps({ actionType: 'action_follow', text: 'Follow Author' }, 'frontend', ctx);
        render(<AdvancedListComponent {...props} />);

        const link = screen.getByText('Follow Author').closest('a');
        expect(link).toHaveClass('intermediate');
    });

    it('hides when author ID is null', () => {
        const ctx = { ...mockPostContext, authorId: null };
        const props = makeProps({ actionType: 'action_follow', text: 'Follow Author' }, 'frontend', ctx);
        render(<AdvancedListComponent {...props} />);
        expect(screen.queryByText('Follow Author')).not.toBeInTheDocument();
    });

    it('hides when timeline is disabled', () => {
        const ctx = { ...mockPostContext, timelineEnabled: false };
        const props = makeProps({ actionType: 'action_follow', text: 'Follow Author' }, 'frontend', ctx);
        render(<AdvancedListComponent {...props} />);
        expect(screen.queryByText('Follow Author')).not.toBeInTheDocument();
    });
});

// ═════════════════════════════════════════════════════════════════
//  8. POST-DEPENDENT: show_post_on_map
// ═════════════════════════════════════════════════════════════════

describe('AdvancedListComponent — show_post_on_map', () => {
    it('renders with map link when location exists', () => {
        const ctx = {
            ...mockPostContext,
            location: {
                latitude: 40.7128,
                longitude: -74.0060,
                address: 'New York, NY',
                mapLink: 'http://example.com/places?location=New+York',
            },
        };
        const props = makeProps({ actionType: 'show_post_on_map', text: 'Show on Map' }, 'frontend', ctx);
        render(<AdvancedListComponent {...props} />);

        const link = screen.getByText('Show on Map').closest('a');
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', 'http://example.com/places?location=New+York');
        expect(link).toHaveClass('ts-action-show-on-map');
    });

    it('hides when no location data', () => {
        const props = makeProps({ actionType: 'show_post_on_map', text: 'Show on Map' });
        render(<AdvancedListComponent {...props} />);
        expect(screen.queryByText('Show on Map')).not.toBeInTheDocument();
    });
});

// ═════════════════════════════════════════════════════════════════
//  9. POST-DEPENDENT: promote_post
// ═════════════════════════════════════════════════════════════════

describe('AdvancedListComponent — promote_post', () => {
    it('renders promote link when promotable', () => {
        const ctx = {
            ...mockPostContext,
            promote: { isPromotable: true, isActive: false, promoteLink: 'http://example.com/promote/123' },
        };
        const props = makeProps({ actionType: 'promote_post', text: 'Promote' }, 'frontend', ctx);
        render(<AdvancedListComponent {...props} />);

        const link = screen.getByText('Promote').closest('a');
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', 'http://example.com/promote/123');
    });

    it('renders with active class and order link when promotion is active', () => {
        const ctx = {
            ...mockPostContext,
            promote: { isPromotable: true, isActive: true, orderLink: 'http://example.com/orders/123' },
        };
        const props = makeProps({ actionType: 'promote_post', text: 'View Promotion' }, 'frontend', ctx);
        render(<AdvancedListComponent {...props} />);

        const link = screen.getByText('View Promotion').closest('a');
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', 'http://example.com/orders/123');
        expect(link).toHaveClass('active');
    });

    it('hides when not promotable', () => {
        const props = makeProps({ actionType: 'promote_post', text: 'Promote' });
        render(<AdvancedListComponent {...props} />);
        expect(screen.queryByText('Promote')).not.toBeInTheDocument();
    });
});

// ═════════════════════════════════════════════════════════════════
// 10. POST-DEPENDENT: edit_post
// ═════════════════════════════════════════════════════════════════

describe('AdvancedListComponent — edit_post', () => {
    it('renders as direct link when single edit step', () => {
        const ctx = {
            ...mockPostContext,
            editSteps: [{ key: 'general', label: 'Edit post', link: 'http://example.com/post/123/edit' }],
        };
        const props = makeProps({ actionType: 'edit_post', text: 'Edit' }, 'frontend', ctx);
        render(<AdvancedListComponent {...props} />);

        const link = screen.getByText('Edit').closest('a');
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', 'http://example.com/post/123/edit');
    });

    it('renders as popup trigger when multiple edit steps', () => {
        const ctx = {
            ...mockPostContext,
            editSteps: [
                { key: 'general', label: 'General', link: 'http://example.com/edit?step=general' },
                { key: 'details', label: 'Details', link: 'http://example.com/edit?step=details' },
                { key: 'media', label: 'Media', link: 'http://example.com/edit?step=media' },
            ],
        };
        const props = makeProps({ actionType: 'edit_post', text: 'Edit' }, 'frontend', ctx);
        render(<AdvancedListComponent {...props} />);

        const link = screen.getByText('Edit').closest('a');
        expect(link).toHaveAttribute('href', '#');

        const wrapper = screen.getByText('Edit').closest('.ts-action-wrap');
        expect(wrapper).toHaveClass('ts-popup-component');
    });

    it('opens popup with edit steps when clicked', () => {
        const ctx = {
            ...mockPostContext,
            editSteps: [
                { key: 'general', label: 'General', link: 'http://example.com/edit?step=general' },
                { key: 'details', label: 'Details', link: 'http://example.com/edit?step=details' },
            ],
        };
        const props = makeProps({ actionType: 'edit_post', text: 'Edit' }, 'frontend', ctx);
        render(<AdvancedListComponent {...props} />);

        fireEvent.click(screen.getByText('Edit').closest('a')!);
        expect(screen.getByText('General')).toBeInTheDocument();
        expect(screen.getByText('Details')).toBeInTheDocument();
    });

    it('hides when post is not editable', () => {
        const ctx = { ...mockPostContext, isEditable: false };
        const props = makeProps({ actionType: 'edit_post', text: 'Edit' }, 'frontend', ctx);
        render(<AdvancedListComponent {...props} />);
        expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    });

    it('prevents navigation in editor for single-step edit', () => {
        const ctx = {
            ...mockPostContext,
            editSteps: [{ key: 'general', label: 'Edit', link: 'http://example.com/edit' }],
        };
        const props = makeProps({ actionType: 'edit_post', text: 'Edit' }, 'editor', ctx);
        render(<AdvancedListComponent {...props} />);

        const link = screen.getByText('Edit').closest('a')!;
        const event = new MouseEvent('click', { bubbles: true, cancelable: true });
        Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
        link.dispatchEvent(event);
        expect(event.preventDefault).toHaveBeenCalled();
    });
});

// ═════════════════════════════════════════════════════════════════
// 11. POST-DEPENDENT: share_post
// ═════════════════════════════════════════════════════════════════

describe('AdvancedListComponent — share_post', () => {
    it('renders with popup trigger and ts-share-post wrapper', () => {
        const props = makeProps({ actionType: 'share_post', text: 'Share' });
        render(<AdvancedListComponent {...props} />);

        const link = screen.getByText('Share').closest('a');
        expect(link).toHaveAttribute('href', '#');

        const wrapper = screen.getByText('Share').closest('.ts-action-wrap');
        expect(wrapper).toHaveClass('ts-share-post');
    });

    it('opens share popup with social options on click', () => {
        const props = makeProps({ actionType: 'share_post', text: 'Share' });
        render(<AdvancedListComponent {...props} />);

        fireEvent.click(screen.getByText('Share').closest('a')!);
        expect(screen.getByText('Share post')).toBeInTheDocument();
        expect(screen.getByText('Facebook')).toBeInTheDocument();
        expect(screen.getByText('Twitter')).toBeInTheDocument();
        expect(screen.getByText('Copy link')).toBeInTheDocument();
    });
});

// ═════════════════════════════════════════════════════════════════
// 12. POST-DEPENDENT: add_to_cart
// ═════════════════════════════════════════════════════════════════

describe('AdvancedListComponent — add_to_cart', () => {
    it('renders oneClick variant with product data attribute', () => {
        const ctx = {
            ...mockPostContext,
            product: { isEnabled: true, oneClick: true, productId: 999 },
        };
        const props = makeProps({ actionType: 'add_to_cart', text: 'Add to Cart' }, 'frontend', ctx);
        render(<AdvancedListComponent {...props} />);

        const link = screen.getByText('Add to Cart').closest('a');
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('data-product-id', '999');
    });

    it('renders select-options variant linking to post', () => {
        const ctx = {
            ...mockPostContext,
            product: { isEnabled: true, oneClick: false, productId: 999 },
        };
        const props = makeProps({
            actionType: 'add_to_cart',
            text: 'Add to Cart',
            cartOptsText: 'Select options',
            cartOptsIcon: { value: 'las la-shopping-bag', library: 'icon' },
        }, 'frontend', ctx);
        render(<AdvancedListComponent {...props} />);

        // Select options variant uses cartOptsText
        const link = screen.getByText('Select options').closest('a');
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', 'http://example.com/post/123');
    });

    it('hides when product is not enabled', () => {
        const ctx = {
            ...mockPostContext,
            product: { isEnabled: false, oneClick: false, productId: 999 },
        };
        const props = makeProps({ actionType: 'add_to_cart', text: 'Add to Cart' }, 'frontend', ctx);
        render(<AdvancedListComponent {...props} />);
        expect(screen.queryByText('Add to Cart')).not.toBeInTheDocument();
    });

    it('hides when product is null', () => {
        const props = makeProps({ actionType: 'add_to_cart', text: 'Add to Cart' });
        render(<AdvancedListComponent {...props} />);
        expect(screen.queryByText('Add to Cart')).not.toBeInTheDocument();
    });
});

// ═════════════════════════════════════════════════════════════════
// 13. POST-DEPENDENT: select_addition
// ═════════════════════════════════════════════════════════════════

describe('AdvancedListComponent — select_addition', () => {
    it('renders with ts-use-addition class and data-id', () => {
        const props = makeProps({
            actionType: 'select_addition',
            text: 'Extra Parking',
            additionId: 'addon_42',
        });
        render(<AdvancedListComponent {...props} />);

        const link = screen.getByText('Extra Parking').closest('a');
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '#');
        expect(link).toHaveClass('ts-use-addition');
        expect(link).toHaveAttribute('data-id', 'addon_42');
    });

    it('renders dual-span active state (ts-initial + ts-reveal)', () => {
        const props = makeProps({
            actionType: 'select_addition',
            text: 'Add Extra',
            activeText: 'Remove Extra',
            additionId: 'addon_1',
        });
        render(<AdvancedListComponent {...props} />);

        const initial = document.querySelector('.ts-initial');
        const reveal = document.querySelector('.ts-reveal');
        expect(initial).toBeInTheDocument();
        expect(reveal).toBeInTheDocument();
        expect(initial).toHaveTextContent('Add Extra');
        expect(reveal).toHaveTextContent('Remove Extra');
    });

    it('renders tooltip with data-tooltip and data-tooltip-default for select_addition', () => {
        const props = makeProps({
            actionType: 'select_addition',
            text: 'Add Extra',
            additionId: 'addon_1',
            enableTooltip: true,
            tooltipText: 'Click to add',
            activeEnableTooltip: true,
            activeTooltipText: 'Click to remove',
        });
        render(<AdvancedListComponent {...props} />);

        const listItem = screen.getByText('Add Extra').closest('li');
        expect(listItem).toHaveAttribute('data-tooltip', 'Click to add');
        expect(listItem).toHaveAttribute('data-tooltip-default', 'Click to add');
        expect(listItem).toHaveAttribute('data-tooltip-active', 'Click to remove');
    });
});

// ═════════════════════════════════════════════════════════════════
// 14. POST-DEPENDENT: action_gcal
// ═════════════════════════════════════════════════════════════════

describe('AdvancedListComponent — action_gcal', () => {
    it('renders Google Calendar link with correct URL', () => {
        const props = makeProps({
            actionType: 'action_gcal',
            text: 'Add to Google Calendar',
            calStartDate: '2026-03-15T10:00:00',
            calEndDate: '2026-03-15T12:00:00',
            calTitle: 'Music Festival',
            calDescription: 'A great event',
            calLocation: 'Central Park',
        });
        render(<AdvancedListComponent {...props} />);

        const link = screen.getByText('Add to Google Calendar').closest('a');
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', expect.stringContaining('calendar.google.com'));
        expect(link).toHaveAttribute('href', expect.stringContaining('Music+Festival'));
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'nofollow');
    });

    it('renders as div when no start date provided', () => {
        const props = makeProps({
            actionType: 'action_gcal',
            text: 'Add to GCal',
            calStartDate: '',
            calTitle: 'Test',
        });
        render(<AdvancedListComponent {...props} />);

        // Should still render but as div (not <a>)
        const text = screen.getByText('Add to GCal');
        expect(text.closest('a')).toBeNull();
    });
});

// ═════════════════════════════════════════════════════════════════
// 15. POST-DEPENDENT: action_ical
// ═════════════════════════════════════════════════════════════════

describe('AdvancedListComponent — action_ical', () => {
    it('renders iCalendar download link with data URL', () => {
        const props = makeProps({
            actionType: 'action_ical',
            text: 'Add to iCal',
            calStartDate: '2026-03-15T10:00:00',
            calEndDate: '2026-03-15T12:00:00',
            calTitle: 'Music Festival',
            calDescription: 'A great event',
            calLocation: 'Central Park',
            calUrl: 'http://example.com/event',
        });
        render(<AdvancedListComponent {...props} />);

        const link = screen.getByText('Add to iCal').closest('a');
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', expect.stringContaining('data:text/calendar;base64,'));
        expect(link).toHaveAttribute('download', expect.stringContaining('.ics'));
        expect(link).toHaveAttribute('rel', 'nofollow');
    });

    it('renders as div when no start date provided', () => {
        const props = makeProps({
            actionType: 'action_ical',
            text: 'Add to iCal',
            calStartDate: '',
            calTitle: 'Test',
        });
        render(<AdvancedListComponent {...props} />);

        const text = screen.getByText('Add to iCal');
        expect(text.closest('a')).toBeNull();
    });
});

// ═════════════════════════════════════════════════════════════════
// 16. EDITOR CONTEXT: Navigation prevention for all navigating types
// ═════════════════════════════════════════════════════════════════

describe('AdvancedListComponent — editor navigation prevention', () => {
    const testEditorPreventsNavigation = (
        actionType: string,
        text: string,
        overrides: Partial<typeof DEFAULT_ACTION_ITEM> = {},
        postCtx: PostContext | null = mockPostContext,
    ) => {
        it(`prevents navigation for ${actionType} in editor`, () => {
            const props = makeProps(
                { actionType: actionType as any, text, ...overrides },
                'editor',
                postCtx,
            );
            render(<AdvancedListComponent {...props} />);

            const link = screen.getByText(text).closest('a');
            if (!link) {
                // Some actions render as <div> in editor; that's fine — no link = no navigation
                return;
            }
            const event = new MouseEvent('click', { bubbles: true, cancelable: true });
            Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
            link.dispatchEvent(event);
            expect(event.preventDefault).toHaveBeenCalled();
        });
    };

    testEditorPreventsNavigation('action_link', 'Link', {
        link: { url: 'https://external.com', isExternal: true, nofollow: false },
    }, null);

    testEditorPreventsNavigation('delete_post', 'Delete');

    testEditorPreventsNavigation('publish_post', 'Publish', {}, {
        ...mockPostContext,
        status: 'unpublished',
    });

    testEditorPreventsNavigation('unpublish_post', 'Unpublish');

    testEditorPreventsNavigation('action_follow_post', 'Follow Post');

    testEditorPreventsNavigation('action_follow', 'Follow Author');

    testEditorPreventsNavigation('view_post_stats', 'View Stats', {}, {
        ...mockPostContext,
        postStatsLink: 'http://example.com/stats',
    });

    testEditorPreventsNavigation('show_post_on_map', 'Show Map', {}, {
        ...mockPostContext,
        location: { latitude: 0, longitude: 0, address: '', mapLink: 'http://example.com/map' },
    });

    testEditorPreventsNavigation('promote_post', 'Promote', {}, {
        ...mockPostContext,
        promote: { isPromotable: true, isActive: false, promoteLink: 'http://example.com/promote' },
    });

    testEditorPreventsNavigation('action_gcal', 'GCal', {
        calStartDate: '2026-03-15T10:00:00',
        calTitle: 'Test Event',
    });

    testEditorPreventsNavigation('action_ical', 'iCal', {
        calStartDate: '2026-03-15T10:00:00',
        calTitle: 'Test Event',
    });

    testEditorPreventsNavigation('edit_post', 'Edit Post', {}, {
        ...mockPostContext,
        editSteps: [{ key: 'general', label: 'Edit', link: 'http://example.com/edit' }],
    });

    it('go_back does NOT call history.back in editor', () => {
        const props = makeProps({ actionType: 'go_back', text: 'Go Back' }, 'editor', null);
        render(<AdvancedListComponent {...props} />);
        fireEvent.click(screen.getByText('Go Back').closest('a')!);
        expect(window.history.back).not.toHaveBeenCalled();
    });

    it('back_to_top still calls scrollTo in editor (safe operation)', () => {
        const scrollToSpy = vi.fn();
        window.scrollTo = scrollToSpy;

        const props = makeProps({ actionType: 'back_to_top', text: 'Top' }, 'editor', null);
        render(<AdvancedListComponent {...props} />);
        fireEvent.click(screen.getByText('Top').closest('a')!);
        expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });
});

// ═════════════════════════════════════════════════════════════════
// 17. FRONTEND: Hidden when no postContext for post-dependent actions
// ═════════════════════════════════════════════════════════════════

describe('AdvancedListComponent — post-dependent actions without context', () => {
    const postDependentTypes = [
        'delete_post', 'publish_post', 'unpublish_post', 'edit_post',
        'share_post', 'action_follow_post', 'action_follow',
        'show_post_on_map', 'view_post_stats', 'add_to_cart', 'promote_post',
    ] as const;

    postDependentTypes.forEach((actionType) => {
        it(`hides ${actionType} on frontend when no postContext`, () => {
            const props = makeProps({ actionType, text: `Test ${actionType}` }, 'frontend', null);
            render(<AdvancedListComponent {...props} />);
            expect(screen.queryByText(`Test ${actionType}`)).not.toBeInTheDocument();
        });
    });
});

// ═════════════════════════════════════════════════════════════════
// 18. GENERAL: Tooltip attributes
// ═════════════════════════════════════════════════════════════════

describe('AdvancedListComponent — tooltips', () => {
    it('renders data-tooltip for regular (non-follow) actions', () => {
        const props = makeProps({
            actionType: 'none',
            text: 'Hover Me',
            enableTooltip: true,
            tooltipText: 'Hello!',
        }, 'frontend', null);
        render(<AdvancedListComponent {...props} />);

        const listItem = screen.getByText('Hover Me').closest('li');
        expect(listItem).toHaveAttribute('data-tooltip', 'Hello!');
    });

    it('renders cart tooltip for select-options add_to_cart', () => {
        const ctx = {
            ...mockPostContext,
            product: { isEnabled: true, oneClick: false, productId: 999 },
        };
        const props = makeProps({
            actionType: 'add_to_cart',
            text: 'Add',
            cartOptsText: 'Select Options',
            cartOptsEnableTooltip: true,
            cartOptsTooltipText: 'Choose your options',
        }, 'frontend', ctx);
        render(<AdvancedListComponent {...props} />);

        const listItem = screen.getByText('Select Options').closest('li');
        expect(listItem).toHaveAttribute('data-tooltip', 'Choose your options');
    });
});

// ═════════════════════════════════════════════════════════════════
// 19. GENERAL: List structure
// ═════════════════════════════════════════════════════════════════

describe('AdvancedListComponent — list structure', () => {
    it('renders <ul> with correct Voxel classes', () => {
        const props = makeProps({ actionType: 'none', text: 'Test' }, 'frontend', null);
        const { container } = render(<AdvancedListComponent {...props} />);

        const ul = container.querySelector('ul');
        expect(ul).toHaveClass('flexify');
        expect(ul).toHaveClass('simplify-ul');
        expect(ul).toHaveClass('ts-advanced-list');
    });

    it('renders <li> items with correct classes', () => {
        const props = makeProps({ actionType: 'none', text: 'Test' }, 'frontend', null);
        render(<AdvancedListComponent {...props} />);

        const li = screen.getByText('Test').closest('li');
        expect(li).toHaveClass('flexify');
        expect(li).toHaveClass('ts-action');
        expect(li?.className).toContain('vxfse-repeater-item-1');
    });

    it('renders vxconfig script tag', () => {
        const props = makeProps({ actionType: 'none', text: 'Test' }, 'frontend', null);
        const { container } = render(<AdvancedListComponent {...props} />);

        const script = container.querySelector('script.vxconfig');
        expect(script).toBeInTheDocument();
        expect(script).toHaveAttribute('type', 'text/json');
    });

    it('renders empty state when no items', () => {
        const props = {
            attributes: { ...mockAttributes, items: [] },
            context: 'frontend' as const,
            postContext: null,
        };
        const { container } = render(<AdvancedListComponent {...props} />);

        const ul = container.querySelector('ul');
        expect(ul).toHaveClass('voxel-fse-empty');
    });
});

// ═════════════════════════════════════════════════════════════════
// 20. DEFAULT (unrecognized action types)
// ═════════════════════════════════════════════════════════════════

describe('AdvancedListComponent — default/unrecognized types', () => {
    it('renders as div for unrecognized action types', () => {
        const props = makeProps({
            actionType: 'direct_message' as any,
            text: 'Message',
        });
        render(<AdvancedListComponent {...props} />);

        const text = screen.getByText('Message');
        expect(text.closest('a')).toBeNull();
        expect(text.closest('div')).toBeInTheDocument();
    });
});
