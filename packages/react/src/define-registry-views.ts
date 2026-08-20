/**
 * `@mhcalendar/calendar`'s dist-custom-elements build only auto-registers a child component
 * when it's referenced via a literal JSX tag somewhere Stencil's bundler can statically see.
 * `mh-calendar` dispatches MONTH/AGENDA/RESOURCE dynamically through its view registry
 * (`registerView`), so Stencil can't discover them — without this, `<MhCalendar>` never
 * defines these tags and they render as empty, unupgraded custom elements.
 */
import { defineCustomElement as defineMhCalendarMonth } from '@mhcalendar/calendar/dist/components/mh-calendar-month.js';
import { defineCustomElement as defineMhCalendarAgendaView } from '@mhcalendar/calendar/dist/components/mh-calendar-agenda-view.js';
import { defineCustomElement as defineMhCalendarResourceView } from '@mhcalendar/calendar/dist/components/mh-calendar-resource-view.js';

defineMhCalendarMonth();
defineMhCalendarAgendaView();
defineMhCalendarResourceView();
