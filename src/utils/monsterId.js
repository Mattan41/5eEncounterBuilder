import { formatCR } from './formatCR.js'

/**
 * Converts a monster name into a stable, url-friendly slug.
 * @param {string} value
 * @returns {string}
 */
export const slugify = (value = '') =>
  String(value)
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim()

/**
 * A monster is considered custom when it is explicitly flagged as such or
 * carries no Open5e key/slug.
 * @param {object} monster
 * @returns {boolean}
 */
export const isCustomMonster = (monster = {}) =>
  Boolean(monster.isCustom || monster.source === 'custom' || (!monster.key && !monster.slug))

/**
 * Canonical identity strategy used everywhere a monster needs to be matched.
 * API monsters are identified by their Open5e key, custom monsters by name.
 * @param {object} monster
 * @returns {string}
 */
export const resolveMonsterId = (monster = {}) => {
  if (isCustomMonster(monster)) {
    return `custom:${slugify(monster.name || monster.label || 'unknown')}`
  }

  const apiKey = monster.key || monster.slug
  if (apiKey) return `open5e:${apiKey}`

  const cr = monster.challenge_rating ?? monster.challengeRating ?? 0
  return `name:${slugify(monster.name || monster.label || 'unknown')}|cr:${cr}`
}

/**
 * Normalizes a stored/API monster into the shape used by the UI and the store.
 * Safe to call repeatedly (idempotent).
 * @param {object} monster
 * @returns {object}
 */
export const normalizeMonster = (monster = {}) => {
  const custom = isCustomMonster(monster)
  const name = monster.name || monster.label || 'Unknown'
  const type = typeof monster.type === 'object' ? monster.type?.name || '' : monster.type || ''
  const crValue = monster.challenge_rating ?? monster.challengeRating ?? 0
  const crFloat = parseFloat(crValue) || 0
  const hitPoints = monster.hit_points ?? monster.hitPoints ?? 0
  const armorClass = monster.armor_class ?? monster.armorClass ?? 0

  const normalized = {
    ...monster,
    slug: monster.slug || monster.key || (custom ? slugify(name) : undefined),
    key: monster.key,
    label: name,
    type,
    challenge_rating: crFloat,
    challengeRating: crFloat,
    challengeRatingDisplay: monster.challengeRatingDisplay || formatCR(crFloat),
    hit_points: hitPoints,
    hitPoints,
    originalHitPoints: monster.originalHitPoints ?? hitPoints,
    armor_class: armorClass,
    armorClass,
    source: custom ? 'custom' : monster.source || 'open5e',
  }

  if (custom) normalized.isCustom = true
  normalized.id = resolveMonsterId(normalized)

  return normalized
}

let combatIdCounter = 0

/**
 * Generates a unique combat entry id that cannot collide with ids created in a
 * previous session (unlike the old Date.now() value).
 * @returns {string}
 */
export const nextCombatId = () => {
  combatIdCounter += 1
  const random = Math.random().toString(36).slice(2, 8)
  return `combat-${Date.now().toString(36)}-${combatIdCounter.toString(36)}-${random}`
}

/**
 * Normalizes a monster for use inside the combat list, ensuring it has a
 * unique combatId, initiative state and an original hit point value.
 * @param {object} monster
 * @returns {object}
 */
export const normalizeCombatMonster = (monster = {}) => {
  const normalized = normalizeMonster(monster)

  return {
    ...normalized,
    combatId: monster.combatId ?? nextCombatId(),
    initiative: monster.initiative ?? 0,
    done: monster.done ?? false,
    originalHitPoints: monster.originalHitPoints ?? normalized.hitPoints,
  }
}
