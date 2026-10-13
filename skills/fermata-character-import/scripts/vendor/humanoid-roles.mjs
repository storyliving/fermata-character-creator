// Humanoid role classifier used by the Fermata importer. Same rules the site applies.
// Pure function: bone names in, role map and confidence out.
// Keep policy in humanoid-roles.json; this module only evaluates that data.
import { readFileSync } from 'node:fs'
const ROLE_TABLE = JSON.parse(readFileSync(new URL('./humanoid-roles.json', import.meta.url), 'utf8'))

export { ROLE_TABLE }
export const ROLE_TABLE_SHA256 = '486b3edb0096ef831ac08354de709ee1b8321a30eee69b61ebd7dca523128aab'

const REQUIRED = new Set(ROLE_TABLE.requiredRoles)
const EXCLUDED = new Set(ROLE_TABLE.excludedTokens)
const SIDED_PARTS = new Set(ROLE_TABLE.roles.filter(role => /_[lr]$/.test(role)).map(role => role.replace(/_[lr]$/, '')))

/** Runtime tokenization: last namespace/path component, camel/digit boundaries, non-alphanumeric separators. */
export function humanoidTokens(name) {
  let value = String(name || '')
  value = value.slice(value.lastIndexOf(':') + 1)
  value = value.slice(value.lastIndexOf('|') + 1)
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/(\d)(\D)|([A-Za-z])(\d)/g, match => match.split('').join(' '))
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
}

function matchesRule(tokens, rule) {
  const has = token => tokens.includes(token)
  return !!(
    rule.anyToken?.some(has)
    || rule.allTokensAny?.some(group => group.every(has))
    || rule.anyTokenStartsWith?.some(prefix => tokens.some(token => token.startsWith(prefix)))
    || rule.allTokens?.every(has) && !rule.noneTokens?.some(has)
  )
}

function conventionOf(names) {
  const lower = names.map(name => String(name || '').toLowerCase())
  if (lower.some(name => name.includes('mixamorig'))) return 'mixamo'
  if (lower.some(name => name.includes('j_bip'))) return 'vrm/vroid'
  if (lower.some(name => name.includes('cc_base'))) return 'cc/iclone'
  if (lower.some(name => name.startsWith('def-') || name.startsWith('org-') || name.startsWith('def_'))) return 'rigify'
  if (lower.some(name => name.includes('bip001'))) return '3dsmax-biped'
  if (lower.some(name => name === 'upperarm_l' || name === 'thigh_l')) return 'metahuman/mannequin'
  if (lower.some(name => (name.startsWith('left') || name.startsWith('right')) && name.includes('upperleg'))) return 'unity-humanoid'
  if (lower.some(name => name.includes('upleg'))) return 'mixamo-like (rpm/meshy/tripo)'
  return 'generic'
}

/** Classify [{name,parent}] with the runtime dictionary, hierarchy and confidence contract. */
export function classifyHumanoidRoles(rawNodes = []) {
  const nodes = rawNodes.map((node, index) => ({
    index,
    name: String(node?.original || node?.name || ''),
    key: String(node?.name || node?.original || ''),
    parent: node?.parent == null ? null : String(node.parent),
  }))
  const byKey = new Map(nodes.map(node => [node.key, node]))
  const depthOf = node => {
    let depth = 0, current = node, guard = new Set([node])
    while (current?.parent && byKey.has(current.parent)) {
      current = byKey.get(current.parent)
      if (guard.has(current)) break
      guard.add(current); depth += 1
    }
    return depth
  }
  const isAncestor = (ancestor, child) => {
    if (!ancestor || !child || ancestor === child) return false
    let current = child, guard = new Set([child])
    while (current?.parent && byKey.has(current.parent)) {
      current = byKey.get(current.parent)
      if (current === ancestor) return true
      if (guard.has(current)) break
      guard.add(current)
    }
    return false
  }

  const candidates = []
  for (const node of nodes) {
    const tokens = humanoidTokens(node.name)
    if (!tokens.length || tokens.some(token => EXCLUDED.has(token))) continue
    const rule = ROLE_TABLE.partRules.find(entry => matchesRule(tokens, entry))
    if (!rule) continue
    let role = rule.part
    if (SIDED_PARTS.has(rule.part)) {
      const side = ROLE_TABLE.side.left.some(token => tokens.includes(token)) ? 'l'
        : ROLE_TABLE.side.right.some(token => tokens.includes(token)) ? 'r' : ''
      if (!side) continue
      role += `_${side}`
    }
    candidates.push({ role, part: rule.part, node, depth: depthOf(node), confidence: Number(rule.conf) || 0 })
  }

  const mapped = new Map()
  const assign = (role, candidate) => { if (candidate) mapped.set(role, candidate) }
  const shallowest = role => candidates.filter(candidate => candidate.role === role).sort((a, b) => a.depth - b.depth || a.node.index - b.node.index)[0]
  for (const role of ROLE_TABLE.roles) {
    if (role === 'pelvis' || role.startsWith('spine_')) continue
    assign(role, shallowest(role))
  }

  const pelvisCandidates = candidates.filter(candidate => candidate.role === 'pelvis')
  const leftThighs = candidates.filter(candidate => candidate.role === 'thigh_l')
  const rightThighs = candidates.filter(candidate => candidate.role === 'thigh_r')
  const sharedPelvis = pelvisCandidates
    .filter(pelvis => leftThighs.some(thigh => isAncestor(pelvis.node, thigh.node)) && rightThighs.some(thigh => isAncestor(pelvis.node, thigh.node)))
    .sort((a, b) => b.depth - a.depth || a.node.index - b.node.index)[0]
  assign('pelvis', sharedPelvis || pelvisCandidates.sort((a, b) => a.depth - b.depth || a.node.index - b.node.index)[0])

  const pelvis = mapped.get('pelvis')?.node
  const chainTarget = mapped.get('neck')?.node || mapped.get('head')?.node
  const spine = candidates.filter(candidate => candidate.part === 'spine'
    && (!pelvis || isAncestor(pelvis, candidate.node))
    && (!chainTarget || isAncestor(candidate.node, chainTarget)))
    .sort((a, b) => a.depth - b.depth || a.node.index - b.node.index)
  if (spine.length === 1) assign('spine_mid', spine[0])
  if (spine.length >= 2) { assign('spine_lo', spine[0]); assign('spine_hi', spine.at(-1)) }
  if (spine.length >= 3) assign('spine_mid', spine[Math.floor(spine.length / 2)])

  if (pelvis) for (const role of ['thigh_l', 'thigh_r', 'head', 'upperarm_l', 'upperarm_r']) {
    const candidate = mapped.get(role)
    if (candidate && !isAncestor(pelvis, candidate.node)) mapped.delete(role)
  }

  const mapping = {}, roleConfidence = {}
  for (const role of ROLE_TABLE.roles) {
    const candidate = mapped.get(role)
    if (!candidate) continue
    mapping[role] = candidate.node.name
    roleConfidence[role] = candidate.confidence
  }
  const missingRoles = ROLE_TABLE.requiredRoles.filter(role => !mapping[role])
  const allRequired = missingRoles.length === 0
  let earned = 0, possible = 0
  for (const role of ROLE_TABLE.roles) {
    const weight = REQUIRED.has(role) ? ROLE_TABLE.confidence.weightRequired : ROLE_TABLE.confidence.weightOptional
    possible += weight
    earned += weight * (roleConfidence[role] || 0)
  }
  const confidence = possible ? earned / possible : 0
  const method = Object.keys(mapping).length ? 'dictionary' : 'none'
  return {
    schema: ROLE_TABLE.schema,
    method,
    mapping,
    roleConfidence,
    missingRoles,
    allRequired,
    confidence,
    supportedHumanoid: method === 'dictionary' && allRequired && confidence >= ROLE_TABLE.acceptance.minConfidence,
    convention: conventionOf(nodes.map(node => node.name)),
    sourceSha256: ROLE_TABLE_SHA256,
  }
}
