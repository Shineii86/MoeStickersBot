/**
 * Sticker component - displays a single sticker image with emoji input.
 */

import React, { forwardRef } from 'react';
import Img from 'react-cool-img';
import loadingGif from '../../assets/loading.gif';
import '../../styles/sticker.css';
import { STICKER_SIZE, IMAGE_RETRY_COUNT, IMAGE_RETRY_DELAY } from '../../constants';

export const Sticker = forwardRef(
  ({ id, faded, style, emoji, surl, onEmojiChange, ...props }, ref) => {
    return (
      <div className="Sticker-Div" ref={ref} style={style} {...props}>
        <Img
          src={surl}
          placeholder={loadingGif}
          alt="Sticker"
          width={STICKER_SIZE}
          height={STICKER_SIZE}
          retry={{ count: IMAGE_RETRY_COUNT, delay: IMAGE_RETRY_DELAY, acc: false }}
        />
        <br />
        <div>
          <label>{id}</label>
          {onEmojiChange && (
            <input
              type="text"
              value={emoji}
              size="6"
              onChange={(e) => onEmojiChange(id, e.target.value)}
              aria-label={`Emoji for sticker ${id}`}
            />
          )}
        </div>
      </div>
    );
  }
);

Sticker.displayName = 'Sticker';
