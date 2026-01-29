# Timeline Block - Testing & Integration Guide

**Status**: ✅ Code Complete | ✅ Built | ⏳ Testing Required  
**Date**: November 5, 2025

---

## Integration Completed ✅

### 1. Files Created
- [x] `src/blocks/timeline/block.json` (47 lines)
- [x] `src/blocks/timeline/index.js` (18 lines)
- [x] `src/blocks/timeline/edit.js` (125 lines)
- [x] `src/blocks/timeline/render.php` (123 lines)
- [x] `src/blocks/timeline/style.scss` (201 lines)
- [x] `src/blocks/timeline/editor.scss` (104 lines)
- [x] `app/blocks/src/timeline/Timeline_Block.php` (133 lines)
- [x] `app/graphql/register-timeline-types.php` (252 lines)

### 2. Infrastructure Loaded
- [x] `functions.php` updated with block infrastructure
- [x] `Base_Block.php` loaded
- [x] `Block_Loader.php` loaded
- [x] `GraphQL_Helper.php` loaded
- [x] Timeline GraphQL types registered
- [x] Timeline block initialized on 'init' hook

### 3. Build Process
- [x] Assets compiled successfully with Vite
- [x] Bundle created: `assets/dist/js/blocks/timeline/index-DED6DiUU.js` (1.78 MB)
- [x] Manifest updated: `assets/dist/.vite/manifest.json`

---

## Testing Checklist

### Phase 1: WordPress Admin - Block Editor ⏳

**Access**: WordPress Admin → Pages/Posts → Add New

#### Test 1.1: Block Appears in Editor
- [ ] Open block inserter (+ button)
- [ ] Search for "Timeline" or browse "MusicalWheel Social" category
- [ ] Verify Timeline block appears in list
- [ ] Insert block into editor

**Expected**: Block inserts without errors

#### Test 1.2: Inspector Controls Work
- [ ] Click on Timeline block
- [ ] Open Settings panel (right sidebar)
- [ ] Verify 5 controls appear:
  - [ ] Feed Type selector (6 options)
  - [ ] Order By selector (4 options)
  - [ ] Posts Per Page slider (5-50)
  - [ ] Show Composer toggle
  - [ ] Enable Search toggle
- [ ] Change each setting
- [ ] Verify preview updates

**Expected**: All controls functional, preview updates live

#### Test 1.3: Block Preview Renders
- [ ] Verify preview shows:
  - [ ] Feed type badge
  - [ ] Order by badge
  - [ ] Posts per page badge
  - [ ] Mock status card
  - [ ] Composer preview (if enabled)
  - [ ] Search input preview (if enabled)

**Expected**: Preview matches settings, no console errors

#### Test 1.4: Block Saves
- [ ] Configure block settings
- [ ] Click "Save Draft" or "Publish"
- [ ] Reload page
- [ ] Verify settings persisted

**Expected**: Settings saved correctly

---

### Phase 2: Frontend Rendering ⏳

**Access**: View published page/post on frontend

#### Test 2.1: Block Renders on Frontend
- [ ] Navigate to published page with Timeline block
- [ ] Verify Timeline block appears
- [ ] Check browser console for errors

**Expected**: Block renders without JavaScript errors

#### Test 2.2: GraphQL Query Executes
- [ ] Check if statuses appear (if data exists)
- [ ] Verify "No statuses found" message (if no data)
- [ ] Open browser DevTools → Network tab
- [ ] Look for GraphQL request to `/graphql`

**Expected**: GraphQL query executes (may return empty if no data)

#### Test 2.3: Status Composer Appears (if enabled)
- [ ] Verify composer section shows:
  - [ ] User avatar
  - [ ] Textarea with placeholder "What's on your mind?"
  - [ ] Emoji button
  - [ ] Image upload button
  - [ ] Submit button
- [ ] Check if "Login required" message shows (if not logged in)

**Expected**: Composer UI renders correctly based on login state

#### Test 2.4: Styles Applied
- [ ] Verify Timeline block styling:
  - [ ] Max-width 800px
  - [ ] Cards have shadows and rounded corners
  - [ ] Buttons have hover states
  - [ ] Layout is responsive
- [ ] Test on mobile viewport
- [ ] Test on tablet viewport

**Expected**: All styles applied, responsive design works

---

### Phase 3: GraphQL Endpoint ⏳

**Tool**: cURL, Postman, or GraphiQL IDE

#### Test 3.1: GraphQL Endpoint Accessible
```bash
curl -X POST http://musicalwheel.local/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __type(name: \"TimelineStatus\") { name } }"}'
```

**Expected**: Returns TimelineStatus type definition

#### Test 3.2: Query Works
```bash
curl -X POST http://musicalwheel.local/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { timelineStatuses(feed: GLOBAL_FEED, orderBy: LATEST, first: 10) { id content author { name } likeCount replyCount createdAt } }"
  }'
```

**Expected**: Returns data or empty array (no errors)

#### Test 3.3: Enum Types Work
```bash
curl -X POST http://musicalwheel.local/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ __type(name: \"TimelineFeedType\") { enumValues { name } } }"
  }'
```

**Expected**: Returns 6 feed types (USER_FEED, GLOBAL_FEED, POST_TIMELINE, POST_WALL, POST_REVIEWS, AUTHOR_TIMELINE)

---

### Phase 4: Functionality Testing ⏳

**Prerequisites**: Need sample Timeline Status data in WordPress

#### Test 4.1: Feed Type Filtering
- [ ] Create page with Timeline block
- [ ] Set Feed Type to "Global Feed"
- [ ] Verify shows global statuses
- [ ] Change to "User Feed"
- [ ] Verify shows user-specific statuses

**Expected**: Different feed types show different content

#### Test 4.2: Order By Sorting
- [ ] Set Order By to "Latest"
- [ ] Verify newest statuses appear first
- [ ] Change to "Most Liked"
- [ ] Verify statuses sorted by like count

**Expected**: Sorting works correctly

#### Test 4.3: Pagination
- [ ] Set Posts Per Page to 5
- [ ] Create more than 5 test statuses
- [ ] Verify only 5 show initially
- [ ] Click "Load More" button
- [ ] Verify next 5 load

**Expected**: Pagination works, more statuses load

#### Test 4.4: Like/Reply Actions
- [ ] Click like button on a status
- [ ] Verify like count increments
- [ ] Click unlike (if implemented)
- [ ] Verify like count decrements
- [ ] Click reply button
- [ ] Verify reply form appears

**Expected**: Actions trigger correctly (may not persist if backend incomplete)

#### Test 4.5: Status Composer
- [ ] Login as a user
- [ ] Type in composer textarea
- [ ] Click emoji button (if implemented)
- [ ] Click image upload (if implemented)
- [ ] Click submit
- [ ] Verify status creates

**Expected**: Composer allows status creation (may fail if mutation incomplete)

---

## Known Limitations

### Data Requirements
- Timeline block requires Timeline Status custom post type or data source
- WPGraphQL must be active and configured
- May need to create sample data for testing

### Incomplete Features
The following features are UI-only and need backend implementation:
1. **Status Composer**: 
   - Creates UI but mutation may not persist data
   - Need `createTimelineStatus` mutation implementation
   
2. **Like/Reply Actions**:
   - Buttons render but may not persist
   - Need `likeTimelineStatus` mutation implementation
   
3. **Search Input**:
   - Renders but doesn't filter results yet
   - Need search parameter implementation in GraphQL query
   
4. **Load More Pagination**:
   - Button renders but needs cursor-based pagination
   - Need to implement `after` cursor in GraphQL

---

## Troubleshooting

### Issue: Block Doesn't Appear in Editor

**Possible Causes**:
1. JavaScript not compiled
2. Block not registered
3. PHP class not loaded

**Solutions**:
```bash
# Rebuild assets
cmd /c npm run build

# Check for PHP errors
# Enable WP_DEBUG in wp-config.php
```

### Issue: "Call to undefined method get_instance()"

**Error**: `Call to undefined method MusicalWheel\Blocks\Block_Loader::get_instance()`

**Cause**: Block_Loader uses static `init()` method, not singleton pattern

**Solution**: Already fixed in functions.php. Block_Loader::init() is called automatically when the file is loaded (line 150 of Block_Loader.php)

### Issue: GraphQL Queries Fail

**Possible Causes**:
1. WPGraphQL plugin not active
2. GraphQL types not registered
3. Timeline custom post type missing

**Solutions**:
```php
// Check if WPGraphQL is active
if ( ! class_exists( 'WPGraphQL' ) ) {
    // Install and activate WPGraphQL plugin
}

// Verify Timeline types registered
// Check: GraphiQL IDE → Docs → Types → TimelineStatus
```

### Issue: Styles Not Applied

**Possible Causes**:
1. CSS not compiled
2. Style handle not enqueued
3. Theme cache

**Solutions**:
```bash
# Rebuild with styles
cmd /c npm run build

# Clear WordPress cache (if using caching plugin)

# Check browser DevTools → Network → CSS files loaded
```

### Issue: Console Errors

**Common Errors**:
```javascript
// "wp.blockEditor is undefined"
// Solution: Ensure @wordpress/block-editor is in dependencies

// "React is not defined"
// Solution: Import React in edit.js

// "Unexpected token"
// Solution: Rebuild with npm run build
```

---

## Performance Notes

### Bundle Size Warning
- Timeline block bundle: **1.78 MB** (large!)
- Includes entire React + WordPress block editor libraries
- Consider code splitting for production

### Optimization Recommendations
1. **Code Splitting**: Use dynamic imports for heavy components
2. **Tree Shaking**: Ensure Vite tree-shaking is enabled
3. **Lazy Loading**: Load components on interaction
4. **Caching**: GraphQL queries cached for 5 minutes

### Current Caching Strategy
- GraphQL queries: 5-minute transient cache
- Cache key: `md5(query_string + variables)`
- Cache cleared on status creation/update (when implemented)

---

## Next Steps After Testing

### If Testing Passes ✅
1. Mark Timeline block as production-ready
2. Deploy to staging environment
3. Begin Search Form block implementation

### If Issues Found 🔴
1. Document specific errors
2. Check WordPress error logs
3. Verify all dependencies installed:
   - WPGraphQL plugin
   - PHP 7.4+
   - Node.js 18+
   - React 18+

### Data Creation (if needed)
If no Timeline Status data exists:

**Option 1**: Create Custom Post Type
```php
// In functions.php or plugin
register_post_type('timeline_status', [
    'public' => true,
    'show_in_graphql' => true,
    'graphql_single_name' => 'timelineStatus',
    'graphql_plural_name' => 'timelineStatuses',
    'supports' => ['title', 'editor', 'author'],
]);
```

**Option 2**: Create Sample Data
- Use WordPress Admin → Posts → Add New
- Create 10-15 sample statuses
- Assign to different authors
- Add likes/comments manually

**Option 3**: Import Test Data
- Create WP-CLI script to generate test data
- Use Faker library for realistic content

---

## Success Criteria

### Minimum Viable Test ✅
- [ ] Block appears in editor
- [ ] Block renders on frontend
- [ ] No JavaScript console errors
- [ ] No PHP fatal errors
- [ ] GraphQL query executes (even if returns empty)

### Full Functionality Test ✅
- [ ] All inspector controls work
- [ ] Statuses display correctly
- [ ] Filtering by feed type works
- [ ] Sorting by order works
- [ ] Pagination works
- [ ] Styles applied correctly
- [ ] Responsive on mobile
- [ ] Like/reply buttons functional (if backend ready)
- [ ] Status composer works (if backend ready)

### Production Ready ✅
- [ ] Minimum viable test passed
- [ ] Full functionality test passed
- [ ] Performance acceptable (<3s page load)
- [ ] Accessibility audit passed (WCAG 2.1 AA)
- [ ] Security audit passed (XSS, CSRF, SQL injection)
- [ ] Browser compatibility tested (Chrome, Firefox, Safari, Edge)
- [ ] Documentation complete

---

## Quick Test Commands

### Start Local by Flywheel Site
```bash
# Start Local by Flywheel app
# Click "Start" on musicalwheel site
# Access: http://musicalwheel.local/wp-admin
```

### Test GraphQL Endpoint
```bash
# Test if WPGraphQL is working
curl http://musicalwheel.local/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{posts{nodes{title}}}"}'
```

### Check WordPress Error Log
```bash
# Location varies by server
# Local by Flywheel: app/logs/php-error.log
tail -f "C:\Users\Local Sites\musicalwheel\logs\php\error.log"
```

### Rebuild Assets
```bash
cd "C:\Users\Local Sites\musicalwheel\app\public\wp-content\themes\musicalwheel-fse"
cmd /c npm run build
```

---

## Contact & Support

**Documentation**: See `docs/` folder for complete guides
- `TODAY_COMPLETION_STATUS.md` - Full project status
- `PHASE_0_FOUNDATION_COMPLETE.md` - Infrastructure guide
- `PHASE_1_CRITICAL_BLOCKS_STATUS.md` - Block implementation roadmap

**Debugging**: Enable WordPress debug mode
```php
// wp-config.php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

---

**Status**: Ready for testing! Start with Phase 1 (Block Editor) tests.
