import { PEN_CSS, LOADER_IMPORT, type CodePenExample } from './shared';

const displayHours: CodePenExample = {
  title: 'mhcalendar — Display hours',
  css: PEN_CSS,
  html: `<mh-calendar id="calendar"></mh-calendar>

<script type="module">
  ${LOADER_IMPORT}

  const calendar = document.getElementById('calendar');
  calendar.config = {
    viewType: 'WEEK',
    showTimeFrom: 10,
    showTimeTo: 18,
    slotInterval: { hours: 0, minutes: 15 },
    hoursSlotInterval: { hours: 1, minutes: 0 },
    hoursDisplayFormat: 'HH:mm',
  };
  calendar.events = [];
</script>`,
};

export default displayHours;
