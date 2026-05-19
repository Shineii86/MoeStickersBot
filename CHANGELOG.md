## [1.0.7] - 2026-05-20

### Fixed
- Fixed "file is too big (400)" error when importing Kakao stickers to Telegram
- `convertKakaoStatic()` now uses lossy WebP compression with quality fallback (90→50) instead of lossless-only, ensuring files stay within Telegram's 512KB static sticker limit
- `IMToWebpTGStatic()` now validates against 512KB limit and applies progressive lossy compression fallback instead of a single lossless re-encode
- Both functions log compression quality and final file size for debugging

## [1.0.6] - 2025-02-15

### Fixed
- Fixed Kakao sticker dimension error (STICKER_PNG_DIMENSIONS)
- All Kakao stickers now properly converted to 512x512 WebP before upload
- Fixed double extension issue (.png.webp → .webp)
- Fixed file rename bug in magic bytes detection
- Cleaned up conversion flow for Kakao stickers

## [1.0.5] - 2025-02-15

### Fixed
- Fixed Telegram "invalid sticker set name" error for Kakao stickers
- Sanitize sticker set ID to remove invalid characters (`=`, `+`, etc.)
- Only Latin letters, digits, and underscores allowed in Telegram sticker set names

## [1.0.4] - 2025-02-15

### Fixed
- Fixed Kakao sticker import: updated API endpoint from `/api/v1/items/t/` to `/api/items/`
- Added support for new Kakao API response format (hero/contents/items structure)
- Fixed share link slug extraction to strip query parameters
- Added animated sticker detection for Kakao (WebP, GIF, WebM formats)
- Added proper file type detection from magic bytes
- Added animated sticker conversion (GIF→WebP, WebM→WebP via ffmpeg)
- Replaced broken `fetchKakaoDetailsFromShareLink` with `resolveKakaoShareLink`
- Added fallback from new API to legacy API for older sticker packs

# Changelog

All notable changes to this project will be documented in this file.

## [1.0.3] - 2025-02-15

### Added
- TERMUX.md: Complete guide for deploying on Android via Termux (free, 24/7)
- Added Termux deployment section to README.md

## [1.0.2] - 2025-02-15

### Changed
- Updated Telegram bot handle from `moe_sticker_bot` to `MoeStickersBot`
- Updated all bot references in README.md, core/message.go, core/define.go, test/tg_links.json
- Fixed go.sum checksums for Shineii86/telebot/v3
- Created v3.99.9 tag on Shineii86/telebot

## [1.0.1] - 2025-02-15

### Changed
- Renamed `cmd/moe-sticker-bot/` directory to `cmd/MoeStickersBot/`
- Updated all build commands to use new cmd path
- Updated go.sum checksums for Shineii86/telebot
- Updated all workflow scripts to use MoeStickersBot naming
- Updated pkg/msbimport/README.md to reference MoeStickersBot
- Updated web/webapp3/README.md to reference MoeStickersBot
- Full diagnostic sweep: zero `star-39` references remaining

## [1.0.0] - 2025-02-15

### Added
- Initial release of MoeStickersBot
- Import LINE/KakaoTalk stickers to Telegram
- Create and manage Telegram sticker sets with custom images/videos
- Mixed-format sticker set support (animated + static)
- Batch download and convert Telegram stickers/GIFs
- Export Telegram stickers to WhatsApp via Msb App
- Interactive WebApp for sticker set management (add/move/remove/edit)
- CLI tool `msbimport` for downloading LINE/KakaoTalk stickers
- MariaDB database support (optional)
- Nginx WebApp deployment support
- Kubernetes deployment example
- OCI container builds (amd64 + aarch64)

### Changed
- Renamed project from `moe-sticker-bot` to `MoeStickersBot`
- Updated all repository references to `Shineii86/MoeStickersBot`
- Updated Go module path to `github.com/Shineii86/MoeStickersBot`
- Updated companion app references to `Shineii86/msb_app`
- Updated telebot fork reference to `Shineii86/telebot`
- Updated CI/CD container registry to `ghcr.io/Shineii86`
