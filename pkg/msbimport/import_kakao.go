package msbimport

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/url"
	"os"
	"os/exec"
	"path"
	"path/filepath"
	"strings"

	"github.com/PuerkitoBio/goquery"
	log "github.com/sirupsen/logrus"
)

func parseKakaoLink(link string, ld *LineData) (string, error) {
	var kakaoID string
	var err error
	var warn string

	parsedUrl, _ := url.Parse(link)

	switch parsedUrl.Host {
	// Kakao web link.
	case "e.kakao.com":
		kakaoID = path.Base(parsedUrl.Path)
		// Strip query parameters from slug
		if idx := strings.Index(kakaoID, "?"); idx != -1 {
			kakaoID = kakaoID[:idx]
		}
	// Kakao mobile app share link.
	case "emoticon.kakao.com":
		kakaoID, err = resolveKakaoShareLink(link)
		if err != nil {
			return warn, err
		}
	// unknown host
	default:
		return warn, errors.New("unknown kakao link type")
	}

	log.Debugln("Resolved kakao slug:", kakaoID)

	// Use new API: https://e.kakao.com/api/items/{slug}
	var newApi KakaoNewAPI
	err = fetchKakaoMetadataNew(&newApi, kakaoID)
	if err != nil {
		log.Debugln("New API failed, trying legacy:", err)
		// Fallback to legacy API
		var kakaoJson KakaoJson
		err = fetchKakaoMetadataLegacy(&kakaoJson, kakaoID)
		if err != nil {
			return warn, err
		}
		ld.DLinks = kakaoJson.Result.ThumbnailUrls
		ld.Title = kakaoJson.Result.Title
		ld.Id = kakaoJson.Result.TitleUrl
	} else {
		// Map new API response to LineData
		ld.Title = newApi.Hero.Title
		ld.Id = newApi.Hero.HashedId

		var stickerUrls []string
		for _, item := range newApi.Contents.Items {
			stickerUrl := item.AnimatedUrl
			if stickerUrl == "" {
				stickerUrl = item.StillImageUrl
			}
			if stickerUrl != "" {
				stickerUrls = append(stickerUrls, stickerUrl)
			}
		}
		ld.DLinks = stickerUrls

		// Detect animated stickers
		if len(newApi.Contents.Items) > 0 && newApi.Contents.Items[0].AnimatedUrl != "" {
			ld.IsAnimated = true
		}
	}

	ld.Link = link
	ld.Amount = len(ld.DLinks)
	ld.Category = KAKAO_EMOTICON

	log.Debugln("Parsed kakao link:", link)
	log.Debugf("Title: %s, Amount: %d, Animated: %v", ld.Title, ld.Amount, ld.IsAnimated)

	return warn, nil
}

// resolveKakaoShareLink follows redirect from emoticon.kakao.com to e.kakao.com and extracts slug.
func resolveKakaoShareLink(link string) (string, error) {
	// Follow redirect to get the e.kakao.com URL
	redirLink, _, err := httpGetWithRedirLink(link)
	if err != nil {
		return "", err
	}
	parsed, _ := url.Parse(redirLink)
	slug := path.Base(parsed.Path)
	if idx := strings.Index(slug, "?"); idx != -1 {
		slug = slug[:idx]
	}
	if slug != "" && parsed.Host == "e.kakao.com" {
		log.Debugln("Resolved share link to slug:", slug)
		return slug, nil
	}

	// Fallback: parse HTML for og:url
	res, err := httpGetAndroidUA(link)
	if err != nil {
		return "", err
	}
	doc, err := goquery.NewDocumentFromReader(strings.NewReader(res))
	if err != nil {
		return "", err
	}

	// Extract from og:url meta tag
	ogUrl, exists := doc.Find("meta[property='og:url']").Attr("content")
	if exists {
		parsed, _ := url.Parse(ogUrl)
		slug := path.Base(parsed.Path)
		if slug != "" {
			return slug, nil
		}
	}

	return "", errors.New("could not resolve kakao share link")
}

// fetchKakaoMetadataNew uses the new Kakao API (2024+).
func fetchKakaoMetadataNew(kakao *KakaoNewAPI, slug string) error {
	apiUrl := "https://e.kakao.com/api/items/" + slug
	page, err := httpGet(apiUrl)
	if err != nil {
		return err
	}

	err = json.Unmarshal([]byte(page), &kakao)
	if err != nil {
		log.Errorln("Failed json parsing new kakao API!", err)
		return err
	}

	if len(kakao.Contents.Items) == 0 {
		return errors.New("no stickers in API response")
	}

	log.Debugln("fetchKakaoMetadataNew: fetched from:", apiUrl)
	return nil
}

// fetchKakaoMetadataLegacy uses the old API (fallback).
func fetchKakaoMetadataLegacy(kakaoJson *KakaoJson, kakaoID string) error {
	apiUrl := "https://e.kakao.com/api/v1/items/t/" + kakaoID
	page, err := httpGet(apiUrl)
	if err != nil {
		return err
	}

	err = json.Unmarshal([]byte(page), &kakaoJson)
	if err != nil {
		log.Errorln("Failed json parsing legacy kakao API!", err)
		return err
	}

	log.Debugln("fetchKakaoMetadataLegacy: fetched from:", apiUrl)
	return nil
}

// Download and convert(if needed) stickers to work directory.
// *ld will be modified and loaded with local sticker information.
func prepareKakaoStickers(ctx context.Context, ld *LineData, workDir string, needConvert bool) error {
	// If no dLink, continue importing static ones.
	if ld.DLink != "" {
		return prepareKakaoZipStickers(ctx, ld, workDir, needConvert)
	}

	os.MkdirAll(workDir, 0755)

	//Initialize Files with wg added.
	//This is intended for async operation.
	//When user reached commitSticker state, sticker will be waited one by one.
	for range ld.DLinks {
		lf := &LineFile{}
		lf.Wg.Add(1)
		ld.Files = append(ld.Files, lf)
	}

	//Download stickers one by one.
	go func() {
		for i, l := range ld.DLinks {
			select {
			case <-ctx.Done():
				log.Warn("prepareKakaoStickers received ctxDone!")
				return
			default:
			}

			// Save with proper extension based on URL
			ext := ".png"
			if strings.Contains(l, ".gif") {
				ext = ".gif"
			} else if strings.Contains(l, ".webp") {
				ext = ".webp"
			} else if strings.Contains(l, ".webm") {
				ext = ".webm"
			}

			f := filepath.Join(workDir, fmt.Sprintf("kakao_%03d%s", i+1, ext))
			err := httpDownload(l, f)
			if err != nil {
				ld.Files[i].CError = err
				ld.Files[i].Wg.Done()
				continue
			}

			// Detect actual file type from magic bytes and rename if needed
			detectedExt := detectFileExtension(f)
			if detectedExt != ext {
				newF := strings.TrimSuffix(f, ext) + detectedExt
				os.Rename(f, newF)
				f = newF
			}

			// Convert to Telegram-compatible format (512x512 WebP)
			var cf string
			if ld.IsAnimated {
				// For animated stickers, convert to animated WebP
				cf, err = convertKakaoAnimated(f)
			} else {
				// For static stickers, resize to 512x512 and convert to WebP
				// Don't use IMToWebpTGStatic — the [0] frame selector breaks WebP encoding
				cf, err = convertKakaoStatic(f)
			}
			if err != nil {
				log.Warnf("Conversion failed for %s: %v", f, err)
				cf = f // Use original if conversion fails
			}

			ld.Files[i].OriginalFile = f
			ld.Files[i].ConvertedFile = cf
			ld.Files[i].Wg.Done()

			log.Debug("Done process one kakao emoticon")
			log.Debugf("f:%s, cf:%s", f, cf)
		}
		log.Debug("Done process ALL kakao emoticons")
	}()
	return nil
}

// detectFileExtension reads magic bytes to determine file type.
func detectFileExtension(f string) string {
	data, err := os.ReadFile(f)
	if err != nil {
		return ".png"
	}
	if len(data) >= 4 {
		if data[0] == 0x89 && data[1] == 0x50 && data[2] == 0x4E && data[3] == 0x47 {
			return ".png"
		}
		if data[0] == 0x47 && data[1] == 0x49 && data[2] == 0x46 {
			return ".gif"
		}
		if data[0] == 0x52 && data[1] == 0x49 && data[2] == 0x46 && data[3] == 0x46 {
			return ".webp"
		}
		if data[0] == 0x1A && data[1] == 0x45 && data[2] == 0xDF {
			return ".webm"
		}
	}
	return ".png"
}

// convertKakaoAnimated converts animated stickers to Telegram-compatible format.
func convertKakaoAnimated(f string) (string, error) {
	ext := filepath.Ext(f)
	switch ext {
	case ".gif":
		// Convert GIF to animated WebP for Telegram
		outFile := strings.TrimSuffix(f, ext) + ".webp"
		err := gifToAnimatedWebp(f, outFile)
		if err != nil {
			return f, err
		}
		return outFile, nil
	case ".webp":
		// Already WebP, use as-is
		return f, nil
	case ".webm":
		// Convert WebM to GIF first, then to animated WebP
		gifFile := strings.TrimSuffix(f, ext) + ".gif"
		outFile := strings.TrimSuffix(f, ext) + ".webp"
		cmd := exec.Command("ffmpeg", "-i", f, "-vf", "scale=512:512:force_original_aspect_ratio=decrease", "-loop", "0", gifFile)
		if err := cmd.Run(); err != nil {
			return f, err
		}
		err := gifToAnimatedWebp(gifFile, outFile)
		if err != nil {
			return gifFile, err
		}
		os.Remove(gifFile)
		return outFile, nil
	default:
		return f, nil
	}
}

// gifToAnimatedWebp converts a GIF to animated WebP using ffmpeg.
func gifToAnimatedWebp(in string, out string) error {
	cmd := exec.Command("ffmpeg", "-i", in, "-vf", "scale=512:512:force_original_aspect_ratio=decrease", "-loop", "0", "-compression_level", "4", "-quality", "80", out, "-y")
	return cmd.Run()
}

// convertKakaoStatic converts a static Kakao sticker to 512x512 WebP for Telegram.
func convertKakaoStatic(f string) (string, error) {
	outFile := strings.TrimSuffix(f, filepath.Ext(f)) + ".webp"
	cmd := exec.Command("convert", f, "-resize", "512x512", "-filter", "Lanczos", "-define", "webp:lossless=true", outFile)
	out, err := cmd.CombinedOutput()
	if err != nil {
		log.Warnf("convertKakaoStatic failed: %s", string(out))
		return "", err
	}
	return outFile, nil
}

func prepareKakaoZipStickers(ctx context.Context, ld *LineData, workDir string, needConvert bool) error {
	zipPath := filepath.Join(workDir, "kakao.zip")
	os.MkdirAll(workDir, 0755)

	log.Debugln("prepareKakaoZipStickers: downloading zip:", ld.DLink)
	err := fDownload(ld.DLink, zipPath)
	if err != nil {
		return err
	}

	kakaoFiles := kakaoZipExtract(zipPath, ld)
	if len(kakaoFiles) == 0 {
		return errors.New("no kakao image in zip")
	}

	if filepath.Ext(kakaoFiles[0]) != ".png" {
		ld.IsAnimated = true
	}

	for _, wf := range kakaoFiles {
		lf := &LineFile{
			OriginalFile: wf,
		}
		if needConvert {
			lf.Wg.Add(1)
		}
		ld.Files = append(ld.Files, lf)
	}
	ld.Amount = len(kakaoFiles)

	if needConvert {
		go convertSToTGFormat(ctx, ld)
	}

	log.Debug("Done preparing kakao files:")
	log.Debugln(ld)

	return nil
}

// Extract and decrypt kakao zip.
func kakaoZipExtract(f string, ld *LineData) []string {
	var files []string
	workDir := fExtract(f)
	if workDir == "" {
		return nil
	}
	log.Debugln("scanning workdir:", workDir)
	files = LsFiles(workDir, []string{}, []string{})

	for _, f := range files {
		//PNG is not encrypted.
		if filepath.Ext(f) != ".png" {
			//This script decrypts the file in-place.
			exec.Command("msb_kakao_decrypt.py", f).Run()
		}
	}
	return files
}
