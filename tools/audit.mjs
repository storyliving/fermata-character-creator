#!/usr/bin/env node
// Public-repo safety check. Run before sharing and in CI:  node tools/audit.mjs [dir]
// Exits 1 (and prints every hit) if anything private could be in the tree. Silence is not a pass:
// it also prints how many files and bytes it actually scanned, and fails if that is zero.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const root = process.argv[2] || '.'
const SKIP_DIRS = new Set(['.git', 'node_modules'])
const TEXT_EXT = /\.(md|mjs|js|json|yaml|yml|txt|svg|html|css|py|sh|gitignore|license)$/i
const ALLOW_FILE = join(root, 'tools', 'audit-allow.json')
const allow = existsSync(ALLOW_FILE) ? JSON.parse(readFileSync(ALLOW_FILE, 'utf8')).allow || [] : []

// Generic things that should not be in a public skill repo: local machine paths and signed links.
const DENY = ['c:[\\\\/]users', '/users/[a-z0-9_.-]+/', '/home/[a-z0-9_.-]+/', 'localhost:\\d+', 'internal only', 'do not publish', 'confidential']
// Secrets and personal data.
const SECRET_RES = [
  [/AKIA[0-9A-Z]{16}/, 'AWS access key id'],
  [/\b(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}/, 'GitHub token'],
  [/github_pat_[A-Za-z0-9_]{30,}/, 'GitHub fine-grained token'],
  [/\bsk-[A-Za-z0-9_-]{20,}/, 'API secret key'],
  [/\bxox[baprs]-[A-Za-z0-9-]{10,}/, 'Slack token'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'private key'],
  [/\beyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{10,}/, 'JWT'],
  [/\bAIza[0-9A-Za-z_-]{30,}/, 'Google API key'],
  [/(api[_-]?key|secret|token|passwd|password)\s*[:=]\s*["']?[A-Za-z0-9_\-./+]{16,}/i, 'credential assignment'],
  [/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/, 'email address'],
  [/\b(?:\d{1,3}\.){3}\d{1,3}\b/, 'IPv4 address'],
  [/\b\+?\d{1,2}[ -.]?\(?\d{3}\)?[ -.]\d{3}[ -.]\d{4}\b/, 'phone number'],
  [/X-Amz-(Signature|Credential)=/i, 'signed URL'],
  [/[?&](token|key|sig|signature|access_token)=[A-Za-z0-9._-]{8,}/i, 'token in URL'],
]

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) yield* walk(p)
    else yield p
  }
}
const isAllowed = (file, term, line) =>
  allow.some(a => a.file === file && a.term === term && (!a.contains || line.includes(a.contains)))

let files = 0, bytes = 0, binaries = 0
const hits = []
for (const p of walk(root)) {
  const rel = relative(root, p).split(sep).join('/')
  if (rel === 'tools/audit.mjs' || rel === 'tools/audit-allow.json') continue
  const st = statSync(p)
  if (!TEXT_EXT.test(p)) {
    binaries++
    // A binary may not be inspected as text, but we can still reject embedded strings.
    if (/\.(glb|png|jpg|jpeg|webp|zip)$/i.test(p)) {
      const buf = readFileSync(p).toString('latin1')
      for (const t of DENY) { const m = new RegExp(t, 'i').exec(buf); if (m) hits.push({ rel, line: 0, kind: 'DENY(binary)', what: m[0] }) }
      for (const [re, name] of SECRET_RES) { const m = re.exec(buf); if (m && name !== 'IPv4 address' && name !== 'phone number' && name !== 'email address') hits.push({ rel, line: 0, kind: 'SECRET(binary)', what: name }) }
    }
    continue
  }
  files++; bytes += st.size
  const lines = readFileSync(p, 'utf8').split(/\r?\n/)
  lines.forEach((line, i) => {
    for (const t of DENY) {
      const m = new RegExp(t, 'i').exec(line)
      if (m && !isAllowed(rel, t, line)) hits.push({ rel, line: i + 1, kind: 'DENY', what: m[0], text: line.trim().slice(0, 140) })
    }
    for (const [re, name] of SECRET_RES) {
      const m = re.exec(line)
      if (m && !isAllowed(rel, name, line)) hits.push({ rel, line: i + 1, kind: 'SECRET', what: name + ': ' + m[0].slice(0, 12) + '...', text: line.trim().slice(0, 140) })
    }
  })
}
console.log(`audit: scanned ${files} text files (${bytes} bytes), ${binaries} binary/other files, ${allow.length} allow entries`)
for (const a of allow) console.log(`  allow: ${a.file} [${a.term}] ${a.reason}`)
if (files === 0 || bytes === 0) { console.error('AUDIT FAIL: nothing was scanned.'); process.exit(1) }
if (hits.length) {
  for (const h of hits) console.error(`HIT ${h.kind} ${h.rel}:${h.line} ${h.what}${h.text ? '  | ' + h.text : ''}`)
  console.error(`AUDIT FAIL: ${hits.length} hit(s).`)
  process.exit(1)
}
console.log('AUDIT PASS: 0 hits.')
