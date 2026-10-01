# Content and launch checklist

This is a public review draft. Missing values are intentional placeholders, not broken links. Academic metadata comes only from CONTENT_NOTES.md; no fresh publication-status check has been made.

## Owner content review

- [ ] Approve/rewrite the three-sentence biography in `src/data/profile.ts` and clear its review flag.
- [ ] Confirm the Hamburg role/start date and Groningen PhD dates.
- [ ] Supply a local optimized portrait, alt text, and dimensions; no likeness has been generated.
- [ ] Verify all four research titles, coauthor spelling, order, and current publication status.
- [ ] Review every research summary and explanation. All are editorial drafts.
- [ ] Supply exact theorem statements, hypotheses, and interpretations for all four entries. The displayed formulas are labelled background definitions, not claims about the papers.
- [ ] Confirm the existing arXiv links: 2506.02607, 2603.05467, 2607.17764.
- [ ] Supply/confirm the status and paper URL for *Poisson-Voronoi percolation in high dimensions*; it currently has no link.
- [ ] Supply approved web-ready videos, assign each to an entry, and supply poster frames and captions. No clip assignment or same-realization relationship is assumed.
- [ ] For supplied media, record filename, byte size, dimensions/aspect ratio in this checklist; explain finite simulations versus infinite-volume/high-dimensional statements in captions.
- [ ] Decide whether optional research thumbnails are useful; supply alt text and set the global flag if wanted.
- [ ] Confirm separate master's and bachelor's dates at LMU Munich. The old combined 2016–2021 range has not been assigned to either degree.
- [ ] Supply PhD and master's thesis titles plus actual PDFs or confirmed HTTPS repository links. Both URL fields are currently null.
- [ ] Optional: supply an actual full CV PDF before adding a full-CV link.
- [ ] Confirm the current Hamburg professional email and office. Both fields are currently null.

## Review and launch

- [ ] Owner reviews desktop and mobile layouts and expanded research entries.
- [ ] Once real assets exist, test their links, dimensions, video playback, clip switching, pause on close, delayed requests, and failure fallbacks on desktop and mobile.
- [ ] Enable repository Settings → Pages → Source: GitHub Actions.
- [ ] Review and merge the implementation PR; check the deploy workflow result and Pages “Visit site”.
- [ ] Run the optional live smoke check from README after Pages deployment.
- [ ] Approve all academic content before any domain migration or removal of Draft/noindex.
- [ ] In a separate explicitly authorized launch, choose the canonical domain, change only relevant Pages/DNS records, preserve mail/verification records, verify HTTPS/assets, and deliberately remove draft/noindex.

No portrait, video, poster, thumbnail, thesis, or full CV file has been supplied. Real media playback and thesis-document rendering cannot yet be verified. The current Google Sites website and Porkbun DNS are unchanged.
