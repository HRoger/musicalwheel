# Deployment Architecture Explained

**Date:** December 2025
**Question:** What is `apps/musicalwheel-frontend/` and how does deployment work?

---

## The Confusion: Two Separate Applications

You have **TWO completely separate codebases:**

### 1. WordPress Application (Backend)
**Location on your computer:**
```
c:\Users\Local Sites\musicalwheel\
```

**This is:**
- ✅ WordPress installation
- ✅ Voxel parent theme
- ✅ Voxel-FSE child theme (your blocks)
- ✅ Admin interface for content management

**Deployed to:** Your WordPress hosting (e.g., wp.musicalwheel.com)

**Access:** Admin-only (private)

---

### 2. Next.js Application (Frontend)
**Location on your computer:**
```
c:\Users\musicalwheel-nextjs\    (or anywhere you want)
```

**This is:**
- ✅ Next.js application
- ✅ React components
- ✅ Customer-facing website
- ✅ Fetches data from WordPress via API

**Deployed to:** Vercel (e.g., musicalwheel.com)

**Access:** Public (customers)

---

## Why Two Separate Directories?

**They are different applications!**

| Aspect | WordPress | Next.js |
|--------|-----------|---------|
| **Language** | PHP | JavaScript/TypeScript |
| **Runtime** | Apache/Nginx + PHP | Node.js |
| **Purpose** | Content management | Customer-facing website |
| **Users** | Admins only | Public customers |
| **Database** | WordPress MySQL | Fetches from WordPress API |
| **Deployment** | Traditional hosting | Vercel serverless |

**Analogy:**
```
WordPress  = Google Docs (where you write content)
Next.js    = Your published website (what readers see)
```

---

## Corrected Directory Structure

### Option 1: Separate Repositories (RECOMMENDED)

**WordPress Repository:**
```bash
# Location: c:\Users\Local Sites\musicalwheel\
# Git repo: github.com/yourname/musicalwheel-wordpress

musicalwheel/                          # WordPress root
├── wp-admin/
├── wp-includes/
├── wp-content/
│   ├── themes/
│   │   ├── voxel/                     # Parent theme
│   │   └── voxel-fse/                 # ⭐ Your child theme
│   │       ├── app/
│   │       │   └── blocks/
│   │       │       └── src/
│   │       │           ├── search-form/
│   │       │           ├── create-post/
│   │       │           └── popup-kit/
│   │       └── functions.php
│   └── plugins/
└── wp-config.php

# Deploy to: WP Engine, Kinsta, or your WordPress host
```

**Next.js Repository:**
```bash
# Location: c:\Users\musicalwheel-nextjs\
# Git repo: github.com/yourname/musicalwheel-frontend

musicalwheel-nextjs/                   # Next.js root
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── events/
│   │   └── page.tsx
│   └── [slug]/
│       └── page.tsx
├── components/
│   └── blocks/
│       ├── SearchFormBlock.tsx        # Renders WordPress blocks
│       ├── CreatePostBlock.tsx
│       └── PopupKitBlock.tsx
├── lib/
│   ├── wordpress.ts                   # WPGraphQL client
│   └── voxel-api.ts                   # Voxel REST API client
├── package.json
└── next.config.js

# Deploy to: Vercel
```

**Why separate repositories:**
- ✅ Different deployment targets
- ✅ Different teams can work independently
- ✅ Clear separation of concerns
- ✅ Standard practice for headless WordPress

---

### Option 2: Monorepo (Advanced)

**Only if you want everything in one repository:**

```bash
# Location: c:\Users\musicalwheel\
# Git repo: github.com/yourname/musicalwheel

musicalwheel/                          # Project root
├── wordpress/                         # WordPress application
│   ├── wp-content/
│   │   └── themes/
│   │       └── voxel-fse/
│   └── wp-config.php
│
├── apps/                              # ⭐ This is where "apps/" comes from
│   └── frontend/                      # Next.js application
│       ├── app/
│       ├── components/
│       └── package.json
│
├── package.json                       # Root package.json
└── .gitignore

# Deploy WordPress: ./wordpress/ to WP host
# Deploy Next.js: ./apps/frontend/ to Vercel
```

**Why monorepo:**
- ✅ Single git repository
- ✅ Shared TypeScript types
- ✅ Easier version control
- ⚠️ More complex setup
- ⚠️ Larger repository size

**The `apps/` directory:**
- It's a monorepo convention (not WordPress-specific)
- Holds multiple "applications" in one repository
- Common in JavaScript/TypeScript projects

---

## How Deployment Works

### WordPress Deployment (Traditional Hosting)

**Step 1: Choose WordPress Host**
- WP Engine (recommended for Voxel)
- Kinsta
- SiteGround
- Your current Local by Flywheel → Production

**Step 2: Deploy WordPress**

**Option A: Manual Upload (FTP/SFTP)**
```bash
# Export your WordPress site
# Upload to production server via FTP
# Import database
```

**Option B: Git Deployment**
```bash
# Push to GitHub
git push origin main

# SSH into server
cd /var/www/html
git pull origin main

# Or use deployment service like DeployHQ
```

**Option C: WordPress Host Tools**
```bash
# WP Engine: Use WP Engine's Git Push
# Kinsta: Use Kinsta's DevKinsta tool
```

**What gets deployed:**
```
WordPress Host (wp.musicalwheel.com)
├── wp-content/themes/voxel-fse/       # Your child theme
├── Database (MySQL)                   # Posts, users, settings
└── REST API endpoints                 # /wp-json/voxel/v1/*
```

**Result:** WordPress admin accessible at `https://wp.musicalwheel.com/wp-admin`

---

### Next.js Deployment (Vercel)

**Step 1: Create Next.js Project**

```bash
# On your computer
cd c:\Users\
npx create-next-app@latest musicalwheel-nextjs

# Answer prompts:
# ✓ TypeScript? Yes
# ✓ App Router? Yes
# ✓ Tailwind CSS? Yes (optional)
```

**Step 2: Build Your Components**

```bash
cd musicalwheel-nextjs

# Create block renderers
mkdir -p components/blocks
touch components/blocks/SearchFormBlock.tsx
```

**Step 3: Connect to Git**

```bash
# Initialize git
git init
git add .
git commit -m "Initial Next.js setup"

# Push to GitHub
gh repo create musicalwheel-frontend --public
git remote add origin https://github.com/yourname/musicalwheel-frontend.git
git push -u origin main
```

**Step 4: Deploy to Vercel**

**Method 1: Vercel Dashboard (Easiest)**

1. Go to https://vercel.com
2. Click "New Project"
3. Import from GitHub → Select `musicalwheel-frontend`
4. Click "Deploy"

**Vercel automatically:**
- ✅ Detects Next.js
- ✅ Runs `npm run build`
- ✅ Deploys to global CDN
- ✅ Gives you a URL: `musicalwheel.vercel.app`

**Method 2: Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd musicalwheel-nextjs
vercel

# Follow prompts:
# ✓ Link to existing project? No
# ✓ Project name? musicalwheel-frontend
# ✓ Production? Yes
```

**Step 5: Configure Environment Variables**

In Vercel dashboard:

```env
NEXT_PUBLIC_WORDPRESS_URL=https://wp.musicalwheel.com
NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://wp.musicalwheel.com/graphql
WORDPRESS_API_URL=https://wp.musicalwheel.com/wp-json

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

**Step 6: Configure Custom Domain**

In Vercel dashboard:
1. Project Settings → Domains
2. Add domain: `musicalwheel.com`
3. Update DNS records (Vercel provides instructions)

**Result:** Next.js site live at `https://musicalwheel.com`

---

## How They Connect

```
┌─────────────────────────────────────────────────────────────┐
│                    USER VISITS WEBSITE                       │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
          https://musicalwheel.com (Vercel Next.js)
                         │
          ┌──────────────┴──────────────┐
          │                             │
          ▼                             ▼
    Static Content              Dynamic Data Fetch
    (ISR Cached HTML)           (API Calls)
                                        │
                    ┌───────────────────┴───────────────────┐
                    │                                       │
                    ▼                                       ▼
    https://wp.musicalwheel.com/graphql    https://wp.musicalwheel.com/wp-json/voxel/v1/*
                    │                                       │
                    └───────────────────┬───────────────────┘
                                        │
                                        ▼
                            WordPress Database (MySQL)
                                        │
                                        ▼
                            Returns Data to Next.js
                                        │
                                        ▼
                              User Sees Rendered Page
```

**Example Flow:**

1. User visits `https://musicalwheel.com/events`
2. Vercel serves pre-rendered HTML (ISR cache)
3. Page loads instantly (0ms)
4. React hydrates (100ms)
5. Client-side fetches live data from `https://wp.musicalwheel.com/wp-json/voxel/v1/events`
6. Updates inventory/availability in real-time

---

## What You Upload to Vercel

**You DON'T upload files manually to Vercel!**

**Instead:**

```bash
# 1. Push to GitHub
git push origin main

# 2. Vercel automatically:
#    - Detects changes
#    - Pulls code from GitHub
#    - Runs npm install
#    - Runs npm run build
#    - Deploys to edge network
#    - Updates https://musicalwheel.com
```

**Vercel builds your Next.js app:**

```
Your Code (GitHub)
      ↓
Vercel Build System
      ↓
npm install         # Install dependencies
npm run build       # Build Next.js app
      ↓
Static HTML + API Routes
      ↓
Deploy to Edge CDN (Global)
      ↓
https://musicalwheel.com (Live)
```

---

## Deployment Workflow

### Daily Development

**1. Work on WordPress (Local)**
```bash
# Location: c:\Users\Local Sites\musicalwheel\
cd "c:\Users\Local Sites\musicalwheel\wp-content\themes\voxel-fse"

# Make changes to blocks
code app/blocks/src/search-form/edit.tsx

# Build blocks
npm run build

# Test in WordPress admin
# http://musicalwheel.local/wp-admin
```

**2. Work on Next.js (Local)**
```bash
# Location: c:\Users\musicalwheel-nextjs\
cd c:\Users\musicalwheel-nextjs

# Make changes to frontend
code components/blocks/SearchFormBlock.tsx

# Run dev server
npm run dev

# Test in browser
# http://localhost:3000
```

**3. Commit and Push**
```bash
# WordPress repo
cd "c:\Users\Local Sites\musicalwheel"
git add .
git commit -m "Update search form block"
git push origin main

# Next.js repo
cd c:\Users\musicalwheel-nextjs
git add .
git commit -m "Update search form renderer"
git push origin main
```

**4. Automatic Deployment**
```
GitHub (WordPress repo)
   ↓
   Manual deployment to WP host
   or
   Automatic via DeployHQ/WP Engine Git

GitHub (Next.js repo)
   ↓
   Vercel automatically detects push
   ↓
   Builds and deploys in 2-3 minutes
   ↓
   https://musicalwheel.com updated
```

---

## Simplified Structure for You

**Recommended: Two Separate Directories**

### Your Computer Setup

```
c:\Users\
├── Local Sites\
│   └── musicalwheel\                 # WordPress (Local by Flywheel)
│       ├── wp-content/
│       │   └── themes/
│       │       └── voxel-fse/        # Your blocks
│       └── wp-config.php
│
└── Projects\
    └── musicalwheel-nextjs\          # Next.js frontend
        ├── app/
        ├── components/
        └── package.json
```

### Git Repositories

```
GitHub:
├── yourname/musicalwheel-wordpress   # WordPress theme
└── yourname/musicalwheel-nextjs      # Next.js frontend
```

### Production Servers

```
WordPress Host (WP Engine):
└── https://wp.musicalwheel.com
    └── Admin-only WordPress

Vercel:
└── https://musicalwheel.com
    └── Customer-facing Next.js site
```

---

## Step-by-Step: Setting Up Next.js

### Step 1: Create Next.js Project

```bash
# Open Command Prompt
cd c:\Users\

# Create Next.js app
npx create-next-app@latest musicalwheel-nextjs

# Answer prompts:
# ✓ TypeScript? Yes
# ✓ ESLint? Yes
# ✓ Tailwind CSS? Yes
# ✓ `src/` directory? No
# ✓ App Router? Yes
# ✓ Import alias? No

# Navigate into project
cd musicalwheel-nextjs
```

### Step 2: Install Dependencies

```bash
npm install @apollo/client graphql
npm install @supabase/supabase-js
npm install swr
```

### Step 3: Create WordPress API Client

**lib/wordpress.ts**
```typescript
import { ApolloClient, InMemoryCache } from '@apollo/client';

export const client = new ApolloClient({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
  cache: new InMemoryCache(),
});

export async function getPage(slug: string) {
  // Fetch page data from WordPress
}

export async function getVoxelFilters(postType: string) {
  // Fetch from REST API
  const res = await fetch(
    `${process.env.WORDPRESS_API_URL}/voxel/v1/post-type-filters?post_type=${postType}`
  );
  return res.json();
}
```

### Step 4: Create Block Renderer

**components/blocks/SearchFormBlock.tsx**
```typescript
'use client';

import { useState } from 'react';
import useSWR from 'swr';

interface SearchFormBlockProps {
  attributes: {
    postType: string;
    enabledFilters: string[];
  };
}

export function SearchFormBlock({ attributes }: SearchFormBlockProps) {
  const { data: filters } = useSWR(
    `/api/voxel/filters/${attributes.postType}`,
    fetcher
  );

  return (
    <div className="voxel-search-form">
      {filters?.map(filter => (
        <FilterComponent key={filter.key} filter={filter} />
      ))}
    </div>
  );
}
```

### Step 5: Create Page

**app/events/page.tsx**
```typescript
import { SearchFormBlock } from '@/components/blocks/SearchFormBlock';

export const revalidate = 86400; // 24 hours ISR

export default async function EventsPage() {
  const filters = await fetch(
    `${process.env.WORDPRESS_API_URL}/voxel/v1/post-type-filters?post_type=events`,
    { next: { revalidate: 86400 } }
  ).then(r => r.json());

  return (
    <div>
      <h1>Find Events</h1>
      <SearchFormBlock
        attributes={{
          postType: 'events',
          enabledFilters: ['location', 'date']
        }}
        filterDefinitions={filters}
      />
    </div>
  );
}
```

### Step 6: Test Locally

```bash
# Start dev server
npm run dev

# Open browser
# http://localhost:3000/events
```

### Step 7: Deploy to Vercel

```bash
# Initialize git
git init
git add .
git commit -m "Initial commit"

# Push to GitHub
gh repo create musicalwheel-nextjs --public
git remote add origin https://github.com/yourname/musicalwheel-nextjs.git
git push -u origin main

# Deploy to Vercel
vercel

# Or use Vercel dashboard:
# https://vercel.com/new
# Import from GitHub
```

**Done!** Your Next.js site is live on Vercel.

---

## Common Questions

### Q: Do I need to upload files to Vercel?
**A:** No! You push to GitHub, Vercel pulls and builds automatically.

### Q: Where does Next.js run?
**A:** On Vercel's serverless edge network (global CDN).

### Q: How does Next.js get WordPress data?
**A:** Via API calls to `https://wp.musicalwheel.com/wp-json` and `/graphql`.

### Q: Can I run Next.js on my WordPress host?
**A:** Technically yes, but Vercel is optimized for Next.js (ISR, edge functions, etc).

### Q: What if I don't want Vercel?
**A:** You can deploy Next.js to:
- Netlify
- AWS Amplify
- Cloudflare Pages
- Self-hosted Node.js server

But Vercel is recommended (built by Next.js creators).

---

## Summary

**Two Separate Applications:**

| | WordPress | Next.js |
|---|-----------|---------|
| **Purpose** | Content management | Customer website |
| **Location** | `c:\Users\Local Sites\musicalwheel\` | `c:\Users\musicalwheel-nextjs\` |
| **Language** | PHP | TypeScript |
| **Deployed to** | WP Engine/Kinsta | Vercel |
| **URL** | wp.musicalwheel.com | musicalwheel.com |
| **Access** | Admin-only | Public |

**They communicate via API:**
```
Next.js (Vercel) ──API calls──► WordPress (WP Host)
                 ◄────JSON─────
```

**Deployment:**
- WordPress: Traditional hosting (manual upload or Git)
- Next.js: Push to GitHub → Vercel auto-builds and deploys

**You don't upload files to Vercel** - you connect GitHub and Vercel handles everything automatically! 🚀
