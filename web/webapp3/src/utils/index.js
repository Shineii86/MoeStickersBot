/**
 * Utility functions for MoeStickersBot WebApp.
 */

/**
 * Compute SHA-256 hash of a string.
 * @param {string} string - Input string
 * @returns {Promise<string>} Hex-encoded hash
 */
export async function sha256sum(string) {
  const utf8 = new TextEncoder().encode(string);
  const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
