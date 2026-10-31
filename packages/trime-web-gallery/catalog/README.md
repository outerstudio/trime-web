# Gallery catalog（本機假資料）

正式主題請 PR 到 [outerstudio/trime-themes](https://github.com/outerstudio/trime-themes)。
此目錄只供本 repo 開發／fixture，結構與 themes repo 相同。

## 目錄

```text
themes/*.trime.yaml   # 必填；檔名 `foo.trime.yaml` → Gallery id `foo`
catalog.json          # 可選；覆寫 id／title／author／description
```

## 主題 YAML

頂層可用欄位（給 Gallery 列表用；同文不讀 `description`）：

```yaml
config_version: "3.0"
name: 我的主題
author: Your Name
description: 一句話介紹（出現在主題列表／詳情）
# …其餘同文 theme 欄位（preset_keyboards、preset_color_schemes 等）
```

- `name`／`author` 缺省時列表用檔名 id／空字串
- `description` 可省略
- 若 `catalog.json` 有同 id 的 metadata，以 catalog.json 為準（覆寫）

檔名須以大小寫敏感的 `trime.yaml` 結尾（同文掃描規則）。須為有效 v3.3.11 主題（中文鍵盤顯式 `ascii_mode: 0`；`keyboard_height` 等見 monorepo `AGENTS.md`）。

主題 YAML 可在頂層設定 `supported_trime_version: "3.3.12"`（或 `"3.3.11"`）。缺少此欄時預設 3.3.11。Gallery 列表、詳情及預覽均採用此版號；它表示編輯器的目標相容版本。
