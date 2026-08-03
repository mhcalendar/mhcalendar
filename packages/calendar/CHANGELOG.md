# @mhcalendar/calendar

## 0.2.6

### Patch Changes

- bbef205: Add locale config option support, add more docs

## 0.2.5

### Patch Changes

- 345014e: Minor bug fixes, start with docs and main site

## 0.2.4

### Patch Changes

- 7199e6b: Fix several bugs:

  - `showTimeFrom`/`showTimeTo` set to `0` (midnight) was incorrectly treated as "not configured"
    due to a falsy check, causing the time grid, business hours overlay, and drag & drop
    positioning to silently break. Fixed across `DateUtils`, `BusinessHoursUtils`, `DaysGenerator`,
    `EventStyleManager`, `EventUtils`, and `ConfigValidator`.
  - Escaped event `title`/`description` before interpolating them into the event modal's HTML,
    fixing a potential XSS vulnerability when rendering user-controlled event data.
  - Scoped the calendar's base CSS reset (previously an unscoped `*` selector) to
    `mh-calendar, mh-calendar *`, preventing it from leaking out and affecting the host page's
    styles.
  - Increased the default view header height from 60px to 70px to prevent content clipping.
