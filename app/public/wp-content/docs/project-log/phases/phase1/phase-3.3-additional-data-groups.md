# Phase 3.3: Additional Data Groups

**Date:** 2025-11-11 (Created)
**Status:** 📋 Ready to Execute
**Prerequisites:** ✅ Phase 3.2 Complete (Modifiers System)
**Estimated Duration:** 8-12 hours

---

## Context

### Completed:
✅ **Phase 3.1:** Base parser, renderer, Post and Site data groups
✅ **Phase 3.2:** Complete modifiers system (31 modifiers)

### Current State:
- Parser handles `@group(field)` syntax
- Renderer coordinates data groups
- Only `@post` and `@site` groups implemented
- Modifiers work with any data source
- 31 modifiers available (text, number, date, control)

### What's Next:
Implement remaining VoxelScript data groups to complete the dynamic content system foundation.

---

## Objective

Implement 2 core additional data groups to expand dynamic content capabilities:
1. **@user** - User data (name, email, meta fields)
2. **@current_user** - Logged-in user data

---

## Requirements

### 1. User Data Group (@user)

**Purpose:** Access WordPress user data by user ID

**Syntax:**
- `@user(display_name)` - Display name of current user (in loop context)
- `@user(email,id:5)` - Email of user with ID 5
- `@user(meta_key:bio,id:5)` - Custom meta field for user ID 5

**Implementation:**
- File: `app/dynamic-data/data-groups/User_Data_Group.php`
- Extends: `Base_Data_Group`
- Namespace: `MusicalWheel\Dynamic_Data\Data_Groups`

**Properties to Support:**

**Core WordPress Fields:**
- `id` - User ID
- `display_name` - Display name
- `user_login` - Username
- `user_email` or `email` - Email address
- `user_url` - Website URL
- `user_registered` - Registration date

**User Meta Fields:**
- `first_name` - First name from user meta
- `last_name` - Last name from user meta
- `nickname` - Nickname from user meta
- `description` or `bio` - User bio from user meta

**Dynamic Meta Access:**
- `meta:any_key` - Access any user meta field

**Parameters:**
- `id:123` - Specify user ID (default: current user in loop or current logged-in user)

**Example Usage:**
```php
@user(display_name)
@user(email,id:5)
@user(first_name,id:5).append( ).append(@user(last_name,id:5))
@user(meta:job_title,id:1)
```

### 2. Current User Data Group (@current_user)

**Purpose:** Access logged-in user data

**Syntax:**
- `@current_user(display_name)`
- `@current_user(email)`
- `@current_user(meta:bio)`

**Implementation:**
- File: `app/dynamic-data/data-groups/Current_User_Data_Group.php`
- Extends: `Base_Data_Group`
- Uses: `wp_get_current_user()`
- Returns empty string if not logged in

**Properties to Support:**
Same as User Data Group, but always targets the currently logged-in user.

**Example Usage:**
```php
@current_user(display_name)
@current_user(email)
@current_user(meta:phone_number)
@current_user(display_name).is_empty().then(Guest).else(Welcome @current_user(display_name)!)
```

---

## Acceptance Criteria

### Functional Requirements

1. ✅ Both data groups registered in Renderer
2. ✅ User group handles user ID parameter (`id:123`)
3. ✅ Current User group uses `wp_get_current_user()`
4. ✅ Both groups support meta field access (`meta:key`)
5. ✅ Error handling for invalid user IDs
6. ✅ Works with all existing modifiers
7. ✅ Supports nested tags in arguments

### Test Requirements

1. ✅ Minimum 8 tests per data group (16 total)
2. ✅ Test core fields for each group
3. ✅ Test meta field access
4. ✅ Test with modifiers applied
5. ✅ Test error cases (invalid user ID, not logged in)
6. ✅ All tests passing (100% coverage)

---

## Implementation Steps

### Step 1: User Data Group (3-4 hours)
1. Create `app/dynamic-data/data-groups/User_Data_Group.php`
2. Implement `get_type()` method returning `'user'`
3. Implement `resolve_property()` method with user field mapping
4. Add support for `id` parameter in property path
5. Add support for `meta:key` syntax
6. Handle `get_user_by()` for user retrieval
7. Create test suite (8+ tests)

**Field Mapping Logic:**
```php
public function resolve_property( string $property_path, $tag ) {
    // Parse property_path for "field,id:5" format
    // Extract user ID from parameters or use current user
    // Map field to WP_User property or get_user_meta()
    // Return value
}
```

### Step 2: Current User Data Group (2-3 hours)
1. Create `app/dynamic-data/data-groups/Current_User_Data_Group.php`
2. Implement `get_type()` method returning `'current-user'`
3. Implement `resolve_property()` using `wp_get_current_user()`
4. Handle not-logged-in state (return empty string)
5. Support same fields as User Data Group
6. Create test suite (8+ tests)

### Step 3: Renderer Integration (1 hour)
1. Update `app/dynamic-data/parser/Renderer.php`
2. Add User and Current_User groups to default groups
3. Test cross-group usage
4. Verify modifier compatibility

### Step 4: Testing & Documentation (2-3 hours)
1. Create `tests/unit/UserDataGroupsTest.php`
2. Test all fields for both groups
3. Test with modifier chains
4. Test error conditions
5. Update CRITICAL_PIVOT.md
6. Create task log

---

## File Structure

```
app/dynamic-data/data-groups/
├── Base_Data_Group.php              # Exists
├── Post_Data_Group.php              # Exists
├── Site_Data_Group.php              # Exists
├── User_Data_Group.php              # NEW
└── Current_User_Data_Group.php      # NEW

tests/unit/
├── DynamicContentParserTest.php     # Exists (5 tests)
├── ModifiersTest.php                # Exists (31 tests)
└── UserDataGroupsTest.php           # NEW (16+ tests)
```

---

## Testing Examples

### User Group Tests
```php
public function test_user_display_name(): void {
    $result = \mw_render( '@user(display_name,id:1)' );
    $this->assertSame( 'John Doe', $result );
}

public function test_user_email(): void {
    $result = \mw_render( '@user(email,id:1)' );
    $this->assertStringContainsString( '@', $result );
}

public function test_user_with_modifier(): void {
    $result = \mw_render( '@user(display_name,id:1).capitalize()' );
    $this->assertSame( 'JOHN DOE', $result );
}

public function test_user_meta_field(): void {
    $result = \mw_render( '@user(meta:job_title,id:1)' );
    $this->assertSame( 'Developer', $result );
}

public function test_user_invalid_id(): void {
    $result = \mw_render( '@user(display_name,id:999999)' );
    $this->assertSame( '', $result ); // Returns empty for invalid user
}
```

### Current User Group Tests
```php
public function test_current_user_display_name(): void {
    // Mock wp_get_current_user()
    $result = \mw_render( '@current_user(display_name)' );
    $this->assertIsString( $result );
}

public function test_current_user_not_logged_in(): void {
    // Mock not logged in state
    $result = \mw_render( '@current_user(display_name)' );
    $this->assertSame( '', $result );
}

public function test_current_user_with_control_flow(): void {
    $result = \mw_render( '@current_user(display_name).is_empty().then(Guest)' );
    $this->assertSame( 'Guest', $result );
}
```

---

## WordPress Function Mocks Needed

For testing environment, add these to `tests/bootstrap-mock.php`:

```php
// Mock wp_get_current_user()
if ( ! function_exists( 'wp_get_current_user' ) ) {
    function wp_get_current_user() {
        // Return mock user or empty object
    }
}

// Mock get_user_by()
if ( ! function_exists( 'get_user_by' ) ) {
    function get_user_by( $field, $value ) {
        // Return mock WP_User object
    }
}

// Mock get_user_meta()
if ( ! function_exists( 'get_user_meta' ) ) {
    function get_user_meta( $user_id, $key, $single = false ) {
        // Return mock meta value
    }
}
```

---

## Documentation Updates

After completion, update:
1. `docs/project-log/critical-pivots/2025-11-09-dynamic-content-discovery.md`
   - Mark Phase 3.3 as complete
   - Update progress percentages
2. `docs/project-log/tasks/task-3.3-additional-data-groups.md` (create)
   - Document completed work
3. `docs/project-log/changelog.md`
   - Add 2025-11-11 entry for Phase 3.3
4. Create `docs/project-log/prompts/phase-3.4-react-editor-ui.md` (next phase)

---

## Success Criteria

✅ Both data groups implemented and working
✅ 16+ tests passing (8 per group)
✅ Works with existing modifier system
✅ Error handling for edge cases (invalid ID, not logged in)
✅ WordPress function mocks created for testing
✅ Documentation updated
✅ Task log created
✅ Next phase prompt created

---

## Reference

**Voxel Files to Study:**
- `voxel/app/dynamic-data/data-groups/user-group.php`
- `voxel/app/dynamic-data/data-groups/current-user-group.php`

**Related Documentation:**
- [CRITICAL_PIVOT.md](../../critical-pivots/2025-11-09-dynamic-content-discovery.md)
- [task-3.2-modifiers-system.md](../../tasks/task-3.2-modifiers-system.md)
- [phase-3.2-modifiers.md](phase-3.2-modifiers.md)

---

**Created:** 2025-11-11
**Ready to Execute:** Yes
**Estimated Completion:** 8-12 hours
