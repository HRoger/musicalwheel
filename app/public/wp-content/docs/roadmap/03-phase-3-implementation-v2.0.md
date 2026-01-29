# Phase 3: Social Features Extended - Implementation Guide v2.0

**Version:** 2.0 (Post-Consolidation)
**Status:** Planning
**Architecture:** All-in FSE Child Theme + External Database (Supabase)
**Focus:** Timeline Extended, Chat, Live Events, External DB Integration
**Estimated Duration:** 20-28 days

---

## 📋 Overview

Phase 3 extends MusicalWheel's social features with a hybrid architecture: WordPress for directory/content, Supabase for real-time social interactions.

**Key Goals:**
- Extend Timeline with Twitter-like features (video, audio, teams)
- Implement real-time chat system
- Build live events platform
- Integrate Supabase as external database
- Synchronize users between WordPress and Supabase
- Prepare for headless Next.js frontend (Phase 4)

**Architecture Decision:**
Hybrid approach - WordPress (directory) + Supabase (social) with user synchronization.

---

## 🏗️ Architecture

### Hybrid Database Strategy

```
WordPress Database (MySQL)
├── Users (wp_users) - Source of truth
├── Posts (directory content)
├── Product Types (e-commerce)
└── Custom Fields (metadata)

Supabase Database (PostgreSQL)
├── users (synced from WordPress)
├── timeline_posts
├── timeline_media (video, audio, images)
├── teams
├── messages (chat)
├── events (live events)
├── follows
├── likes
└── notifications
```

### Data Flow

```
WordPress ←→ Sync Service ←→ Supabase
    ↓                              ↓
REST API                      Realtime API
    ↓                              ↓
Next.js Frontend (Phase 4)
```

### Directory Structure

```
themes/voxel-fse/
├── app/
│   ├── controllers/
│   │   ├── social/
│   │   │   ├── Timeline_Controller.php
│   │   │   ├── Chat_Controller.php
│   │   │   ├── Events_Controller.php
│   │   │   └── Sync_Controller.php
│   │   └── fse-base-controller.php
│   ├── social/
│   │   ├── timeline/
│   │   │   ├── Timeline_Post.php
│   │   │   ├── Media_Handler.php
│   │   │   └── Teams.php
│   │   ├── chat/
│   │   │   ├── Chat_Room.php
│   │   │   ├── Message.php
│   │   │   └── Realtime_Handler.php
│   │   ├── events/
│   │   │   ├── Live_Event.php
│   │   │   ├── Event_Stream.php
│   │   │   └── Attendees.php
│   │   └── sync/
│   │       ├── Supabase_Client.php
│   │       ├── User_Sync.php
│   │       └── Webhooks.php
│   ├── blocks/src/
│   │   ├── timeline-feed/
│   │   ├── timeline-post-form/
│   │   ├── chat-widget/
│   │   └── live-event-viewer/
│   └── api/
│       ├── timeline/
│       ├── chat/
│       └── events/
└── supabase/ (configuration)
    ├── migrations/
    ├── functions/
    └── schema.sql
```

---

## 📅 Implementation Plan

### Task 3.1: Supabase Setup & User Sync (3-4 days)

**Objective:** Set up Supabase and implement WordPress ↔ Supabase user synchronization

**Deliverables:**
1. **Supabase Project Setup**
   - Create Supabase project
   - Configure database schema
   - Set up authentication (JWT from WordPress)
   - Configure Row Level Security (RLS)

2. **User Sync System**
   - Location: `app/social/sync/User_Sync.php`
   - Hook: `user_register`, `profile_update`, `delete_user`
   - Sync direction: WordPress → Supabase (WordPress is source of truth)
   - Fields synced: ID, username, email, avatar, role, meta

3. **Supabase Client Wrapper**
   - Location: `app/social/sync/Supabase_Client.php`
   - Namespace: `VoxelFSE\Social\Sync`
   - Methods: insert(), update(), delete(), query()
   - Error handling and retry logic

4. **Webhook Handlers**
   - Endpoint: `/wp-json/voxel-fse/v1/supabase/webhook`
   - Handle Supabase events
   - Validate webhook signatures

**Database Schema (Supabase):**
```sql
-- Users table (synced from WordPress)
CREATE TABLE users (
  id bigint PRIMARY KEY,  -- WordPress user ID
  username text NOT NULL UNIQUE,
  email text NOT NULL,
  avatar_url text,
  role text,
  metadata jsonb,
  synced_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- User can read their own data
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid()::bigint = id);
```

**Acceptance Criteria:**
- [ ] Supabase project configured
- [ ] User sync working bidirectionally
- [ ] New WordPress users appear in Supabase
- [ ] User updates sync correctly
- [ ] Deleted users removed from Supabase
- [ ] Error handling working

---

### Task 3.2: Timeline Extended (6-8 days)

**Objective:** Build Twitter-like timeline with video, audio, teams features

**Features to Implement:**
1. **Media Upload**
   - Video upload (MP4, WebM)
   - Audio upload (MP3, WAV)
   - Image galleries
   - File size limits (configurable)
   - Thumbnail generation

2. **Teams Feature**
   - Create/join teams
   - Team timelines
   - Team permissions
   - Team mentions (@teamname)

3. **Advanced Interactions**
   - Threaded replies
   - Quote posts
   - Polls
   - Hashtags
   - Mentions (@username)
   - Bookmarks

4. **Content Moderation**
   - Report posts
   - Hide/block users
   - Admin moderation tools
   - Content filters

**Deliverables:**
1. **Timeline Post Model**
   - Location: `app/social/timeline/Timeline_Post.php`
   - Storage: Supabase `timeline_posts` table
   - Support for text, video, audio, images
   - Metadata: likes, shares, views, replies

2. **Media Handler**
   - Location: `app/social/timeline/Media_Handler.php`
   - Upload to WordPress media library
   - Store metadata in Supabase
   - CDN integration ready

3. **Teams System**
   - Location: `app/social/timeline/Teams.php`
   - Team CRUD operations
   - Membership management
   - Team-specific timelines

4. **Frontend Blocks**
   - `timeline-feed` block (displays posts)
   - `timeline-post-form` block (create posts)
   - `timeline-profile` block (user timeline)
   - `teams-widget` block (team management)

**Supabase Schema:**
```sql
-- Timeline posts
CREATE TABLE timeline_posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id bigint REFERENCES users(id),
  team_id uuid REFERENCES teams(id),
  content text NOT NULL,
  media jsonb,  -- [{type, url, thumbnail}]
  parent_id uuid REFERENCES timeline_posts(id),  -- for replies
  quote_id uuid REFERENCES timeline_posts(id),   -- for quotes
  metadata jsonb,  -- likes, shares, views
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Teams
CREATE TABLE teams (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  avatar_url text,
  owner_id bigint REFERENCES users(id),
  settings jsonb,
  created_at timestamptz DEFAULT now()
);

-- Team members
CREATE TABLE team_members (
  team_id uuid REFERENCES teams(id),
  user_id bigint REFERENCES users(id),
  role text DEFAULT 'member',  -- owner, admin, member
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (team_id, user_id)
);
```

**Acceptance Criteria:**
- [ ] Users can post text, video, audio
- [ ] Media uploads working with size limits
- [ ] Teams can be created and managed
- [ ] Team timelines functional
- [ ] Replies and quotes working
- [ ] Hashtags and mentions functional
- [ ] Moderation tools working

---

### Task 3.3: Real-Time Chat (5-6 days)

**Objective:** Build real-time chat system with Supabase Realtime

**Features to Implement:**
1. **Direct Messages (DM)**
   - 1-on-1 conversations
   - Read receipts
   - Typing indicators
   - Message reactions

2. **Group Chats**
   - Create group chats
   - Add/remove members
   - Group admin permissions
   - Group settings

3. **Real-Time Features**
   - Instant message delivery
   - Online status
   - Presence indicators
   - Notification badges

4. **Rich Content**
   - Text messages
   - Emoji support
   - File attachments
   - Link previews
   - Voice messages

**Deliverables:**
1. **Chat Room Model**
   - Location: `app/social/chat/Chat_Room.php`
   - Room types: direct, group
   - Metadata: participants, settings

2. **Message Model**
   - Location: `app/social/chat/Message.php`
   - Support for text, files, voice
   - Read status tracking

3. **Realtime Handler**
   - Location: `app/social/chat/Realtime_Handler.php`
   - Supabase Realtime integration
   - Presence tracking
   - Push notifications

4. **Frontend Block**
   - `chat-widget` block (full chat UI)
   - Inbox view
   - Conversation view
   - Responsive design

**Supabase Schema:**
```sql
-- Chat rooms
CREATE TABLE chat_rooms (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type text NOT NULL,  -- direct, group
  name text,
  participants bigint[],  -- user IDs
  settings jsonb,
  created_at timestamptz DEFAULT now()
);

-- Messages
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id uuid REFERENCES chat_rooms(id),
  user_id bigint REFERENCES users(id),
  content text,
  attachments jsonb,
  read_by bigint[],  -- user IDs who read
  created_at timestamptz DEFAULT now()
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_rooms;
```

**Acceptance Criteria:**
- [ ] DMs work in real-time
- [ ] Group chats functional
- [ ] Typing indicators working
- [ ] Read receipts accurate
- [ ] File attachments upload correctly
- [ ] Presence tracking working
- [ ] Push notifications sent

---

### Task 3.4: Live Events Platform (4-5 days)

**Objective:** Build live streaming events platform

**Features to Implement:**
1. **Event Creation**
   - Create live events
   - Schedule events
   - Event descriptions
   - Event categories

2. **Live Streaming**
   - Stream integration (Agora, Twitch, YouTube)
   - Screen sharing
   - Multiple speakers
   - Moderated chat

3. **Attendee Management**
   - RSVP system
   - Attendee list
   - Capacity limits
   - Waiting rooms

4. **Recording & Replay**
   - Auto-record events
   - Video-on-demand (VOD)
   - Highlights/clips
   - Transcripts

**Deliverables:**
1. **Live Event Model**
   - Location: `app/social/events/Live_Event.php`
   - Event lifecycle management
   - Settings: public/private, capacity, etc.

2. **Event Stream Handler**
   - Location: `app/social/events/Event_Stream.php`
   - Integration with streaming services
   - WebRTC setup for direct streaming
   - Recording management

3. **Attendees System**
   - Location: `app/social/events/Attendees.php`
   - RSVP handling
   - Check-in system
   - Capacity management

4. **Frontend Block**
   - `live-event-viewer` block
   - Event creation form
   - Attendee management UI
   - Live chat during event

**Supabase Schema:**
```sql
-- Events
CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  host_id bigint REFERENCES users(id),
  scheduled_at timestamptz NOT NULL,
  duration_minutes int,
  stream_url text,
  recording_url text,
  status text DEFAULT 'scheduled',  -- scheduled, live, ended
  settings jsonb,
  created_at timestamptz DEFAULT now()
);

-- Event attendees
CREATE TABLE event_attendees (
  event_id uuid REFERENCES events(id),
  user_id bigint REFERENCES users(id),
  status text DEFAULT 'registered',  -- registered, attended, no-show
  joined_at timestamptz,
  PRIMARY KEY (event_id, user_id)
);
```

**Acceptance Criteria:**
- [ ] Events can be created and scheduled
- [ ] Live streaming working
- [ ] Attendees can RSVP
- [ ] Live chat during events
- [ ] Events auto-record
- [ ] VOD available after event
- [ ] Capacity limits enforced

---

### Task 3.5: API Layer & Next.js Prep (2-3 days)

**Objective:** Create REST API for Next.js frontend (Phase 4 prep)

**Deliverables:**
1. **REST API Endpoints**
   - `/wp-json/voxel-fse/v1/timeline/*`
   - `/wp-json/voxel-fse/v1/chat/*`
   - `/wp-json/voxel-fse/v1/events/*`
   - `/wp-json/voxel-fse/v1/teams/*`

2. **GraphQL Schema (WPGraphQL)**
   - Timeline types
   - Chat types
   - Event types
   - Team types

3. **Authentication**
   - JWT tokens for API access
   - Supabase JWT integration
   - Refresh token handling

4. **Documentation**
   - API reference docs
   - Example requests/responses
   - Postman collection

**Acceptance Criteria:**
- [ ] All REST endpoints functional
- [ ] GraphQL schema complete
- [ ] JWT auth working
- [ ] API documentation complete
- [ ] Rate limiting implemented
- [ ] CORS configured for Next.js

---

## 🧪 Testing Strategy

### Unit Tests
- User sync logic
- Timeline post creation
- Message sending
- Event creation

### Integration Tests
- WordPress → Supabase sync
- Real-time message delivery
- Live event streaming
- File uploads

### Load Tests
- 1000 concurrent chat users
- 100 concurrent live event viewers
- Timeline with 10K posts
- Media upload performance

---

## 📚 Documentation

**Create during Phase 3:**
1. `docs/social/README.md` - Overview
2. `docs/social/supabase-setup.md` - Supabase configuration
3. `docs/social/timeline-guide.md` - Timeline features
4. `docs/social/chat-guide.md` - Chat system
5. `docs/social/events-guide.md` - Live events
6. `docs/social/api-reference.md` - API docs

---

## 🔗 Dependencies

**Required Before Starting:**
- ✅ Phase 1 complete
- ✅ Phase 2 complete
- Supabase account
- Video streaming service (Agora/Twitch API)

**External Dependencies:**
- Supabase (PostgreSQL + Realtime)
- Agora.io or similar (live streaming)
- CDN for media (Cloudflare)
- Push notification service (OneSignal)

---

## 💰 Cost Estimates

**Supabase:**
- Free tier: Up to 500MB database
- Pro: $25/month (8GB database, 50GB bandwidth)
- Expected: Pro tier

**Agora.io:**
- Free tier: 10,000 minutes/month
- Pay-as-you-go: $0.99/1000 minutes
- Expected: ~$50-100/month

**Storage/CDN:**
- Cloudflare R2: $0.015/GB storage
- Expected: ~$20-50/month

**Total estimated:** ~$100-200/month

---

## 🔮 Future Enhancements (Post-Phase 3)

- AI content moderation
- Advanced analytics
- Live event monetization
- Virtual event spaces (metaverse)
- Audio rooms (Twitter Spaces-like)
- Stories feature (24hr expiry)

---

**Created:** November 2025
**Last Updated:** November 2025
**Architecture Version:** 2.0 (Hybrid: WordPress + Supabase)
