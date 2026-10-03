const copyEmail = document.querySelector<HTMLButtonElement>('[data-copy-email]');
const copyStatus = document.querySelector<HTMLElement>('[data-copy-status]');
if (copyEmail && copyStatus && navigator.clipboard?.writeText) {
  copyEmail.hidden = false;
  let copying = false;
  copyEmail.addEventListener('click', async () => {
    if (copying) return;
    copying = true;
    // Keep keyboard focus while the asynchronous clipboard request is pending.
    copyEmail.setAttribute('aria-disabled', 'true');
    copyStatus.textContent = '';
    try {
      await navigator.clipboard.writeText(copyEmail.dataset.email!);
      copyStatus.textContent = 'Email copied.';
    } catch {
      copyStatus.textContent = 'Could not copy. Select the address to copy it.';
    } finally {
      copying = false;
      copyEmail.removeAttribute('aria-disabled');
    }
  });
}
