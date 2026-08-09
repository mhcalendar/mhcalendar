export interface IMHCalendarPopoverAnchorRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export type IMHCalendarPopoverAlignment = 'top' | 'bottom' | 'left' | 'right';

export class PopoverPositionUtils {
  static getPositionStyle(anchorRect: IMHCalendarPopoverAnchorRect, alignment: IMHCalendarPopoverAlignment) {
    const { top, left, width, height } = anchorRect;

    switch (alignment) {
      case 'top':
        return {
          top: `${top}px`,
          left: `${left + width / 2}px`,
          transform: 'translate(-50%, -100%)',
        };
      case 'left':
        return {
          top: `${top + height / 2}px`,
          left: `${left}px`,
          transform: 'translate(-100%, -50%)',
        };
      case 'right':
        return {
          top: `${top + height / 2}px`,
          left: `${left + width}px`,
          transform: 'translate(0, -50%)',
        };
      default:
        return {
          top: `${top + height}px`,
          left: `${left + width / 2}px`,
          transform: 'translate(-50%, 0)',
        };
    }
  }
}
