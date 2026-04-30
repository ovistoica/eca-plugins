import { execFileSync } from "child_process";
import { realpathSync, statSync } from "fs";
import path from "path";

process.on("uncaughtException", () => process.exit(0));

let data = "";
for await (const chunk of process.stdin) {
  data += chunk;
}

let input;
try {
  input = JSON.parse(data);
} catch {
  process.exit(0);
}

// ECA sends { tool_input: { path } } for write_file and edit_file.
const filePath = input.tool_input?.path;

if (typeof filePath !== "string" || path.extname(filePath) !== ".allium") {
  process.exit(0);
}

let resolved;
try {
  resolved = realpathSync(filePath);
  if (!statSync(resolved).isFile()) process.exit(0);
} catch {
  process.exit(0);
}

function workspaceRoots(payload) {
  const payloadRoots = Array.isArray(payload.workspaces) ? payload.workspaces : [];
  const roots = payloadRoots.filter((root) => typeof root === "string" && root.length > 0);
  return roots.length > 0 ? roots : [process.cwd()];
}

function isInsideAnyWorkspace(file, roots) {
  const resolvedRoots = [];
  for (const root of roots) {
    try {
      resolvedRoots.push(realpathSync(root));
    } catch {
      // Skip unresolvable workspace roots.
    }
  }

  if (resolvedRoots.length === 0) return false;

  return resolvedRoots.some((root) => file === root || file.startsWith(root + path.sep));
}

if (!isInsideAnyWorkspace(resolved, workspaceRoots(input))) {
  process.exit(0);
}

try {
  execFileSync("allium", ["check", resolved], {
    encoding: "utf-8",
    stdio: "pipe",
  });
} catch (e) {
  if (e.code === "ENOENT") {
    // allium CLI not found — skip silently.
    process.exit(0);
  }

  const diagnostics = (e.stderr || "") + (e.stdout || "");
  if (diagnostics) {
    const additionalContext = [
      "Automatic Allium validation from ECA hook `allium.check-spec` after editing this `.allium` file.",
      "",
      `The Allium CLI reported diagnostics for ${resolved}:`,
      "",
      diagnostics,
    ].join("\n");

    process.stdout.write(JSON.stringify({ additionalContext }));
  }
  process.exit(0);
}
