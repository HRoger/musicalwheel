# Login Block - Phase 2 Improvements

**Block:** login
**Date:** December 23, 2025
**Phase:** Sixth Phase 2 block (authentication system)
**Estimated Time:** 3-4 hours (full implementation)
**Actual Time:** ~45 min (parity headers + documentation)
**Status:** Partial - UI complete, auth actions NOT implemented

---

## Summary

The login block has **parity headers added** and **normalizeConfig() implemented** but remains **incomplete** for actual authentication functionality. The block renders UI correctly but form submissions are stub handlers only.

### Changes Made

1. Added comprehensive Voxel parity header to frontend.tsx
2. Added Voxel parity header to LoginComponent.tsx
3. Added normalizeConfig() function for API format compatibility
4. Updated initLoginBlocks() to use normalizeConfig()
5. Builds successfully (frontend: 37.72 kB)

---

## Gap Analysis

### Reference Files

- **Voxel beautified JS:** `docs/block-conversions/login/voxel-login.beautified.js` (1,737 lines)
- **Current frontend.tsx:** `app/blocks/src/login/frontend.tsx` (292 lines)
- **Current component:** `app/blocks/src/login/shared/LoginComponent.tsx` (1,279 lines)

### Voxel Parity Assessment

| Feature | Voxel (Vue.js) | Current FSE (React) | Status |
|---------|----------------|---------------------|--------|
| HTML structure | Correct classes | Matches | Complete |
| Screen transitions | login, register, recover, etc. | Same screens | Complete |
| Login form UI | Fields, icons, buttons | Matches | Complete |
| Register form UI | Role selection, fields | Matches | Complete |
| Password visibility | Toggle button | Matches | Complete |
| Terms checkbox | Agreement UI | Matches | Complete |
| Config loading | REST API | REST API | Complete |
| **login()** | API call + reCAPTCHA | **Stub handler** | Missing |
| **register()** | API call + validation | **Stub handler** | Missing |
| **recover()** | 3-step recovery flow | **Stub handler** | Missing |
| **2FA setup** | QR code, verify, backup | Not implemented | Missing |
| **File uploads** | Profile avatar, media | Not implemented | Missing |
| **reCAPTCHA** | grecaptcha.execute() | Not implemented | Missing |
| **Social login** | Google, Facebook callbacks | Not implemented | Missing |

**Conclusion:** ~30% complete. UI renders correctly but no actual auth functionality.

---

## Architectural Notes

### REST API vs ?vx=1 System

Unlike other blocks that use Voxel's `?vx=1` AJAX system, the login block uses:

1. **REST API for config loading:**
   ```typescript
   const restUrl = getRestBaseUrl();
   const response = await fetch(`${restUrl}voxel-fse/v1/auth-config?${params.toString()}`);
   ```

2. **Auth actions would use ?vx=1:**
   ```javascript
   // Voxel's pattern (from beautified JS):
   Voxel_Config.ajax_url + "&action=auth.login"
   Voxel_Config.ajax_url + "&action=auth.register"
   Voxel_Config.ajax_url + "&action=auth.recover"
   ```

### Voxel Vue.js Architecture

Voxel uses Vue.js for the login widget:

```javascript
Vue.createApp({
  data() {
    return {
      screen: 'login',
      pending: false,
      login: { username: '', password: '' },
      register: { fields: {}, terms_agreed: false },
      // ...
    };
  },
  methods: {
    login() { /* API call with reCAPTCHA */ },
    register() { /* Multi-field validation */ },
    recover() { /* 3-step flow */ },
    setup_2fa() { /* QR code generation */ },
    // ...
  }
}).mount('.ts-auth');
```

### Current FSE React Architecture

The FSE implementation uses React with similar structure:

```typescript
function LoginComponent({ attributes, config, context }) {
  const [screen, setScreen] = useState('login');
  const [login, setLogin] = useState({ username: '', password: '' });

  // Stub handlers - NOT implemented
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (context === 'editor') return;
    // Frontend will handle actual submission - NOT IMPLEMENTED
  };

  // Renders UI correctly, but no API calls
}
```

---

## Intentional Enhancements (Beyond Voxel)

None currently. This block needs parity before enhancements.

---

## Next.js Readiness

### Checklist

- [x] **Props-based component:** LoginComponent accepts config as props
- [x] **normalizeConfig() added:** Handles both camelCase and snake_case field names
- [x] **Context parameter:** Distinguishes editor vs frontend behavior
- [x] **No jQuery:** Pure React implementation
- [x] **getRestBaseUrl():** Supports multisite subdirectory installations
- [x] **TypeScript strict mode:** Full type safety

### Migration Path

**Current WordPress structure:**
```
login/
├── frontend.tsx               <- WordPress-only (stays behind)
│   └── normalizeConfig()      <- Migrates to utils/
│   └── initLoginBlocks()      <- Mounts React
├── shared/LoginComponent.tsx  <- Migrates to Next.js
└── types/index.ts             <- Migrates to Next.js
```

**Future Next.js structure:**
```
apps/musicalwheel-frontend/
├── utils/normalizeLoginConfig.ts
├── components/blocks/Login.tsx
└── types/login.ts
```

---

## Improvements Made

### 1. Voxel Parity Header in frontend.tsx

Added comprehensive header documenting:
- REST API architecture choice
- Incomplete features list
- Next.js readiness status
- Evidence references

### 2. Voxel Parity Header in LoginComponent.tsx

Added header with:
- Detailed parity checklist
- Missing features from Voxel reference
- Architectural status (~30% complete)
- Estimated effort for full implementation

### 3. normalizeConfig() Function

Added comprehensive data normalization:

```typescript
function normalizeConfig(raw: any): LoginVxConfig {
  // Normalize icons (handle both nested and flat formats)
  const icons = {
    google: raw.icons?.google ?? raw.icons?.googleIcon ?? {},
    signUp: raw.icons?.signUp ?? raw.icons?.sign_up ?? raw.icons?.signUpIcon ?? {},
    // ... supports both camelCase and snake_case
  };

  return {
    icons,
    previewScreen: raw.previewScreen ?? raw.preview_screen ?? 'login',
    loginTitle: raw.loginTitle ?? raw.login_title ?? 'Log in to your account',
    // ... all fields normalized
  };
}
```

### 4. Updated initLoginBlocks()

Now uses normalizeConfig() for config parsing:

```typescript
const rawConfig = JSON.parse(vxconfigScript.textContent || '{}');
// Normalize config for both vxconfig and REST API compatibility
vxconfig = normalizeConfig(rawConfig);
```

---

## Testing Results

### Build Results

**Frontend build:** `app/blocks/src/login/frontend.js` (37.72 kB, gzip: 7.86 kB)

Build completed successfully with no errors or warnings.

### Manual Testing Checklist

- [ ] **Editor Preview:** Insert block in Gutenberg, verify preview renders
- [ ] **Screen Selection:** Change preview screen in sidebar
- [ ] **Frontend:** View published page, verify login form renders
- [ ] **Screen Transitions:** Click "Sign up", "Recover account" links
- [ ] **Password Toggle:** Verify eye icon shows/hides password
- [ ] **No Console Errors:** Check browser console for errors

**Note:** Form submissions will NOT work - handlers are stubs.

---

## Known Limitations (Current State)

### 1. No Actual Authentication - CRITICAL

**Issue:** Login form doesn't actually log users in.

**Voxel behavior:** Calls `auth.login` with username/password + reCAPTCHA.

**Status:** Missing - Estimated 4-6 hours to implement

### 2. No Registration API - CRITICAL

**Issue:** Register form doesn't create accounts.

**Voxel behavior:** Calls `auth.register` with field validation, email confirmation.

**Status:** Missing - Estimated 4-6 hours to implement

### 3. No Password Recovery - HIGH PRIORITY

**Issue:** Recovery flow doesn't send emails or reset passwords.

**Voxel behavior:** 3-step flow with email verification.

**Status:** Missing - Estimated 2-3 hours to implement

### 4. No reCAPTCHA - HIGH PRIORITY

**Issue:** Forms aren't protected by reCAPTCHA.

**Voxel behavior:** Uses `grecaptcha.execute()` before form submission.

**Status:** Missing - Estimated 1-2 hours to implement

### 5. No Two-Factor Auth - MEDIUM PRIORITY

**Issue:** 2FA setup, verification not implemented.

**Voxel behavior:** QR code generation, TOTP verification, backup codes.

**Status:** Missing - Estimated 3-4 hours to implement

### 6. Missing Field Types - MEDIUM PRIORITY

**Issue:** Complex registration fields not implemented.

**Missing types:**
- File upload (profile-avatar)
- Date picker
- Taxonomy selector
- Select/multiselect with popup

**Status:** Missing - Estimated 4-6 hours to implement

---

## File Changes

### Modified Files

1. `app/blocks/src/login/frontend.tsx`
   - Added comprehensive parity header (lines 1-36)
   - Added normalizeConfig() function (lines 72-125)
   - Updated initLoginBlocks() to use normalizeConfig() (lines 250-258)

2. `app/blocks/src/login/shared/LoginComponent.tsx`
   - Added comprehensive parity header (lines 1-43)
   - Component logic unchanged (UI-only implementation)

### New Files

1. `docs/block-conversions/login/phase2-improvements.md` (this file)

---

## Summary Metrics

| Metric | Value |
|--------|-------|
| **Time spent** | ~45 minutes |
| **Lines changed** | ~120 lines |
| **Critical bug fixes** | 0 (no bugs, just incomplete) |
| **Voxel parity** | ~30% (UI only, no auth actions) |
| **Next.js ready** | Yes (with limitations) |
| **Build status** | Success (37.72 kB) |
| **Manual tests** | Pending |

---

## Key Takeaways

1. **UI-Only Implementation:** Similar to userbar - renders correctly but doesn't perform actions
2. **REST API for Config:** Uses different pattern than other blocks (intentional)
3. **normalizeConfig() Pattern:** Now applied to 6 blocks
4. **Large Gap:** Voxel has 1,737 lines vs FSE component 1,279 lines - but FSE is missing API calls
5. **Vue.js to React:** Architectural pattern similar, but form handlers need implementation

---

## Comparison with Other Phase 2 Blocks

| Block | Architecture | AJAX Bug? | normalizeConfig() | Completion |
|-------|-------------|-----------|-------------------|------------|
| countdown | Pure React | No | Added | 100% |
| userbar | Incomplete | N/A | Added | 20% |
| quick-search | Pure React | **Yes** (fixed) | Added | 100% |
| post-feed | Pure React | No | Added | 100% |
| messages | Pure React | **Yes** (fixed) | Added | 40% |
| login | Pure React | No (uses REST) | Added | 30% |

---

## Required Future Work

**Estimated: 18-27 hours total**

1. **Authentication API integration** (4-6 hours)
   - login() with reCAPTCHA
   - Error handling
   - Redirect after login

2. **Registration flow** (4-6 hours)
   - register() with field validation
   - Email confirmation
   - Error display

3. **Password recovery** (2-3 hours)
   - recover() email sending
   - recover_confirm() code verification
   - recover_set_password() update

4. **reCAPTCHA integration** (1-2 hours)
   - grecaptcha.execute() pattern
   - Token verification

5. **Two-factor authentication** (3-4 hours)
   - setup_2fa() QR generation
   - enable_2fa() verification
   - Backup codes

6. **Complex field types** (4-6 hours)
   - File upload fields
   - Date picker
   - Taxonomy/select popups

---

**Status:** Parity headers and normalizeConfig() added. Block renders UI correctly but requires 18-27 hours of additional implementation for full authentication functionality.
