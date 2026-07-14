#!/usr/bin/env node
// PreToolUse hook — Bash, for Rayfin App projects.
//
// Enforces rule 10 of rayfin-companion's Hard Rules: never commit rayfin/.env or
// rayfin/.temp/. Hard-denies explicit staging of those paths; warns (does not block)
// on blanket `git add -A`/`git add .`/`git commit -a`, since those may be legitimate
// once .gitignore covers both paths — the hook can't see .gitignore state reliably
// from the command string alone.
//
// Fails open: read/parse errors allow the command through rather than blocking it.

let input = "";
process.stdin.on("data", (chunk) => {
  input += chunk;
});
process.stdin.on("end", () => {
  try {
    const payload = JSON.parse(input);
    if (payload.tool_name !== "Bash") {
      process.exit(0);
    }
    const cmd = (payload.tool_input && payload.tool_input.command) || "";

    const stagesSecret = /\b(git\s+add|git\s+commit\b.*-a\b)\b/.test(cmd) &&
      /rayfin\/\.env\b|rayfin\/\.temp\b/.test(cmd);

    if (stagesSecret) {
      process.stdout.write(
        JSON.stringify({
          hookSpecificOutput: {
            hookEventName: "PreToolUse",
            permissionDecision: "deny",
            permissionDecisionReason:
              "Blocked by rayfin-companion guard: rule 10 forbids committing rayfin/.env or rayfin/.temp/.",
          },
        })
      );
      process.exit(0);
    }

    const blanketAdd = /\bgit\s+add\s+(-A|\.|--all)\b|\bgit\s+commit\b.*\s-a\b/.test(cmd);
    if (blanketAdd) {
      process.stdout.write(
        JSON.stringify({
          hookSpecificOutput: {
            hookEventName: "PreToolUse",
            additionalContext:
              "This stages/commits broadly — double-check rayfin/.env and rayfin/.temp/ are in .gitignore before proceeding (rayfin-companion rule 10).",
          },
        })
      );
    }
  } catch {
    // Fail open: allow the command through unmodified.
  }
  process.exit(0);
});
process.stdin.on("error", () => {
  process.exit(0);
});
