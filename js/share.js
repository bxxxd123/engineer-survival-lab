// 生存卡：結果頁按「產生我的生存卡」後畫出來的分享圖。
// 版面跟首頁同一套科技末世配色（槍灰黑底、螢光綠、琥珀黃），
// 底部放遊戲網址和 QR code，朋友只看到截圖也進得來。

// 正式網址。換網域時，這裡跟 assets/brand/qr-game.png 都要一起換。
export var GAME_URL = 'https://bxxxd123.github.io/engineer-survival-lab/';

var W = 1080;
var PAD = 60;
var INNER_L = 130;
var INNER_R = 950;
var INNER_W = INNER_R - INNER_L;
var FONT = '"Noto Sans TC", "Inter", "PingFang TC", sans-serif';
var MONO = '"Chakra Petch", "Inter", sans-serif';

var C = {
  bg: '#080B0C',
  bg2: '#0F1416',
  panel: 'rgba(13, 18, 20, 0.94)',
  text: '#E6ECE8',
  muted: '#8D9A95',
  neon: '#C6FF1A',
  amber: '#FFB928',
  danger: '#FF4D3D',
  ink: '#0A0D0B'
};

var TAG_H = 62;

function loadImage(src) {
  return new Promise(function (resolve) {
    if (!src) { resolve(null); return; }
    var img = new Image();
    img.onload = function () { resolve(img); };
    img.onerror = function () { resolve(null); };
    img.src = src;
  });
}

// Canvas falls back to a system font silently if the web font has not been
// fetched yet, so make sure every face the card uses is ready first.
function loadFonts() {
  if (!document.fonts || !document.fonts.load) return Promise.resolve();
  return Promise.all([
    document.fonts.load('900 60px "Noto Sans TC"', '工程師生存'),
    document.fonts.load('700 28px "Noto Sans TC"', '工程師生存'),
    document.fonts.load('500 24px "Noto Sans TC"', '工程師生存'),
    document.fonts.load('700 22px "Chakra Petch"', 'SURVIVAL')
  ]).catch(function () {});
}

export async function exportResultCardImage(data) {
  var accent = data.persona.accent || C.neon;
  var assets = await Promise.all([
    loadImage(data.persona.mascotImage),
    loadImage(data.goalImage),
    loadImage('assets/brand/hexschool.svg'),
    loadImage('assets/brand/polygon.svg'),
    loadImage('assets/brand/qr-game.png'),
    loadFonts()
  ]);
  var mascotImg = assets[0];
  var goalImg = assets[1];
  var logos = [assets[2], assets[3]];
  var qrImg = assets[4];

  var stackTags = (data.careerBugLabel || '').indexOf('、') !== -1;
  var y = {};
  y.brands = 52;
  y.panelTop = 170;
  y.mascot = 262;
  y.greeting = 222;
  y.badge = 612;
  y.name = 822;
  y.english = 864;
  y.score = 748;
  y.stats = 942;
  y.highlight = y.stats + 4 * 92 + 10;
  y.tags = y.highlight + 130;
  y.mission = y.tags + (stackTags ? TAG_H * 2 + 14 : TAG_H) + 44;
  y.panelBottom = y.mission + 170;
  y.footer = y.panelBottom + 40;
  var height = y.footer + 250;

  var canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = height;
  var ctx = canvas.getContext('2d');

  drawBackground(ctx, height);
  drawBrands(ctx, logos, y.brands);
  drawPanel(ctx, accent, y.panelTop, y.panelBottom);
  drawMascot(ctx, mascotImg, accent, y.mascot);
  drawHeading(ctx, data, accent, y);
  drawStats(ctx, data, accent, y.stats);
  drawHighlight(ctx, data, accent, y.highlight);
  drawTags(ctx, data, y.tags, stackTags);
  drawMission(ctx, data, goalImg, y.mission);
  drawFooter(ctx, qrImg, y.footer);

  return canvas;
}

export function canvasToBlob(canvas) {
  return new Promise(function (resolve) {
    canvas.toBlob(function (blob) { resolve(blob); }, 'image/png');
  });
}

// Resolves true once the player has picked somewhere to send it, false if
// they backed out of the share sheet. Platforms that cannot share an image
// share the link alone; anything that throws falls back to a download.
export function shareCard(blob, text, url) {
  var file = new File([blob], 'engineer-survival-card.png', { type: 'image/png' });
  var payload;
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    // Several apps drop `url` when files are attached, so the link also
    // rides along in the text.
    payload = { files: [file], title: '我的工程師生存卡', text: text + '\n' + url };
  } else if (navigator.share) {
    payload = { title: '我的工程師生存卡', text: text, url: url };
  } else {
    downloadCard(blob);
    return Promise.resolve(true);
  }
  return navigator.share(payload).then(function () {
    return true;
  }).catch(function (err) {
    if (err && err.name === 'AbortError') return false;
    downloadCard(blob);
    return true;
  });
}

export function downloadCard(blob) {
  var url = URL.createObjectURL(blob);
  var link = document.createElement('a');
  link.href = url;
  link.download = 'engineer-survival-card.png';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
}

export function copyGameLink(text) {
  var value = text + '\n' + GAME_URL;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(value).catch(function () { legacyCopy(value); });
  }
  legacyCopy(value);
  return Promise.resolve();
}

function legacyCopy(value) {
  var area = document.createElement('textarea');
  area.value = value;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  try { document.execCommand('copy'); } catch (e) { /* nothing else to try */ }
  document.body.removeChild(area);
}

function drawBackground(ctx, height) {
  var g = ctx.createLinearGradient(0, 0, 0, height);
  g.addColorStop(0, C.bg);
  g.addColorStop(1, C.bg2);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, height);

  var glow = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, 700);
  glow.addColorStop(0, 'rgba(198, 255, 26, 0.12)');
  glow.addColorStop(1, 'rgba(198, 255, 26, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, height);

  ctx.strokeStyle = 'rgba(198, 255, 26, 0.045)';
  ctx.lineWidth = 1;
  for (var gx = 0; gx <= W; gx += 40) {
    ctx.beginPath(); ctx.moveTo(gx + 0.5, 0); ctx.lineTo(gx + 0.5, height); ctx.stroke();
  }
  for (var gy = 0; gy <= height; gy += 40) {
    ctx.beginPath(); ctx.moveTo(0, gy + 0.5); ctx.lineTo(W, gy + 0.5); ctx.stroke();
  }

  drawHazardStripe(ctx, 0, 0, W, 14, C.neon);
  drawHazardStripe(ctx, 0, height - 14, W, 14, C.neon);
}

function drawHazardStripe(ctx, x, y, w, h, color) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.fillStyle = C.ink;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = color;
  for (var sx = x - h; sx < x + w + h; sx += 32) {
    ctx.beginPath();
    ctx.moveTo(sx, y + h);
    ctx.lineTo(sx + 16, y + h);
    ctx.lineTo(sx + 16 + h, y);
    ctx.lineTo(sx + h, y);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawBrands(ctx, logos, top) {
  var names = ['六角學院', '多角人才'];
  var centers = [W / 2 - 120, W / 2 + 120];
  ctx.textAlign = 'center';
  logos.forEach(function (img, i) {
    if (img) {
      var h = 46;
      var w = (img.width / img.height) * h;
      ctx.drawImage(img, centers[i] - w / 2, top, w, h);
    }
    ctx.fillStyle = C.text;
    ctx.font = '700 22px ' + FONT;
    ctx.fillText(names[i], centers[i], top + 82);
  });
  ctx.fillStyle = C.neon;
  ctx.font = '700 30px ' + FONT;
  ctx.fillText('×', W / 2, top + 34);
}

function drawPanel(ctx, accent, top, bottom) {
  ctx.fillStyle = C.panel;
  ctx.fillRect(PAD, top, W - PAD * 2, bottom - top);
  ctx.strokeStyle = 'rgba(198, 255, 26, 0.18)';
  ctx.lineWidth = 2;
  ctx.strokeRect(PAD + 1, top + 1, W - PAD * 2 - 2, bottom - top - 2);

  // HUD corner brackets in the persona colour
  var len = 44;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 5;
  [[PAD, top, 1, 1], [W - PAD, top, -1, 1], [PAD, bottom, 1, -1], [W - PAD, bottom, -1, -1]].forEach(function (c) {
    ctx.beginPath();
    ctx.moveTo(c[0], c[1] + c[3] * len);
    ctx.lineTo(c[0], c[1]);
    ctx.lineTo(c[0] + c[2] * len, c[1]);
    ctx.stroke();
  });
}

function drawMascot(ctx, img, accent, top) {
  var cx = W / 2;
  var cy = top + 170;
  // radar rings behind the character
  ctx.save();
  ctx.strokeStyle = hexToRgba(accent, 0.35);
  ctx.lineWidth = 2;
  [150, 100, 50].forEach(function (r) {
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  });
  ctx.beginPath(); ctx.moveTo(cx - 170, cy); ctx.lineTo(cx + 170, cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, cy - 170); ctx.lineTo(cx, cy + 170); ctx.stroke();
  var glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 170);
  glow.addColorStop(0, hexToRgba(accent, 0.22));
  glow.addColorStop(1, hexToRgba(accent, 0));
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(cx, cy, 170, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  if (!img) return;
  var h = 330;
  var w = (img.width / img.height) * h;
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
  ctx.shadowBlur = 30;
  ctx.drawImage(img, cx - w / 2, top, w, h);
  ctx.restore();
}

function drawHeading(ctx, data, accent, y) {
  ctx.textAlign = 'center';
  if (data.nickname) {
    ctx.fillStyle = accent;
    ctx.font = '700 26px ' + FONT;
    ctx.fillText(data.nickname + ' 的生存報告出爐了！', W / 2, y.greeting);
  }

  ctx.font = '700 22px ' + MONO;
  var badgeText = 'SURVIVAL SCORE';
  var bw = ctx.measureText(badgeText).width + 60;
  ctx.fillStyle = hexToRgba(accent, 0.12);
  ctx.fillRect(W / 2 - bw / 2, y.badge, bw, 44);
  ctx.strokeStyle = hexToRgba(accent, 0.6);
  ctx.lineWidth = 2;
  ctx.strokeRect(W / 2 - bw / 2, y.badge, bw, 44);
  ctx.fillStyle = accent;
  ctx.textBaseline = 'middle';
  ctx.fillText(badgeText, W / 2, y.badge + 23);
  ctx.textBaseline = 'alphabetic';

  ctx.fillStyle = C.text;
  ctx.font = '900 66px ' + FONT;
  ctx.fillText(data.persona.name, W / 2, y.name);

  ctx.fillStyle = C.muted;
  ctx.font = '700 22px ' + MONO;
  ctx.fillText(spaced(data.persona.englishName || ''), W / 2, y.english);

  // 生存率：數字對準正中間，「%」掛在右邊、不參與置中
  ctx.textAlign = 'center';
  ctx.fillStyle = accent;
  ctx.font = '700 88px ' + MONO;
  var numText = String(data.survivalIndex);
  var numW = ctx.measureText(numText).width;
  ctx.fillText(numText, W / 2, y.score);
  ctx.textAlign = 'left';
  ctx.font = '700 42px ' + MONO;
  ctx.fillText('%', W / 2 + numW / 2 + 4, y.score - 10);
  ctx.textAlign = 'center';
}

// Bars are drawn as discrete segments, like an ammo/health meter in a HUD.
function drawSegmentBar(ctx, x, y, w, h, ratio, color) {
  var segments = 20;
  var gap = 4;
  var segW = (w - gap * (segments - 1)) / segments;
  var lit = Math.round(segments * Math.max(0, Math.min(1, ratio)));
  for (var i = 0; i < segments; i++) {
    ctx.fillStyle = i < lit ? color : 'rgba(255, 255, 255, 0.07)';
    ctx.fillRect(x + i * (segW + gap), y, segW, h);
  }
}

function drawStats(ctx, data, accent, top) {
  var rows = [
    ['工作穩定度', data.dimensions.stability],
    ['AI 適應度', data.dimensions.aiAdapt],
    ['轉職雷達', data.dimensions.radar],
    ['職涯卡點指數', data.dimensions.careerBugIndex]
  ];
  rows.forEach(function (row, i) {
    var labelY = top + i * 92;
    var percent = Math.round((row[1] / 5) * 100);
    ctx.textAlign = 'left';
    ctx.fillStyle = C.text;
    ctx.font = '500 28px ' + FONT;
    ctx.fillText(row[0], INNER_L, labelY);
    ctx.textAlign = 'right';
    ctx.fillStyle = accent;
    ctx.font = '700 28px ' + MONO;
    ctx.fillText(percent + '%', INNER_R, labelY);
    drawSegmentBar(ctx, INNER_L, labelY + 18, INNER_W, 14, percent / 100, accent);
  });
  ctx.textAlign = 'left';
}

function drawHighlight(ctx, data, accent, top) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
  ctx.fillRect(INNER_L, top, INNER_W, 100);
  ctx.fillStyle = accent;
  ctx.fillRect(INNER_L, top, 6, 100);
  ctx.fillStyle = C.text;
  ctx.font = '700 30px ' + FONT;
  ctx.textAlign = 'left';
  wrapText(ctx, data.persona.highlight, INNER_L + 34, top + 46, INNER_W - 60, 40);
}

function drawTags(ctx, data, top, stack) {
  var half = (INNER_W - 16) / 2;
  var bugW = stack ? INNER_W : half;
  drawTag(ctx, INNER_L, top, bugW, 'bug', C.danger, '職涯卡點：' + data.careerBugLabel);
  var buffX = stack ? INNER_L : INNER_L + half + 16;
  var buffY = stack ? top + TAG_H + 14 : top;
  drawTag(ctx, buffX, buffY, half, 'zap', C.neon, data.aiBuffLabel);
}

function drawTag(ctx, x, y, w, icon, color, text) {
  ctx.fillStyle = hexToRgba(color, 0.1);
  ctx.fillRect(x, y, w, TAG_H);
  ctx.strokeStyle = hexToRgba(color, 0.45);
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, w - 2, TAG_H - 2);
  var iconSize = 24;
  drawInlineIcon(ctx, icon, x + 20, y + TAG_H / 2 - iconSize / 2, iconSize, color);
  ctx.fillStyle = color;
  ctx.font = '700 23px ' + FONT;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  wrapText(ctx, text, x + 20 + iconSize + 12, y + TAG_H / 2 + 1, w - 40 - iconSize - 12, 26);
  ctx.textBaseline = 'alphabetic';
}

function drawMission(ctx, data, goalImg, top) {
  ctx.textAlign = 'center';
  ctx.fillStyle = C.amber;
  ctx.font = '700 20px ' + MONO;
  ctx.fillText(spaced('NEXT MISSION · 2027'), W / 2, top);

  var iconSize = goalImg ? 92 : 30;
  ctx.font = '900 34px ' + FONT;
  var textW = ctx.measureText(data.goalLabel).width;
  var gap = 18;
  var startX = W / 2 - (iconSize + gap + textW) / 2;
  var rowMid = top + 70;
  if (goalImg) {
    ctx.drawImage(goalImg, startX, rowMid - iconSize / 2, iconSize, iconSize);
  } else {
    drawInlineIcon(ctx, 'trophy', startX, rowMid - iconSize / 2, iconSize, C.amber);
  }
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = C.text;
  ctx.fillText(data.goalLabel, startX + iconSize + gap, rowMid);
  ctx.textBaseline = 'alphabetic';
}

function drawFooter(ctx, qrImg, top) {
  var qrSize = 180;
  var qrX = PAD + 10;
  if (qrImg) {
    ctx.fillStyle = C.neon;
    ctx.fillRect(qrX - 6, top - 6, qrSize + 12, qrSize + 12);
    ctx.drawImage(qrImg, qrX, top, qrSize, qrSize);
  }
  var tx = qrX + qrSize + 40;
  ctx.textAlign = 'left';
  ctx.fillStyle = C.neon;
  ctx.font = '700 20px ' + MONO;
  ctx.fillText(spaced('JOIN THE MISSION'), tx, top + 36);
  ctx.fillStyle = C.text;
  ctx.font = '900 36px ' + FONT;
  ctx.fillText('你是哪一種工程師生存者？', tx, top + 86);
  ctx.fillStyle = C.muted;
  ctx.font = '500 24px ' + FONT;
  ctx.fillText('掃描 QR code 來測你的生存指數', tx, top + 128);
  ctx.fillStyle = C.text;
  ctx.font = '600 20px ' + MONO;
  ctx.fillText(GAME_URL.replace(/^https?:\/\//, '').replace(/\/$/, ''), tx, top + 168);
}

function spaced(text) {
  return text.split('').join(String.fromCharCode(8202));
}

function drawInlineIcon(ctx, type, x, y, size, color) {
  var cx = x + size / 2;
  var cy = y + size / 2;
  var r = size / 2;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(1.5, size * 0.1);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (type === 'search') {
    ctx.beginPath();
    ctx.arc(cx - r * 0.12, cy - r * 0.12, r * 0.52, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + r * 0.28, cy + r * 0.28);
    ctx.lineTo(cx + r * 0.78, cy + r * 0.78);
    ctx.stroke();
  } else if (type === 'target') {
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.82, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.42, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.1, 0, Math.PI * 2); ctx.fill();
  } else if (type === 'warning') {
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 0.85);
    ctx.lineTo(cx + r * 0.85, cy + r * 0.65);
    ctx.lineTo(cx - r * 0.85, cy + r * 0.65);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 0.18);
    ctx.lineTo(cx, cy + r * 0.14);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy + r * 0.42, r * 0.06, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'compass') {
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.82, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.34, cy + r * 0.4);
    ctx.lineTo(cx + r * 0.14, cy - r * 0.14);
    ctx.lineTo(cx + r * 0.34, cy - r * 0.4);
    ctx.lineTo(cx - r * 0.14, cy + r * 0.14);
    ctx.closePath();
    ctx.fill();
  } else if (type === 'bug') {
    ctx.beginPath();
    ctx.ellipse(cx, cy + r * 0.05, r * 0.42, r * 0.58, 0, 0, Math.PI * 2);
    ctx.stroke();
    [-1, 0, 1].forEach(function (t) {
      ctx.beginPath(); ctx.moveTo(cx - r * 0.4, cy + t * r * 0.45); ctx.lineTo(cx - r * 0.85, cy + t * r * 0.6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + r * 0.4, cy + t * r * 0.45); ctx.lineTo(cx + r * 0.85, cy + t * r * 0.6); ctx.stroke();
    });
    ctx.beginPath(); ctx.moveTo(cx, cy - r * 0.58); ctx.lineTo(cx, cy - r * 0.9); ctx.stroke();
  } else if (type === 'zap') {
    ctx.beginPath();
    ctx.moveTo(cx + r * 0.12, cy - r * 0.85);
    ctx.lineTo(cx - r * 0.5, cy + r * 0.1);
    ctx.lineTo(cx - r * 0.05, cy + r * 0.1);
    ctx.lineTo(cx - r * 0.12, cy + r * 0.85);
    ctx.lineTo(cx + r * 0.5, cy - r * 0.1);
    ctx.lineTo(cx + r * 0.05, cy - r * 0.1);
    ctx.closePath();
    ctx.fill();
  } else if (type === 'trophy') {
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.45, cy - r * 0.8);
    ctx.lineTo(cx - r * 0.45, cy - r * 0.05);
    ctx.quadraticCurveTo(cx - r * 0.45, cy + r * 0.35, cx, cy + r * 0.35);
    ctx.quadraticCurveTo(cx + r * 0.45, cy + r * 0.35, cx + r * 0.45, cy - r * 0.05);
    ctx.lineTo(cx + r * 0.45, cy - r * 0.8);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath(); ctx.arc(cx - r * 0.6, cy - r * 0.45, r * 0.22, Math.PI * 0.25, Math.PI * 1.4); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx + r * 0.6, cy - r * 0.45, r * 0.22, Math.PI * 1.6, Math.PI * 0.75); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy + r * 0.35); ctx.lineTo(cx, cy + r * 0.55); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - r * 0.28, cy + r * 0.8); ctx.lineTo(cx + r * 0.28, cy + r * 0.8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy + r * 0.55); ctx.lineTo(cx, cy + r * 0.8); ctx.stroke();
  }
  ctx.restore();
}


function hexToRgba(hex, alpha) {
  var normalized = hex.replace('#', '');
  var r = parseInt(normalized.substring(0, 2), 16);
  var g = parseInt(normalized.substring(2, 4), 16);
  var b = parseInt(normalized.substring(4, 6), 16);
  return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  var chars = String(text || '').split('');
  var line = '';
  var currentY = y;
  chars.forEach(function (char) {
    var testLine = line + char;
    if (ctx.measureText(testLine).width > maxWidth && line.length > 0) {
      ctx.fillText(line, x, currentY);
      line = char;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  });
  if (line) {
    ctx.fillText(line, x, currentY);
  }
  return currentY;
}
