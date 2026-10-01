function openHashEntry() {
  let id: string;
  try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
  if (!id) return;
  const entry = document.getElementById(id);
  if (!entry?.classList.contains('research-entry')) return;
  const details = entry.querySelector<HTMLDetailsElement>('details');
  if (details) details.open = true;
  requestAnimationFrame(() => entry.scrollIntoView({ block: 'start' }));
}
openHashEntry();
window.addEventListener('hashchange', openHashEntry);
for (const link of document.querySelectorAll<HTMLAnchorElement>('.permalink')) {
  link.addEventListener('click', () => {
    if (link.hash === location.hash) openHashEntry();
  });
}

for (const details of document.querySelectorAll<HTMLDetailsElement>('.research-details')) {
  const summary = details.querySelector<HTMLElement>('summary');
  details.querySelector<HTMLButtonElement>('[data-close-details]')?.addEventListener('click', () => {
    details.open = false;
    summary?.focus();
  });
  details.addEventListener('toggle', () => {
    if (!details.open) details.querySelectorAll('video').forEach(video => video.pause());
  });
}
for (const player of document.querySelectorAll<HTMLElement>('[data-media-player]')) {
  const video = player.querySelector<HTMLVideoElement>('[data-video]')!;
  const load = player.querySelector<HTMLButtonElement>('[data-load]')!;
  const caption = player.querySelector<HTMLElement>('[data-caption]')!;
  const error = player.querySelector<HTMLElement>('[data-error]')!;
  const idle = player.querySelector<HTMLElement>('[data-idle]')!;
  for (const clip of player.querySelectorAll<HTMLButtonElement>('[data-clip]')) {
    clip.addEventListener('click', () => {
      video.pause();
      video.removeAttribute('src');
      video.removeAttribute('poster');
      video.load();
      idle.hidden = false;
      error.hidden = true;
      load.hidden = false;
      load.dataset.src = clip.dataset.src;
      load.dataset.poster = clip.dataset.poster;
      caption.textContent = clip.dataset.caption ?? '';
      player.querySelectorAll('[data-clip]').forEach(button => button.setAttribute('aria-pressed', String(button === clip)));
    });
  }
  load.addEventListener('click', async () => {
    error.hidden = true;
    video.poster = load.dataset.poster!;
    video.src = load.dataset.src!;
    idle.hidden = true;
    load.hidden = true;
    try { await video.play(); } catch { error.hidden = false; load.hidden = false; }
  });
  video.addEventListener('error', () => { error.hidden = false; load.hidden = false; });
}
