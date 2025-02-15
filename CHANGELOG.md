# Changelog

All notable changes to this project will be documented in this file.

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
