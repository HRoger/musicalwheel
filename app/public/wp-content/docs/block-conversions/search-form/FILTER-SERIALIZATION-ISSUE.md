# Search Form Filter Serialization Issue

**Date:** December 2025
**Status:** Root Cause Identified

## Problem Summary

Filters work in the UI but fail to produce results when submitted to Post Feed. The issue is **filter value serialization format mismatch**.

## Root Cause

### Voxel Expected API Format (String)

When Voxel sends filters to `?vx=1&action=search_posts`, filter values are **string-serialized** in specific formats:

| Filter Type | Voxel API Format | Example |
|-------------|------------------|---------|
| Range | `"min..max"` | `"10..50"` |
| Location (radius) | `"address;lat,lng,radius"` | `"New York;40.7128,-74.0060,25"` |
| Location (area) | `"address;swlat,swlng..nelat,nelng"` | `"NYC;40.7,-74.0..40.8,-73.9"` |
| Availability (range) | `"start..end"` | `"2024-01-01..2024-01-15"` |
| Availability (single) | `"date"` | `"2024-01-01"` |
| Terms | `"id1,id2,id3"` | `"1,2,3"` |
| Keywords | `"text"` | `"search query"` |
| Stepper | `"number"` | `"5"` |

**Evidence from Voxel (voxel-search-form.beautified.js):**
- Line 437: `this.filter.value = this.value.join("..")` (range)
- Line 721: `this.filter.value = \`${v.address};${v.lat},${v.lng},${v.radius}\`` (location radius)
- Line 985: `this.filter.value = Voxel.helpers.dateFormatYmd(start) + ".." + Voxel.helpers.dateFormatYmd(end)` (availability)
- Line 1098: `this.filter.value = Object.keys(this.value).join(",")` (terms)

### FSE Current Behavior (Object)

FSE filter components return **JavaScript objects/arrays** instead of serialized strings:

| Filter Type | FSE Returns | Issue |
|-------------|-------------|-------|
| FilterRange | `{min: 10, max: 50}` | Object |
| FilterLocation | `{address, lat, lng, radius}` | Object |
| FilterAvailability | `{start: Date, end: Date}` | Object |
| FilterTerms | `["slug1", "slug2"]` | Array of slugs (not IDs) |

### Serialization Bug Location

**PostFeedComponent.tsx lines 190-200:**
```typescript
Object.entries(filtersToUse).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
        params.set(key, String(value));  // ❌ Objects become "[object Object]"
    }
});
```

When `String({min: 10, max: 50})` is called, it produces `"[object Object]"` - completely invalid for the Voxel API.

## Solution Options

### Option A: Fix at Filter Component Level (Recommended)

Each filter component should serialize its value to Voxel's expected string format:

**FilterRange.tsx:**
```typescript
// Instead of: onChange({min: 10, max: 50})
// Do: onChange("10..50")
const handleSave = () => {
    if (localMin === rangeStart && localMax === rangeEnd) {
        onChange(null);
    } else {
        onChange(`${localMin}..${localMax}`);  // Voxel format
    }
};
```

**FilterLocation.tsx:**
```typescript
// Instead of: onChange({address, lat, lng, radius})
// Do: onChange("address;lat,lng,radius")
const saveValue = () => {
    if (method === 'radius') {
        onChange(`${address};${lat},${lng},${radius}`);
    } else {
        onChange(`${address};${swlat},${swlng}..${nelat},${nelng}`);
    }
};
```

**FilterTerms.tsx:**
```typescript
// Instead of: onChange(["cat", "dog"])
// Do: onChange("1,2,3") using term IDs
const saveValue = () => {
    const selectedIds = Object.keys(selectedTerms).join(',');
    onChange(selectedIds || null);
};
```

### Option B: Fix at PostFeedComponent Level (Workaround)

Create a serialization utility to convert objects to Voxel format:

```typescript
function serializeFilterValue(key: string, value: unknown, filterType?: string): string | null {
    if (value === null || value === undefined || value === '') return null;

    if (typeof value === 'string') return value;  // Already serialized

    if (typeof value === 'object') {
        // Range
        if ('min' in value || 'max' in value) {
            const { min, max } = value as { min?: number; max?: number };
            return `${min ?? ''}..${max ?? ''}`;
        }
        // Location
        if ('lat' in value && 'lng' in value) {
            const loc = value as LocationValue;
            if (loc.method === 'radius') {
                return `${loc.address};${loc.lat},${loc.lng},${loc.radius}`;
            }
            return `${loc.address};${loc.swlat},${loc.swlng}..${loc.nelat},${loc.nelng}`;
        }
        // Availability
        if ('start' in value) {
            const av = value as { start: string; end?: string };
            return av.end ? `${av.start}..${av.end}` : av.start;
        }
    }

    if (Array.isArray(value)) {
        return value.join(',');
    }

    return String(value);
}
```

### Recommendation

**Use Option A** - It maintains Voxel parity by having filters serialize their own values, just like Voxel does. This also ensures that:
1. URL params are correct (for refresh mode)
2. Event payloads are correct (for feed/map mode)
3. No special handling needed in consuming components

## Affected Filters

| Filter | Current Serialization | Required Fix |
|--------|----------------------|--------------|
| FilterRange | Object | `min..max` string |
| FilterLocation | Object | `addr;lat,lng,rad` or `addr;sw..ne` string |
| FilterAvailability | Object | `start..end` or `start` string |
| FilterDate | Object | `YYYY-MM-DD` string |
| FilterRecurringDate | Object | TBD - check Voxel format |
| FilterTerms | Array | Comma-separated IDs string |
| FilterRelations | Object/Array | TBD - check Voxel format |
| FilterUser | Object/Array | TBD - check Voxel format |
| FilterKeywords | String ✅ | Already correct |
| FilterStepper | Number | Already works (String(5) = "5") |
| FilterOpenNow | Boolean | Already works (String(true) = "true") |
| FilterSwitcher | Boolean | Already works |
| FilterOrderBy | String ✅ | Already correct |
| FilterPostStatus | String ✅ | Already correct |
| FilterFollowing | Boolean | Already works |

## Testing Strategy

1. Add console.log in PostFeedComponent before `params.set()` to see actual values
2. Compare URL query strings between Voxel and FSE for same filter actions
3. Use browser Network tab to inspect `?vx=1&action=search_posts` requests
4. Verify filter values in request match Voxel's expected format

## Next Steps

1. [ ] Implement Option A fixes for FilterRange
2. [ ] Implement Option A fixes for FilterLocation
3. [ ] Implement Option A fixes for FilterAvailability
4. [ ] Implement Option A fixes for FilterTerms (use term IDs, not slugs)
5. [ ] Implement Option A fixes for FilterDate
6. [ ] Test each filter with Post Feed integration
7. [ ] Verify URL params work correctly for page refresh
