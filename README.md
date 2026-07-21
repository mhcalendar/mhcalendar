<br />

<p align="center">
  <img src="assets/logo.svg" alt="mhcalendar" style="max-width: 100%; width: 458px; margin-left: 60px;"/>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@mhcalendar/calendar"><img src="https://img.shields.io/npm/v/@mhcalendar/calendar.svg?style=flat-square&color=blue" alt="NPM Version"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square" alt="License: MIT"></a>
  <a href="https://github.com/mhcalendar/mhcalendar/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/mhcalendar/mhcalendar/ci.yml?style=flat-square" alt="CI Status"></a>
  <a href="https://bundlephobia.com/package/@mhcalendar/calendar"><img src="https://img.shields.io/bundlephobia/minzip/@mhcalendar/calendar?style=flat-square&color=green" alt="Bundle Size"></a>
</p>

A hybrid, highly customizable, full-sized event calendar built with TypeScript, Stencil, and Day.js.

> [!WARNING]
> mhcalendar is currently in its `0.x.x` phase. As per Semantic Versioning, the API is not yet stable, and any new minor or patch release might introduce breaking changes. We recommend pinning the exact version in your `package.json` until we reach `1.0.0`.

## Why mhcalendar?

mhcalendar is built around easy **customization as a first-class feature**. You get full, unrestricted access to the calendar's styling. You can style it exactly how you want by using CSS variables, overriding inline styles, or utilizing our custom properties.

### Key Features

- **Customization** — Style it your way.
- **Framework Agnostic** — Built as a Web Component with Stencil.
- **Lightweight by Design** — Keeps the dependency footprint tiny.
- **Advanced Timezones** — Support for multiple IANA timezones simultaneously.
- **Fully Interactive** — Drag & drop event management and event resizing.
- **Multiple Views** — Month, Week, Day, Agenda, and Shiftplan.
- **Business Hours** — Define business hours, block out-of-office dragging, and visualize non-business time.
- ✨ **...and more!**

## Documentation

> 📖 Full documentation is currently **in progress**. Stay tuned!

## Installation

If you are using React, you might want to check out our official React component:
👉 [**@mhcalendar/react**](https://www.npmjs.com/package/@mhcalendar/react)

If you are building a Vanilla JS project, install the core package via your preferred package manager:

```bash
# npm
npm install @mhcalendar/calendar

# yarn
yarn add @mhcalendar/calendar

# pnpm
pnpm add @mhcalendar/calendar
```

---

## Quick Start

Import and initialize the web component in your app's entry file (e.g., `main.ts`):

```javascript
import { defineCustomElements } from '@mhcalendar/calendar/loader';

// Registers the <mh-calendar> custom element in the browser
defineCustomElements();
```

Example usage:

```html
<html>
  <head>
    <title>Vanilla - 1</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body>
    <script type="module" src="/src/main.js"></script>
    <mh-calendar id="my-calendar"></mh-calendar>
    <script type="module">
      const mhcalendar = document.getElementById('my-calendar');

      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0);
      const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 30);

      mhcalendar.config = {
        viewType: 'WEEK',
        showTimeFrom: 9,
        showTimeTo: 18,
        allowEventDragging: true,
      };
      mhcalendar.events = [
        {
          id: '1',
          title: 'Team Meeting',
          startDate,
          endDate,
        },
      ];
    </script>
  </body>
</html>
```

## Contributing

Contributions are welcome! If you'd like to report a bug, suggest a feature, or submit a pull request, please open an issue first to discuss what you'd like to change.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a full list of changes between releases.

## License

mhcalendar is [MIT Licensed](https://opensource.org/licenses/MIT).
