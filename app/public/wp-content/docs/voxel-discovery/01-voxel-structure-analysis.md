# Voxel Dynamic Tag Structure Analysis

Based on studying the actual Voxel theme code at `/themes/voxel/app/dynamic-data/`, here is the EXACT structure:

## Post Data Group

### Reviews
```
reviews (Object)
├── total (Number) - "Total count"
├── average (Number) - "Average rating"
├── percentage (Number) - "Percentage"
├── latest (Object) - "Latest review"
│   ├── id (Number)
│   ├── created_at (Date) - "Date created"
│   └── author (Object)
│       ├── name (String) - lowercase "name"
│       ├── link (URL)
│       └── avatar (Number)
└── replies (Object)
    ├── total (Number)
    └── latest (Object) - "Latest reply"
        ├── id (Number)
        ├── created_at (Date)
        └── author (Object)
            ├── name (String)
            ├── link (URL)
            └── avatar (Number)
```

### Timeline
```
timeline (Object) - "Timeline posts"
├── total (Number) - "Total count"
├── latest (Object) - "Latest post"
│   ├── id (Number)
│   └── created_at (Date) - NO AUTHOR!
└── replies (Object)
    ├── total (Number)
    └── latest (Object) - "Latest reply"
        ├── id (Number)
        ├── created_at (Date)
        └── author (Object)
            ├── name (String)
            ├── link (URL)
            └── avatar (Number)
```

### Wall
```
wall (Object) - "Wall posts"
├── total (Number) - "Total count"
├── total_with_replies (Number) - "Total count (including replies)"
├── latest (Object) - "Latest post"
│   ├── id (Number)
│   ├── created_at (Date)
│   └── author (Object) - HAS AUTHOR (unlike timeline)
│       ├── name (String) - lowercase!
│       ├── link (URL)
│       └── avatar (Number)
└── replies (Object)
    ├── total (Number)
    └── latest (Object) - "Latest reply"
        ├── id (Number)
        ├── created_at (Date)
        └── author (Object)
            ├── name (String)
            ├── link (URL)
            └── avatar (Number)
```

### Followers
```
followers (Object)
├── accepted (Number) - "Follow count"
└── blocked (Number) - "Block count"
```

## Key Differences From My Implementation

| My Implementation | Voxel Actual | Fix Needed |
|---|---|---|
| `total_count` | `total` | ✅ Change key |
| `average_rating` | `average` | ✅ Change key |
| `latest_review` | `latest` | ✅ Change key |
| `latest_post` | `latest` | ✅ Change key |
| `latest_reply` | `latest` | ✅ Change key |
| `date_created` | `created_at` | ✅ Change key |
| `total_count_including_replies` | `total_with_replies` | ✅ Change key |
| `follow_count` | `accepted` | ✅ Change key |
| `block_count` | `blocked` | ✅ Change key |
| Timeline.latest has author | Timeline.latest NO author | ✅ Remove author |
| Wall.latest.author.Name | Wall.latest.author.name | ✅ Lowercase |

## Tag Path Examples (Correct)

```
@post(reviews.total)
@post(reviews.average)
@post(reviews.latest.id)
@post(reviews.latest.created_at)
@post(reviews.latest.author.name)
@post(reviews.replies.total)
@post(reviews.replies.latest.author.link)

@post(timeline.total)
@post(timeline.latest.id)
@post(timeline.latest.created_at)
@post(timeline.replies.latest.author.name)

@post(wall.total)
@post(wall.total_with_replies)
@post(wall.latest.author.name)
@post(wall.replies.total)
@post(wall.replies.latest.author.avatar)

@post(followers.accepted)
@post(followers.blocked)
```

## Source Files

- `/themes/voxel/app/dynamic-data/data-groups/post/post-data-group.php` (line 125-128)
- `/themes/voxel/app/dynamic-data/data-groups/post/review-data.php`
- `/themes/voxel/app/dynamic-data/data-groups/post/timeline-data.php`
- `/themes/voxel/app/dynamic-data/data-groups/post/wall-data.php`
