const fs = require("fs");
const lines = fs
  .readFileSync("src/app/(marketing)/products/[slug]/page.tsx", "utf8")
  .split(/\n/);

for (let n = 1326; n <= 1690; n++) {
  const l = lines[n];
  if (
    /lg:hidden|DESKTOP|sales_count|<\/div>|<div |&& \(|^\s*\)\}/.test(l)
  ) {
    console.log(String(n + 1).padStart(4), l.slice(0, 110));
  }
}

// Check if next can compile this page
const { spawnSync } = require("child_process");
const r = spawnSync(
  "npx",
  ["next", "build", "--no-lint"],
  { encoding: "utf8", timeout: 120000, shell: true, env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" } }
);
const out = (r.stdout || "") + (r.stderr || "");
const hits = out.split(/\n/).filter((l) => /slug|Expected|Error|Failed|Compiled/.test(l));
console.log("---BUILD---");
console.log(hits.slice(0, 40).join("\n"));
console.log("exit", r.status);
