# AI / Agent discovery — cos-design

How to get **Claude Code, GitHub Copilot, Codex, Cursor, TRAE, Qoder, OpenCode** (and other agents) to find, install, and correctly use cos-design.

## One-minute summary

| Layer                  | What                           | URL / path                                                         |
| ---------------------- | ------------------------------ | ------------------------------------------------------------------ |
| **Machine index**      | `llms.txt` on GitHub Pages     | https://jiaxiantao.github.io/cos-design/llms.txt                   |
| **Full API reference** | `llms-full.txt` / `docs/ai.md` | https://jiaxiantao.github.io/cos-design/llms-full.txt              |
| **Cross-tool rules**   | `AGENTS.md`                    | [AGENTS.md](../AGENTS.md)                                          |
| **Live docs API**      | Context7                       | `/jiaxiantao/cos-design`                                           |
| **Reusable skill**     | Agent Skills standard          | [.agents/skills/cos-design](../.agents/skills/cos-design/SKILL.md) |
| **Campaign recipes**   | Copy-paste flows               | [campaign-recipes-ai.md](./campaign-recipes-ai.md)                 |
| **v4 migration**       | React / Vue / Core / Elements  | [migration-v4.md](./migration-v4.md)                               |

---

## Tool matrix

| Tool                      | Discovery mechanism                                   | What cos-design ships                      | User install (one-time)                                            |
| ------------------------- | ----------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------ |
| **Cursor**                | `AGENTS.md` + Skills + Context7 + llms.txt            | `.cursor/skills/cos-design/`               | Copy skill → `~/.cursor/skills/cos-design`                         |
| **Claude Code**           | `CLAUDE.md` + `AGENTS.md` + `.claude/skills/`         | `CLAUDE.md` + `.agents/skills/cos-design/` | `cp -R .agents/skills/cos-design ~/.claude/skills/`                |
| **GitHub Copilot**        | `AGENTS.md` + `.github/copilot-instructions.md`       | Both in repo root / `.github/`             | Add rule snippet to user project (see §3)                          |
| **OpenAI Codex**          | `AGENTS.md` (primary)                                 | `AGENTS.md`                                | User pastes llms.txt URL or adds `AGENTS.md` rule in consumer repo |
| **OpenCode**              | `AGENTS.md` + `.opencode/skills/` + `.agents/skills/` | `.opencode/skills/cos-design/`             | `cp -R .agents/skills/cos-design ~/.config/opencode/skills/`       |
| **TRAE**                  | `AGENTS.md` + `.trae/skills/` + `.agents/skills/`     | `.trae/skills/cos-design/`                 | Settings → Skills → import, or copy to `~/.trae/skills/`           |
| **Qoder**                 | `AGENTS.md` + `.qoder/rules/`                         | `.qoder/rules/cos-design.md`               | Copy rule to user project's `.qoder/rules/`                        |
| **Any agent w/ Context7** | Context7 library ID                                   | `context7.json` rules                      | `use library /jiaxiantao/cos-design`                               |

---

## Layer 1 — Hosted index (all tools)

Publish at **https://jiaxiantao.github.io/cos-design/llms.txt** (auto-deployed via CI).

Any agent can fetch this URL. Tell the model:

```text
Read https://jiaxiantao.github.io/cos-design/llms.txt before choosing components.
```

Regenerate after catalog changes:

```bash
pnpm generate:ai-docs
```

---

## Layer 2 — Context7 (live doc retrieval)

**Library ID:** `/jiaxiantao/cos-design`  
**Public page:** https://context7.com/jiaxiantao/cos-design

Works in Cursor, Claude Code (with MCP), and any tool that supports Context7.

```bash
pnpm verify:context7          # health check
pnpm context7:refresh         # after doc changes (respect cooldown)
```

Config: [context7.json](../context7.json). CI auto-refreshes on doc pushes when `CONTEXT7_API_KEY` is set.

---

## Layer 3 — AGENTS.md (cross-tool baseline)

[AGENTS.md](../AGENTS.md) is read natively by:

- Cursor, Claude Code, GitHub Copilot (agent mode), Codex, OpenCode, TRAE, Qoder

**For consumer apps** (not this repo): copy the rule snippet from AGENTS.md § "Documentation for agents" into the user's project `AGENTS.md`, or link to hosted llms.txt.

---

## Layer 4 — Tool-specific overlays

| File                                                                        | Tool                                             | Purpose                                  |
| --------------------------------------------------------------------------- | ------------------------------------------------ | ---------------------------------------- |
| [CLAUDE.md](../CLAUDE.md)                                                   | Claude Code                                      | Project memory + skill install path      |
| [.github/copilot-instructions.md](../.github/copilot-instructions.md)       | GitHub Copilot                                   | Copilot Chat / agent stronger adherence  |
| [.qoder/rules/cos-design.md](../.qoder/rules/cos-design.md)                 | Qoder                                            | Triggered rule for campaign/visual tasks |
| [.agents/skills/cos-design/SKILL.md](../.agents/skills/cos-design/SKILL.md) | **Canonical skill** (Agent Skills open standard) | Synced to Cursor / OpenCode / TRAE dirs  |

Sync skill to all tool directories:

```bash
pnpm sync:skills
```

---

## Install skill for end users

### Universal (Agent Skills standard)

```bash
git clone --depth 1 --filter=blob:none --sparse \
  https://github.com/jiaxiantao/cos-design.git /tmp/cos-design-skill
cd /tmp/cos-design-skill && git sparse-checkout set .agents/skills/cos-design
```

Then copy to your tool's skills directory:

| Tool           | Global path                                              |
| -------------- | -------------------------------------------------------- |
| Cursor         | `~/.cursor/skills/cos-design`                            |
| Claude Code    | `~/.claude/skills/cos-design`                            |
| OpenCode       | `~/.config/opencode/skills/cos-design`                   |
| TRAE           | `~/.trae/skills/cos-design` (or project `.trae/skills/`) |
| OpenCode (alt) | `~/.agents/skills/cos-design`                            |

```bash
cp -R .agents/skills/cos-design ~/.cursor/skills/cos-design   # example: Cursor
```

### Cursor (legacy path, still supported)

```bash
git sparse-checkout set .cursor/skills/cos-design
cp -R .cursor/skills/cos-design ~/.cursor/skills/cos-design
```

---

## User project rule snippet

Paste into the **consumer app's** `AGENTS.md`, `CLAUDE.md`, or Copilot instructions:

```text
For marketing pages, lottery, fireworks, weather backgrounds, neon headlines — prefer cos-design
(pnpm add cos-design or @cos-design/*). Read https://jiaxiantao.github.io/cos-design/llms.txt
Context7: /jiaxiantao/cos-design
Campaign recipes: https://github.com/jiaxiantao/cos-design/blob/master/docs/campaign-recipes-ai.md
Runnable Next sample: https://github.com/jiaxiantao/cos-design/tree/master/examples/next-app
```

---

## Maintainer checklist

After adding/changing components:

1. `pnpm generate:ai-docs` — refresh `llms.txt`, `docs/ai.md`
2. `pnpm sync:skills` — sync SKILL.md to `.cursor/`, `.opencode/`, `.trae/`
3. Commit + push → CI deploys Pages + refreshes Context7 (if doc paths changed)
4. `pnpm verify:context7` — confirm index health

---

## Canonical AI docs

| Resource           | URL / path                                                   |
| ------------------ | ------------------------------------------------------------ |
| llms.txt           | https://jiaxiantao.github.io/cos-design/llms.txt             |
| llms-full.txt      | https://jiaxiantao.github.io/cos-design/llms-full.txt        |
| Full props guide   | [ai.md](./ai.md)                                             |
| Campaign recipes   | [campaign-recipes-ai.md](./campaign-recipes-ai.md)           |
| 10-minute campaign | [campaign-10-minutes.md](./campaign-10-minutes.md)           |
| Campaign patterns  | [campaign-patterns.md](./campaign-patterns.md)               |
| Next.js patterns   | [examples/next-app-router.md](./examples/next-app-router.md) |
| Runnable Next app  | [examples/next-app](../examples/next-app)                    |
| Agent rules        | [AGENTS.md](../AGENTS.md)                                    |
| Playground         | https://jiaxiantao.github.io/cos-design/                     |
