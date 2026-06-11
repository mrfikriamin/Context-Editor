import { spawnSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"

const root = process.cwd()
const ignoredDirs = new Set(["node_modules", ".next", ".git", ".tmp", "graphify-out", ".venv"])
const checkedExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".css", ".md", ".json"])

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    if (ignoredDirs.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...walk(full))
    } else if (checkedExtensions.has(path.extname(entry.name))) {
      files.push(full)
    }
  }
  return files
}

function rel(file) {
  return path.relative(root, file).replace(/\\/g, "/")
}

const issues = []
for (const file of walk(root)) {
  const text = fs.readFileSync(file, "utf8")
  if (/\t/.test(text)) {
    issues.push(`${rel(file)}: contains tab characters`)
  }
  const lines = text.split(/\r?\n/)
  lines.forEach((line, index) => {
    if (/[ \t]+$/.test(line)) {
      issues.push(`${rel(file)}:${index + 1}: trailing whitespace`)
    }
  })
  if (!text.endsWith("\n")) {
    issues.push(`${rel(file)}: missing final newline`)
  }
}

const tsc = spawnSync("cmd.exe", ["/c", "npx", "tsc", "--noEmit"], {
  cwd: root,
  encoding: "utf8",
})

if (tsc.status !== 0) {
  issues.push("TypeScript check failed:")
  if (tsc.stdout.trim()) issues.push(tsc.stdout.trim())
  if (tsc.stderr.trim()) issues.push(tsc.stderr.trim())
}

if (issues.length) {
  console.error(issues.join("\n"))
  process.exit(1)
}

console.log("Local lint passed.")
