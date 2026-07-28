import { PEN_CSS, LOADER_IMPORT, type CodePenExample } from './shared';

const styling: CodePenExample = {
  title: 'mhcalendar — Styling',
  css: PEN_CSS,
  html: `<mh-calendar id="calendar"></mh-calendar>

<script type="module">
  ${LOADER_IMPORT}

  const calendar = document.getElementById('calendar');
  calendar.config = {
    viewType: 'WEEK',
    showTimeFrom: 8,
    showTimeTo: 18,
    style: {
      properties: {
        eventBackgroundColor: '#1e3a8a',
        bordersColor: '#cbd5e1',
        currentTimeColor: '#e11d48',
      },
      mhCalendar: { backgroundColor: '#ffffff', color: '#1e293b' },
    },
  };
  calendar.events = [];
</script>`,
};

export default styling;
