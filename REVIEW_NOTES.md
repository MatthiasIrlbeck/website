The repository previously contained an implementation handoff only. This change adds a static Astro academic homepage with a portrait/biography, four expandable research entries, Short CV thesis fields, and Contact. The charcoal layout uses native disclosures, build-time KaTeX HTML/MathML with local fonts, and integrated media placeholders. Paper metadata/links remain visible while entries are closed. The future video player loads approved clips only after an explicit play request.

Editable content lives in `src/data/` and one Markdown file per paper in `src/content/research/`. Academic wording, statuses, and missing assets are visibly provisional and tracked in CONTENT_TODO.md. Review builds have a Draft notice and noindex metadata. There is no Animations route, production CNAME, domain/DNS configuration, or Google Sites change.

Read-only PR checks build and browser-test both `/website` and `/`. A separate main-branch Pages workflow uses Node 24, `npm ci`, type/content checks, and a static build. Only its deploy job has Pages/OIDC write permissions. Owner configuration of Pages and approval/merge are still required.

Validation in Codex Cloud on 1 October 2026:

- Reproducible `npm ci` succeeded with Node 24.19.0/npm 11.9.0.
- `npm run check`: zero errors, warnings, or hints, and four research entries passed content checks.
- Static builds passed for `/website` and `/`; the final build uses `/website`.
- Playwright: four checks passed for each base path (eight total), using installed Chromium 151. The bundled-browser download was blocked by network policy.
- Checks cover native keyboard expansion/collapse, independent paper links, direct/hash/repeated permalinks, multiple open entries, no-JavaScript research content, local math fonts/HTML/MathML, no broken/remote/video initial requests, placeholders, no Animations route, and document overflow at 390px and 320px.
- Actual desktop (1440px) and mobile (390px) screenshots were captured in collapsed and expanded states and inspected. Mobile media was moved before long explanations, and unsupported decorative arrow glyphs were removed during visual review.

Local screenshot artifacts (ignored, not published to Pages) are in `artifacts/screenshots/project/` and `artifacts/screenshots/root/`: `desktop-collapsed.png`, `desktop-expanded.png`, `mobile-collapsed.png`, `mobile-expanded.png`. CI will expose them alongside Playwright reports as Actions artifacts.

No real portrait, research clip/poster/thumbnail, thesis PDF, or full CV is present. Real playback, clip switching, pause-on-close behavior, supplied-media failure handling, and thesis downloads are untested pending assets. Academic results and publication status need owner review. GitHub Actions and Pages deployment have not yet been executed in GitHub; their success is not claimed here.

For the review URL, the owner should set Settings → Pages → Source: GitHub Actions, review and merge this PR, then verify the deploy workflow and Pages “Visit site”. The expected address after successful deployment is https://matthiasirlbeck.github.io/website/. Leave the production domain and current Google Sites website unchanged.
