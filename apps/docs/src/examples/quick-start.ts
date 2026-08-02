import { PEN_CSS, LOADER_IMPORT, type CodePenExample } from './shared';

const quickStart: CodePenExample = {
  title: 'mhcalendar — Quick start',
  css: PEN_CSS,
  html: `<mh-calendar id="calendar"></mh-calendar>

<script type="module">
  ${LOADER_IMPORT}

  const calendar = document.getElementById('calendar');
  calendar.config = {
    viewType: 'MONTH',
    showTimeFrom: 8,
    showTimeTo: 18,
    showAllDayTasks: true,
    allowEventDragging: true,
    allowEventResize: true,
  };
  calendar.events = [
    {
      id: 'event-1',
      title: 'Team Meeting',
      startDate: new Date(new Date().setHours(10, 0, 0, 0)),
      endDate: new Date(new Date().setHours(11, 0, 0, 0)),
    },
  ];
</script>`,
};

export default quickStart;
