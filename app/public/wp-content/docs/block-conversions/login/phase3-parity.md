# Login/Auth Block - Phase 3 Parity

**Date:** December 23, 2025
**Status:** Analysis Complete (100% parity)
**Reference:** voxel-login.beautified.js (1,737 lines, ~25KB)

## Summary

The login/auth block has **100% parity** with Voxel's Vue.js implementation. All authentication flows are fully implemented: login with 2FA, registration with role selection and custom fields, password recovery, profile updates (password/email), account deletion, and complete Two-Factor Authentication (setup, enable, disable, backup codes, trusted devices). The React implementation is comprehensive at 1,200+ lines with full TypeScript typing and reCAPTCHA v3 integration.

## Voxel JS Analysis

- **Total lines:** 1,737
- **Framework:** Vue.js 3 (Vue.createApp)
- **Mixins:** Voxel.mixins.base, ConditionMixin
- **Components:** 6 (date-field, taxonomy-field, term-list, file-field, select-field, multiselect-field)
- **API endpoints:** 16 (auth.*)
- **Security:** reCAPTCHA v3, nonce validation

### Core Features

| Feature | Voxel Implementation |
|---------|---------------------|
| Login | Username/password with remember me |
| 2FA Login | User ID + session token + code |
| Registration | Multiple roles with custom fields |
| Recovery | Email → code → new password flow |
| Update Password | Current + new + confirm |
| Update Email | New email + verification code |
| 2FA Setup | QR code generation + code verify |
| 2FA Disable | Password confirmation |
| Backup Codes | Generate + copy |
| Trusted Devices | Remove all |
| Account Deletion | Password + confirmation code |
| Personal Data | Export request |

## React Implementation Analysis

- **Entry point:** frontend.tsx (~295 lines)
- **Main component:** LoginComponent.tsx (~1,200+ lines)
- **Types:** types/index.ts (comprehensive)
- **Architecture:** Props-based React with hooks

### Key React Features

1. **useState** for all form state (login, register, recovery, 2FA, privacy)
2. **useCallback** for memoized API handlers (16 endpoints)
3. **useEffect** for auto-submit confirmation code (5 digits)
4. **useRef** for DOM focus management
5. **Voxel utility wrappers** (showAlert, showPrompt, executeRecaptcha)

## Parity Checklist

### Authentication Screens

| Voxel Screen | React Implementation | Status |
|--------------|---------------------|--------|
| login | setScreen('login') | ✅ Done |
| register | setScreen('register') | ✅ Done |
| confirm_account | setScreen('confirm_account') | ✅ Done |
| login_confirm_account | setScreen('login_confirm_account') | ✅ Done |
| login_2fa_verify | setScreen('login_2fa_verify') | ✅ Done |
| recover | setScreen('recover') | ✅ Done |
| recover_confirm | setScreen('recover_confirm') | ✅ Done |
| recover_set_password | setScreen('recover_set_password') | ✅ Done |
| security | setScreen('security') | ✅ Done |
| security_update_password | setScreen('security_update_password') | ✅ Done |
| security_update_email | setScreen('security_update_email') | ✅ Done |
| security_2fa_setup | setScreen('security_2fa_setup') | ✅ Done |
| security_2fa_backup_codes | setScreen('security_2fa_backup_codes') | ✅ Done |
| security_delete_account_confirm | setScreen('security_delete_account_confirm') | ✅ Done |
| welcome | setScreen('welcome') | ✅ Done |

### State Management

| Vue data() Property | React useState | Status |
|---------------------|----------------|--------|
| pending | useState pending | ✅ Done |
| resendCodePending | useState resendCodePending | ✅ Done |
| screen | useState screen | ✅ Done |
| config | prop config | ✅ Done |
| login.username | login.username | ✅ Done |
| login.password | login.password | ✅ Done |
| login.remember | login.remember | ✅ Done |
| recovery.email | recovery.email | ✅ Done |
| recovery.code | recovery.code | ✅ Done |
| recovery.password | recovery.password | ✅ Done |
| recovery.confirm_password | recovery.confirm_password | ✅ Done |
| register.terms_agreed | register.terms_agreed | ✅ Done |
| register.fieldValues | register.fieldValues | ✅ Done |
| update.password.* | updatePassword.* | ✅ Done |
| update.email.* | updateEmail.* | ✅ Done |
| privacy.export_data | privacy.export_data | ✅ Done |
| privacy.delete_account | privacy.delete_account | ✅ Done |
| twofa.* | twofa.* | ✅ Done |
| login2fa.* | login2fa.* | ✅ Done |
| confirmation_code | confirmationCode | ✅ Done |
| activeRole | activeRole | ✅ Done |

### API Integration

| Endpoint | Method | Status |
|----------|--------|--------|
| ?vx=1&action=auth.login | fetch() POST | ✅ Done |
| ?vx=1&action=auth.register | fetch() POST FormData | ✅ Done |
| ?vx=1&action=auth.register.resend_confirmation_code | fetch() POST | ✅ Done |
| ?vx=1&action=auth.recover | fetch() POST | ✅ Done |
| ?vx=1&action=auth.recover_confirm | fetch() POST | ✅ Done |
| ?vx=1&action=auth.recover_set_password | fetch() POST | ✅ Done |
| ?vx=1&action=auth.update_password | fetch() POST | ✅ Done |
| ?vx=1&action=auth.update_email | fetch() POST | ✅ Done |
| ?vx=1&action=auth.2fa_setup | fetch() POST | ✅ Done |
| ?vx=1&action=auth.2fa_enable | fetch() POST | ✅ Done |
| ?vx=1&action=auth.2fa_disable | fetch() POST | ✅ Done |
| ?vx=1&action=auth.verify_2fa | fetch() POST | ✅ Done |
| ?vx=1&action=auth.2fa_regenerate_backups | fetch() POST | ✅ Done |
| ?vx=1&action=auth.2fa_remove_trusted_devices | fetch() POST | ✅ Done |
| ?vx=1&action=auth.delete_account_permanently | fetch() POST | ✅ Done |
| ?vx=1&action=auth.request_personal_data | fetch() POST | ✅ Done |

### reCAPTCHA Integration

| Voxel Pattern | React Implementation | Status |
|---------------|---------------------|--------|
| recaptcha(action, callback) | executeRecaptcha(action, siteKey, enabled, callback) | ✅ Done |
| grecaptcha.ready() | grecaptcha.ready() | ✅ Done |
| grecaptcha.execute() | grecaptcha.execute() | ✅ Done |
| _recaptcha form field | formData.append('_recaptcha', token) | ✅ Done |

### CSS Classes

| Voxel Class | React Usage | Status |
|-------------|-------------|--------|
| .ts-auth | Main container | ✅ Done |
| .ts-form | Form wrapper | ✅ Done |
| .ts-login | Login form variant | ✅ Done |
| .login-section | Section container | ✅ Done |
| .or-group | Divider with "or" | ✅ Done |
| .vx-step-title | Screen title | ✅ Done |
| .ts-input-icon | Input with icon | ✅ Done |
| .ts-filter | Button styling | ✅ Done |
| .ts-checkbox-container | Checkbox wrapper | ✅ Done |
| .ts-icon-btn | Icon button | ✅ Done |
| .ts-btn, .ts-btn-1, .ts-btn-2 | Button classes | ✅ Done |
| .vx-pending | Loading state | ✅ Done |
| .ts-form-group | Form group | ✅ Done |
| .field-info | Helper text | ✅ Done |
| .user-roles | Role selection | ✅ Done |
| .role-card | Individual role | ✅ Done |
| .active-role | Selected role | ✅ Done |
| .hidden | Hidden class | ✅ Done |

### Edge Cases

| Scenario | Handling | Status |
|----------|----------|--------|
| Re-initialization prevention | data-hydrated check | ✅ Done |
| Auto-submit 5-digit code | useEffect watch | ✅ Done |
| Redirect URL handling | {REDIRECT_URL} replacement | ✅ Done |
| 2FA requires flag | response.requires_2fa check | ✅ Done |
| Account not confirmed | response.confirmed check | ✅ Done |
| Registration verification | response.verification_required | ✅ Done |
| File uploads in registration | FormData with files[field_id][] | ✅ Done |
| Error handling | showAlert + getL10n fallback | ✅ Done |
| Prompt confirmations | showPrompt with buttons | ✅ Done |
| Clipboard copy | copyToClipboard wrapper | ✅ Done |

## Core Functions Mapping

| Voxel Function | React Implementation | Lines |
|----------------|---------------------|-------|
| submitLogin() | submitLogin | 401-456 |
| submitRegister() | submitRegister | 462-550 |
| submitConfirmRegistration() | submitConfirmRegistration | 552-554 |
| registerResendConfirmationCode() | resendConfirmationCode | 560-595 |
| submitRecover() | submitRecover | 599-631 |
| submitRecoverConfirm() | submitRecoverConfirm | 634-667 |
| submitNewPassword() | submitNewPassword | 670-709 |
| submitUpdatePassword() | submitUpdatePassword | 712-746 |
| submitUpdateEmail() | submitUpdateEmail | 749-781 |
| setup2fa() | setup2fa | 786-813 |
| submit2faSetup() | submit2faSetup | 818-846 |
| disable2fa() | disable2fa | 852-893 |
| regenerateBackupCodes() | regenerateBackupCodes | 899-937 |
| removeAllTrustedDevices() | removeAllTrustedDevices | 945-984 |
| submit2faVerification() | submit2faVerification | 989-1028 |
| requestPersonalData() | requestPersonalData | 1034-1065 |
| deleteAccountPermanently() | deleteAccountPermanently | 1068-1115 |

## Registration Field Components

| Voxel Component | React Implementation | Status |
|-----------------|---------------------|--------|
| date-field | DateField inline | ✅ Done |
| taxonomy-field | TaxonomyField inline | ✅ Done |
| term-list | (Nested in TaxonomyField) | ✅ Done |
| file-field | FileField inline | ✅ Done |
| select-field | SelectField inline | ✅ Done |
| multiselect-field | MultiselectField inline | ✅ Done |
| text/email/url/number | Input fields | ✅ Done |
| switcher | Checkbox | ✅ Done |
| phone | Phone input | ✅ Done |

## Voxel Utility Wrappers

| Voxel Utility | React Wrapper | Status |
|---------------|---------------|--------|
| Voxel.alert() | showAlert() | ✅ Done |
| Voxel.prompt() | showPrompt() | ✅ Done |
| Voxel.copy() | copyToClipboard() | ✅ Done |
| Voxel_Config.l10n | getL10n() | ✅ Done |
| Voxel_Config.ajax_url | getVoxelAjaxUrl() | ✅ Done |
| recaptcha() | executeRecaptcha() | ✅ Done |

## Code Quality

- ✅ TypeScript strict mode with comprehensive types
- ✅ useCallback for all API handlers (memoization)
- ✅ useEffect with proper dependencies
- ✅ useRef for DOM focus management
- ✅ Error handling with try/catch + Voxel.alert pattern
- ✅ Props-based component (config via props)
- ✅ Context parameter for editor vs frontend
- ✅ getRestBaseUrl() for multisite support
- ✅ Comments with API endpoint documentation

## Build Output

Build verified December 23, 2025:
```
frontend.js  64.22 kB | gzip: 11.94 kB
```

## Conclusion

The login/auth block has **100% parity** with Voxel's Vue.js implementation:

- ✅ Login with username/email + password + remember me
- ✅ Two-Factor Authentication login verification
- ✅ Registration with multiple roles and custom fields
- ✅ Registration field types: text, email, url, number, date, taxonomy, file, select, multiselect, switcher
- ✅ Email confirmation flow (5-digit auto-submit)
- ✅ Password recovery flow (email → code → new password)
- ✅ Profile update: password change
- ✅ Profile update: email change with verification
- ✅ 2FA setup with QR code
- ✅ 2FA enable with code verification
- ✅ 2FA disable with password confirmation
- ✅ Backup codes generation and copy
- ✅ Trusted devices management
- ✅ Personal data export request
- ✅ Account deletion with confirmation
- ✅ reCAPTCHA v3 integration for all actions
- ✅ Voxel.alert/prompt pattern for notifications
- ✅ Same CSS classes throughout
- ✅ Same API endpoints (?vx=1&action=auth.*)
- ✅ Same redirect URL handling
- ✅ Re-initialization prevention

This is a complete 1:1 implementation with zero gaps. All Voxel authentication features are fully replicated in React.
