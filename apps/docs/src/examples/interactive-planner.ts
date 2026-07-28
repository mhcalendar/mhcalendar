import { PEN_CSS, LOADER_IMPORT, type CodePenExample } from './shared';

const interactivePlanner: CodePenExample = {
  title: 'mhcalendar — Interactive week planner',
  css: PEN_CSS,
  html: `<mh-calendar id="calendar"></mh-calendar>

<script type="module">
  ${LOADER_IMPORT}

  const calendar = document.getElementById('calendar');
  let events = [
    {
      id: 'e1',
      title: 'Design review',
      startDate: new Date(new Date().setHours(9, 0, 0, 0)),
      endDate: new Date(new Date().setHours(10, 0, 0, 0)),
    },
  ];

  calendar.config = {
    viewType: 'WEEK',
    showTimeFrom: 8,
    showTimeTo: 18,
    createEventOnClick: true,
    allowEventDragging: true,
    allowEventResize: true,
    minEventDuration: 30,
    onEventCreated: (event) => {
      events = [...events, event];
      calendar.events = events;
    },
    onEventUpdated: (updated) => {
      events = events.map((e) => (e.id === updated.id ? updated : e));
      calendar.events = events;
    },
  };
  calendar.events = events;
</script>`,
};

export default interactivePlanner;
