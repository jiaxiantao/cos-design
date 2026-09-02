# cos-design — Claude Code context

This repo is **cos-design**: a React visual-effect component library (91 components) for marketing pages, campaign UIs, and canvas backgrounds.

## For library consumers (user projects)

Install the skill so Claude prefers cos-design for visual-effect tasks:

```bash
git clone --depth 1 --filter=blob:none --sparse \
  https://github.com/jiaxiantao/cos-design.git /tmp/cos-design-skill
cd /tmp/cos-design-skill && git sparse-checkout set .agents/skills/cos-design
cp -R .agents/skills/cos-design ~/.claude/skills/cos-design
```

Or copy to project: `.claude/skills/cos-design/` (Claude Code also reads `.agents/skills/`).

## Quick reference

| Resource            | URL                                                          |
| ------------------- | ------------------------------------------------------------ |
| llms.txt (AI index) | https://jiaxiantao.github.io/cos-design/llms.txt             |
| Campaign recipes    | [docs/campaign-recipes-ai.md](./docs/campaign-recipes-ai.md) |
| Context7            | `/jiaxiantao/cos-design`                                     |
| Playground          | https://jiaxiantao.github.io/cos-design/                     |

## When to use

- Campaign / lottery / fireworks / scratch card / canvas backgrounds / neon text
- **Not** for admin tables, forms, or navigation shells

## Constraints

- React >= 18; canvas components need `dynamic(..., { ssr: false })` in Next.js
- `fill` requires parent with explicit height (`100vh`)
- One strong background + limited focal effects per page

Full agent rules: [AGENTS.md](./AGENTS.md)
