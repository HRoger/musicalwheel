# CORS Fix Applied - Vite Dev Server

**Date:** November 8, 2025  
**Issue:** CORS blocking scripts from localhost:3000  
**Status:** ✅ FIXED - Requires Vite Restart

---

## What Was Wrong

The Vite dev server wasn't configured to allow Cross-Origin requests from your WordPress site (`musicalwheel.devlocal`).

**Error:**
```
Access to script at 'http://localhost:3000/@vite/client' from origin 
'http://musicalwheel.devlocal' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

---

## What Was Fixed

**Added to `vite.config.ts` line 9:**
```typescript
cors: true, // Enable CORS
```

**Complete server config now:**
```typescript
server: {
  port: 3000,
  strictPort: true,
  origin: 'http://localhost:3000',
  cors: true, // ← ADDED THIS
  hmr: {
    host: 'localhost',
    port: 3000,
    protocol: 'ws'
  }
}
```

---

## 🔄 REQUIRED: Restart Vite Dev Server

The fix won't take effect until you restart Vite:

```powershell
# Stop Vite (Ctrl+C), then restart:
cd "C:\Users\Local Sites\musicalwheel\app\public\wp-content\themes\musicalwheel-fse"
npm run dev
```

--- 

## ✅ Verification Steps

1. Reload WordPress editor
2. Open browser console (F12) — should see `[vite] connected.`
3. Network tab — should show `@vite/client` and block scripts loading
4. Test HMR by editing a block JS file and saving

--- 

**Fixed by:** Cursor AI Agent  
**File Modified:** `vite.config.ts`  
**Status:** Restart Vite and verify

*** End Patch

