/**
 * StickerGrid - responsive grid layout for sticker display.
 */

import React from 'react';
import { GRID_COLUMNS } from '../../constants';

export function StickerGrid({ children, columns = GRID_COLUMNS }) {
  return (
    <ul
      style={{
        maxWidth: '800px',
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridGap: 10,
        padding: 10,
      }}
    >
      {children}
    </ul>
  );
}
