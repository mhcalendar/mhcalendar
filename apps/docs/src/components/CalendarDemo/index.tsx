import type { ReactNode } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { MhCalendar, type IMHCalendarEvent, type IMHCalendarFullOptions } from '@mhcalendar/react';
import { DEFAULT_CONFIG } from '@site/src/theme/ReactLiveScope';

export type CalendarDemoProps = {
  config?: IMHCalendarFullOptions;
  events?: IMHCalendarEvent[];
  height?: string;
};

function getWeekDates() {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);

  return (dayOffset: number, hour: number, minutes = 0) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + dayOffset);
    d.setHours(hour, minutes, 0, 0);
    return d;
  };
}

export function buildDemoEvents(): IMHCalendarEvent[] {
  const makeDate = getWeekDates();
  return [
    { id: '1', title: 'Design review', startDate: makeDate(0, 9), endDate: makeDate(0, 11) },
    { id: '2', title: 'Standup', startDate: makeDate(1, 10), endDate: makeDate(1, 11) },
    { id: '3', title: 'Customer call', startDate: makeDate(2, 9), endDate: makeDate(2, 10) },
    { id: '4', title: 'Pair on theming', startDate: makeDate(2, 14), endDate: makeDate(2, 15) },
    { id: '5', title: 'Release sync', startDate: makeDate(3, 13), endDate: makeDate(3, 15) },
    { id: '6', title: 'Demo prep', startDate: makeDate(4, 11), endDate: makeDate(4, 12) },
  ];
}

/**
 * The Stencil web component registers itself on `window.customElements` on mount,
 * so it can only render client-side — Docusaurus prerenders MDX pages at build time.
 */
export default function CalendarDemo({
  config,
  events,
  height = '560px',
}: CalendarDemoProps): ReactNode {
  const mergedConfig = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  return (
    <BrowserOnly fallback={<div style={{ height }} />}>
      {() => (
        <div style={{ height, marginBottom: '1.5rem' }}>
          <MhCalendar config={mergedConfig} events={events ?? buildDemoEvents()} />
        </div>
      )}
    </BrowserOnly>
  );
}
