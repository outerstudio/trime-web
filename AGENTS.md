# Lost Melody 維護指南

本專案是 Trime 主題編輯器。修改 `src/lib/Trime/` 的資料模型、匯入、預覽或導出前，必須以 Trime 實際原始碼驗證，不可只依賴舊 wiki、舊主題範例或欄位名稱猜測行為。

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

## 本 repo 的實作警告

目前本站模型與 v3.3.11 並非完全同構，修改時要特別核對：

- `src/lib/Trime/utils/theme.ts` 的 `themeToObject()` 才是實際導出 object 來源；UI 畫面或 class 欄位值不等於最後 YAML。
- `src/lib/Trime/model/keyboard.ts` 必須永久顯式輸出中文鍵盤的 `ascii_mode: 0`。禁止改回 `this.ascii_mode || undefined`。
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

1. **明確零值／false**：凡 upstream 缺省不同，顯式輸出；中文鍵盤必查 `ascii_mode: 0`，其他布林與 sentinel `-1` 也依 decode 驗證。
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
