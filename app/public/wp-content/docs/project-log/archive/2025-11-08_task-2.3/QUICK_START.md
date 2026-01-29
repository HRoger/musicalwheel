# Block System - Quick Start Guide

**For:** Next developer working on MusicalWheel FSE  
**Updated:** November 8, 2025

---

## 🚀 Start Development (2 Commands)

```powershell
# 1. Navigate to theme directory
cd "C:\Users\Local Sites\musicalwheel\app\public\wp-content\themes\musicalwheel-fse"

# 2. Start Vite dev server (HMR enabled)
npm run dev
```

**That's it!** Now you have:
- ✅ Hot Module Replacement (edit JS → instant update)
- ✅ All blocks loading from localhost:3000
- ✅ Fast development workflow

--- 

## 📦 Create New Block (3 Steps)

1. Create folder: `app/blocks/src/my-new-block`
2. Create `block.json` (see template in full docs)
3. Create `index.js` (editor + save functions)

Done — block appears automatically.

--- 

## 🧪 Testing Your Block

1. Start Vite: `npm run dev`  
2. Open WordPress editor  
3. Insert block and edit JS — see instant updates

--- 

## 📁 Important Files

- `app/blocks/Block_Loader.php` - Auto-discovery logic  
- `functions.php` - Calls `Block_Loader::init()`  
- `vite.config.ts` - Dev/prod config

--- 

**Happy Coding!** 🎉

*** End Patch

