const elements = {
  startEyeDropperBtn: document.getElementById('btn-start-eyedropper'),
  startCaptureBtn: document.getElementById('btn-start-capture'),
  clearHistoryBtn: document.getElementById('btn-clear-history'),
  currentSwatch: document.getElementById('current-swatch'),
  hexValue: document.getElementById('hex-value'),
  rgbValue: document.getElementById('rgb-value'),
  hslValue: document.getElementById('hsl-value'),
  historyList: document.getElementById('history-list'),
  ratioWhite: document.getElementById('ratio-white'),
  ratioBlack: document.getElementById('ratio-black'),
  contrastOnWhite: document.getElementById('contrast-on-white'),
  contrastOnBlack: document.getElementById('contrast-on-black'),
  overlay: document.getElementById('overlay'),
  overlayCanvas: document.getElementById('overlay-canvas'),
  overlayZoom: document.getElementById('overlay-zoom'),
  overlayCancelBtn: document.getElementById('btn-cancel-overlay'),
};

const STORAGE_KEY = 'screen-color-picker:history';
const MAX_HISTORY = 24;

function showToast(message) {
  const tpl = document.getElementById('toast-template');
  const toast = tpl.content.firstElementChild.cloneNode(true);
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

function clamp01(v) { return Math.max(0, Math.min(1, v)); }

function hexToRgb(hex) {
  const value = hex.replace('#', '').trim();
  const normalized = value.length === 3
    ? value.split('').map(ch => ch + ch).join('')
    : value;
  const intVal = parseInt(normalized, 16);
  return {
    r: (intVal >> 16) & 255,
    g: (intVal >> 8) & 255,
    b: intVal & 255
  };
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b]
    .map(v => v.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function formatRgb({ r, g, b }) { return `rgb(${r}, ${g}, ${b})`; }
function formatHsl({ h, s, l }) { return `hsl(${h}deg, ${s}%, ${l}%)`; }

function relativeLuminance({ r, g, b }) {
  const sRGB = [r, g, b].map(v => v / 255).map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
}

function contrastRatio(rgb1, rgb2) {
  const L1 = relativeLuminance(rgb1);
  const L2 = relativeLuminance(rgb2);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return ((lighter + 0.05) / (darker + 0.05));
}

function updateUIWithHex(hex) {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  elements.currentSwatch.style.background = hex;
  elements.hexValue.value = hex;
  elements.rgbValue.value = formatRgb(rgb);
  elements.hslValue.value = formatHsl(hsl);

  // Contrast
  const ratioWhite = contrastRatio(rgb, { r: 255, g: 255, b: 255 });
  const ratioBlack = contrastRatio(rgb, { r: 0, g: 0, b: 0 });
  elements.ratioWhite.textContent = ratioWhite.toFixed(2) + ':1';
  elements.ratioBlack.textContent = ratioBlack.toFixed(2) + ':1';
  elements.contrastOnWhite.style.background = '#ffffff';
  elements.contrastOnWhite.style.color = hex;
  elements.contrastOnWhite.textContent = 'Aa 文本';
  elements.contrastOnBlack.style.background = '#000000';
  elements.contrastOnBlack.style.color = hex;
  elements.contrastOnBlack.textContent = 'Aa 文本';
}

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (Array.isArray(list)) return list;
    return [];
  } catch { return []; }
}

function saveHistory(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_HISTORY)));
}

function addToHistory(hex) {
  let list = loadHistory();
  list = [hex, ...list.filter(c => c.toUpperCase() !== hex.toUpperCase())];
  if (list.length > MAX_HISTORY) list = list.slice(0, MAX_HISTORY);
  saveHistory(list);
  renderHistory();
}

function renderHistory() {
  const list = loadHistory();
  elements.historyList.innerHTML = '';
  list.forEach(hex => {
    const chip = document.createElement('button');
    chip.className = 'chip';
    chip.style.background = hex;
    chip.title = hex;
    chip.addEventListener('click', () => {
      updateUIWithHex(hex);
    });
    elements.historyList.appendChild(chip);
  });
}

async function copyFromTarget(selector) {
  const el = document.querySelector(selector);
  if (!el) return;
  await navigator.clipboard.writeText(el.value);
  showToast('已复制: ' + el.value);
}

function supportsEyeDropper() {
  return 'EyeDropper' in window;
}

let eyeDropperAbortController = null;
async function startEyeDropper() {
  if (!supportsEyeDropper()) {
    showToast('当前浏览器不支持 EyeDropper，尝试使用屏幕捕获');
    await startCapturePicker();
    return;
  }
  try {
    if (eyeDropperAbortController) eyeDropperAbortController.abort();
    eyeDropperAbortController = new AbortController();
    const dropper = new window.EyeDropper();
    const result = await dropper.open({ signal: eyeDropperAbortController.signal });
    const hex = result.sRGBHex.toUpperCase();
    updateUIWithHex(hex);
    addToHistory(hex);
  } catch (err) {
    if (err && err.name === 'AbortError') return;
    if (err && err.name === 'NotAllowedError') {
      showToast('取色被拒绝');
    }
  }
}

function setupOverlayVisible(visible) {
  elements.overlay.classList.toggle('hidden', !visible);
  elements.overlay.setAttribute('aria-hidden', String(!visible));
}

function drawContain(ctx, imgW, imgH, canvasW, canvasH) {
  // Returns {dx, dy, dw, dh} that were drawn and scale mapping function
  const scale = Math.min(canvasW / imgW, canvasH / imgH);
  const dw = imgW * scale;
  const dh = imgH * scale;
  const dx = (canvasW - dw) / 2;
  const dy = (canvasH - dh) / 2;
  ctx.clearRect(0, 0, canvasW, canvasH);
  return { dx, dy, dw, dh, scale };
}

async function startCapturePicker() {
  let stream;
  try {
    stream = await navigator.mediaDevices.getDisplayMedia({ video: { displaySurface: 'monitor' }, audio: false });
  } catch (err) {
    showToast('未授予屏幕捕获权限');
    return;
  }

  const video = document.createElement('video');
  video.srcObject = stream;
  video.muted = true;
  video.playsInline = true;

  const canvas = elements.overlayCanvas;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const zoomCanvas = elements.overlayZoom;
  const zoomCtx = zoomCanvas.getContext('2d');

  const cleanup = () => {
    stream.getTracks().forEach(t => t.stop());
    setupOverlayVisible(false);
    window.removeEventListener('keydown', onKeyDown);
    canvas.onmousemove = null;
    canvas.onclick = null;
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      cleanup();
    }
  };

  elements.overlayCancelBtn.onclick = cleanup;
  window.addEventListener('keydown', onKeyDown);
  setupOverlayVisible(true);

  await video.play().catch(() => {});
  await new Promise(resolve => {
    if (video.readyState >= 2) return resolve();
    video.onloadeddata = () => resolve();
    video.onloadedmetadata = () => resolve();
  });

  // Size canvas to window and draw current frame
  const redraw = () => {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const width = Math.floor(window.innerWidth * 0.92);
    const height = Math.floor(window.innerHeight * 0.82);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    const mapping = drawContain(ctx, video.videoWidth, video.videoHeight, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, mapping.dx, mapping.dy, mapping.dw, mapping.dh);
    return mapping;
  };

  let currentMapping = redraw();

  const onMove = (e) => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const x = (e.clientX - rect.left) * dpr;
    const y = (e.clientY - rect.top) * dpr;

    // Map to source
    const sx = Math.floor((x - currentMapping.dx) / currentMapping.scale);
    const sy = Math.floor((y - currentMapping.dy) / currentMapping.scale);

    // Draw zoom
    const zoomSize = 16; // 16x16 source pixels
    const zoomScale = 8; // scale factor
    const zx = sx - Math.floor(zoomSize / 2);
    const zy = sy - Math.floor(zoomSize / 2);

    // Create an offscreen to copy source region
    const off = document.createElement('canvas');
    off.width = zoomSize; off.height = zoomSize;
    const offCtx = off.getContext('2d', { willReadFrequently: true });
    offCtx.drawImage(video, zx, zy, zoomSize, zoomSize, 0, 0, zoomSize, zoomSize);

    zoomCanvas.width = zoomSize * zoomScale;
    zoomCanvas.height = zoomSize * zoomScale;
    zoomCtx.imageSmoothingEnabled = false; // pixelated zoom
    zoomCtx.drawImage(off, 0, 0, zoomCanvas.width, zoomCanvas.height);

    // Crosshair
    zoomCtx.strokeStyle = '#ffffffCC';
    zoomCtx.lineWidth = 1;
    const center = Math.floor(zoomCanvas.width / 2);
    zoomCtx.beginPath();
    zoomCtx.moveTo(center, 0); zoomCtx.lineTo(center, zoomCanvas.height);
    zoomCtx.moveTo(0, center); zoomCtx.lineTo(zoomCanvas.width, center);
    zoomCtx.stroke();

    // Position zoom near cursor
    const margin = 16;
    let zoomLeft = e.clientX + margin;
    let zoomTop = e.clientY + margin;
    const zRect = { w: zoomCanvas.clientWidth || 140, h: zoomCanvas.clientHeight || 140 };
    if (zoomLeft + zRect.w > window.innerWidth) zoomLeft = e.clientX - zRect.w - margin;
    if (zoomTop + zRect.h > window.innerHeight) zoomTop = e.clientY - zRect.h - margin;
    zoomCanvas.style.left = `${zoomLeft}px`;
    zoomCanvas.style.top = `${zoomTop}px`;
  };

  const onClick = (e) => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const x = (e.clientX - rect.left) * dpr;
    const y = (e.clientY - rect.top) * dpr;

    const sx = Math.floor((x - currentMapping.dx) / currentMapping.scale);
    const sy = Math.floor((y - currentMapping.dy) / currentMapping.scale);

    // Read pixel from drawn canvas, to avoid cross-origin on video
    // Ensure the frame is drawn at same mapping
    const pixelData = ctx.getImageData(
      Math.floor(currentMapping.dx + sx * currentMapping.scale),
      Math.floor(currentMapping.dy + sy * currentMapping.scale),
      1, 1
    ).data;

    const [r, g, b, a] = pixelData;
    const hex = rgbToHex(r, g, b).toUpperCase();
    updateUIWithHex(hex);
    addToHistory(hex);
    cleanup();
  };

  canvas.onmousemove = onMove;
  canvas.onclick = onClick;

  const onResize = () => { currentMapping = redraw(); };
  window.addEventListener('resize', onResize, { passive: true });
  const stopObs = new ResizeObserver(() => { currentMapping = redraw(); });
  stopObs.observe(canvas);

  // Keep redrawing a fresh frame every 250ms while overlay is open (lightweight)
  let rafId;
  const loop = () => {
    if (elements.overlay.classList.contains('hidden')) return;
    currentMapping = redraw();
    rafId = setTimeout(loop, 250);
  };
  loop();
}

function attachEvents() {
  elements.startEyeDropperBtn.addEventListener('click', startEyeDropper);
  elements.startCaptureBtn.addEventListener('click', startCapturePicker);

  document.querySelectorAll('.copy').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = btn.getAttribute('data-copy-target');
      copyFromTarget(target);
    });
  });

  elements.clearHistoryBtn.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    renderHistory();
  });
}

function initDefaultColor() {
  const last = loadHistory()[0];
  const hex = last || '#5B8CFF';
  updateUIWithHex(hex);
}

function initFeatureFlags() {
  if (!supportsEyeDropper()) {
    elements.startEyeDropperBtn.classList.add('danger');
    elements.startEyeDropperBtn.textContent = 'EyeDropper 不可用';
  }
}

function init() {
  initDefaultColor();
  initFeatureFlags();
  renderHistory();
  attachEvents();
}

init();