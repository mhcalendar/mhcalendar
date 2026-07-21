<br />

<p align="center">
  <img src="../../assets/logo.svg" alt="mhcalendar" style="max-width: 100%; width: 458px; margin-left: 60px;"/>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@mhcalendar/react"><img src="https://img.shields.io/npm/v/@mhcalendar/react.svg?style=flat-square&color=blue" alt="NPM Version"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square" alt="License: MIT"></a>
  <a href="https://github.com/mhcalendar/mhcalendar/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/mhcalendar/mhcalendar/ci.yml?style=flat-square" alt="CI Status"></a>
  <a href="https://bundlephobia.com/package/@mhcalendar/react"><img src="https://img.shields.io/bundlephobia/minzip/@mhcalendar/react?style=flat-square&color=green" alt="Bundle Size"></a>
</p>

Official React wrapper for [**@mhcalendar/calendar**](https://www.npmjs.com/package/@mhcalendar/calendar) — a
highly customizable, full-sized event calendar built with TypeScript, Stencil, and Day.js.

This package is a thin, typed React binding around the `@mhcalendar/calendar` Web Component. All
configuration options, events, and behavior are identical — see the
[**@mhcalendar/calendar** README](https://github.com/mhcalendar/mhcalendar/tree/main/packages/calendar#readme)
for the full feature list and configuration reference.

> [!WARNING]
> mhcalendar is currently in its `0.x.x` phase. As per Semantic Versioning, the API is not yet stable, and any new minor or patch release might introduce breaking changes. We recommend pinning the exact version in your `package.json` until we reach `1.0.0`.

## Installation

```bash
# npm
npm install @mhcalendar/react

# yarn
yarn add @mhcalendar/react

# pnpm
pnpm add @mhcalendar/react
```

`@mhcalendar/calendar` is a regular dependency of this package and gets installed automatically —
you don't need to install, import, or register it yourself.

## Quick Start

```tsx
import { useState } from 'react';
import { MhCalendar, type IMHCalendarEvent, type IMHCalendarViewType } from '@mhcalendar/react';

const CONFIG = {
  viewType: 'MONTH' as IMHCalendarViewType,
  showTimeFrom: 8,
  showTimeTo: 18,
  showAllDayTasks: true,
  allowEventDragging: true,
  allowEventResize: true,
};

const EVENTS: IMHCalendarEvent[] = [
  {
    id: 'event-1',
    title: 'Team Meeting',
    startDate: new Date(new Date().setHours(10, 0)),
    endDate: new Date(new Date().setHours(11, 30)),
  },
];

function App() {
  const [events, setEvents] = useState(EVENTS);

  return <MhCalendar config={CONFIG} events={events} />;
}

export default App;
```

## Requirements

- React `>=18.0.0`
- React DOM `>=18.0.0`

## Contributing

Contributions are welcome! If you'd like to report a bug, suggest a feature, or submit a pull
request, please open an issue first to discuss what you'd like to change.

## Changelog

See [CHANGELOG.md](https://github.com/mhcalendar/mhcalendar/blob/main/CHANGELOG.md) for a
full list of changes between releases.

## License

@mhcalendar/react is [MIT Licensed](https://opensource.org/licenses/MIT).
