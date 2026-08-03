import { useState } from 'react';
import { MhCalendar, type IMHCalendarEvent, type IMHCalendarViewType } from '@mhcalendar/react';
import './App.css';

import plLocale from 'dayjs/locale/pl';
import deLocale from 'dayjs/locale/de';
import esLocale from 'dayjs/locale/es';

const CONFIG = {
  viewType: 'MONTH' as IMHCalendarViewType,
  showTimeFrom: 8,
  showTimeTo: 18,
  showAllDayTasks: true,
  allowEventDragging: true,
  allowEventResize: true,
  createEventOnClick: false,
  locale: plLocale,
};

const TEST_EVENTS = [
  {
    id: 'rand-id-1',
    startDate: new Date(new Date().setHours(12)),
    endDate: new Date(new Date().setHours(15)),
    title: 'rand-id-1',
  },
  {
    id: 'rand-id-2',
    startDate: new Date(new Date().setHours(9)),
    endDate: new Date(new Date().setHours(11)),
    title: 'rand-id-1',
  },
  {
    id: 'rand-id-3',
    startDate: new Date(new Date().setHours(17)),
    endDate: new Date(new Date().setHours(20)),
    title: 'rand-id-1',
  },
] as IMHCalendarEvent[];

function App() {
  const [events, setEvents] = useState(TEST_EVENTS);

  return (
    <main className="app">
      <MhCalendar config={{ ...CONFIG }} events={events} />
      <MhCalendar config={{ ...CONFIG, locale: deLocale }} events={events} />
      <MhCalendar config={{ ...CONFIG, locale: esLocale }} events={events} />
    </main>
  );
}

export default App;
