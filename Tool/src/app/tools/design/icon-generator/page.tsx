'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ToolLayout } from '@/components/tool-layout';

type ShapeType = 'rounded' | 'circle' | 'square';

interface SizeOption {
  label: string;
  value: number;
}

const DEFAULT_SIZES: SizeOption[] = [
  { label: '32px', value: 32 },
  { label: '64px', value: 64 },
  { label: '128px', value: 128 },
  { label: '256px', value: 256 },
  { label: '512px', value: 512 },
];

const FONT_OPTIONS = [
  'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
  'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
  'Segoe UI, system-ui, -apple-system, Roboto, Helvetica, Arial',
  'Roboto, system-ui, -apple-system, Segoe UI, Helvetica, Arial',
  'Helvetica, system-ui, -apple-system, Segoe UI, Roboto, Arial',
  'Arial, system-ui, -apple-system, Segoe UI, Roboto, Helvetica',
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function angleToLineEndpoints(angleDeg: number) {
  const theta = (angleDeg * Math.PI) / 180;
  const dx = Math.cos(theta);
  const dy = Math.sin(theta);
  const cx = 500;
  const cy = 500;
  const r = 500; // covers viewBox 0..1000 fully
  return {
    x1: cx - dx * r,
    y1: cy - dy * r,
    x2: cx + dx * r,
    y2: cy + dy * r,
  };
}

function generateSvg({
  size,
  shape,
  cornerRadius,
  paddingPercent,
  backgroundType,
  bgColor1,
  bgColor2,
  gradientAngle,
  showShadow,
  shadowBlur,
  shadowDx,
  shadowDy,
  shadowOpacity,
  borderWidth,
  borderColor,
  text,
  fontFamily,
  fontWeight,
  textColor,
}: {
  size: number;
  shape: ShapeType;
  cornerRadius: number;
  paddingPercent: number;
  backgroundType: 'solid' | 'gradient';
  bgColor1: string;
  bgColor2: string;
  gradientAngle: number;
  showShadow: boolean;
  shadowBlur: number;
  shadowDx: number;
  shadowDy: number;
  shadowOpacity: number;
  borderWidth: number;
  borderColor: string;
  text: string;
  fontFamily: string;
  fontWeight: number;
  textColor: string;
}): string {
  const viewBoxSize = 1000; // normalize drawing
  const pad = clamp(paddingPercent, 0, 45) / 100 * viewBoxSize;
  const innerBox = viewBoxSize - pad * 2;
  const fontSize = Math.max(10, innerBox * 0.6);
  const filterId = 'dropShadow';
  const gradId = 'bgGradient';

  const gradient = angleToLineEndpoints(gradientAngle);

  const backgroundFill = backgroundType === 'solid'
    ? `<rect x="0" y="0" width="1000" height="1000" fill="${bgColor1}"/>`
    : `
    <defs>
      <linearGradient id="${gradId}" gradientUnits="userSpaceOnUse" x1="${gradient.x1}" y1="${gradient.y1}" x2="${gradient.x2}" y2="${gradient.y2}">
        <stop offset="0%" stop-color="${bgColor1}"/>
        <stop offset="100%" stop-color="${bgColor2}"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="1000" height="1000" fill="url(#${gradId})"/>
  `;

  const shapeElement = (() => {
    const strokeAttr = borderWidth > 0 ? ` stroke="${borderColor}" stroke-width="${borderWidth}"` : '';
    const filterAttr = showShadow ? ` filter="url(#${filterId})"` : '';
    switch (shape) {
      case 'circle':
        return `<circle cx="500" cy="500" r="${500 - borderWidth / 2}" fill="none"${strokeAttr}${filterAttr}/>`;
      case 'square':
        return `<rect x="${borderWidth / 2}" y="${borderWidth / 2}" width="${1000 - borderWidth}" height="${1000 - borderWidth}" rx="0" ry="0" fill="none"${strokeAttr}${filterAttr}/>`;
      case 'rounded':
      default:
        return `<rect x="${borderWidth / 2}" y="${borderWidth / 2}" width="${1000 - borderWidth}" height="${1000 - borderWidth}" rx="${cornerRadius}" ry="${cornerRadius}" fill="none"${strokeAttr}${filterAttr}/>`;
    }
  })();

  const clippingPathId = 'clipShape';
  const clipShape = (() => {
    switch (shape) {
      case 'circle':
        return `<clipPath id="${clippingPathId}"><circle cx="500" cy="500" r="500"/></clipPath>`;
      case 'square':
        return `<clipPath id="${clippingPathId}"><rect x="0" y="0" width="1000" height="1000" rx="0" ry="0"/></clipPath>`;
      case 'rounded':
      default:
        return `<clipPath id="${clippingPathId}"><rect x="0" y="0" width="1000" height="1000" rx="${cornerRadius}" ry="${cornerRadius}"/></clipPath>`;
    }
  })();

  const shadowDefs = showShadow
    ? `
    <defs>
      <filter id="${filterId}" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="${shadowDx}" dy="${shadowDy}" stdDeviation="${shadowBlur}" flood-color="#000000" flood-opacity="${clamp(shadowOpacity, 0, 1)}"/>
      </filter>
    </defs>
  `
    : '';

  const textElement = text
    ? `<text x="500" y="500" fill="${textColor}" font-family="${fontFamily}" font-size="${fontSize}" font-weight="${fontWeight}" text-anchor="middle" dominant-baseline="middle" style="letter-spacing:0.5px;">
        ${text}
      </text>`
    : '';

  // Content group with clip and padding
  const contentGroup = `
  <g clip-path="url(#${clippingPathId})">
    <g transform="translate(${pad}, ${pad})">
      <rect x="0" y="0" width="${innerBox}" height="${innerBox}" fill="none"/>
      <g transform="translate(${(viewBoxSize - 2 * pad) / 2}, ${(viewBoxSize - 2 * pad) / 2}) translate(${-viewBoxSize / 2 + pad}, ${-viewBoxSize / 2 + pad})">
        ${textElement}
      </g>
    </g>
  </g>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid meet">
  ${backgroundFill}
  ${shadowDefs}
  ${clipShape}
  ${contentGroup}
  ${shapeElement}
</svg>`;
}

async function svgStringToPngBlob(svgString: string, size: number): Promise<Blob> {
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = (e) => reject(e);
      image.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');
    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(img, 0, 0, size, size);
    return await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b as Blob), 'image/png'));
  } finally {
    URL.revokeObjectURL(url);
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function IconGeneratorPage() {
  const [shape, setShape] = useState<ShapeType>('rounded');
  const [cornerRadius, setCornerRadius] = useState<number>(200); // for rounded

  const [backgroundType, setBackgroundType] = useState<'solid' | 'gradient'>('gradient');
  const [bgColor1, setBgColor1] = useState<string>('#6366F1');
  const [bgColor2, setBgColor2] = useState<string>('#22D3EE');
  const [gradientAngle, setGradientAngle] = useState<number>(45);

  const [borderWidth, setBorderWidth] = useState<number>(0);
  const [borderColor, setBorderColor] = useState<string>('#000000');

  const [showShadow, setShowShadow] = useState<boolean>(true);
  const [shadowBlur, setShadowBlur] = useState<number>(20);
  const [shadowDx, setShadowDx] = useState<number>(0);
  const [shadowDy, setShadowDy] = useState<number>(20);
  const [shadowOpacity, setShadowOpacity] = useState<number>(0.2);

  const [paddingPercent, setPaddingPercent] = useState<number>(10);

  const [text, setText] = useState<string>('A');
  const [fontFamily, setFontFamily] = useState<string>(FONT_OPTIONS[0]);
  const [fontWeight, setFontWeight] = useState<number>(700);
  const [textColor, setTextColor] = useState<string>('#ffffff');

  const [previewSize, setPreviewSize] = useState<number>(256);

  const [selectedSizes, setSelectedSizes] = useState<number[]>([64, 128, 256, 512]);
  const [customSize, setCustomSize] = useState<number>(1024);

  const svgRef = useRef<HTMLDivElement>(null);

  const svgString = useMemo(() =>
    generateSvg({
      size: previewSize,
      shape,
      cornerRadius,
      paddingPercent,
      backgroundType,
      bgColor1,
      bgColor2,
      gradientAngle,
      showShadow,
      shadowBlur,
      shadowDx,
      shadowDy,
      shadowOpacity,
      borderWidth,
      borderColor,
      text,
      fontFamily,
      fontWeight,
      textColor,
    }), [
      previewSize,
      shape,
      cornerRadius,
      paddingPercent,
      backgroundType,
      bgColor1,
      bgColor2,
      gradientAngle,
      showShadow,
      shadowBlur,
      shadowDx,
      shadowDy,
      shadowOpacity,
      borderWidth,
      borderColor,
      text,
      fontFamily,
      fontWeight,
      textColor,
    ]);

  useEffect(() => {
    if (!svgRef.current) return;
    svgRef.current.innerHTML = svgString;
  }, [svgString]);

  const handleDownloadSvg = async () => {
    const blob = new Blob([generateSvg({
      size: customSize || 1024,
      shape,
      cornerRadius,
      paddingPercent,
      backgroundType,
      bgColor1,
      bgColor2,
      gradientAngle,
      showShadow,
      shadowBlur,
      shadowDx,
      shadowDy,
      shadowOpacity,
      borderWidth,
      borderColor,
      text,
      fontFamily,
      fontWeight,
      textColor,
    })], { type: 'image/svg+xml;charset=utf-8' });
    downloadBlob(blob, 'icon.svg');
  };

  const handleDownloadPng = async () => {
    const sizes = [...selectedSizes];
    if (customSize && !sizes.includes(customSize)) sizes.push(customSize);
    // Ensure uniqueness and sort
    const uniqueSizes = Array.from(new Set(sizes.filter(Boolean))).sort((a, b) => a - b);

    for (const s of uniqueSizes) {
      const sSvg = generateSvg({
        size: s,
        shape,
        cornerRadius,
        paddingPercent,
        backgroundType,
        bgColor1,
        bgColor2,
        gradientAngle,
        showShadow,
        shadowBlur,
        shadowDx,
        shadowDy,
        shadowOpacity,
        borderWidth,
        borderColor,
        text,
        fontFamily,
        fontWeight,
        textColor,
      });
      const blob = await svgStringToPngBlob(sSvg, s);
      downloadBlob(blob, `icon-${s}.png`);
    }
  };

  const toggleSize = (val: number) => {
    setSelectedSizes((prev) =>
      prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]
    );
  };

  const applyPreset = (preset: 'ios' | 'material' | 'flat') => {
    switch (preset) {
      case 'ios':
        setShape('rounded');
        setCornerRadius(220);
        setBackgroundType('gradient');
        setBgColor1('#6366F1');
        setBgColor2('#22D3EE');
        setGradientAngle(45);
        setBorderWidth(0);
        setShowShadow(true);
        setShadowBlur(25);
        setShadowDx(0);
        setShadowDy(15);
        setShadowOpacity(0.18);
        setPaddingPercent(12);
        setTextColor('#FFFFFF');
        setFontWeight(700);
        break;
      case 'material':
        setShape('circle');
        setBackgroundType('solid');
        setBgColor1('#6200EE');
        setBgColor2('#03DAC6');
        setGradientAngle(90);
        setBorderWidth(0);
        setShowShadow(false);
        setPaddingPercent(18);
        setTextColor('#FFFFFF');
        setFontWeight(600);
        break;
      case 'flat':
      default:
        setShape('square');
        setBackgroundType('solid');
        setBgColor1('#0EA5E9');
        setBgColor2('#22C55E');
        setGradientAngle(0);
        setBorderWidth(8);
        setBorderColor('#0C4A6E');
        setShowShadow(false);
        setPaddingPercent(10);
        setTextColor('#0B1020');
        setFontWeight(700);
        break;
    }
  };

  return (
    <ToolLayout title="图标生成器" description="在线生成多风格应用图标（SVG/PNG）。全部在本地浏览器中完成，安全无上传。">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-6 bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">快速预设</h3>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => applyPreset('ios')} className="px-3 py-1.5 rounded-md bg-primary-600 text-white hover:bg-primary-700 transition">iOS风格</button>
              <button onClick={() => applyPreset('material')} className="px-3 py-1.5 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition">Material风</button>
              <button onClick={() => applyPreset('flat')} className="px-3 py-1.5 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition">扁平风</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">形状</h4>
              <div className="flex gap-2 flex-wrap">
                <label className="inline-flex items-center gap-2">
                  <input type="radio" name="shape" checked={shape === 'rounded'} onChange={() => setShape('rounded')} />
                  <span>圆角方形</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="radio" name="shape" checked={shape === 'circle'} onChange={() => setShape('circle')} />
                  <span>圆形</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="radio" name="shape" checked={shape === 'square'} onChange={() => setShape('square')} />
                  <span>正方形</span>
                </label>
              </div>
              {shape === 'rounded' && (
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-300">圆角半径: {cornerRadius}</label>
                  <input type="range" min={0} max={500} value={cornerRadius} onChange={(e) => setCornerRadius(Number(e.target.value))} className="w-full" />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">背景</h4>
              <div className="flex gap-2 flex-wrap mb-2">
                <label className="inline-flex items-center gap-2">
                  <input type="radio" name="bgtype" checked={backgroundType === 'solid'} onChange={() => setBackgroundType('solid')} />
                  <span>纯色</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="radio" name="bgtype" checked={backgroundType === 'gradient'} onChange={() => setBackgroundType('gradient')} />
                  <span>渐变</span>
                </label>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm">颜色1</span>
                  <input type="color" value={bgColor1} onChange={(e) => setBgColor1(e.target.value)} />
                </div>
                {backgroundType === 'gradient' && (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">颜色2</span>
                      <input type="color" value={bgColor2} onChange={(e) => setBgColor2(e.target.value)} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">角度</span>
                      <input type="number" className="w-20 bg-transparent border rounded px-2 py-1" value={gradientAngle} onChange={(e) => setGradientAngle(Number(e.target.value))} />
                      <span className="text-sm">°</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">阴影与边框</h4>
              <label className="inline-flex items-center gap-2 mb-2">
                <input type="checkbox" checked={showShadow} onChange={(e) => setShowShadow(e.target.checked)} />
                <span>启用阴影</span>
              </label>
              {showShadow && (
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-sm">模糊: {shadowBlur}
                    <input type="range" min={0} max={50} value={shadowBlur} onChange={(e) => setShadowBlur(Number(e.target.value))} className="w-full" />
                  </label>
                  <label className="text-sm">透明度: {shadowOpacity.toFixed(2)}
                    <input type="range" min={0} max={1} step={0.01} value={shadowOpacity} onChange={(e) => setShadowOpacity(Number(e.target.value))} className="w-full" />
                  </label>
                  <label className="text-sm">偏移X: {shadowDx}
                    <input type="range" min={-50} max={50} value={shadowDx} onChange={(e) => setShadowDx(Number(e.target.value))} className="w-full" />
                  </label>
                  <label className="text-sm">偏移Y: {shadowDy}
                    <input type="range" min={-50} max={50} value={shadowDy} onChange={(e) => setShadowDy(Number(e.target.value))} className="w-full" />
                  </label>
                </div>
              )}
              <div className="flex items-center gap-3 mt-2">
                <span className="text-sm">边框</span>
                <input type="number" className="w-20 bg-transparent border rounded px-2 py-1" value={borderWidth} min={0} max={50} onChange={(e) => setBorderWidth(Number(e.target.value))} />
                <input type="color" value={borderColor} onChange={(e) => setBorderColor(e.target.value)} />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">内容 & 文字</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm">文本</span>
                <input value={text} onChange={(e) => setText(e.target.value)} className="flex-1 bg-transparent border rounded px-2 py-1" placeholder="字母/表情/符号" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">颜色</span>
                <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm">字体</span>
                <select className="flex-1 bg-transparent border rounded px-2 py-1" value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
                  {FONT_OPTIONS.map((f, i) => (
                    <option key={i} value={f}>{f.split(',')[0]}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm">粗细</span>
                <input type="range" min={100} max={900} step={100} value={fontWeight} onChange={(e) => setFontWeight(Number(e.target.value))} className="flex-1" />
                <span className="text-sm tabular-nums w-10 text-right">{fontWeight}</span>
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300">内边距: {paddingPercent}%</label>
                <input type="range" min={0} max={40} value={paddingPercent} onChange={(e) => setPaddingPercent(Number(e.target.value))} className="w-full" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">导出</h4>
            <div className="flex flex-wrap gap-2 items-center">
              {DEFAULT_SIZES.map((s) => (
                <label key={s.value} className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  <input type="checkbox" checked={selectedSizes.includes(s.value)} onChange={() => toggleSize(s.value)} />
                  <span className="text-sm">{s.label}</span>
                </label>
              ))}
              <div className="inline-flex items-center gap-2">
                <span className="text-sm">自定义</span>
                <input type="number" className="w-24 bg-transparent border rounded px-2 py-1" value={customSize} onChange={(e) => setCustomSize(Number(e.target.value))} />
                <span className="text-sm">px</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={handleDownloadSvg} className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 transition">下载 SVG</button>
              <button onClick={handleDownloadPng} className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition">下载 PNG</button>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">预览</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm">大小</span>
              <input type="range" min={64} max={512} value={previewSize} onChange={(e) => setPreviewSize(Number(e.target.value))} />
              <span className="text-sm tabular-nums w-12 text-right">{previewSize}px</span>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div
              ref={svgRef}
              className="shadow-sm"
              style={{ width: previewSize, height: previewSize }}
              aria-label="icon-preview"
            />
          </div>

          <div className="mt-6 grid grid-cols-5 gap-3">
            {/* Quick color presets */}
            {[['#10B981', '#059669'], ['#6366F1', '#22D3EE'], ['#F59E0B', '#F97316'], ['#EF4444', '#F43F5E'], ['#0EA5E9', '#22C55E']].map((pair, idx) => (
              <button
                key={idx}
                onClick={() => { setBackgroundType('gradient'); setBgColor1(pair[0]); setBgColor2(pair[1]); }}
                className="h-10 rounded-md border border-gray-200 dark:border-gray-700"
                style={{ background: `linear-gradient(45deg, ${pair[0]}, ${pair[1]})` }}
                title={`应用渐变 ${pair[0]} → ${pair[1]}`}
              />
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}