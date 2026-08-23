# Trime Web

同文輸入法主題站點合集。相容性基準為官方 Trime **v3.3.11**。

| 站點 | 網址 |
|------|------|
| 選擇頁 | https://trime-web.outerstudio.com/ |
| **主題列表** | https://trime-web.outerstudio.com/gallery/ |
| 編輯器 | https://trime-web.outerstudio.com/tool/ |

## 主題列表（Gallery）

瀏覽、預覽、下載別人分享的同文主題，也可一鍵開進編輯器修改。

主題檔不放在本 repo，而在社群庫 **[outerstudio/trime-themes](https://github.com/outerstudio/trime-themes)**：

1. Fork／開 PR，在 `themes/` 新增 `你的主題.trime.yaml`（檔名須以 `trime.yaml` 結尾）
2. YAML 頂層可寫 `name`、`author`、以及 Gallery 用的 `description`（同文 App 會忽略 `description`）
3. CI 驗證主題並組出 `catalog.json`；本站建置時 ingest 該 catalog，列表／詳情用鍵面預覽展示

列表支援分頁；詳情頁可下載完整主題或分段檔、看安裝教學、開進 `/tool` 編輯。

本機開發暫用 `packages/trime-web-gallery/catalog/` 假資料；接上 themes repo 時設 `GALLERY_CATALOG_ROOT`。

## 編輯器（`/tool`）

基於[倉輸入法·工具](https://github.com/lost-melody/Lost-Melody.github.io)改寫，對齊[同文 Trime](https://github.com/osfans/trime)主題結構：編輯樣式、配色、主題鍵與鍵盤，導出 `xxx.trime.yaml`。

說明書與 FAQ 見[工具頁](https://trime-web.outerstudio.com/tool/)左側摺疊區。

## 安裝到同文

1. 從主題列表下載，或從編輯器導出 `主題名.trime.yaml`
2. 放到 Android 同文的 Rime 用戶目錄（設定裡顯示的路徑，常見為 `rime/`）
3. 圖片放主題設定的背景目錄；自訂字型放用戶目錄 `fonts/`
4. 同文執行「部署」，再於主題設定選取 config ID（例如 `gary.trime.yaml` → `gary.trime`）

注意：`*.trime.custom.yaml` 的 `patch:` 可能覆蓋內容。

## 本機開發（monorepo）

| 套件 | 路徑 | 職責 |
|------|------|------|
| `trime-web-core` | `packages/trime-web-core` | 主題模型、YAML 匯入／匯出、可選鍵面預覽 |
| `trime-web-tool` | `packages/trime-web-tool` | 編輯器（`/tool`） |
| `trime-web-gallery` | `packages/trime-web-gallery` | 主題列表（`/gallery`） |

```bash
npm install
npm run dev      # 模擬 /、/tool、/gallery
npm run build    # → dist-pages/
npm run check
```

工作區依賴 `"trime-web-core": "*"`，不必 `npm link`。

### GitHub Pages

清單見 [`pages.sites.json`](./pages.sites.json)。根目錄 `npm run build` package core、依 `BASE_PATH` 建各站、組裝到 `dist-pages/`。`/` 為選擇頁；`/tool`、`/gallery` 為兩個 app。

技術棧：SvelteKit（靜態適配）、Skeleton、Tailwind CSS、YAML。

## 相關連結

- 主題貢獻：[https://github.com/outerstudio/trime-themes](https://github.com/outerstudio/trime-themes)
- 同文：[https://github.com/osfans/trime](https://github.com/osfans/trime)
- 上游靈感：[倉輸入法·工具](https://lost-melody.github.io/hamster-tools/)
