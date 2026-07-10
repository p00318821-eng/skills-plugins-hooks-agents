#!/usr/bin/env node
// PostToolUse hook — Edit|Write, scoped to *.ts, for Rayfin App projects.
//
// Backstops a SUBSET of rayfin-companion's "Hard Rules" (see ../SKILL.md) that are
// cleanly regex-detectable after the fact. This is NOT a substitute for the skill's
// generation-time guidance — several hard rules (composite-key detection, FK naming
// against nav-property names, many-to-many topology) need type/relationship context
// a line-based scanner can't reliably infer, and stay judgment-only.
//
// Covered here: rule 5 (@one() -> USER), rule 7 (totalCount populated),
// rule 9 (returnOrigin with path suffix), rule 3 (bare `?` beside a decorator that
// doesn't say optional: true), rule 2 (entity class with no @uuid() id!: string found
// anywhere in the file — file-level heuristic, not per-class).
//
// Fails open: read/parse errors emit nothing rather than blocking the edit.

const fs = require("fs");

function checkFile(filePath, text) {
  const warnings = [];
  const lines = text.split(/\r?\n/);

  if (/@one\(\s*\(\)\s*=>\s*USER\b|@one\(\s*USER\b/.test(text)) {
    warnings.push(
      "rule 5: found @one() pointing at the USER system entity — use `@text() user_id!: string` populated from claims.sub instead."
    );
  }

  if (/\btotalCount\s*[:=]/.test(text)) {
    warnings.push(
      "rule 7: totalCount is being assigned — it is never populated by Rayfin; count with items.length instead."
    );
  }

  const originMatch = text.match(/returnOrigin\s*[:=]\s*["'`]https?:\/\/[^\/"'`]+(\/[^"'`]*)["'`]/);
  if (originMatch && originMatch[1]) {
    warnings.push(
      `rule 9: returnOrigin includes a path suffix ("${originMatch[1]}") — must be a bare origin, no path.`
    );
  }

  for (let i = 0; i < lines.length; i++) {
    if (/^\s*\w+\?:/.test(lines[i])) {
      const prevLine = (lines[i - 1] || "").trim();
      if (/^@\w+\(/.test(prevLine) && !/optional\s*:\s*true/.test(prevLine)) {
        warnings.push(
          `rule 3 (line ${i + 1}): "${lines[i].trim()}" uses TypeScript \`?\` beside a decorator without ` +
            "`{ optional: true }` — bare `?` does not make the column nullable in Rayfin."
        );
      }
    }
  }

  if (/@entity\(/.test(text) && !/@uuid\(\)\s*\n?\s*id!:\s*string/.test(text)) {
    warnings.push(
      "rule 2: file declares @entity() but no `@uuid() id!: string` primary key pattern was found (file-level check, not per-class — verify manually if this file has multiple entity classes)."
    );
  }

  return warnings;
}

let input = "";
process.stdin.on("data", (chunk) => {
  input += chunk;
});
process.stdin.on("end", () => {
  try {
    const payload = JSON.parse(input);
    const filePath = (payload.tool_input && payload.tool_input.file_path) || "";
    if (!filePath.toLowerCase().endsWith(".ts")) {
      process.exit(0);
    }

    const text = fs.readFileSync(filePath, "utf-8");
    const warnings = checkFile(filePath, text);

    if (warnings.length > 0) {
      const output = {
        hookSpecificOutput: {
          hookEventName: "PostToolUse",
          additionalContext:
            "rayfin-companion hard-rules check flagged possible issues in " +
            filePath +
            ":\n- " +
            warnings.join("\n- "),
        },
      };
      process.stdout.write(JSON.stringify(output));
    }
  } catch {
    // Fail open: emit nothing, edit result reaches Claude unmodified.
  }
  process.exit(0);
});
process.stdin.on("error", () => {
  process.exit(0);
});
