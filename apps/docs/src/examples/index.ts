import quickStart from './quick-start';
import basicUsage from './basic-usage';
import interactivePlanner from './interactive-planner';
import businessHours from './business-hours';
import styling from './styling';
import theming from './theming';
import timezones from './timezones';
import displayHours from './display-hours';
import type { CodePenExample } from './shared';

export type { CodePenExample };

export const codepenExamples: Record<string, CodePenExample> = {
  'quick-start': quickStart,
  'basic-usage': basicUsage,
  'interactive-planner': interactivePlanner,
  'business-hours': businessHours,
  styling,
  theming,
  timezones,
  'display-hours': displayHours,
};
