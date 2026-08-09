import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";

/**
 * React Doctor quality ratchet. Ported from vivancedata, which hit this first.
 *
 * The gate here required an absolute 100/100 from `react-doctor@latest`, and
 * both halves of that were wrong.
 *
 * The score is scope-sensitive rather than a quality measure. Measured on
 * pristine main, with no change beyond appending one comment line to
 * src/components/ui/badge.tsx:
 *
 *   1 file changed   -> Score 97/100, "No issues found!"
 *   18 files changed -> Score 85/100, "No issues found!"
 *
 * Nothing was wrong in either case. Requiring 100 of a number that falls as you
 * touch more files means a large refactor can never merge however clean it is,
 * and it fails with an empty findings list, so there is nothing to act on.
 *
 * `@latest` then let the threshold move on its own. This gate genuinely passed
 * at 100 as recently as PR #27, where it caught a real await-in-a-loop worth
 * fixing. Nothing in this repo changed to break it; an upstream release did. A
 * required check reading from an unpinned dependency is not a gate, it is a coin
 * flip on someone else's release schedule.
 *
 * A ratchet is enforceable: the score may not drop below the committed baseline,
 * and improvements are locked in by raising it, so quality only moves one way
 * and a real regression fails a real check.
 *
 * NOTE: the workflow job is still named "React Doctor (100/100)", which is now a
 * misnomer. It is left alone on purpose -- that string is a required status
 * check in branch protection, and renaming the job without updating protection
 * in the same change blocks every merge permanently. Rename both together.
 */
const REACT_DOCTOR_VERSION = "0.9.11";
const BASELINE_FILE = new URL("../.react-doctor-baseline", import.meta.url);

const readBaseline = () => {
  if (!existsSync(BASELINE_FILE)) return null;
  const n = Number(readFileSync(BASELINE_FILE, "utf-8").trim());
  return Number.isFinite(n) ? n : null;
};

const result = spawnSync(
  "npx",
  ["-y", `react-doctor@${REACT_DOCTOR_VERSION}`, ".", "--score"],
  { encoding: "utf-8" }
);

if (result.error) {
  console.error("Failed to run React Doctor:", result.error.message);
  process.exit(1);
}

const rawOutput = `${result.stdout ?? ""}\n${result.stderr ?? ""}`.trim();
const scoreMatches = [...rawOutput.matchAll(/^\s*(\d+(?:\.\d+)?)\s*$/gm)];
const score = scoreMatches.length > 0 ? Number(scoreMatches.at(-1)[1]) : Number.NaN;

if (!Number.isFinite(score)) {
  console.error(
    "Unable to parse a React Doctor score from output:\n" + (rawOutput || "<no output>")
  );
  process.exit(1);
}

const baseline = readBaseline();

if (baseline === null) {
  writeFileSync(BASELINE_FILE, `${score}\n`);
  console.log(`No baseline found. Recorded ${score} in .react-doctor-baseline; commit it.`);
  process.exit(0);
}

if (score < baseline) {
  console.error(
    `React Doctor score regressed: ${score} (baseline ${baseline}).\n` +
      `Fix the regression, or -- if the drop is intentional and justified -- lower ` +
      `the number in .react-doctor-baseline in the same commit, with a reason.`
  );
  process.exit(1);
}

console.log(
  score > baseline
    ? `React Doctor score improved: ${score} (baseline ${baseline}). ` +
        `Raise .react-doctor-baseline to ${score} to lock the gain in.`
    : `React Doctor score holding at ${score} (baseline ${baseline}).`
);
process.exit(0);
