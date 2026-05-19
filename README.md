<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&height=300&color=gradient&text=𝗠𝗼𝗲%20𝗦𝘁𝗶𝗰𝗸𝗲𝗿𝘀%20𝗕𝗼𝘁&fontAlignY=30&fontSize=90&desc=𝖳𝖾𝗅𝖾𝗀𝗋𝖺𝗆%20𝖲𝗍𝗂𝖼𝗄𝖾𝗋%20𝖡𝗈𝗍&descSize=30" />

[![GitHub Stars](https://img.shields.io/github/stars/Shineii86/MoeStickersBot?style=for-the-badge&color=FFB6C1)](https://github.com/Shineii86/MoeStickersBot/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/Shineii86/MoeStickersBot?style=for-the-badge&color=FF6B9D)](https://github.com/Shineii86/MoeStickersBot/fork)
[![GitHub issues](https://img.shields.io/github/issues/Shineii86/MoeStickersBot?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Shineii86/MoeStickersBot/issues)
[![GitHub last commit](https://img.shields.io/github/last-commit/Shineii86/MoeStickersBot?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Shineii86/MoeStickersBot/commits/master)
[![GitHub repo size](https://img.shields.io/github/repo-size/Shineii86/MoeStickersBot?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Shineii86/MoeStickersBot)

> **Forked from [star-39/moe-sticker-bot](https://github.com/star-39/moe-sticker-bot)** — the original Moe Sticker Bot project by Star-39.

**Use [MoeStickersBot](https://t.me/MoeStickersBot), a Telegram bot, to easily import or download LINE/Kakaotalk/Telegram stickers, use your own image or video to create Telegram sticker set or CustomEmoji and manage it.**

</div>

---

## ✨ Features

- Import **LINE** or **KakaoTalk** stickers to Telegram with animated support
- Create your own sticker set or CustomEmoji with images/videos in any format
- Support mixed-format sticker sets (animated + static in the same set)
- Batch download and convert Telegram stickers or GIFs
- Manage sticker sets interactively
- CLI tool `msbimport` for downloading LINE/KakaoTalk stickers

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/Shineii86/MoeStickersBot.git
cd MoeStickersBot

# Build
go build -o MoeStickersBot ./cmd/MoeStickersBot/

# Run
./MoeStickersBot --bot_token YOUR_BOT_TOKEN
```

### Dependencies

| Binary | Purpose |
|---|---|
| `ffmpeg` | Video/animated sticker conversion |
| `convert` (ImageMagick) | Image format conversion |
| `bsdtar` (libarchive-tools) | Archive extraction |
| `gifsicle` | GIF optimization |
| `exiv2` | EXIF metadata |

```bash
# Ubuntu/Debian
apt install ffmpeg imagemagick libarchive-tools gifsicle exiv2
```

---

## 📖 Commands

| Command | Description |
|---|---|
| `/start` | Start the bot |
| `/import` | Import LINE/Kakao stickers |
| `/download` | Download Telegram stickers |
| `/create` | Create a new sticker set |
| `/manage` | Manage your sticker sets |
| `/search` | Search imported sticker sets |
| `/help` | Show help |
| `/about` | About the bot |
| `/changelog` | View changelog |
| `/privacy` | Privacy policy |

---

## 🤝 Contributing

Contributions are welcome!

<table>
<tr>
<td width="33%" align="center">

### 🐛 Report Bugs
[Open an Issue](https://github.com/Shineii86/MoeStickersBot/issues)

</td>
<td width="33%" align="center">

### 💡 Suggest Features
[Start a Discussion](https://github.com/Shineii86/MoeStickersBot/issues)

</td>
<td width="33%" align="center">

### 🔀 Submit PRs
[Fork & Submit](https://github.com/Shineii86/MoeStickersBot/fork)

</td>
</tr>
</table>

---

## 📜 License

This project is licensed under the **GPL-3.0 License**. See [LICENSE](LICENSE) for details.

---

## 💕 Credits & Acknowledgments

### 🌟 Original Project

This project is a fork of **[moe-sticker-bot](https://github.com/star-39/moe-sticker-bot)** by **[Star-39](https://github.com/star-39)**. All core architecture and original features come from their incredible work. Please star the original repo!

### 🔧 Fork Maintainer

Maintained and enhanced by **[Shinei Nouzen](https://github.com/Shineii86)**.

### Recent Improvements (v1.0.8)

- Animated Kakao sticker import (animated WebP → WebM pipeline)
- Pure-Go animated WebP detection (no ImageMagick dependency)
- SQL injection fix in sticker search
- Bot token no longer leaked in logs
- Safe mode re-encoding fix for `STICKER_VIDEO_LONG` errors
- Cross-platform binary path handling (`convert` → `CONVERT_BIN`)

---

<div align="center">

[![Telegram Badge](https://img.shields.io/badge/-Telegram-2CA5E0?style=for-the-badge&logo=Telegram&logoColor=white)](https://telegram.me/Shineii86)
[![Instagram Badge](https://img.shields.io/badge/-Instagram-C13584?style=for-the-badge&logo=Instagram&logoColor=white)](https://instagram.com/ikx7.a)
[![Gmail Badge](https://img.shields.io/badge/-Gmail-D14836?style=for-the-badge&logo=Gmail&logoColor=white)](mailto:ikx7a@hotmail.com)

<sup><b>Original Copyright © Star-39 • GPL‑3.0 License.<br>© Shinei Nouzen. All Rights Reserved.</b></sup>

</div>
