# cos-design — Claude Code context

This repo is **cos-design**: a **multi-framework** visual-effect component library (**91** components) for marketing pages, campaign UIs, and canvas backgrounds. React is the default entry; Vue 3 / Core / Web Components use the same package names via subpaths.

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
| v4 migration        | [docs/migration-v4.md](./docs/migration-v4.md)               |
| Campaign recipes    | [docs/campaign-recipes-ai.md](./docs/campaign-recipes-ai.md) |
| Context7            | `/jiaxiantao/cos-design`                                     |
| Playground          | https://jiaxiantao.github.io/cos-design/                     |

## When to use

- Campaign / lottery / fireworks / scratch card / canvas backgrounds / neon text
- **Not** for admin tables, forms, or navigation shells

## Constraints

- React >= 18 (default); Vue >= 3.4 for `/vue`; canvas needs `dynamic(..., { ssr: false })` in Next.js
- `fill` requires parent with explicit height (`100vh`)
- One strong background + limited focal effects per page
- Imports: `cos-design` (React) · `cos-design/vue` · `cos-design/core` · `cos-design/elements`

Full agent rules: [AGENTS.md](./AGENTS.md)
