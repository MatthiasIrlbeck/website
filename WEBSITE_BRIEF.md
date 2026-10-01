# Website version 1 — implementation brief

Prepared for Matthias Irlbeck on 1 October 2026.

## Goal
Build an actual, reviewable first version of a refined academic homepage, not another plan, an image-only mockup, or a generic portfolio template. The owner will judge it in a browser and supply revisions and missing assets. Implement one coherent design first; do not build three competing sites.

Proposed repository: MatthiasIrlbeck/website.
Proposed review URL, after GitHub Pages has been enabled and deployment succeeds: https://matthiasirlbeck.github.io/website/
Existing domain, which must remain unchanged during this task: https://www.matthiasirlbeck.com/

No production site or repository has been created by this handoff package. Confirm actual repository context before making changes.

## Page and visual direction
Use a restrained dark charcoal theme for version 1, readable off-white text, thin separators, and one quiet accent for links. This is a reversible first-draft choice, not a requirement to create a theme switcher. Use typography and spacing for hierarchy rather than gradients, glowing borders, oversized cards, decorative statistics, or ornamental motion.

Keep all content on the main page. Navigation contains only Research, CV, and Contact anchors. Do not make a separate Animations route, gallery, or navigation item. An ordinary 404 page is fine; supporting documents are files rather than additional navigation pages.

Use a readable maximum-width layout, approximately 1080–1160px on desktop, with tighter paragraph measures inside expanded content. The portrait and biography should not consume the entire first screen. On a typical desktop viewport, aim to reveal the beginning of Research.

Use an existing owner-supplied portrait when available. Otherwise use a deliberately neutral, labelled placeholder with stable dimensions, not a stock photo or an AI-generated person. Do not hotlink the old Google-hosted portrait as the final asset.

## Research entries
### Collapsed state
Show the full title, coauthors, status, a short explanatory sentence, available paper links, and an obvious Details or Details and animation control. Paper links must remain accessible without expansion and must not also trigger collapse/expansion.

Use a vertical list with fine separators. Allow an optional small static preview image, around 120–150px wide on desktop. Make the thumbnail setting easy to switch off globally so the owner can compare a text-only list without rewriting components. Do not force every entry to have a thumbnail. Missing thumbnails must not create broken images or awkward empty columns.

### Expanded state
Use an approximately 60/40 text/figure split when space permits; adapt this when a formula or video requires more room. Stack comfortably on mobile rather than retaining narrow columns. Pair the model explanation and visual near the top; do not place an important video below a very long block of text.

Aim for approximately 200–350 words per entry when verified content supports that length. Do not pad entries or invent findings to meet a word count. Clearly labelled editorial placeholders are acceptable. Structure explanations around the question, model, known result, and its interpretation. Distinguish illustrative definitions from claims about the owner's theorems.

Support inline and displayed LaTeX in Markdown with build-time KaTeX, for example through remark-math and rehype-katex or an equally small compatible setup. A standard definition such as theta(p) = P_p(|C(o)| = infinity) may be used as a clearly identified typesetting/model-definition example; it must not be presented as a new result. Correctly render actual LaTeX syntax and avoid screenshots of equations. Long formulas must not overflow the whole page.

Allow multiple entries open at once. Each has a stable fragment identifier. Loading a URL with that identifier or changing the hash must open the corresponding entry and bring it into view without unexpected scrolling during unrelated actions. Use progressive enhancement so research text remains in the generated HTML. Preserve native keyboard interaction, focus visibility, and accessible names.

## Videos and images
Use native HTML video with controls, playsinline, an intentional poster, and a concise caption. Manual playback is the default. Pause playback when an entry closes, and when switching between clips within the same entry. Do not autoplay, add hover-play, or embed YouTube.

For multiple related clips, support one figure area with explicitly labelled clip choices. Do not invent a set of scientific clips. Where the source files are missing, show a labelled media placeholder; playback is not considered tested in this case.

Do not fetch video bytes on initial homepage load. Defer setting a real video source until the visitor chooses to play. Avoid loading hidden entries' media. Keep aspect ratios stable and provide a graceful error/fallback when an actual media request fails.

Use local optimized assets for the initial site where practical, while keeping the media data model able to accept confirmed external file URLs later. Do not commit high-resolution originals or add Git LFS as an assumed GitHub Pages streaming solution. Produce a media inventory with size and aspect ratio when real files are supplied. Do not delay the layout because files are absent.

Captions should distinguish finite simulations and low-dimensional illustrations from infinite-volume or high-dimensional theorems. Do not describe different simulations as the same realization unless verified.

## Short CV and Contact
Use compact rows of dates, qualification/position, and institution. Place a PhD thesis link beneath or beside the PhD row and a Master's thesis link beside the master's row. A confirmed university repository URL is acceptable instead of a local PDF. A full-CV link is optional if a real file exists.

No contact form. Use a confirmed professional email and institution details only. Leave new email and office fields as labelled placeholders until supplied. Do not reuse the old Groningen office automatically. Do not publish a residential address.

## Content architecture
Use one Markdown content file per research entry and a small structured configuration for profile, CV, and contact. Include frontmatter/schema fields for title, authors, status, order, summary, links, optional thumbnail, media, and whether text needs review. Do not hide editing instructions in component source.

Use null/absent values for missing URLs or assets; never use fake arXiv numbers, href="#" placeholder links, zero-byte PDFs, or nonexistent image URLs. In draft mode show intentionally styled missing-content labels. Maintain CONTENT_TODO.md listing every unresolved content field and asset.

Start from CONTENT_NOTES.md, not speculative recollection. New long descriptions are editorial drafts for owner approval. Only explicitly supported mathematical claims should read as facts.

## Build, review deployment, and domain separation
Use a static Astro build with npm scripts for development, type/content checking, build, and preview. Use a lockfile and a supported pinned Node major across environments.

Configure review deployment defaults:
- SITE_URL=https://matthiasirlbeck.github.io
- BASE_PATH=/website
- DRAFT_SITE=true

These are proposed build-time configuration names; implement a single documented source of truth. Centralize handling of the base path. Test a /website build and a / root build, including research fragments, video sources, posters, math fonts, and thesis links when files exist.

Add GitHub Actions to check pull requests without deploying them. Add a separate deploy workflow that builds and publishes the merged main branch to GitHub Pages and supports manual workflow_dispatch. Use the current official Astro deployment guidance with appropriately restricted job permissions. Do not use pull_request_target to execute untrusted branch code. Do not enable automatic dependency merges.

The owner must enable Settings > Pages > Source: GitHub Actions and authorize merging. Explain these account-level actions rather than claiming to have completed them.

The review build must visibly say Draft and include a noindex meta tag. This does not make the site private. Do not put a robots.txt disallow rule in front of the noindex page. Do not create a production CNAME, set the live custom domain, change Porkbun DNS, or disable Google Sites.

Document the later domain switch, but do not perform it: choose the canonical www/bare-domain form, update site/base configuration and GitHub Pages settings, change only relevant DNS records after approval, verify HTTPS and links, and deliberately remove draft/noindex status after content review. Preserve unrelated mail and verification records.

## Acceptance checks
1. Install reproducibly, run the build, and run the implemented type/content checks.
2. Use Playwright or an equivalent real browser to capture and inspect the homepage at desktop (for example 1440px) and mobile (for example 390px) widths, both collapsed and with a representative research entry open.
3. Check keyboard expansion, independent paper links, direct-link expansion, multiple open entries, and collapse behaviour.
4. Check inline and displayed math, font loading, long titles, and narrow-screen overflow.
5. Check that missing images/videos/PDFs use intentional placeholders without broken requests. Check real media playback and pause-on-close only when a real supported video is available; explicitly report this limitation otherwise.
6. Verify that initial page load requests no video data, loads no YouTube iframe, and does not depend on remote fonts or a runtime math CDN.
7. Check preview-path and root-path asset resolution. Ensure /animations is not implemented and no Animations navigation item appears.
8. Report actual tests, screenshots, limitations, and remaining content separately. A successful build is not a substitute for visual inspection.

Keep screenshots and browser-test outputs as task/CI review artifacts rather than shipping them in the public site. Include an optional deployment smoke check after the owner enables Pages.

## Deliverables
- Working Astro source and reusable components.
- Clearly editable content and intentionally styled missing-content states.
- GitHub Actions checks and review-site deployment workflow.
- README.md with exact commands, required GitHub settings, and instructions for adding a paper, changing the biography, adding a thesis PDF, replacing a portrait, and adding a video.
- CONTENT_TODO.md with all unresolved fields and launch blockers.
- Actual desktop/mobile screenshots and a truthful test summary.
- A reviewable branch/PR, not an unauthorized merge or production launch.

## Technical references
Use current primary documentation rather than copying stale workflow versions:
- https://docs.astro.build/en/guides/deploy/github/
- https://docs.astro.build/en/guides/markdown-content/
- https://katex.org/docs/api
- https://katex.org/docs/options
- https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- https://developers.google.com/search/docs/crawling-indexing/block-indexing
