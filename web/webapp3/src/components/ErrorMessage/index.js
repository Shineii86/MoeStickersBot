/**
 * ErrorMessage - displays a localized error message for invalid WebApp access.
 */

import React from 'react';

export function ErrorMessage({ message, messageCn, secondary }) {
  return (
    <div className="App">
      <h2>{message}</h2>
      {secondary && (
        <>
          <br />
          <h2>{secondary}</h2>
        </>
      )}
      {messageCn && (
        <>
          <br />
          <h2>{messageCn}</h2>
        </>
      )}
    </div>
  );
}
