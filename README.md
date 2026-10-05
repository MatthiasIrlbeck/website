# Matthias Irlbeck — academic website

A portable static Astro website published at `https://www.matthiasirlbeck.com/` through GitHub Pages, observed on 5 October 2026. The single homepage contains biography/portrait, Research, Short CV, and Contact, in that order. Research uses native disclosures and build-time KaTeX HTML/MathML. No framework runtime, remote fonts, math CDN, YouTube embed, contact form, or separate Animations route is used.

The supplied portrait, four research videos/posters, and both thesis PDFs are integrated. Each research entry has a supplied clip; missing optional assets remain intentional states. Remaining wording and academic metadata reviews are tracked in [CONTENT_TODO.md](CONTENT_TODO.md). Review flags remain internal and the homepage shows no Draft notice. Local draft builds include noindex; production builds omit it. Noindex is not access control: the repository and any deployed review site are public. The latest owner-requested CV Advisor wording is present locally and has not yet been published.

## Setup and local review

Use **Node 24 LTS** (`.nvmrc`, package engines, and CI agree), npm, and the committed lockfile. This implementation was tested with Node 24.19.0/npm 11.9.0 and Astro 7.3.5.

```sh
# If you use nvm:
nvm install
nvm use
npm ci
npm run check
npm run build
npm run dev -- --host 127.0.0.1 --port 4321
# Or serve the built site:
npm run preview
```

Open **http://127.0.0.1:4321/website/**. The explicit loopback address keeps the development server accessible only on this computer. Stop a foreground server with Ctrl+C.

This computer also has a workspace-local Node 24.19.0 runtime and caches beside the repository. From the repository directory, use the prepared environment and start a background preview with:

```sh
source ../.local/activate.sh
npm run dev -- --background --host 127.0.0.1 --port 4321
# Stop it later, from the same directory and environment:
npm run dev -- stop
```

Astro 7 can automatically background servers when run by an agent. Stop servers you started with `npm run dev -- stop` / `npm run preview -- stop`; inspect them with `-- status` / `-- logs`. Browser tests use the documented `--ignore-lock` foreground mode so Playwright owns the process lifetime.

## Build configuration

`src/lib/site.ts` supplies draft defaults and local asset URL handling; `astro.config.mjs` consumes its site/base values. `.github/workflows/deploy.yml` explicitly sets all three production variables for the check/build/upload job, so deployed output does not depend on a developer's local defaults. Set the same variables in the shell for a production build and preview; `.env.example` documents both profiles. No production credentials are required.

| Variable | Local draft default | Production deployment | Purpose |
| --- | --- | --- | --- |
| `SITE_URL` | `https://matthiasirlbeck.github.io` | `https://www.matthiasirlbeck.com` | Canonical and Open Graph origin |
| `BASE_PATH` | `/website` | `/` | Asset, document and homepage URL prefix |
| `DRAFT_SITE` | `true` | `false` | Drafts include noindex/nofollow; production omits that restriction |

```sh
# Project-path build and tests
npm run build
npm run test:browser
# Root-path build and tests, without a production-domain change
BASE_PATH=/ npm run build
BASE_PATH=/ npm run test:browser
# Both configurations in sequence
npm run test:paths
# Restore the review build afterward
npm run build
```

The variables must agree between build and preview/tests. The commands above use draft defaults; unset any production shell exports before returning to them. Root-path draft testing does not change the live domain. The production site is already live; local builds and branch edits remain review work until an approved update is deployed.

### Production build and local preview

From the repository directory, use Node 24 and the locked dependencies, then:

```sh
export SITE_URL=https://www.matthiasirlbeck.com
export BASE_PATH=/
export DRAFT_SITE=false
npm run check
npm run build
PLAYWRIGHT_BROWSERS=chromium,firefox PLAYWRIGHT_PORT=4335 npm run test:browser
npm run preview -- --ignore-lock --host 127.0.0.1 --port 4335
```

Open **http://127.0.0.1:4335/**. This serves the built `dist/` output at the domain root, with production metadata, without publishing it. Stop the foreground preview with Ctrl+C. The build emits `https://www.matthiasirlbeck.com/` as the canonical/Open Graph URL and root asset/document URLs without `/website`. Research permalinks retain their existing `/#entry-id` and subsection fragments. Production has no robots meta restriction; there is currently no sitemap, `robots.txt`, CNAME, or custom response-header file in the source. Check actual hosting response headers after each deployment.

To resume the ordinary local draft workflow in the same shell:

```sh
unset SITE_URL BASE_PATH DRAFT_SITE
npm run build
npm run dev -- --host 127.0.0.1 --port 4321
```

## Browser checks and screenshots

```sh
npx playwright install --with-deps chromium firefox
# On Ubuntu/Debian, install the system H.264 decoder used by Firefox:
sudo apt-get install --yes ffmpeg
PLAYWRIGHT_BROWSERS=chromium,firefox PLAYWRIGHT_PORT=4323 npm run test:paths
```

Tests default to Chromium; `PLAYWRIGHT_BROWSERS` selects any combination of `chromium`, `firefox` and `webkit`. CI runs the Chromium/Firefox pair for draft project, draft root and production root configurations. Deployment checks cover canonical/Open Graph URLs, crawler restrictions and HEAD requests for every rendered local asset/link, including responsive image variants, PDFs, deferred videos/posters, CSS and scripts. All browsers use the binaries installed for the pinned Playwright version; `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` explicitly overrides Chromium when needed. System Chromium is never selected automatically, because its version and codec support can differ from the tested browser. Linux Firefox also needs the system H.264 decoder supplied by FFmpeg; Playwright's browser dependency installation does not install it. CI installs FFmpeg before playback checks. This computer's prepared environment supplies the downloaded browser cache and already has FFmpeg. To investigate WebKit separately, install it with `npx playwright install --with-deps webkit` and select `PLAYWRIGHT_BROWSERS=webkit`; the local media limitation below remains unresolved.

Tests serve the built website on `PLAYWRIGHT_PORT` and a real local Astro media fixture on the next port. Override the fixture with `PLAYWRIGHT_FIXTURE_PORT` when necessary. Use free ports, such as 4323/4324, to keep an existing 4321 development preview available. The fixture is excluded from the published website.

Current maintenance status and historical validation details are recorded in [REVIEW_NOTES.md](REVIEW_NOTES.md). Results dated 2–3 October describe those earlier revisions; the fresh 5 October WebKit and screen-reader checks are distinguished below.

The layout/architecture audit on 3 October 2026 keeps all website content unchanged. Type/content checks report zero errors, warnings and hints; both static builds pass; all **144 Chromium/Firefox checks** pass: 36 per engine for each of `/website/` and `/`. Coverage now measures publication spacing and link targets across eleven viewport widths, research layout around the 960px breakpoint, and contact separation/alignment with enlarged text. Desktop/mobile screenshots of every expanded entry, narrow Contact views and A4 print exports were inspected and saved in `artifacts/layout-audit/`. Print exports remain two pages collapsed and five fully expanded. The default project build is restored; see [REVIEW_NOTES.md](REVIEW_NOTES.md) for the exact changes and remaining limits.

Coverage checks visible focus after sticky closing, no scroll change when the closing control stays visible, deferred MP4 requests with data saving, manual starts, independent changes to reduced-motion/data-saving preferences, and printing with selected disclosures. Copy-review coverage checks visible superscripts and display widths at 320–1440px. The earlier website audit's inspected A4 exports were two pages collapsed and five with all research expanded, down from three and nine before its changes.

Coverage includes keyboard disclosures and paper links, entry/subsection fragments, multiple open entries, no-JavaScript content, MathML/local fonts, eight ordinary viewport widths from 320–1440px, 200% text simulation, visible focus after sticky mobile closing, printing with selected disclosures, explicit data-saving preferences, posters without early MP4 requests, absence of project years and PDF size labels, PDF page fragments, supplied documents, retry handling, and the real multiple-clip/absent-media fixture. Video checks passed in Chromium/Firefox for visible muted playback, looping after seeking near the end, manual pauses, closing/scrolled-away entries, reduced motion and simulated background-tab events. Clipboard success used the real Chromium API; denial was simulated. Firefox and WebKit exercise clipboard success/denial with API mocks, which tests feedback and focus but does not verify their actual clipboard permissions. Research loops discover entries; dedicated metadata assertions intentionally check the current confirmed values and must be updated when those values change.

Final individual-entry screenshots and print PDFs are in `artifacts/screenshots/website-improvements/`. Suite screenshots are stored under `artifacts/screenshots/project/<browser>/`, `artifacts/screenshots/root/<browser>/` and `artifacts/screenshots/production/<browser>/`: collapsed, representative expanded, all-expanded and video views. `mobile-200-percent-text.png` is a viewport capture. These directories, reports and traces are ignored and never published; PR checks retain Actions artifacts for 14 days. The text enlargement check doubles the root font size; it is not a native browser-zoom or screen-reader test. Actual NVDA/VoiceOver speech, native Safari and iOS have not been tested.

**Fresh WebKit verification — 5 October 2026.** The production-root run passes 32 of 44 checks, including all six new sticky-focus tests. Twelve checks fail: eight near-end seek/loop checks, a multiple-clip pause/close timeout, a pause-on-new-reduced-motion timeout, a native keyboard/hash summary-scroll timeout, and a tap-height assertion measuring 43.96875px against a 43.99px threshold. The report is `/tmp/website-focus-webkit-aa9ht3ru/production-root-report/index.html`. A fresh 51-second plain-native-video trial continued playing without errors and recorded three playback-time resets, but their timing did not match the clip duration; that trial does not establish complete natural loops. These results retain compatibility limitations; native Safari/iOS have not been tested.

**Screen-reader verification — 5 October 2026.** Orca 42 with headful Chromium generated utterances confirming all 12 headings and their levels, paper-specific disclosure names and expanded/collapsed states, Play video, native Pause/full-screen/more-options controls, a time scrubber, Copy email and live “Email copied.” feedback. The runs used isolated Xvfb/private D-Bus and a silent Speech Dispatcher backend: generated speech was logged, without audible listening. **Mathematical speech failed in this tested stack:** MathML was encountered, but inline symbols were omitted and display equations were announced as “blank” or generated only pauses. Before a video source loaded, the native player was announced as “Unable to play media. video grayed.”; Play video subsequently worked. These are recorded accessibility follow-ups, with no mathematics or player-markup change made. The initial D-Bus attempt changed the desktop toolkit-accessibility flag; its prior false value was restored and verified. Both corrected runs preserve the restored user-preferences hash/modification time and false accessibility flags; private processes, server and X display were stopped. Evidence is in `/tmp/website-orca-math-8reo9_1c/`. Actual NVDA/VoiceOver and native Safari/iOS checks remain open in CONTENT_TODO.md.

**Historical WebKit evidence — 2–3 October 2026.** On this Linux Mint/GStreamer setup, 19 of 26 project-path checks passed; seven media checks failed: six seek-near-end loop checks and one multiple-clip pause timeout. A plain native video without the website controller reproduced the seek stall. A temporary H.264 rendition without B-frames was about 40% larger and did not fix it; all supplied originals and served web assets remain unchanged. A subsequent 50-second trial with a plain native WebKit video was recorded as completing two automatic loops during natural playback. Those earlier observations describe that trial, separately from the fresh results above.

The downloaded WebKit engine was enabled without OS installation by extracting missing libraries under `/tmp/website-browser-deps/root`. That temporary setup used `LD_LIBRARY_PATH=/tmp/website-browser-deps/root/usr/lib/x86_64-linux-gnu` and `LD_PRELOAD` pointing to its `libgav1.so.0`, `libyuv.so.0` and `libavif.so.13`; preloading was needed because the bundled launcher replaces its library path. This machine-local workaround is not shipped or required by the website. Installation or an engine smoke test is not a passing media suite.

PDF and paper links open in new tabs without a `download` attribute. The same policy and project-path handling apply to links inside research Markdown. Navigation and Back to top stay in the current tab. Research entries retain stable fragment IDs for direct URLs, without displaying numbering or “Link to entry” controls. Content review flags and notes stay internal; the homepage displays no draft, approval, or verification notices.

The biography and result-layout revision passes zero-diagnostic type/content checks, both static builds, and all 144 Chromium/Firefox checks across the two deployment paths. The three typical-cell limits are verified side by side or stacked at 320–1440px; caption HTML and MathML survive switching, retry and no-JavaScript use. The biography, affected desktop/mobile entries, enlarged-text result box and current shape/Borsuk print pages were visually inspected. Artifacts are recorded in REVIEW_NOTES.md.

The subsequent Euclidean/hyperbolic caption and Grebík–Recke link edits pass both builds, zero-diagnostic type/content checks, and all 28 targeted Chromium/Firefox content, layout, math, link, no-JavaScript, enlarged-text and print checks across the two paths. The requested captions and d=3 rendering were checked in the browser, with affected desktop/mobile screenshots inspected.

## Editing content

All four research summaries and expanded descriptions were audited against primary material and rewritten on 3 October 2026. Further independent audits checked quantifiers, threshold conventions, conditional independence and the actual restrictions used in the proof outlines. [CONTENT_NOTES.md](CONTENT_NOTES.md#third-project-details-audit--3-october-2026) records the latest adversarial findings and an independent large-facet derivation; the earlier sections retain the scaled Borsuk AB constant and apparent source-document typos. The supplied PDFs remain unchanged. Keep these source notes current when changing mathematical claims.

- **Biography/portrait:** edit `src/data/profile.ts`. Keep the biography at most five sentences. The supplied portrait is `public/images/Matthias_Irlbeck.jpg` (1280 × 1570); use actual dimensions when replacing it. Local JPG/PNG/WebP/AVIF portraits in `public/images/` are imported for Astro to generate responsive WebP variants at 96–612px; the original URL remains available. A null portrait retains the labelled placeholder. The introduction starts directly with the name; there is no heading above it. The mobile portrait sits beside the name, with the unchanged biography below; the repeated role/institution line is omitted.
- **Research:** edit one Markdown file per entry in `src/content/research/`. Copy an existing entry for a new paper, use a stable descriptive filename (also its fragment ID), choose a unique numeric `order`, and provide verified `title`, coauthors in `authors`, `status`, `summary`, and `links`. Project years are omitted from the homepage; verified submission dates remain recorded in CONTENT_NOTES.md. A `Preprint` status with an arXiv URL renders one fully clickable “Preprint: arXiv” line, without a duplicate arXiv link. For an inline status reference, add `statusPrefix` to the relevant link (for example `", complete argument is part of my "`); it appears after the status with only the link label clickable and is omitted from the separate link row. Keep unconfirmed text marked `needsReview: true`. Use `links: []` when a paper URL is missing.
- **Expanded explanations:** use exactly three top-level Markdown subsection headings, `#### Model`, `#### Main result`, and `#### Interpretation`, in that order. Define the model and parameters before stating the result, then explain its meaning and scope. The existing build-time Markdown/KaTeX output is divided at those headings by `src/lib/research-content.ts`; the component inserts the illustration after the main result in the HTML reading order. Above 960px, desktop pairs the explanation and video in a 60/40 split; at 960px and below, tablet/mobile stacks Model, Main result, Illustration, and Interpretation so intermediate widths retain a readable text column. Entries with `media: []` use a readable single text column without a missing-video notice. Subsection IDs and local subsection links are prefixed with the entry ID, avoiding duplicate anchors when several entries are open. Local Markdown asset paths use the configured deployment base. The content check validates the heading structure. The native disclosure says **Details and animation** when media is available, **Details** otherwise, and **Close details** when open. Both labels share one grid cell, reserving the larger label's width so opening does not shrink the button; the inactive label remains hidden from assistive technology. On tablet/mobile it becomes sticky while open. Closing from farther down the explanation restores that control to view if collapse would leave it offscreen, preserving native focus.
- **Mathematics:** ordinary `$…$` and `$$…$$` LaTeX in Markdown is rendered at build time by remark-math and rehype-katex through Astro's unified Markdown processor. Styles/fonts are bundled locally. The typical-cell limits use three separate display blocks inside a `shape-results` div, with blank lines around each formula and the div boundaries. A container query puts them side by side when the text column exceeds 30rem and stacks all three below that width, including with enlarged text. The direct KaTeX dependency is pinned to **0.16.47**, matching the renderer used by rehype-katex and micromark; keep their versions aligned when upgrading. Mixing 0.16 renderer output with 0.18 styles breaks the visible notation even when MathML is correct. Browser checks measure an actual superscript and verify that the current displays fit at 320–1440px. Longer future display equations can scroll within their own container.
- **Research thumbnails:** set `thumbnail: { src: '/images/…', alt: '…' }` only for an actual image, and enable `showResearchThumbnails` globally in `profile.ts`. Null thumbnails occupy no column.
- **CV/theses:** edit `src/data/cv.ts`. The current PhD document is `/documents/PhD_thesis_matthias_irlbeck.pdf`, the corrected 190-page version with the cover and blue links. It is also linked from the high-dimensional percolation entry. The expanded entry's link adds `#page=12`, pointing a supporting PDF viewer to the page containing Theorems 1.4 and 1.6; its label remains “PhD thesis”, and collapsed/CV URLs keep the whole-document destination. The master's document is `/documents/Master thesis Matthias Irlbeck.pdf`. Thesis links show their titles and supervisors without PDF file-size labels. Keep the supplied filenames intact; the older `/documents/matthias_irlbeck_thesis.pdf` address remains available for compatibility. Null URLs remain non-clickable placeholders beside the qualification. Research frontmatter links may use HTTPS or an absolute local document path.
- **Contact:** edit the invitation, plain-text professional email, office and address in `src/data/contact.ts`. The **Copy email** button appears when JavaScript and the Clipboard API are available, announces success or failure, preserves keyboard focus through the copy operation, and never adds a mailto link. Contact contains only Email and Office; profile links have been removed at the owner’s request. The Email label, address, and copy-button text share a baseline where they fit on one line. On narrow screens the button wraps beneath the address, aligned with its left edge. Shared grid tracks size labels from their text, keeping Email and Office values aligned when text is enlarged. When the contact area is 20rem wide or less, each label stacks above its full-width value; this also responds to text resizing. Thesis titles and supervisor labels are editable in `src/data/cv.ts`; complete thesis labels/titles are clickable and each supervisor occupies a closely spaced separate line. Do not publish residential details or reuse the old Groningen office.
- **Design and printing:** centralized tokens, responsive layout, and print rules are in `src/styles/global.css`; rendering is in `src/pages/index.astro` and `src/components/`. Publication links keep a 44px tap target with cancelling vertical padding/margins, so linked and plain-text statuses share the same visible spacing. Printing removes that padding and uses black text on white, compact spacing, smaller figures and explicit arXiv URLs, while hiding interactive controls. Open the research entries you want before printing; printing preserves their chosen disclosure state.
- **Browser and sharing metadata:** `public/favicon-voronoi-cover.png` is a 64 × 64 text-free crop of the supplied PhD cover, showing roughly five prominent colourful cells. Its new filename avoids the browser's cached MI icon, and serving the PNG directly supports browsers that do not display raster images embedded in SVG favicons. The source rectangle in `public/documents/cover_with_title.png` is `(left: 425, top: 255, width: 335, height: 335)` pixels. The crop preserves the original artwork; the cover and PDFs remain unchanged. The homepage derives Open Graph title, description, URL, and portrait metadata from existing profile/site configuration. This does not change the configured domain or noindex setting.

### Adding an approved video

Put a small web-ready MP4/WebM and its optimized poster in `public/media/`; keep large originals in the ignored `source-assets/media/` directory, outside both Git and `public/`. Astro copies every file in `public/` into local builds, including Git-ignored files, so ignoring a public original alone does not exclude it from deployment artifacts. In the relevant entry's frontmatter replace `media: []` with actual approved clips:

```yaml
media:
  - label: A descriptive clip name
    src: /media/approved-clip.mp4
    poster: /media/approved-poster.webp
    caption: 'An approved explanation, optionally with $n=32$ or $S^2$.'
```

Captions accept Markdown and `$…$` mathematics. `src/lib/caption-markdown.ts` renders HTML and MathML at build time with the same local renderer and link policy as research content. The initial caption works without JavaScript; switching clips clones the corresponding rendered template, preserving the notation through playback retries.

Use actual files before adding these paths. Confirm which entry a clip belongs to and whether multiple views share a realization. Multiple items produce labelled clip choices in one figure. At the owner's request, a native video plays muted on a loop when its research details are open and its frame is visible in the active tab, with controls and playsinline. Video sources are deferred, so collapsed entries request no video data. The supplied poster appears after expansion even when reduced motion or an explicit browser data-saving preference keeps playback manual; displaying it does not request MP4 bytes. Closing details, scrolling the video out of view, or hiding the tab pauses playback; returning resumes only if the visitor did not pause it manually. A manual pause also survives reopening. Switching clips pauses the old clip and plays the selected one while visible. Reduced-motion preferences and `navigator.connection.saveData === true` keep playback manual via **Play video**. The data-saving API is not available in every browser; absent an explicit preference, the normal autoplay behaviour applies. If automatic playback or loading fails, the same button allows a retry. Without JavaScript, inactive media/clipboard controls are hidden and direct new-tab video links remain available. The native disclosure remains usable, with its two labels switched by CSS. On tablet/mobile its existing summary stays reachable as a sticky close control while open, without introducing a second disclosure. Confirmed HTTPS file URLs also work. The current square frame preserves the full scientific image; adjust its aspect ratio when supplying a differently shaped clip. Add size, dimensions/aspect ratio, and caption review to CONTENT_TODO.md when real files arrive.

The high-dimensional percolation entry serves `public/media/vor_perc_clust-web.mp4`: a 960 × 960 H.264 rendition, 3,996,387 bytes (about half the original size), with the same 24 fps and 20.834-second duration. The supplied `source-assets/media/vor_perc_clust.mp4` remains unchanged locally and is ignored by Git. Only web renditions and posters are packaged for deployment; do not rely on original-video URLs in a fresh checkout or published site. Its poster, `vor_perc_clust-poster.jpg`, was extracted from the original at 1 second. To regenerate the web copy using an already installed ffmpeg and the preserved local original:

```sh
ffmpeg -nostdin -i source-assets/media/vor_perc_clust.mp4 \
  -vf scale=960:960:flags=lanczos -c:v libx264 -preset slow -crf 23 \
  -pix_fmt yuv420p -movflags +faststart -an public/media/vor_perc_clust-web.mp4
```

The new Borsuk and hyperbolic clips are assigned by their supplied filenames to the corresponding research entries. Both use 960 × 960 H.264/yuv420p web renditions with fast-start MP4 metadata and the original 30 fps. Posters are WebP frames extracted at 5 seconds. The Borsuk web rendition preserves its original AAC audio track; playback starts muted as with the other clips.

| Research entry | Web rendition | Original → web size | Duration |
| --- | --- | --- | --- |
| Random Borsuk graph | `public/media/borsuk-animation-web.mp4` | 9,795,670 → 6,843,747 bytes | 30.047 s |
| Hyperbolic Poisson-Voronoi percolation | `public/media/hyperbolic-poisson-voronoi-web.mp4` | 14,585,092 → 2,142,641 bytes | 25 s |

Reproduce these copies using an already installed ffmpeg (choose a new output filename if it exists):

```sh
ffmpeg -nostdin -i source-assets/media/Borsuk_animation.mp4 \
  -vf scale=960:960:flags=lanczos -c:v libx264 -preset slow -crf 27 \
  -pix_fmt yuv420p -movflags +faststart -c:a copy public/media/borsuk-animation-web.mp4
ffmpeg -nostdin -i source-assets/media/hyperbolic_poisson_voronoi.mp4 \
  -vf scale=960:960:flags=lanczos -c:v libx264 -preset slow -crf 23 \
  -pix_fmt yuv420p -movflags +faststart -an public/media/hyperbolic-poisson-voronoi-web.mp4
```

The typical-cell shape entry uses `typical-voronoi-cell-web.mp4`, a 960 × 960 H.264/yuv420p fast-start MP4 converted from the owner's `0001-0900.mkv`. The rendition retains 30 fps and the full 23.367-second animation, reducing 14,777,212 bytes to 2,594,880 bytes (82% smaller). Its 38,926-byte WebP poster is extracted at 3 seconds. Regenerate from the preserved source using a new output filename if one already exists:

```sh
ffmpeg -nostdin -i source-assets/media/0001-0900.mkv \
  -vf scale=960:960:flags=lanczos -c:v libx264 -preset slow -crf 23 \
  -pix_fmt yuv420p -movflags +faststart -an public/media/typical-voronoi-cell-web.mp4
ffmpeg -nostdin -ss 3 -i source-assets/media/0001-0900.mkv \
  -frames:v 1 -vf scale=960:960:flags=lanczos -c:v libwebp -quality 82 \
  public/media/typical-voronoi-cell-poster.webp
```

All four supplied original videos are preserved byte-for-byte in `source-assets/media/`, outside the public build tree and ignored by Git; their web renditions and posters are included in the review package. This excludes 47,213,686 bytes of originals from local static builds. Hashes were checked before and after relocation. Back up the originals separately before moving the workspace. Regeneration commands require those local originals. Compare outputs visually, including the diagram's fine edges. Supplied document files are included unchanged; the cover image is already incorporated into the PhD PDF.

## Dependency advisory monitoring

```sh
npm run audit:security
```

This runs `npm audit --package-lock-only --ignore-scripts` against the committed dependency lockfile without installing packages or changing versions. The dedicated `.github/workflows/dependency-security.yml` uses read-only repository permissions and supports manual dispatch. Once it is on the default branch, its schedule runs every Monday at 06:00 UTC. Findings remain visible through the command's nonzero exit status; the workflow does not suppress advisories, update dependencies, merge changes or deploy the site.

As of 5 October 2026, [GHSA-ch52-4w7c-c8xp / CVE-2026-93748](https://github.com/advisories/GHSA-ch52-4w7c-c8xp) remains an active high-severity advisory for `http-cache-semantics`, with no patched version listed. The [upstream maintainer disputes the report](https://github.com/kornelski/http-cache-semantics/issues/56#issuecomment-5975759591), and the [withdrawal-review request remains open](https://github.com/github/advisory-database/issues/10139). No verified patch was identified; dependency versions and the lockfile are unchanged. The dispute is not an official withdrawal, and the monitoring command currently reports the finding. Track a verified fix or official advisory resolution in CONTENT_TODO.md.

## GitHub review and deployment

The production domain already serves the Astro site through GitHub Pages. GitHub verification confirms [launch PR #4](https://github.com/MatthiasIrlbeck/website/pull/4) merged on 3 October 2026; who changed the hosting or DNS settings remains unconfirmed. Check the actual branch and PR state before preparing updates; a historical branch name is not publication evidence. Branch pushes and pull requests run **Check website** for draft `/website`, draft `/` and production `/`; they do not deploy. REVIEW_NOTES.md records validation and CONTENT_TODO.md retains unresolved content and maintenance work.

The **Deploy website to GitHub Pages** workflow requires `npm run check`, the production build and the Chromium/Firefox browser suite to pass before uploading `dist`. Its build job uses the explicit production values above and `PLAYWRIGHT_BROWSERS=chromium,firefox`, installs the pinned browser binaries and system FFmpeg, then runs `npm run test:browser`. A failure stops artifact upload and deployment. Only its deploy job receives Pages-write/OIDC permissions, and that job runs only for `main` after the build job succeeds. It also supports manual dispatch from `main`. An approved merge into `main` triggers a production update; the owner reviews and authorizes merging. A local preview or an unmerged PR does not publish the changes.

Preserve the existing custom domain, GitHub Pages and Porkbun DNS settings, including unrelated mail and verification records. Ordinary content updates do not require changing them. After a deployed update, inspect the deployment result, HTTPS, the canonical `www` host and redirects from alternate hosts, then verify assets, thesis links, research fragments and crawler response headers at `https://www.matthiasirlbeck.com/`.

An optional live smoke check after a deployment:

```sh
curl --fail --silent --show-error --dump-header /tmp/website-live-headers.txt \
  https://www.matthiasirlbeck.com/ -o /tmp/website-live.html
node --input-type=module <<'JS'
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const html = readFileSync('/tmp/website-live.html', 'utf8');
const headers = readFileSync('/tmp/website-live-headers.txt', 'utf8');
assert(html.includes('Matthias Irlbeck'));
assert(/<link[^>]*rel="canonical"[^>]*href="https:\/\/www\.matthiasirlbeck\.com\/"/.test(html));
assert(!/noindex|noarchive|nofollow/i.test(html));
assert(!/^x-robots-tag:.*(?:noindex|noarchive|nofollow|none)/im.test(headers));
console.log('Homepage and indexing smoke check passed; also inspect links and media in a browser.');
JS
```

Test the live site on desktop and a phone, including native Safari/iOS playback, before claiming full browser compatibility. The local preview verifies the built files; it does not verify live DNS, HTTPS or GitHub/custom-domain headers.

## Continuing local edits

Start from a clean working tree. Preserve any uncommitted work before switching branches; keep original videos backed up separately because Git does not track them.

```sh
git status --short
git switch main
git pull --ff-only origin main
git switch -c edit/short-description
# Make the content or CSS changes described above, then:
npm run check
npm run build
PLAYWRIGHT_BROWSERS=chromium,firefox PLAYWRIGHT_PORT=4335 npm run test:browser
git diff --check
git diff
```

Use the default `/website/` draft preview during editing. Also rebuild/test with the production exports above before submitting updates that affect URLs, metadata or layout. Inspect desktop/mobile screenshots and expanded research entries. Stage only intended files (`git add -p` is useful for text changes), commit, push the edit branch, and open a PR targeting `main`. The owner reviews and merges it; the main-only workflow then republishes the production build. Do not commit dependencies, generated builds, browser caches, local environment files or source-video originals.

No blanket license is applied to papers, theses, portrait, or video. Dependency distributions retain their license notices in node_modules; the redistributed KaTeX CSS/fonts are accompanied by their MIT notice in `public/licenses/katex.txt`.
