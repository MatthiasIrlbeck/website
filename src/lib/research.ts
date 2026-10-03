function openHashEntry() {
  let id: string;
  try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
  if (!id) return;
  const target = document.getElementById(id);
  const entry = target?.closest('.research-entry');
  if (!target || !entry) return;
  const details = entry.querySelector<HTMLDetailsElement>('details');
  if (details) details.open = true;
  requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
}
openHashEntry();
window.addEventListener('hashchange', openHashEntry);

for (const details of document.querySelectorAll<HTMLDetailsElement>('.research-details')) {
  const summary = details.querySelector<HTMLElement>(':scope > summary')!;
  summary.addEventListener('click', () => {
    if (!details.open || getComputedStyle(summary).position !== 'sticky') return;
    // Native closing removes the sticky position and can leave the focused
    // summary far above the viewport. Restore context only for this action.
    requestAnimationFrame(() => {
      if (details.open) return;
      const bounds = summary.getBoundingClientRect();
      if (bounds.top < 0 || bounds.bottom > window.innerHeight) {
        summary.scrollIntoView({ block: 'center', behavior: 'instant' });
      }
    });
  });
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
type NetworkInformation = EventTarget & { readonly saveData: boolean };
const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
const prefersManualPlayback = () => reducedMotion.matches || connection?.saveData === true;
for (const player of document.querySelectorAll<HTMLElement>('[data-media-player]')) {
  const details = player.closest<HTMLDetailsElement>('.research-details')!;
  const video = player.querySelector<HTMLVideoElement>('[data-video]')!;
  const load = player.querySelector<HTMLButtonElement>('[data-load]')!;
  const caption = player.querySelector<HTMLElement>('figcaption[data-caption]')!;
  const error = player.querySelector<HTMLElement>('[data-error]')!;
  const idle = player.querySelector<HTMLElement>('[data-idle]')!;
  const clipLabel = player.querySelector<HTMLElement>('[data-clip-label]')!;
  const frame = player.querySelector<HTMLElement>('.video-frame')!;
  video.hidden = false;
  load.hidden = false;
  let playAttempt = 0;
  let playPending = false;
  let visible = false;
  let manualPaused = false;
  let manuallyStarted = false;
  let failed = false;
  let expectedPauseEvents = 0;
  let playing = false;
  let reducedMotionPreference = reducedMotion.matches;
  let dataSavingPreference = connection?.saveData === true;
  const canPlay = () => details.open && visible && !document.hidden && !manualPaused &&
    (!prefersManualPlayback() || manuallyStarted) && !failed;
  const rememberPause = () => {
    manualPaused = true;
    playing = false;
    playAttempt++;
    playPending = false;
  };
  // Ignore pause events caused by our own visibility/close/clip handling.
  // A native-controls pause instead persists across scrolling and reopening.
  const pauseVideo = () => {
    playAttempt++;
    playPending = false;
    playing = false;
    if (!video.paused) {
      expectedPauseEvents++;
      video.pause();
    }
  };
  const playVideo = async () => {
    if (!canPlay() || playPending) return;
    const attempt = ++playAttempt;
    playPending = true;
    error.hidden = true;
    if (video.getAttribute('src') !== load.dataset.src || video.error) {
      video.poster = load.dataset.poster!;
      video.src = load.dataset.src!;
    }
    video.controls = true;
    idle.hidden = true;
    load.hidden = true;
    try {
      const pendingPlay = video.play();
      playing = !video.paused;
      await pendingPlay;
      if (!canPlay()) pauseVideo();
    } catch {
      if (attempt === playAttempt && canPlay()) {
        playing = false;
        failed = true;
        error.hidden = false;
        load.hidden = false;
      }
    } finally {
      if (attempt === playAttempt) playPending = false;
    }
  };
  const syncPlayback = () => {
    // Show the supplied still as soon as details open, including for visitors
    // who prefer reduced motion. Collapsed entries request neither the poster
    // nor video data on the initial page load.
    if (details.open && video.getAttribute('poster') !== load.dataset.poster) {
      video.poster = load.dataset.poster!;
    }
    // Detect a native pause even when its event has not yet been delivered.
    // A close or visibility change in the same task must not resume it.
    if (playing && video.paused && !video.error && !video.ended) rememberPause();
    if (!canPlay()) {
      pauseVideo();
      if (prefersManualPlayback() && !manuallyStarted) load.hidden = false;
    } else if (video.paused) {
      void playVideo();
    }
  };
  details.addEventListener('toggle', syncPlayback);
  document.addEventListener('visibilitychange', syncPlayback);
  const syncPlaybackPreference = () => {
    const nextReducedMotion = reducedMotion.matches;
    const nextDataSaving = connection?.saveData === true;
    if ((nextReducedMotion && !reducedMotionPreference) || (nextDataSaving && !dataSavingPreference)) {
      manuallyStarted = false;
    }
    reducedMotionPreference = nextReducedMotion;
    dataSavingPreference = nextDataSaving;
    syncPlayback();
  };
  reducedMotion.addEventListener('change', syncPlaybackPreference);
  connection?.addEventListener('change', syncPlaybackPreference);
  const observer = new IntersectionObserver(entries => {
    visible = entries.some(entry => entry.isIntersecting);
    syncPlayback();
  });
  observer.observe(frame);
  video.addEventListener('pause', () => {
    if (expectedPauseEvents) {
      expectedPauseEvents--;
    } else if (video.getAttribute('src') && !video.error && !video.ended) {
      // A controls pause is queued by the browser. It can arrive after the
      // visitor has closed the entry or scrolled away, so retain the choice
      // independently of the current disclosure and visibility state.
      rememberPause();
    }
  });
  video.addEventListener('play', () => {
    if (video.paused) return;
    playing = true;
    manualPaused = false;
    manuallyStarted = true;
    if (!canPlay()) pauseVideo();
  });
  for (const clip of player.querySelectorAll<HTMLButtonElement>('[data-clip]')) {
    clip.hidden = false;
    clip.addEventListener('click', () => {
      pauseVideo();
      video.removeAttribute('src');
      video.removeAttribute('poster');
      video.controls = false;
      video.load();
      idle.hidden = false;
      error.hidden = true;
      load.hidden = false;
      load.dataset.src = clip.dataset.src;
      load.dataset.poster = clip.dataset.poster;
      failed = false;
      manualPaused = false;
      manuallyStarted = true;
      clipLabel.textContent = clip.textContent;
      const renderedCaption = player.querySelector<HTMLTemplateElement>(`template[data-caption-template="${clip.dataset.captionIndex}"]`);
      if (renderedCaption) caption.replaceChildren(renderedCaption.content.cloneNode(true));
      player.querySelectorAll('[data-clip]').forEach(button => button.setAttribute('aria-pressed', String(button === clip)));
      syncPlayback();
    });
  }
  load.addEventListener('click', () => {
    // Firefox can leave a failed video in an unpaused state. Reset its media
    // load before retrying so visibility synchronization can start it again.
    if (failed) {
      pauseVideo();
      video.load();
    }
    failed = false;
    manualPaused = false;
    manuallyStarted = true;
    syncPlayback();
    // Keep keyboard access to the native controls after this button hides.
    if (load.hidden) video.focus({ preventScroll: true });
  });
  video.addEventListener('error', () => {
    if (!video.error) return;
    playing = false;
    failed = true;
    error.hidden = false;
    load.hidden = false;
  });
}
