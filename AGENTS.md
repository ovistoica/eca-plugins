# AGENTS.md

## Build & Dev
- Website only: `cd website && npm run dev` / `npm run build` / `npm run preview`
- No test framework or linter is configured in this repo.

## Project Layout
- `plugins/` — Plugin definitions (Markdown, JSON, shell scripts). No JS/TS here.
- `website/` — Astro 5 static site (marketplace UI). All code lives in `website/src/`.
- `.eca-plugin/marketplace.json` — Plugin registry read at build time.

## Code Style (website)
- **Formatting**: 2-space indent, semicolons, single quotes in JS/TS, double quotes in HTML attributes.
- **Imports**: Named imports for libraries, default for local `.astro` components. Use `node:` prefix for Node built-ins. Order: third-party → local components → styles → data.
- **Naming**: camelCase variables/functions, PascalCase interfaces, BEM-style CSS classes (`filter-pill--active`).
- **Types**: `interface` for props/data shapes. Type inference preferred over explicit return types.
- **Error handling**: Guard clauses, try/catch with silent fallback, graceful degradation.
- **No JS frameworks** — vanilla JS in `<script>` tags, scoped `<style>` per component.

## Shell Scripts (plugins)
- Always start with `set -euo pipefail`. Use `|| true` for optional commands.
