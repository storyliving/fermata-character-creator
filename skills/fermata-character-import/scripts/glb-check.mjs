#!/usr/bin/env node
// glb-check: inspect a .glb or .gltf the way the Love Bird importer will, before you upload it.
// Zero dependencies. Node 18+.
//
//   node glb-check.mjs character.glb            human-readable report
//   node glb-check.mjs character.glb --json     machine-readable report (paste into a bug report)
//   node glb-check.mjs character.glb --offline  skip the live spec, use the bundled copy
//
// Exit code: 0 = no FAIL, 1 = at least one FAIL, 2 = could not read the file.
import { readFileSync, existsSync, statSync } from 'node:fs'
import { dirname, join, resolve, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const SPEC_URL = 'https://hq.fermata.me/api/public/import-spec'
const HERE = dirname(fileURLToPath(import.meta.url))
const FALLBACK = join(HERE, '..', 'references', 'spec-fallback.json')

const args = process.argv.slice(2)
const file = args.find(a => !a.startsWith('--'))
const asJson = args.includes('--json')
const offline = args.includes('--offline')
if (!file) { console.error('usage: node glb-check.mjs <file.glb|file.gltf> [--json] [--offline]'); process.exit(2) }

async function loadSpec() {
  if (!offline) {
    try {
      const r = await fetch(SPEC_URL, { signal: AbortSignal.timeout(6000), headers: { accept: 'application/json' } })
      if (r.ok) { const j = await r.json(); if (j?.schema === 'fermata.character-import-spec/1') return { spec: j, source: 'live' } }
    } catch { /* fall through to the bundled copy */ }
  }
  return { spec: JSON.parse(readFileSync(FALLBACK, 'utf8')), source: 'bundled' }
}

function parse(path) {
  const buf = readFileSync(path)
  if (extname(path).toLowerCase() === '.gltf') {
    const json = JSON.parse(buf.toString('utf8'))
    const buffers = (json.buffers || []).map(b => {
      if (!b.uri) return null
      if (b.uri.startsWith('data:')) return Buffer.from(b.uri.split(',')[1], 'base64')
      const p = resolve(dirname(path), decodeURIComponent(b.uri))
      return existsSync(p) ? readFileSync(p) : null
    })
    return { json, bin: buffers[0], buffers, container: 'gltf' }
  }
  if (buf.length < 20 || buf.readUInt32LE(0) !== 0x46546c67) throw new Error('This is not a GLB file (no glTF header).')
  const version = buf.readUInt32LE(4)
  if (version !== 2) throw new Error(`GLB version ${version} is not supported. Export glTF 2.0.`)
  let off = 12, json = null, bin = null
  while (off + 8 <= buf.length) {
    const len = buf.readUInt32LE(off), type = buf.readUInt32LE(off + 4)
    const chunk = buf.subarray(off + 8, off + 8 + len)
    if (type === 0x4e4f534a) json = JSON.parse(chunk.toString('utf8').replace(/\0+$/, ''))
    else if (type === 0x004e4942) bin = chunk
    off += 8 + len
  }
  if (!json) throw new Error('The GLB has no JSON chunk first.')
  return { json, bin, buffers: [bin], container: 'glb' }
}

function imageSize(bytes) {
  if (!bytes || bytes.length < 24) return null
  if (bytes.readUInt32BE(0) === 0x89504e47) return { type: 'png', w: bytes.readUInt32BE(16), h: bytes.readUInt32BE(20) }
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    let i = 2
    while (i + 9 < bytes.length) {
      if (bytes[i] !== 0xff) { i++; continue }
      const m = bytes[i + 1]
      if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return { type: 'jpeg', h: bytes.readUInt16BE(i + 5), w: bytes.readUInt16BE(i + 7) }
      i += 2 + bytes.readUInt16BE(i + 2)
    }
    return { type: 'jpeg', w: 0, h: 0 }
  }
  if (bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') {
    const kind = bytes.toString('ascii', 12, 16)
    if (kind === 'VP8 ') return { type: 'webp', w: bytes.readUInt16LE(26) & 0x3fff, h: bytes.readUInt16LE(28) & 0x3fff }
    if (kind === 'VP8L') { const b = bytes.readUInt32LE(21); return { type: 'webp', w: (b & 0x3fff) + 1, h: ((b >> 14) & 0x3fff) + 1 } }
    if (kind === 'VP8X') return { type: 'webp', w: 1 + bytes.readUIntLE(24, 3), h: 1 + bytes.readUIntLE(27, 3) }
    return { type: 'webp', w: 0, h: 0 }
  }
  if (bytes.toString('ascii', 4, 8) === 'ftyp' || bytes.toString('ascii', 12, 16) === 'KTX ') return { type: 'ktx2/avif', w: 0, h: 0 }
  return null
}

const norm = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '')
function normShape(name) {
  let s = String(name || '').replace(/[._]([LR])$/i, (_, side) => (side.toUpperCase() === 'L' ? 'Left' : 'Right'))
  s = norm(s)
  for (const p of ['arkit', 'blendshape', 'shapekey', 'bs']) if (s.startsWith(p) && s.length > p.length) { s = s.slice(p.length); break }
  return s
}

// The importer's own humanoid classifier (vendored byte-for-byte apart from the JSON import line).
import { classifyHumanoidRoles } from './vendor/humanoid-roles.mjs'

/** Same node list the importer builds: skin joints if any, else every node. */
function rigNodes(json) {
  const nodes = Array.isArray(json?.nodes) ? json.nodes : []
  const parentOf = new Map(); nodes.forEach((n, i) => (n?.children || []).forEach(c => parentOf.set(c, i)))
  const joints = new Set((json?.skins || []).flatMap(s => s?.joints || []))
  const picked = joints.size ? [...joints].filter(i => nodes[i]).sort((x, y) => x - y) : nodes.map((_, i) => i)
  const pickedSet = new Set(picked), seen = new Set(), label = new Map()
  for (const i of picked) { const raw = typeof nodes[i]?.name === 'string' ? nodes[i].name.trim() : ''; let name = raw || `node_${i}`; if (seen.has(name)) name = `${name}#${i}`; seen.add(name); label.set(i, name) }
  return picked.map(i => { let p = parentOf.get(i); while (p !== undefined && !pickedSet.has(p)) p = parentOf.get(p); return { name: label.get(i), parent: p === undefined ? null : label.get(p), index: i, original: typeof nodes[i]?.name === 'string' ? nodes[i].name : '' } })
}

function inspect({ json, buffers }) {
  const acc = json.accessors || [], views = json.bufferViews || []
  const meshes = json.meshes || [], nodes = json.nodes || []
  let triangles = 0, primitives = 0
  const morphNames = new Set(), meshNames = []
  for (const m of meshes) {
    meshNames.push(m.name || '(unnamed)')
    const names = m.extras?.targetNames || []
    for (const n of names) morphNames.add(n)
    for (const p of m.primitives || []) {
      primitives++
      const mode = p.mode ?? 4
      const count = p.indices != null ? acc[p.indices]?.count : acc[p.attributes?.POSITION]?.count
      if (mode === 4) triangles += Math.floor((count || 0) / 3)
      else if (mode === 5 || mode === 6) triangles += Math.max(0, (count || 0) - 2)
      if (!names.length && p.targets?.length) p.targets.forEach((_, i) => morphNames.add(`(unnamed target ${i})`))
    }
  }
  // Instances: a mesh used by several nodes renders several times.
  const meshUse = new Map(); for (const n of nodes) if (n.mesh != null) meshUse.set(n.mesh, (meshUse.get(n.mesh) || 0) + 1)
  let renderedTriangles = 0
  meshes.forEach((m, i) => {
    let t = 0
    for (const p of m.primitives || []) { const c = p.indices != null ? acc[p.indices]?.count : acc[p.attributes?.POSITION]?.count; t += Math.floor((c || 0) / 3) }
    renderedTriangles += t * (meshUse.get(i) || 0)
  })
  const textures = (json.images || []).map((img, i) => {
    let bytes = null
    if (img.bufferView != null) { const v = views[img.bufferView]; const b = buffers[v.buffer || 0]; if (b) bytes = b.subarray(v.byteOffset || 0, (v.byteOffset || 0) + v.byteLength) }
    else if (img.uri?.startsWith('data:')) bytes = Buffer.from(img.uri.split(',')[1], 'base64')
    const size = imageSize(bytes)
    return { index: i, name: img.name || `image_${i}`, mime: img.mimeType || size?.type || (img.uri ? 'external:' + img.uri : 'unknown'), embedded: !!bytes, width: size?.w || 0, height: size?.h || 0, bytes: bytes?.length || 0 }
  })
  const skins = (json.skins || []).map(s => s.joints || [])
  // Skins that share any joint are ONE skeleton (head + body on one armature).
  const groups = []
  for (const joints of skins) {
    const set = new Set(joints)
    const hit = groups.find(g => joints.some(j => g.has(j)))
    if (hit) joints.forEach(j => hit.add(j)); else groups.push(set)
  }
  // Merge transitively.
  for (let i = 0; i < groups.length; i++) for (let j = groups.length - 1; j > i; j--) if ([...groups[j]].some(x => groups[i].has(x))) { groups[j].forEach(x => groups[i].add(x)); groups.splice(j, 1) }
  // Same-named bone sets (MetaHuman face carrying its own copy of the body bones) count as one skeleton.
  const nameSets = groups.map(g => new Set([...g].map(j => nodes[j]?.name || '')))
  let skeletons = groups.length
  if (groups.length > 1) {
    const base = nameSets[0]; const overlap = nameSets.slice(1).every(s => [...s].filter(n => base.has(n)).length >= Math.min(s.size, base.size) * 0.5)
    if (overlap) skeletons = 1
  }
  const boneNames = [...new Set(skins.flat().map(j => nodes[j]?.name || '').filter(Boolean))]
  // Net horizontal travel of a root/hips translation track between its first and last key (float VEC3 only).
  const travel = (a, c) => {
    const out = acc[a.samplers?.[c.sampler]?.output]; if (!out || out.type !== 'VEC3' || out.componentType !== 5126 || out.bufferView == null || out.sparse) return 0
    const v = views[out.bufferView]; const b = buffers[v.buffer || 0]; if (!b) return 0
    const stride = v.byteStride || 12, base = (v.byteOffset || 0) + (out.byteOffset || 0), last = base + stride * (out.count - 1)
    if (last + 12 > b.length) return 0
    const dx = b.readFloatLE(last) - b.readFloatLE(base), dz = b.readFloatLE(last + 8) - b.readFloatLE(base + 8)
    return Math.hypot(dx, dz)
  }
  const animations = (json.animations || []).map(a => {
    let rootTravel = 0
    for (const c of a.channels || []) if (c.target?.path === 'translation' && /^(root|hips?|pelvis|armature)$/i.test(nodes[c.target.node]?.name || '')) rootTravel = Math.max(rootTravel, travel(a, c))
    return { name: a.name || '(unnamed)', channels: (a.channels || []).length, rootTravel: Number(rootTravel.toFixed(3)), rootMotionCandidate: rootTravel > 0.05 }
  })
  return {
    container: json.asset?.version, generator: json.asset?.generator || '', extensionsUsed: json.extensionsUsed || [], extensionsRequired: json.extensionsRequired || [],
    meshes: meshes.length, meshNames, primitives, triangles, renderedTriangles, materials: (json.materials || []).length, textures,
    skins: skins.length, skeletons, humanoid: classifyHumanoidRoles(rigNodes(json)), bones: boneNames.length, boneNames, morphTargets: [...morphNames], animations,
  }
}

function judge(r, spec, fileBytes) {
  const out = []
  const add = (level, msg) => out.push({ level, msg })
  const L = spec.limits || {}, rec = L.recommended || {}
  const max = L.maxUploadBytes || spec.upload?.maxBytes || 262144000
  add(fileBytes <= max ? 'PASS' : 'FAIL', `File size ${(fileBytes / 1048576).toFixed(1)} MB (limit ${(max / 1048576).toFixed(0)} MB)`)
  const unsupportedReq = r.extensionsRequired.filter(e => !['KHR_draco_mesh_compression', 'EXT_meshopt_compression', 'KHR_texture_transform', 'KHR_materials_emissive_strength', 'KHR_mesh_quantization', 'EXT_texture_webp'].includes(e))
  if (unsupportedReq.length) add('WARN', `Required extensions the importer may not read: ${unsupportedReq.join(', ')}`)
  if (r.extensionsUsed.some(e => /^VRM|VRMC_/.test(e))) add('WARN', 'VRM extensions found: bones are recognised, but VRM expressions and spring bones are ignored. Bake expressions into EMO_/ARKit shape keys.')
  if (r.extensionsRequired.includes('KHR_draco_mesh_compression')) add('WARN', 'Draco compressed: the web preview decodes it; export uncompressed unless you need it to fit under the size limit.')
  const warnTri = rec.warnAboveTriangles || 60000
  add(r.renderedTriangles > warnTri ? 'WARN' : 'PASS', `Triangles ${r.renderedTriangles.toLocaleString()} rendered (phone crowd ${(rec.phoneCrowdTriangles || [4000, 8000]).join('-')}, browser hero ${(rec.browserHeroTriangles || [8000, 18000]).join('-')}, warn above ${warnTri.toLocaleString()})`)
  const external = r.textures.filter(t => !t.embedded)
  if (external.length) add('FAIL', `${external.length} texture(s) are external files (${external.map(t => t.mime).join(', ')}). A single-file upload loses them: embed textures in the GLB.`)
  if (!r.textures.length) add('WARN', 'No packed textures were found. The body may use plain materials or textures stored outside this file.')
  const maxTex = rec.maxTextureSize || 2048
  const big = r.textures.filter(t => Math.max(t.width, t.height) > maxTex)
  add(big.length ? 'WARN' : 'PASS', big.length ? `${big.length} texture(s) larger than ${maxTex}px: ${big.map(t => `${t.name} ${t.width}x${t.height}`).join(', ')}` : `Textures ${r.textures.length}, largest ${Math.max(0, ...r.textures.map(t => Math.max(t.width, t.height)))}px (max ${maxTex}, phone ${rec.phoneTextureSize || 1024})`)
  if (r.materials > (rec.warnAboveMaterials || 8)) add('WARN', `${r.materials} materials: each is a draw call per character on a phone. Merge where you can.`)
  if (r.skeletons > 1) add('FAIL', `This file has ${r.skeletons} separate skeletons. Love Bird drives one: parent every skinned mesh (head, body, clothes) to the same armature.`)
  if (!r.bones) add('WARN', 'No skeleton. The character can appear as one rigid piece; to move, it needs an armature or named parts plus a clip.')

  const cls = r.humanoid
  const conv = cls.convention
  const missingRoles = cls.missingRoles
  const mhMissing = (spec.rig?.metahumanBones || []).filter(b => !r.boneNames.includes(b))
  if (r.bones) {
    if (cls.supportedHumanoid) add('PASS', `Supported humanoid (${conv}, confidence ${cls.confidence.toFixed(2)} >= ${spec.rig?.supportedHumanoid?.minConfidence ?? 0.8}). No clip needed: it inherits every Love Bird body animation.`)
    else {
      const hasIdle = r.animations.length > 0
      add(hasIdle ? 'WARN' : 'FAIL', `Not a supported humanoid (${conv}; confidence ${cls.confidence.toFixed(2)}${missingRoles.length ? `; missing ${missingRoles.join(', ')}` : ''}). ${hasIdle ? 'It has clips: map one to Idle on the Movement page.' : 'Bring at least one animation clip and map it to Idle on the Movement page.'}`)
    }
    if (conv === 'metahuman/mannequin') add(mhMissing.length ? 'WARN' : 'PASS', mhMissing.length ? `MetaHuman-named rig without ${mhMissing.join(', ')}. Upload still works through the humanoid retarget; the shared body animations for a MetaHuman-named body need the full 26-bone chain.` : 'All 26 MetaHuman pre-check bones present.')
  }

  const bs = spec.blendshapes || {}
  const have = new Map(r.morphTargets.map(n => [normShape(n), n]))
  if (r.morphTargets.length) {
    const reqBlink = bs.blink?.required || [], reqMouth = bs.mouth?.required || []
    const core = bs.emotion?.requiredCore || []
    const miss = [...reqBlink, ...reqMouth].filter(n => !have.has(normShape(n)))
    const aliases = Object.fromEntries(Object.entries(bs.emotion?.aliases || {}).map(([a, c]) => [normShape(a), normShape(c)]))
    const haveEmo = new Set([...have.keys()].filter(k => k.startsWith('emo')).map(k => aliases[k] || k))
    const missCore = core.filter(n => !haveEmo.has(normShape(n)))
    const official = new Set([...core, ...(bs.emotion?.optional || [])].map(normShape))
    const custom = r.morphTargets.filter(n => /^emo[_ .-]?/i.test(n) && !official.has(aliases[normShape(n)] || normShape(n)))
    const dupes = r.morphTargets.length - have.size
    const level = !miss.length && !missCore.length ? 'FULL' : 'PARTIAL'
    add(level === 'FULL' ? 'PASS' : 'WARN', `Face level ${level}: ${r.morphTargets.length} shapes${miss.length ? `; missing blink/mouth ${miss.join(', ')}` : ''}${missCore.length ? `; missing ${missCore.length} core emotions (${missCore.slice(0, 6).join(', ')}${missCore.length > 6 ? ', ...' : ''}) which show a neutral face` : ''}`)
    if (custom.length) add('PASS', `Custom emotions kept (never block): ${custom.join(', ')}`)
    if (dupes > 0) add('WARN', `${dupes} shape name(s) collide after normalisation; the first one is used.`)
    if (r.morphTargets.some(n => n.startsWith('(unnamed'))) add('FAIL', 'Morph targets without names. In Blender, export with Shape Keys on so names travel in mesh.extras.targetNames.')
  } else add('WARN', 'No face shapes (level NONE). The body uploads; the face will not emote or lip-sync.')

  const names = r.animations.map(a => a.name)
  if (names.length) {
    const emoClips = names.filter(n => /_(Idle|Talking|Talk)$/i.test(n))
    add('PASS', `${names.length} clip(s)${emoClips.length ? `; emotion-named: ${emoClips.slice(0, 10).join(', ')}` : ''}`)
    if (!names.some(n => /idle/i.test(n))) add('WARN', 'No clip has "Idle" in its name. Name your standing loop Neutral_Idle (or map it to Idle on the Movement page).')
    const drift = r.animations.filter(a => /idle/i.test(a.name) && a.rootMotionCandidate)
    if (drift.length) add('WARN', `Idle clip(s) travel more than 0.05 units on the root/hips: ${drift.map(a => `${a.name} (${a.rootTravel})`).join(', ')}. The character will drift while standing; remove root translation from idles.`)
  }
  return { checks: out, convention: conv, humanoidMapping: cls.mapping, humanoidConfidence: cls.confidence, supportedHumanoid: cls.supportedHumanoid, missingRoles }
}

let parsed, bytes
try { bytes = statSync(file).size; parsed = parse(file) } catch (e) { console.error(`Could not read ${file}: ${e.message}`); process.exit(2) }
const { spec, source } = await loadSpec()
const report = inspect(parsed)
const verdict = judge(report, spec, bytes)
const result = { file, bytes, spec: { version: spec.version, source }, banner: spec.banner || null, ...report, ...verdict }
if (asJson) console.log(JSON.stringify(result, null, 2))
else {
  console.log(`glb-check  ${file}`)
  console.log(`spec ${spec.version} (${source})${spec.banner ? `\nBANNER: ${spec.banner}` : ''}`)
  console.log(`meshes ${report.meshes} · triangles ${report.renderedTriangles} · materials ${report.materials} · textures ${report.textures.length} · bones ${report.bones} · morphs ${report.morphTargets.length} · clips ${report.animations.length}`)
  if (report.morphTargets.length) console.log(`morph targets: ${report.morphTargets.slice(0, 80).join(', ')}${report.morphTargets.length > 80 ? ' ...' : ''}`)
  if (report.animations.length) console.log(`clips: ${report.animations.map(a => a.name).join(', ')}`)
  if (report.bones) console.log(`skeleton: ${verdict.convention}; first bones: ${report.boneNames.slice(0, 12).join(', ')}`)
  for (const c of verdict.checks) console.log(`${c.level.padEnd(4)}  ${c.msg}`)
  const issues = (spec.knownIssues || []).filter(k => ['import', 'skill'].includes(k.surface))
  if (issues.length) console.log(`known issues: ${issues.map(k => `[${k.id}] ${k.symptom} -> ${k.workaround}`).join(' | ')}`)
}
process.exit(verdict.checks.some(c => c.level === 'FAIL') ? 1 : 0)
