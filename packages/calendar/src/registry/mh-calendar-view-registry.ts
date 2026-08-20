import { IMHCalendarViewType, MHCalendarViewType } from '../types/enums';

export interface IMHCalendarViewDefinition {
  /**
   * The value users assign to `config.viewType` / pass to `changeView` to select this view.
   */
  type: MHCalendarViewType;

  /**
   * Tag name of the custom element rendered by `mh-calendar` for this view type.
   */
  tagName: string;

  /**
   * Label shown in the view switcher when `labels.views` doesn't provide an override.
   * @default title-cased `type`
   */
  label?: string;
}

const registry = new Map<string, IMHCalendarViewDefinition>();

/**
 * Registers a view so `mh-calendar` can render it and `mh-view-switcher` can list it.
 * Call this once (e.g. as a module side effect) before the view type is used.
 */
export function registerView(definition: IMHCalendarViewDefinition): void {
  registry.set(definition.type, definition);
}

export function getRegisteredView(
  type: MHCalendarViewType | undefined,
): IMHCalendarViewDefinition | undefined {
  return type === undefined ? undefined : registry.get(type);
}

export function getRegisteredViewTypes(): MHCalendarViewType[] {
  return Array.from(registry.keys());
}

registerView({ type: IMHCalendarViewType.DAY, tagName: 'mh-calendar-multi-view' });
registerView({ type: IMHCalendarViewType.WEEK, tagName: 'mh-calendar-multi-view' });
registerView({ type: IMHCalendarViewType.MONTH, tagName: 'mh-calendar-month' });
registerView({ type: IMHCalendarViewType.AGENDA, tagName: 'mh-calendar-agenda-view' });
// registerView({ type: IMHCalendarViewType.RESOURCE, tagName: 'mh-calendar-resource-view' });
