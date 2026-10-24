# Neon Grid Terminal: Development Brief

Oct 24, 2026 · @Jay Bell

## Summary

Neon Grid is a single-file, dependency-free website that presents itself as a full-screen Arch Linux TTY with a cyberpunk skin. It boots, types an ASCII logo, fakes a login, then drops the visitor at a bash prompt where pages are files: `cat about.md` reads a page, `cd projects` moves into a section. All page text is lorem ipsum placeholder. Version 2 is the current state; it replaced version 1, which looked like a floating terminal window with a title bar and button row.

**Source file:** `neon-grid-terminal.html` (about 480 lines, one `<style>`, one `<script>`, no build step, no libraries). It is attached in the chat. Live preview: the published Artifact called Neon Grid Terminal.

**What the user asked for, in order:**

1. A simple cyberpunk website aimed at a terminal GUI, with boot animations, typing animations and ASCII art.
2. It should land on a page that looks like a terminal where the visitor types bash commands to view and navigate the site's pages. Placeholder lorem ipsum text.
3. After seeing the first version: redo it so the page is the website itself, not a GUI window pretending to be a bash window. Reference look: an Arch Linux terminal.

**To run it in VS Code:**

1. Create a folder, save the attached file as `index.html`, and apply the wrapper in the next section (the file is a fragment, not a full HTML document).
2. Open the folder in VS Code and run it with the Live Server extension, or `npx serve .`, or `python3 -m http.server`. Opening via `file://` also works because nothing is fetched at runtime, except the two Google Fonts which need internet.

## Target repo: NexusGit-Information

The goal is to replace the current link-tree page of [JayNightmare/NexusGit-Information](https://github.com/JayNightmare/NexusGit-Information) with this terminal UI, with each project reachable as a path. This section describes the repo as it stands (read from a shallow clone of `main`, commit `242fa70`; nothing was changed or pushed) and how the terminal should plug into it.

**What the repo is today:**

- A Create React App project (`react-scripts` 5.0.1, React 18.3.1), named `nexusgit-linktree`, with `homepage` set to `https://nexusgit.info` and `public/CNAME` containing `nexusgit.info`.
- `src/App.js` renders `Header`, `LinkList` (fed by `src/links.json`), a footer and a `Rain` component (CSS rain drops plus random lightning flashes, built with `innerHTML` in a `useEffect`).
- `src/styles.css` is a dark theme using Quicksand, with `--primary: #61dafb`. Note it sets `user-select: none` on `*`.
- `.github/workflows/deploy.yml` builds on every push to `main` (Node 20, `npm ci`, `npm run build`) and deploys `build/` to GitHub Pages. `ci.yml` builds on push and pull request.
- `public/application/downloads/HoodieWeather/0.5/HoodieWeather.exe` (about 16.9 MB) is served from the site root as a download.

**Data source.** `src/links.json` is the single source of truth. Fields: `Link`, `DisplayName`, `Info`, `Image`, `Enabled` (the README documents the first four; `Enabled` is used but undocumented). Current entries and the path I propose for each:

| DisplayName | Link | Proposed path |
| --- | --- | --- |
| Portfolio | portfolio.nexusgit.info | `projects/portfolio.md` |
| Mood Movies | mood-movies.nexusgit.info | `projects/mood-movies.md` |
| DisTrack | distrack.nexusgit.info | `projects/distrack.md` |
| Augmented Perception | augmented-perception.nexusgit.info | `projects/augmented-perception.md` |
| Nexus Scripture | github.com/Nexus-Scripture (GitHub org) | `projects/nexus-scripture.md` |
| Hollownest Radio | radio.nexusgit.info | `projects/hollownest-radio.md` |
| TOS and Privacy Policies | terms-and-privacy.nexusgit.info | `legal/terms-and-privacy.md` |
| HoodieWeather 0.5 (file in `public/`, not in the JSON) | `/application/downloads/HoodieWeather/0.5/HoodieWeather.exe` | `downloads/hoodieweather/0.5/` |

**Design for the integration:**

1. **Keep `links.json` as the source of truth.** At startup, build `ROOT` from it instead of hard-coding pages. Each entry becomes a generated page whose slug is the lowercased `DisplayName` with non-alphanumerics turned into hyphens. The page shows the name as `# heading`, `Info` as the paragraph, the hostname, and the link. Adding a project then stays a one-line JSON edit, as the README already promises. The hand-written pages (`readme.md`, `about.md`, `contact.md`) stay in code or move to their own files.
2. **`Enabled: false` handling.** The current UI greys these cards out. In the terminal, list them in `ls` in the dim colour with an `[offline]` tag, and make `open` refuse with a message.
3. **Rename the `open` alias.** In the prototype `open` is an alias for `cat`. On the real site `open <project>` should launch the project's URL, so remove that alias. `cat <project>` still shows the page.
4. **External links need a real anchor.** Add a link syntax to the markdown renderer, `[label](https://...)`, that renders an `<a target="_blank" rel="noopener noreferrer">`, accepting only `http:` and `https:`. Make `open` print the same anchor and also call `window.open`; if the browser blocks the popup (it returns `null`) the visible link still works. This matters because many visitors will arrive from a link in a social profile on a phone.
5. **A downloads directory.** Add `downloads/hoodieweather/0.5/HoodieWeather.exe` as a node type that renders a download link instead of text, plus a `get <file>` command. Better, generate the downloads tree at build time by walking `public/application/downloads`, so adding a version folder needs no code edit.
6. **A flat list for accessibility and speed.** Add a `links` command that prints every external URL as plain anchors with no animation.
7. **Boot only on a first visit.** People using a link in bio want the project list quickly. Show the full boot and login once per browser session, then jump straight to the prompt with `ls projects` already printed on later loads. Use `sessionStorage` inside try/catch and fall back to the full boot. Keep the skip-on-keypress behaviour.
8. **Rain.** Decide whether to keep it. It is a React component today, so it would need porting to plain DOM. A cheap option is a `rain` command that toggles it on and off, off by default.
9. **Make `neofetch` about NexusGit.** Replace the placeholder values with the real project count (from the JSON), the domain, and the real site name.

**Structural choice to confirm: keep React or go static?** The terminal uses no React features. Two options:

| Option | What changes | Trade-off |
| --- | --- | --- |
| A: Keep Create React App | Mount the terminal from a thin `src/Terminal.js` component, import `links.json` as today, delete `Header.js`, `LinkList.js`, `LinkCard.js` and the old styles. The deploy workflow and `CNAME` stay as they are. | Smallest change to the deploy pipeline. Keeps a deprecated toolchain and a large dependency tree for one page. |
| B: Plain static site | Move the terminal into `public/` (or Vite) as `index.html`, `style.css` and ES modules, drop React, change the workflow to upload that folder instead of `build/`. | No build for the site itself and faster load, but the workflow, `package.json` scripts and the links import all need editing, and `links.json` must be fetched at runtime (needs HTTP, not `file://`). |

My suggestion is A for the first working version, because it ships without touching deployment, then B once the terminal is stable. This is your call, so say if you prefer B from the start.

**Existing problems the migration should fix or knowingly keep:**

| Where | Issue | Suggested action |
| --- | --- | --- |
| `src/styles.css` | `* { user-select: none }` blocks selecting and copying text | Remove it, or scope it, for the terminal. Selecting output is expected in a terminal. |
| `deploy.yml` | Runs `cd src/utils && node generate-sitemap.mjs`, but `src/utils/` does not exist in the repo. `continue-on-error: true` hides the failure on every deploy. | Add the script (it can read `links.json` and write `sitemap.xml`) or delete the step. |
| `public/index.html` | `og:image` and `twitter:image` point to `/public/icon.svg`. Files in `public/` are served from the root, so the URL should be `/icon.svg`, and social previews usually need an absolute URL and a raster image. | Fix to `https://nexusgit.info/icon.svg` at minimum. |
| `public/index.html` | Loads the Google AdSense script and sets an AdSense account meta tag. A full-screen terminal has no ad slots. | Decide whether to keep it. Removing it speeds the page. I did not touch it. |
| `public/index.html` | `<noscript>` says only that JavaScript is required. A terminal with no content in the HTML is invisible to crawlers that do not run scripts. | Put a plain list of project links inside `<noscript>`, ideally generated from `links.json`. |
| `src/links.json` | Images are hotlinked from `raw.githubusercontent.com` and `github.com/...?raw=true`, and one uses `picsum.photos` as a placeholder. | Not needed for a text terminal. Keep the field in case thumbnails return. |
| `src/styles.css` | Imports Quicksand from Google Fonts | Replace with VT323 and Share Tech Mono, ideally self-hosted. |
| `public/application/downloads` | A 16.9 MB `.exe` lives in git | Works, but GitHub recommends Releases for larger installers (the README says the same). |

**Order of work for this repo:**

1. Create a branch. Copy the terminal's CSS into `src/terminal.css` and its script into modules under `src/terminal/`, keeping the behaviour identical.
2. Add the `Terminal` component, mount it from `App.js`, and remove the old components. Confirm `npm start` shows the boot and the prompt.
3. Replace the hard-coded `projects/` and `blog/` in `ROOT` with the generator from `links.json`. Remove the blog directory or keep it only if you plan to write posts.
4. Add the `open`, `get` and `links` commands, the anchor syntax, and the first-visit boot logic.
5. Fix the table of problems above, then run `npm run build` and check the output at about 400px and desktop widths.
6. Open a pull request so `ci.yml` runs the build before merging to `main` triggers a deploy.

**Prompt for Claude Code, replacing the generic one at the end of this brief:**

```text
This repo is a Create React App link tree for nexusgit.info. Read BRIEF.md first, especially
the sections "Target repo: NexusGit-Information" and "Suggested next steps". The file
neon-grid-terminal.html in the repo root is the prototype of the new UI.

Task: replace the link-tree UI with the terminal UI.
- Keep React and the existing GitHub Pages deploy; do not change CNAME or the workflows
  except to fix the broken sitemap step.
- Build the virtual filesystem from src/links.json (slug = DisplayName lowercased, hyphenated).
  Entries with Enabled false are listed as offline and cannot be opened.
- Rename the open alias so open <project> launches the URL (real anchor plus window.open).
- Add a downloads/ tree generated from public/application/downloads, a get command, and a
  links command.
- Show the full boot once per session (sessionStorage in try/catch); later loads go straight
  to the prompt.
- Remove user-select: none for the terminal; fix og:image paths; put project links in <noscript>.
- Keep it dark-only, add no dependencies, and make npm run build pass.
Work on a new branch and summarise any decision you had to make.
```

## Porting from the Artifact to a standalone page

The file was written for Claude's Artifact publisher, which wraps the content in a document skeleton at publish time. The file therefore starts with `<title>`, a `<meta>`, a `<link>` and a `<style>` block, and has no `<!doctype>`, `<html>`, `<head>` or `<body>`. Browsers tolerate this, but without a doctype the page renders in quirks mode, so add the wrapper below.

**Wrapper to add around the file's contents:**

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <!-- existing <title>, <meta name="claude:viewport-fit-sides">, <link>, <style> go here -->
</head>
<body>
  <!-- existing <main id="term">, #skip, .crt and <script> go here -->
</body>
</html>
```

**Things the publisher's built-in reset supplied that the file silently relies on. Restore them in the stylesheet:**

| Dependency | What the publisher added | Add to your CSS |
| --- | --- | --- |
| `[hidden]` attribute | `[hidden]{display:none!important}` | Same rule. The prompt row (`#row`) and the skip hint (`#skip`) are hidden via the `hidden` property, and `#row` is `display:flex`, which would otherwise override it. |
| Safe-area padding | `:root` padded by `env(safe-area-inset-top/bottom)` | Optional on desktop. Keep it if you target notched phones. |
| Viewport meta | `viewport-fit=cover` | Included in the wrapper above. |
| Body margin and base font | `body{margin:0;font:14px system-ui}` | The file sets its own `margin:0` and `font-family` / `font-size` on `body`, so nothing needed. |
| `color-scheme` | `light` pinned on `:root` | The file sets `color-scheme: dark` on `:root`. |

**Artifact-only leftovers that can be deleted:**

- `<meta name="claude:viewport-fit-sides" content="cover">` is an instruction to the publisher and has no meaning elsewhere.
- The publisher's content-security policy only allowed Google Fonts for external resources. In your own project you can self-host the two fonts (VT323 and Share Tech Mono) instead of linking Google, which also removes the internet dependency.

## Design direction

The page is the terminal: edge-to-edge, no frame, no title bar, no buttons. Everything (boot log, logo, login, command output, live prompt) prints into one scrolling column. The look is a dark CRT with cyan as the working accent and magenta for errors and secondary highlights. The page is deliberately dark-only and does not follow the viewer's light/dark setting; there are no light-theme tokens.

**Colour tokens** (all declared on `:root`):

| Token | Value | Used for |
| --- | --- | --- |
| `--void` | `#020204` | Page background |
| `--ink` | `#c9d3d8` | Body text, typed input |
| `--dim` | `#5f6a78` | Secondary text, prompt brackets, hints |
| `--cyan` | `#19e3f0` | Default accent, directory name in prompt, links, h1 |
| `--magenta` | `#ff2e7e` | Errors, h2 headings, logo glitch fringe, neofetch mask |
| `--amber` | `#ffc83d` | Boot warning tag |
| `--ok` | `#3dffa0` | `[  OK  ]` tags, `guest@neon-grid` in the prompt |
| `--accent` | `var(--cyan)` | The one token the `theme` command rewrites at runtime |

**Fonts** (Google Fonts, with fallback stacks in `--font-mono` and `--font-display`):

- Share Tech Mono: everything by default, 15px with 1.45 line height (13px under 480px width).
- VT323: used only for the `.h1` page headings at 34px (28px on phones).

**CRT effects:**

- `.crt` is a fixed, non-interactive overlay with a radial vignette plus 3px repeating scanlines at 12% black.
- `.logo` has a cyan and magenta `text-shadow` fringe and a stepped `glitch` keyframe that nudges it a few pixels every 5 seconds.
- `.cur::after` draws a blinking block cursor (`\2588`) on text that is still being typed.
- All animation is disabled under `prefers-reduced-motion: reduce`, and the JS `sleep()` helper caps every delay at 8ms in that mode, so the boot becomes near-instant.

**Layout:** `body` is `overflow:hidden` at 100% height; `#term` is the single scroll container (`overflow-y:auto`, 16px side gutters that respect safe-area insets). The prompt row sits at the end of the same flow, below `#out`. `#skip` is the only fixed element, bottom-right.

## Code architecture

All logic is one IIFE in a single `<script>`, plain ES2017+ with `async/await`, no modules. It is organised top to bottom in these blocks, which are also the natural places to split into files if you modularise:

| Block | What it holds |
| --- | --- |
| DOM and state | References: `term` (scroll container), `out` (output log), `row` (prompt row), `input`, `ps1`, `skipHint`. State: `phase` (`"boot"` or `"live"`), `skipped` (boolean), `cwd` (array of path segments, `[]` is home), `history` (array), `hi` (history cursor), `q` (promise queue), `HOST` (`"neon-grid"`). |
| Helpers | `esc()` HTML-escapes. `sleep(ms)` resolves immediately when `skipped`, and caps at 8ms under reduced motion. `typeEl(el, text, speed)` types into an element and snaps to the full text if skipped. |
| ASCII art | `LOGO_A` and `LOGO_B` (two 5-line halves of the NEON GRID block logo, `String.raw` so backslashes survive) and `MASK` (7-line mask used by `neofetch`). |
| Virtual site | `ROOT`, built with `F(string)` for files and `D({...})` for directories. Plus `node(parts)`, `resolve(arg)` and `lookup(arg)`. |
| Output | `print(html, cls)` appends a `.ln` div and scrolls. `inl()` handles inline markdown. `mdLines()` and `printMd()` render a page line by line with a 26ms delay per line. `promptHtml()` and `setPrompt()` draw the prompt. |
| Commands | `CMDS` object (name to function), aliases assigned after it, `run(raw)` that echoes the prompt line then dispatches. |
| Input | `complete()` for Tab, the `keydown` handler, the delegated click handler on `#term`, `typeAndRun(cmd)` that animates a command being typed. |
| Boot | `bootSeq()`, `introSeq()`, `landing(quickMode)`, `start()`. |

**Concurrency model.** Commands can be async (page rendering is slow on purpose), so user input goes through a promise chain: `enqueue(fn)` does `q = q.then(fn).catch(console.error)`. Pressing Enter while a page is still printing queues the next command instead of interleaving output. `typeAndRun` disables the input while it animates and re-enables it afterwards.

**Skipping.** A global `keydown` and `pointerdown` listener sets `skipped = true` while `phase === "boot"`. Because `sleep()` and `typeEl()` check that flag, every pending delay collapses and the sequence finishes at once. `start()` reads `skipped` to decide `quickMode`, then resets it to false before the live phase so page rendering keeps its normal pacing.

**Click handling.** Anything clickable in the output is a `<button class="lnk" data-cmd="...">`. One delegated listener on `#term` reads `data-cmd` and calls `typeAndRun`, so clicking behaves exactly like typing and pressing Enter. Clicking elsewhere focuses the input unless text is selected. On touch devices (`pointer: coarse`) it never auto-focuses, to avoid the on-screen keyboard popping up uninvited.

## Virtual filesystem and content

The site's pages live in a JavaScript object, not on disk. A directory is `{ t: "d", c: { name: node, ... } }` and a file is `{ t: "f", s: "markdown string" }`. Adding a page means adding one entry; nothing else needs registering because `ls`, `tree`, `cat` and Tab completion all read from this object.

**Current tree:**

```
~
├── readme.md          landing page, auto-printed after login
├── about.md
├── contact.md
├── .backdoor.txt      hidden; visible with ls -a
├── projects/
│   ├── chrome-heart.md
│   ├── ghost-protocol.md
│   └── neon-rain.md
└── blog/
    ├── 2077-01-14-lorem.md
    ├── 2077-02-02-sit-amet.md
    └── 2077-03-21-tempor.md
```

**Path resolution.** `resolve(arg)` starts from `cwd`, or from the root when the argument is `~`, begins with `~/`, or begins with `/`. It then walks segments, treating `.` as a no-op and `..` as pop. `lookup(arg)` wraps it and, if the exact path is missing, retries with `.md` appended, so `cat about` and `cat projects/neon-rain` work. Note that `/` is treated as the site root, not a real filesystem root.

**Markdown subset** (rendered by `mdLines()`, one block per source line):

| Syntax | Renders as |
| --- | --- |
| `# Title` | `.h1`: VT323, 34px, accent colour with glow |
| `## Heading` | `.h2`: 13px uppercase magenta, letter-spaced |
| `- item` | `.li`: hanging indent with a cyan `>` marker |
| blank line | `.sp`: 8px spacer |
| anything else | `.pg`: paragraph, max 80ch wide |
| `**bold**` | `<b>` |
| `[[command\|label]]` | Clickable button that runs `command` when clicked. Custom syntax, not standard markdown. |

Each file is one JS string with `\n` between lines, built from three shared lorem ipsum constants (`LOREM1`, `LOREM2`, `LOREM3`). Replacing placeholder copy means editing those strings or swapping them for real text. If the real content grows, move each page into its own `.md` file and `fetch()` it on `cat`; that requires serving over HTTP rather than `file://`.

**Security note for real content.** `inl()` HTML-escapes text before substituting links and bold, so page text cannot inject markup. Keep that order if you change it. The command argument inside `[[cmd|label]]` is placed into a `data-cmd` attribute unescaped beyond the earlier `esc()` pass; only author-controlled content should ever go through it.

## Commands, completion and history

Commands are entries on the `CMDS` object. Each receives the argument array (everything after the command, split on whitespace) and either prints with `print()` or changes `cwd`. Unknown commands print `bash: <cmd>: command not found` with a clickable `help`. Input is split naively on whitespace, so quoted arguments and pipes are not supported.

| Command | Behaviour |
| --- | --- |
| `help` | Clickable table of all commands |
| `ls [-l] [-a] [dir]` | Lists a directory. Flags can be combined (`-la`). Hidden files (leading dot) show only with `-a`. `-l` gives a long format with fake permissions, owner `guest guest` and a size. Names are clickable buttons: directories run `cd`, files run `cat`. |
| `cd [dir]` | Changes `cwd`. No argument goes home. Errors for missing paths and for files. |
| `cat <file>` | Renders a page line by line. Accepts a name without `.md`. Errors for directories, with a clickable `cd` suggestion. |
| `tree` | Draws the site map with box-drawing characters. Hidden files are omitted. File names are clickable. |
| `pwd` | Prints `/home/guest/...` |
| `neofetch` (alias `neo`) | ASCII mask beside a key/value block: OS Arch Linux x86\_64, kernel 6.17.2-arch1-1, live uptime, shell, a terminal size estimate, page count |
| `theme [name]` | No argument lists themes. `cyan`, `magenta`, `amber`, `green` set `--accent` on `<html>` at runtime. |
| `history` | Numbered list of commands entered this session |
| `clear` (alias `cls`) or Ctrl+L | Empties the output |
| `reboot` or `exit` | Replays the whole boot and login sequence |
| `whoami`, `hostname`, `uname [-a]`, `date`, `echo` | Small realism commands |
| `sudo`, `pacman`, `rm` | Joke responses: not in sudoers, must be root, permission denied |
| `open`, `dir` | Aliases for `cat` and `ls` |

**Keyboard:**

- Enter runs the line (queued if something is still printing).
- Tab completes. First word completes against command names. Later words complete against files and directories at the typed path. One match fills it (with a trailing space for files, nothing extra for directories). Several matches fill the longest common prefix and print the candidates in dim text.
- Up and Down walk `history`; Down past the end clears the line.
- Ctrl+L clears the screen.

**Prompt.** Rendered by `promptHtml()` as `[guest@neon-grid <dir>]$` in the Arch default format. The directory part shows only the last path segment, or `~` at home. Before running a command the prompt line is echoed into the log with the command text, so the transcript reads like a real terminal.

**Adding a command:** write `CMDS.name = function (args) { print("..."); };` (use `async` if it needs to wait), then add a row to the `HELP` array so it appears in `help`. Tab completion picks it up automatically from the `CMDS` keys.

## Boot, intro and landing sequence

`start()` runs three stages in order. The whole thing takes roughly 12 to 14 seconds uninterrupted. Any key press or tap while `phase` is `"boot"` collapses all remaining delays.

1. **`bootSeq()`**: clears the log and hides the prompt row. Prints `Arch Linux 6.17.2-arch1-1 (neon-grid) booting...`, five early-boot lines (udev, uevents, a filesystem check on `/dev/nvme0n1p2`), then a memory counter that ticks from 0 to 65536K in 8192K steps ending in `[  OK  ]`. Eight systemd-style service lines follow, each with a green `[  OK  ]` tag, except one amber `[ WARN ]` line for a joke `corp-surveillance.service`. It ends with a 30-step `decrypting grid [####----]` progress bar that redraws one line in place.
2. **`introSeq()`**: clears the log, then reveals the first logo half line by line (110ms per line), then the second half. Types the tagline `// N E O N . G R I D   v7.7   [ lorem ipsum edition ]` at 24ms per character with a blinking cursor. Prints `Arch Linux 6.17.2-arch1-1 (tty1)`, types `neon-grid login: guest` character by character, shows `Password:` with a pause and no echo, and prints a fake `Last login:` line dated yesterday.
3. **`landing(quickMode)`**: sets the prompt, shows the prompt row, and (unless skipped) types `cat readme.md` into the input at 70ms per character before running it. That prints the readme page, which contains the clickable navigation links. The input is then enabled and focused.

**Skip behaviour.** If the visitor skipped, `quickMode` is true and the typed `cat readme.md` animation is omitted; the readme prints directly. The `#skip` hint ("press any key to skip boot") is visible only during the boot phase and is hidden when it ends.

**Reboot.** The `reboot` and `exit` commands call `start()` again. `bootSeq()` clears the log, and `phase` is reset to `"boot"`, so skipping works again. The prompt row is hidden again and `skipHint` is shown again.

**Tuning.** Every timing is a literal number passed to `sleep()` or `typeEl()`. To make the boot shorter, reduce the step counts (`k += 8192`, the `p <= 30` loop) or the per-line `sleep` values in `bootSeq()`. To change the boot copy, edit the `early` and `svc` arrays.

## Known limitations and decisions

**Not verified.** The script passes a Node syntax check (`node --check`) and the page published without errors, but I have not watched it run in a browser, so none of the timings, wrapping, or mobile behaviour has been looked at by eye. The first thing to do in VS Code is load it and click through every command. Likely places for visual bugs: the ASCII logo's font size on narrow screens (`clamp(15px, 4.6vw, 30px)` is a guess), `neofetch` wrapping on phones, and long `ls -l` lines.

**Known gaps:**

- Command parsing splits on whitespace only: no quotes, pipes, redirects, globs or `&&`.
- `ls` and Tab completion sort with plain `sort()`, so ordering is ASCII, not locale aware.
- The `theme` command does not persist; a refresh returns to cyan. No `localStorage` is used anywhere. In the Artifact sandbox storage can be unavailable, so any addition should be wrapped in try/catch.
- `neofetch` reports a terminal size estimated from window dimensions (about 9px by 21px per cell), not measured.
- The CRT overlay and scanlines are a fixed full-screen layer. On low-power devices the `glitch` animation and large `text-shadow` on `.h1` may cost frames.
- There is no deep-linking: the URL never changes, so a visitor cannot link to `about.md`. See next steps.
- There is no `man`, `grep`, `find`, `less` or `vim`.
- Accessibility: the log has `role="log"` and `aria-live="polite"`, and the logo has an `aria-label`, but page rendering one line at a time may be noisy for screen readers. A `prefers-reduced-motion` visitor gets near-instant output, which also helps.

**Decisions made, and why:**

| Decision | Reason |
| --- | --- |
| Single file, no framework | The brief asked for a simple snippet; it keeps the project trivially portable |
| Dark-only, no light theme | A light CRT terminal reads as a contradiction; the look is the point |
| Pages as files in a JS object | Lets `ls`, `cat`, `cd`, `tree` and Tab share one source of truth |
| Click-to-run links that type the command | Touch visitors cannot type easily, and it teaches the commands |
| Page text prints line by line at 26ms | Feels like output streaming; `skipped` does not apply here, only during boot |
| Prompt styled like Arch's default bash prompt | The user wanted an Arch Linux terminal look; the user's second message replaced the window chrome |
| Original ASCII mask for `neofetch` | Avoids reproducing any distro or brand logo |
| Lorem ipsum everywhere | Explicitly requested placeholder text |

## Suggested next steps

Ordered by what to do first.

1. **Wrap, run and eyeball it.** Apply the wrapper from the porting section, serve the folder, and test at desktop width and at about 400px. Click every link in `help`, `tree` and `ls`. Check that Enter during a slow page print queues correctly.
2. **Split into files.** A sensible layout: `index.html` (markup only), `style.css` (the `<style>` contents), and `js/` with `site.js` (the `ROOT` tree and lorem constants), `commands.js`, `boot.js`, `terminal.js` (print, prompt, input) and `main.js`. Switch the script to `type="module"` and replace the IIFE with imports. The shared state (`cwd`, `history`, `phase`, `skipped`) would move into one exported `state` object.
3. **Move content to real files.** Put each page in `content/*.md` and build `ROOT` from a manifest (or a small build script that generates `site.json`). `cat` then `fetch()`es the file. This needs HTTP serving, not `file://`.
4. **Deep links.** Update `location.hash` on `cd` and `cat` (for example `#projects/neon-rain`) and run the matching commands silently on load, after the boot. This also makes the site shareable and indexable-ish.
5. **Self-host the fonts.** Download VT323 and Share Tech Mono, add `@font-face` rules, and drop the Google link.
6. **Persist the theme.** Save the accent in `localStorage` inside try/catch and restore it on load.
7. **Real content and an SEO fallback.** Because everything renders from JavaScript, add a `<noscript>` block with plain HTML links to the same pages, plus a proper `<title>` and meta description.
8. **More commands**, in rough order of value: `grep`, `man <cmd>`, `less`-style paging for long pages, `view`/`open <url>` for external links, `ping`, `curl` for a fake contact form, a `matrix` or `cmatrix` easter egg, command history persisted across visits.
9. **Tests.** The logic that is easy to unit test in isolation once split out: `resolve()`, `lookup()`, `complete()`, and the markdown renderer.

**Prompt you can paste into Claude Code in VS Code:**

```text
This repo contains index.html, a single-file cyberpunk website styled as a full-screen
Arch Linux TTY. Read the development brief in BRIEF.md first. Then: (1) wrap the file
as a standalone HTML5 document, (2) split it into style.css and ES modules as described
in "Suggested next steps" item 2 without changing behaviour, (3) add hash-based deep
linking, (4) self-host the two fonts. Keep the page dark-only, keep the command set,
and do not add dependencies or a build step.
```

Save this brief as `BRIEF.md` next to the code (the doc can be exported to Markdown) so the prompt above has something to read.
