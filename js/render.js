import { QUESTIONS } from './questions.js';
import { ROLE_ICONS, STAT_ICONS, OPTION_ICONS, UI_ICONS, BRAND_ICONS } from './icons.js';
import { PRIVACY_CONFIG, orPlaceholder } from '../privacy-config.js';

var TOTAL_LEVELS = QUESTIONS.length;

var AI_TOOL_BRAND_KEYS = {
  chatgpt: 'chatgpt',
  claude: 'claude',
  cursor: 'cursor',
  copilot: 'githubcopilot',
  gemini: 'googlegemini',
  windsurf: 'windsurf'
};

// ---------- 首頁（生存遊戲版）：品牌、主視覺、報到表單都在同一頁 ----------

var HOME_BRANDS = [
  { logo: 'assets/brand/hexschool.svg', name: '六角學院' },
  { logo: 'assets/brand/polygon.svg', name: '多角人才' }
];

function buildHomeBrands() {
  var row = createEl('div', 'home-brands');
  HOME_BRANDS.forEach(function (brand, i) {
    if (i > 0) {
      var x = createEl('span', 'home-brands-x');
      x.textContent = '×';
      x.setAttribute('aria-hidden', 'true');
      row.appendChild(x);
    }
    var item = createEl('div', 'home-brand');
    var logo = document.createElement('img');
    logo.className = 'home-brand-logo';
    logo.src = brand.logo;
    logo.alt = '';
    item.appendChild(logo);
    var name = createEl('span', 'home-brand-name');
    name.textContent = brand.name;
    item.appendChild(name);
    row.appendChild(item);
  });
  return row;
}

function buildHomeHero() {
  var hero = createEl('div', 'home-hero');
  var radar = createEl('div', 'home-hero-radar');
  radar.setAttribute('aria-hidden', 'true');
  hero.appendChild(radar);
  var img = document.createElement('img');
  img.className = 'home-mascot';
  img.src = 'assets/mascot/mascot-combat.webp';
  img.alt = '全副武裝的多角龍';
  hero.appendChild(img);
  hero.appendChild(createEl('div', 'home-hero-ground'));
  return hero;
}

function buildHomeTitle() {
  var wrap = createEl('div', 'home-title-block');
  var tag = createEl('p', 'home-mission-tag');
  tag.textContent = 'SURVIVAL MISSION 2026';
  var title = createEl('h1', 'home-title');
  title.textContent = '工程師生存實驗室';
  var subtitle = createEl('p', 'home-subtitle');
  subtitle.textContent = 'AI 時代，你是哪一種工程師生存者？';
  var meta = createEl('p', 'home-meta');
  ['12 道關卡', '約 90 秒', '解鎖專屬生存卡'].forEach(function (text, i) {
    if (i > 0) {
      var dot = createEl('span', 'home-meta-dot');
      dot.setAttribute('aria-hidden', 'true');
      meta.appendChild(dot);
    }
    meta.appendChild(document.createTextNode(text));
  });
  [tag, title, subtitle, meta].forEach(function (el) { wrap.appendChild(el); });
  return wrap;
}

// 電腦打中文時，按 Enter 是在確認選字，不是送出。把它當送出的話，
// 焦點被移走的瞬間瀏覽器會把剛選的字再輸入一次（「大白」變「大白大白」）。
function isConfirmingIme(e) {
  return e.isComposing || e.keyCode === 229;
}

function buildHomeField(opts) {
  var wrap = createEl('div', 'home-field');
  var row = createEl('label', 'home-field-label');
  row.setAttribute('for', opts.id);
  row.appendChild(document.createTextNode(opts.label));
  var tag = createEl('span', 'home-field-tag' + (opts.required ? ' home-field-tag--required' : ''));
  tag.textContent = opts.required ? '必填' : '選填';
  row.appendChild(tag);
  wrap.appendChild(row);

  var input = document.createElement('input');
  input.type = opts.type || 'text';
  input.id = opts.id;
  input.className = 'home-input';
  input.placeholder = opts.placeholder;
  if (opts.maxLength) input.maxLength = opts.maxLength;
  if (opts.autocomplete) input.autocomplete = opts.autocomplete;
  wrap.appendChild(input);
  return { wrap: wrap, input: input };
}

export function renderIntro(root, handlers) {
  lastTrailPosition = null;
  root.innerHTML = '';
  var screen = createEl('div', 'screen screen--home');

  screen.appendChild(buildHomeBrands());

  var stage = createEl('div', 'home-stage');
  var lead = createEl('div', 'home-lead');
  lead.appendChild(buildHomeHero());
  lead.appendChild(buildHomeTitle());
  stage.appendChild(lead);

  var card = createEl('div', 'home-card');
  var cardHead = createEl('div', 'home-card-head');
  var cardTitle = createEl('h2', 'home-card-title');
  cardTitle.textContent = '生存者登記';
  var cardNo = createEl('span', 'home-card-no');
  cardNo.textContent = 'ID CARD';
  cardHead.appendChild(cardTitle);
  cardHead.appendChild(cardNo);
  card.appendChild(cardHead);

  var error = createEl('p', 'home-error');
  error.setAttribute('role', 'alert');
  error.hidden = true;

  var nickname = buildHomeField({
    id: 'home-nickname',
    label: '生存代號',
    placeholder: '輸入暱稱，例如：每天都在 Debug',
    maxLength: 20,
    autocomplete: 'nickname'
  });
  var email = buildHomeField({
    id: 'home-email',
    label: 'Email',
    required: true,
    type: 'email',
    placeholder: 'you@example.com',
    autocomplete: 'email'
  });
  card.appendChild(nickname.wrap);
  card.appendChild(email.wrap);

  var noticeHost = createEl('div', 'notice-host');
  var openNotice = function () {
    var notice = buildPersonalDataNotice(function () {
      noticeHost.innerHTML = '';
      document.body.classList.remove('notice-open');
      privacy.input.focus();
    });
    noticeHost.appendChild(notice.overlay);
    document.body.classList.add('notice-open');
    notice.done.focus();
  };

  var privacy = buildConsentCheckbox({
    parts: ['我已閱讀並了解', { label: '個人資料蒐集告知事項', onClick: openNotice }]
  });
  privacy.row.classList.add('consent-row--required');
  var marketing = buildMarketingConsent();
  card.appendChild(privacy.row);
  card.appendChild(marketing.row);
  card.appendChild(error);

  function submit() {
    if (!privacy.input.checked) {
      error.hidden = false;
      error.textContent = '請先閱讀並勾選個人資料蒐集告知事項';
      privacy.row.classList.add('consent-row--bad');
      privacy.input.focus();
      return;
    }
    var problem = handlers.onStart({
      nickname: nickname.input.value,
      email: email.input.value,
      privacyAccepted: true,
      marketingOptIn: marketing.input.checked
    });
    if (!problem) return;
    error.hidden = false;
    error.textContent = problem === 'email'
      ? (email.input.value.trim() ? 'Email 格式看起來不太對，再檢查一下。' : '請留下 Email，這是報到的必要資料。')
      : '還有欄位需要補一下。';
    email.input.classList.add('home-input--bad');
    email.input.focus();
  }

  [nickname.input, email.input].forEach(function (input) {
    input.addEventListener('input', function () {
      input.classList.remove('home-input--bad');
      error.hidden = true;
    });
    input.addEventListener('keydown', function (e) {
      if (isConfirmingIme(e)) return;
      if (e.key === 'Enter') { e.preventDefault(); submit(); }
    });
  });
  privacy.input.addEventListener('change', function () {
    privacy.row.classList.remove('consent-row--bad');
    error.hidden = true;
  });

  var startBtn = createEl('button', 'home-cta');
  startBtn.type = 'button';
  var startLabel = createEl('span', 'home-cta-label');
  startLabel.textContent = '出發闖關';
  var startArrow = createEl('span', 'home-cta-arrow');
  startArrow.innerHTML = UI_ICONS.chevronRight;
  startBtn.appendChild(startLabel);
  startBtn.appendChild(startArrow);
  startBtn.addEventListener('click', submit);
  card.appendChild(startBtn);

  stage.appendChild(card);
  screen.appendChild(stage);
  screen.appendChild(noticeHost);
  root.appendChild(screen);

  if (handlers.resume) root.appendChild(buildResumeDialog(handlers.resume));
}

// 上次玩到一半：問要不要接續
function buildResumeDialog(resume) {
  var overlay = createEl('div', 'share-overlay resume-overlay');
  var sheet = createEl('div', 'share-sheet resume-sheet');
  sheet.setAttribute('role', 'dialog');
  sheet.setAttribute('aria-modal', 'true');
  sheet.setAttribute('aria-labelledby', 'resume-heading');

  var tag = createEl('p', 'hud-tag');
  tag.textContent = 'SAVE FOUND';
  var title = createEl('h2', 'share-title');
  title.id = 'resume-heading';
  title.textContent = '要繼續上次的闖關嗎？';
  var text = createEl('p', 'resume-text');
  text.textContent = resume.label;

  var go = createEl('button', 'btn-hazard');
  go.type = 'button';
  go.textContent = '繼續闖關';
  go.addEventListener('click', function () {
    overlay.remove();
    resume.onResume();
  });
  var fresh = createEl('button', 'btn-text');
  fresh.type = 'button';
  fresh.textContent = '重新開始';
  fresh.addEventListener('click', function () {
    overlay.remove();
    resume.onDiscard();
  });

  [tag, title, text, go, fresh].forEach(function (el) { sheet.appendChild(el); });
  overlay.appendChild(sheet);
  setTimeout(function () { go.focus(); }, 0);
  return overlay;
}

function buildConsentCheckbox(opts) {
  var row = createEl('label', 'consent-row');
  var input = document.createElement('input');
  input.type = 'checkbox';
  input.className = 'consent-box';
  input.checked = false;          // never pre-ticked
  row.appendChild(input);

  var body = createEl('span', 'consent-body');
  var text = createEl('span', 'consent-text');
  opts.parts.forEach(function (part) {
    if (typeof part === 'string') {
      text.appendChild(document.createTextNode(part));
      return;
    }
    // A link inside a <label> would toggle the box, so it is a button that
    // stops the click from reaching the label.
    var link = createEl('button', 'consent-link');
    link.type = 'button';
    link.textContent = part.label;
    link.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      part.onClick();
    });
    text.appendChild(link);
  });
  body.appendChild(text);
  if (opts.tag) {
    var tag = createEl('span', 'consent-tag');
    tag.textContent = opts.tag;
    body.appendChild(tag);
  }
  row.appendChild(body);
  return { row: row, input: input };
}

// 行銷同意的字句要跟告知事項第八點引用的一字不差
var MARKETING_CONSENT_TEXT = '我願意收到課程、活動、職缺及職涯相關資訊';

function buildMarketingConsent() {
  return buildConsentCheckbox({
    parts: [MARKETING_CONSENT_TEXT],
    tag: '選填'
  });
}

function buildPersonalDataNotice(onClose) {
  var cfg = PRIVACY_CONFIG;
  var sharedWith = (cfg.sharedWith || []).filter(function (n) { return n && n.trim(); });

  var overlay = createEl('div', 'notice-overlay');
  var sheet = createEl('div', 'notice-sheet');
  sheet.setAttribute('role', 'dialog');
  sheet.setAttribute('aria-modal', 'true');
  sheet.setAttribute('aria-labelledby', 'notice-heading');

  var header = createEl('div', 'notice-header');
  var heading = createEl('div', 'notice-heading-group');
  var h = createEl('h2', 'notice-title');
  h.id = 'notice-heading';
  h.textContent = '個人資料蒐集告知事項';
  var sub = createEl('p', 'notice-subtitle');
  sub.textContent = 'PERSONAL DATA NOTICE';
  heading.appendChild(h);
  heading.appendChild(sub);
  header.appendChild(heading);
  var closeBtn = createEl('button', 'notice-close');
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', '關閉');
  closeBtn.innerHTML = UI_ICONS.close;
  closeBtn.addEventListener('click', onClose);
  header.appendChild(closeBtn);
  sheet.appendChild(header);

  var body = createEl('div', 'notice-body');

  function section(title, blocks) {
    var sec = createEl('section', 'notice-section');
    var t = createEl('h3', 'notice-section-title');
    t.textContent = title;
    sec.appendChild(t);
    blocks.forEach(function (block) {
      if (Array.isArray(block)) {
        var ul = createEl('ul', 'notice-list');
        block.forEach(function (item) {
          var li = createEl('li');
          li.textContent = item;
          ul.appendChild(li);
        });
        sec.appendChild(ul);
        return;
      }
      var p = createEl('p', 'notice-text');
      p.textContent = block;
      sec.appendChild(p);
    });
    body.appendChild(sec);
  }

  // 內容依「波利馬個人資料保護法」告知事項（2026-10-07 版）；
  // 公司名稱、聯絡信箱、保存期間、更新日期在 privacy-config.js。
  var orgs = [cfg.collectorName].concat(sharedWith);
  var orgList = orgs.map(function (n) { return orPlaceholder(n); });
  var mail = orPlaceholder(cfg.contactEmail);

  var intro = createEl('p', 'notice-lead');
  intro.textContent = '為辦理「2026 工程師生存實驗室」活動及提供相關服務，' + orgList.join('及') + '依《個人資料保護法》相關規定，向您說明下列事項：';
  body.appendChild(intro);

  section('一、蒐集單位', ['本活動個人資料蒐集及利用單位為：', orgList, '以下合稱「主辦單位」。']);

  section('二、蒐集目的', ['主辦單位蒐集之資料將用於下列目的：', [
    '辦理「2026 工程師生存實驗室」活動。',
    '活動參與、線上報到及必要聯繫。',
    '產生個人化工程師生存測驗結果及生存卡。',
    '進行工程師職涯、工作狀態、AI 使用情形及相關趨勢之統計與分析。',
    '如您另行同意接收相關資訊，' + orgList[0] + '得透過電子郵件提供工程師學習、課程、講座、活動及相關服務資訊。',
    '如您另行同意接收相關資訊，' + (orgList[1] || orgList[0]) + '得依您提供之資料及職涯需求，提供職缺、人才媒合、職涯發展建議及相關職涯服務資訊。'
  ]]);

  section('三、蒐集之個人資料類別', ['本活動可能蒐集下列資料：', [
    '暱稱／實驗代號。',
    '電子郵件地址。',
    '本活動問卷及測驗作答資料。',
    '求職狀態，以及您自行選擇是否接收課程、活動、職缺及職涯相關資訊之意願。',
    '活動參與及系統運作所必要之紀錄。'
  ]]);

  section('四、個人資料來源', ['上述資料由您本人於「2026 工程師生存實驗室」活動頁面直接提供。']);

  section('五、個人資料利用之期間、地區、對象及方式', [
    '1. 利用期間',
    '本活動之報到、問卷、測驗及相關活動資料，' + orPlaceholder(cfg.retentionPeriod) + '；保存期間屆滿或蒐集目的消失後，依相關規定停止利用或刪除。',
    '如您另行同意接收課程、活動、職涯或人才媒合相關資訊，相關聯絡資料得利用至您撤回同意、取消訂閱，或相關服務及蒐集目的消失為止。',
    '法令另有保存規定者，依相關法令規定辦理。',
    '2. 利用地區',
    '中華民國（臺灣），以及提供本活動所必要之資訊系統、電子郵件寄送或雲端服務所在地區。',
    '3. 利用對象',
    orgList.concat(['為提供本活動、資訊系統、資料儲存、電子郵件寄送及相關服務所必要之受託服務提供者。']),
    '4. 利用方式',
    '以自動化或非自動化方式進行個人資料之蒐集、處理及利用，包括活動報到、測驗結果產生、統計分析、活動聯繫，以及依您所選擇之同意項目提供課程、活動、職涯或人才媒合相關資訊。'
  ]);

  section('六、當事人權利', ['您得依《個人資料保護法》相關規定，就您的個人資料行使下列權利：', [
    '查詢或請求閱覽。',
    '請求製給複製本。',
    '請求補充或更正。',
    '請求停止蒐集、處理或利用。',
    '請求刪除。'
  ], '如需行使上述權利，請聯絡：' + mail, '主辦單位將依相關法令及內部作業程序處理。']);

  section('七、不提供個人資料之影響', [
    '暱稱／實驗代號為選填。如未提供，系統得以隨機實驗代號顯示於您的生存卡。',
    'Email 為本活動線上報到之必要資料。如不提供 Email，將無法完成本活動之線上報到及進入測驗。',
    '是否同意接收課程、活動、職缺及職涯相關資訊，由您自由選擇。',
    '未勾選上述選填項目，不影響您參與本次活動、完成測驗及取得工程師生存卡。'
  ]);

  section('八、課程、活動資訊及人才媒合', [
    '如您勾選「' + MARKETING_CONSENT_TEXT + '」，即表示您同意主辦單位依本告知事項所載方式，提供下列資訊：',
    [
      orgList[0] + '：透過電子郵件提供工程師學習、課程、講座、活動及相關服務資訊。',
      (orgList[1] || orgList[0]) + '：依您提供之資料及職涯需求，提供職缺、人才媒合、職涯發展建議、產業與人才市場趨勢及相關職涯服務資訊。'
    ],
    '您可隨時透過電子郵件中的「取消訂閱」功能，或聯絡 ' + mail + '，停止接收上述資訊或提出停止利用之要求。',
    '本項為自由選擇，未勾選或日後取消，不影響您參與本次活動或已取得之測驗結果及生存卡。'
  ]);

  section('九、其他說明', [
    '主辦單位將於蒐集目的必要範圍內處理及利用您的個人資料，並採取適當之安全維護措施。',
    '如本告知事項內容因活動內容、服務方式或法令要求而有所調整，將於活動頁面公告更新版本。'
  ]);

  var updated = createEl('p', 'notice-updated');
  updated.textContent = '最後更新：' + orPlaceholder(cfg.lastUpdated);
  body.appendChild(updated);

  sheet.appendChild(body);

  var footer = createEl('div', 'notice-footer');
  var done = createEl('button', 'btn-notice-done');
  done.type = 'button';
  done.textContent = '我已了解並返回';
  done.addEventListener('click', onClose);
  footer.appendChild(done);
  sheet.appendChild(footer);

  overlay.appendChild(sheet);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) onClose();
  });
  return { overlay: overlay, sheet: sheet, done: done };
}

// ---------- 闖關頁 ----------

// 12 題分成三個營地，進度條上用較大的節點標出營地起點。
var CAMPS = [
  { name: '職場現況', from: 1, to: 6 },
  { name: '職涯卡點', from: 7, to: 7, boss: true },
  { name: 'AI 生存', from: 8, to: 12 }
];

// The trail is rebuilt on every render, so the walker remembers where it was
// drawn last time and slides from there to its new checkpoint.
var lastTrailPosition = null;

function campFor(level) {
  return CAMPS.filter(function (camp) { return level >= camp.from && level <= camp.to; })[0] || CAMPS[0];
}

function trailPercent(position) {
  // checkpoints 1..12 sit between 0% and 92%; the finish flag owns 100%
  return ((position - 1) / (TOTAL_LEVELS - 1)) * 92;
}

function buildTrail(question, state) {
  var trail = createEl('div', 'trail');
  var camp = campFor(question.level);
  var campIndex = CAMPS.filter(function (c) { return !c.boss; }).indexOf(camp) + 1;

  var meta = createEl('div', 'trail-meta');
  var campLabel = createEl('span', 'trail-camp');
  campLabel.textContent = (camp.boss ? 'BOSS 關' : '營地 ' + campIndex) + '・' + camp.name;
  var count = createEl('span', 'trail-count');
  count.textContent = 'LEVEL ' + pad2(question.level) + ' / ' + TOTAL_LEVELS;
  meta.appendChild(campLabel);
  meta.appendChild(count);
  trail.appendChild(meta);

  // While a single answer plays out, the walker already heads for the next
  // checkpoint so the move reads as the result of answering.
  var position = question.level + (state.isAdvancing && question.level < TOTAL_LEVELS ? 1 : 0);

  var track = createEl('div', 'trail-track');
  track.setAttribute('aria-hidden', 'true');
  var line = createEl('div', 'trail-line');
  var fill = createEl('div', 'trail-line-fill');
  fill.style.width = trailPercent(position) + '%';
  line.appendChild(fill);
  track.appendChild(line);

  for (var level = 1; level <= TOTAL_LEVELS; level++) {
    var node = createEl('span', 'trail-node');
    var campStart = CAMPS.filter(function (c) { return c.from === level; })[0];
    if (campStart) node.classList.add(campStart.boss ? 'trail-node--boss' : 'trail-node--camp');
    if (level < position) node.classList.add('trail-node--done');
    if (level === position) node.classList.add('trail-node--current');
    node.style.left = trailPercent(level) + '%';
    track.appendChild(node);
  }

  var flag = buildIconSpan(UI_ICONS.flag, 'trail-flag');
  track.appendChild(flag);

  var walker = document.createElement('img');
  walker.className = 'trail-walker';
  walker.src = 'assets/mascot/mascot-walk.webp';
  walker.alt = '';
  var from = lastTrailPosition === null ? position : lastTrailPosition;
  walker.style.left = trailPercent(from) + '%';
  track.appendChild(walker);
  if (from !== position) {
    walker.classList.add('trail-walker--moving');
    if (position < from) walker.classList.add('trail-walker--back');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { walker.style.left = trailPercent(position) + '%'; });
    });
    setTimeout(function () { walker.classList.remove('trail-walker--moving'); }, 560);
  }
  lastTrailPosition = position;

  trail.appendChild(track);
  return trail;
}

export function renderLevel(root, question, state, handlers) {
  root.innerHTML = '';
  var screen = createEl('div', 'screen screen--level');
  screen.appendChild(buildTrail(question, state));

  var prompt = createEl('h2', 'level-prompt');
  prompt.textContent = question.prompt;
  screen.appendChild(prompt);

  if (question.subtitle) {
    var subtitle = createEl('p', 'level-subtitle');
    subtitle.textContent = question.subtitle;
    screen.appendChild(subtitle);
  }

  screen.appendChild(buildOptionsGrid(question, state, handlers));

  // 「其他」這類選項：不自動跳題，給一個選填輸入框和下一關按鈕
  var picked = question.type === 'single'
    ? question.options.filter(function (o) { return o.value === state.answers[question.id]; })[0]
    : null;
  var freeTextBar = null;
  if (picked && picked.freeText && !state.isAdvancing) {
    var freeWrap = createEl('div', 'free-text');
    var freeInput = document.createElement('input');
    freeInput.type = 'text';
    freeInput.className = 'home-input free-text-input';
    freeInput.placeholder = picked.freeText;
    freeInput.maxLength = 30;
    freeInput.value = state.answers[question.id + 'Other'] || '';
    freeInput.setAttribute('aria-label', picked.freeText);
    freeInput.addEventListener('input', function () { handlers.onFreeText(freeInput.value); });
    freeInput.addEventListener('keydown', function (e) {
      if (isConfirmingIme(e)) return;
      if (e.key === 'Enter') { e.preventDefault(); handlers.onMultiNext(); }
    });
    var freeTag = createEl('span', 'home-field-tag');
    freeTag.textContent = '選填';
    freeWrap.appendChild(freeInput);
    freeWrap.appendChild(freeTag);
    setTimeout(function () {
      window.scrollTo(0, document.documentElement.scrollHeight);
      freeInput.focus({ preventScroll: true });
    }, 0);

    // Input rides in the pinned bottom bar with the button, so it is never
    // hidden behind it.
    freeTextBar = createEl('div', 'level-actions level-actions--free-text');
    freeTextBar.appendChild(freeWrap);
    var freeNext = createEl('button', 'btn-hazard');
    freeNext.type = 'button';
    freeNext.textContent = '下一關';
    freeNext.addEventListener('click', handlers.onMultiNext);
    freeTextBar.appendChild(freeNext);
  }

  if (state.levelIndex > 0) {
    var backBtn = createEl('button', 'btn-back');
    backBtn.type = 'button';
    backBtn.textContent = '← 上一題';
    backBtn.disabled = Boolean(state.isAdvancing);
    backBtn.addEventListener('click', handlers.onBack);
    screen.appendChild(backBtn);
  }

  var pickedCount = (state.answers[question.id] || []).length;
  // Required multi-select questions show no button until something is picked;
  // optional ones offer a skip instead.
  if (question.type === 'multi' && (pickedCount > 0 || !question.required)) {
    var selected = state.answers[question.id] || [];
    var verb = question.visualStyle === 'bugs' ? '已鎖定' : '已選';
    var bar = createEl('div', 'level-actions');
    var nextBtn = createEl('button', 'btn-hazard');
    nextBtn.type = 'button';
    nextBtn.textContent = selected.length > 0
      ? '下一關（' + verb + ' ' + selected.length + '/' + question.maxSelections + '）'
      : '略過這題';
    nextBtn.addEventListener('click', handlers.onMultiNext);
    bar.appendChild(nextBtn);
    screen.appendChild(bar);
  }

  if (freeTextBar) screen.appendChild(freeTextBar);

  root.appendChild(screen);
}

function buildOptionsGrid(question, state, handlers) {
  var isMulti = question.type === 'multi';
  var isSniper = question.visualStyle === 'bugs';
  var selectedValue = state.answers[question.id];
  var selectedValues = isMulti ? (state.answers[question.id] || []) : [];
  var isFull = isMulti && question.maxSelections && selectedValues.length >= question.maxSelections;
  var isLadder = question.layout === 'ladder';
  var grid = createEl('div', 'options-grid options-grid--' + question.visualStyle + (isLadder ? ' options-grid--ladder' : ''));
  var maxRank = isLadder
    ? Math.max.apply(null, question.options.map(function (o) { return o.rank || 0; }))
    : 0;
  var dividerAdded = false;

  question.options.forEach(function (option) {
    // Answers that sit outside the scale (秘密, 公司不給用…) go under a divider
    // so they do not read as the top or bottom rung.
    if (isLadder && option.offScale && !dividerAdded) {
      var divider = createEl('div', 'options-divider');
      divider.setAttribute('aria-hidden', 'true');
      grid.appendChild(divider);
      dividerAdded = true;
    }

    var isSelected = isMulti
      ? selectedValues.indexOf(option.value) !== -1
      : selectedValue === option.value;
    var isExclusive = question.exclusiveOption === option.value;

    var classNames = ['option-card'];
    if (isSelected) {
      classNames.push(isSniper ? (isExclusive ? 'option-card--clear' : 'option-card--locked') : 'option-card--selected');
    } else if (isFull && !isExclusive) {
      classNames.push('option-card--maxed');
    }

    var btn = createEl('button', classNames.join(' '));
    btn.type = 'button';
    btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    // Locked only while the answer animation plays, so a double tap cannot
    // skip a level. Keying this off the stored answer instead would leave the
    // options dead after stepping back to change one.
    btn.disabled = !isMulti && Boolean(state.isAdvancing);

    var isAiToolsBrand = question.id === 'aiTools';
    var iconMarkup = question.id === 'role'
      ? ROLE_ICONS[option.value]
      : isAiToolsBrand
        ? (BRAND_ICONS[AI_TOOL_BRAND_KEYS[option.value]] ||
           (option.value === 'other' ? UI_ICONS.settings : option.value === 'none' ? UI_ICONS.moreHorizontal : null))
        : OPTION_ICONS[question.id + ':' + option.value];
    var visual = createEl('span', 'option-visual');
    if (option.image) {
      var optionImg = document.createElement('img');
      optionImg.className = 'option-image';
      optionImg.src = option.image;
      optionImg.alt = '';
      visual.appendChild(optionImg);
    } else if (iconMarkup) {
      var icon = createEl('span', isAiToolsBrand ? 'option-icon option-icon--brand' : 'option-icon');
      icon.innerHTML = iconMarkup;
      visual.appendChild(icon);
    } else {
      var emoji = createEl('span', 'option-emoji');
      emoji.textContent = option.emoji;
      visual.appendChild(emoji);
    }
    if (isSniper && isSelected && !isExclusive) {
      visual.appendChild(buildCrosshair());
    }
    btn.appendChild(visual);

    var label = createEl('span', 'option-label');
    label.textContent = option.label;
    btn.appendChild(label);

    if (isLadder && option.rank) {
      var meter = createEl('span', 'option-meter');
      meter.setAttribute('aria-hidden', 'true');
      for (var r = 1; r <= maxRank; r++) {
        meter.appendChild(createEl('span', r <= option.rank ? 'option-meter-on' : ''));
      }
      btn.appendChild(meter);
    }

    if (isSelected && isMulti) {
      var stamp = createEl('span', 'option-stamp');
      stamp.textContent = isSniper ? (isExclusive ? '安全' : '已鎖定') : '';
      if (!isSniper) stamp.innerHTML = UI_ICONS.check;
      btn.appendChild(stamp);
    }

    btn.addEventListener('click', function () {
      if (isMulti) {
        handlers.onMultiToggle(option.value);
      } else {
        handlers.onSingleSelect(option.value);
      }
    });

    grid.appendChild(btn);
  });

  return grid;
}

function buildCrosshair() {
  var reticle = createEl('span', 'option-reticle');
  reticle.setAttribute('aria-hidden', 'true');
  reticle.innerHTML =
    '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">' +
    '<circle cx="32" cy="32" r="22"/><circle cx="32" cy="32" r="3" fill="currentColor"/>' +
    '<path d="M32 2v14M32 48v14M2 32h14M48 32h14"/>' +
    '</svg>';
  return reticle;
}

function createEl(tag, className) {
  var el = document.createElement(tag);
  if (className) el.className = className;
  return el;
}

function pad2(n) {
  return n < 10 ? '0' + n : String(n);
}

function buildIconSpan(svgMarkup, className) {
  var span = createEl('span', className);
  span.innerHTML = svgMarkup;
  return span;
}

// ---------- 分析中 ----------

var CALCULATING_ITEMS = ['工作穩定度', 'AI 適應度', '職涯卡點', '轉職雷達', '2027 任務'];
var CALCULATING_STAGGER_MS = 250;

export function renderCalculating(root) {
  lastTrailPosition = null;
  root.innerHTML = '';
  var screen = createEl('div', 'screen screen--calculating');

  var radar = createEl('div', 'calc-radar');
  radar.setAttribute('aria-hidden', 'true');
  var radarImg = document.createElement('img');
  radarImg.src = 'assets/mascot/mascot-combat.webp';
  radarImg.alt = '';
  radar.appendChild(radarImg);
  screen.appendChild(radar);

  var tag = createEl('p', 'calc-tag');
  tag.textContent = 'SCANNING';
  screen.appendChild(tag);

  var text = createEl('p', 'calculating-text');
  text.textContent = '分析你的工程師生存數據中……';
  screen.appendChild(text);

  var checklist = createEl('div', 'calculating-checklist');
  CALCULATING_ITEMS.forEach(function (label, i) {
    var item = createEl('div', 'calculating-item');
    item.style.animationDelay = (i * CALCULATING_STAGGER_MS) + 'ms';
    var labelEl = createEl('span');
    labelEl.textContent = label;
    var check = createEl('span', 'calculating-check');
    check.textContent = 'OK';
    check.style.animationDelay = (i * CALCULATING_STAGGER_MS + 150) + 'ms';
    item.appendChild(labelEl);
    item.appendChild(check);
    checklist.appendChild(item);
  });
  screen.appendChild(checklist);

  var track = createEl('div', 'progress-track');
  var fill = createEl('div', 'progress-fill progress-fill--animated');
  track.appendChild(fill);
  screen.appendChild(track);
  root.appendChild(screen);
}

// ---------- 生存報告 ----------

function applyPersonaColors(el, persona) {
  el.style.setProperty('--persona-accent', persona.accent);
  el.style.setProperty('--persona-accent-strong', persona.accentStrong);
  el.style.setProperty('--persona-glow', persona.accentGlow);
}

export function renderResult(root, data, handlers) {
  root.innerHTML = '';
  var screen = createEl('div', 'screen screen--result');
  applyPersonaColors(screen, data.persona);
  var card = createEl('div', 'result-card');

  var hero = createEl('div', 'result-hero');
  hero.appendChild(createEl('div', 'result-hero-radar'));
  var mascot = document.createElement('img');
  mascot.className = 'result-mascot';
  mascot.src = data.persona.mascotImage;
  mascot.alt = data.persona.name + '的多角龍';
  hero.appendChild(mascot);

  var greeting = createEl('p', 'result-greeting');
  greeting.textContent = data.nickname + ' 的生存報告出爐了！';

  var badge = createEl('div', 'result-badge');
  badge.textContent = 'SURVIVAL SCORE';

  var name = createEl('h2', 'result-name');
  name.textContent = data.persona.name;

  var englishName = createEl('p', 'result-english-name');
  englishName.textContent = data.persona.englishName;

  // 生存率：SURVIVAL SCORE 標籤下方直接放數字，再接人設名稱
  var scoreBlock = createEl('div', 'result-score');
  var scoreValue = createEl('p', 'result-score-value');
  var scoreNumber = createEl('span', 'result-score-number');
  scoreNumber.textContent = '0';
  var scoreUnit = createEl('span', 'result-score-unit');
  scoreUnit.textContent = '%';
  scoreValue.appendChild(scoreNumber);
  scoreValue.appendChild(scoreUnit);
  scoreBlock.appendChild(scoreValue);

  setTimeout(function () {
    animateCountUp(scoreNumber, data.survivalIndex, 900);
  }, 30);

  var stats = createEl('div', 'result-stats');
  stats.appendChild(buildStatRow('heart', '工作穩定度', data.dimensions.stability));
  stats.appendChild(buildStatRow('cpu', 'AI 適應度', data.dimensions.aiAdapt));
  stats.appendChild(buildStatRow('radar', '轉職雷達', data.dimensions.radar));
  stats.appendChild(buildStatRow('bug', '職涯卡點指數', data.dimensions.careerBugIndex));

  var insightHero = buildInsightHero(data.persona.highlight);

  var insightGrid = createEl('div', 'result-insight-grid');
  insightGrid.appendChild(buildInsightCard('crosshair', 'CORE DRIVE', data.persona.deepDive.motivationTitle, data.persona.deepDive.motivation));
  insightGrid.appendChild(buildInsightCard('triangleAlert', 'RISK', data.persona.deepDive.riskTitle, data.persona.deepDive.risk));
  insightGrid.appendChild(buildInsightCard('moveUpRight', 'NEXT MOVE', data.persona.deepDive.actionTitle, data.persona.deepDive.action));

  var summary = buildSummaryCards(data);
  var course = buildCourseCard(data.course, '為你推薦的六角課程');

  [greeting, hero, badge, scoreBlock, name, englishName, stats, insightHero, summary, insightGrid, course].forEach(function (el) { card.appendChild(el); });
  screen.appendChild(card);

  var restartBtn = createEl('button', 'btn-text');
  restartBtn.type = 'button';
  restartBtn.textContent = '重新測一次';
  restartBtn.addEventListener('click', handlers.onRestart);
  screen.appendChild(restartBtn);

  // The report runs about three screens tall on a phone, so the booth mission
  // rides along at the bottom of the viewport the whole way down.
  var actions = createEl('div', 'result-actions');
  var hint = createEl('p', 'result-actions-hint');
  hint.textContent = '最後一步：分享生存卡給朋友，完成闖關任務';
  var shareBtn = createEl('button', 'btn-hazard');
  shareBtn.type = 'button';
  shareBtn.textContent = '產生我的生存卡';
  shareBtn.addEventListener('click', handlers.onShare);
  actions.appendChild(hint);
  actions.appendChild(shareBtn);
  screen.appendChild(actions);

  root.appendChild(screen);
}

function buildSegmentBar(ratio, extraClass) {
  var bar = createEl('div', 'segment-bar' + (extraClass ? ' ' + extraClass : ''));
  for (var i = 0; i < 20; i++) bar.appendChild(createEl('span', 'segment'));
  lightSegments(bar, ratio);
  return bar;
}

function lightSegments(bar, ratio) {
  var lit = Math.round(20 * Math.max(0, Math.min(1, ratio)));
  Array.prototype.forEach.call(bar.children, function (seg, i) {
    seg.style.transitionDelay = (i * 25) + 'ms';
    seg.classList.toggle('segment--on', i < lit);
  });
}

function buildStatRow(iconKey, label, value) {
  var percent = Math.round((value / 5) * 100);
  var row = createEl('div', 'stat-row');
  row.appendChild(buildIconSpan(STAT_ICONS[iconKey], 'stat-icon'));

  var info = createEl('div', 'stat-info');
  var labelRow = createEl('div', 'stat-label-row');
  var labelEl = createEl('span', 'stat-label');
  labelEl.textContent = label;
  var percentEl = createEl('span', 'stat-percent');
  percentEl.textContent = percent + '%';
  labelRow.appendChild(labelEl);
  labelRow.appendChild(percentEl);

  info.appendChild(labelRow);
  info.appendChild(buildSegmentBar(percent / 100));
  row.appendChild(info);
  return row;
}

function buildInsightHero(headline) {
  var hero = createEl('div', 'result-insight-hero');
  var eyebrow = createEl('p', 'result-insight-hero-eyebrow');
  eyebrow.textContent = 'YOUR INSIGHT';
  var text = createEl('p', 'result-insight-hero-text');
  text.textContent = headline;
  hero.appendChild(eyebrow);
  hero.appendChild(text);
  return hero;
}

function buildInsightCard(iconKey, eyebrow, title, description) {
  var card = createEl('div', 'result-insight-card');
  var iconBox = createEl('div', 'result-insight-icon');
  iconBox.appendChild(buildIconSpan(STAT_ICONS[iconKey], 'result-insight-icon-svg'));
  var eyebrowEl = createEl('p', 'result-insight-eyebrow');
  eyebrowEl.textContent = eyebrow;
  var titleEl = createEl('p', 'result-insight-title');
  titleEl.textContent = title;
  var descEl = createEl('p', 'result-insight-desc');
  descEl.textContent = description;
  var body = createEl('div', 'result-insight-body');
  body.appendChild(eyebrowEl);
  body.appendChild(titleEl);
  body.appendChild(descEl);
  card.appendChild(iconBox);
  card.appendChild(body);
  return card;
}

// 三張橫排小卡：職涯卡點、AI 狀態、2027 目標，是作答的戰績總結
function buildSummaryCards(data) {
  var bugs = (data.careerBugLabel || '').split('、').filter(Boolean);
  var bugText = bugs.length ? bugs[0] + (bugs.length > 1 ? ' +' + (bugs.length - 1) : '') : '目前沒什麼 Bug';
  var row = createEl('div', 'result-summary');
  row.appendChild(buildSummaryCard('bug', '職涯卡點', bugText, data.careerBugImage, STAT_ICONS.bug));
  row.appendChild(buildSummaryCard('ai', 'AI 狀態', data.aiBuffLabel, '', STAT_ICONS.cpu));
  row.appendChild(buildSummaryCard('goal', '2027 目標', data.goalLabel, data.goalImage, STAT_ICONS.trophy));
  return row;
}

function buildSummaryCard(variant, eyebrow, text, image, icon) {
  var card = createEl('div', 'summary-card summary-card--' + variant);
  var visual = createEl('div', 'summary-visual');
  if (image) {
    var img = document.createElement('img');
    img.src = image;
    img.alt = '';
    visual.appendChild(img);
  } else {
    visual.appendChild(buildIconSpan(icon, 'summary-icon'));
  }
  var eyebrowEl = createEl('p', 'summary-eyebrow');
  eyebrowEl.textContent = eyebrow;
  var textEl = createEl('p', 'summary-text');
  textEl.textContent = text;
  [visual, eyebrowEl, textEl].forEach(function (el) { card.appendChild(el); });
  return card;
}

function isLocalPreview() {
  return /^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname);
}

// 推薦課程：整頁的主角之一，有自己的按鈕，跟唯讀的解析區塊明顯不同
function buildCourseCard(course, labelText) {
  var wrap = createEl('a', 'result-course');
  wrap.href = course.url;
  wrap.target = '_blank';
  wrap.rel = 'noopener noreferrer';

  var head = createEl('div', 'result-course-head');
  var logo = document.createElement('img');
  logo.className = 'result-course-logo';
  logo.src = 'assets/brand/hexschool.svg';
  logo.alt = '六角學院';
  var label = createEl('p', 'result-course-label');
  label.textContent = labelText;
  head.appendChild(logo);
  head.appendChild(label);
  wrap.appendChild(head);

  // Name and reason sit beside a small thumbnail; a full-width banner pulled
  // the eye away from the course name and clashed with the dark theme.
  var body = createEl('div', 'result-course-body');
  var text = createEl('div', 'result-course-text');
  var nameEl = createEl('p', 'result-course-name');
  nameEl.textContent = course.name;
  var reason = createEl('p', 'result-course-reason');
  reason.textContent = course.reason;
  text.appendChild(nameEl);
  text.appendChild(reason);
  body.appendChild(text);
  if (course.image) {
    var thumb = document.createElement('img');
    thumb.className = 'result-course-thumb';
    thumb.src = course.image;
    thumb.alt = '';
    body.appendChild(thumb);
  } else if (isLocalPreview()) {
    // Only on a local preview: marks where the thumbnail will go. The live
    // site shows the text-only card until the course has an image.
    var slot = createEl('div', 'result-course-thumb result-course-thumb--empty');
    slot.textContent = '課程圖';
    body.appendChild(slot);
  }
  wrap.appendChild(body);

  var cta = createEl('span', 'result-course-cta');
  cta.appendChild(document.createTextNode('查看課程'));
  cta.appendChild(buildIconSpan(STAT_ICONS.moveUpRight, 'result-course-arrow'));

  wrap.appendChild(cta);
  return wrap;
}

function animateCountUp(el, target, duration) {
  var start = Date.now();
  var STEP_MS = 30;
  var timer = setInterval(function () {
    var progress = Math.min(1, (Date.now() - start) / duration);
    el.textContent = Math.round(progress * target);
    if (progress >= 1) clearInterval(timer);
  }, STEP_MS);
}

// ---------- 生存卡分享面板 ----------

// Opens straight away with a loading state; main.js hands it the finished
// image with showCard() once the canvas is drawn.
export function renderShareSheet(host, options) {
  var overlay = createEl('div', 'share-overlay');
  var sheet = createEl('div', 'share-sheet');
  sheet.setAttribute('role', 'dialog');
  sheet.setAttribute('aria-modal', 'true');
  sheet.setAttribute('aria-labelledby', 'share-heading');

  var header = createEl('div', 'share-header');
  var title = createEl('h2', 'share-title');
  title.id = 'share-heading';
  title.textContent = '你的生存卡';
  var closeBtn = createEl('button', 'share-close');
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', '關閉');
  closeBtn.innerHTML = UI_ICONS.close;
  closeBtn.addEventListener('click', options.onClose);
  header.appendChild(title);
  header.appendChild(closeBtn);
  sheet.appendChild(header);

  var preview = createEl('div', 'share-preview');
  var loading = createEl('p', 'share-loading');
  loading.textContent = '生存卡生成中……';
  preview.appendChild(loading);
  sheet.appendChild(preview);

  var note = createEl('p', 'share-note');
  note.textContent = '分享、下載或複製連結，任選一個就完成闖關任務';
  sheet.appendChild(note);

  var actions = createEl('div', 'share-actions');
  sheet.appendChild(actions);

  var toast = createEl('p', 'share-toast');
  toast.setAttribute('role', 'status');
  sheet.appendChild(toast);

  overlay.appendChild(sheet);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) options.onClose();
  });
  host.appendChild(overlay);
  document.body.classList.add('notice-open');

  var objectUrl = null;
  var shareMenu = null;

  function actionButton(className, icon, label, onClick) {
    var btn = createEl('button', className);
    btn.type = 'button';
    btn.appendChild(buildIconSpan(icon, 'share-action-icon'));
    btn.appendChild(document.createTextNode(label));
    btn.addEventListener('click', onClick);
    return btn;
  }

  return {
    showCard: function (blob, handlers) {
      objectUrl = URL.createObjectURL(blob);
      preview.innerHTML = '';
      var img = document.createElement('img');
      img.className = 'share-image';
      img.src = objectUrl;
      img.alt = '我的工程師生存卡';
      preview.appendChild(img);

      actions.appendChild(actionButton('btn-hazard share-action-main', UI_ICONS.share, '分享給好友', handlers.onShare));

      // Browsers without a native share sheet (desktop, LINE/FB in-app) get
      // these instead when 分享給好友 is pressed.
      shareMenu = createEl('div', 'share-menu');
      shareMenu.hidden = true;
      shareMenu.appendChild(actionButton('btn-outline share-menu-line', UI_ICONS.share, 'LINE', handlers.onShareLine));
      shareMenu.appendChild(actionButton('btn-outline', UI_ICONS.share, 'Facebook', handlers.onShareFacebook));
      actions.appendChild(shareMenu);

      var row = createEl('div', 'share-action-row');
      row.appendChild(actionButton('btn-outline', UI_ICONS.download, '下載生存卡', handlers.onDownload));
      row.appendChild(actionButton('btn-outline', UI_ICONS.link, '複製遊戲連結', handlers.onCopy));
      actions.appendChild(row);
    },
    showShareMenu: function () {
      if (shareMenu) shareMenu.hidden = false;
    },
    flash: function (message) {
      toast.textContent = message;
      toast.classList.add('share-toast--on');
    },
    close: function () {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      overlay.remove();
      document.body.classList.remove('notice-open');
    }
  };
}

// ---------- 任務完成 ----------

export function renderDone(root, data, options) {
  root.innerHTML = '';
  var screen = createEl('div', 'screen screen--done');
  applyPersonaColors(screen, data.persona);

  if (options.hasError) {
    var warn = createEl('p', 'done-warning');
    warn.setAttribute('role', 'alert');
    warn.textContent = '網路好像不太順，作答資料可能沒送出成功，麻煩跟工作人員說一聲';
    screen.appendChild(warn);
  }

  var stage = createEl('div', 'done-stage');
  var mascot = document.createElement('img');
  mascot.className = 'done-mascot';
  mascot.src = data.persona.mascotImage;
  mascot.alt = '';
  stage.appendChild(mascot);
  var stamp = createEl('div', 'done-stamp');
  var stampEn = createEl('span', 'done-stamp-en');
  stampEn.textContent = 'MISSION COMPLETE';
  var stampZh = createEl('span', 'done-stamp-zh');
  stampZh.textContent = '完成任務';
  stamp.appendChild(stampEn);
  stamp.appendChild(stampZh);
  stage.appendChild(stamp);
  screen.appendChild(stage);

  var who = createEl('p', 'done-who');
  who.textContent = data.nickname + '・' + data.persona.name;
  screen.appendChild(who);

  screen.appendChild(buildCourseCard(data.course, '下一步，推薦你這門課'));
  screen.appendChild(buildFeedbackBox(options.onFeedback));

  var restartBtn = createEl('button', 'btn-text');
  restartBtn.type = 'button';
  restartBtn.textContent = '再玩一次';
  restartBtn.addEventListener('click', options.onRestart);
  screen.appendChild(restartBtn);

  root.appendChild(screen);
}

function buildFeedbackBox(onFeedback) {
  var box = createEl('div', 'feedback-box');
  var title = createEl('h3', 'feedback-title');
  title.textContent = '想要對六角或多角說什麼？';
  var hint = createEl('p', 'feedback-hint');
  hint.textContent = '想學什麼、對課程有疑問，或卡在什麼程式問題，都可以留言給我們（選填）';
  var input = document.createElement('textarea');
  input.className = 'feedback-input';
  input.rows = 3;
  input.maxLength = 500;
  input.placeholder = '例如：轉後端要先學什麼？';
  var status = createEl('p', 'feedback-status');
  status.setAttribute('role', 'status');
  var send = createEl('button', 'btn-outline');
  send.type = 'button';
  send.textContent = '送出留言';

  // 按下就顯示收到，資料在背景送（失敗會自動重送、存在手機稍後補送），
  // 玩家不用等試算表寫完。
  send.addEventListener('click', function () {
    var message = input.value.trim();
    if (!message) {
      status.textContent = '先寫點什麼再送出吧';
      input.focus();
      return;
    }
    onFeedback(message);
    box.innerHTML = '';
    var thanks = createEl('p', 'feedback-thanks');
    thanks.textContent = '收到了，謝謝你的留言！';
    box.appendChild(thanks);
  });

  [title, hint, input, send, status].forEach(function (el) { box.appendChild(el); });
  return box;
}
