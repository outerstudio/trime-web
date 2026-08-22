# Lost Melody 維護指南

本專案是 Trime 主題編輯器。修改主題資料模型、匯入、預覽或導出前，必須以 Trime 實際原始碼驗證，不可只依賴舊 wiki、舊主題範例或欄位名稱猜測行為。

## 套件邊界：`trime-web-core`

- 可重用的 **models / YAML import-export / layout·label·color helpers / `PreviewStage`·`KeyPreview`** 已抽到 npm 套件 `trime-web-core`（本 repo 內開發副本在 [`trime-web-core/`](./trime-web-core/)，獨立主頁 https://github.com/garyyeap/trime-web-core.git ）。
- 本站（`trime-tool`）用套件名引用：`"trime-web-core": "^0.1.0"`。不要寫 `file:./trime-web-core`。本機以 `npm link trime-web-core` 接上（先在套件目錄 `npm link`，再在本站 `npm link trime-web-core`，或跑 `npm run link:core`）。編輯器 UI、recovery `localStorage`、`Preview.svelte` 手機框、Svelte stores（`previewRevision` / `hideKeySymbols` / `persistHideKeySymbols`）留在 `src/lib/Trime/`。
- 改 decode／serialize／鍵面預覽行為時，優先改套件原始碼並 `npm run package`，再 `npm link trime-web-core` 驗證本站 roundtrip；`AGENTS.md` 的 Trime 行為說明仍適用於套件實作。
- 套件公開入口：`trime-web-core`（headless：模型與 YAML 進出）、`trime-web-core/preview`（可選 Svelte 預覽）。serialize 的「整批隱藏角標」改由選項 `persistHideKeySymbols` 傳入，不再讀 app store。
- 不要叫 `trime-web-core`：主職責是 theme 資料模型與 YAML 匯入／匯出；鍵面預覽只是可選入口。`renderer` 會讓人以為套件只負責畫鍵盤。

## 知識回寫（強制）

當使用者的問題必須靠下列來源才能正確回答時，**得出結論後要把可復用的事實寫回本檔**（`AGENTS.md`），不要只留在對話裡：

- 抓取／查閱官方 `osfans/trime` 原始碼（對應本檔基準 tag／commit，或明確標示的 `develop` 差異）
- 官方 issue、discussion、changelog、release note
- 其他為核對行為而查的網路資料（wiki、第三方主題範例僅可作旁證，仍須標清是否已用原始碼驗證）

回寫要求：

1. 放在本檔既有對應章節；沒有章節就新增一小節，標題要能被後續搜尋到。
2. 寫清 **版本基準**（預設 v3.3.11／`e4e67cdb`；若是 develop-only 必須標明，不可混稱 stable）。
3. 寫「實際行為＋常見誤解＋正確 YAML／設定寫法」，避免只貼連結。
4. **後續若發現寫錯、過時、或與基準 tag 原始碼不符**：立刻改正本檔錯誤段落，不要另開矛盾條目並存；必要時註明更正日期與依據（commit／檔案路徑）。
5. 純 UI 文案、一次性除錯、與同文行為無關的專案雜務不必回寫。

## Trime 主題／鍵盤相容性基準

- 本章基準為官方 `osfans/trime` **v3.3.11**，release tag 對應 commit `e4e67cdb9ebb1c59edbeed508bdbd572a3021beb`。
- 下文未特別標示者都是 v3.3.11 穩定版行為。
- `develop` 只用來記錄未來可能發版的差異；不可把 develop 的功能宣稱為 v3.3.11 支援。
- 開始修相容性問題時，先重看相應 tag 的 Kotlin decode／render／listener；wiki 與 YAML 範例可能落後，也可能包含已刪除欄位。

## Theme.decode：ID 就是 YAML map key

`Theme.decode` 直接遍歷 YAML mapping：

- `preset_keys` 的每個 map key 成為 `Theme.presetKeys` 的 key。
- `preset_keyboards` 的每個 map key 成為 `Theme.presetKeyboards` 的 key。
- `PresetKey`、`TextKeyboard` 本體沒有另一個可取代 map key 的 `id` 欄位。
- 鍵的 trigger 由 `TextKey.decode` 原樣讀成 scalar string。一般形式（如 `click: Switch_symbols`）會以該字串查 `preset_keys`，大小寫與空白都不會自動修正。
- v3.3.11 `KeyAction.init` 有一個必須另記的例外：會先做 `raw.removeSurrounding("{", "}")`，再以結果查 preset。因此 `click: Switch_symbols` 與 `click: "{Switch_symbols}"` 都會查 map key `Switch_symbols`；這不代表 lookup 會 trim 或忽略大小寫。
- 鍵盤切換動作的 `select` 是目標 `preset_keyboards` map key，也必須完全相同。
- `name` 只是顯示名稱，不是引用 ID；本站內部 `schemaId` 必須 roundtrip 回 YAML map key。

正確：

```yaml
preset_keys:
  Switch_symbols:
    label: 符
    send: Eisu_toggle
    select: symbols

preset_keyboards:
  symbols:
    name: 符號
    ascii_mode: 1
    keys: []
  main:
    name: 中文
    ascii_mode: 0
    keys:
      - { click: Switch_symbols }
```

錯誤：

```yaml
preset_keys:
  Switch_symbols: { send: Eisu_toggle, select: symbols }
preset_keyboards:
  Symbols:                    # 大寫 S，並不是 select 指向的 symbols
    name: symbols
  main:
    keys:
      - { click: switch_symbols } # 大小寫不符，不會命中 Switch_symbols
```

## KeyAction 與 KeyActionManager 的解析順序

`KeyActionManager.getAction(actionId)` 以完整字串為 cache key，建立 `KeyAction(actionId)`；空白鍵因 label 需動態顯示 schema name，不進 cache。主題切換時會清 cache。

v3.3.11 `KeyAction.init` 對 scalar `raw` 的實際順序如下：

1. 計算 `unbraced = raw.removeSurrounding("{", "}")`；只有字串同時以 `{` 開頭、`}` 結尾才移除一對，且不 trim。
2. 先以 **`unbraced`** 查 `ThemeManager.activeTheme.presetKeys`；不是先以原始 `raw` 查。這是 v3.3.11 tag 原始碼的明確行為。
3. 命中 named preset 後，讀取 preset 的所有動作資料，再解析其 `send`。
4. 未命中 preset，而完整 `raw` 符合 `\{[^{}]+\}` 時，以 `Keycode.parseSend(unbraced)` 解析 key name／modifier；同一分支還會嘗試解析形如 `"{commit=a, text=b, label=c}"` 的**純量字串**（固定以 `", "` 與 `"="` 分割），只取 `commit`、`text`、`label`。
5. 其餘以 `Keycode.keyCodeOf(unbraced)` 查 v3.3.11 `Keycode` 表；可辨識項目包括 `BackSpace`、`Return`、`a`、`1`、`.` 等 key name／ASCII 字元與表內符號。
6. `unbraced` 非空且不是 `Keycode.isStdKey(code)` 時，將完整 `raw` 當 `text`／按鍵序列，label 則移除其中 braced 片段；例如 `(){Left}`。因此不在 `Keycode` 表內的 Unicode scalar 也會走 text，而不是成為 Android keycode。

因此 named preset 可以覆蓋同名標準鍵；例如自訂 `preset_keys/BackSpace` 後，`click: BackSpace` 會先命中該 preset，而不是直接走內建 Android BackSpace。

注意：上述 `"{commit=a, text=b, label=c}"` 是 Kotlin 對 scalar string 的相容解析，不是 YAML inline mapping，也不是 JSON；不應用它承載 `send`／`select`／`toggle`。

v3.3.11 `PresetKey.decode` 支援：

- 字串：`send`、`select`、`toggle`、`command`、`option`、`text`、`commit`、`label`、`preview`、`shift_lock`
- 布林：`sticky`、`repeatable`、`slide_cursor`、`slide_delete`、`functional`
- 字串序列：`states`

動作執行的重要順序：

- `commit` 非空：直接上屏，後續 `getText`／keycode 不處理。
- 否則若 `action.getText(currentKeyboard)` 非空：走文字／宏處理。這通常來自 preset `text` 或未辨識 token；另外 shifted A–Z 在特定條件下也可能由 `getText` 回傳 label，不能簡化成只檢查 `text` 欄位。
- 否則依 `send` 解析出的 keycode 處理。
- `send: Eisu_toggle`（Android `KEYCODE_EISU`）才會把 `select` 交給 `KeyboardWindow.switchKeyboard`。
- `send: Mode_switch` 搭配 `toggle` 才是 runtime option 切換。
- **常見錯誤**：把 Android 常數名寫成 `send: SWITCH_CHARSET`。v3.3.11 `Keycode` 表裡對應項目叫 **`Mode_switch`**（ordinal 恰為 `KeyEvent.KEYCODE_SWITCH_CHARSET`＝95）。`Keycode.parseSend("SWITCH_CHARSET")` 會得到 `VoidSymbol`（code 0），`onAction` 不會走 `handleSwitchCharset`，所以 `Henkan`／`Punct_switch`／`one_hand_switch_*` 等長按／點擊看起來「無效」。官方 `trime.yaml` 一律是 `send: Mode_switch`。
- `command` 非空且 `send` 空時會成為 function key；`option` 是 command 參數。
- `states` 只有在 `toggle` 也非空時才依 runtime option 選第 0／1 個 label；應提供至少兩個值。
- preset 沒有 `label` 時，會由解析後的 keycode 產生顯示 label。

功能動作應用 named preset：

```yaml
preset_keys:
  Switch_symbols:
    label: 符號
    send: Eisu_toggle
    select: symbols
  Punct_switch:
    send: Mode_switch
    toggle: ascii_punct
    states: ["。，", "．，"]
  Henkan:
    send: Mode_switch
    toggle: simplification
    states: ["漢字", "汉字"]
  Insert_pair:
    label: （）
    text: "(){Left}"
  Insert_signature:
    label: 簽名
    commit: "Gary"

preset_keyboards:
  main:
    ascii_mode: 0
    keys:
      - { click: Switch_symbols }
      - { click: Punct_switch }
      - { click: Insert_pair }
      - { click: space, long_click: Henkan }
```

### 裸 `Eisu_toggle` 沒有 select → 長按／點擊像沒反應

`send: Eisu_toggle`（Android `KEYCODE_EISU`）會呼叫 `KeyboardWindow.switchKeyboard(action.select)`。若 trigger 直接寫 `click: Eisu_toggle`／`long_click: Eisu_toggle` 且沒有 named preset 帶 `select`，則 `select` 為空字串；`evalKeyboard("")` 多半留在目前／last locked 鍵盤，看起來無效。必須用 named preset：

```yaml
preset_keys:
  keyboard_us_intl:
    label: 文A
    send: Eisu_toggle
    select: us_intl
# keys:
# - { click: keyboard_us_intl }
# 不要寫 - { click: Eisu_toggle, long_click: Eisu_toggle }
```

## 指定鍵盤切換、special IDs、ascii_keyboard

指定鍵盤的穩定做法是 named preset + `send: Eisu_toggle` + `select: target-map-key`。只寫 `select`、只把 `click` 寫成鍵盤 ID，或把 `name` 當 ID 都不會完成指定切換。

```yaml
preset_keys:
  Go_english:
    label: ABC
    send: Eisu_toggle
    select: english

preset_keyboards:
  chinese:
    ascii_mode: 0
    ascii_keyboard: english
    keys:
      - { click: Go_english }
  english:
    ascii_mode: 1
    reset_ascii_mode: true
    keys: []
```

`KeyboardWindow.evalKeyboard` 明確處理的 special IDs：

- `.default`：先看目前 schema id 是否就是某個 preset ID；否則依 alphabet 選 `qwerty`、`qwerty_`、`qwerty0` 或 `default`，候選 ID 不存在時回 `default`。
- `.prior`、`.next`：依 `presetKeyboardIds = theme.presetKeyboards.keys.toList()` 的順序移動；越界時留在 `currentKeyboardId`。
- `.last`：直接回傳 `lastKeyboardId`。不要把它文件化成保證「上一個鍵盤」：v3.3.11 `attachKeyboard(target)` 會依序把 `currentKeyboardId` 與 `lastKeyboardId` 都設為正在 attach 的 `target`，正常 attach 後兩者通常相同。
- `.last_lock`：回傳最近 attach 且 `lock: true` 時記下的 `lastLockKeyboardId`。
- `.ascii`：先取目前鍵盤的 `ascii_keyboard`；沒有時退回 last locked keyboard；目標不存在則留在目前鍵盤。
- 空字串：目前鍵盤是 lock 鍵盤時留在目前鍵盤，否則回 last locked keyboard；最後仍可能走 smart default。

`ascii_keyboard` 是「當 `.ascii` 被要求時切去哪個鍵盤」，不是 ascii 狀態本身。`ascii_mode` 是該鍵盤的預設 Rime runtime mode。文字欄位（email/password/force ASCII 等）可能要求 `.ascii` 並強制 runtime `ascii_mode`。

對一般非空 `select`，`evalKeyboard` 不先驗證是否存在；不存在的 ID 仍會成為 target，而 `selectKeyboardConfig` 才退回 `preset_keyboards["default"]`。結果可能是在錯誤 ID 的 cache key 下顯示 default layout，所以導出仍必須把 `select` 視為強引用並驗證完整性，不能依賴 fallback。

切換進鍵盤時：

- 初次建立時 `lastAsciiMode = keyboard.asciiMode`。
- `reset_ascii_mode: true`：每次用該鍵盤宣告的 `ascii_mode`。
- `reset_ascii_mode: false`：恢復該鍵盤上次記住的 ASCII mode。

## v3.3.11 TextKeyboard.decode 欄位與預設值

以下是穩定版 `TextKeyboard.decode` 的完整重要集合，不是本站模型的推測值：

- `name: ""`
- `author: ""`
- `width: 0`
- `height: 0`
- `keyboard_height: 0`
- `keyboard_height_land: 0`
- `auto_height_index: -1`
- `horizontal_gap: 0`
- `vertical_gap: 0`
- `round_corner: -1`
- `key_border: -1`
- `columns: 30`
- `ascii_mode: 1`，decode 條件為 `(node["ascii_mode"]?.int ?: 1) == 1`；應輸出整數 `0`／`1`，不要用 YAML boolean 代替
- `reset_ascii_mode: false`
- `label_transform: NONE`（另一合法 enum 值為 `UPPERCASE`）
- `lock: false`
- `ascii_keyboard: ""`
- `landscape_keyboard: ""`
- `landscape_split_percent: 0`
- `key_text_offset_x/y: 0`
- `key_symbol_offset_x/y: 0`
- `key_hint_offset_x/y: 0`
- `key_press_offset_x/y: 0`
- `import_preset: ""`
- `keys: []`

最危險差異是缺省 `ascii_mode` 不是中文，而是 `1`。本站導出中文鍵盤必須顯式保留：

```yaml
preset_keyboards:
  chinese:
    ascii_mode: 0
```

序列化器不得寫成：

```ts
ascii_mode: keyboard.ascii_mode || undefined
```

因為合法的 `0` 會被刪掉，Trime 隨即套用 upstream default `1`。應直接輸出數值，或只以 `=== undefined` 判斷。相同原則適用於任何「明確 false／zero 與 upstream 缺省不同」的欄位。

### keyboard_height 為 0 → 鍵盤「消失」

v3.3.11 `Keyboard.kt`（commit `e4e67cdb`）計算高度：

1. 先取該 `preset_keyboards` 的 `keyboard_height`（橫屏再看 `keyboard_height_land`）。
2. 若為 0，再退回 `style.keyboard_height`／`style.keyboard_height_land`。
3. `GeneralStyle.decode` 缺省也是 `0`（不是官方 `trime.yaml` 範例裡的 250）。
4. 取得的 `keyboardHeight` 用來 **等比例縮放每一列的 raw height**；`keyboardHeight == 0` 時 scale 為 0，所有列高變成 0，畫面上看起來像「沒有鍵盤／主題壞掉」。

常見誤解：以為只寫每顆／每列的 `height: 32` 就夠。`height` 只提供 raw 比例；沒有正的 `keyboard_height`（鍵盤或 style 其一）仍會縮成 0。

正確（至少擇一，建議兩邊都寫）：

```yaml
style:
  keyboard_height: 180
  keyboard_height_land: 180

preset_keyboards:
  luna_pinyin:
    ascii_mode: 0
    height: 32
    keyboard_height: 180
    keyboard_height_land: 180
```

本站注意：`Style.toObject` 必須輸出 `keyboard_height`／`keyboard_height_land`／`key_height`／`key_width`；`themeToObject` 導出前應 `fillKeyboardMetrics()`，避免只寫了 `height` 的鍵盤在真機變空白。

## v3.3.11 TextKey：欄位、trigger 與優先順序

穩定版 `TextKey.decode` 支援：

- 幾何：`width` 0、`height` 0、`round_corner` -1、`key_border` -1。
- 顯示：`label` `""`、`label_symbol` `""`、`hint` `""`。
- 行為：`send_bindings` 預設 `true`、`popup` 預設空 sequence。
- 字級：`key_text_size` 0、`symbol_text_size` 0。
- offset：key text／symbol／hint／press 的 x、y 都預設 0。
- 顏色：`key_text_color`、`key_back_color`、`key_symbol_color`、`hilited_key_text_color`、`hilited_key_back_color`、`hilited_key_symbol_color`，皆預設空字串。
- trigger：依 `KeyBehavior` enum 名稱小寫讀取。

v3.3.11 trigger 欄位為：

`composing`、`has_menu`、`paging`、`combo`、`ascii`、`click`、`double_click`、`lazy_double_click`、`swipe_up`、`long_click`、`swipe_down`、`swipe_left`、`swipe_right`、`extra`。

目前狀態動作選擇優先順序是：

1. `ascii`（Rime `ascii_mode`）
2. `paging`
3. `has_menu`
4. `composing`
5. `click`

對明確手勢呼叫 `getAction(behavior)` 時，非 click 的該手勢 action 先於上述狀態 fallback；沒有該手勢才回狀態 action／click。`send_bindings` 會影響事件 fallback，但鍵面 appearance 的 active action 判斷仍會看狀態 action。

### stable 與 develop 的 inline action 差異

v3.3.11 `TextKey.decode` 對每個 trigger 只讀 `Node.string`，也就是 YAML scalar string。YAML inline/block mapping（JSON object 語法在 YAML 中也會成為 mapping）不受支援：

```yaml
# v3.3.11 錯誤：click mapping 不會成為可用動作
- click:
    send: Eisu_toggle
    select: symbols
    label: 符
```

v3.3.11 正確寫法：

```yaml
preset_keys:
  Switch_symbols: { label: 符, send: Eisu_toggle, select: symbols }
preset_keyboards:
  main:
    ascii_mode: 0
    keys:
      - { click: Switch_symbols }
```

截至 2026-08-20 查核的移動分支 `develop` 已加入 `KeyActionToken`（以下不是 v3.3.11 stable 能力）：

- scalar 會成為 `KeyActionToken.Plain`。
- mapping 會成為 `KeyActionToken.Inline`。
- Inline token **只讀 `commit`、`text`、`label`**。
- Inline 仍不支援 `send`、`select`、`toggle`、`command`、`option`、`states` 等功能動作。

所以即使將來以 develop 為基準，鍵盤切換與 option toggle 仍必須放在 `preset_keys`。在 v3.3.11 相容模式下，本站不可導出任何 inline trigger mapping。

## label 的精確選擇條件

`Key.getLabel()` 只有同時滿足下列全部條件，才使用每顆 key 的 `label`：

1. `label` 非空。
2. 目前 active `keyAction == click`。
3. 這顆 key 沒有 `ascii` slot。
4. Rime 目前既不是 `ascii_mode`，也不是 `ascii_punct`。

否則一律顯示 active `KeyAction.getLabel(keyboard)`。這不是「有 `label` 就永遠覆蓋 action label」。

因此以下鍵即使寫了 Unicode glyph，也可能顯示 `BackSpace`／`Return`：

```yaml
- { click: BackSpace, label: "⌫", ascii: BackSpace }
- { click: Return, label: "⏎", composing: Return1 }
```

- 第一顆有 ASCII slot；即使 action 同樣是 BackSpace，per-key label 條件仍失敗，改取 KeyAction label。若沒有同名 preset label，該 label 由 keycode 產生為 `BackSpace`；若存在 named preset，則可能顯示 preset label。
- 第二顆在 composing 時 active action 是 `Return1`，不是 click；會改取 `Return1` 的 preset label。
- 即使沒有 `ascii` slot，進入 `ascii_mode` 或 `ascii_punct` 也會停用 per-key label。

### `Mode_switch` 的 states 蓋過 label（常見「文A」變「西文」）

v3.3.11 `KeyAction.getLabel`：**只要 `toggle` 非空且 `states` 非空，就回傳 `states[0/1]`，完全不理 preset 的 `label`。**

```yaml
# 鍵面會顯示「中文」或「西文」，不是「文A」
Mode_switch:
  label: 文A          # 無效（被 states 蓋掉）
  send: Mode_switch
  toggle: ascii_mode
  states: [中文, 西文]
```

「文A」若是要**切到英文鍵盤**，不要用 `Mode_switch`（那是切 Rime `ascii_mode`）。應：

```yaml
preset_keys:
  keyboard_us_intl:
    label: 文A
    send: Eisu_toggle
    select: us_intl
# keys:
# - { click: keyboard_us_intl, label: 文A }
```

若仍要用 `Mode_switch` 做中英 mode，又想鍵面固定字樣，就改 `states`（例如 `[文, A]`），或拿掉 `states` 只留 `label`（那就失去狀態切換顯示）。

本站編輯器：僅對**內建**且具 `toggle`＋雙 `states` 的鍵顯示兩個「狀態字」輸入框。自訂狀態時**不覆蓋**共用基底 id，而是新建變體 id（可含中文）：

```yaml
# 例：Mode_switch／文／A
preset_keys:
  Mode_switch／文／A:
    send: Mode_switch
    toggle: ascii_mode
    states: [文, A]
# keys:
# - { click: Mode_switch／文／A }
```

分隔符用全形 `／`。還原成預設 states 時 click 回到 `Mode_switch`。Trime `Theme.decode` 的 map key 本來就可為任意字串（含中文）。

Unicode `⌫`、`⏎` 本身不需 YAML escape；問題通常是 label 選擇條件或字型缺 glyph。`KeyView.drawLabel` 的普通 label 呼叫 `FontManager.getTypeface("key_font")`，`drawSymbol` 呼叫 `FontManager.getTypeface("symbol_font")`。v3.3.11 `GeneralStyle.decode` 將這些 font 欄位讀為 YAML sequence；`FontManager` 再從 `File(DataManager.userDataDir, "fonts")` 找每個檔名，因此自訂字型須放在目前 user data 的 `fonts/` 並含所需 glyph。

```yaml
style:
  key_font: [symbol.ttf]
  symbol_font: [symbol.ttf]
```

以 `ic@` 開頭不是普通文字，而是圖示命名協議；`ic@foo` 會轉成 Iconics 名稱 `cmd_foo`。不要把任意 Unicode 名稱加上 `ic@`。

## enter_labels 是魔術 action label

`KeyView.onDraw` 先取得 `key.getLabel()`，只有結果 **完全等於字串 `enter_labels`** 時，才替換為 `KeyboardView.labelEnter`，其值來自 `EnterKeyDisplayDelegate.keyLabel`。delegate 再依 `EditorInfo`、`enter_label_mode` 與主題 `style/enter_labels` 決定 Enter／完成／前往／搜尋等文字。

典型設定：

```yaml
style:
  enter_labels:
    default: Enter
    done: 完成
    go: 前往
    next: 下個
    pre: 上個
    search: 搜尋
    send: 發送

preset_keys:
  Return:
    label: enter_labels
    send: Return
  Return1:
    label: Enter
    send: Return
```

若 key 是 `{ click: Return, composing: Return1 }`，composing 時 active action label 是 `Enter`，不再等於 `enter_labels`，因此會繞過 delegate。要在 composing 仍動態顯示，就讓 composing 指到 action label 也是 `enter_labels` 的 preset。

## label_symbol、隱藏角標與 offset

`Key.symbolLabel` 規則只有一條：`label_symbol` 非空就用它，否則 fallback 到 `long_click` action label。

```yaml
# 沒寫／空字串：可能顯示 long_click 的 @
- { click: a, long_click: "@" }

# 一個空白字元的 length 非零：阻止 fallback，但視覺上看不到
- { click: a, long_click: "@", label_symbol: " " }
```

空白 `" "` 與空字串 `""` 語義不同，不可在 trim、表單 binding 或導出時合併。

另有全域 runtime option `_hide_key_symbol`：`KeyView.drawSymbol` 為 false 時直接不畫所有上方 symbol。這與每顆 key 寫 `" "` 不同：

- `_hide_key_symbol` 是全域 runtime 顯示狀態，不改 theme key data。
- per-key `" "` 是 theme 資料，仍走 draw 流程但畫不可見空白，也永久壓掉 long-click fallback。
- 本站的「整批隱藏角標」若用空白實作，匯入／編輯／導出必須保存原值與空白，不能 trim 掉。

`key_symbol_offset_x/y`、`key_hint_offset_x/y` 等會在 `KeyView` 以 sp 加到繪製座標。它們不會替文字保留 layout 空間；過大 offset 會把角標移入主 label 區域或移到 key view 邊界外而被裁切，看起來像疊字／消失，而不是自動重排。

## full_shape、ascii_punct、ascii_mode 不同

- `ascii_mode`：Rime 的中／英輸入 mode；會選中 key 的 `ascii` action、影響 label 條件，也會受鍵盤 `ascii_mode`／`reset_ascii_mode` 與欄位類型切換。
- `ascii_punct`：Rime 的 ASCII punctuation option；主要切換 schema punctuator 的標點輸出，且 v3.3.11 會使 per-key `label` 條件失敗，但沒有獨立的 `ascii_punct` trigger slot。
- `full_shape`：Rime 的全形／半形 option；通常以 `Mode_switch + toggle: full_shape + states` 切換。

`punctuator` 是 schema（如 `*.schema.yaml`）內容，不是 theme 的 `*.trime.yaml` 欄位。theme key action 通常只送 keycode；最終逗號、句號等輸出由 schema punctuator 與 runtime options 決定。除非 action 使用 `toggle + states` 或 active action 改變，鍵面通常不會隨 `full_shape`／punctuator 自動換字。

**佈局名稱 ≠ 西文**：`us_intl`／「美式國際」只是 `preset_keyboards` 的 map key／鍵位；是否打中文仍看該鍵盤的 `ascii_mode`。純英文鍵盤應 `ascii_mode: 1`，並建議 `reset_ascii_mode: true`。本站編輯器對應「一打開鍵盤 → 每次都先打英文」。v3.3.11 官方 `trime.yaml` 的 `us_intl` 已是 `ascii_mode: 1`。

## shift_lock 與 Caps（軟鍵盤）

軟鍵盤「大寫鎖定」不是 Android `Caps_Lock` keycode。正確做法是 named `preset_keys`：`send: Shift_L` + `shift_lock`，再讓鍵的 `click`／`long_click` 指向該 preset。

v3.3.11 官方預設主題註釋與內建：

- `shift_lock` 合法語意：`ascii_long`（西文長按鎖定、中文單按鎖定）、`long`（長按鎖定）、`click`（單按鎖定）。
- 預設只有 `Shift_L: { label: Shift, send: Shift_L, shift_lock: ascii_long }`；主鍵盤／`us_intl` 多半 `click: Shift_L`。
- **沒有**獨立的 `Shift_Lock`／`Caps_Lock` 主題鍵，也沒有預設把 Shift 的 `long_click` 設成「專用 Caps」。常見需求需自行加：

```yaml
preset_keys:
  Shift_Lock:
    label: ⇧
    send: Shift_L
    shift_lock: long

# keys:
# - { click: Shift_L, long_click: Shift_Lock }
```

`long_click: Caps_Lock` 不會變成軟鍵盤 Caps 鎖定。

## 本站編輯器內建鍵（非官方整包 dump）

`src/lib/Trime/utils/keydefs.ts` 的 `BUILTIN_PRESET_KEYS` **不是**把官方 `trime.yaml` 全部 preset 原樣貼進來。官方預設又長又雜（系統 App、搜尋引擎、硬編碼 ink 主題等），且早期還誤用過 `send: SWITCH_CHARSET`。

設計原則（對齊倉輸入法「常用動作」清單、改成同文可執行）：

1. **UI 顯示通俗中文 title**（如「簡繁切換」「剪貼簿」）；下拉寫成 `簡繁切換（Henkan）`。
2. **YAML map key 仍用同文常用英文 id**（`Henkan`、`Mode_switch`、`clipboard_window`），方便與官方／既有主題 roundtrip。
3. **title／category 只存在編輯器 metadata，不可寫進導出 YAML**。
4. **拿掉不适合同文／Hamster 專有 API**：`deleteText`、`selectText`、`sendKeys`、`RimeSwitcher`、`showScriptView`／`hideScriptView`／`toggleScriptView`、`openURL` 等；同文對應改用 `command`／`Mode_switch`／`Eisu_toggle`／`clipboard_window`／`liquid_keyboard`。
5. **倉→同文對照（重點）**：
   - 重輸 → `Escape`
   - 簡繁切換 → `Henkan`（`send: Mode_switch` + `toggle: simplification`）
   - 中英切換 → `Mode_switch`（`toggle: ascii_mode`）
   - 次選／三選上屏 → `Select_2`／`Select_3`（`command: select_candidate`，option `1`／`2`）
   - 方案選單 → `Menu`
   - 關閉鍵盤 → `Hide`
   - 剪貼簿 → `clipboard_window`（對倉的 showPasteboardView）
   - 左手／右手模式 → `one_hand_switch_1`／`_2`

版本基準：行為欄位仍須符合 v3.3.11 `PresetKey.decode`／`KeyAction`／`CommonKeyboardActionListener`。

## 本 repo 的實作警告

目前本站模型與 v3.3.11 並非完全同構，修改時要特別核對：

- `trime-web-core` 的 `themeToObject()` 才是實際導出 object 來源；UI 畫面或 class 欄位值不等於最後 YAML。
- `trime-web-core` 的 `Keyboard` model 必須永久顯式輸出中文鍵盤的 `ascii_mode: 0`。禁止改回 `this.ascii_mode || undefined`。
- 現有 `Key`／trigger model 可表示 inline `PresetKey`，但 v3.3.11 不支援 inline mapping。
- 現有 trigger 清單包含 `hover`，但 v3.3.11 `KeyBehavior` 沒有 `hover`；反之 stable 有 `lazy_double_click`、`extra`。
- v3.3.11 per-key 不讀 `preview`、`functional`、`repeatable`；這些動作性欄位應放 named `preset_keys`（per-key popup 是另一欄位）。
- v3.3.11 支援的 per-key 與 keyboard 欄位應逐一對照 `TextKeyboard.decode`；不要因舊範例出現就加入導出。
- `PresetKey` 的 stable 欄位還包括 `sticky`、`slide_cursor`、`slide_delete`；編輯器若尚未建模，不可在 roundtrip 時默默宣稱完整保存。
- UI 顯示值、Svelte store、theme model 與 `themeToObject(theme)` 導出 object 必須做 import → edit → export → import roundtrip 測試，尤其是 `0`、`false`、`" "`、map key 與未知欄位。
- 若自稱「導出 bug」，先在當下 theme instance 上檢查／測試 `themeToObject(theme)` 結果；不要拿舊下載檔、localStorage recovery 或 stale export 誤判為 serializer bug。
- `false`／`0` 不可一律省略。只有確認 upstream 缺省與該值等價時才可省略；`undefined` 判斷要與 falsy 判斷分開。

## 導出與真機驗證清單

每次改匯入／導出或新增欄位，至少確認：

1. **明確零值／false**：凡 upstream 缺省不同，顯式輸出；中文鍵盤必查 `ascii_mode: 0`，其他布林與 sentinel `-1` 也依 decode 驗證。**`keyboard_height`／`keyboard_height_land` 不可省略成 0**：style 與該鍵盤若都缺／為 0，真機鍵盤高度會變成 0（看起來像壞掉）。
2. **ID 完整性**：所有 trigger named preset 都存在；所有 `select`、`ascii_keyboard`、`landscape_keyboard`、`import_preset` 都指向正確 map key；大小寫完全一致。
3. **stable 支援欄位**：依 v3.3.11 decode 移除或警告 unsupported fields；不把 develop-only inline action 當 stable。
4. **action 位置**：`send/select/toggle/command` 等功能動作放 `preset_keys`，TextKey trigger 只輸出 scalar preset ID／key token。
5. **roundtrip**：對 `themeToObject` 做斷言，再 stringify YAML、重新 parse，確認 map key、`0`、`false`、空白 label_symbol、Unicode 與 action 未變。
6. **鍵面狀態**：分別測中文、`ascii_mode`、`ascii_punct`、composing、has menu、paging，因 active action 會改 label。
7. **鍵盤切換**：實測 named target、`.default`、`.next`、`.last`、`.last_lock`、`.ascii`，以及目標不存在時的 fallback。
8. **部署與主題選擇**：`ThemeFilesManager.listThemes` 只列舉該目錄第一層、名稱以大小寫敏感的 `endsWith("trime.yaml")` 通過的檔案；慣例使用 `<name>.trime.yaml`。`configId` 是 `nameWithoutExtension`，所以 `gary.trime.yaml` 的 ID 是 `gary.trime`。檔案放進 Trime 設定中的 user data directory 後重新部署，再到主題設定選取正確 config ID；只複製檔案或只重啟鍵盤不足以證明新檔已載入。
9. **custom patch**：`ThemeManager.loadThemeByIdOrNull(id)` 呼叫 `Rime.deployRimeConfigFile(id, "config_version")` 後讀 deployed resource。依 Rime config ID 規則，`trime.yaml`（ID `trime`）要檢查 `trime.custom.yaml`，`gary.trime.yaml`（ID `gary.trime`）要檢查 `gary.trime.custom.yaml`；其中 `patch:` 可覆蓋 base theme。測試前辨認實際 user data、`build/` deployed 版本與 custom patch，避免把 patch 或舊 build 當成導出錯誤。
10. **檔案位置**：主題 YAML 放 user data 根目錄；自訂字型放 user data `fonts/`；背景與其他資源依 Trime 目錄規則放置。確認 App 目前設定的 user data path，而非假設固定路徑。
11. **字型**：`key_font`、`symbol_font` 等檔名存在、可讀且含 Unicode glyph；缺 glyph 與 label routing 是兩類問題。
12. **真機版本**：記錄測試 APK 版本／commit；不能用 develop APK 的成功結果證明 v3.3.11 支援。

## 直接依據的 upstream 原始碼

基準：`osfans/trime` v3.3.11，commit `e4e67cdb`。

- `app/src/main/java/com/osfans/trime/data/theme/Theme.kt`
  - `Theme.decode`：preset map key 的來源。
- `app/src/main/java/com/osfans/trime/data/theme/model/TextKeyboard.kt`
  - `TextKeyboard.decode`、`TextKeyboard.TextKey.decode`：欄位、型別、預設值、stable trigger 只讀 scalar。
- `app/src/main/java/com/osfans/trime/data/theme/model/GeneralStyle.kt`
  - `GeneralStyle.decode`、`EnterLabel.decode`：`enter_label_mode`、`enter_labels` 與 font sequence。
- `app/src/main/java/com/osfans/trime/data/theme/model/PresetKey.kt`
  - `PresetKey.decode`：named preset 支援欄位。
- `app/src/main/java/com/osfans/trime/data/theme/KeyActionManager.kt`
  - `getAction`、`resetCache`。
- `app/src/main/java/com/osfans/trime/ime/keyboard/KeyAction.kt`
  - `init`、`getLabel`、`getText`、`getPreview`：action 解析、label 與 macro。
- `app/src/main/java/com/osfans/trime/ime/enums/Keycode.kt`
  - 類別名確實是小寫 c 的 `Keycode`；`keyCodeOf`、`parseSend`、`isStdKey`、`getDisplayLabel` 負責 v3.3.11 key name／字元解析與顯示名稱。
- `app/src/main/java/com/osfans/trime/ime/keyboard/KeyBehavior.kt`
  - stable trigger enum。
- `app/src/main/java/com/osfans/trime/ime/keyboard/Key.kt`
  - `checkKeyAction`、`getAction`、`getLabel`、`symbolLabel`：狀態優先順序與精確 label 條件。
- `app/src/main/java/com/osfans/trime/ime/keyboard/KeyView.kt`
  - `onDraw`、`drawLabel`、`drawSymbol`、`drawIcon`：`enter_labels`、字型、`ic@`、全域 hide option、offset。
- `app/src/main/java/com/osfans/trime/ime/keyboard/KeyboardView.kt`
  - `labelEnter`：連接 `EnterKeyDisplayDelegate`。
- `app/src/main/java/com/osfans/trime/ime/broadcast/EnterKeyDisplayDelegate.kt`
  - `labelFromEditorInfo`、`updateLabelOnEditorInfo`：Enter 動態文字。
- `app/src/main/java/com/osfans/trime/ime/keyboard/Keyboard.kt`
  - `asciiMode`、`resetAsciiMode`、layout 與 offset fallback。
- `app/src/main/java/com/osfans/trime/ime/keyboard/KeyboardWindow.kt`
  - `selectKeyboardConfig`、`smartMatchKeyboard`、`evalKeyboard`、`switchKeyboard`、`attachKeyboard`、`onRimeOptionUpdated`：special IDs、ascii keyboard、mode restore、`_keyboard_`／`_key_` option。
- `app/src/main/java/com/osfans/trime/ime/keyboard/CommonKeyboardActionListener.kt`
  - `onAction` 及各 handler：commit/text/keycode、Eisu `select`、Mode_switch `toggle`、function command。
- `app/src/main/java/com/osfans/trime/data/theme/ThemeFilesManager.kt`
  - 主題檔名掃描規則（`endsWith("trime.yaml")`）。
- `app/src/main/java/com/osfans/trime/data/theme/ThemeManager.kt`
  - `loadThemeByIdOrNull`、`getThemeById`、`selectTheme`：部署後資源載入、主題選取與 cache reset。
- `app/src/main/java/com/osfans/trime/data/base/DataManager.kt`
  - `userDataDir`、`stagingDir`、`resolveDeployedResourcePath`：user data 與 deployed build 路徑。
- `app/src/main/java/com/osfans/trime/core/Rime.kt`
  - JNI 宣告 `deployRimeConfigFile`；實際 custom config 合併由 librime 部署層處理，不應從 theme Kotlin decoder 猜測。
- `app/src/main/java/com/osfans/trime/data/theme/FontManager.kt`
  - user data `fonts/`、key/symbol font fallback。

develop 差異的直接依據：

- `app/src/main/java/com/osfans/trime/data/theme/model/KeyActionToken.kt`
- develop 版 `TextKeyboard.TextKey.decode`
- develop 版 `KeyAction.init`

develop 的 `KeyActionToken.Inline` 目前僅含 `commit`、`text`、`label`；這項差異不得回推成 v3.3.11 stable 能力。
