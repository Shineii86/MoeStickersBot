/**
 * React hook for Telegram WebApp initialization.
 * Handles initData validation and platform-specific setup.
 */

import { useState, useEffect } from 'react';
import { validateInitData } from '../api/stickerApi';

/**
 * Custom hook that validates Telegram WebApp initData on mount.
 * @param {string} route - Current route path (e.g., '/webapp/edit')
 * @returns {{ isReady: boolean|null, isValid: boolean }}
 *   isReady: null = loading, true = ready, false = error
 *   isValid: whether initData was accepted by backend
 */
export function useTelegramInit(route) {
  const [isReady, setIsReady] = useState(null);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const queryString = window.location.search;
    validateInitData(queryString, route)
      .then(() => {
        setIsValid(true);
        setIsReady(true);
        window.Telegram.WebApp.ready();
      })
      .catch(() => {
        setIsValid(false);
        setIsReady(true);
      });
  }, [route]);

  return { isReady, isValid };
}

/**
 * Get Telegram WebApp platform (ios, android, web, etc.)
 */
export function getPlatform() {
  return window.Telegram.WebApp.platform;
}

/**
 * Trigger haptic feedback.
 * @param {'light'|'medium'|'heavy'|'rigid'|'soft'} type - Impact type
 */
export function hapticFeedback(type = 'medium') {
  window.Telegram.WebApp.HapticFeedback.impactOccurred(type);
}
