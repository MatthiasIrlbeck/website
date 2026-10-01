# Matthias Irlbeck — academic website

A portable static Astro review site. The single homepage contains biography/portrait, Research, Short CV, and Contact, in that order. Research uses native disclosures and build-time KaTeX HTML/MathML. No framework runtime, remote fonts, math CDN, YouTube embed, contact form, or separate Animations route is used.

Missing assets are explicit placeholders. Review wording and academic metadata before launch; see [CONTENT_TODO.md](CONTENT_TODO.md). Draft/noindex is not access control: the repository and a deployed review site are public.

## Setup and local review

Use **Node 24 LTS** (`.nvmrc`, package engines, and CI agree), npm, and the committed lockfile. This implementation was tested with Node 24.19.0/npm 11.9.0 and Astro 7.3.5.

```sh
# If you use nvm:
nvm install
nvm use
npm ci
npm run check
npm run build
npm run dev
# Or serve the built site:
npm run preview
```

Open the server address printed by Astro with the configured `/website/` path. In Codex Cloud, validate via internal HTTP requests; the onboarding UI does not provide localhost previews. Cloud tasks are already isolated: use the checkout, without creating extra Git worktrees unless requested.

In this cloud environment, export these before npm/Astro commands to avoid writes to an unwritable home directory:

```sh
export npm_config_cache=/workspace/.npm-cache
export ASTRO_TELEMETRY_DISABLED=1
```

Astro 7 can automatically background servers when run by an agent. Stop servers you started with `npm run dev -- stop` / `npm run preview -- stop`; inspect them with `-- status` / `-- logs`. Browser tests use the documented `--ignore-lock` foreground mode so Playwright owns the process lifetime.

## Build configuration

`src/lib/site.ts` is the single source of defaults and local asset URL handling. Set build-time variables in the shell or CI; `.env.example` documents the names. No production credentials are required.

| Variable | Review default | Purpose |
| --- | --- | --- |
| `SITE_URL` | `https://matthiasirlbeck.github.io` | Canonical site origin |
| `BASE_PATH` | `/website` | Project-site prefix; use `/` for a domain-root build |
| `DRAFT_SITE` | `true` | Visible Draft notice and noindex metadata |

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

The base variable must agree between build and preview/tests. Root-path testing does not change any live domain or remove noindex. Keep `DRAFT_SITE=true` until an explicitly approved launch.

## Browser checks and screenshots

```sh
npx playwright install --with-deps chromium
npm run test:paths
```

Tests use installed `/usr/bin/chromium` when available, or Playwright's bundled Chromium otherwise. Override with `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` if needed. The bundled browser download was blocked by this cloud environment's network policy; installed Chromium 151 was successfully used. CI installs the matching Playwright Chromium.

Tests cover desktop/mobile rendering, initial network requests, supplied and missing optional-content fixtures, local math fonts, HTML/MathML, keyboard toggling, the bottom **Close details** control and its focus return, direct/hash links, independent paper links, multiple disclosures, no-JavaScript content, no Animations route, and overflow at 390px and 320px. The assertions discover research entries and accept either valid supplied assets/contact links or their intentional missing-content states, so ordinary content additions do not require fixed-count test updates. Full-page screenshots are written to `artifacts/screenshots/project/` and `artifacts/screenshots/root/`: `desktop-collapsed.png`, `desktop-expanded.png`, `mobile-collapsed.png`, `mobile-expanded.png`. These directories and test reports are ignored and never shipped to Pages. PR checks upload screenshots and the Playwright report as 14-day Actions artifacts.

Real video playback, switching between supplied clips, pause on close, and real thesis downloads require owner assets and are not covered by the placeholder checks. Add tests against approved media when supplied. Math definitions in this draft are explicitly background examples, not theorem claims.

## Editing content

- **Biography/portrait:** edit `src/data/profile.ts`. Keep the biography at most five sentences. Put an optimized portrait in `public/images/`, then replace `portrait: null` with `{ src: '/images/portrait.webp', alt: '…', width: 800, height: 1000 }` using the actual dimensions. Null retains the labelled placeholder.
- **Research:** edit one Markdown file per entry in `src/content/research/`. Copy an existing entry for a new paper, use a stable descriptive filename (also its fragment ID), choose a unique numeric `order`, and provide verified `title`, coauthors in `authors`, `status`, `summary`, and `links`. Keep unconfirmed text marked `needsReview: true`. Use `links: []` when a paper URL is missing.
- **Mathematics:** ordinary `$…$` and `$$…$$` LaTeX in Markdown is rendered at build time by remark-math and rehype-katex through Astro's unified Markdown processor. Styles/fonts are bundled locally. Long display equations scroll within their own container.
- **Research thumbnails:** set `thumbnail: { src: '/images/…', alt: '…' }` only for an actual image, and enable `showResearchThumbnails` globally in `profile.ts`. Null thumbnails occupy no column.
- **CV/theses:** edit `src/data/cv.ts`. Put actual PDFs in `public/documents/` and set the corresponding thesis URL to `/documents/phd-thesis.pdf` or `/documents/masters-thesis.pdf`, or use a confirmed HTTPS university repository URL. Do not create fake/empty PDFs. Null URLs remain non-clickable placeholders beside the qualification. Confirm dates and document titles in the checklist.
- **Contact:** edit `src/data/contact.ts` with a confirmed professional email/office. Do not publish residential details or reuse the old Groningen office.
- **Design:** centralized tokens and responsive layout are in `src/styles/global.css`; rendering is in `src/pages/index.astro` and `src/components/`.

### Adding an approved video

Put a small web-ready MP4/WebM and its optimized poster in `public/media/`; keep large originals outside Git. In the relevant entry's frontmatter replace `media: []` with actual approved clips:

```yaml
media:
  - label: A descriptive clip name
    src: /media/approved-clip.mp4
    poster: /media/approved-poster.webp
    caption: An approved explanation of the finite simulation and its limitations.
```

Use actual files before adding these paths. Confirm which entry a clip belongs to and whether multiple views share a realization. Multiple items produce labelled clip choices in one figure. A native video has controls and playsinline; source/poster are set only after the visitor selects **Load and play video**. Closing the disclosure or switching clips pauses playback. Errors show a text fallback and retry control. No autoplay attribute or initial video-data request is used. Confirmed HTTPS file URLs also work. Add size, dimensions/aspect ratio, and caption review to CONTENT_TODO.md when real files arrive.

## GitHub review and deployment

The implementation branch is `review/astro-homepage`. To submit it if a PR has not been created:

```sh
git push -u origin review/astro-homepage
gh pr create --base main --head review/astro-homepage \
  --title "Build draft Astro academic homepage" \
  --body-file REVIEW_NOTES.md
```

Alternatively, after pushing, use GitHub's **Compare & pull request** for this branch and use a description covering the draft behavior, tests, and missing media. A PR is reviewable source; it is not a Pages preview. Do not merge without owner authorization.

1. Owner: repository **Settings → Pages → Build and deployment → Source: GitHub Actions**. Do not set a custom domain.
2. Review the PR and the **Check website** Actions run. It builds and tests `/website` and `/`; it cannot deploy PR code.
3. Owner: merge the approved PR into `main`. The separate **Deploy draft to GitHub Pages** workflow builds/checks/uploads `dist` and deploys only `main`. It also supports manual dispatch from `main`.
4. Check the workflow's successful deployment and **Settings → Pages → Visit site**. The expected URL is `https://matthiasirlbeck.github.io/website/`; it is not claimed live before successful deployment.
5. Optional live smoke check after deployment:

```sh
curl --fail --silent --show-error https://matthiasirlbeck.github.io/website/ -o /tmp/website-live.html
node -e 'const s=require("node:fs").readFileSync("/tmp/website-live.html","utf8"); if(!s.includes("Matthias Irlbeck") || !s.includes("noindex")) process.exit(1)'
```

Test the deployed site on your phone and desktop too. Actions versions follow the current official Astro/GitHub Pages guidance, inspected from the Astro documentation source on 1 October 2026. Deployment uses explicit `npm ci` and only the deploy job receives Pages-write/OIDC permissions; CI has read-only repository access.

## Later production-domain switch — separate approval required

After content approval, choose canonical `www` or bare domain, change `SITE_URL`/`BASE_PATH` and Pages custom-domain settings, then change only the necessary DNS records with explicit authorization. Preserve unrelated mail and verification records, verify HTTPS and asset/link resolution, and deliberately disable Draft/noindex. This implementation does not add a CNAME, configure Porkbun, migrate the domain, or replace the current Google Sites website.

No blanket license is applied to papers, theses, portrait, or video. Dependency distributions retain their license notices in node_modules; the redistributed KaTeX CSS/fonts are accompanied by their MIT notice in `public/licenses/katex.txt`.
