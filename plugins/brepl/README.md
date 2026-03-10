# brepl

A skill that teaches ECA the correct heredoc pattern for evaluating Clojure code via [brepl](https://github.com/licht1stein/brepl), a REPL client.

## Requirements

> ⚠️ **You must have `brepl` installed and available on your PATH.**
>
> Install it from [github.com/licht1stein/brepl](https://github.com/licht1stein/brepl) before using this plugin.
>
> You also need a running nREPL server (e.g., started via `lein repl`, `clj -M:nrepl`, or your build tool of choice).

## What it provides

- **`brepl` skill** — Must be loaded before any brepl usage. Teaches the heredoc pattern that eliminates shell quoting issues when evaluating Clojure expressions.

## Why this skill matters

Shell quoting with Clojure is error-prone: Clojure uses both single and double quotes, nested quotes require escaping, and reader macros can confuse the shell. The heredoc pattern (`<<'EOF'`) eliminates all these issues by passing code literally to brepl.

## Usage

The skill is automatically loaded when needed. You can also request it explicitly:

```
Load the brepl skill and evaluate my test
```

### Quick example

```bash
brepl <<'EOF'
(require '[clojure.string :as str])
(str/join ", " ["hello" "world"])
EOF
```

## Features covered by the skill

- **Heredoc pattern** for reliable multi-line evaluation
- **File loading** via `brepl -f`
- **Bracket fixing** via `brepl balance`
- **Common patterns** — namespace reloading, doc lookup, error inspection, test running

Credits: Based on the [brepl](https://github.com/licht1stein/brepl) project by @licht1stein.
