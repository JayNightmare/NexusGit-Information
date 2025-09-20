# NexusGit Linktree (React)

Dark-mode, mobile-friendly Linktree-style landing page listing NexusGit projects. All link data is loaded from a single JSON file for easy editing.

## Editing Links
Update `src/links.json` with real project data. Schema:

```
[
  {"Link": "https://url", "DisplayName": "Readable Name", "Info": "Short description", "Image": "https://image-or-icon.png"}
]
```

Fields:
- Link (string, required) – destination URL.
- DisplayName (string, required) – shown as card title.
- Info (string, optional) – supporting text.
- Image (string, optional) – square image/logo. If missing, first letter of DisplayName is shown.

## Local Development
```
npm install
npm start
```
Page runs at http://localhost:3000

## Build
```
npm run build
```

## Deploy to GitHub Pages
1. Ensure repository has GitHub Pages enabled (gh-pages branch) and custom domain set to `nexusgit.info` in repo settings (Pages -> Custom domain). This will also create / update the DNS records required.
2. Confirm the `public/CNAME` file contains the domain (already added).
3. Deploy:
```
npm run deploy
```
This publishes the `build/` directory to the `gh-pages` branch via the `gh-pages` package.

If you rename the repository or use a different domain, adjust the `homepage` value in `package.json` accordingly (for a custom domain keep it as the full https:// URL of that domain).

## Downloads Route (versioned executables)
You can host downloadable files directly from the site via a simple versioned path under the `public/` folder. Any files placed inside `public` are copied to the root of the deployed site.

- Local path structure: `public/application/downloads/<version>/application.exe`
- Deployed URL structure: `https://nexusgit.info/application/downloads/<version>/application.exe`

Example: adding the file at `public/application/downloads/1.2.3/application.exe` will be available at:

- `https://nexusgit.info/application/downloads/1.2.3/application.exe`

Notes and recommendations:
- File size limits: GitHub Pages is meant for static sites. While it can serve binaries, large files may be slow or hit limits. Prefer keeping binaries small. For larger installers, use GitHub Releases and link to them from this site.
- MIME type: GitHub Pages (via GitHub’s CDN) will serve `.exe` with a generic/binary content-type; browsers will download rather than display. That’s fine for installers.
- SEO/Indexing: version folders are static; update links or your UI to point to the latest version if desired.
- Security: only commit files you intend to publish publicly. Avoid including secrets in the repo.

To publish a new version:
1. Add the file at `public/application/downloads/<new-version>/application.exe`.
2. Commit and deploy with `npm run deploy`.
3. Share the corresponding URL.

## Accessibility / Best Practices
- Semantic headings, focus outlines, color contrast tuned for dark background.
- Reduced motion respected (`prefers-reduced-motion`).
- External links open in new tab with `rel="noopener noreferrer"`.

## Custom Styling
Adjust colors and spacing inside `src/styles.css`. Cards are pure CSS and minimal.

## License
Add your chosen license file if needed.
