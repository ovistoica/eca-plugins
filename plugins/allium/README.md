# Allium 🧅

Behavioural specification language plugin for ECA — elicit, distill, tend, weed and propagate Allium specs alongside your code.

## What is Allium?

Allium is a formal language for capturing software behaviour at the domain level. It sits between informal feature descriptions and implementation, providing a precise way to specify **what** software does without prescribing **how** it's built.

Allium has no compiler or runtime — it's purely descriptive, interpreted by LLMs and humans. The optional [Allium CLI](https://github.com/juxt/allium-tools) adds parser-backed validation, analysis and test planning.

## Install the CLI (recommended)

The plugin works without the CLI, but automatic validation and analysis require the `allium` command to be available in ECA's `PATH`. Install it with Homebrew:

```bash
brew tap juxt/allium && brew install allium
```

or Cargo:

```bash
cargo install allium-cli
```

Then verify from the same environment that launches ECA:

```bash
command -v allium && allium --version
```

## Plugin components

### Skills (6)

Plugin skills are namespaced by ECA. Invoke them as:

| Skill | Purpose |
|-------|---------|
| `/allium` | Entry point — syntax summary, routing table, quick reference |
| `/allium:elicit` | Build a spec through structured conversation with stakeholders |
| `/allium:distill` | Extract a spec from an existing codebase |
| `/allium:tend` | Edit and update existing specs |
| `/allium:weed` | Check spec-to-code alignment, find and resolve divergences |
| `/allium:propagate` | Generate tests from specifications |

### Agents (2)

| Agent | Purpose |
|-------|---------|
| `tend` | Subagent for editing `.allium` spec files (read, search, edit, write, shell) |
| `weed` | Subagent for checking spec-code alignment (read, search, edit, write, shell) |

### Rules (1)

| Rule | Scope | Purpose |
|------|-------|---------|
| `allium` | `**.allium` files | Syntax distinctions, anti-patterns, and key conventions — loaded on-demand when editing `.allium` files |

### Hooks (1)

| Hook | Trigger | Purpose |
|------|---------|---------|
| `allium.check-spec` | ECA `write_file`/`edit_file` on `.allium` files | Runs `allium check` automatically when the CLI is installed and returns diagnostics to the model as additional context |

### References (7)

Full language reference, 9 worked patterns, test generation taxonomy, migration guides, and skill-specific examples.

## Usage

Invoke skills with their ECA plugin names (for example `/allium`, `/allium:elicit`, `/allium:tend`) or ask ECA to use the `tend` or `weed` subagent.

The `allium` rule is path-scoped — it's automatically fetched when you work with `.allium` files. The `allium.check-spec` hook is a post-edit safety net: if the CLI is installed, diagnostics appear as `<additionalContext from="allium.check-spec">...` after ECA writes or edits a `.allium` file.

## Upstream sync

This plugin was ported from the upstream Allium repository. For reproducibility and auditing, the last upstream commit used as a reference for this port is recorded below:

- Repository: [juxt/allium](https://github.com/juxt/allium)
- Commit: `82da292e989d518f79189fdfef4446d0d517c277`
- Author: Henry Garner
- Date: 2026-04-24 15:40:26 +0100
- Message: Simplify CLI section in README

If you update the plugin from upstream in future, please update this section with the new commit hash and date.

## Credits

Based on [Allium](https://github.com/juxt/allium) by JUXT. Licensed under the same terms as the upstream repository.
