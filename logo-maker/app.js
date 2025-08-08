(function() {
  const svg = document.getElementById('logo-svg');
  const bgRect = document.getElementById('bg-rect');
  const content = document.getElementById('content');
  const iconGroup = document.getElementById('icon');
  const textNode = document.getElementById('text');

  const ctrl = {
    text: document.getElementById('text-input'),
    fontFamily: document.getElementById('font-select'),
    fontWeight: document.getElementById('font-weight'),
    fontSize: document.getElementById('font-size'),
    textColor: document.getElementById('text-color'),
    bgColor: document.getElementById('bg-color'),
    padding: document.getElementById('padding'),
    radius: document.getElementById('radius'),
    icon: document.getElementById('icon-select'),
    iconColor: document.getElementById('icon-color'),
    gap: document.getElementById('gap'),
    layout: document.getElementById('layout-select'),
    canvasWidth: document.getElementById('canvas-width'),
    canvasHeight: document.getElementById('canvas-height'),
    shadow: document.getElementById('shadow'),
    exportPng: document.getElementById('export-png'),
    exportSvg: document.getElementById('export-svg'),
  };

  const state = {
    drag: { active: false, startX: 0, startY: 0, offsetX: 0, offsetY: 0 },
    scale: 1,
  };

  function getCanvasSize() {
    const w = parseInt(ctrl.canvasWidth.value, 10) || 1024;
    const h = parseInt(ctrl.canvasHeight.value, 10) || 512;
    return { w, h };
  }

  function setCanvasSize() {
    const { w, h } = getCanvasSize();
    svg.setAttribute('width', String(w));
    svg.setAttribute('height', String(h));
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  }

  function updateBackground() {
    const { w, h } = getCanvasSize();
    const pad = parseInt(ctrl.padding.value, 10) || 0;
    const rx = parseInt(ctrl.radius.value, 10) || 0;
    const fill = ctrl.bgColor.value || '#ffffff';

    const x = Math.max(0, pad);
    const y = Math.max(0, pad);
    const rectW = Math.max(0, w - pad * 2);
    const rectH = Math.max(0, h - pad * 2);

    bgRect.setAttribute('x', String(x));
    bgRect.setAttribute('y', String(y));
    bgRect.setAttribute('width', String(rectW));
    bgRect.setAttribute('height', String(rectH));
    bgRect.setAttribute('rx', String(rx));
    bgRect.setAttribute('fill', fill);
  }

  function setShadow() {
    content.setAttribute('filter', ctrl.shadow.checked ? 'url(#shadow-filter)' : 'none');
  }

  function drawIconShape(kind, size, color) {
    iconGroup.innerHTML = '';
    if (kind === 'none') return;

    const s = size;
    const half = s / 2;

    let shape;
    switch (kind) {
      case 'circle': {
        shape = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        shape.setAttribute('cx', '0');
        shape.setAttribute('cy', '0');
        shape.setAttribute('r', String(half));
        break;
      }
      case 'square': {
        shape = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        shape.setAttribute('x', String(-half));
        shape.setAttribute('y', String(-half));
        shape.setAttribute('width', String(s));
        shape.setAttribute('height', String(s));
        break;
      }
      case 'triangle': {
        const h = s * 0.866; // equilateral triangle height
        const points = [
          [0, -h/2],
          [-s/2, h/2],
          [s/2, h/2],
        ].map(p => p.join(',')).join(' ');
        shape = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        shape.setAttribute('points', points);
        break;
      }
      case 'star': {
        // 5-point star
        const outerR = half;
        const innerR = outerR * 0.5;
        const points = [];
        for (let i = 0; i < 10; i++) {
          const angle = (Math.PI / 5) * i - Math.PI / 2;
          const r = i % 2 === 0 ? outerR : innerR;
          points.push([
            Math.cos(angle) * r,
            Math.sin(angle) * r,
          ]);
        }
        shape = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        shape.setAttribute('points', points.map(p => p.join(',')).join(' '));
        break;
      }
      case 'bolt': {
        // Simple lightning bolt path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const s2 = s / 2;
        const d = [
          `M ${-0.2*s} ${-s2}`,
          `L ${0.1*s} ${-0.1*s}`,
          `L ${-0.05*s} ${-0.1*s}`,
          `L ${0.2*s} ${s2}`,
          `L ${-0.1*s} ${0.1*s}`,
          `L ${0.05*s} ${0.1*s}`,
          'Z'
        ].join(' ');
        path.setAttribute('d', d);
        shape = path;
        break;
      }
      default: return;
    }

    shape.setAttribute('fill', color);
    iconGroup.appendChild(shape);
  }

  function updateText() {
    const txt = ctrl.text.value || '';
    textNode.textContent = txt;
    textNode.setAttribute('fill', ctrl.textColor.value || '#111827');
    textNode.setAttribute('font-family', ctrl.fontFamily.value);
    textNode.setAttribute('font-weight', ctrl.fontWeight.value);
    textNode.setAttribute('font-size', ctrl.fontSize.value);
  }

  function layout() {
    // compute layout positions based on text bbox
    const { w, h } = getCanvasSize();
    const centerX = w / 2;
    const centerY = h / 2;

    // icon size relative to font size
    const fontSize = parseFloat(ctrl.fontSize.value) || 96;
    const iconSize = Math.max(12, fontSize * 0.9);
    drawIconShape(ctrl.icon.value, iconSize, ctrl.iconColor.value);

    // Force text to update bbox
    const bbox = textNode.getBBox();
    const textW = Math.max(1, bbox.width);
    const textH = Math.max(1, bbox.height);

    const gap = parseFloat(ctrl.gap.value) || 0;

    if (ctrl.icon.value === 'none') {
      // Center the text only
      textNode.setAttribute('x', String(centerX));
      textNode.setAttribute('y', String(centerY));
      iconGroup.setAttribute('transform', `translate(${centerX},${centerY})`);
    } else if (ctrl.layout.value === 'row') {
      const totalW = iconSize + gap + textW;
      const iconX = centerX - totalW / 2 + iconSize / 2;
      const textX = iconX + iconSize / 2 + gap + textW / 2;

      iconGroup.setAttribute('transform', `translate(${iconX},${centerY})`);
      textNode.setAttribute('x', String(textX));
      textNode.setAttribute('y', String(centerY));
    } else {
      // column
      const totalH = iconSize + gap + textH;
      const iconY = centerY - totalH / 2 + iconSize / 2;
      const textY = iconY + iconSize / 2 + gap + textH / 2;

      iconGroup.setAttribute('transform', `translate(${centerX},${iconY})`);
      textNode.setAttribute('x', String(centerX));
      textNode.setAttribute('y', String(textY));
    }

    applyTransform();
  }

  function applyTransform() {
    const t = `translate(${state.drag.offsetX},${state.drag.offsetY}) scale(${state.scale})`;
    content.setAttribute('transform', t);
  }

  function addEvents() {
    const inputs = [
      ctrl.text, ctrl.fontFamily, ctrl.fontWeight, ctrl.fontSize,
      ctrl.textColor, ctrl.bgColor, ctrl.padding, ctrl.radius,
      ctrl.icon, ctrl.iconColor, ctrl.gap, ctrl.layout,
      ctrl.canvasWidth, ctrl.canvasHeight, ctrl.shadow,
    ];

    inputs.forEach(el => {
      const evt = (el.tagName === 'INPUT' && (el.type === 'text' || el.type === 'number')) ? 'input' : 'change';
      el.addEventListener(evt, () => {
        if (el === ctrl.canvasWidth || el === ctrl.canvasHeight) setCanvasSize();
        if (el === ctrl.bgColor || el === ctrl.padding || el === ctrl.radius) updateBackground();
        if (el === ctrl.shadow) setShadow();
        if (el === ctrl.text || el === ctrl.fontFamily || el === ctrl.fontWeight || el === ctrl.fontSize || el === ctrl.textColor) updateText();
        layout();
      });
    });

    // Dragging
    svg.addEventListener('mousedown', (e) => {
      const pt = getSvgPoint(e);
      state.drag.active = true;
      state.drag.startX = pt.x - state.drag.offsetX;
      state.drag.startY = pt.y - state.drag.offsetY;
    });
    window.addEventListener('mousemove', (e) => {
      if (!state.drag.active) return;
      const pt = getSvgPoint(e);
      state.drag.offsetX = pt.x - state.drag.startX;
      state.drag.offsetY = pt.y - state.drag.startY;
      applyTransform();
    });
    window.addEventListener('mouseup', () => {
      state.drag.active = false;
    });

    // Zoom with Ctrl/Cmd + wheel
    svg.addEventListener('wheel', (e) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      const delta = -Math.sign(e.deltaY) * 0.05;
      state.scale = Math.min(5, Math.max(0.2, state.scale * (1 + delta)));
      applyTransform();
    }, { passive: false });

    // Export
    ctrl.exportSvg.addEventListener('click', exportSVG);
    ctrl.exportPng.addEventListener('click', exportPNG);
  }

  function getSvgPoint(evt) {
    const pt = svg.createSVGPoint();
    pt.x = evt.clientX;
    pt.y = evt.clientY;
    const ctm = svg.getScreenCTM().inverse();
    return pt.matrixTransform(ctm);
  }

  function serializeSvg() {
    const clone = svg.cloneNode(true);
    // ensure transforms are applied
    clone.setAttribute('width', svg.getAttribute('width'));
    clone.setAttribute('height', svg.getAttribute('height'));
    clone.setAttribute('viewBox', svg.getAttribute('viewBox'));

    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(clone);

    // add namespace if missing
    if (!source.match(/^<svg[^>]+xmlns="http:\/\/www.w3.org\/2000\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if (!source.match(/^<svg[^>]+xmlns:xlink="http:\/\/www.w3.org\/1999\/xlink"/)) {
      source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }

    return source;
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function exportSVG() {
    const source = serializeSvg();
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    downloadBlob(blob, `logo-${Date.now()}.svg`);
  }

  async function exportPNG() {
    const { w, h } = getCanvasSize();
    const source = serializeSvg();
    const svgUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source);

    await document.fonts.ready.catch(() => {});

    const img = new Image();
    img.decoding = 'async';
    img.crossOrigin = 'anonymous';

    const loaded = new Promise((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
    });

    img.src = svgUrl;
    await loaded;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, `logo-${Date.now()}.png`);
    }, 'image/png');
  }

  function init() {
    setCanvasSize();
    updateBackground();
    setShadow();
    updateText();
    layout();
    addEvents();
  }

  document.addEventListener('DOMContentLoaded', init);
})();