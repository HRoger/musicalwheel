# Phase 4: Headless Next.js Frontend - Implementation Guide v2.0

**Version:** 2.0 (Post-Consolidation)
**Status:** Planning
**Architecture:** Headless WordPress (Backend) + Next.js (Frontend) + Supabase (Social)
**Platform:** Vercel
**Estimated Duration:** 15-20 days

---

## 📋 Overview

Phase 4 transforms MusicalWheel into a fully headless platform with Next.js frontend on Vercel, consuming data from WordPress (directory/e-commerce) and Supabase (social features).

**Key Goals:**
- Build Next.js 14+ frontend with App Router
- Implement complete frontend obfuscation (no WordPress identifiers)
- Integrate with WordPress via WPGraphQL
- Integrate with Supabase for real-time features
- Deploy to Vercel with ISR and edge functions
- Implement frontend translation system (i18n + Google Translate API)

**Architecture Decision:**
Complete separation of frontend and backend. Next.js communicates only via APIs.

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Vercel Edge Network                   │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │         Next.js 14 (App Router)                │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐    │    │
│  │  │  Pages   │  │Components│  │   API    │    │    │
│  │  │ (App/)   │  │   UI     │  │ Routes   │    │    │
│  │  └──────────┘  └──────────┘  └──────────┘    │    │
│  └────────────────────────────────────────────────┘    │
│                          ↓                              │
│                   Edge Functions                        │
└─────────────────────────────────────────────────────────┘
                           ↓
        ┌──────────────────┴─────────────────┐
        ↓                                    ↓
┌─────────────────┐              ┌──────────────────┐
│   WordPress     │              │    Supabase      │
│  (Rocket.net)   │              │   (PostgreSQL)   │
│                 │              │                  │
│  WPGraphQL API  │              │  Realtime API    │
│  REST API       │              │  Storage API     │
│  JWT Auth       │              │  Auth API        │
└─────────────────┘              └──────────────────┘
```

### Data Flow

```
User Request → Vercel Edge → Next.js SSR/ISR
                    ↓
         ┌──────────┴──────────┐
         ↓                     ↓
    WordPress              Supabase
    (Directory)            (Social)
         ↓                     ↓
    GraphQL/REST          Realtime
         ↓                     ↓
    Next.js Server ← Combine → Next.js Server
         ↓
    HTML Response → User
```

### Directory Structure

```
musicalwheel-frontend/  (separate repository)
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── (directory)/
│   │   ├── artists/
│   │   ├── venues/
│   │   ├── events/
│   │   └── layout.tsx
│   ├── (social)/
│   │   ├── timeline/
│   │   ├── chat/
│   │   ├── events/
│   │   └── layout.tsx
│   ├── (marketplace)/
│   │   ├── products/
│   │   ├── cart/
│   │   ├── checkout/
│   │   └── layout.tsx
│   └── api/
│       ├── graphql/
│       ├── supabase/
│       ├── revalidate/
│       └── translate/
├── components/
│   ├── ui/ (shadcn/ui)
│   ├── blocks/ (WordPress block renderers)
│   ├── social/ (Timeline, Chat, Events)
│   └── marketplace/ (Product, Cart, Checkout)
├── lib/
│   ├── wordpress/
│   │   ├── client.ts (GraphQL client)
│   │   ├── queries.ts
│   │   └── auth.ts (JWT)
│   ├── supabase/
│   │   ├── client.ts
│   │   └── realtime.ts
│   ├── utils/
│   └── hooks/
├── styles/
│   └── globals.css (Tailwind)
├── public/
├── .env.local
├── next.config.js
├── tailwind.config.ts
└── package.json
```

---

## 📅 Implementation Plan

### Task 4.1: Next.js Setup & Basic Structure (2-3 days)

**Objective:** Set up Next.js 14 project with App Router and basic configuration

**Deliverables:**
1. **Project Initialization**
   - Create Next.js 14 project
   - Configure TypeScript (strict mode)
   - Set up ESLint + Prettier
   - Configure Tailwind CSS v4

2. **Environment Configuration**
   - `.env.local` for local development
   - `.env.production` for Vercel
   - Environment variables:
     ```env
     WORDPRESS_API_URL=https://api.musicalwheel.com/graphql
     WORDPRESS_REST_URL=https://api.musicalwheel.com/wp-json
     SUPABASE_URL=https://xxx.supabase.co
     SUPABASE_ANON_KEY=xxx
     NEXT_PUBLIC_SITE_URL=https://musicalwheel.com
     GOOGLE_TRANSLATE_API_KEY=xxx
     ```

3. **Routing Structure**
   - App Router layout structure
   - Route groups for organization
   - Loading and error states
   - Not-found pages

4. **UI Foundation**
   - Install shadcn/ui components
   - Configure theme (light/dark)
   - Typography system
   - Responsive breakpoints

**Acceptance Criteria:**
- [ ] Next.js 14 running locally
- [ ] TypeScript configured (strict)
- [ ] Tailwind CSS v4 working
- [ ] shadcn/ui components accessible
- [ ] Environment variables loading
- [ ] Basic routing working

---

### Task 4.2: WordPress Integration (3-4 days)

**Objective:** Integrate with WordPress via WPGraphQL

**Deliverables:**
1. **GraphQL Client Setup**
   - Location: `lib/wordpress/client.ts`
   - Apollo Client configuration
   - Request/response caching
   - Error handling

2. **Authentication**
   - Location: `lib/wordpress/auth.ts`
   - JWT token management
   - Refresh token rotation
   - Session persistence (cookies)

3. **GraphQL Queries**
   - Location: `lib/wordpress/queries.ts`
   - Post queries (artists, venues, events)
   - User queries
   - Product queries
   - Navigation menus
   - Theme settings

4. **Data Fetching Patterns**
   - Server Components for static content
   - ISR for semi-dynamic content
   - Client Components for user-specific content
   - Optimistic updates

**Example Implementation:**
```typescript
// lib/wordpress/client.ts
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: process.env.WORDPRESS_API_URL,
});

const authLink = setContext((_, { headers }) => {
  const token = getAuthToken(); // from cookies
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
```

**Acceptance Criteria:**
- [ ] GraphQL client configured
- [ ] Can fetch posts from WordPress
- [ ] Authentication working (JWT)
- [ ] Queries properly typed
- [ ] Caching working
- [ ] Error handling robust

---

### Task 4.3: Supabase Real-Time Integration (2-3 days)

**Objective:** Integrate Supabase for social features

**Deliverables:**
1. **Supabase Client**
   - Location: `lib/supabase/client.ts`
   - Client-side and server-side clients
   - Auth integration
   - Type generation from database

2. **Real-Time Subscriptions**
   - Location: `lib/supabase/realtime.ts`
   - Timeline updates
   - Chat messages
   - Presence tracking
   - Event streams

3. **React Hooks**
   - `useTimeline()` - Timeline posts
   - `useChat()` - Chat messages
   - `usePresence()` - Online status
   - `useLiveEvent()` - Live event data

4. **Optimistic Updates**
   - Immediate UI updates
   - Rollback on error
   - Conflict resolution

**Example Hook:**
```typescript
// lib/hooks/useChat.ts
export function useChat(roomId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const supabase = useSupabaseClient();

  useEffect(() => {
    // Subscribe to new messages
    const subscription = supabase
      .channel(`room:${roomId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `room_id=eq.${roomId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [roomId]);

  const sendMessage = async (content: string) => {
    // Optimistic update
    const tempId = crypto.randomUUID();
    const optimisticMessage = { id: tempId, content, pending: true };
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({ room_id: roomId, content })
        .select()
        .single();

      if (error) throw error;

      // Replace optimistic with real
      setMessages(prev =>
        prev.map(m => m.id === tempId ? data : m)
      );
    } catch (error) {
      // Rollback on error
      setMessages(prev => prev.filter(m => m.id !== tempId));
      throw error;
    }
  };

  return { messages, sendMessage };
}
```

**Acceptance Criteria:**
- [ ] Supabase client configured
- [ ] Real-time subscriptions working
- [ ] Chat updates in real-time
- [ ] Timeline updates in real-time
- [ ] Presence tracking working
- [ ] Optimistic updates functional

---

### Task 4.4: Frontend Translation System (3-4 days)

**Objective:** Implement i18n with Google Translate API for content translation

**Features:**
- WordPress stores content in original language only
- Next.js handles ALL translation (UI + content)
- Google Translate API for automatic translation
- Manual translation overrides
- Language switcher UI

**Deliverables:**
1. **i18n Configuration**
   - next-intl or next-i18next
   - Supported languages configuration
   - Locale detection
   - URL structure: `/es/artists`, `/fr/venues`

2. **Translation API Route**
   - Location: `app/api/translate/route.ts`
   - Google Translate API integration
   - Translation caching (Redis/Vercel KV)
   - Rate limiting

3. **Content Translation**
   - Detect originalLanguage from WordPress
   - Auto-translate if needed
   - Cache translations
   - Fallback to original

4. **UI Components**
   - Language switcher component
   - Locale-aware formatting (dates, numbers)
   - RTL support (Arabic, Hebrew)

**Implementation Example:**
```typescript
// app/api/translate/route.ts
import { Translate } from '@google-cloud/translate/build/src/v2';

const translate = new Translate({
  key: process.env.GOOGLE_TRANSLATE_API_KEY
});

export async function POST(request: Request) {
  const { text, targetLang, sourceLang } = await request.json();

  // Check cache first
  const cacheKey = `${sourceLang}:${targetLang}:${hashText(text)}`;
  const cached = await kv.get(cacheKey);
  if (cached) return Response.json({ translation: cached });

  // Translate
  const [translation] = await translate.translate(text, {
    from: sourceLang,
    to: targetLang
  });

  // Cache for 30 days
  await kv.set(cacheKey, translation, { ex: 2592000 });

  return Response.json({ translation });
}
```

**Acceptance Criteria:**
- [ ] Multiple languages supported
- [ ] Content auto-translates
- [ ] Translations cached
- [ ] Language switcher working
- [ ] Dates/numbers localized
- [ ] RTL support working

---

### Task 4.5: Page Templates & Components (4-5 days)

**Objective:** Build all page templates and reusable components

**Page Templates:**
1. **Directory Pages**
   - Artist listing page
   - Artist single page
   - Venue listing page
   - Venue single page
   - Event listing page
   - Event single page

2. **Social Pages**
   - Timeline feed
   - User profile
   - Chat inbox
   - Live events page

3. **Marketplace Pages**
   - Product listing
   - Product single
   - Cart
   - Checkout
   - Order confirmation

4. **Auth Pages**
   - Login
   - Register
   - Password reset
   - Email verification

**Components to Build:**
1. **WordPress Block Renderers**
   - Core blocks (paragraph, heading, image)
   - Custom blocks (dynamic-text, dynamic-heading)
   - Product blocks (form, cart, checkout)

2. **Social Components**
   - Timeline post card
   - Chat message bubble
   - Live event viewer
   - Team widget

3. **UI Components**
   - Header/navigation
   - Footer
   - Sidebar
   - Search
   - Filters
   - Pagination

**Acceptance Criteria:**
- [ ] All page templates complete
- [ ] All components functional
- [ ] WordPress blocks render correctly
- [ ] Responsive on all devices
- [ ] Accessible (WCAG 2.1 AA)
- [ ] Performance optimized

---

### Task 4.6: Obfuscation & Security (1-2 days)

**Objective:** Remove ALL WordPress identifiers from frontend

**Implementation:**
1. **Complete Obfuscation**
   - No `wp-*` classes in HTML
   - No WordPress meta tags
   - Custom error pages (no WordPress branding)
   - Custom 404/500 pages

2. **Security Headers**
   - Configure in `next.config.js`
   - CSP (Content Security Policy)
   - HSTS
   - X-Frame-Options
   - Permissions-Policy

3. **API Protection**
   - WordPress API accessible only from Vercel IPs
   - Rate limiting on all API routes
   - CORS configured properly
   - JWT validation on all protected routes

**next.config.js Security:**
```javascript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}
```

**Acceptance Criteria:**
- [ ] No WordPress identifiers visible
- [ ] Security headers configured
- [ ] API access restricted
- [ ] Rate limiting working
- [ ] Error pages branded
- [ ] Lighthouse security: 100/100

---

### Task 4.7: Deployment & Optimization (1-2 days)

**Objective:** Deploy to Vercel with optimal performance

**Deliverables:**
1. **Vercel Configuration**
   - Project setup on Vercel
   - Environment variables configured
   - Custom domain setup
   - Preview deployments

2. **ISR Configuration**
   - Identify pages for ISR
   - Revalidation intervals
   - On-demand revalidation webhook
   - Cache strategies

3. **Performance Optimization**
   - Image optimization (next/image)
   - Font optimization (next/font)
   - Code splitting
   - Bundle analysis
   - Lazy loading

4. **Monitoring**
   - Vercel Analytics
   - Error tracking (Sentry)
   - Performance monitoring
   - User analytics

**ISR Example:**
```typescript
// app/(directory)/artists/[slug]/page.tsx
export async function generateStaticParams() {
  const { data } = await client.query({
    query: GET_ALL_ARTISTS
  });

  return data.artists.nodes.map((artist) => ({
    slug: artist.slug,
  }));
}

export const revalidate = 3600; // Revalidate every hour

export default async function ArtistPage({ params }) {
  const { data } = await client.query({
    query: GET_ARTIST,
    variables: { slug: params.slug }
  });

  return <ArtistTemplate artist={data.artist} />;
}
```

**Acceptance Criteria:**
- [ ] Deployed to Vercel production
- [ ] Custom domain working
- [ ] ISR configured correctly
- [ ] Images optimized
- [ ] Lighthouse performance: 90+
- [ ] Error tracking active
- [ ] Analytics configured

---

## 🧪 Testing Strategy

### Unit Tests (Jest + React Testing Library)
- Component rendering
- Hook behavior
- Utility functions
- API route handlers

### Integration Tests (Playwright)
- User flows (login, post creation, checkout)
- GraphQL integration
- Supabase integration
- Translation system

### E2E Tests (Playwright)
- Full user journeys
- Cross-browser testing
- Mobile responsiveness
- Performance benchmarks

### Performance Tests
- Lighthouse CI
- Core Web Vitals
- Load time analysis
- Bundle size tracking

---

## 📚 Documentation

**Create during Phase 4:**
1. `docs/frontend/README.md` - Overview
2. `docs/frontend/setup.md` - Local development setup
3. `docs/frontend/deployment.md` - Deployment guide
4. `docs/frontend/architecture.md` - Architecture decisions
5. `docs/frontend/components.md` - Component library
6. `docs/frontend/translation.md` - Translation system

---

## 🔗 Dependencies

**Required Before Starting:**
- ✅ Phase 1 complete (WordPress backend)
- ✅ Phase 2 complete (Product Types)
- ✅ Phase 3 complete (Social features)
- Vercel account (Pro plan recommended)
- Google Cloud account (for Translate API)

**External Services:**
- Vercel (hosting)
- Google Translate API
- Vercel KV (caching)
- Sentry (error tracking)
- Vercel Analytics

---

## 💰 Cost Estimates

**Vercel Pro:**
- $20/month per member
- Expected: $20/month

**Vercel KV (Redis):**
- Free tier: 256MB
- Pro tier: ~$10/month
- Expected: Free tier initially

**Google Translate API:**
- $20 per 1M characters
- Expected: ~$50-100/month

**Sentry:**
- Free tier: 5K errors/month
- Expected: Free tier

**Total estimated:** ~$70-130/month

---

## 🔮 Future Enhancements (Post-Phase 4)

- Progressive Web App (PWA)
- Offline mode
- Push notifications (web)
- A/B testing platform
- Advanced caching strategies
- Edge rendering for personalization
- Video streaming optimization

---

**Created:** November 2025
**Last Updated:** November 2025
**Architecture Version:** 2.0 (Headless with Next.js)
