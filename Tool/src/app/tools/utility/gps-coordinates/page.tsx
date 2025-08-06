'use client';

import { useState, useRef } from 'react';
import { MapPin, Navigation, Crosshair, Copy, Download, Calculator, RefreshCw } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';

interface Coordinate {
  latitude: number;
  longitude: number;
  name?: string;
}

interface DistanceResult {
  distance: number;
  bearing: number;
  midpoint: Coordinate;
}

export default function GPSCoordinatesPage() {
  const [activeTab, setActiveTab] = useState<'converter' | 'distance' | 'current'>('converter');
  
  // 坐标转换
  const [decimalDegrees, setDecimalDegrees] = useState({ lat: '', lng: '' });
  const [dms, setDMS] = useState({ 
    latDeg: '', latMin: '', latSec: '', latDir: 'N',
    lngDeg: '', lngMin: '', lngSec: '', lngDir: 'E'
  });
  
  // 距离计算
  const [point1, setPoint1] = useState({ lat: '', lng: '', name: '点1' });
  const [point2, setPoint2] = useState({ lat: '', lng: '', name: '点2' });
  const [distanceResult, setDistanceResult] = useState<DistanceResult | null>(null);
  
  // 当前位置
  const [currentLocation, setCurrentLocation] = useState<Coordinate | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const [loadingLocation, setLoadingLocation] = useState(false);
  
  const [copied, setCopied] = useState<string>('');

  // 坐标转换函数
  const convertDDToDMS = (dd: number) => {
    const degrees = Math.floor(Math.abs(dd));
    const minutes = Math.floor((Math.abs(dd) - degrees) * 60);
    const seconds = ((Math.abs(dd) - degrees - minutes / 60) * 3600);
    return { degrees, minutes, seconds: parseFloat(seconds.toFixed(6)) };
  };

  const convertDMSToDD = (deg: number, min: number, sec: number, dir: string) => {
    let dd = deg + min / 60 + sec / 3600;
    if (dir === 'S' || dir === 'W') dd = -dd;
    return dd;
  };

  const handleDDChange = (field: 'lat' | 'lng', value: string) => {
    setDecimalDegrees(prev => ({ ...prev, [field]: value }));
    
    const num = parseFloat(value);
    if (!isNaN(num)) {
      const converted = convertDDToDMS(num);
      if (field === 'lat') {
        setDMS(prev => ({
          ...prev,
          latDeg: converted.degrees.toString(),
          latMin: converted.minutes.toString(),
          latSec: converted.seconds.toString(),
          latDir: num >= 0 ? 'N' : 'S'
        }));
      } else {
        setDMS(prev => ({
          ...prev,
          lngDeg: converted.degrees.toString(),
          lngMin: converted.minutes.toString(),
          lngSec: converted.seconds.toString(),
          lngDir: num >= 0 ? 'E' : 'W'
        }));
      }
    }
  };

  const handleDMSChange = () => {
    const latDD = convertDMSToDD(
      parseFloat(dms.latDeg) || 0,
      parseFloat(dms.latMin) || 0,
      parseFloat(dms.latSec) || 0,
      dms.latDir
    );
    const lngDD = convertDMSToDD(
      parseFloat(dms.lngDeg) || 0,
      parseFloat(dms.lngMin) || 0,
      parseFloat(dms.lngSec) || 0,
      dms.lngDir
    );
    
    setDecimalDegrees({
      lat: latDD.toFixed(8),
      lng: lngDD.toFixed(8)
    });
  };

  // 距离计算函数（使用Haversine公式）
  const calculateDistance = () => {
    const lat1 = parseFloat(point1.lat);
    const lng1 = parseFloat(point1.lng);
    const lat2 = parseFloat(point2.lat);
    const lng2 = parseFloat(point2.lng);

    if (isNaN(lat1) || isNaN(lng1) || isNaN(lat2) || isNaN(lng2)) return;

    const R = 6371; // 地球半径（公里）
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    // 计算方位角
    const y = Math.sin(dLng) * Math.cos(lat2 * Math.PI / 180);
    const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
              Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLng);
    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    bearing = (bearing + 360) % 360;

    // 计算中点
    const midLat = (lat1 + lat2) / 2;
    const midLng = (lng1 + lng2) / 2;

    setDistanceResult({
      distance,
      bearing,
      midpoint: { latitude: midLat, longitude: midLng }
    });
  };

  // 获取当前位置
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('此浏览器不支持地理定位');
      return;
    }

    setLoadingLocation(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLoadingLocation(false);
      },
      (error) => {
        let errorMessage = '无法获取位置信息';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '用户拒绝了位置请求';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '位置信息不可用';
            break;
          case error.TIMEOUT:
            errorMessage = '请求位置信息超时';
            break;
        }
        setLocationError(errorMessage);
        setLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(''), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const formatCoordinate = (coord: Coordinate, format: 'dd' | 'dms' = 'dd') => {
    if (format === 'dd') {
      return `${coord.latitude.toFixed(8)}, ${coord.longitude.toFixed(8)}`;
    } else {
      const lat = convertDDToDMS(coord.latitude);
      const lng = convertDDToDMS(coord.longitude);
      const latDir = coord.latitude >= 0 ? 'N' : 'S';
      const lngDir = coord.longitude >= 0 ? 'E' : 'W';
      return `${lat.degrees}°${lat.minutes}'${lat.seconds.toFixed(2)}"${latDir}, ${lng.degrees}°${lng.minutes}'${lng.seconds.toFixed(2)}"${lngDir}`;
    }
  };

  const getGoogleMapsUrl = (coord: Coordinate) => {
    return `https://www.google.com/maps?q=${coord.latitude},${coord.longitude}`;
  };

  const getBearingText = (bearing: number) => {
    const directions = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
    const index = Math.round(bearing / 45) % 8;
    return directions[index];
  };

  return (
    <ToolLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            GPS坐标工具
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            坐标转换、距离计算、当前位置获取等GPS相关功能
          </p>
        </div>

        {/* 标签页导航 */}
        <div className="flex justify-center">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('converter')}
              className={`px-6 py-2 rounded-md transition-colors ${
                activeTab === 'converter'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <MapPin className="w-4 h-4 inline mr-2" />
              坐标转换
            </button>
            <button
              onClick={() => setActiveTab('distance')}
              className={`px-6 py-2 rounded-md transition-colors ${
                activeTab === 'distance'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Calculator className="w-4 h-4 inline mr-2" />
              距离计算
            </button>
            <button
              onClick={() => setActiveTab('current')}
              className={`px-6 py-2 rounded-md transition-colors ${
                activeTab === 'current'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Crosshair className="w-4 h-4 inline mr-2" />
              当前位置
            </button>
          </div>
        </div>

        {/* 坐标转换 */}
        {activeTab === 'converter' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 十进制度数 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                十进制度数 (DD)
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    纬度 (Latitude)
                  </label>
                  <input
                    type="number"
                    value={decimalDegrees.lat}
                    onChange={(e) => handleDDChange('lat', e.target.value)}
                    step="any"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="例: 39.9042"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    经度 (Longitude)
                  </label>
                  <input
                    type="number"
                    value={decimalDegrees.lng}
                    onChange={(e) => handleDDChange('lng', e.target.value)}
                    step="any"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="例: 116.4074"
                  />
                </div>
                {decimalDegrees.lat && decimalDegrees.lng && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-800 dark:text-blue-200">
                        {decimalDegrees.lat}, {decimalDegrees.lng}
                      </span>
                      <button
                        onClick={() => copyToClipboard(`${decimalDegrees.lat}, ${decimalDegrees.lng}`, 'dd')}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 度分秒 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                度分秒 (DMS)
              </h3>
              <div className="space-y-4">
                {/* 纬度 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    纬度
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={dms.latDeg}
                      onChange={(e) => setDMS(prev => ({ ...prev, latDeg: e.target.value }))}
                      onBlur={handleDMSChange}
                      className="flex-1 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="度"
                    />
                    <input
                      type="number"
                      value={dms.latMin}
                      onChange={(e) => setDMS(prev => ({ ...prev, latMin: e.target.value }))}
                      onBlur={handleDMSChange}
                      className="flex-1 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="分"
                    />
                    <input
                      type="number"
                      value={dms.latSec}
                      onChange={(e) => setDMS(prev => ({ ...prev, latSec: e.target.value }))}
                      onBlur={handleDMSChange}
                      step="any"
                      className="flex-1 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="秒"
                    />
                    <select
                      value={dms.latDir}
                      onChange={(e) => setDMS(prev => ({ ...prev, latDir: e.target.value }))}
                      onBlur={handleDMSChange}
                      className="px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="N">N</option>
                      <option value="S">S</option>
                    </select>
                  </div>
                </div>

                {/* 经度 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    经度
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={dms.lngDeg}
                      onChange={(e) => setDMS(prev => ({ ...prev, lngDeg: e.target.value }))}
                      onBlur={handleDMSChange}
                      className="flex-1 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="度"
                    />
                    <input
                      type="number"
                      value={dms.lngMin}
                      onChange={(e) => setDMS(prev => ({ ...prev, lngMin: e.target.value }))}
                      onBlur={handleDMSChange}
                      className="flex-1 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="分"
                    />
                    <input
                      type="number"
                      value={dms.lngSec}
                      onChange={(e) => setDMS(prev => ({ ...prev, lngSec: e.target.value }))}
                      onBlur={handleDMSChange}
                      step="any"
                      className="flex-1 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="秒"
                    />
                    <select
                      value={dms.lngDir}
                      onChange={(e) => setDMS(prev => ({ ...prev, lngDir: e.target.value }))}
                      onBlur={handleDMSChange}
                      className="px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="E">E</option>
                      <option value="W">W</option>
                    </select>
                  </div>
                </div>

                {dms.latDeg && dms.lngDeg && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-800 dark:text-green-200">
                        {dms.latDeg}°{dms.latMin}'{dms.latSec}"{dms.latDir}, {dms.lngDeg}°{dms.lngMin}'{dms.lngSec}"{dms.lngDir}
                      </span>
                      <button
                        onClick={() => copyToClipboard(
                          `${dms.latDeg}°${dms.latMin}'${dms.latSec}"${dms.latDir}, ${dms.lngDeg}°${dms.lngMin}'${dms.lngSec}"${dms.lngDir}`,
                          'dms'
                        )}
                        className="text-green-600 hover:text-green-700 dark:text-green-400"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 距离计算 */}
        {activeTab === 'distance' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 起点 */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">起点</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      名称
                    </label>
                    <input
                      type="text"
                      value={point1.name}
                      onChange={(e) => setPoint1(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      纬度
                    </label>
                    <input
                      type="number"
                      value={point1.lat}
                      onChange={(e) => setPoint1(prev => ({ ...prev, lat: e.target.value }))}
                      step="any"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="例: 39.9042"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      经度
                    </label>
                    <input
                      type="number"
                      value={point1.lng}
                      onChange={(e) => setPoint1(prev => ({ ...prev, lng: e.target.value }))}
                      step="any"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="例: 116.4074"
                    />
                  </div>
                </div>
              </div>

              {/* 终点 */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">终点</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      名称
                    </label>
                    <input
                      type="text"
                      value={point2.name}
                      onChange={(e) => setPoint2(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      纬度
                    </label>
                    <input
                      type="number"
                      value={point2.lat}
                      onChange={(e) => setPoint2(prev => ({ ...prev, lat: e.target.value }))}
                      step="any"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="例: 31.2304"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      经度
                    </label>
                    <input
                      type="number"
                      value={point2.lng}
                      onChange={(e) => setPoint2(prev => ({ ...prev, lng: e.target.value }))}
                      step="any"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="例: 121.4737"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={calculateDistance}
                className="bg-blue-500 text-white py-3 px-8 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2 mx-auto"
              >
                <Calculator className="w-5 h-5" />
                <span>计算距离</span>
              </button>
            </div>

            {/* 计算结果 */}
            {distanceResult && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">计算结果</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {distanceResult.distance.toFixed(2)} km
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">直线距离</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {(distanceResult.distance * 0.621371).toFixed(2)} 英里
                    </div>
                  </div>

                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {distanceResult.bearing.toFixed(1)}°
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">方位角</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {getBearingText(distanceResult.bearing)}
                    </div>
                  </div>

                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
                      {distanceResult.midpoint.latitude.toFixed(6)}, {distanceResult.midpoint.longitude.toFixed(6)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">中点坐标</div>
                    <button
                      onClick={() => copyToClipboard(
                        `${distanceResult.midpoint.latitude.toFixed(6)}, ${distanceResult.midpoint.longitude.toFixed(6)}`,
                        'midpoint'
                      )}
                      className="text-purple-600 hover:text-purple-700 dark:text-purple-400 mt-1"
                    >
                      <Copy className="w-3 h-3 inline" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 当前位置 */}
        {activeTab === 'current' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">获取当前位置</h3>
              
              <div className="text-center space-y-4">
                <button
                  onClick={getCurrentLocation}
                  disabled={loadingLocation}
                  className="bg-blue-500 text-white py-3 px-8 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingLocation ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Crosshair className="w-5 h-5" />
                  )}
                  <span>{loadingLocation ? '获取中...' : '获取当前位置'}</span>
                </button>

                {locationError && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-800 dark:text-red-200">
                    {locationError}
                  </div>
                )}

                {currentLocation && (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">当前位置</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-green-700 dark:text-green-300">十进制度数:</span>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono">{formatCoordinate(currentLocation, 'dd')}</span>
                            <button
                              onClick={() => copyToClipboard(formatCoordinate(currentLocation, 'dd'), 'current-dd')}
                              className="text-green-600 hover:text-green-700 dark:text-green-400"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-green-700 dark:text-green-300">度分秒:</span>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs">{formatCoordinate(currentLocation, 'dms')}</span>
                            <button
                              onClick={() => copyToClipboard(formatCoordinate(currentLocation, 'dms'), 'current-dms')}
                              className="text-green-600 hover:text-green-700 dark:text-green-400"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <a
                        href={getGoogleMapsUrl(currentLocation)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-center"
                      >
                        在Google地图中查看
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {copied && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
            已复制到剪贴板
          </div>
        )}
      </div>
    </ToolLayout>
  );
}