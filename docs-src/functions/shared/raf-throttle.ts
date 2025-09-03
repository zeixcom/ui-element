export function rafThrottle(fn: (...args: any[]) => void) {
  let scheduled = false;
  let lastArgs: any[] = [];
  let rafId = 0;

  function runner() {
    scheduled = false;
    fn(...lastArgs);
  }

  const wrapped = (...args: any[]) => {
    lastArgs = args;
    if (!scheduled) {
      scheduled = true;
      rafId = requestAnimationFrame(runner);
    }
  };

  wrapped.cancel = () => {
    if (scheduled) {
      cancelAnimationFrame(rafId);
      scheduled = false;
    }
  };

  return wrapped
}
