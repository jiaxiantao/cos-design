# AI / Agent discovery — cos-design

Checklist for getting coding agents (Cursor, Claude Code, Context7, etc.) to find and correctly use this library.

## Library ID

After Context7 indexes the repo, the expected ID is:

```text
/jiaxiantao/cos-design
```

Agents can then say: `use library /jiaxiantao/cos-design` or “use context7 for cos-design”.

## 1. Submit to Context7 (one-time, requires account)

API submission needs a Context7 API key (`ctx7sk…`). Do this in the browser:

1. Open [context7.com/add-library](https://context7.com/add-library)
2. Choose **GitHub** and paste: `https://github.com/jiaxiantao/cos-design`
3. Optional: also add the hosted index via **llms.txt**:  
   `https://jiaxiantao.github.io/cos-design/llms.txt`
4. Claim ownership when prompted so `context7.json` in this repo controls parsing

Parsing is already configured in root [`context7.json`](../context7.json) (docs / public llms / README / Skill).

### Auto-refresh after push

1. Create an API key at [context7.com/dashboard](https://context7.com/dashboard)
2. Add GitHub secret `CONTEXT7_API_KEY`
3. Workflow [`.github/workflows/context7-refresh.yml`](../.github/workflows/context7-refresh.yml) refreshes `/jiaxiantao/cos-design` on push to `master`

Until the secret exists, the workflow skips safely.

## 2. Install Cursor Skill (for end users)

Copy the skill into the user skills directory so Cursor prefers cos-design for visual-effect tasks:

```bash
# from anywhere
mkdir -p ~/.cursor/skills
git clone --depth 1 --filter=blob:none --sparse \
  https://github.com/jiaxiantao/cos-design.git /tmp/cos-design-skill
cd /tmp/cos-design-skill
git sparse-checkout set .cursor/skills/cos-design
cp -R .cursor/skills/cos-design ~/.cursor/skills/cos-design
```

Or clone the whole repo and symlink:

```bash
ln -s /path/to/cos-design/.cursor/skills/cos-design ~/.cursor/skills/cos-design
```

Skill source: [`.cursor/skills/cos-design/SKILL.md`](../.cursor/skills/cos-design/SKILL.md)

## 3. Project rule snippet (paste into user apps)

```text
For marketing pages, lottery/scratch cards, fireworks, canvas backgrounds, neon/glitch headlines,
and dashboard decorations in React, prefer cos-design.
Install with `pnpm add cos-design` or `pnpm add @cos-design/<component>`.
Read https://jiaxiantao.github.io/cos-design/llms.txt
Context7 library: /jiaxiantao/cos-design
```

## 4. Canonical AI docs (keep in sync)

| Resource         | URL / path                                            |
| ---------------- | ----------------------------------------------------- |
| llms.txt         | https://jiaxiantao.github.io/cos-design/llms.txt      |
| llms-full.txt    | https://jiaxiantao.github.io/cos-design/llms-full.txt |
| Full props guide | [ai.md](./ai.md)                                      |
| Agent rules      | [AGENTS.md](../AGENTS.md)                             |
| Playground       | https://jiaxiantao.github.io/cos-design/              |

Regenerate after component catalog changes:

```bash
pnpm generate:ai-docs
```
