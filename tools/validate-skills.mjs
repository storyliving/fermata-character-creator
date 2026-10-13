#!/usr/bin/env node
// Checks every skills/*/SKILL.md: valid frontmatter, name matches folder, description present, referenced files exist.
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
const root = process.argv[2] || '.'
let bad = 0, n = 0
for (const dir of readdirSync(join(root, 'skills'))) {
  const f = join(root, 'skills', dir, 'SKILL.md')
  if (!existsSync(f)) { console.error(`FAIL ${dir}: no SKILL.md`); bad++; continue }
  const s = readFileSync(f, 'utf8')
  const m = /^---\r?\nname: (.+)\r?\ndescription: (.+)\r?\n---/.exec(s)
  if (!m) { console.error(`FAIL ${dir}: frontmatter must be name + description`); bad++; continue }
  if (m[1].trim() !== dir) { console.error(`FAIL ${dir}: name "${m[1]}" != folder`); bad++ }
  if (m[2].length < 40 || m[2].length > 1024) { console.error(`FAIL ${dir}: description length ${m[2].length}`); bad++ }
  for (const ref of new Set([...s.matchAll(/`((?:references|scripts)\/[A-Za-z0-9_./-]+)`/g)].map(x => x[1]))) {
    if (!existsSync(join(root, 'skills', dir, ref))) { console.error(`FAIL ${dir}: missing ${ref}`); bad++ }
  }
  n++; console.log(`ok   ${dir} (${s.split(/\s+/).length} words)`)
}
if (!n || bad) { console.error(`validate: FAIL (${bad})`); process.exit(1) }
console.log('validate: PASS')
