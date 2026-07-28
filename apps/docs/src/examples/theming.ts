import { PEN_CSS, LOADER_IMPORT, type CodePenExample } from './shared';

const theming: CodePenExample = {
  title: 'mhcalendar — Theming',
  css: PEN_CSS,
  html: `<mh-calendar id="calendar"></mh-calendar>

<script type="module">
  ${LOADER_IMPORT}

  // A "theme" is just a plain object built once and reused across calendars.
  const minimalTheme = {
    properties: {
      eventBackgroundColor: '#16a34a',
      bordersColor: '#d1fae5',
      headerTodayBackgroundColor: '#f0fdf4',
      currentTimeColor: '#16a34a',
    },
    mhCalendar: { backgroundColor: '#f0fdf4', color: '#14532d' },
  };

  const calendar = document.getElementById('calendar');
  calendar.config = {
    viewType: 'WEEK',
    showTimeFrom: 7,
    showTimeTo: 20,
    style: minimalTheme,
  };
  calendar.events = [];
</script>`,
};

export default theming;
