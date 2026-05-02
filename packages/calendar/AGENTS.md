# AGENTS.md

Guidance for AI coding agents working in this package (`mh-calendar-core` — Stencil.js Web Components library).

## Project layout

```
src/
├── components/          ← One directory per Stencil component
├── store/               ← State management (reducer pattern)
├── utils/               ← Utility modules
├── const/               ← Default config and theme
├── types/index.d.ts     ← Public-facing types
```

## Commands

```bash
npm run build       # production build
npm run start       # dev watch + serve
npm run test        # spec + e2e tests
npm run format      # prettier
```

## What NOT to touch

- `dist/` — build artifact, regenerated on every build
- `.yalc/`, `node_modules/` — package artifacts

## Source of truth for types

- `src/store/mh-calendar-store.types.ts` — enums and internal state interfaces
- `src/types/index.d.ts` — public-facing types

Both files must stay in sync when adding or removing types.

## Component hierarchy

```
mh-calendar (shadow: true)     ← root; owns config and store init
├── mh-calendar-navigation     ← prev/next/today + view switcher
├── mh-calendar-header         ← day-of-week header row
├── mh-calendar-multi-view     ← DAY and WEEK time grid container
│   └── mh-calendar-day ×N    ← individual day column
│       └── mh-calendar-event ×N
├── mh-calendar-month          ← MONTH view
├── mh-calendar-agenda-view    ← AGENDA view
├── mh-calendar-shiftplan-view ← SHIFTPLAN view
└── mh-calendar-modal          ← event create/edit modal
```

All child components have `shadow: false` — they render in the light DOM inside the root shadow root.

## State management

Redux-like pattern via `@stencil/store`. Files live in `src/store/`:

| File                            | Role                               |
| ------------------------------- | ---------------------------------- |
| `mh-calendar-store.ts`          | Store instantiation + `dispatch()` |
| `mh-calendar-store.types.ts`    | State interfaces + action types    |
| `mh-calendar-store.const.ts`    | Initial state / defaults           |
| `mh-calendar-store.reducer.ts`  | Pure reducer                       |
| `mh-calendar-store.actions.ts`  | Action handlers                    |
| `mh-calendar-store.user-api.ts` | Public `CalendarApi`               |
| `mh-calendar-store.utils.ts`    | Date range + style helpers         |

## Key conventions

- CSS classes follow BEM with `mhCalendar` prefix (e.g. `mhCalendarNavigation__viewSwitcher`)
- Date operations use `dayjs` with `utc` and `timezone` plugins
- Events are stored as `Map<dateString, Map<eventId, IMHCalendarEvent>>`
- Multi-day events are duplicated across all date keys they span
