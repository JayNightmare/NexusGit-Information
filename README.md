# NexusGit Terminal (React)

This project now renders NexusGit as a full-screen cyber terminal experience (Arch-style TTY) instead of a card-based link tree. The title and ASCII logo retain NexusGit branding while the boot, login, typing, glitch, cursor, and CRT scanline effects follow the supplied original HTML reference.

## What changed

- Original-style Arch boot log, memory counter, service status lines, decrypting progress bar, NexusGit ASCII logo, typed login, and skippable intro.
- Session-aware startup:
  - First visit in a tab: full boot flow.
  - Later reloads in the same tab: jumps straight to live prompt and runs `ls projects`.
- Virtual filesystem + shell commands (`ls`, `cd`, `cat`, `open`, `get`, `links`, `tree`, `neofetch`, etc.).
- Project pages are generated from `src/links.json` at startup.
- GitHub organization repositories are fetched live from the public GitHub API.
- Offline projects (`Enabled: false`) are marked in `ls` and blocked by `open`.
- Downloads path support (`downloads/hoodieweather/0.5/HoodieWeather.exe`) and `get` command.
- Optional rain effect via terminal command (`rain on` / `rain off`).

## Data source (`src/links.json`)

`src/links.json` is still the single source of truth for project links:

```json
[
  {
    "Link": "https://example.com",
    "DisplayName": "Example Project",
    "Info": "Short project summary",
    "Image": "https://example.com/icon.png",
    "Enabled": true
  }
]
```

`Image` remains optional in the data model but is not currently used by the terminal renderer.

## Command quick reference

- `help` — command overview
- `ls [-a] [-l] [path]` — list directory
- `cd [path]` — change directory
- `cat <file|path>` — print page content
- `open <file|path>` — open external URL in a new tab
- `get <file|path>` — print download anchor for downloadable files
- `links` — flat list of all external links (accessibility + speed)
- `orgs` — list the GitHub organizations
- `repos <organization>` — fetch and list an organization's public repositories
- `ls orgs/<organization>` — browse an organization's repository directory
- `cat orgs/<organization>/<repository>` — show repository description and language
- `open orgs/<organization>/<repository>` — open the repository on GitHub
- `tree` — display tree view
- `theme <cyan|magenta|amber|green>` — accent color switch
- `rain [on|off]` — toggle rain overlay
- `whoami`, `hostname`, `uname [-a]`, `date`, `echo` — terminal information and output
- `sudo`, `pacman`, `rm` — simulated system responses
- `neofetch` / `neo` — NexusGit system info snapshot
- `clear` / `cls` — clear output
- `reboot` / `exit` — replay startup

The configured organizations are `KERI-Research`, `KURE-x-Tech`, and `Mars-Command`.
Repository results are fetched on first access and cached for the current page session.
The GitHub API is unauthenticated, so public API rate limits apply; errors are reported
in the terminal rather than silently falling back to incomplete data.

## Local development

```bash
npm install
npm start
```

Runs at <http://localhost:3000>.

## Build

```bash
npm run build
```

## Deploy

```bash
npm run deploy
```

Build output is published from `build/` to GitHub Pages via `gh-pages`.
