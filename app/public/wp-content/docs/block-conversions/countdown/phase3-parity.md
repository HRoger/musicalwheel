# Countdown Block - Phase 3 Parity

**Date:** December 23, 2025
**Status:** Analysis Complete (100% parity)
**Reference:** voxel-countdown.beautified.js (307 lines, ~1.2KB original)

## Summary

The countdown block has **100% parity** with Voxel's vanilla JavaScript implementation. All core features are implemented: countdown calculation with days/hours/minutes/seconds, CSS fade animations on value changes, completion handling with ended message display, and re-initialization support. The React implementation uses a slightly different timing approach (Date.now() vs server timestamp increment) that is more accurate and Next.js-ready.

## Voxel JS Analysis

- **Total lines:** 307 (beautified with comprehensive comments)
- **Original size:** 1.2KB
- **Framework:** Vanilla JavaScript with jQuery for DOM selection
- **Pattern:** setInterval with DOM manipulation

### Core Features

| Feature | Voxel Implementation |
|---------|---------------------|
| Countdown calculation | remainingSeconds = config.due - config.now |
| Time units | Math.floor for days/hours/minutes/seconds |
| Fade animation | vx-fade-out-up (500ms) then vx-fade-in-up |
| Completion | Hide timer, show ended message |
| Re-initialization prevention | .vx-event-timer class check |
| AJAX support | voxel:markup-update event listener |

### Data Structure

```javascript
// data-config attribute
{
  "now": 1703980800,  // Current server timestamp (Unix seconds)
  "due": 1735689600   // Target timestamp (Unix seconds)
}
```

### Key Behaviors

1. **Time Sync**: Increments `config.now` locally each second (avoids timezone issues)
2. **Animation**: Only triggers if value actually changed
3. **Completion**: When `remainingSeconds < 0`, hides timer and shows ended message
4. **DOM Safety**: Clears interval if widget removed from DOM

## React Implementation Analysis

### File Structure
```
app/blocks/src/countdown/
├── frontend.tsx                    (~66 lines) - Entry point with hydration
├── shared/
│   └── CountdownComponent.tsx      (~399 lines) - UI component
├── types/
│   └── index.ts                    - TypeScript types
└── styles/
    └── voxel-fse.css               - Styles with animations
```

**Build Output:** 6.49 kB | gzip: 1.87 kB

### Architecture

The React block provides a complete standalone implementation:

1. **Date.now() based calculation** (vs server timestamp increment)
2. **Same CSS animation names** (vx-fade-out-up, vx-fade-in-up)
3. **Same HTML structure** (.ts-countdown-widget, .countdown-timer, .timer-days, etc.)
4. **Same completion handling** (hide timer, show .countdown-ended)
5. **Enhanced features** (responsive spacing, colors, hide units, orientation)

## Parity Checklist

### State Management

| Voxel Variable | React Implementation | Status |
|----------------|---------------------|--------|
| config.now | Date.now() calculation | Done |
| config.due | config.dueDate parsed | Done |
| days | state.days via useState | Done |
| hours | state.hours via useState | Done |
| minutes | state.minutes via useState | Done |
| seconds | state.seconds via useState | Done |
| isExpired | state.isExpired via useState | Done |

### Event Handlers

| Voxel Event | React Implementation | Status |
|-------------|---------------------|--------|
| jQuery ready | DOMContentLoaded listener | Done |
| setInterval tick | useEffect with setInterval | Done |
| voxel:markup-update | document.addEventListener | Done |

### Time Calculation (Matches Exactly)

| Voxel Formula | React Formula | Status |
|---------------|---------------|--------|
| `Math.floor(remainingSeconds / 86400)` | `Math.floor(diff / 86400)` | Done |
| `Math.floor((remainingSeconds % 86400) / 3600)` | `Math.floor((diff % 86400) / 3600)` | Done |
| `Math.floor((remainingSeconds % 3600) / 60)` | `Math.floor((diff % 3600) / 60)` | Done |
| `Math.floor(remainingSeconds % 60)` | `Math.floor(diff % 60)` | Done |

### Animation

| Voxel Animation | React Animation | Status |
|-----------------|-----------------|--------|
| element.style.animationName = "vx-fade-out-up" | ref.current.style.animationName = 'vx-fade-out-up' | Done |
| setTimeout 500ms | setTimeout 500ms | Done |
| element.style.animationName = "vx-fade-in-up" | ref.current.style.animationName = 'vx-fade-in-up' | Done |
| Only animate if value changed | Compare state before animating | Done |

### CSS Classes

| Voxel Class | React Usage | Status |
|-------------|-------------|--------|
| .ts-countdown-widget | Main container | Done |
| .vx-event-timer | Re-init prevention (via data-react-mounted) | Done |
| .countdown-timer | Timer list container | Done |
| .timer-days | Days value element | Done |
| .timer-hours | Hours value element | Done |
| .timer-minutes | Minutes value element | Done |
| .timer-seconds | Seconds value element | Done |
| .countdown-ended | Ended message element | Done |
| .flexify | Flexbox helper | Done |
| .simplify-ul | List reset | Done |

### Edge Cases

| Scenario | Handling | Status |
|----------|----------|--------|
| Re-initialization prevention | data-react-mounted attribute | Done |
| Widget removed from DOM | useEffect cleanup clears interval | Done |
| Countdown already expired | Immediately shows ended message | Done |
| Missing dueDate | Shows expired state | Done |
| AJAX content load | voxel:markup-update listener | Done |
| Turbo/PJAX navigation | turbo:load, pjax:complete listeners | Done |
| Animation disabled | disableAnimation config option | Done |

### Completion Handling

| Voxel Behavior | React Behavior | Status |
|----------------|----------------|--------|
| `remainingSeconds < 0` check | `diff < 0` check | Done |
| `clearInterval(intervalId)` | useEffect cleanup | Done |
| `.countdown-timer` display: none | Conditional rendering (!state.isExpired) | Done |
| `.countdown-ended` display: flex | Conditional rendering (state.isExpired) | Done |

### Intentional Improvements

| Feature | Voxel | React | Reason |
|---------|-------|-------|--------|
| Time source | Server timestamp + local increment | Date.now() | More accurate, Next.js ready |
| DOM manipulation | Direct innerText | React state + refs | React pattern |
| Config format | { now, due } | Extended with enhancements | More features |
| Hide units | Not supported | hideSeconds, hideDays, etc. | Enhancement |
| Orientation | Not supported | horizontalOrientation | Enhancement |
| Colors | CSS only | Inline color props | Enhancement |
| Spacing | CSS only | Responsive spacing props | Enhancement |

## Code Quality

- TypeScript strict mode with comprehensive types
- normalizeConfig() for dual-format API compatibility (camelCase/snake_case)
- useState for countdown state
- useRef for animation targets
- useEffect with cleanup for interval management
- CSS custom properties for responsive spacing
- Re-initialization prevention with data-react-mounted
- Turbo/PJAX and voxel:markup-update event listeners

## Build Output

```
frontend.js  6.49 kB | gzip: 1.87 kB
Built in 199ms
```

## Conclusion

The countdown block has **100% parity** with Voxel's vanilla JavaScript implementation:

- Same time unit calculations (days/hours/minutes/seconds)
- Same CSS animation names (vx-fade-out-up, vx-fade-in-up)
- Same animation timing (500ms)
- Same completion handling (hide timer, show ended message)
- Same HTML structure (.ts-countdown-widget, .countdown-timer, .timer-*, etc.)
- Same re-initialization prevention
- Same voxel:markup-update support

**Architecture:** Full React replacement with enhanced features

The React implementation provides equivalent core functionality while adding:
- More accurate timing via Date.now() (vs server timestamp increment)
- Hide individual time units (hideSeconds, hideDays, etc.)
- Horizontal/vertical orientation option
- Responsive spacing controls
- Color customization via props
- Next.js ready (no server timestamp dependency)

This is the simplest block in Phase 3, demonstrating that even lightweight Voxel widgets can be fully replicated in React with enhanced capabilities.
