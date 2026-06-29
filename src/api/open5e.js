const BASE_URL = 'https://api.open5e.com/v2'

/**
 * GET request to Open5e API v2
 * @param {string} path - API path (e.g. '/creatures/')
 * @param {object} params - Query parameters
 * @returns {Promise<object>} Parsed JSON response
 */
export const getOpen5e = async (path, params = {}) => {
  const url = new URL(`${BASE_URL}${path}`)
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') url.searchParams.set(k, v)
  })
  const response = await fetch(url.toString())
  if (!response.ok) throw new Error(`Open5e API error: ${response.status}`)
  return response.json()
}
