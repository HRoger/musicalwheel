/**
 * Timeline Shared Components - Index
 *
 * Exports all shared React components for the Timeline block.
 * These components are used in BOTH the Gutenberg editor AND the frontend.
 *
 * @package VoxelFSE
 */

// Main Timeline Component
export { Timeline } from './Timeline';

// Status Components
export { StatusComposer } from './StatusComposer';
export { StatusFeed, type StatusFeedHandle } from './StatusFeed';
export { StatusItem } from './StatusItem';
export { StatusActions } from './StatusActions';

// Comment Components
export { CommentFeed } from './CommentFeed';
export { CommentItem } from './CommentItem';
export { CommentComposer } from './CommentComposer';

// UI Components
export { FeedFilters } from './FeedFilters';
export { DropdownList } from './DropdownList';
export { RichTextFormatter, SimpleRichText } from './RichTextFormatter';
export { MediaGallery } from './MediaGallery';
export { LinkPreview } from './LinkPreview';
export { QuotedStatus } from './QuotedStatus';
export { QuoteComposer } from './QuoteComposer';
export { ReviewScore } from './ReviewScore';
export { EmojiPicker } from './EmojiPicker';
export { MentionsAutocomplete } from './MentionsAutocomplete';

// Legacy Preview (for backward compatibility)
export { TimelinePreview } from './TimelinePreview';
