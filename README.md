# Trime 同文鍵盤設計工具

我知道有些人懶得看說明直接要網址: https://trime-tool.garyyeap.com/

基於 [倉輸入法·工具](https://github.com/lost-melody/Lost-Melody.github.io) 大量改寫，對齊 [同文輸入法（Trime）](https://github.com/osfans/trime)主題結構與行為，編輯樣式、配色、主題鍵與鍵盤佈局，並導出為 `xxx.trime.yaml`。相容性基準為官方 **Trime v3.3.11**

## 功能概覽

- 一份主題 = **一份樣式（主題設定）** + **多張鍵盤** + **多份配色**。
- 導入／導出完整 `xxx.trime.yaml`，也可分段複製 style、配色、鍵盤、主題鍵等
- 鍵盤／配色模板；瀏覽器暫存（非正式備份，長期請靠導出）
- 即時預覽（折行、fallback 配色；預覽專用選項不會寫進 yaml）
- 編輯按鍵觸發槽、標籤、角標、單鍵配色；主題級 `style`／候選／字體／工具欄／後備顔色／主題鍵

說明書與 FAQ 見[工具頁面](https://trime-tool.garyyeap.com/)左側摺疊區塊。

## 安裝到同文

1. 導出 `主題名.trime.yaml`
2. 放到 Android 同文的 Rime 用戶目錄（設定裡顯示的路徑，常見為 `rime/`）
3. 若配色用了圖片，放到主題設定的背景目錄；自訂字型放到用戶目錄 `fonts/`
4. 在同文執行「部署」，再到主題／配色設定選取對應 config ID
  （例如 `gary.trime.yaml` 的 ID 為 `gary.trime`）

注意：`trime.custom.yaml`／`*.trime.custom.yaml` 的 `patch:` 可能覆蓋導出內容；測試前請確認實際載入的是新檔。

## 本機開發

```bash
npm install
npm run dev
```

```bash
npm run build    # 靜態站產出
npm run preview  # 預覽建置結果
npm run check    # svelte-check
```

技術棧：SvelteKit（靜態適配）、Skeleton、Tailwind CSS、YAML。

## 相關連結

- 同文：[https://github.com/osfans/trime](https://github.com/osfans/trime)
- 上游靈感：[倉輸入法·工具](https://lost-melody.github.io/hamster-tools/)

