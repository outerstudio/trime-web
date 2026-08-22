# Trime 同文鍵盤設計工具

我知道有些人懶得看說明直接要網址: https://trime-web.outerstudio.com/trime-tool/

基於[倉輸入法·工具](https://github.com/lost-melody/Lost-Melody.github.io)大量改寫，對齊[同文輸入法 Trime](https://github.com/osfans/trime)主題結構與行為，編輯樣式、配色、主題鍵與鍵盤佈局，並導出為 `xxx.trime.yaml`。相容性基準為官方 **v3.3.11**

## 功能概覽

- 一份主題 = **一份樣式（主題設定）** + **多張鍵盤** + **多份配色**。
- 導入／導出完整 `xxx.trime.yaml`，也可分段複製 style、配色、鍵盤、主題鍵等
- 鍵盤／配色模板；瀏覽器暫存（非正式備份，長期請靠導出）
- 即時預覽（折行、fallback 配色；預覽專用選項不會寫進 yaml）
- 編輯按鍵觸發槽、標籤、角標、單鍵配色；主題級 `style`／候選／字體／工具欄／後備顔色／主題鍵

說明書與 FAQ 見[工具頁面](https://trime-web.outerstudio.com/trime-tool/)左側摺疊區塊。

## 安裝到同文

1. 導出 `主題名.trime.yaml`
2. 放到 Android 同文的 Rime 用戶目錄（設定裡顯示的路徑，常見為 `rime/`）
3. 若配色用了圖片，放到主題設定的背景目錄；自訂字型放到用戶目錄 `fonts/`
4. 在同文執行「部署」，再到主題／配色設定選取對應 config ID
  （例如 `gary.trime.yaml` 的 ID 為 `gary.trime`）

注意：`trime.custom.yaml`／`*.trime.custom.yaml` 的 `patch:` 可能覆蓋導出內容；測試前請確認實際載入的是新檔。

## 本機開發（monorepo）

本 repo 使用 npm workspaces：

| 套件 | 路徑 | 職責 |
|------|------|------|
| `trime-web-core` | `packages/trime-web-core` | 主題模型、YAML 匯入／匯出、可選鍵面預覽 |
| `trime-web-tool` | `packages/trime-web-tool` | 編輯器站（SvelteKit） |

```bash
# 在 repo 根目錄
npm install
npm run dev      # 啟動 trime-web-tool
npm run build    # 建置全部 Pages 站點 → dist-pages/
npm run preview
npm run check
```

工具透過 workspace 依賴 `"trime-web-core": "*"`，不需要 `npm link` 或 `file:` 路徑。

### GitHub Pages（path prefixes）

一個 repo 只部署一份 Pages artifact。站點清單在 [`pages.sites.json`](./pages.sites.json)；根目錄 `npm run build` 會：

1. package `trime-web-core`
2. 依清單對每個 app 設 `BASE_PATH` 並 build
3. 組裝到 `dist-pages/`（`/` → 根目錄，`/foo` → `dist-pages/foo/`）
4. CI 上傳 `dist-pages` 部署

目前 `trime-web-tool` 掛在 **`/trime-tool`**（`https://trime-web.outerstudio.com/trime-tool/`；根路徑會導向此處）。新增另一個要上線的 app：

1. 在 `packages/` 加套件，adapter 輸出目錄與清單的 `buildDir` 一致（預設 `build`）
2. 在 `pages.sites.json` 加一筆，例如：

```json
{
  "workspace": "my-other-app",
  "basePath": "/other",
  "buildDir": "build"
}
```

3. 該 app 的 SvelteKit `kit.paths.base` 必須讀 `BASE_PATH`（與 `trime-web-tool` 相同寫法）
4. 部署後網址為 `https://你的網域/other/`

技術棧：SvelteKit（靜態適配）、Skeleton、Tailwind CSS、YAML。

## 相關連結

- 同文：[https://github.com/osfans/trime](https://github.com/osfans/trime)
- 上游靈感：[倉輸入法·工具](https://lost-melody.github.io/hamster-tools/)
