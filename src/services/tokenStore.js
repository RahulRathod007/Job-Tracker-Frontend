/**
 * Token Store
 *
 * Access token  → stored IN MEMORY only (module-level variable).
 *                 Never written to localStorage. Cleared on page refresh.
 *
 * Refresh token → stored in localStorage.
 *                 Used ONLY to silently get a new access token on page load or 401.
 */

const REFRESH_KEY = 'jp_rt'

// ── Access token (in-memory) ──────────────────────────────────────
let _accessToken = null

export const setAccessToken   = (t) => { _accessToken = t }
export const getAccessToken   = ()  => _accessToken
export const clearAccessToken = ()  => { _accessToken = null }

// ── Refresh token (localStorage) ─────────────────────────────────
export const setRefreshToken  = (t) => {
  if (t) localStorage.setItem(REFRESH_KEY, t)
  else   localStorage.removeItem(REFRESH_KEY)
}
export const getRefreshToken  = ()  => localStorage.getItem(REFRESH_KEY)
export const clearRefreshToken= ()  => localStorage.removeItem(REFRESH_KEY)

// ── Combined ──────────────────────────────────────────────────────
export const storeTokens = ({ accessToken, refreshToken }) => {
  setAccessToken(accessToken)
  setRefreshToken(refreshToken)
}

export const clearTokens = () => {
  clearAccessToken()
  clearRefreshToken()
}