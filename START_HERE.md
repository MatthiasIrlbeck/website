# Start here

This package is a Codex implementation handoff, not a built website. It contains no portrait, videos, PDFs, fonts, credentials, or website source code.

1. Create a new GitHub repository under MatthiasIrlbeck named website, with a README and main branch. A public repository supports the GitHub Free / Pages route; all committed material is public. Do not use it for private research drafts.
2. Upload the extracted files from this package to the repository root using Add file > Upload files. Do not upload only the ZIP.
3. Open Codex Cloud with your ChatGPT account. The current documented route is Work in > Cloud > Select environment > Create environment. Select only the website repository, granting access to this new repository when prompted.
4. Let Codex prepare a Node/npm environment. Tell it this is a new static Astro project described in WEBSITE_BRIEF.md. Allow the package-manager access it needs; add specific documentation/browser-download hosts only when required. Review and publish the environment. Publishing an environment is not publishing your website.
5. Start a task using the content of CODEX_PROMPT.txt. Ask for implementation, tests, and screenshots, not another plan. Missing assets are expected and should become intentional placeholders.
6. Review the task's changes and screenshots, then create/open the pull request. In the GitHub repository, set Settings > Pages > Build and deployment > Source to GitHub Actions. Do not set a custom domain. Review and merge the PR when ready for the draft to become public at the review address.
7. Check the Actions deployment result and Settings > Pages > Visit site. Expected address after successful deployment: https://matthiasirlbeck.github.io/website/ . This is not an already-live link supplied by this package. A PR alone is not automatically a GitHub Pages preview.
8. Test the draft in your own desktop and phone browsers, give focused visual feedback, and repeat the task/PR/review process. Main-branch merges will update the draft site once deployment is configured.
9. Add the portrait, thesis links/PDFs, approved text, and optimized media. Large original videos should stay outside the repository. GitHub browser uploads have a 25 MiB per-file limit; the first draft does not need these files.
10. Move the custom domain only after review and explicit approval. Until then, leave Porkbun and the current Google Sites configuration unchanged.

Important: the GitHub Pages review URL is public. A noindex tag discourages search-engine indexing; it is not access control and does not protect files or repository history. ChatGPT Pro and GitHub Pro are separate subscriptions; private-repository GitHub Pages depends on GitHub's plan, not the ChatGPT plan.

Reference documentation (consulted 1 October 2026):
- https://developers.openai.com/codex/cloud/
- https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan
- https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- https://docs.astro.build/en/guides/deploy/github/
- https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github
- https://developers.google.com/search/docs/crawling-indexing/block-indexing
