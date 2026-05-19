/**
 * Export page - preview sticker set and export to external app.
 */

import React, { useEffect, useState } from 'react';
import { StickerGrid } from '../components/StickerGrid';
import { SortableSticker } from '../components/Sticker/SortableSticker';
import { fetchStickersForExport, getTelegramIds } from '../api/stickerApi';
import { getPlatform } from '../hooks/useTelegramInit';
import { GRID_COLUMNS, APP_HOST } from '../constants';

function Export() {
  const [ss, setSS] = useState([]);
  const { uid, qid } = getTelegramIds();

  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });

  const exportLinkHttps = `https://${APP_HOST}/webapp/api/export?dn=${APP_HOST}&sn=${params.sn}&qid=${qid}&hex=${params.hex}`;
  const exportLinkMsb = `msb://app/export/${params.sn}/?dn=${APP_HOST}&qid=${qid}&hex=${params.hex}`;
  const platform = getPlatform();

  useEffect(() => {
    fetchStickersForExport(uid, qid, params.sn, params.hex)
      .then((res) => setSS(res.data.ss))
      .catch(() => {});

    // Android does not support opening custom scheme or https links
    // from MainButton, so we render buttons in-page instead.
    if (platform !== 'android') {
      window.Telegram.WebApp.MainButton.setText('Export/匯出').show().onClick(() => {
        window.open(exportLinkMsb);
      });
    }
  }, []);

  const showExportButton = platform !== 'ios';

  return (
    <div>
      {showExportButton && (
        <button onClick={() => window.location.replace(exportLinkHttps)}>
          Export/匯出
        </button>
      )}
      <br />
      <h3>Preview 預覽:</h3>
      <StickerGrid columns={GRID_COLUMNS}>
        {ss.map((item) => (
          <SortableSticker
            key={item.id}
            id={item.id}
            emoji={item.emoji}
            surl={item.surl}
          />
        ))}
      </StickerGrid>
      <br />
      {showExportButton && (
        <button onClick={() => window.location.replace(exportLinkHttps)}>
          Export/匯出
        </button>
      )}
    </div>
  );
}

export default Export;
