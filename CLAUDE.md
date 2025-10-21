# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Habbo Hotel-style multiplayer virtual world clone built with Next.js 15, React 19, TypeScript, and Supabase. The application features an isometric room renderer with real-time multiplayer chat and presence, avatar movement with pathfinding, and interactive furniture/objects.

## Commands

### Development
- **Start dev server**: `pnpm dev`
- **Build for production**: `pnpm build`
- **Start production server**: `pnpm start`
- **Lint**: `pnpm lint`

## Architecture

### Core Rendering System

The isometric rendering engine is built entirely with Canvas 2D:
- **Coordinate systems**: Uses [lib/iso.ts](lib/iso.ts) for `projectIso()` (tile → screen) and `unprojectIso()` (screen → tile)
- **Pathfinding**: [lib/pathfinding.ts](lib/pathfinding.ts) implements A* algorithm for avatar navigation
- **Main renderer**: [components/iso-room.tsx](components/iso-room.tsx) (~1000 lines) handles all canvas drawing, including:
  - Isometric floor tiles, walls, and furniture
  - Avatar rendering with animations (walking, dancing, sitting, waving, laughing)
  - Speech bubbles and nameplates
  - Interactive objects (music boxes, furniture)
  - Background elements (sky, clouds, birds)

### Multiplayer Architecture

Real-time multiplayer is handled through Supabase Realtime:
- **Hook**: [hooks/use-multiplayer.ts](hooks/use-multiplayer.ts) manages all multiplayer state
- **Graceful offline mode**: If `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` are missing, app runs offline (no multiplayer)
- **Broadcast events**:
  - `chat` - messages
  - `pos` - avatar position/facing
  - `action` - emotes (dance, sit, party, wave, laugh)
- **Presence tracking**: Uses Supabase presence to track online users per room
- **Spam protection**: Built-in rate limiting with token bucket algorithm
- **Profanity filter**: Uses `leo-profanity` package

### Room System

Three preset rooms defined in [components/iso-room.tsx](components/iso-room.tsx):
- **Lobby**: Dance floor, sofas, arcade machine, fountain, aquarium, music boxes
- **Café**: Tables, palm trees, counter
- **Rooftop**: Pool area, lounge chairs, palm trees

Each room has:
- Grid-based walkable/blocked tiles
- Furniture definitions with positions
- Seat locations for sit command
- Music box placements

### Chat System

[components/chat-panel.tsx](components/chat-panel.tsx):
- Virtualized scrolling using `@tanstack/react-virtual` for performance
- Auto-scrolling when at bottom
- "Jump to latest" button when scrolled up
- Slash commands (`/dance`, `/sit`, `/party`, `/wave`, `/laugh`)
- 240 character limit

### Audio System

Dual audio engine in [app/page.tsx](app/page.tsx):
- **Primary**: HTMLAudioElement for remote audio (Wikimedia/Archive sources via proxy)
- **Fallback**: WebAudio synthesizer ([lib/chiptune-fallback.ts](lib/chiptune-fallback.ts)) if remote fails
- **Proxy**: [app/api/proxy-audio/route.ts](app/api/proxy-audio/route.ts) handles CORS for external audio
- Music boxes are interactive furniture items that toggle playback

### State Management

No global state library - uses React hooks:
- Local state in [app/page.tsx](app/page.tsx) for UI (chat/nav/settings windows)
- `useMultiplayer` hook encapsulates all multiplayer logic
- Refs for animation frame state, audio engines, path progress

### UI Components

- **Draggable windows**: [components/window-frame.tsx](components/window-frame.tsx) using [hooks/use-draggable.ts](hooks/use-draggable.ts)
- **UI library**: Shadcn components in [components/ui/](components/ui/)
- **Styling**: Tailwind CSS with custom "pixel art" styles in [styles/habbo.module.css](styles/habbo.module.css)

## Key Technical Details

### Isometric Rendering

The tile coordinate system:
- Origin (0,0) is top-left of grid
- `projectIso(x, y)` converts grid coords to screen pixels
- Tile dimensions: 54px wide × 27px tall
- Diamond-shaped tiles rendered with canvas paths
- Origin is auto-centered based on viewport size

### Avatar Movement

1. User clicks canvas or holds WASD/arrows
2. Click converts screen → tile coords via `unprojectIso()`
3. A* pathfinding finds walkable path
4. Animation loop interpolates between path nodes at 3.4 tiles/sec
5. Position broadcast to other players at 10Hz (100ms intervals)

### Performance Optimizations

- Canvas rendered at device pixel ratio for crisp pixels
- Virtual scrolling in chat (only renders visible messages)
- Peer position smoothing with lerp to reduce jitter
- Separate animation speeds for gameplay vs background elements
- Interactive rects cached per frame to avoid recalculation

## Environment Variables

Optional (required for multiplayer):
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

If missing, app runs in offline mode with full rendering but no multiplayer.

## TypeScript Configuration

- Path alias: `@/*` maps to root directory
- Strict mode enabled
- Build errors ignored (`ignoreBuildErrors: true`) - be aware when making changes
- Images unoptimized for static export compatibility
