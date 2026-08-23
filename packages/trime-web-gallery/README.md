# trime-web-gallery

同文主題列表站，Pages path：`/gallery`。

線上：https://trime-web.outerstudio.com/gallery/

## 主題從哪來

正式貢獻請開 PR 到 **[outerstudio/trime-themes](https://github.com/outerstudio/trime-themes)**：把 `*.trime.yaml` 加進 `themes/`。themes repo 的 CI 負責驗證／產出 catalog；本站建置時用 `GALLERY_CATALOG_ROOT` 指向該目錄（或 checkout），再跑 prepare 腳本產生內嵌 `catalog.json`。

本機開發仍可用套件內假資料：

```text
catalog/
  themes/*.trime.yaml
  catalog.json          # 可選覆寫
```

`npm run prepare-catalog`（也是 `predev`／`prebuild`）執行
[`scripts/prepare-gallery-catalog.mjs`](../../scripts/prepare-gallery-catalog.mjs)。

```bash
GALLERY_CATALOG_ROOT=/path/to/trime-themes npm run build -w trime-web-gallery
```
