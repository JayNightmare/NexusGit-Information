import React, { useEffect, useMemo, useRef, useState } from "react";
import links from "./links.json";

const HOST = "nexusgit";
const ORGANIZATIONS = ["KERI-Research", "KURE-x-Tech", "Mars-Command"];

const LOGO_A = String.raw`█  █  ████  █  █  █  █   ███  ███  ███  ███`;
const LOGO_B = String.raw`██ █  █     █  █  █  █  █     █     █ █  █`;
const LOGO_C = String.raw`█ ██  ███   ████  █  █   ██   █ ██  █ █  █`;
const LOGO_D = String.raw`█  █  █     █  █  █  █     █  █  █  █ █  █`;
const LOGO_E = String.raw`█  █  ████  █  █   ██   ███   ███  ███  █`;
const MASK = String.raw`
   _.-""""-._
 .'  _    _  '.
/   (o)  (o)   \
|      __      |
 \   \____/   /
  '._      _.'
     '-..-'`
	.split("\n")
	.slice(1);

const esc = (value) =>
	String(value ?? "")
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");

const slugify = (text) =>
	String(text || "project")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "") || "project";

const htmlLine = (html, cls = "") => ({ html, cls });

const F = (node) => ({ t: "f", ...node });
const D = (children, metadata = {}) => ({ t: "d", c: children, ...metadata });

const parseHost = (url) => {
	try {
		return new URL(url).hostname.replace(/^www\./, "");
	} catch {
		return "unknown-host";
	}
};

const markdownInline = (text) => {
	const escaped = esc(text);
	const withLinks = escaped.replace(
		/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
		(_, label, url) =>
			`<a href="${esc(
				url,
			)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`,
	);
	const withCmd = withLinks.replace(
		/\[\[([^|\]]+)\|([^\]]+)\]\]/g,
		(_, cmd, label) =>
			`<button class="lnk" data-cmd="${esc(cmd)}">${esc(label)}</button>`,
	);
	return withCmd.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
};

const markdownLines = (source) => {
	return String(source || "")
		.split("\n")
		.map((raw) => {
			if (!raw.trim()) return htmlLine("", "sp");
			if (raw.startsWith("# ")) {
				return htmlLine(
					markdownInline(raw.slice(2).trim()),
					"h1",
				);
			}
			if (raw.startsWith("## ")) {
				return htmlLine(
					markdownInline(raw.slice(3).trim()),
					"h2",
				);
			}
			if (raw.startsWith("- ")) {
				return htmlLine(
					markdownInline(raw.slice(2).trim()),
					"li",
				);
			}
			return htmlLine(markdownInline(raw), "pg");
		});
};

function App() {
	const termRef = useRef(null);
	const inputRef = useRef(null);
	const queueRef = useRef(Promise.resolve());
	const sleepSkipRef = useRef(false);
	const historyRef = useRef([]);
	const historyIndexRef = useRef(0);
	const organizationReposRef = useRef(new Map());

	const [cwd, setCwd] = useState([]);
	const [phase, setPhase] = useState("boot");
	const [skipVisible, setSkipVisible] = useState(false);
	const [input, setInput] = useState("");
	const [logs, setLogs] = useState([]);
	const [rainOn, setRainOn] = useState(false);
	const [rainDrops, setRainDrops] = useState([]);

	const reducedMotion = useMemo(
		() =>
			typeof window !== "undefined" &&
			window.matchMedia &&
			window.matchMedia("(prefers-reduced-motion: reduce)")
				.matches,
		[],
	);

	const rootNode = useMemo(() => {
		const projectFiles = {};
		const organizationDirectories = {};
		ORGANIZATIONS.forEach((organization) => {
			organizationDirectories[organization] = D(
				{},
				{
					kind: "organization",
					name: organization,
				},
			);
		});
		const linkList = [];
		let enabledCount = 0;

		links.forEach((item) => {
			const name = item.DisplayName || "Untitled Project";
			const slug = `${slugify(name)}.md`;
			const href = item.Link || "#";
			const info =
				item.Info ||
				"No description has been published for this project.";
			const enabled = item.Enabled !== false;
			const hostname = parseHost(href);
			if (enabled) enabledCount += 1;
			linkList.push({
				name,
				href,
				enabled,
				slug,
				hostname,
				info:
					item.Info ||
					"No description has been published for this project.",
			});

			projectFiles[slug] = F({
				kind: "page",
				title: name,
				href,
				enabled,
				hostname,
				md: [
					`# ${name}`,
					"",
					item.Info ||
						"No description has been published for this project.",
					"",
					`## project details`,
					`- website: ${hostname}`,
					`- listing: ${enabled ? "enabled" : "disabled"}`,
					"",
					`Use [[open projects/${slugify(name)}.md|open in new tab]] or [direct link](${href}).`,
				].join("\n"),
			});
		});

		const readme = [
			"# NexusGit",
			"",
			"NexusGit is Jay Bell's project hub, bringing together software projects, web apps, research work, and community initiatives.",
			"The portfolio highlights full-stack work with React, TypeScript, and Node.js; project and organization pages link to their live sites and public repositories.",
			"",
			"## start here",
			"[[ls projects|browse the projects]]",
			"[[orgs|browse GitHub organizations and repositories]]",
			"[[cat about|read about NexusGit]]",
			"[[links|open the project directory]]",
			"[[help|see terminal commands]]",
			"",
			"## useful links",
			"- [Jays portfolio](https://portfolio.nexusgit.info)",
			"- [GitHub profile](https://github.com/JayNightmare)",
		].join("\n");

		return {
			root: D({
				"readme.md": F({
					kind: "page",
					title: "Readme",
					md: readme,
				}),
				"about.md": F({
					kind: "page",
					title: "About",
					md: [
						"# About NexusGit",
						"",
						"NexusGit is Jay Bell's online project hub. It connects a full-stack developer portfolio with live applications, research projects, community work, and public GitHub organizations.",
						"",
						"The portfolio describes Jay's work with React, TypeScript, and Node.js and includes projects, technical skills, open-source contributions, and software engineering blog updates.",
						"",
						"## explore",
						"- [[ls projects|projects and applications]]",
						"- [[orgs|GitHub organizations and repositories]]",
						"- [Jay Bell's portfolio](https://portfolio.nexusgit.info)",
						"- [JayNightmare on GitHub](https://github.com/JayNightmare)",
					].join("\n"),
				}),
				"contact.md": F({
					kind: "page",
					title: "Contact",
					md: "# Contact\n\nFor project information and public code, visit [Jay Bell's portfolio](https://portfolio.nexusgit.info) or [JayNightmare on GitHub](https://github.com/JayNightmare).",
				}),
				legal: D({
					"terms-and-privacy.md": F({
						kind: "page",
						title: "Terms and Privacy",
						md: "# Terms and Privacy\n\nNexusGit's terms of service and privacy documents are maintained on the [Terms and Privacy site](https://terms-and-privacy.nexusgit.info/). Open that site for the current legal documents.",
					}),
				}),
				projects: D(projectFiles),
				orgs: D(organizationDirectories),
				downloads: D({
					hoodieweather: D({
						0.5: D({
							"HoodieWeather.exe": F({
								kind: "download",
								title: "HoodieWeather.exe",
								href: "/application/downloads/HoodieWeather/0.5/HoodieWeather.exe",
								md: "# HoodieWeather 0.5\n\nThe Windows executable for HoodieWeather version 0.5 is hosted in the NexusGit downloads directory. Use the link below to download the published file.",
							}),
						}),
					}),
				}),
			}),
			linkList,
			organizations: ORGANIZATIONS,
			stats: {
				total: links.length,
				enabled: enabledCount,
				domain: "nexusgit.info",
			},
		};
	}, []);

	const appendLine = (line) => {
		setLogs((prev) => [...prev, line]);
	};

	const appendLines = (linesToAdd) => {
		setLogs((prev) => [...prev, ...linesToAdd]);
	};

	const clearLogs = () => setLogs([]);

	const sleep = (ms) =>
		new Promise((resolve) => {
			if (sleepSkipRef.current) {
				resolve();
				return;
			}
			const time = reducedMotion ? Math.min(ms, 8) : ms;
			window.setTimeout(resolve, time);
		});

	const nodeAt = (parts) => {
		let cur = rootNode.root;
		for (const part of parts) {
			if (!cur || cur.t !== "d" || !cur.c[part]) return null;
			cur = cur.c[part];
		}
		return cur;
	};

	const resolvePath = (inputPath) => {
		if (!inputPath) return [...cwd];
		const raw = String(inputPath).trim();
		if (!raw || raw === "~") return [];
		const base =
			raw.startsWith("/") || raw.startsWith("~/")
				? []
				: [...cwd];
		const normal = raw.replace(/^~\//, "").replace(/^\//, "");
		const segments = normal.split("/").filter(Boolean);
		for (const segment of segments) {
			if (segment === ".") continue;
			if (segment === "..") {
				base.pop();
				continue;
			}
			base.push(segment);
		}
		return base;
	};

	const lookup = (inputPath) => {
		const directParts = resolvePath(inputPath);
		const direct = nodeAt(directParts);
		if (direct) return { parts: directParts, node: direct };
		const lastPart = directParts[directParts.length - 1];
		const withMd = nodeAt([
			...directParts.slice(0, -1),
			`${lastPart}.md`,
		]);
		if (withMd) {
			return {
				parts: [
					...directParts.slice(0, -1),
					`${lastPart}.md`,
				],
				node: withMd,
			};
		}
		return null;
	};

	const promptPath = cwd.length ? cwd[cwd.length - 1] : "~";
	const prompt = `[guest@${HOST} ${promptPath}]$`;

	const enqueue = (fn) => {
		queueRef.current = queueRef.current.then(fn).catch((error) => {
			appendLine(
				htmlLine(
					`error: ${esc(error?.message || "unknown")}`,
					"err",
				),
			);
		});
	};

	const printMd = async (source) => {
		const linesOut = markdownLines(source);
		for (const ln of linesOut) {
			appendLine(ln);
			await sleep(26);
		}
	};

	const cmdHelp = () => {
		const commands = [
			["help", "list available commands"],
			["ls [-la] [dir]", "list directory contents"],
			["cd <dir>", "change directory"],
			["cat <file>", "read a page"],
			["open <project>", "open an external project"],
			["get <file>", "download a file"],
			["tree", "show the site map"],
			["links", "list every project URL"],
			[
				"orgs / repos <org>",
				"browse organizations and repositories",
			],
			["pwd", "print working directory"],
			["neofetch", "show NexusGit system info"],
			["theme [name]", "switch accent color"],
			["rain [on|off]", "toggle the rain effect"],
			["history", "show command history"],
			["clear", "clear the screen (Ctrl+L)"],
			["whoami / hostname / uname", "system identity"],
			["date / echo", "print date or text"],
			["sudo / pacman / rm", "simulated system responses"],
			["reboot / exit", "restart the boot sequence"],
		];
		const table = commands
			.map(
				([name, description]) =>
					`<span><button class="lnk" data-cmd="${esc(name.split(" ")[0])}">${esc(name)}</button></span><span class="dim">${esc(description)}</span>`,
			)
			.join("");
		appendLine(htmlLine(`<div class="tbl">${table}</div>`, "pg"));
		appendLine(
			htmlLine(
				"Tab completes names, Up/Down walks history. Click a highlighted command or link to run it.",
				"dim",
			),
		);
	};

	const loadOrganizationRepos = async (organization) => {
		const orgNode = rootNode.root.c.orgs.c[organization];
		if (!orgNode) {
			throw new Error(
				`Unknown organization: ${organization}`,
			);
		}

		const cachedRepos =
			organizationReposRef.current.get(organization);
		if (cachedRepos) return cachedRepos;

		let nextUrl = `https://api.github.com/orgs/${encodeURIComponent(
			organization,
		)}/repos?type=public&sort=updated&per_page=100`;
		const repositories = [];

		while (nextUrl) {
			const response = await fetch(nextUrl, {
				headers: {
					Accept: "application/vnd.github+json",
					"X-GitHub-Api-Version": "2022-11-28",
				},
			});

			if (!response.ok) {
				throw new Error(
					`GitHub API request for ${organization} failed (${response.status}${response.status === 403 ? ", possibly rate-limited" : ""})`,
				);
			}

			const page = await response.json();
			if (!Array.isArray(page)) {
				throw new Error(
					`GitHub returned an invalid repository list for ${organization}`,
				);
			}

			page.forEach((repo) => {
				if (
					!repo ||
					typeof repo.name !== "string" ||
					typeof repo.html_url !== "string"
				) {
					throw new Error(
						`GitHub returned an invalid repository entry for ${organization}`,
					);
				}

				const repoUrl = new URL(repo.html_url);
				if (
					repoUrl.protocol !== "https:" ||
					repoUrl.hostname !== "github.com"
				) {
					throw new Error(
						`GitHub returned an unsafe repository URL for ${organization}`,
					);
				}

				const description = (
					repo.description ||
					"No description has been published by this repository."
				)
					.replace(/\s+/g, " ")
					.trim();
				const language =
					repo.language || "Not specified";
				const fileName = `${repo.name}.md`;
				orgNode.c[fileName] = F({
					kind: "repository",
					title: repo.name,
					href: repoUrl.href,
					description,
					language,
					md: [
						`# ${repo.name}`,
						"",
						description,
						"",
						`## repository`,
						`- organization: ${organization}`,
						`- language: ${language}`,
						"",
						`[View ${repo.name} on GitHub](${repoUrl.href})`,
					].join("\n"),
				});
				repositories.push(orgNode.c[fileName]);
			});

			const linkHeader = response.headers.get("Link") || "";
			const nextLink = linkHeader.match(
				/<([^>]+)>;\s*rel="next"/,
			);
			nextUrl = nextLink ? nextLink[1] : "";
			if (nextUrl) {
				const parsedNextUrl = new URL(nextUrl);
				if (
					parsedNextUrl.protocol !== "https:" ||
					parsedNextUrl.hostname !==
						"api.github.com"
				) {
					throw new Error(
						"GitHub returned an unsafe pagination URL",
					);
				}
			}
		}

		organizationReposRef.current.set(organization, repositories);
		return repositories;
	};

	const findOrganization = (name) =>
		ORGANIZATIONS.find(
			(organization) =>
				organization.toLowerCase() ===
				String(name || "").toLowerCase(),
		);

	const listDir = async (
		targetPath,
		flags = { all: false, long: false },
	) => {
		const resolved = lookup(targetPath || ".");
		if (!resolved) {
			appendLine(
				htmlLine(
					`ls: cannot access '${esc(targetPath)}': No such file or directory`,
					"err",
				),
			);
			return;
		}
		if (resolved.node.t !== "d") {
			appendLine(
				htmlLine(
					esc(
						resolved.parts[
							resolved.parts.length -
								1
						],
					),
					"pg",
				),
			);
			return;
		}

		if (resolved.node.kind === "organization") {
			appendLine(
				htmlLine(
					`Fetching public repositories for ${esc(resolved.node.name)}...`,
					"dim",
				),
			);
			await loadOrganizationRepos(resolved.node.name);
		}

		const names = Object.keys(resolved.node.c).sort();
		names.forEach((name) => {
			if (!flags.all && name.startsWith(".")) return;
			const child = resolved.node.c[name];
			const isOffline =
				child?.t === "f" && child?.enabled === false;
			const clickable =
				child.t === "d"
					? `cd ${resolved.parts.concat(name).join("/")}`
					: `cat ${resolved.parts.concat(name).join("/")}`;
			const tag = child.t === "d" ? "/" : "";
			const offlineTag = isOffline
				? ' <span class="offline">[offline]</span>'
				: "";
			if (child.kind === "repository") {
				const repoPath = resolved.parts
					.concat(name)
					.join("/");
				appendLine(
					htmlLine(
						`<a href="${esc(child.href)}" target="_blank" rel="noopener noreferrer">${esc(child.title)}</a> — ${esc(child.description)} <span class="repo-language">[${esc(child.language)}]</span> <button class="lnk" data-cmd="cat ${esc(repoPath)}">details</button>`,
						"pg",
					),
				);
				return;
			}
			if (flags.long) {
				const type = child.t === "d" ? "d" : "-";
				appendLine(
					htmlLine(
						`${type}rw-r--r-- guest guest 4096 <button class="lnk" data-cmd="${esc(clickable)}">${esc(name + tag)}</button>${offlineTag}`,
						"pg",
					),
				);
				return;
			}
			appendLine(
				htmlLine(
					`<button class="lnk" data-cmd="${esc(clickable)}">${esc(name + tag)}</button>${offlineTag}`,
					"pg",
				),
			);
		});
	};

	const cmdCat = async (targetPath) => {
		if (!targetPath) {
			appendLine(
				htmlLine("cat: missing file operand", "err"),
			);
			return;
		}
		const resolved = lookup(targetPath);
		if (!resolved) {
			appendLine(
				htmlLine(
					`cat: ${esc(targetPath)}: No such file or directory`,
					"err",
				),
			);
			return;
		}
		if (resolved.node.t === "d") {
			appendLine(
				htmlLine(
					`cat: ${esc(targetPath)}: Is a directory`,
					"err",
				),
			);
			return;
		}
		if (resolved.node.kind === "download") {
			await printMd(resolved.node.md);
			appendLine(
				htmlLine(
					`<a href="${esc(
						resolved.node.href,
					)}" target="_blank" rel="noopener noreferrer">Download ${esc(
						resolved.node.title,
					)}</a>`,
					"pg",
				),
			);
			return;
		}
		await printMd(resolved.node.md || "");
	};

	const cmdOpen = (targetPath) => {
		if (!targetPath) {
			appendLine(htmlLine("open: missing target", "err"));
			return;
		}
		const resolved = lookup(targetPath);
		if (!resolved || resolved.node.t === "d") {
			appendLine(
				htmlLine(
					`open: ${esc(targetPath)}: not an openable item`,
					"err",
				),
			);
			return;
		}
		const href = resolved.node.href;
		if (!href) {
			appendLine(
				htmlLine(
					"open: target has no external URL",
					"err",
				),
			);
			return;
		}
		if (resolved.node.enabled === false) {
			appendLine(
				htmlLine(
					"open: project is offline right now",
					"err",
				),
			);
			return;
		}
		const popup = window.open(
			href,
			"_blank",
			"noopener,noreferrer",
		);
		const blocked = popup == null;
		appendLine(
			htmlLine(
				`Opening <a href="${esc(
					href,
				)}" target="_blank" rel="noopener noreferrer">${esc(href)}</a>${blocked ? " (popup blocked, use link)" : ""}`,
				"ok",
			),
		);
	};

	const cmdGet = (targetPath) => {
		if (!targetPath) {
			appendLine(
				htmlLine("get: missing file operand", "err"),
			);
			return;
		}
		const resolved = lookup(targetPath);
		if (
			!resolved ||
			resolved.node.t !== "f" ||
			resolved.node.kind !== "download"
		) {
			appendLine(
				htmlLine(
					`get: ${esc(targetPath)}: Not a downloadable file`,
					"err",
				),
			);
			return;
		}
		appendLine(
			htmlLine(
				`<a href="${esc(
					resolved.node.href,
				)}" target="_blank" rel="noopener noreferrer">Download ${esc(
					resolved.node.title,
				)}</a>`,
				"ok",
			),
		);
	};

	const runCommand = async (rawInput) => {
		const raw = String(rawInput || "").trim();
		appendLine(htmlLine(`${esc(prompt)} ${esc(raw)}`, "cmd"));
		if (!raw) return;

		historyRef.current.push(raw);
		historyIndexRef.current = historyRef.current.length;

		const parts = raw.split(/\s+/);
		const command = parts[0].toLowerCase();
		const args = parts.slice(1);

		if (command === "help") {
			cmdHelp();
			return;
		}

		if (command === "ls" || command === "dir") {
			const flagBlob = args
				.filter((arg) => arg.startsWith("-"))
				.join("");
			const targetArg = args.find(
				(arg) => !arg.startsWith("-"),
			);
			await listDir(targetArg, {
				all: flagBlob.includes("a"),
				long: flagBlob.includes("l"),
			});
			return;
		}

		if (command === "cd") {
			const target = args[0];
			const resolved = lookup(target || "~");
			if (!resolved) {
				appendLine(
					htmlLine(
						`cd: ${esc(target)}: No such file or directory`,
						"err",
					),
				);
				return;
			}
			if (resolved.node.t !== "d") {
				appendLine(
					htmlLine(
						`cd: ${esc(target)}: Not a directory`,
						"err",
					),
				);
				return;
			}
			setCwd(resolved.parts);
			return;
		}

		if (command === "cat") {
			await cmdCat(args[0]);
			return;
		}

		if (command === "open") {
			cmdOpen(args[0]);
			return;
		}

		if (command === "get") {
			cmdGet(args[0]);
			return;
		}

		if (command === "orgs") {
			appendLine(htmlLine("GitHub organizations:", "h2"));
			rootNode.organizations.forEach((organization) => {
				appendLine(
					htmlLine(
						`<a href="https://github.com/${esc(organization)}" target="_blank" rel="noopener noreferrer">${esc(organization)}</a> <button class="lnk" data-cmd="repos ${esc(organization)}">[show repositories]</button>`,
						"pg",
					),
				);
			});
			appendLine(
				htmlLine(
					"Use `ls orgs/<organization>` or `repos <organization>` to browse repositories.",
					"dim",
				),
			);
			return;
		}

		if (command === "repos") {
			if (!args[0]) {
				appendLine(
					htmlLine(
						"Usage: repos <organization>",
						"err",
					),
				);
				appendLine(
					htmlLine(
						`Available: ${rootNode.organizations.join(", ")}`,
						"dim",
					),
				);
				return;
			}
			const organization = findOrganization(args[0]);
			if (!organization) {
				appendLine(
					htmlLine(
						`repos: unknown organization '${esc(args[0])}'`,
						"err",
					),
				);
				appendLine(
					htmlLine(
						`Available: ${rootNode.organizations.join(", ")}`,
						"dim",
					),
				);
				return;
			}
			await listDir(`orgs/${organization}`);
			return;
		}

		if (command === "tree") {
			const walk = (node, prefix = "", parts = []) => {
				if (node.t !== "d") return;
				const names = Object.keys(node.c)
					.filter((name) => !name.startsWith("."))
					.sort();
				names.forEach((name, index) => {
					const child = node.c[name];
					const last = index === names.length - 1;
					const marker = last ? "└──" : "├──";
					const childParts = [...parts, name];
					const renderedName =
						child.t === "d"
							? `<button class="lnk" data-cmd="cd ${esc(childParts.join("/"))}">${esc(name)}/</button>`
							: `<button class="lnk f" data-cmd="cat ${esc(childParts.join("/"))}">${esc(name)}</button>`;
					appendLine(
						htmlLine(
							`${esc(prefix + marker)} ${renderedName}`,
							"pg",
						),
					);
					if (child.t === "d") {
						walk(
							child,
							`${prefix}${last ? "    " : "│   "}`,
							childParts,
						);
					}
				});
			};
			appendLine(htmlLine("~", "pg"));
			walk(rootNode.root);
			return;
		}

		if (command === "links") {
			rootNode.linkList.forEach((item) => {
				const offline = item.enabled
					? ""
					: " [offline]";
				appendLine(
					htmlLine(
						`<a href="${esc(item.href)}" target="_blank" rel="noopener noreferrer">${esc(item.name)}</a> — ${esc(item.href)}${esc(offline)}`,
						"pg",
					),
				);
			});
			return;
		}

		if (command === "pwd") {
			appendLine(
				htmlLine(`/home/guest/${cwd.join("/")}`, "pg"),
			);
			return;
		}

		if (command === "history") {
			historyRef.current.forEach((item, index) => {
				appendLine(
					htmlLine(
						`${index + 1}  ${esc(item)}`,
						"pg",
					),
				);
			});
			return;
		}

		if (command === "clear" || command === "cls") {
			clearLogs();
			return;
		}

		if (command === "theme") {
			const tone = (args[0] || "").toLowerCase();
			const palette = {
				cyan: "#19e3f0",
				magenta: "#ff2e7e",
				amber: "#ffc83d",
				green: "#3dffa0",
			};
			if (!tone) {
				appendLine(
					htmlLine(
						"themes: cyan, magenta, amber, green",
						"pg",
					),
				);
				return;
			}
			if (!palette[tone]) {
				appendLine(
					htmlLine(
						`theme: '${esc(tone)}' not found`,
						"err",
					),
				);
				return;
			}
			document.documentElement.style.setProperty(
				"--accent",
				palette[tone],
			);
			appendLine(
				htmlLine(
					`theme switched to ${esc(tone)}`,
					"ok",
				),
			);
			return;
		}

		if (command === "rain") {
			if (!args[0]) {
				appendLine(
					htmlLine(
						`rain is ${rainOn ? "on" : "off"}`,
						"pg",
					),
				);
				return;
			}
			const mode = args[0].toLowerCase();
			const on =
				mode === "on"
					? true
					: mode === "off"
						? false
						: !rainOn;
			setRainOn(on);
			appendLine(
				htmlLine(
					`rain ${on ? "enabled" : "disabled"}`,
					"ok",
				),
			);
			return;
		}

		if (command === "neofetch" || command === "neo") {
			const uptimeSeconds = Math.floor(
				(Date.now() - performance.timeOrigin) / 1000,
			);
			const info = [
				["OS", "Arch Linux x86_64"],
				["Kernel", "6.17.2-arch1-1"],
				["Uptime", `${uptimeSeconds}s`],
				["Shell", "bash 5.3"],
				[
					"Terminal",
					`tty1 ${Math.max(20, Math.floor(window.innerWidth / 9))}x${Math.max(10, Math.floor(window.innerHeight / 21))}`,
				],
				["Domain", rootNode.stats.domain],
				[
					"Projects",
					`${rootNode.stats.enabled}/${rootNode.stats.total} online`,
				],
				[
					"Organizations",
					String(rootNode.organizations.length),
				],
			];
			const rows = info
				.map(
					([label, value]) =>
						`<dt>${esc(label)}</dt><dd>${esc(value)}</dd>`,
				)
				.join("");
			appendLine(
				htmlLine(
					`<div class="fetch"><pre>${esc(MASK.join(String.fromCharCode(10)))}</pre><dl><dt style="grid-column:1/-1">guest<span class="dim">@${HOST}</span></dt>${rows}</dl></div>`,
					"pg",
				),
			);
			return;
		}

		if (command === "reboot" || command === "exit") {
			appendLine(
				htmlLine(
					command === "exit"
						? "logout"
						: "Rebooting...",
					"dim",
				),
			);
			await sleep(500);
			await startTerminal(true);
			return;
		}

		if (command === "hostname") {
			appendLine(htmlLine(HOST, "pg"));
			return;
		}

		if (command === "uname") {
			appendLine(
				htmlLine(
					args[0] === "-a"
						? `Linux ${HOST} 6.17.2-arch1-1 #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux`
						: "Linux",
					"pg",
				),
			);
			return;
		}

		if (command === "date") {
			appendLine(htmlLine(esc(new Date().toString()), "pg"));
			return;
		}

		if (command === "echo") {
			appendLine(htmlLine(esc(args.join(" ")), "pg"));
			return;
		}

		if (command === "sudo") {
			appendLine(
				htmlLine(
					"guest is not in the sudoers file. This incident will be reported.",
					"err",
				),
			);
			return;
		}

		if (command === "pacman") {
			appendLine(
				htmlLine(
					args.length
						? "error: you cannot perform this operation unless you are root."
						: "usage: pacman &lt;operation&gt; [...]",
					"err",
				),
			);
			return;
		}

		if (command === "rm") {
			appendLine(
				htmlLine(
					"rm: cannot remove: Permission denied. This filesystem is read-only.",
					"err",
				),
			);
			return;
		}

		if (command === "whoami") {
			appendLine(htmlLine("guest", "pg"));
			return;
		}

		appendLine(
			htmlLine(
				`<span class="err">bash: ${esc(command)}: command not found</span> (try <button class="lnk" data-cmd="help">help</button>)`,
			),
		);
	};

	const runQueued = (value) => {
		enqueue(async () => {
			await runCommand(value);
		});
	};

	const typeAndRun = (value) => {
		enqueue(async () => {
			setInput("");
			for (let index = 0; index < value.length; index += 1) {
				setInput(value.slice(0, index + 1));
				await sleep(32);
			}
			await sleep(160);
			setInput("");
			await runCommand(value);
			if (!window.matchMedia("(pointer: coarse)").matches) {
				inputRef.current?.focus({
					preventScroll: true,
				});
			}
		});
	};

	const completeToken = () => {
		const raw = input;
		if (!raw.trim()) return;
		const parts = raw.split(/\s+/);
		const isCommandToken = parts.length <= 1 && !raw.endsWith(" ");

		if (isCommandToken) {
			const commands = [
				"help",
				"ls",
				"dir",
				"cd",
				"cat",
				"open",
				"get",
				"links",
				"orgs",
				"repos",
				"tree",
				"pwd",
				"history",
				"clear",
				"cls",
				"neofetch",
				"neo",
				"theme",
				"rain",
				"whoami",
				"hostname",
				"uname",
				"date",
				"echo",
				"sudo",
				"pacman",
				"rm",
				"reboot",
				"exit",
			];
			const matches = commands.filter((cmd) =>
				cmd.startsWith(parts[0].toLowerCase()),
			);
			if (matches.length === 1) {
				setInput(`${matches[0]} `);
				return;
			}
			if (matches.length > 1)
				appendLine(htmlLine(matches.join("  "), "dim"));
			return;
		}

		const token = raw.endsWith(" ") ? "" : parts[parts.length - 1];
		const baseParts = resolvePath(token || ".");
		const parentParts =
			token && token.includes("/")
				? baseParts.slice(0, -1)
				: [...cwd];
		const prefix =
			token && token.includes("/")
				? token.split("/").slice(-1)[0]
				: token || "";
		const parentNode = nodeAt(parentParts);
		if (!parentNode || parentNode.t !== "d") return;

		const matches = Object.keys(parentNode.c).filter((name) =>
			name.startsWith(prefix),
		);
		if (!matches.length) return;
		if (matches.length === 1) {
			const match = matches[0];
			const isDir = parentNode.c[match].t === "d";
			const rebuilt = [
				...parts.slice(0, -1),
				(token || "").replace(/[^/]*$/, "") +
					match +
					(isDir ? "" : " "),
			].join(" ");
			setInput(rebuilt);
			return;
		}
		appendLine(htmlLine(matches.join("  "), "dim"));
	};

	const bootSeq = async () => {
		setPhase("boot");
		setSkipVisible(true);
		appendLine(
			htmlLine(
				"Arch Linux 6.17.2-arch1-1 (nexusgit) booting...",
				"dim",
			),
		);
		await sleep(300);

		const early = [
			":: running early hook [udev]",
			"Starting systemd-udevd version 257.9-1-arch",
			":: running hook [udev]",
			":: Triggering uevents...",
			"/dev/nvme0n1p2: clean, 128406/3276800 files, 2210344/13107200 blocks",
		];
		for (const line of early) {
			appendLine(htmlLine(esc(line), "pg"));
			await sleep(150);
		}

		appendLine(htmlLine("", "pg"));
		for (let memory = 0; memory <= 65536; memory += 8192) {
			setLogs((prev) => [
				...prev.slice(0, -1),
				htmlLine(
					`memtest: ${String(memory).padStart(5)}K / 65536K`,
					"pg",
				),
			]);
			await sleep(60);
		}
		setLogs((prev) => [
			...prev.slice(0, -1),
			htmlLine(
				'memtest: 65536K / 65536K <span class="ok">[  OK  ]</span>',
				"pg",
			),
		]);

		const services = [
			["ok", "Mounted /dev/neural0."],
			[
				"ok",
				"Started Load Kernel Modules (chrome.ko synapse.ko ice.ko).",
			],
			["ok", "Started ICE Breaker Daemon."],
			[
				"warn",
				"corp-surveillance.service detected, ignoring.",
			],
			[
				"ok",
				"Started MAC Address Spoofing (4C:6F:72:65:6D:00).",
			],
			["ok", "Reached target Network is Online."],
			["ok", "Started Uplink to nexusgit.info."],
			["ok", "Reached target Multi-User System."],
		];
		for (const [kind, message] of services) {
			const tag =
				kind === "ok"
					? '<span class="ok">[  OK  ]</span>'
					: '<span class="warn">[ WARN ]</span>';
			appendLine(htmlLine(`${tag} ${esc(message)}`, "pg"));
			await sleep(190);
		}

		appendLine(htmlLine("", "pg"));
		for (let step = 0; step <= 30; step += 1) {
			const bar = `${"#".repeat(step)}${"-".repeat(30 - step)}`;
			const percent = Math.round((step / 30) * 100);
			setLogs((prev) => [
				...prev.slice(0, -1),
				htmlLine(
					`decrypting grid <span class="bar">[${bar}]</span> ${percent}%`,
					"pg",
				),
			]);
			await sleep(50);
		}
		await sleep(350);
	};

	const introSeq = async () => {
		const logo = [LOGO_A, LOGO_B, LOGO_C, LOGO_D, LOGO_E];
		for (let index = 0; index < logo.length; index += 1) {
			const accessibleLogo =
				index === 0
					? `<span role="img" aria-label="NexusGit">${esc(logo[index])}</span>`
					: `<span aria-hidden="true">${esc(logo[index])}</span>`;
			appendLine(htmlLine(accessibleLogo, "logo"));
			await sleep(110);
		}

		const tagline = "// N E X U S G I T   [ project terminal ]";
		appendLine(htmlLine("", "sub cur"));
		for (let index = 0; index < tagline.length; index += 1) {
			setLogs((prev) => [
				...prev.slice(0, -1),
				htmlLine(
					esc(tagline.slice(0, index + 1)),
					"sub cur",
				),
			]);
			await sleep(24);
		}
		setLogs((prev) => [
			...prev.slice(0, -1),
			htmlLine(esc(tagline), "sub"),
		]);
		await sleep(500);
		appendLine(htmlLine("", "pg"));
		appendLine(htmlLine("Arch Linux 6.17.2-arch1-1 (tty1)", "dim"));
		appendLine(htmlLine("", "pg"));
		appendLine(htmlLine(`${HOST} login: `, "cur"));
		for (const char of "guest") {
			setLogs((prev) => {
				const last = prev[prev.length - 1];
				return [
					...prev.slice(0, -1),
					htmlLine(`${last.html}${char}`, "cur"),
				];
			});
			await sleep(120);
		}
		setLogs((prev) => [
			...prev.slice(0, -1),
			htmlLine(`${HOST} login: guest`, "pg"),
		]);
		await sleep(250);
		appendLine(htmlLine("Password:", "cur"));
		await sleep(700);
		setLogs((prev) => [
			...prev.slice(0, -1),
			htmlLine("Password:", "pg"),
		]);
		await sleep(200);
		appendLine(
			htmlLine(
				`Last login: ${esc(new Date(Date.now() - 86400000).toString().slice(0, 24))} on tty1`,
				"dim",
			),
		);
	};

	const landing = async (quickMode) => {
		setPhase("live");
		setSkipVisible(false);
		setCwd([]);
		setInput("");

		if (quickMode) {
			appendLine(
				htmlLine(
					"Session restored. Listing projects...",
					"dim",
				),
			);
			await runCommand("reboot");
			return;
		}

		await sleep(400);
		const command = "cat readme.md";
		for (let index = 0; index < command.length; index += 1) {
			setInput(command.slice(0, index + 1));
			await sleep(70);
		}
		await sleep(250);
		setInput("");
		await runCommand(command);
		if (!window.matchMedia("(pointer: coarse)").matches) {
			inputRef.current?.focus({ preventScroll: true });
		}
	};

	const startTerminal = async (forceFull = false) => {
		sleepSkipRef.current = false;
		let bootSeen = false;
		if (!forceFull) {
			try {
				bootSeen =
					window.sessionStorage.getItem(
						"ng_boot_seen",
					) === "1";
			} catch {
				bootSeen = false;
			}
		}

		if (bootSeen && !forceFull) {
			await landing(true);
			return;
		}

		await bootSeq();
		await introSeq();
		const quickMode = sleepSkipRef.current;
		sleepSkipRef.current = false;

		try {
			window.sessionStorage.setItem("ng_boot_seen", "1");
		} catch {
			// Storage may be unavailable in private or embedded browsing contexts.
		}

		await landing(quickMode);
	};

	useEffect(() => {
		const rain = Array.from({ length: 64 }, (_, idx) => ({
			id: idx,
			left: Math.random() * 100,
			delay: Math.random() * 2,
			duration: 0.45 + Math.random() * 0.55,
		}));
		setRainDrops(rain);
	}, []);

	useEffect(() => {
		startTerminal(false);
	}, []);

	useEffect(() => {
		if (!termRef.current) return;
		termRef.current.scrollTop = termRef.current.scrollHeight;
	}, [logs]);

	useEffect(() => {
		const onSkip = () => {
			if (phase !== "boot") return;
			sleepSkipRef.current = true;
		};
		window.addEventListener("keydown", onSkip);
		window.addEventListener("pointerdown", onSkip);
		return () => {
			window.removeEventListener("keydown", onSkip);
			window.removeEventListener("pointerdown", onSkip);
		};
	}, [phase]);

	return (
		<div className="terminal-shell">
			{rainOn && (
				<div className="rain" aria-hidden="true">
					{rainDrops.map((drop) => (
						<span
							key={drop.id}
							className="drop"
							style={{
								left: `${drop.left}%`,
								animationDelay: `${drop.delay}s`,
								animationDuration: `${drop.duration}s`,
							}}
						/>
					))}
				</div>
			)}

			<main
				id="term"
				className="term"
				ref={termRef}
				role="log"
				aria-live="polite"
				onClick={(event) => {
					const button =
						event.target.closest(
							"button[data-cmd]",
						);
					if (button) {
						const command =
							button.getAttribute(
								"data-cmd",
							);
						if (command)
							typeAndRun(command);
						return;
					}
					inputRef.current?.focus();
				}}
			>
				<div className="crt" aria-hidden="true" />
				<div id="out" className="out">
					{logs.map((line, index) => (
						<div
							key={`${index}-${line.cls}`}
							className={`ln ${line.cls}`.trim()}
							dangerouslySetInnerHTML={{
								__html: line.html,
							}}
						/>
					))}
				</div>
				<div className="row" hidden={phase !== "live"}>
					<span className="ps1">
						<span className="br">[</span>
						<span className="u">
							guest@{HOST}
						</span>{" "}
						<span className="p">
							{promptPath}
						</span>
						<span className="br">]</span>
						<span className="d">$</span>
					</span>
					<input
						ref={inputRef}
						value={input}
						onChange={(event) =>
							setInput(
								event.target
									.value,
							)
						}
						onKeyDown={(event) => {
							if (
								event.key ===
								"Enter"
							) {
								event.preventDefault();
								const value =
									input;
								setInput("");
								runQueued(
									value,
								);
							} else if (
								event.key ===
								"Tab"
							) {
								event.preventDefault();
								completeToken();
							} else if (
								event.key ===
								"ArrowUp"
							) {
								event.preventDefault();
								if (
									!historyRef
										.current
										.length
								)
									return;
								historyIndexRef.current =
									Math.max(
										0,
										historyIndexRef.current -
											1,
									);
								setInput(
									historyRef
										.current[
										historyIndexRef
											.current
									] || "",
								);
							} else if (
								event.key ===
								"ArrowDown"
							) {
								event.preventDefault();
								if (
									!historyRef
										.current
										.length
								)
									return;
								historyIndexRef.current =
									Math.min(
										historyRef
											.current
											.length,
										historyIndexRef.current +
											1,
									);
								setInput(
									historyRef
										.current[
										historyIndexRef
											.current
									] || "",
								);
							} else if (
								event.ctrlKey &&
								event.key.toLowerCase() ===
									"l"
							) {
								event.preventDefault();
								clearLogs();
							}
						}}
						autoCapitalize="none"
						autoCorrect="off"
						spellCheck={false}
						aria-label="Terminal command input"
					/>
				</div>
			</main>
			<p id="skip" className="skip" hidden={!skipVisible}>
				press any key to skip boot
			</p>
		</div>
	);
}

export default App;
