/**
 * API endpoints and request helpers for MoeStickersBot WebApp.
 */

import axios from 'axios';

const BASE = '/webapp/api';

/**
 * Get the current Telegram user ID and query ID.
 */
export function getTelegramIds() {
  const initData = window.Telegram.WebApp.initDataUnsafe;
  return {
    uid: initData.user.id,
    qid: initData.query_id,
  };
}

/**
 * Validate initData with the backend.
 * @param {string} queryString - Current URL query string
 * @param {string} route - Current route path
 * @returns {Promise<boolean>}
 */
export async function validateInitData(queryString, route) {
  const qstring = queryString ? queryString + '&' : '?';
  const res = await axios.post(
    `${BASE}/initData${qstring}cmd=${route}`,
    new URLSearchParams(window.Telegram.WebApp.initData)
  );
  return res.status >= 200 && res.status < 300;
}

/**
 * Fetch sticker set for editing.
 * @param {number} uid - User ID
 * @param {string} queryId - Telegram query ID
 * @returns {Promise<{ss: Array}>}
 */
export async function fetchStickersForEdit(uid, queryId) {
  return axios.get(`${BASE}/ss?uid=${uid}&qid=${queryId}&cmd=edit`);
}

/**
 * Fetch sticker set for export/preview.
 * @param {number} uid - User ID
 * @param {string} queryId - Telegram query ID
 * @param {string} sn - Sticker set name
 * @param {string} hex - Verification hex
 * @returns {Promise<{ss: Array}>}
 */
export async function fetchStickersForExport(uid, queryId, sn, hex) {
  return axios.get(`${BASE}/ss?sn=${sn}&uid=${uid}&qid=${queryId}&hex=${hex}&cmd=export`);
}

/**
 * Submit reordered sticker list after editing.
 * @param {number} uid - User ID
 * @param {string} queryId - Telegram query ID
 * @param {Array} resultArray - Reordered sticker array
 * @returns {Promise<void>}
 */
export async function submitEditResult(uid, queryId, resultArray) {
  return axios.post(
    `${BASE}/edit/result?uid=${uid}&qid=${queryId}`,
    JSON.stringify(resultArray)
  );
}

/**
 * Submit a drag-and-drop index change to the backend.
 * @param {number} uid - User ID
 * @param {string} queryId - Telegram query ID
 * @param {number} oldIndex - Original position
 * @param {number} newIndex - New position
 * @returns {Promise<void>}
 */
export async function submitIndexChange(uid, queryId, oldIndex, newIndex) {
  const form = new FormData();
  form.append('oldIndex', oldIndex);
  form.append('newIndex', newIndex);
  return axios.post(`${BASE}/edit/move?uid=${uid}&qid=${queryId}`, form);
}
