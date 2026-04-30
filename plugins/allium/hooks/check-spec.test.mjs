import { execFileSync } from "child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "fs";
import { tmpdir } from "os";
import path from "path";

const hook = new URL("./check-spec.mjs", import.meta.url).pathname;
let passed = 0;
let failed = 0;

function run(input, { env = {}, cwd } = {}) {
  try {
    const stdout = execFileSync(process.execPath, [hook], {
      input: JSON.stringify(input),
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, ...env },
      ...(cwd ? { cwd } : {}),
    });
    return { status: 0, stdout, stderr: "" };
  } catch (e) {
    return { status: e.status, stdout: e.stdout || "", stderr: e.stderr || "" };
  }
}

function runRaw(rawStdin, { env = {}, cwd } = {}) {
  try {
    const stdout = execFileSync(process.execPath, [hook], {
      input: rawStdin,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, ...env },
      ...(cwd ? { cwd } : {}),
    });
    return { status: 0, stdout, stderr: "" };
  } catch (e) {
    return { status: e.status, stdout: e.stdout || "", stderr: e.stderr || "" };
  }
}

function assert(name, actual, expected) {
  if (actual === expected) {
    console.log(`  pass: ${name}`);
    passed++;
  } else {
    console.log(`  FAIL: ${name} (expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)})`);
    failed++;
  }
}

function assertIncludes(name, actual, expectedSubstring) {
  if (actual.includes(expectedSubstring)) {
    console.log(`  pass: ${name}`);
    passed++;
  } else {
    console.log(`  FAIL: ${name} (missing ${JSON.stringify(expectedSubstring)} in ${JSON.stringify(actual)})`);
    failed++;
  }
}

function parseJson(stdout) {
  try {
    return JSON.parse(stdout);
  } catch {
    return null;
  }
}

const root = mkdtempSync(path.join(tmpdir(), "allium-eca-hook-test-"));
const binDir = path.join(root, "bin");
const emptyBinDir = path.join(root, "empty-bin");
const workspaceA = path.join(root, "workspace-a");
const workspaceB = path.join(root, "workspace-b");
const outside = path.join(root, "outside");

mkdirSync(binDir);
mkdirSync(emptyBinDir);
mkdirSync(workspaceA);
mkdirSync(workspaceB);
mkdirSync(outside);

const fakeAllium = path.join(binDir, "allium");
writeFileSync(fakeAllium, "#!/bin/sh\necho \"fake diagnostics for $2\" >&2\nexit 1\n", { mode: 0o755 });

const validA = path.join(workspaceA, "spec.allium");
const validB = path.join(workspaceB, "spec.allium");
const outsideFile = path.join(outside, "spec.allium");
const markdownFile = path.join(workspaceA, "README.md");

writeFileSync(validA, "-- allium: 3\n");
writeFileSync(validB, "-- allium: 3\n");
writeFileSync(outsideFile, "-- allium: 3\n");
writeFileSync(markdownFile, "# Not Allium\n");

const fakeEnv = { PATH: binDir };
const missingCliEnv = { PATH: emptyBinDir };

console.log("ECA hook — early exits:\n");

assert(
  "missing tool_input.path skipped",
  run({ tool_input: {} }, { env: fakeEnv, cwd: workspaceA }).stdout,
  "",
);

assert(
  "non-.allium file skipped",
  run({ tool_input: { path: markdownFile }, workspaces: [workspaceA] }, { env: fakeEnv }).stdout,
  "",
);

assert(
  "non-existent .allium file skipped",
  run({ tool_input: { path: path.join(workspaceA, "ghost.allium") }, workspaces: [workspaceA] }, { env: fakeEnv }).stdout,
  "",
);

assert(
  "malformed JSON exits cleanly",
  runRaw("{not json}", { env: fakeEnv, cwd: workspaceA }).status,
  0,
);

assert(
  "empty stdin exits cleanly",
  runRaw("", { env: fakeEnv, cwd: workspaceA }).status,
  0,
);

console.log("\nECA hook — CLI handling:\n");

assert(
  "missing allium CLI skipped silently",
  run({ tool_input: { path: validA }, workspaces: [workspaceA] }, { env: missingCliEnv }).stdout,
  "",
);

const invalidResult = run({ tool_input: { path: validA }, workspaces: [workspaceA] }, { env: fakeEnv });
const invalidJson = parseJson(invalidResult.stdout);

assert("invalid file hook exits successfully", invalidResult.status, 0);
assert("invalid file returns JSON", invalidJson !== null, true);
assertIncludes(
  "diagnostics identify ECA hook",
  invalidJson?.additionalContext || "",
  "Automatic Allium validation from ECA hook `allium.check-spec`",
);
assertIncludes(
  "diagnostics include fake checker output",
  invalidJson?.additionalContext || "",
  "fake diagnostics for",
);

console.log("\nECA hook — workspace boundaries:\n");

assert(
  "file outside workspace skipped",
  run({ tool_input: { path: outsideFile }, workspaces: [workspaceA] }, { env: fakeEnv }).stdout,
  "",
);

const secondWorkspaceResult = run(
  { tool_input: { path: validB }, workspaces: [workspaceA, workspaceB] },
  { env: fakeEnv },
);
assert("file in second workspace accepted", parseJson(secondWorkspaceResult.stdout) !== null, true);

const fallbackCwdResult = run(
  { tool_input: { path: validA } },
  { env: fakeEnv, cwd: workspaceA },
);
assert("missing workspaces falls back to cwd", parseJson(fallbackCwdResult.stdout) !== null, true);

rmSync(root, { recursive: true, force: true });

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
