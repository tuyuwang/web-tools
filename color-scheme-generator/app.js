/* 配色方案生成器 - 纯前端实现，无依赖 */

// 颜色工具 -----------------------------------------------------------
function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
function round2(v) { return Math.round(v * 100) / 100; }

function normalizeHex(hex) {
  if (!hex) return null;
  const v = hex.trim().replace(/^#/,'').toLowerCase();
  if (/^[0-9a-f]{3}$/.test(v)) return `#${v[0]}${v[0]}${v[1]}${v[1]}${v[2]}${v[2]}`;
  if (/^[0-9a-f]{6}$/.test(v)) return `#${v}`;
  return null;
}

function hexToRgb(hex) {
  const v = normalizeHex(hex);
  if (!v) return null;
  const r = parseInt(v.slice(1,3), 16);
  const g = parseInt(v.slice(3,5), 16);
  const b = parseInt(v.slice(5,7), 16);
  return { r, g, b };
}

function rgbToHex(r, g, b) {
  const toHex = (n) => n.toString(16).padStart(2, '0');
  return `#${toHex(clamp(Math.round(r),0,255))}${toHex(clamp(Math.round(g),0,255))}${toHex(clamp(Math.round(b),0,255))}`;
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > .5 ? d / (2 - max - min) : d / (max + min);
    switch(max){
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h*360), s: Math.round(s*100), l: Math.round(l*100) };
}

function hslToRgb(h, s, l) {
  h = (h % 360 + 360) % 360; s/=100; l/=100;
  function hue2rgb(p, q, t){
    if(t < 0) t += 1;
    if(t > 1) t -= 1;
    if(t < 1/6) return p + (q - p) * 6 * t;
    if(t < 1/2) return q;
    if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  }
  let r, g, b;
  if(s === 0){ r = g = b = l; }
  else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, (h/360) + 1/3);
    g = hue2rgb(p, q, (h/360));
    b = hue2rgb(p, q, (h/360) - 1/3);
  }
  return { r: Math.round(r*255), g: Math.round(g*255), b: Math.round(b*255) };
}

function hslToHex(h, s, l) {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r,g,b);
}

function hexToHsl(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  return rgbToHsl(rgb.r, rgb.g, rgb.b);
}

function relativeLuminance(hex) {
  const rgb = hexToRgb(hex); if (!rgb) return 0;
  const srgb = [rgb.r, rgb.g, rgb.b].map(v => v/255).map(v => v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4));
  return 0.2126*srgb[0] + 0.7152*srgb[1] + 0.0722*srgb[2];
}

function contrastRatio(hex1, hex2) {
  const L1 = relativeLuminance(hex1);
  const L2 = relativeLuminance(hex2);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return round2((lighter + 0.05) / (darker + 0.05));
}

function contrastGrade(ratio) {
  if (ratio >= 7) return { grade: 'AAA', cls: 'pass' };
  if (ratio >= 4.5) return { grade: 'AA', cls: 'pass' };
  if (ratio >= 3) return { grade: 'AA(大字)', cls: 'warn' };
  return { grade: '不达标', cls: 'fail' };
}

function getReadableTextColor(bgHex) {
  const ratioToBlack = contrastRatio(bgHex, '#000000');
  const ratioToWhite = contrastRatio(bgHex, '#ffffff');
  return ratioToBlack > ratioToWhite ? '#000000' : '#ffffff';
}

function formatColor(hex, mode) {
  const norm = normalizeHex(hex) || hex;
  if (mode === 'hex') return norm.toUpperCase();
  if (mode === 'rgb') {
    const {r,g,b} = hexToRgb(norm);
    return `rgb(${r}, ${g}, ${b})`;
  }
  if (mode === 'hsl') {
    const {h,s,l} = hexToHsl(norm);
    return `hsl(${h} ${s}% ${l}%)`;
  }
  return norm.toUpperCase();
}

// 方案生成 -----------------------------------------------------------
function generateAnchors(h, type) {
  const wrap = (x) => (x % 360 + 360) % 360;
  switch (type) {
    case 'monochrome': return [h];
    case 'complementary': return [h, wrap(h+180)];
    case 'analogous': return [wrap(h-30), h, wrap(h+30)];
    case 'triadic': return [h, wrap(h+120), wrap(h+240)];
    case 'tetradic': return [h, wrap(h+90), wrap(h+180), wrap(h+270)];
    case 'square': return [h, wrap(h+90), wrap(h+180), wrap(h+270)];
    case 'split-complementary': return [h, wrap(h+150), wrap(h+210)];
    default: return [h];
  }
}

function generatePalette(baseHex, scheme, count) {
  const base = hexToHsl(baseHex) || { h: 260, s: 60, l: 50 };
  const anchors = generateAnchors(base.h, scheme);
  const colors = [];

  // Lightness & saturation distribution for aesthetic variety
  const lMin = 22, lMax = 82; // avoid extremes for better UI
  const sBase = clamp(base.s, 35, 85);

  for (let i = 0; i < count; i++) {
    const anchorHue = anchors[i % anchors.length];

    // Zig-zag lightness around 50 to create rhythm
    const t = count === 1 ? 0.5 : i / (count - 1);
    const l = Math.round(lMin + (lMax - lMin) * t);

    // Slight saturation modulation across items
    const s = clamp(Math.round(sBase + (Math.sin((i / count) * Math.PI * 2) * 12)), 30, 95);

    colors.push(hslToHex(anchorHue, s, l));
  }

  return colors;
}

// 状态管理 -----------------------------------------------------------
const state = {
  baseColor: '#7755ff',
  scheme: 'analogous',
  count: 5,
  format: 'hex',
  colors: [],
  locks: [], // boolean[] per index
};

// UI 绑定 ------------------------------------------------------------
const els = {
  baseColorPicker: document.getElementById('baseColorPicker'),
  baseColorHex: document.getElementById('baseColorHex'),
  schemeType: document.getElementById('schemeType'),
  colorCount: document.getElementById('colorCount'),
  colorCountValue: document.getElementById('colorCountValue'),
  formatSelect: document.getElementById('formatSelect'),
  generateBtn: document.getElementById('generateBtn'),
  randomizeBtn: document.getElementById('randomizeBtn'),
  exportCssBtn: document.getElementById('exportCssBtn'),
  exportJsonBtn: document.getElementById('exportJsonBtn'),
  exportTailwindBtn: document.getElementById('exportTailwindBtn'),
  shareBtn: document.getElementById('shareBtn'),
  paletteGrid: document.getElementById('paletteGrid'),
  toast: document.getElementById('toast'),
  // contrast
  bgSelect: document.getElementById('bgSelect'),
  fgSelect: document.getElementById('fgSelect'),
  sampleText: document.getElementById('sampleText'),
  contrastRatio: document.getElementById('contrastRatio'),
  contrastGrade: document.getElementById('contrastGrade'),
  previewText: document.getElementById('previewText'),
  contrastPreview: document.getElementById('contrastPreview'),
};

function showToast(text) {
  els.toast.textContent = text;
  els.toast.classList.add('show');
  setTimeout(() => els.toast.classList.remove('show'), 1200);
}

function randomHex() {
  const n = Math.floor(Math.random() * 0xffffff);
  return `#${n.toString(16).padStart(6, '0')}`;
}

function updateCountLabel() { els.colorCountValue.textContent = String(state.count); }

function syncBaseColorInputs(hex) {
  els.baseColorPicker.value = hex;
  els.baseColorHex.value = hex;
}

function updateUrlHash() {
  const params = new URLSearchParams();
  params.set('base', state.baseColor.replace('#',''));
  params.set('scheme', state.scheme);
  params.set('count', String(state.count));
  params.set('fmt', state.format);
  // persist colors if any lock or reorder applied
  if (state.colors?.length) params.set('colors', state.colors.map(c => c.replace('#','')).join('-'));
  location.hash = params.toString();
}

function loadFromHash() {
  if (!location.hash) return false;
  const params = new URLSearchParams(location.hash.slice(1));
  const base = normalizeHex(params.get('base'));
  const scheme = params.get('scheme');
  const count = Number(params.get('count'));
  const fmt = params.get('fmt');
  if (base) state.baseColor = base;
  if (scheme) state.scheme = scheme;
  if (Number.isFinite(count) && count >= 3 && count <= 10) state.count = count;
  if (fmt) state.format = fmt;
  const colorsStr = params.get('colors');
  if (colorsStr) {
    state.colors = colorsStr.split('-').map(h => normalizeHex(h));
    state.count = state.colors.length;
    state.locks = state.colors.map(() => false);
    return true;
  }
  return false;
}

function renderPalette() {
  const grid = els.paletteGrid;
  grid.innerHTML = '';
  const fragment = document.createDocumentFragment();

  state.colors.forEach((hex, idx) => {
    const textColor = getReadableTextColor(hex);

    const item = document.createElement('div');
    item.className = 'swatch';
    item.setAttribute('draggable', 'true');
    item.dataset.index = String(idx);

    const body = document.createElement('div');
    body.className = 'swatch-body';
    body.style.backgroundColor = hex;

    const actions = document.createElement('div');
    actions.className = 'swatch-actions';

    const left = document.createElement('div');
    left.className = 'left-actions';

    const dragBtn = document.createElement('button');
    dragBtn.className = 'icon-btn drag-handle';
    dragBtn.innerText = '↕';
    dragBtn.title = '拖拽排序';

    const lockBtn = document.createElement('button');
    lockBtn.className = 'icon-btn';
    lockBtn.setAttribute('aria-pressed', state.locks[idx] ? 'true' : 'false');
    lockBtn.innerText = state.locks[idx] ? '🔒' : '🔓';
    lockBtn.title = '锁定/解锁';

    left.appendChild(dragBtn);
    left.appendChild(lockBtn);

    const right = document.createElement('div');
    right.className = 'right-actions';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'icon-btn';
    copyBtn.innerText = '⧉ 复制';

    right.appendChild(copyBtn);

    actions.appendChild(left);
    actions.appendChild(right);

    const value = document.createElement('div');
    value.className = 'color-value';
    value.style.color = textColor;
    value.textContent = formatColor(hex, state.format);

    body.appendChild(actions);
    body.appendChild(value);
    item.appendChild(body);
    fragment.appendChild(item);

    // interactions
    copyBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await navigator.clipboard.writeText(formatColor(hex, state.format));
      showToast('已复制');
    });

    lockBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      state.locks[idx] = !state.locks[idx];
      lockBtn.setAttribute('aria-pressed', state.locks[idx] ? 'true' : 'false');
      lockBtn.innerText = state.locks[idx] ? '🔒' : '🔓';
    });

    item.addEventListener('click', async () => {
      await navigator.clipboard.writeText(formatColor(hex, state.format));
      showToast('已复制');
    });

    // drag & drop
    item.addEventListener('dragstart', (ev) => {
      ev.dataTransfer.setData('text/plain', String(idx));
    });
    item.addEventListener('dragover', (ev) => { ev.preventDefault(); });
    item.addEventListener('drop', (ev) => {
      ev.preventDefault();
      const from = Number(ev.dataTransfer.getData('text/plain'));
      const to = idx;
      if (!Number.isFinite(from) || from === to) return;
      moveSwatch(from, to);
    });
  });

  grid.appendChild(fragment);

  populateContrastSelectors();
  updateUrlHash();
}

function moveSwatch(fromIndex, toIndex) {
  const c = state.colors.splice(fromIndex, 1)[0];
  const l = state.locks.splice(fromIndex, 1)[0];
  state.colors.splice(toIndex, 0, c);
  state.locks.splice(toIndex, 0, l);
  renderPalette();
}

function regenerate() {
  const next = generatePalette(state.baseColor, state.scheme, state.count);
  // apply locks
  state.colors = next.map((hex, idx) => state.locks[idx] ? (state.colors[idx] || hex) : hex);
  // ensure locks array length
  state.locks = Array.from({ length: state.count }, (_, i) => state.locks[i] || false);
  renderPalette();
}

function randomize() {
  state.baseColor = randomHex();
  syncBaseColorInputs(state.baseColor);
  // random scheme
  const types = ['monochrome','complementary','split-complementary','analogous','triadic','tetradic','square'];
  state.scheme = types[Math.floor(Math.random()*types.length)];
  els.schemeType.value = state.scheme;
  regenerate();
}

// 导出 ---------------------------------------------------------------
function exportCss() {
  const vars = state.colors.map((c,i)=>`  --color-${i+1}: ${c};`).join('\n');
  const content = `:root{\n${vars}\n}`;
  downloadText('palette.css', content);
}

function exportJson() {
  const obj = { name: 'Palette', scheme: state.scheme, base: state.baseColor, colors: state.colors };
  downloadText('palette.json', JSON.stringify(obj, null, 2));
}

function exportTailwind() {
  const lines = state.colors.map((c,i)=>`      'palette-${i+1}': '${c}',`).join('\n');
  const content = `module.exports = {\n  theme: {\n    extend: {\n      colors: {\n${lines}\n      }\n    }\n  }\n}`;
  downloadText('tailwind-palette.js', content);
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(()=>URL.revokeObjectURL(url), 500);
}

// 对比度 -------------------------------------------------------------
function populateContrastSelectors() {
  const options = state.colors.map((c,i)=>`<option value="${c}">颜色 ${i+1} (${c.toUpperCase()})</option>`).join('');
  els.bgSelect.innerHTML = options;
  const fixed = ['#000000', '#ffffff'];
  const fgOptions = [ ...fixed.map(c => `<option value="${c}">${c.toUpperCase()}</option>`), options ].join('');
  els.fgSelect.innerHTML = fgOptions;
  // set defaults
  els.bgSelect.selectedIndex = 0;
  els.fgSelect.selectedIndex = 1; // white
  updateContrastPreview();
}

function updateContrastPreview() {
  const bg = els.bgSelect.value || '#000000';
  const fg = els.fgSelect.value || '#ffffff';
  const ratio = contrastRatio(bg, fg);
  const { grade, cls } = contrastGrade(ratio);
  els.contrastRatio.textContent = `${ratio}:1`;
  els.contrastGrade.textContent = grade;
  els.contrastGrade.className = `badge ${cls}`;
  els.previewText.textContent = els.sampleText.value || '';
  els.previewText.style.color = fg;
  els.previewText.parentElement.style.background = bg;
}

// 事件监听 -----------------------------------------------------------
function bindEvents() {
  els.baseColorPicker.addEventListener('input', (e) => {
    const hex = normalizeHex(e.target.value);
    if (!hex) return;
    state.baseColor = hex; els.baseColorHex.value = hex; regenerate();
  });
  els.baseColorHex.addEventListener('input', (e) => {
    const hex = normalizeHex(e.target.value);
    if (!hex) return;
    state.baseColor = hex; els.baseColorPicker.value = hex; // update picker
  });
  els.baseColorHex.addEventListener('change', () => {
    const hex = normalizeHex(els.baseColorHex.value);
    if (!hex) { showToast('无效的HEX'); syncBaseColorInputs(state.baseColor); return; }
    state.baseColor = hex; syncBaseColorInputs(hex); regenerate();
  });

  els.schemeType.addEventListener('change', (e) => { state.scheme = e.target.value; regenerate(); });

  els.colorCount.addEventListener('input', (e) => { state.count = Number(e.target.value); updateCountLabel(); });
  els.colorCount.addEventListener('change', regenerate);

  els.formatSelect.addEventListener('change', (e) => { state.format = e.target.value; renderPalette(); });

  els.generateBtn.addEventListener('click', regenerate);
  els.randomizeBtn.addEventListener('click', randomize);

  els.exportCssBtn.addEventListener('click', exportCss);
  els.exportJsonBtn.addEventListener('click', exportJson);
  els.exportTailwindBtn.addEventListener('click', exportTailwind);

  els.shareBtn.addEventListener('click', () => { updateUrlHash(); navigator.clipboard.writeText(location.href); showToast('链接已复制'); });

  // contrast
  els.bgSelect.addEventListener('change', updateContrastPreview);
  els.fgSelect.addEventListener('change', updateContrastPreview);
  els.sampleText.addEventListener('input', updateContrastPreview);
}

// 初始化 -------------------------------------------------------------
(function init(){
  const hasColors = loadFromHash();
  syncBaseColorInputs(state.baseColor);
  els.schemeType.value = state.scheme;
  els.colorCount.value = String(state.count);
  updateCountLabel();
  els.formatSelect.value = state.format;

  if (!hasColors) {
    state.colors = generatePalette(state.baseColor, state.scheme, state.count);
    state.locks = Array.from({ length: state.count }, () => false);
  }

  renderPalette();
  bindEvents();
})();