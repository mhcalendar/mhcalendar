import { PEN_CSS, LOADER_IMPORT, type CodePenExample } from './shared';

const basicUsage: CodePenExample = {
  title: 'mhcalendar — Basic usage (views + getApi)',
  css: PEN_CSS,
  html: `<mh-calendar id="calendar"></mh-calendar>

<script type="module">
  ${LOADER_IMPORT}

  const calendar = document.getElementById('calendar');
  calendar.config = {
    viewType: 'MONTH',
    avaliableViews: ['MONTH', 'WEEK', 'AGENDA'],
    showTimeFrom: 8,
    showTimeTo: 18,
  };
  calendar.events = [
    {
      id: 'event-1',
      title: 'Team Meeting',
      startDate: new Date(new Date().setHours(10, 0, 0, 0)),
      endDate: new Date(new Date().setHours(11, 0, 0, 0)),
    },
  ];

  calendar.getApi().then((api) => {
    console.log(api.calendarDateRange, api.viewType);
  });
</script>`,
};

export default basicUsage;
