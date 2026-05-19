# WebApp for MoeStickersBot

Interactive Telegram WebApp for managing sticker sets — reorder stickers via drag-and-drop, edit emojis, and export to external apps.

Supports dark mode via Telegram theme variables.

## Project Structure

```
src/
├── api/                  # API request helpers
│   ├── index.js          # Re-exports
│   └── stickerApi.js     # Axios-based API calls
├── assets/               # Static assets (images, icons)
│   └── loading.gif
├── components/           # Reusable UI components
│   ├── ErrorMessage/     # Localized error display
│   ├── Sticker/          # Sticker + SortableSticker
│   │   ├── index.js
│   │   └── SortableSticker.js
│   └── StickerGrid/      # Grid layout container
├── constants/            # App-wide constants
│   └── index.js
├── hooks/                # Custom React hooks
│   ├── index.js
│   └── useTelegramInit.js
├── pages/                # Route-level page components
│   ├── Edit/             # Sticker reordering + emoji editing
│   └── Export/           # Sticker preview + export
├── styles/               # Global and component CSS
│   ├── global.css
│   └── sticker.css
├── utils/                # Utility functions
│   └── index.js
├── App.js                # Root component + routing
└── index.js              # Entry point
```

## Build

```bash
REACT_APP_HOST=your_website npm run build
```

## Tech Stack

- **React 18** with React Router v6
- **@dnd-kit** for drag-and-drop reordering
- **Axios** for HTTP requests
- **react-cool-img** for lazy image loading with retry

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/webapp/edit` | Edit | Reorder stickers and edit emoji assignments |
| `/webapp/export` | Export | Preview sticker set and export to Msb App |
