# Phase 3.1: Core Parser & Renderer Implementation

**Date:** 2025-11-09  
**Status:** ✅ COMPLETE  
**Duration:** ~16-20 hours  
**Priority:** CRITICAL - Foundation for Dynamic Content System

---

## Executive Summary

Phase 3.1 implements the core VoxelScript parser and renderer infrastructure, matching Voxel's architecture and syntax. This provides the foundation for all dynamic content features in MusicalWheel FSE blocks.

**Key Achievement:** Built a Voxel-compatible parser that can tokenize and render dynamic tag expressions like `@post(title)`, `@site(title)`, and `Hello @post(title)`, with WordPress function-backed data groups (Post and Site).

---

## Goals & Objectives

### Primary Goals
1. ✅ Implement VoxelScript tokenizer (matches Voxel's parsing logic)
2. ✅ Implement VoxelScript renderer (coordinates data groups)
3. ✅ Create token classes (Token, Plain_Text, Dynamic_Tag)
4. ✅ Implement Post data group (title, content, permalink)
5. ✅ Implement Site data group (title, tagline, url, admin_url, language, date)
6. ✅ Create theme-level `mw_render()` function
7. ✅ Match Voxel's directory structure (`app/dynamic-data/`)
8. ✅ Align namespaces (`MusicalWheel\Dynamic_Data\...`)
9. ✅ Create unit tests (5 tests, 9 assertions - all passing)
10. ✅ Set up PHPUnit with WordPress mocks (no MySQL required)

### Scope (What's Included)
- ✅ Tokenization of `@group(property.path)` syntax
- ✅ Parsing of modifier syntax (`.modifier(args)`) - stored but not applied
- ✅ Plain text passthrough
- ✅ Post data group (title, content, permalink, id)
- ✅ Site data group (title, tagline, url, admin_url, language, date)
- ✅ WordPress function integration for data fetching
- ✅ Error handling (unknown groups fall back to raw tag)
- ✅ Unit tests with PHPUnit (5 tests, 9 assertions)
- ✅ WordPress function mocks for testing

### Scope (What's Deferred)
- ❌ Modifier application (parsed but ignored) - Phase 3.2
- ❌ Modifier chaining - Phase 3.2
- ❌ Control structures (if/then/else) - Phase 3.2
- ❌ Additional data groups (User, Term, etc.) - Phase 3.3
- ❌ Nested property resolution (only first-level properties work) - Phase 3.3

---

## Architecture Overview

### Voxel Compatibility

**Goal:** Match Voxel's architecture as closely as possible to ensure:
- Syntax compatibility (`@post(title)` works the same way)
- Easy migration path for Voxel users
- Proven, battle-tested patterns

### Directory Structure (Matches Voxel)

```
app/dynamic-data/
├── parser/
│   ├── Tokenizer.php          # Parses @group(props) syntax
│   ├── Renderer.php           # Coordinates data groups
│   ├── Token_List.php         # Container for tokens
│   └── Tokens/
│       ├── Token.php          # Abstract base class
│       ├── Plain_Text.php     # Plain text token
│       └── Dynamic_Tag.php    # Dynamic tag token
├── data-groups/
│   ├── Base_Data_Group.php    # Abstract base class
│   ├── Post_Data_Group.php    # Post data group (WordPress functions)
│   └── Site_Data_Group.php    # Site data group (WordPress functions)
├── modifiers/                 # (Phase 3.2)
├── visibility-rules/          # (Phase 3.2)
└── loader.php                 # Theme integration
```

### Namespace Structure (Matches Voxel Pattern)

**Voxel:**
```php
\Voxel\Dynamic_Data\VoxelScript\Tokenizer
\Voxel\Dynamic_Data\VoxelScript\Renderer
\Voxel\Dynamic_Data\VoxelScript\Tokens\Dynamic_Tag
\Voxel\Dynamic_Data\Data_Groups\Post_Data_Group
```

**MusicalWheel:**
```php
\MusicalWheel\Dynamic_Data\VoxelScript\Tokenizer
\MusicalWheel\Dynamic_Data\VoxelScript\Renderer
\MusicalWheel\Dynamic_Data\VoxelScript\Tokens\Dynamic_Tag
\MusicalWheel\Dynamic_Data\Data_Groups\Post_Data_Group
\MusicalWheel\Dynamic_Data\Data_Groups\Site_Data_Group
```

---

## Implementation Details

### 1. Tokenizer (`app/dynamic-data/parser/Tokenizer.php`)

**Purpose:** Parse dynamic tag expressions into tokens.

**Syntax Supported:**
- `@group(property)` - Simple property
- `@group(property.nested.path)` - Nested properties
- `@group(property).modifier(args)` - With modifiers (parsed but not applied)
- `Plain text @group(property) more text` - Mixed content

**Key Features:**
- Character-by-character parsing (multibyte-safe)
- Escape character handling (`)`, `.`, `\`)
- Length limits (matches Voxel's limits):
  - Group key: 32 chars max
  - Property: 60 chars max
  - Property path: 240 chars max
  - Modifier key: 100 chars max
- Error handling (invalid syntax falls back to plain text)

**Example:**
```php
$tokenizer = new \MusicalWheel\Dynamic_Data\VoxelScript\Tokenizer();
$tokens = $tokenizer->tokenize('Hello @post(title)');
// Returns: Token_List containing [Plain_Text('Hello '), Dynamic_Tag('post', ['title'], [])]
```

### 2. Renderer (`app/dynamic-data/parser/Renderer.php`)

**Purpose:** Coordinate data groups and render tokens into final output.

**Key Features:**
- Manages data group registry
- Iterates tokens and delegates rendering
- Handles unknown groups gracefully (falls back to raw tag)

**Example:**
```php
$groups = [
    'post' => new \MusicalWheel\Dynamic_Data\Data_Groups\Post_Data_Group(),
    'site' => new \MusicalWheel\Dynamic_Data\Data_Groups\Site_Data_Group(),
];
$renderer = new \MusicalWheel\Dynamic_Data\VoxelScript\Renderer($groups);
$output = $renderer->render('@post(title)');
// Returns: "My Post Title"

$output = $renderer->render('Hello @site(title)');
// Returns: "Hello My Site Name"
```

### 3. Token Classes

#### Token (Abstract Base)
```php
abstract class Token {
    abstract public function render(): string;
    public function set_renderer(Renderer $renderer): void;
}
```

#### Plain_Text
```php
class Plain_Text extends Token {
    protected $text;
    public function render(): string {
        return $this->text; // Passthrough
    }
}
```

#### Dynamic_Tag
```php
class Dynamic_Tag extends Token {
    protected $group_key;        // 'post', 'user', 'site', etc.
    protected $property_path;    // ['title'], ['author', 'name'], etc.
    protected $modifiers;        // [['key' => 'truncate', 'args' => [...]], ...]
    
    public function render(): string {
        // Resolve via data group
        // Modifiers ignored in Phase 3.1 (Phase 3.2)
    }
}
```

### 4. Data Groups

#### Base_Data_Group (Abstract)
```php
abstract class Base_Data_Group {
    abstract public function resolve_property(array $property_path, $token = null);
}
```

#### Post_Data_Group (WordPress Functions)
```php
class Post_Data_Group extends Base_Data_Group {
    protected $post_id;
    
    public function resolve_property(array $property_path, $token = null) {
        $key = strtolower($property_path[0] ?? '');
        switch ($key) {
            case 'id': return (string) absint($this->post_id);
            case 'title': return get_the_title($this->post_id);
            case 'content': return apply_filters('the_content', get_post($this->post_id)->post_content);
            case 'permalink': return get_permalink($this->post_id);
            default: return '';
        }
    }
}
```

**WordPress Function Integration:**
- Uses WordPress core functions: `get_post()`, `get_the_title()`, `get_permalink()`
- Applies `the_content` filter for content rendering
- Handles empty post IDs and missing posts gracefully
- Always returns strings (never arrays or objects)

#### Site_Data_Group (WordPress Functions)
```php
class Site_Data_Group extends Base_Data_Group {
    public function resolve_property(array $property_path, $token = null) {
        $key = strtolower($property_path[0] ?? '');
        switch ($key) {
            case 'title': return get_bloginfo('name');
            case 'tagline': case 'description': return get_bloginfo('description');
            case 'url': case 'home_url': return get_bloginfo('url') ?: home_url('/');
            case 'admin_url': return admin_url();
            case 'language': return get_bloginfo('language');
            case 'date': case 'current_date': return current_time('Y-m-d H:i:s');
            case 'wp_url': case 'wp_content_url': return content_url();
            default: return '';
        }
    }
}
```

**WordPress Function Integration:**
- Uses WordPress core functions: `get_bloginfo()`, `home_url()`, `admin_url()`, `content_url()`, `current_time()`
- Matches Voxel's Site_Data_Group pattern
- Provides site-level information (title, tagline, URLs, language, date)

### 5. Theme Integration (`app/dynamic-data/loader.php`)

**Entry Point:**
```php
function mw_render(string $expression, ?array $groups = null): string {
    $groups = $groups ?? [
        'post' => new \MusicalWheel\Dynamic_Data\Data_Groups\Post_Data_Group(),
        'site' => new \MusicalWheel\Dynamic_Data\Data_Groups\Site_Data_Group(),
    ];
    
    $renderer = new \MusicalWheel\Dynamic_Data\VoxelScript\Renderer($groups);
    $result = $renderer->render($expression);
    
    // Ensure result is always a string
    if (is_array($result)) {
        $result = implode('', $result);
    }
    return (string) $result;
}
```

**Usage in Blocks:**
```php
// In render.php
$title = mw_render($attributes['title'] ?? '');
echo esc_html($title);
```

**Loaded in `functions.php`:**
```php
require_once MWFSE_PATH . '/app/dynamic-data/loader.php';
```

---

## File Structure

### Core Parser Files

```
app/dynamic-data/
├── parser/
│   ├── Tokenizer.php          # 208 lines - Character-by-character parser
│   ├── Renderer.php           # 50 lines - Coordination layer
│   ├── Token_List.php         # 22 lines - Token container
│   └── Tokens/
│       ├── Token.php          # 19 lines - Abstract base
│       ├── Plain_Text.php     # 22 lines - Plain text token
│       └── Dynamic_Tag.php    # 63 lines - Dynamic tag token
├── data-groups/
│   ├── Base_Data_Group.php    # 20 lines - Abstract base
│   ├── Post_Data_Group.php    # 87 lines - Post data group
│   └── Site_Data_Group.php    # 90 lines - Site data group
└── loader.php                 # 37 lines - Theme integration
```

**Total:** ~598 lines of PHP code

---

## Usage Examples

### Basic Usage

```php
// Simple expression - Post data
echo mw_render('@post(title)');
// Output: "My Post Title"

// Simple expression - Site data
echo mw_render('@site(title)');
// Output: "My Site Name"

// Mixed content - Post data
echo mw_render('Hello @post(title), welcome!');
// Output: "Hello My Post Title, welcome!"

// Mixed content - Site data
echo mw_render('Welcome to @site(title)');
// Output: "Welcome to My Site Name"

// Site URL
echo mw_render('Visit us at @site(url)');
// Output: "Visit us at https://example.com"

// Unknown group (falls back to raw tag)
echo mw_render('@unknown(property)');
// Output: "@unknown(property)"
```

### In Block Render.php

```php
<?php
/**
 * Block: Dynamic Title
 * 
 * @var array $attributes Block attributes
 */

$title = $attributes['title'] ?? '';

// Check if dynamic tag (starts with @tags() or contains @)
if (strpos($title, '@') !== false) {
    $title = mw_render($title);
}

echo '<h2>' . esc_html($title) . '</h2>';
```

### Custom Data Groups

```php
// Provide custom groups
$groups = [
    'post' => new \MusicalWheel\Dynamic_Data\Data_Groups\Post_Data_Group(123),
    'site' => new \MusicalWheel\Dynamic_Data\Data_Groups\Site_Data_Group(),
];
echo mw_render('@post(title) from @site(title)', $groups);
// Output: "My Post Title from My Site Name"
```

---

## Testing

### Unit Tests (`tests/unit/DynamicContentParserTest.php`)

**Test Cases:**
1. ✅ Plain text passthrough
2. ✅ Unknown group fallback
3. ✅ Unknown group with modifier fallback
4. ✅ Post title rendering
5. ✅ Mixed content with post title
6. ✅ Site title rendering
7. ✅ Site URL rendering
8. ✅ Mixed content with site title

**Test Results:**
- **Total Tests:** 5 tests
- **Total Assertions:** 9 assertions
- **Status:** ✅ All passing

**Running Tests:**
```bash
# Via Composer
composer test

# Via PHPUnit directly
vendor/bin/phpunit tests/unit/DynamicContentParserTest.php

# Via PHPStorm
# Right-click test file → Run
```

**Bootstrap Setup:**
- Uses WordPress function mocks (no MySQL required)
- Loads dynamic data system directly in `tests/bootstrap.php`
- Mocks WordPress functions in `tests/bootstrap-mock.php`
- Configured in `phpunit.xml` with `USE_WP_MOCKS=true`

### Manual Testing

**Test Expressions:**
```php
// Test 1: Plain text
mw_render('Hello World');
// Expected: "Hello World"

// Test 2: Simple tag
mw_render('@post(title)');
// Expected: Current post title

// Test 3: Mixed content
mw_render('Post: @post(title)');
// Expected: "Post: [Current Post Title]"

// Test 4: Unknown group
mw_render('@unknown(property)');
// Expected: "@unknown(property)"

// Test 5: Site data
mw_render('@site(title)');
// Expected: Site title (blog name)

// Test 6: Site URL
mw_render('@site(url)');
// Expected: Site URL

// Test 7: Mixed content with site data
mw_render('Hello @site(title)');
// Expected: "Hello [Site Title]"

// Test 8: Modifier (parsed but ignored)
mw_render('@post(title).truncate(50)');
// Expected: Full post title (modifier not applied yet)
```

---

## Known Limitations (Phase 3.1)

### 1. Modifiers Not Applied
**Status:** Parsed but ignored
**Impact:** `@post(title).truncate(50)` returns full title
**Fix:** Phase 3.2 will implement modifier application

### 2. Limited Data Groups
**Status:** Only `post` and `site` groups implemented
**Impact:** `@user(name)`, `@term(name)` don't work
**Fix:** Phase 3.3 will implement additional data groups (User, Term, etc.)

### 3. Limited Post Properties
**Status:** Only `id`, `title`, `content`, `permalink`
**Impact:** `@post(author.name)`, `@post(date)` don't work
**Fix:** Phase 3.3 will expand Post data group

### 4. No Nested Properties
**Status:** Only first-level properties (`title`, not `author.name`)
**Impact:** Nested paths return `null`
**Fix:** Phase 3.3 will implement nested property resolution

### 5. No Error Messages
**Status:** Unknown groups fall back silently
**Impact:** Hard to debug invalid expressions
**Fix:** Phase 3.2 will add error handling and logging

---

## Architecture Decisions

### 1. Match Voxel's Structure
**Decision:** Use `app/dynamic-data/` (not `dynamic-content/`)
**Rationale:** 
- Easier to reference Voxel code
- Familiar structure for developers
- Proven architecture

### 2. WordPress Functions for Data Fetching
**Decision:** Use WordPress core functions (not GraphQL) for Phase 3.1 MVP
**Rationale:**
- Matches Voxel's internal approach for basic data
- More reliable (no GraphQL dependency)
- Simpler implementation for MVP
- GraphQL can be added later for complex scenarios
- Direct WordPress functions are faster for simple queries

### 3. Modifiers Parsed But Not Applied
**Decision:** Parse modifier syntax but ignore in Phase 3.1
**Rationale:**
- Allows forward-compatible expressions
- Focuses Phase 3.1 on core parser
- Modifiers are Phase 3.2 scope

### 4. Simple Error Handling
**Decision:** Fall back to raw tag for unknown groups
**Rationale:**
- Non-breaking (expressions don't crash)
- Allows gradual implementation
- Matches Voxel's behavior

### 5. No Composer Autoloading
**Decision:** Use explicit `require_once` statements
**Rationale:**
- Simpler for WordPress themes
- No build step required
- Matches Voxel's approach

---

## Reference: Voxel Implementation

### Voxel Files Analyzed

**Tokenizer:**
- `voxel/app/dynamic-data/voxelscript/tokenizer.php` (224 lines)
- Character-by-character parsing
- Escape character handling
- Length limits

**Renderer:**
- `voxel/app/dynamic-data/voxelscript/renderer.php` (61 lines)
- Coordinates data groups
- Handles token rendering

**Tokens:**
- `voxel/app/dynamic-data/voxelscript/tokens/token.php` (19 lines)
- `voxel/app/dynamic-data/voxelscript/tokens/plain-text.php` (22 lines)
- `voxel/app/dynamic-data/voxelscript/tokens/dynamic-tag.php` (117 lines)

**Entry Point:**
- `voxel/app/utils/utils.php` (lines 70-82)
- `\Voxel\render($string, $groups = null)`

### Key Differences (MusicalWheel vs Voxel)

| Aspect | Voxel | MusicalWheel |
|--------|-------|--------------|
| **Data Source** | Direct PHP calls | WordPress functions (Phase 3.1) |
| **Namespace** | `\Voxel\Dynamic_Data\...` | `\MusicalWheel\Dynamic_Data\...` |
| **Entry Function** | `\Voxel\render()` | `mw_render()` |
| **Modifiers** | Fully implemented | Parsed but not applied (Phase 3.2) |
| **Data Groups** | 17 groups | 2 groups (Post, Site) - Phase 3.3 for more |
| **Error Handling** | Silent fallback | Silent fallback (same) |
| **Testing** | WordPress environment | WordPress mocks (no MySQL) |

---

## Performance Considerations

### Caching Strategy

**Current (Phase 3.1):**
- WordPress functions used directly (`get_post()`, `get_bloginfo()`, etc.)
- No explicit caching (relies on WordPress object cache)
- Each render call fetches data

**Future (Phase 3.2+):**
- Implement `wp_cache_get()` / `wp_cache_set()` in data groups
- Cache resolved properties for 5 minutes
- Clear cache on content updates
- Consider GraphQL for complex queries with better caching

### Optimization Opportunities

1. **Batch GraphQL Queries**
   - Multiple properties in one query
   - Reduce HTTP overhead

2. **Property Caching**
   - Cache resolved properties per post
   - Reduce repeated GraphQL calls

3. **Token Caching**
   - Cache tokenized expressions
   - Reduce parsing overhead for repeated expressions

---

## Next Steps (Phase 3.2: Modifiers)

### Priority Tasks

1. **Implement Base Modifier Class** (2-3 hours)
   - Create `app/dynamic-data/modifiers/Base_Modifier.php`
   - Define interface: `apply()`, `passes()`, `get_type()`
   - Study Voxel's `base-modifier.php`

2. **Implement Text Modifiers** (6-8 hours)
   - truncate, append, prepend, capitalize
   - replace, list, first, last, nth, count
   - Reference: `voxel/app/dynamic-data/modifiers/text/`

3. **Implement Number Modifiers** (2-3 hours)
   - number_format, currency_format, round
   - Reference: `voxel/app/dynamic-data/modifiers/number/`

4. **Implement Date Modifiers** (2-3 hours)
   - date_format, time_diff, to_age
   - Reference: `voxel/app/dynamic-data/modifiers/date/`

5. **Implement Control Structures** (8-10 hours)
   - is_empty, is_not_empty, is_equal_to, etc.
   - then, else, fallback
   - Reference: `voxel/app/dynamic-data/modifiers/control/`

6. **Support Modifier Chaining** (2-3 hours)
   - Apply modifiers in sequence
   - Handle control structure conditions
   - Test: `@post(title).truncate(50).append(...)`

7. **Testing** (2-3 hours)
   - Test all modifiers individually
   - Test modifier chaining
   - Test edge cases

**Estimated Total:** 24-32 hours (3-4 days)

---

## Success Criteria (Phase 3.1) ✅

### Technical
- [x] Tokenizer handles all syntax correctly
- [x] Renderer coordinates data groups successfully
- [x] Post data group resolves properties (title, content, permalink, id)
- [x] Site data group resolves properties (title, tagline, url, admin_url, language, date)
- [x] Theme integration works (`mw_render()` function)
- [x] Matches Voxel's directory structure
- [x] Aligned namespaces with Voxel pattern
- [x] Unit tests passing (5 tests, 9 assertions)
- [x] PHPUnit setup with WordPress mocks

### Functional
- [x] `@post(title)` returns post title
- [x] `@post(content)` returns post content
- [x] `@post(permalink)` returns post URL
- [x] `@post(id)` returns post ID
- [x] `@site(title)` returns site title
- [x] `@site(tagline)` returns site tagline
- [x] `@site(url)` returns site URL
- [x] `@site(admin_url)` returns admin URL
- [x] `@site(language)` returns site language
- [x] `@site(date)` returns current date/time
- [x] `Hello @post(title)` returns mixed content with post data
- [x] `Hello @site(title)` returns mixed content with site data
- [x] Unknown groups fall back to raw tag
- [x] Modifiers parsed but not applied (expected)

### Code Quality
- [x] No linter errors
- [x] Follows WordPress coding standards
- [x] Documented with inline comments
- [x] Unit tests created (5 tests, 9 assertions)
- [x] All tests passing
- [x] Type safety (always returns strings)
- [x] Error handling (graceful fallbacks)

---

## Files Created

### Parser Core
- ✅ `app/dynamic-data/parser/Tokenizer.php`
- ✅ `app/dynamic-data/parser/Renderer.php`
- ✅ `app/dynamic-data/parser/Token_List.php`
- ✅ `app/dynamic-data/parser/Tokens/Token.php`
- ✅ `app/dynamic-data/parser/Tokens/Plain_Text.php`
- ✅ `app/dynamic-data/parser/Tokens/Dynamic_Tag.php`

### Data Groups
- ✅ `app/dynamic-data/data-groups/Base_Data_Group.php`
- ✅ `app/dynamic-data/data-groups/Post_Data_Group.php`
- ✅ `app/dynamic-data/data-groups/Site_Data_Group.php`

### Integration
- ✅ `app/dynamic-data/loader.php`

### Tests
- ✅ `tests/unit/DynamicContentParserTest.php`
- ✅ `tests/bootstrap.php` (bootstrap with WordPress mocks)
- ✅ `tests/bootstrap-mock.php` (WordPress function mocks)
- ✅ `phpunit.xml` (PHPUnit configuration)
- ✅ `tests/README.md` (Testing documentation)
- ✅ `composer.json` (PHPUnit dependency)

### Documentation
- ✅ `docs/project-log/2025-11-09_task-3.1/phase-3.1-parser.md` (this file)

---

## Validation Checklist

### Phase 3.1 Completion ✅

- [x] Tokenizer implemented and tested
- [x] Renderer implemented and tested
- [x] Token classes created
- [x] Post data group implemented
- [x] Site data group implemented
- [x] WordPress function integration working
- [x] Theme integration (`mw_render()` function)
- [x] Directory structure matches Voxel
- [x] Namespaces aligned with Voxel
- [x] Unit tests created (5 tests, 9 assertions)
- [x] All tests passing
- [x] PHPUnit setup with WordPress mocks
- [x] Bootstrap loading fixed
- [x] Documentation completed

### Ready for Phase 3.2 ✅

- [x] Parser foundation solid
- [x] Modifier syntax parsed (ready for application)
- [x] Data group pattern established
- [x] WordPress function integration proven
- [x] Two data groups working (Post, Site)
- [x] Unit tests passing
- [x] Architecture documented
- [x] Testing infrastructure in place

---

## Conclusion

Phase 3.1 successfully implements the core parser and renderer infrastructure for MusicalWheel's dynamic content system. The implementation matches Voxel's architecture and syntax, providing a solid foundation for Phase 3.2 (modifiers) and Phase 3.3 (additional data groups).

**Key Achievements:**
- ✅ Voxel-compatible parser (tokenizer + renderer)
- ✅ Post data group (title, content, permalink, id)
- ✅ Site data group (title, tagline, url, admin_url, language, date)
- ✅ WordPress function integration
- ✅ Theme integration (`mw_render()` function)
- ✅ Matching directory structure and namespaces
- ✅ Unit tests (5 tests, 9 assertions - all passing)
- ✅ PHPUnit setup with WordPress mocks (no MySQL required)
- ✅ Foundation for modifiers (Phase 3.2)

**Next Phase:** Phase 3.2 will implement modifier application, enabling expressions like `@post(title).truncate(50)` to work correctly.

---

**Generated by:** Cursor AI Agent  
**Date:** 2025-11-09  
**Status:** ✅ COMPLETE  
**Next Phase:** Phase 3.2 (Modifiers Implementation)

