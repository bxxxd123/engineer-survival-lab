# 工程師生存實驗室

攤位問卷遊戲。若你的資料夾是放在 `Ai-chief` 主專案底下，可以參考設計文件：`../docs/superpowers/specs/2026-09-24-engineer-survival-lab-design.md`（這份是背景說明用的延伸閱讀，不是必要文件，單獨拿走這個資料夾也不影響網站運作，沒有這份文件也沒關係）。

## 本機預覽（開發用）

這個網站有用到瀏覽器的「模組」功能（ES modules），**用滑鼠直接雙擊 `index.html`打開是打不開的**（會整頁空白），一定要透過一個本機小型網頁伺服器來看：

1. 打開終端機（Terminal），切換到這個資料夾。
2. 執行：
   ```
   python3 -m http.server
   ```
3. 瀏覽器打開 `http://localhost:8000` 就能看到網站了。
4. 按 `Ctrl + C` 可以關掉這個本機伺服器。

## 部署（Cloudflare Pages）

正式網址：https://hexschool-survival-lab.pages.dev/

Cloudflare Pages 已經連到這個 GitHub repo，**每次 `git push` 到 main，Cloudflare 會在 1–2 分鐘內自動更新網站**，不用另外操作。

- Pages 建置設定：Framework preset `None`、Build command `npm run build`、Build output directory `dist`。
- `npm run build` 只把網站需要的檔案（index.html、style.css、config.js、privacy-config.js、_headers、js/、assets/）複製到 `dist/`，原始大圖、Apps Script、測試、說明文件不會放上網站。
- `_headers`：圖片在玩家手機暫存 1 天。
- 換網址時，`js/share.js` 的 `GAME_URL` 和 `assets/brand/qr-game.png` 要一起換。

舊網址 https://bxxxd123.github.io/engineer-survival-lab/ （GitHub Pages）目前仍保留，兩個網址的資料都送到同一份試算表。

## Google 試算表 + Apps Script 一次性設定（約 5 分鐘）

這一段是要讓玩過問卷的人的回答，自動寫進你的 Google 試算表裡，只要設定一次就好。

1. 開一個新的 Google 試算表。
2. 不用自己建分頁和欄位標題：程式會自動建立「問卷回答」、「名單」、「抽獎兌換」三個分頁，第一列標題也會自動寫好（第一筆資料進來時建立；想先建好，可以在 Apps Script 編輯器手動執行一次 `setupSheets`）。
   - **問卷回答**：一列是一次闖關，欄位照填答順序排列：`時間 / 暱稱 / Email / 職業角色 / 年資 / 工作生存狀態 / 薪資 / 獵頭反應 / 跳槽門檻 / 職涯卡點 / AI使用頻率 / AI夥伴 / AI課金 / AI最怕 / 2027目標 / 人設 / 生存指數 / 意見回饋 / 紀錄編號`。「意見回饋」是玩家在任務完成頁留言後，才補進同一列。
   - **名單**：`時間 / 暱稱 / Email / 個資告知同意 / 告知版本 / 同意時間 / 行銷同意 / 行銷同意時間 / 建檔時間 / 人設 / 生存指數`

   - **抽獎兌換**：`兌換時間 / 暱稱 / Email / 紀錄編號`，一個 Email 一列，同一個 Email 不能重複兌換。

   > 只有「行銷同意」欄位是 `TRUE` 的人，才可以加進課程／活動的寄信名單。`FALSE` 的人一樣參加了活動，但不能寄行銷信給他。

3. 上方選單「擴充功能 → Apps Script」，把跳出來的編輯器裡的範例程式碼全部刪掉，貼上 `apps-script/Code.gs` 的內容。
4. 把程式碼裡第一行的 `REPLACE_WITH_YOUR_OWN_SECRET` 改成你自己隨便打的一串英數字（例如 `esl2026secret`），記下來，等一下會用到。

   > 這組字串不是真正的密碼保護（因為網站原始碼任何人都看得到），只是用來擋掉隨便亂打網址亂送資料的人；如果之後真的有奇怪的資料跑進來，把這組字串換掉、Apps Script 跟 `config.js` 兩邊都要改，再重新部署一次就好。

5. 點右上角「部署 → 新增部署作業」，類型選「網頁應用程式」，「執行身分」選「我」，「誰可以存取」選「所有人」，按「部署」。
6. 第一次部署會要求你授權，照畫面指示允許即可。
7. 部署完成後會出現一個網址（結尾是 `/exec`），複製起來。你可以直接把這個網址貼到瀏覽器打開看看，如果看到「工程師生存實驗室後端運作中 ✅」就表示部署成功了。
8. 回到這個資料夾，直接編輯 `config.js`（不是 `config.example.js`，那個檔案只是留著給你對照格式用），把網址貼到 `GAS_WEB_APP_URL`，把你在步驟 4 設定的字串貼到 `GAS_SHARED_SECRET`：

    ```js
    export const GAS_WEB_APP_URL = '貼上你的網址';
    export const GAS_SHARED_SECRET = '貼上你在步驟 4 設定的字串';
    ```

    填好之後記得要 `git add config.js`、commit、再 push 上去，這樣正式上線的 GitHub Pages 網站才會拿到真正的網址和密碼字串——只在自己電腦上改 `config.js` 而沒有推上去，現場真正的訪客看到的網站還是舊的（空白）設定。

    > **小提醒（重要）：** 之後不管是改了 Apps Script 裡的哪一行程式碼（不只是密碼字串），都要重新回到 Apps Script 編輯器，點「部署 → 管理部署作業」，用小鉛筆圖示更新這次的部署，不然新的程式碼不會生效，Google 試算表還是會照舊的邏輯運作。

設定好之後，正式玩一次：
- 一進到「生存報告」頁，「問卷回答」跟「名單」兩個分頁就會各多一列（不用等玩家分享）。
- 在「任務完成」頁送出一則留言，「問卷回答」那一列的「意見回饋」欄會補上留言。

## 現場工作人員：兌換抽獎券

1. 玩家出示「任務完成」頁。「完成任務」章裡的時間秒數會跳動、紅點會閃；靜止不動就是截圖，不能兌換。
2. **長按「完成任務」章 1 秒**（章底部的黃色進度條跑滿），會跳出「STAFF ONLY」確認視窗。
3. 按「確認兌換」，章上蓋上紅色「已兌換抽獎券」戳記後，再發實體抽獎券。
4. 看到紅色「已兌換抽獎券」戳記，或視窗顯示「此 Email 已於…兌換過」，就代表這個 Email 已經換過，請勿重複發放。
5. 視窗顯示「連線失敗」時，按「重新確認」；還是不行就改用紙本登記。

