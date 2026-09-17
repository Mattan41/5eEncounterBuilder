/**
 * Formats a challenge rating value for display (0.125 -> "1/8", 1.0 -> "1").
 * @param {number|string} cr
 * @returns {string}
 */
export const formatCR = (cr) => {
  const n = parseFloat(cr) || 0
  if (n === 0.125) return '1/8'
  if (n === 0.25) return '1/4'
  if (n === 0.5) return '1/2'

  // Remove unnecessary decimals (e.g. 1.0 becomes 1)
  return n.toString()
}

/**
 * Converts a fraction CR string (e.g. "1/4") to its decimal string for the API.
 * @param {string} cr
 * @returns {string}
 */
export const crToDecimal = (cr) => {
  if (cr === '1/8') return '0.125'
  if (cr === '1/4') return '0.25'
  if (cr === '1/2') return '0.5'
  return cr
}
