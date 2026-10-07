import { useLayoutEffect, type RefObject } from 'react';

// ponytail: shrink-to-fit via transform scale; container must be overflow-hidden with no padding,
// content must be its firstElementChild (always rendered) with an origin-* class.
// Applied imperatively so React style diffs can't clobber it; transform doesn't affect layout,
// so ResizeObserver measurements stay stable (no loop).
export function useFitScale(boxRef: RefObject<HTMLElement | null>): void {
  useLayoutEffect(() => {
    const box = boxRef.current;
    const inner = box?.firstElementChild as HTMLElement | null;
    if (!box || !inner) return;

    const fit = () => {
      inner.style.transform = 'none';
      const s = Math.min(
        1,
        box.clientHeight / inner.scrollHeight || 1,
        box.clientWidth / inner.scrollWidth || 1
      );
      inner.style.transform = s < 1 ? `scale(${+s.toFixed(3)})` : '';
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    ro.observe(inner);
    return () => ro.disconnect();
  }, [boxRef]);
}
