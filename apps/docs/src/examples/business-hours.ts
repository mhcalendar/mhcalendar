import { PEN_CSS, LOADER_IMPORT, type CodePenExample } from './shared';

const businessHours: CodePenExample = {
  title: 'mhcalendar — Business hours',
  css: PEN_CSS,
  html: `<mh-calendar id="calendar"></mh-calendar>

<script type="module">
  ${LOADER_IMPORT}

  const calendar = document.getElementById('calendar');
  calendar.config = {
    viewType: 'WEEK',
    showTimeFrom: 10,
    showTimeTo: 18,
    showAllDayTasks: false,
    businessHours: [
      { dayOfWeek: [1, 2, 3, 4, 5], start: 11, end: 16 }, // Monday-Friday
      { dayOfWeek: [0, 6], start: 10, end: 15 }, // Weekend, shorter hours
    ],
    blockBusinessHours: true,
  };
  calendar.events = [];
</script>`,
};

export default businessHours;
