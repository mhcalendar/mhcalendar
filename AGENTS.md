# AGENTS.md

Guidance for AI coding agents working in this monorepo.

## Monorepo layout

```
packages/
├── calendar/              ← Stencil.js web components core
└── react/                 ← React wrapper for core components

examples/
└── react-19.2-vite/       ← React example app for live local testing
```

## Calendar package layout

```
packages/calendar/src/
├── components/          ← One directory per Stencil component
├── store/               ← State management (reducer pattern)
├── utils/               ← Utility modules
├── const/               ← Default config and theme
├── types/index.d.ts     ← Public-facing types
```

## Root commands

```bash
npm run build         # build all packages
npm run build:calendar
npm run build:react
npm run react         # run calendar watch + react wrapper watch + React example app
npm run test          # run tests across packages
npm run format
```

## Calendar package commands

```bash
npm run build --workspace @mhcalendar/calendar
npm run watch --workspace @mhcalendar/calendar
npm run start --workspace @mhcalendar/calendar
npm run test --workspace @mhcalendar/calendar
```

## React wrapper commands

```bash
npm run build --workspace @mhcalendar/react
npm run dev --workspace @mhcalendar/react
```

## What NOT to touch

- `dist/`: build artifact, regenerated on every build
- `.yalc/`, `node_modules/`: package artifacts

## Source of truth for types

- `packages/calendar/src/store/mh-calendar-store.types.ts`: enums and internal state interfaces
- `packages/calendar/src/types/index.d.ts`: public-facing types

Both files must stay in sync when adding or removing types.

## Component hierarchy (calendar core)

```
mh-calendar (shadow: false)     ← root; owns config and store init
├── mh-calendar-navigation      ← prev/next/today + view switcher
├── mh-calendar-header          ← day-of-week header row
├── mh-calendar-multi-view      ← DAY and WEEK time grid container
│   └── mh-calendar-day ×N      ← individual day column
│       └── mh-calendar-event ×N
├── mh-calendar-month           ← MONTH view
├── mh-calendar-agenda-view     ← AGENDA view
├── mh-calendar-resource-view   ← RESOURCE view
└── mh-calendar-modal           ← event create/edit modal
```

All child components have `shadow: false`.

## State management

Global store uses `@stencil/store`. Files live in `packages/calendar/src/store/`.

## Key conventions

- CSS classes follow BEM with `mhCalendar` prefix (for example `mhCalendarNavigation__viewSwitcher`)
- Date operations use `dayjs` with `utc` and `timezone` plugins
- Events are stored as `Map<dateString, Map<eventId, IMHCalendarEvent>>`
- Multi-day events are duplicated across all date keys they span

## Versioning and release policy

- Packages `@mhcalendar/calendar` and `@mhcalendar/react` must always have the same version.
- When bumping version, update both package versions together.
- Update `@mhcalendar/react` dependency on `@mhcalendar/calendar` to the same new version.
- Release flow: commit version bump, create/push git tag (`vX.Y.Z`), then publish (preferably from CI triggered by tag).
