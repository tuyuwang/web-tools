'use client';

import { ToolLayout } from '@/components/tool-layout';
import { useState, useEffect, useRef } from 'react';
import { Calculator, ArrowRight, RotateCcw, Star, History, Plus, Trash2, Info, BookOpen, Settings, Download, Upload, Heart, Copy } from 'lucide-react';

interface ConversionCategory {
  id: string;
  name: string;
  description: string;
  units: Unit[];
}

interface Unit {
  id: string;
  name: string;
  symbol: string;
  toBase: (value: number) => number;
  fromBase: (value: number) => number;
  formula?: string;
  description?: string;
  isCustom?: boolean;
}

interface FavoriteUnit {
  id: string;
  categoryId: string;
  unitId: string;
  name: string;
  symbol: string;
  addedAt: Date;
}

interface ConversionHistory {
  id: string;
  categoryId: string;
  fromUnit: string;
  toUnit: string;
  fromValue: number;
  toValue: number;
  timestamp: Date;
  formula?: string;
}

interface CustomUnit {
  id: string;
  categoryId: string;
  name: string;
  symbol: string;
  formula: string;
  description: string;
  toBase: (value: number) => number;
  fromBase: (value: number) => number;
}

export default function UnitConverterPage() {
  const [selectedCategory, setSelectedCategory] = useState('length');
  const [fromUnit, setFromUnit] = useState('');
  const [toUnit, setToUnit] = useState('');
  const [fromValue, setFromValue] = useState('');
  const [toValue, setToValue] = useState('');
  const [favorites, setFavorites] = useState<FavoriteUnit[]>([]);
  const [history, setHistory] = useState<ConversionHistory[]>([]);
  const [customUnits, setCustomUnits] = useState<CustomUnit[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showFormula, setShowFormula] = useState(false);
  const [showCustomUnits, setShowCustomUnits] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [precision, setPrecision] = useState(6);
  const [realTimeConversion, setRealTimeConversion] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const conversionCategories: ConversionCategory[] = [
    {
      id: 'length',
      name: '长度',
      description: '距离和长度单位转换',
      units: [
        { id: 'mm', name: '毫米', symbol: 'mm', toBase: (v) => v / 1000, fromBase: (v) => v * 1000, formula: '毫米 = 米 × 1000', description: '长度的基本单位，1毫米 = 0.001米' },
        { id: 'cm', name: '厘米', symbol: 'cm', toBase: (v) => v / 100, fromBase: (v) => v * 100, formula: '厘米 = 米 × 100', description: '常用长度单位，1厘米 = 0.01米' },
        { id: 'm', name: '米', symbol: 'm', toBase: (v) => v, fromBase: (v) => v, formula: '基准单位', description: '国际单位制长度基本单位' },
        { id: 'km', name: '千米', symbol: 'km', toBase: (v) => v * 1000, fromBase: (v) => v / 1000, formula: '千米 = 米 ÷ 1000', description: '长距离单位，1千米 = 1000米' },
        { id: 'in', name: '英寸', symbol: 'in', toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254, formula: '英寸 = 米 ÷ 0.0254', description: '英制长度单位，1英寸 = 2.54厘米' },
        { id: 'ft', name: '英尺', symbol: 'ft', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048, formula: '英尺 = 米 ÷ 0.3048', description: '英制长度单位，1英尺 = 12英寸' },
        { id: 'yd', name: '码', symbol: 'yd', toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144, formula: '码 = 米 ÷ 0.9144', description: '英制长度单位，1码 = 3英尺' },
        { id: 'mi', name: '英里', symbol: 'mi', toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344, formula: '英里 = 米 ÷ 1609.344', description: '英制长距离单位，1英里 = 1760码' },
      ],
    },
    {
      id: 'weight',
      name: '重量',
      description: '质量和重量单位转换',
      units: [
        { id: 'mg', name: '毫克', symbol: 'mg', toBase: (v) => v / 1000000, fromBase: (v) => v * 1000000, formula: '毫克 = 千克 × 1000000', description: '微小重量单位，1毫克 = 0.001克' },
        { id: 'g', name: '克', symbol: 'g', toBase: (v) => v / 1000, fromBase: (v) => v * 1000, formula: '克 = 千克 × 1000', description: '常用重量单位，1克 = 0.001千克' },
        { id: 'kg', name: '千克', symbol: 'kg', toBase: (v) => v, fromBase: (v) => v, formula: '基准单位', description: '国际单位制质量基本单位' },
        { id: 't', name: '吨', symbol: 't', toBase: (v) => v * 1000, fromBase: (v) => v / 1000, formula: '吨 = 千克 ÷ 1000', description: '大重量单位，1吨 = 1000千克' },
        { id: 'lb', name: '磅', symbol: 'lb', toBase: (v) => v * 0.453592, fromBase: (v) => v / 0.453592, formula: '磅 = 千克 ÷ 0.453592', description: '英制重量单位，1磅 ≈ 0.454千克' },
        { id: 'oz', name: '盎司', symbol: 'oz', toBase: (v) => v * 0.0283495, fromBase: (v) => v / 0.0283495, formula: '盎司 = 千克 ÷ 0.0283495', description: '英制重量单位，1盎司 ≈ 28.35克' },
      ],
    },
    {
      id: 'temperature',
      name: '温度',
      description: '温度单位转换',
      units: [
        { id: 'c', name: '摄氏度', symbol: '°C', toBase: (v) => v, fromBase: (v) => v, formula: '基准单位', description: '常用温度单位，水的冰点为0°C' },
        { id: 'f', name: '华氏度', symbol: '°F', toBase: (v) => (v - 32) * 5/9, fromBase: (v) => v * 9/5 + 32, formula: '°F = °C × 9/5 + 32', description: '英制温度单位，水的冰点为32°F' },
        { id: 'k', name: '开尔文', symbol: 'K', toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15, formula: 'K = °C + 273.15', description: '绝对温度单位，绝对零度为0K' },
      ],
    },
    {
      id: 'area',
      name: '面积',
      description: '面积单位转换',
      units: [
        { id: 'mm2', name: '平方毫米', symbol: 'mm²', toBase: (v) => v / 1000000, fromBase: (v) => v * 1000000, formula: 'mm² = m² × 1000000', description: '微小面积单位' },
        { id: 'cm2', name: '平方厘米', symbol: 'cm²', toBase: (v) => v / 10000, fromBase: (v) => v * 10000, formula: 'cm² = m² × 10000', description: '常用面积单位' },
        { id: 'm2', name: '平方米', symbol: 'm²', toBase: (v) => v, fromBase: (v) => v, formula: '基准单位', description: '国际单位制面积单位' },
        { id: 'km2', name: '平方千米', symbol: 'km²', toBase: (v) => v * 1000000, fromBase: (v) => v / 1000000, formula: 'km² = m² ÷ 1000000', description: '大面积单位，1平方千米 = 100公顷' },
        { id: 'in2', name: '平方英寸', symbol: 'in²', toBase: (v) => v * 0.00064516, fromBase: (v) => v / 0.00064516, formula: 'in² = m² ÷ 0.00064516', description: '英制面积单位' },
        { id: 'ft2', name: '平方英尺', symbol: 'ft²', toBase: (v) => v * 0.092903, fromBase: (v) => v / 0.092903, formula: 'ft² = m² ÷ 0.092903', description: '英制面积单位' },
        { id: 'ac', name: '英亩', symbol: 'ac', toBase: (v) => v * 4046.86, fromBase: (v) => v / 4046.86, formula: 'ac = m² ÷ 4046.86', description: '土地面积单位，1英亩 ≈ 4047平方米' },
      ],
    },
    {
      id: 'volume',
      name: '体积',
      description: '体积和容量单位转换',
      units: [
        { id: 'ml', name: '毫升', symbol: 'ml', toBase: (v) => v / 1000, fromBase: (v) => v * 1000, formula: 'ml = L × 1000', description: '小容量单位，1毫升 = 0.001升' },
        { id: 'l', name: '升', symbol: 'L', toBase: (v) => v, fromBase: (v) => v, formula: '基准单位', description: '常用容量单位' },
        { id: 'm3', name: '立方米', symbol: 'm³', toBase: (v) => v * 1000, fromBase: (v) => v / 1000, formula: 'm³ = L ÷ 1000', description: '大体积单位，1立方米 = 1000升' },
        { id: 'gal', name: '加仑', symbol: 'gal', toBase: (v) => v * 3.78541, fromBase: (v) => v / 3.78541, formula: 'gal = L ÷ 3.78541', description: '英制容量单位，1加仑 ≈ 3.785升' },
        { id: 'qt', name: '夸脱', symbol: 'qt', toBase: (v) => v * 0.946353, fromBase: (v) => v / 0.946353, formula: 'qt = L ÷ 0.946353', description: '英制容量单位，1夸脱 = 1/4加仑' },
        { id: 'pt', name: '品脱', symbol: 'pt', toBase: (v) => v * 0.473176, fromBase: (v) => v / 0.473176, formula: 'pt = L ÷ 0.473176', description: '英制容量单位，1品脱 = 1/2夸脱' },
      ],
    },
    {
      id: 'speed',
      name: '速度',
      description: '速度单位转换',
      units: [
        { id: 'mps', name: '米/秒', symbol: 'm/s', toBase: (v) => v, fromBase: (v) => v, formula: '基准单位', description: '国际单位制速度单位' },
        { id: 'kmh', name: '千米/时', symbol: 'km/h', toBase: (v) => v / 3.6, fromBase: (v) => v * 3.6, formula: 'km/h = m/s × 3.6', description: '常用速度单位' },
        { id: 'mph', name: '英里/时', symbol: 'mph', toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704, formula: 'mph = m/s ÷ 0.44704', description: '英制速度单位' },
        { id: 'knot', name: '节', symbol: 'knot', toBase: (v) => v * 0.514444, fromBase: (v) => v / 0.514444, formula: 'knot = m/s ÷ 0.514444', description: '海上速度单位，1节 = 1海里/小时' },
      ],
    },
    {
      id: 'energy',
      name: '能量',
      description: '能量和功单位转换',
      units: [
        { id: 'j', name: '焦耳', symbol: 'J', toBase: (v) => v, fromBase: (v) => v, formula: '基准单位', description: '国际单位制能量单位' },
        { id: 'kj', name: '千焦', symbol: 'kJ', toBase: (v) => v * 1000, fromBase: (v) => v / 1000, formula: 'kJ = J ÷ 1000', description: '大能量单位，1千焦 = 1000焦耳' },
        { id: 'cal', name: '卡路里', symbol: 'cal', toBase: (v) => v * 4.184, fromBase: (v) => v / 4.184, formula: 'cal = J ÷ 4.184', description: '热量单位，1卡路里 ≈ 4.184焦耳' },
        { id: 'kcal', name: '千卡', symbol: 'kcal', toBase: (v) => v * 4184, fromBase: (v) => v / 4184, formula: 'kcal = J ÷ 4184', description: '食物热量单位，1千卡 = 1000卡路里' },
        { id: 'kwh', name: '千瓦时', symbol: 'kWh', toBase: (v) => v * 3600000, fromBase: (v) => v / 3600000, formula: 'kWh = J ÷ 3600000', description: '电能单位，1千瓦时 = 3.6×10⁶焦耳' },
      ],
    },
    {
      id: 'pressure',
      name: '压力',
      description: '压力和压强单位转换',
      units: [
        { id: 'pa', name: '帕斯卡', symbol: 'Pa', toBase: (v) => v, fromBase: (v) => v, formula: '基准单位', description: '国际单位制压力单位' },
        { id: 'kpa', name: '千帕', symbol: 'kPa', toBase: (v) => v * 1000, fromBase: (v) => v / 1000, formula: 'kPa = Pa ÷ 1000', description: '常用压力单位' },
        { id: 'bar', name: '巴', symbol: 'bar', toBase: (v) => v * 100000, fromBase: (v) => v / 100000, formula: 'bar = Pa ÷ 100000', description: '气象压力单位，1巴 = 10⁵帕' },
        { id: 'atm', name: '标准大气压', symbol: 'atm', toBase: (v) => v * 101325, fromBase: (v) => v / 101325, formula: 'atm = Pa ÷ 101325', description: '标准大气压，1atm = 101.325kPa' },
        { id: 'psi', name: '磅每平方英寸', symbol: 'psi', toBase: (v) => v * 6894.76, fromBase: (v) => v / 6894.76, formula: 'psi = Pa ÷ 6894.76', description: '英制压力单位' },
      ],
    },
  ];

  // 合并自定义单位
  const getAllCategories = () => {
    return conversionCategories.map(category => ({
      ...category,
      units: [
        ...category.units,
        ...customUnits.filter(unit => unit.categoryId === category.id).map(unit => ({
          id: unit.id,
          name: unit.name,
          symbol: unit.symbol,
          toBase: unit.toBase,
          fromBase: unit.fromBase,
          formula: unit.formula,
          description: unit.description,
          isCustom: true
        }))
      ]
    }));
  };

  const currentCategory = getAllCategories().find(cat => cat.id === selectedCategory);
  const fromUnitObj = currentCategory?.units.find(u => u.id === fromUnit);
  const toUnitObj = currentCategory?.units.find(u => u.id === toUnit);

  // 实时转换
  useEffect(() => {
    if (realTimeConversion && fromValue && fromUnitObj && toUnitObj) {
      performConversion();
    }
  }, [fromValue, fromUnit, toUnit, realTimeConversion, precision]);

  const performConversion = () => {
    if (!fromValue || !fromUnitObj || !toUnitObj) {
      setToValue('');
      return;
    }

    const numValue = parseFloat(fromValue);
    if (isNaN(numValue)) {
      setToValue('');
      return;
    }

    // 先转换为基准单位，再转换为目标单位
    const baseValue = fromUnitObj.toBase(numValue);
    const result = toUnitObj.fromBase(baseValue);
    
    const formattedResult = result.toFixed(precision).replace(/\.?0+$/, '');
    setToValue(formattedResult);

    // 添加到历史记录
    if (fromValue && fromUnit && toUnit) {
      const historyItem: ConversionHistory = {
        id: Date.now().toString(),
        categoryId: selectedCategory,
        fromUnit,
        toUnit,
        fromValue: numValue,
        toValue: result,
        timestamp: new Date(),
        formula: getConversionFormula()
      };
      
      setHistory(prev => [historyItem, ...prev.slice(0, 49)]); // 保留最近50条记录
    }
  };

  const getConversionFormula = () => {
    if (!fromUnitObj || !toUnitObj) return '';
    
    if (fromUnitObj.id === toUnitObj.id) {
      return `${fromUnitObj.symbol} = ${toUnitObj.symbol}`;
    }
    
    // 构建转换公式
    const fromFormula = fromUnitObj.formula || `${fromUnitObj.symbol} → 基准`;
    const toFormula = toUnitObj.formula || `基准 → ${toUnitObj.symbol}`;
    
    return `${fromUnitObj.symbol} → ${toUnitObj.symbol}: ${fromFormula} → ${toFormula}`;
  };

  const handleFromValueChange = (value: string) => {
    setFromValue(value);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setFromUnit('');
    setToUnit('');
    setFromValue('');
    setToValue('');
  };

  const handleFromUnitChange = (unitId: string) => {
    setFromUnit(unitId);
  };

  const handleToUnitChange = (unitId: string) => {
    setToUnit(unitId);
  };

  const swapUnits = () => {
    if (fromUnit && toUnit) {
      const tempUnit = fromUnit;
      const tempValue = fromValue;
      setFromUnit(toUnit);
      setToUnit(tempUnit);
      setFromValue(toValue);
      setToValue(tempValue);
    }
  };

  const reset = () => {
    setFromValue('');
    setToValue('');
  };

  const addToFavorites = (unitId: string) => {
    if (!currentCategory) return;
    
    const unit = currentCategory.units.find(u => u.id === unitId);
    if (!unit) return;
    
    const favorite: FavoriteUnit = {
      id: Date.now().toString(),
      categoryId: selectedCategory,
      unitId,
      name: unit.name,
      symbol: unit.symbol,
      addedAt: new Date()
    };
    
    setFavorites(prev => [favorite, ...prev]);
  };

  const removeFromFavorites = (favoriteId: string) => {
    setFavorites(prev => prev.filter(f => f.id !== favoriteId));
  };

  const loadFromHistory = (historyItem: ConversionHistory) => {
    setSelectedCategory(historyItem.categoryId);
    setFromUnit(historyItem.fromUnit);
    setToUnit(historyItem.toUnit);
    setFromValue(historyItem.fromValue.toString());
    setToValue(historyItem.toValue.toFixed(precision).replace(/\.?0+$/, ''));
    setShowHistory(false);
  };

  const addCustomUnit = () => {
    const name = prompt('请输入单位名称:');
    if (!name) return;
    
    const symbol = prompt('请输入单位符号:');
    if (!symbol) return;
    
    const formula = prompt('请输入转换公式 (相对于基准单位):');
    if (!formula) return;
    
    const description = prompt('请输入单位描述 (可选):') || '';
    
    try {
      // 简单的公式解析 - 这里可以扩展为更复杂的解析器
      const toBaseFunc = new Function('v', `return ${formula.replace(/x/g, 'v')}`);
      const fromBaseFunc = new Function('v', `return v / (${formula.replace(/x/g, '1')})`);
      
      const customUnit: CustomUnit = {
        id: Date.now().toString(),
        categoryId: selectedCategory,
        name,
        symbol,
        formula,
        description,
        toBase: toBaseFunc,
        fromBase: fromBaseFunc
      };
      
      setCustomUnits(prev => [customUnit, ...prev]);
    } catch (error) {
      alert('公式格式错误，请使用 x 作为变量，如: x * 2.54');
    }
  };

  const removeCustomUnit = (unitId: string) => {
    setCustomUnits(prev => prev.filter(u => u.id !== unitId));
  };

  const exportData = () => {
    const data = {
      favorites,
      history,
      customUnits,
      settings: { precision, realTimeConversion },
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unit-converter-data-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (data.favorites) setFavorites(data.favorites);
        if (data.history) setHistory(data.history);
        if (data.customUnits) setCustomUnits(data.customUnits);
        if (data.settings) {
          setPrecision(data.settings.precision || 6);
          setRealTimeConversion(data.settings.realTimeConversion !== false);
        }
        
        alert('数据导入成功！');
      } catch (error) {
        alert('导入失败：文件格式错误');
      }
    };
    reader.readAsText(file);
  };

  const copyResult = () => {
    if (toValue && navigator.clipboard) {
      navigator.clipboard.writeText(toValue);
    }
  };

  return (
    <ToolLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            单位转换器
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            强大的单位转换工具，支持收藏单位、历史记录、自定义单位等功能
          </p>
        </div>

        {/* 工具栏 */}
        <div className="flex flex-wrap gap-4 justify-center items-center">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="realTimeConversion"
              checked={realTimeConversion}
              onChange={(e) => setRealTimeConversion(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="realTimeConversion" className="text-sm text-gray-700 dark:text-gray-300">
              实时转换
            </label>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className={`btn text-sm ${showFavorites ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}
            >
              <Heart className="w-4 h-4 mr-1" />
              收藏夹
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`btn text-sm ${showHistory ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}
            >
              <History className="w-4 h-4 mr-1" />
              历史记录
            </button>
            <button
              onClick={() => setShowCustomUnits(!showCustomUnits)}
              className={`btn text-sm ${showCustomUnits ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}
            >
              <Plus className="w-4 h-4 mr-1" />
              自定义单位
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`btn text-sm ${showSettings ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}
            >
              <Settings className="w-4 h-4 mr-1" />
              设置
            </button>
          </div>
        </div>

        {/* 设置面板 */}
        {showSettings && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">设置</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  小数位精度: {precision}
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={precision}
                  onChange={(e) => setPrecision(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  设置转换结果的小数位数
                </div>
              </div>
              
              <div className="flex gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                />
                <button
                  onClick={exportData}
                  className="btn bg-green-600 hover:bg-green-700 text-white text-sm"
                >
                  <Download className="w-4 h-4 mr-1" />
                  导出数据
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn bg-blue-600 hover:bg-blue-700 text-white text-sm"
                >
                  <Upload className="w-4 h-4 mr-1" />
                  导入数据
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          {/* 分类选择 */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              选择转换类型
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {getAllCategories().map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`p-3 rounded-lg border transition-colors text-left ${
                    selectedCategory === category.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="font-medium">{category.name}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {category.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {currentCategory && (
            <>
              {/* 单位选择 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      从
                    </label>
                    {fromUnit && (
                      <button
                        onClick={() => addToFavorites(fromUnit)}
                        className="p-1 text-gray-400 hover:text-yellow-500"
                        title="添加到收藏"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <select
                    value={fromUnit}
                    onChange={(e) => handleFromUnitChange(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">选择单位</option>
                    {currentCategory.units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name} ({unit.symbol}) {unit.isCustom ? '(自定义)' : ''}
                      </option>
                    ))}
                  </select>
                  {fromUnitObj && (
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {fromUnitObj.description}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      到
                    </label>
                    {toUnit && (
                      <button
                        onClick={() => addToFavorites(toUnit)}
                        className="p-1 text-gray-400 hover:text-yellow-500"
                        title="添加到收藏"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <select
                    value={toUnit}
                    onChange={(e) => handleToUnitChange(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">选择单位</option>
                    {currentCategory.units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name} ({unit.symbol}) {unit.isCustom ? '(自定义)' : ''}
                      </option>
                    ))}
                  </select>
                  {toUnitObj && (
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {toUnitObj.description}
                    </div>
                  )}
                </div>
              </div>

              {/* 数值输入 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    输入数值
                  </label>
                  <input
                    type="number"
                    value={fromValue}
                    onChange={(e) => handleFromValueChange(e.target.value)}
                    placeholder="输入数值"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      转换结果
                    </label>
                    {toValue && (
                      <button
                        onClick={copyResult}
                        className="p-1 text-gray-400 hover:text-blue-500"
                        title="复制结果"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={toValue}
                    readOnly
                    placeholder="转换结果"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* 转换公式显示 */}
              {showFormula && fromUnitObj && toUnitObj && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">转换公式</span>
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300 font-mono">
                    {getConversionFormula()}
                  </div>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex flex-wrap gap-3">
                {!realTimeConversion && (
                  <button
                    onClick={performConversion}
                    disabled={!fromValue || !fromUnit || !toUnit}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <Calculator className="w-4 h-4" />
                    转换
                  </button>
                )}

                <button
                  onClick={swapUnits}
                  disabled={!fromUnit || !toUnit}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                  交换单位
                </button>

                <button
                  onClick={reset}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  重置
                </button>

                <button
                  onClick={() => setShowFormula(!showFormula)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    showFormula 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  <Info className="w-4 h-4" />
                  {showFormula ? '隐藏公式' : '显示公式'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* 收藏夹面板 */}
        {showFavorites && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">收藏的单位</h3>
              <button
                onClick={() => setFavorites([])}
                className="btn bg-red-600 hover:bg-red-700 text-white text-sm"
              >
                清空收藏
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {favorites.length > 0 ? (
                favorites.map((favorite) => (
                  <div
                    key={favorite.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {favorite.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {favorite.symbol} • {getAllCategories().find(c => c.id === favorite.categoryId)?.name}
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromFavorites(favorite.id)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-8">
                  暂无收藏的单位
                </div>
              )}
            </div>
          </div>
        )}

        {/* 历史记录面板 */}
        {showHistory && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">转换历史</h3>
              <button
                onClick={() => setHistory([])}
                className="btn bg-red-600 hover:bg-red-700 text-white text-sm"
              >
                清空历史
              </button>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {history.length > 0 ? (
                history.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => loadFromHistory(item)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {item.fromValue} → {item.toValue.toFixed(precision).replace(/\.?0+$/, '')}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {item.timestamp.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {getAllCategories().find(c => c.id === item.categoryId)?.name}: {item.fromUnit} → {item.toUnit}
                    </div>
                    {item.formula && (
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 font-mono">
                        {item.formula}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  暂无转换历史
                </div>
              )}
            </div>
          </div>
        )}

        {/* 自定义单位面板 */}
        {showCustomUnits && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">自定义单位</h3>
              <button
                onClick={addCustomUnit}
                className="btn bg-green-600 hover:bg-green-700 text-white text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                添加单位
              </button>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {customUnits.length > 0 ? (
                customUnits.map((unit) => (
                  <div
                    key={unit.id}
                    className="p-3 border rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {unit.name} ({unit.symbol})
                        </span>
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                          {getAllCategories().find(c => c.id === unit.categoryId)?.name}
                        </span>
                      </div>
                      <button
                        onClick={() => removeCustomUnit(unit.id)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      公式: {unit.formula}
                    </div>
                    {unit.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {unit.description}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  暂无自定义单位
                </div>
              )}
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">
            使用说明
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">基本功能</h4>
              <ul className="space-y-1 text-blue-700 dark:text-blue-300 text-sm">
                <li>• 支持8个类别的单位转换</li>
                <li>• 实时转换和精度设置</li>
                <li>• 显示转换公式和单位说明</li>
                <li>• 收藏常用单位组合</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">高级功能</h4>
              <ul className="space-y-1 text-blue-700 dark:text-blue-300 text-sm">
                <li>• 转换历史记录管理</li>
                <li>• 自定义单位添加</li>
                <li>• 数据导入导出功能</li>
                <li>• 公式显示和说明</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
} 