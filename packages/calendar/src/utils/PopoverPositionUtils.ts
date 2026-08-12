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

  /**
   * Shifts `rect` back onto the viewport if it overflows any edge.
   * Returns `null` when it already fits (nothing to adjust).
   */
  static clampToViewport(rect: DOMRect, margin: number = 8): { top: number; left: number } | null {
    const maxLeft = Math.max(window.innerWidth - rect.width - margin, margin);
    const maxTop = Math.max(window.innerHeight - rect.height - margin, margin);

    const clampedLeft = Math.min(Math.max(rect.left, margin), maxLeft);
    const clampedTop = Math.min(Math.max(rect.top, margin), maxTop);

    if (clampedLeft === rect.left && clampedTop === rect.top) return null;

    return { top: clampedTop, left: clampedLeft };
  }
}
