# Advanced List Widget: 1:1 Parity Implementation Report

**Date**: 2026-01-31
**Status**: Complete
**Component**: Advanced List (Action List)

## 1. Objective
The goal was to achieve strict 1:1 functional and architectural parity between the original Voxel PHP/Vue `advanced-list` widget and the new React/FSE implementation (`AdvancedListComponent`). The primary challenge was replicating server-side logic (security checks, permissions, product validation) within a client-side React component.

## 2. Architecture: "Plan C+ Hybrid"
To solve the "missing template dependencies" issue, we utilized the Plan C+ Hybrid architecture:
-   **Backend (Controller)**: A specialized PHP API Controller calculates all logic that requires server access (DB, User Session, Nonces).
-   **Frontend (React)**: The React component fetches this "Post Context" and uses it to drive the UI, replacing PHP's `if/else` conditions with React's `if/else` rendering logic.

## 3. Implementation Steps

### Step 1: Backend Logic - The API Controller
**File**: `app/controllers/fse-advanced-list-api-controller.php`

We created a new REST API endpoint (`/voxel-fse/v1/advanced-list/post-context`) to expose the data previously hidden in PHP templates (`locate_template`).

**Key Logic Ported:**
-   **Permissions**: Calculated `can_delete` and `can_publish` based on `current_user_can` and Voxel's `is_editable_by_current_user()` methods.
-   **Post Status**: Exposed `post_status` to toggle between "Publish Post" and "Unpublish Post" actions.
-   **Product Data**: Ported logic from `add-to-cart-action.php` to check if a product is valid and if it supports "One Click Add to Cart".
-   **Security Nonces**: Generated WP nonces (`vx_delete_post`, `vx_modify_post`) and sent them to the client. This is crucial for actions that modify data.
-   **Safe Execution (Output Buffering)**: Wrapped Voxel logic calls (like `check_product_form_validity`) in `ob_start() ... ob_end_clean()` to prevent any inadvertent output (warnings, notices) from polluting the JSON API response, strictly following the Parity Guide protocols.

### Step 2: Frontend Logic - The React Component
**File**: `app/blocks/src/advanced-list/shared/AdvancedListComponent.tsx`

We updated the component to handle complex actions that were previously simple HTML links in PHP.

**Key Logic Ported:**
1.  **Delete Action**:
    -   **Voxel**: Simple link with `data-confirm`.
    -   **React**: Intercepted `onClick`, fired `window.confirm()`, and verified `permissions.delete` before rendering. Used the nonce from the API.
2.  **Publish/Unpublish**:
    -   **Voxel**: Two separate PHP templates.
    -   **React**: Single Logic block that toggles the `href` and visibility based on `postContext.status` and `permissions.publish`.
3.  **Add to Cart**:
    -   **Voxel**: Checked `$field->supports_one_click_add_to_cart()`.
    -   **React**: Checked `postContext.product.oneClick`. If true, triggers the global Voxel JS handler; otherwise, links to the post.
4.  **Follow/Unfollow**:
    -   **Voxel**: Dynamic classes based on follow status.
    -   **React**: Applied `active` class based on `postContext.isFollowed`.

### Step 3: Type Definitions
**File**: `app/blocks/src/advanced-list/types/index.ts`

Updated the `PostContext` interface to strictly type the response from our new API controller, ensuring TypeScript safety for all these new flags and nonces.

## 4. Verification & Testing

To ensure the 1:1 parity is essentially "locked in," we created automated tests.

### Backend Tests (PHPUnit)
**File**: `tests/Unit/Controllers/FSEAdvancedListAPIControllerTest.php`
-   Verifies that the API returns the correct JSON structure.
-   Mocked `Voxel\Post` and `Voxel\User` to prove that permissions are calculated correctly (e.g., an Editor sees `isEditable: true`, a Guest sees `false`).
-   Confirms that security nonces are present in the response.

### Frontend Tests (Vitest)
**File**: `app/blocks/src/advanced-list/frontend.test.tsx`
-   Verifies that the "Delete" button is **only** rendered when permissions allow.
-   Tests the user interaction flow (clicking delete -> confirm dialog).
-   Ensures correct attribute mapping (e.g., `href` contains the correct nonce).

## 5. Conclusion
The conversion achieves 1:1 parity by moving the "brains" of the widget (logic) into the API Controller and keeping the "body" (UI) in React. Use of the Voxel Global JS (`window.Voxel`) was preserved where necessary (e.g., add to cart events) to maintain compatibility with the core theme's existing JavaScript.
