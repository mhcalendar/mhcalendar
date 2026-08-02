import { PEN_CSS, LOADER_IMPORT, type CodePenExample } from './shared';

const timezones: CodePenExample = {
  title: 'mhcalendar — Timezones',
  css: PEN_CSS,
  html: `<mh-calendar id="calendar"></mh-calendar>

<script type="module">
  ${LOADER_IMPORT}

  const calendar = document.getElementById('calendar');
  calendar.config = {
    viewType: 'WEEK',
    showTimeFrom: 7,
    showTimeTo: 20,
    showAllDayTasks: false,
    timezones: ['America/Los_Angeles', 'America/New_York', 'Europe/London'],
  };
  calendar.events = [
    {
      id: 't1',
      title: 'LA Kickoff',
      startDate: new Date(new Date().setHours(9, 0, 0, 0)),
      endDate: new Date(new Date().setHours(10, 0, 0, 0)),
    },
    {
      id: 't2',
      title: 'NY All-hands',
      startDate: new Date(new Date().setHours(12, 0, 0, 0)),
      endDate: new Date(new Date().setHours(14, 0, 0, 0)),
    },
  ];
</script>`,
};

export default timezones;
