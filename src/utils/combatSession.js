/**
 * Combat session state (which round/turn the fight is on) that survives page
 * refreshes. Kept separate from the monster list so it can be normalized and
 * migrated independently.
 */

export const DEFAULT_COMBAT_SESSION = {
  isCombatActive: false,
  hasCombatStarted: false,
  currentRound: 1,
  currentMonsterIndex: 0,
}

/**
 * Normalizes a (possibly missing or corrupted) combat session and clamps the
 * current turn index so it always points at a valid position in the current
 * monster list. Handles the case where a monster was removed while the page was
 * closed, which would otherwise leave a stale out-of-range index.
 *
 * @param {*} raw Restored or imported session data.
 * @param {number} monsterCount Amount of monsters currently in combat.
 * @returns {{isCombatActive: boolean, hasCombatStarted: boolean, currentRound: number, currentMonsterIndex: number}}
 */
export const normalizeCombatSession = (raw, monsterCount = 0) => {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}

  const currentRound =
    Number.isInteger(source.currentRound) && source.currentRound > 0 ? source.currentRound : 1

  let currentMonsterIndex =
    Number.isInteger(source.currentMonsterIndex) && source.currentMonsterIndex >= 0
      ? source.currentMonsterIndex
      : 0
  const maxIndex = Math.max(0, monsterCount - 1)
  if (currentMonsterIndex > maxIndex) currentMonsterIndex = maxIndex

  return {
    isCombatActive: Boolean(source.isCombatActive),
    hasCombatStarted: Boolean(source.hasCombatStarted),
    currentRound,
    currentMonsterIndex,
  }
}
