'use client';

import { ToolLayout } from '@/components/tool-layout';
import { useState } from 'react';
import { Calculator, ArrowRight, RotateCcw } from 'lucide-react';

interface ConversionCategory {
  id: string;
  name: string;
  units: Unit[];
}

interface Unit {
  id: string;
  name: string;
  symbol: string;
  toBase: (value: number) => number;
  fromBase: (value: number) => number;
}

export default function UnitConverterPage() {
  const [selectedCategory, setSelectedCategory] = useState('length');
  const [fromUnit, setFromUnit] = useState('');
  const [toUnit, setToUnit] = useState('');
  const [fromValue, setFromValue] = useState('');
  const [toValue, setToValue] = useState('');

  const conversionCategories: ConversionCategory[] = [
    {
      id: 'length',
      name: '长度',
      units: [
        { id: 'mm', name: '毫米', symbol: 'mm', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
        { id: 'cm', name: '厘米', symbol: 'cm', toBase: (v) => v / 100, fromBase: (v) => v * 100 },
        { id: 'm', name: '米', symbol: 'm', toBase: (v) => v, fromBase: (v) => v },
        { id: 'km', name: '千米', symbol: 'km', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
        { id: 'in', name: '英寸', symbol: 'in', toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
        { id: 'ft', name: '英尺', symbol: 'ft', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
        { id: 'yd', name: '码', symbol: 'yd', toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
        { id: 'mi', name: '英里', symbol: 'mi', toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
      ],
    },
    {
      id: 'weight',
      name: '重量',
      units: [
        { id: 'mg', name: '毫克', symbol: 'mg', toBase: (v) => v / 1000000, fromBase: (v) => v * 1000000 },
        { id: 'g', name: '克', symbol: 'g', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
        { id: 'kg', name: '千克', symbol: 'kg', toBase: (v) => v, fromBase: (v) => v },
        { id: 't', name: '吨', symbol: 't', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
        { id: 'lb', name: '磅', symbol: 'lb', toBase: (v) => v * 0.453592, fromBase: (v) => v / 0.453592 },
        { id: 'oz', name: '盎司', symbol: 'oz', toBase: (v) => v * 0.0283495, fromBase: (v) => v / 0.0283495 },
      ],
    },
    {
      id: 'temperature',
      name: '温度',
      units: [
        { id: 'c', name: '摄氏度', symbol: '°C', toBase: (v) => v, fromBase: (v) => v },
        { id: 'f', name: '华氏度', symbol: '°F', toBase: (v) => (v - 32) * 5/9, fromBase: (v) => v * 9/5 + 32 },
        { id: 'k', name: '开尔文', symbol: 'K', toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
      ],
    },
    {
      id: 'area',
      name: '面积',
      units: [
        { id: 'mm2', name: '平方毫米', symbol: 'mm²', toBase: (v) => v / 1000000, fromBase: (v) => v * 1000000 },
        { id: 'cm2', name: '平方厘米', symbol: 'cm²', toBase: (v) => v / 10000, fromBase: (v) => v * 10000 },
        { id: 'm2', name: '平方米', symbol: 'm²', toBase: (v) => v, fromBase: (v) => v },
        { id: 'km2', name: '平方千米', symbol: 'km²', toBase: (v) => v * 1000000, fromBase: (v) => v / 1000000 },
        { id: 'in2', name: '平方英寸', symbol: 'in²', toBase: (v) => v * 0.00064516, fromBase: (v) => v / 0.00064516 },
        { id: 'ft2', name: '平方英尺', symbol: 'ft²', toBase: (v) => v * 0.092903, fromBase: (v) => v / 0.092903 },
        { id: 'ac', name: '英亩', symbol: 'ac', toBase: (v) => v * 4046.86, fromBase: (v) => v / 4046.86 },
      ],
    },
    {
      id: 'volume',
      name: '体积',
      units: [
        { id: 'ml', name: '毫升', symbol: 'ml', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
        { id: 'l', name: '升', symbol: 'L', toBase: (v) => v, fromBase: (v) => v },
        { id: 'm3', name: '立方米', symbol: 'm³', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
        { id: 'gal', name: '加仑', symbol: 'gal', toBase: (v) => v * 3.78541, fromBase: (v) => v / 3.78541 },
        { id: 'qt', name: '夸脱', symbol: 'qt', toBase: (v) => v * 0.946353, fromBase: (v) => v / 0.946353 },
        { id: 'pt', name: '品脱', symbol: 'pt', toBase: (v) => v * 0.473176, fromBase: (v) => v / 0.473176 },
      ],
    },
    {
      id: 'speed',
      name: '速度',
      units: [
        { id: 'mps', name: '米/秒', symbol: 'm/s', toBase: (v) => v, fromBase: (v) => v },
        { id: 'kmh', name: '千米/时', symbol: 'km/h', toBase: (v) => v / 3.6, fromBase: (v) => v * 3.6 },
        { id: 'mph', name: '英里/时', symbol: 'mph', toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704 },
        { id: 'knot', name: '节', symbol: 'knot', toBase: (v) => v * 0.514444, fromBase: (v) => v / 0.514444 },
      ],
    },
  ];

  const currentCategory = conversionCategories.find(cat => cat.id === selectedCategory);
  const fromUnitObj = currentCategory?.units.find(u => u.id === fromUnit);
  const toUnitObj = currentCategory?.units.find(u => u.id === toUnit);

  const convert = () => {
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
    
    setToValue(result.toFixed(6).replace(/\.?0+$/, ''));
  };

  const handleFromValueChange = (value: string) => {
    setFromValue(value);
    if (value && fromUnitObj && toUnitObj) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        const baseValue = fromUnitObj.toBase(numValue);
        const result = toUnitObj.fromBase(baseValue);
        setToValue(result.toFixed(6).replace(/\.?0+$/, ''));
      }
    }
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
    if (fromValue && toUnit) {
      const newCategory = conversionCategories.find(cat => cat.id === selectedCategory);
      const newFromUnit = newCategory?.units.find(u => u.id === unitId);
      const newToUnit = newCategory?.units.find(u => u.id === toUnit);
      
      if (newFromUnit && newToUnit) {
        const numValue = parseFloat(fromValue);
        if (!isNaN(numValue)) {
          const baseValue = newFromUnit.toBase(numValue);
          const result = newToUnit.fromBase(baseValue);
          setToValue(result.toFixed(6).replace(/\.?0+$/, ''));
        }
      }
    }
  };

  const handleToUnitChange = (unitId: string) => {
    setToUnit(unitId);
    if (fromValue && fromUnit) {
      const newCategory = conversionCategories.find(cat => cat.id === selectedCategory);
      const newFromUnit = newCategory?.units.find(u => u.id === fromUnit);
      const newToUnit = newCategory?.units.find(u => u.id === unitId);
      
      if (newFromUnit && newToUnit) {
        const numValue = parseFloat(fromValue);
        if (!isNaN(numValue)) {
          const baseValue = newFromUnit.toBase(numValue);
          const result = newToUnit.fromBase(baseValue);
          setToValue(result.toFixed(6).replace(/\.?0+$/, ''));
        }
      }
    }
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

  return (
    <ToolLayout>
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          单位转换器
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          支持长度、重量、温度、面积、体积、速度等单位的转换
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        {/* 分类选择 */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            选择转换类型
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {conversionCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  selectedCategory === category.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {currentCategory && (
          <>
            {/* 单位选择 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  从
                </label>
                <select
                  value={fromUnit}
                  onChange={(e) => handleFromUnitChange(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">选择单位</option>
                  {currentCategory.units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name} ({unit.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  到
                </label>
                <select
                  value={toUnit}
                  onChange={(e) => handleToUnitChange(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">选择单位</option>
                  {currentCategory.units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name} ({unit.symbol})
                    </option>
                  ))}
                </select>
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  转换结果
                </label>
                <input
                  type="text"
                  value={toValue}
                  readOnly
                  placeholder="转换结果"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={convert}
                disabled={!fromValue || !fromUnit || !toUnit}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <Calculator className="w-4 h-4" />
                转换
              </button>

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
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
} 