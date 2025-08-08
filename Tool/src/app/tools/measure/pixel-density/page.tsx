'use client';

import { useEffect, useMemo, useState } from 'react';
import { ToolLayout } from '@/components/tool-layout';

function useDeviceMetrics() {
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [screenSizeCss, setScreenSizeCss] = useState({ width: 0, height: 0 });
  const [devicePixelRatioValue, setDevicePixelRatioValue] = useState(1);

  useEffect(() => {
    const update = () => {
      setViewportSize({ width: window.innerWidth, height: window.innerHeight });
      setScreenSizeCss({ width: window.screen.width, height: window.screen.height });
      setDevicePixelRatioValue(window.devicePixelRatio || 1);
    };

    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    document.addEventListener('visibilitychange', update);

    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, []);

  const screenSizeDevice = useMemo(() => {
    return {
      width: Math.round(screenSizeCss.width * devicePixelRatioValue),
      height: Math.round(screenSizeCss.height * devicePixelRatioValue),
    };
  }, [screenSizeCss.width, screenSizeCss.height, devicePixelRatioValue]);

  const diagonalCssPx = useMemo(() => {
    return Math.sqrt(
      Math.pow(screenSizeCss.width, 2) + Math.pow(screenSizeCss.height, 2)
    );
  }, [screenSizeCss.width, screenSizeCss.height]);

  const diagonalDevicePx = useMemo(() => {
    return Math.sqrt(
      Math.pow(screenSizeDevice.width, 2) + Math.pow(screenSizeDevice.height, 2)
    );
  }, [screenSizeDevice.width, screenSizeDevice.height]);

  return {
    viewportSize,
    screenSizeCss,
    screenSizeDevice,
    diagonalCssPx,
    diagonalDevicePx,
    devicePixelRatioValue,
  };
}

function formatNumber(value: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value);
}

export default function PixelDensityPage() {
  const {
    viewportSize,
    screenSizeCss,
    screenSizeDevice,
    diagonalCssPx,
    diagonalDevicePx,
    devicePixelRatioValue,
  } = useDeviceMetrics();

  // PPI by known diagonal
  const [diagonalInchesInput, setDiagonalInchesInput] = useState<string>('');
  const ppiFromDiagonal = useMemo(() => {
    const diagonalInches = parseFloat(diagonalInchesInput);
    if (!diagonalInches || diagonalInches <= 0) return null;
    return diagonalDevicePx / diagonalInches;
  }, [diagonalInchesInput, diagonalDevicePx]);

  // Calibration state
  const [calibrationPxWidth, setCalibrationPxWidth] = useState(300); // css px width of the on-screen reference
  const [calibrationUnit, setCalibrationUnit] = useState<'mm' | 'in'>('mm');
  const [calibrationPhysicalWidth, setCalibrationPhysicalWidth] = useState<string>('85.60'); // default: credit card width (ISO/IEC 7810 ID-1)

  const physicalWidthInInches = useMemo(() => {
    const val = parseFloat(calibrationPhysicalWidth);
    if (!val || val <= 0) return null;
    if (calibrationUnit === 'mm') {
      return val / 25.4;
    }
    return val;
  }, [calibrationPhysicalWidth, calibrationUnit]);

  const cssPxPerInchCalibrated = useMemo(() => {
    if (!physicalWidthInInches) return null;
    return calibrationPxWidth / physicalWidthInInches;
  }, [calibrationPxWidth, physicalWidthInInches]);

  const ppiFromCalibration = useMemo(() => {
    if (!cssPxPerInchCalibrated) return null;
    return cssPxPerInchCalibrated * devicePixelRatioValue;
  }, [cssPxPerInchCalibrated, devicePixelRatioValue]);

  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';

  return (
    <ToolLayout title="像素密度检测" description="检测设备像素比 (DPR)、视口/屏幕分辨率，并估算屏幕像素密度 (PPI)。">
      <div className="space-y-6">
        {/* Overview */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">设备与屏幕信息</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="text-gray-500 dark:text-gray-400">设备像素比 (DPR)</div>
              <div className="text-gray-900 dark:text-white font-medium">{formatNumber(devicePixelRatioValue)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-gray-500 dark:text-gray-400">视口尺寸 (CSS px)</div>
              <div className="text-gray-900 dark:text-white font-medium">{viewportSize.width} × {viewportSize.height}</div>
            </div>
            <div className="space-y-1">
              <div className="text-gray-500 dark:text-gray-400">屏幕尺寸 (CSS px)</div>
              <div className="text-gray-900 dark:text-white font-medium">{screenSizeCss.width} × {screenSizeCss.height}</div>
            </div>
            <div className="space-y-1">
              <div className="text-gray-500 dark:text-gray-400">屏幕分辨率 (设备 px)</div>
              <div className="text-gray-900 dark:text-white font-medium">{screenSizeDevice.width} × {screenSizeDevice.height}</div>
            </div>
            <div className="space-y-1">
              <div className="text-gray-500 dark:text-gray-400">屏幕 CSS 像素对角线</div>
              <div className="text-gray-900 dark:text-white font-medium">{formatNumber(diagonalCssPx)} px</div>
            </div>
            <div className="space-y-1">
              <div className="text-gray-500 dark:text-gray-400">屏幕设备像素对角线</div>
              <div className="text-gray-900 dark:text-white font-medium">{formatNumber(diagonalDevicePx)} px</div>
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 break-all">
            UA: {userAgent}
          </div>
        </div>

        {/* PPI by diagonal */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">方法一：按已知屏幕尺寸估算 PPI</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">输入你设备的屏幕对角线尺寸（单位：英寸，常见如 13.3、14、24 等），我们将结合检测到的像素分辨率估算 PPI。</p>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">对角线 (in)</label>
              <input
                type="number"
                step="0.1"
                min="1"
                inputMode="decimal"
                value={diagonalInchesInput}
                onChange={(e) => setDiagonalInchesInput(e.target.value)}
                className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                placeholder="如 13.3"
              />
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              估算结果：
              <span className="font-medium ml-1">
                {ppiFromDiagonal ? `${formatNumber(ppiFromDiagonal)} PPI` : '—'}
              </span>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            说明：使用检测到的设备像素对角线除以输入的英寸尺寸得到像素密度，结果会受到系统缩放和浏览器环境影响，仅供参考。
          </div>
        </div>

        {/* Calibration */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">方法二：屏幕校准估算 PPI</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            将下方的参考卡片在屏幕上缩放到与真实物体等宽（默认是银行卡/信用卡宽度 85.60 mm），据此计算你的屏幕像素密度。
          </p>

          {/* Controls */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">物体宽度</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={calibrationPhysicalWidth}
                  onChange={(e) => setCalibrationPhysicalWidth(e.target.value)}
                  className="w-28 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
                <select
                  value={calibrationUnit}
                  onChange={(e) => setCalibrationUnit(e.target.value as 'mm' | 'in')}
                  className="px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                >
                  <option value="mm">mm</option>
                  <option value="in">in</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">卡片宽度 (CSS px)</label>
                <input
                  type="range"
                  min={50}
                  max={800}
                  step={1}
                  value={calibrationPxWidth}
                  onChange={(e) => setCalibrationPxWidth(parseInt(e.target.value, 10))}
                  className="w-48"
                />
                <input
                  type="number"
                  min={1}
                  value={calibrationPxWidth}
                  onChange={(e) => setCalibrationPxWidth(Number(e.target.value) || 1)}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div className="text-sm text-gray-700 dark:text-gray-300 mt-2 sm:mt-0">
              估算结果：
              <span className="font-medium ml-1">
                {ppiFromCalibration ? `${formatNumber(ppiFromCalibration)} PPI` : '—'}
              </span>
            </div>
          </div>

          {/* Reference card */}
          <div className="mt-4">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              将下方蓝色卡片的宽度调到与你手边的实体卡等宽，然后查看结果。你也可以改成其它已知宽度的物体（如尺子长度）。
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-md border border-dashed border-gray-300 dark:border-gray-700">
              <div
                className="h-24 bg-blue-600/20 dark:bg-blue-500/20 border border-blue-600/40 dark:border-blue-400/40 rounded-md shadow-inner"
                style={{ width: `${calibrationPxWidth}px` }}
              >
                <div className="h-full w-full flex items-center justify-center text-blue-700 dark:text-blue-300 text-sm">
                  参考宽度：{calibrationPxWidth} px
                </div>
              </div>
            </div>
          </div>

          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            原理：根据屏幕上 CSS 像素与实体物体的真实宽度换算出每英寸的 CSS 像素数，再乘以设备像素比 (DPR) 得到每英寸的设备像素 (PPI)。
          </div>
        </div>

        {/* Tips */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">提示与注意</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <li>不同操作系统的缩放设置、浏览器缩放及多显示器环境可能导致数据偏差。</li>
            <li>如需更高准确度，优先使用“屏幕校准”方法并借助实体卡或刻度尺。</li>
            <li>若输入已知对角线尺寸，请确保单位为英寸 (in)。</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}