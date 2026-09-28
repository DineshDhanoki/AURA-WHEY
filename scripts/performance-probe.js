// Development-only measurements, enabled by ?perf=1 on the preview server.
(() => {
  const results = { lcpMs: 0, cls: 0, longTasks: 0, longTaskMs: 0, frames: 0, slowFrames: 0, maxFrameGapMs: 0 };
  let sessionStart = 0, previousShift = 0, sessionScore = 0;
  const publish = () => { document.documentElement.dataset.performance = JSON.stringify(results); };
  const observe = (type, handle) => {
    if (!PerformanceObserver.supportedEntryTypes.includes(type)) return;
    new PerformanceObserver(list => { list.getEntries().forEach(handle); publish(); }).observe({ type, buffered: true });
  };
  observe('largest-contentful-paint', entry => { results.lcpMs = Math.round(entry.startTime); });
  observe('longtask', entry => { results.longTasks++; results.longTaskMs += Math.round(entry.duration); });
  observe('layout-shift', entry => {
    if (entry.hadRecentInput) return;
    if (entry.startTime - previousShift > 1000 || entry.startTime - sessionStart > 5000) {
      sessionStart = entry.startTime;
      sessionScore = 0;
    }
    previousShift = entry.startTime;
    sessionScore += entry.value;
    results.cls = Math.max(results.cls, sessionScore);
  });
  let previous, started;
  const frame = now => {
    if (!started) started = now;
    if (previous && !document.hidden) {
      const gap = now - previous;
      results.frames++;
      if (gap > 34) results.slowFrames++;
      results.maxFrameGapMs = Math.max(results.maxFrameGapMs, Math.round(gap));
    }
    previous = document.hidden ? undefined : now;
    if (now - started < 12000) requestAnimationFrame(frame);
    else { results.sampleMs = Math.round(now - started); publish(); }
  };
  requestAnimationFrame(frame);
})();
