'use client';

import { useState } from 'react';
import { Copy, RotateCcw, RefreshCw } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';

function convertObjectiveCToLua(source: string): string {
  if (!source.trim()) return '';

  let code = source;

  // Remove comments (simple)
  code = code.replace(/\/\/[\s\S]*?$/gm, '');
  code = code.replace(/\/\*[\s\S]*?\*\//g, '');

  // Map @interface/@implementation blocks to Lua module-like tables
  code = code.replace(/@interface\s+(\w+)\s*:[^{\n]+\{?[\s\S]*?@end/g, (_m, cls) => {
    return `-- class ${cls} (declaration omitted)`;
  });
  code = code.replace(/@implementation\s+(\w+)[\s\S]*?@end/g, (_m, cls) => {
    return `-- implementation ${cls} (methods converted below)`;
  });

  // Remove attributes like @autoreleasepool, @synchronized, etc.
  code = code.replace(/@autoreleasepool\s*\{[\s\S]*?\}/g, (m) => m.replace(/@autoreleasepool\s*\{/, '').replace(/\}$/, ''));
  code = code.replace(/@synchronized\s*\([^\)]*\)\s*\{([\s\S]*?)\}/g, '$1');

  // Literals: @"str" => "str"
  code = code.replace(/@"([\s\S]*?)"/g, '"$1"');
  // NSNumber: @(123) => 123
  code = code.replace(/@\(([^\)]+)\)/g, '$1');

  // Collections: @[a, b] -> {a, b}; @{ k: v } -> { k = v }
  code = code.replace(/@\[([\s\S]*?)\]/g, (_m, inner) => `{ ${inner} }`);
  code = code.replace(/@\{([\s\S]*?)\}/g, (_m, inner) => {
    // Convert key: value to key = value
    const replaced = inner.replace(/([A-Za-z_][\w]*)\s*:\s*/g, '$1 = ');
    return `{ ${replaced} }`;
  });

  // Method signatures to Lua functions (heuristic)
  // - (Return)method:(Type)param other:(Type)q { ... } => function Class:method(param, q) ... end
  code = code.replace(/[-\+]\s*\([^\)]*\)\s*([A-Za-z_][\w]*)\s*(?::\s*\([^\)]*\)\s*([A-Za-z_][\w]*))?(?:\s*([A-Za-z_][\w]*)?\s*:\s*\([^\)]*\)\s*([A-Za-z_][\w]*))?\s*\{([\s\S]*?)\}/g,
    (_m, method, p1, label2, p2, body) => {
      const params: string[] = [];
      if (p1) params.push(p1);
      if (p2) params.push(p2);
      const luaBody = body
        .replace(/self\./g, 'self:')
        .replace(/\[([^\s\]]+)\s+([^\]]+)\]/g, (_m2: string, target: string, msg: string) => {
          // [obj doSomething:arg] => obj:doSomething(arg)
          const parts = msg.split(':');
          if (parts.length > 1) {
            const fn = parts[0];
            const args = parts.slice(1).join(', ').trim();
            return `${target}:${fn}(${args})`;
          }
          return `${target}:${msg}()`;
        })
        .replace(/return\s+([^;]+);/g, 'return $1')
        .replace(/;+/g, '');
      const paramList = params.join(', ');
      return `function self:${method}(${paramList})\n${luaBody}\nend`;
    });

  // Messages: [obj method] => obj:method()
  code = code.replace(/\[([^\s\]]+)\s+([A-Za-z_][\w]*)\]/g, (_m, obj, sel) => `${obj}:${sel}()`);
  // Messages with arg: [obj method:arg] => obj:method(arg)
  code = code.replace(/\[([^\s\]]+)\s+([A-Za-z_][\w]*)\s*:\s*([^\]]+)\]/g, (_m, obj, sel, arg) => `${obj}:${sel}(${arg.trim()})`);

  // Types and qualifiers removal
  code = code.replace(/\b(NS\w+|BOOL|NSInteger|NSUInteger|CGFloat|double|float|int|long|short|char|id|void|BOOL)\b/g, '');
  code = code.replace(/\*\s*/g, '');

  // Property accessors: self.property -> self.property (keep), but remove `self->` patterns
  code = code.replace(/self->/g, 'self.');

  // Control flow
  code = code.replace(/if\s*\(([^\)]+)\)\s*\{([\s\S]*?)\}/g, (_m, cond, body) => `if ${cond} then\n${body}\nend`);
  code = code.replace(/else if\s*\(([^\)]+)\)\s*\{([\s\S]*?)\}/g, (_m, cond, body) => `elseif ${cond} then\n${body}`);
  code = code.replace(/else\s*\{([\s\S]*?)\}/g, (_m, body) => `else\n${body}\nend`);
  code = code.replace(/for\s*\(([^;]+);([^;]+);([^\)]+)\)\s*\{([\s\S]*?)\}/g, (_m, init, cond, step, body) => `-- for (${init}; ${cond}; ${step})\nwhile ${cond} do\n${body}\n  -- ${step}\nend`);
  code = code.replace(/while\s*\(([^\)]+)\)\s*\{([\s\S]*?)\}/g, (_m, cond, body) => `while ${cond} do\n${body}\nend`);

  // Remove semicolons and leftover parentheses-only lines
  code = code.replace(/;\s*$/gm, '');

  // Trim and add Lua header
  const lua = code.trim();
  return `-- Converted from Objective-C (heuristic)\n${lua}\n`;
}

export default function OCToLuaPage() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isConverting, setIsConverting] = useState(false);

  const handleConvert = async () => {
    setIsConverting(true);
    await new Promise((r) => setTimeout(r, 120));
    const result = convertObjectiveCToLua(inputText);
    setOutputText(result);
    setIsConverting(false);
  };

  const handleCopy = async () => {
    if (outputText) await navigator.clipboard.writeText(outputText);
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
  };

  const sample = `// 示例：将一个简单的方法转换为 Lua
@interface MyClass : NSObject
@end

@implementation MyClass
- (int)add:(int)a b:(int)b {
  int c = a + b;
  return c;
}
@end

MyClass *obj = [MyClass new];
int s = [obj add:3 b:5];`;

  return (
    <ToolLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Objective-C 转 Lua
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            粘贴一段 Objective-C 代码，快速生成等价的 Lua 示例实现（启发式转换，需人工校验）。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">输入 Objective-C</span>
              <button
                onClick={() => setInputText(sample)}
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                加载示例
              </button>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="粘贴 Objective-C 代码..."
              className="w-full h-72 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
            <div className="flex gap-2">
              <button
                onClick={handleConvert}
                disabled={!inputText.trim() || isConverting}
                className="btn btn-primary flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isConverting ? 'animate-spin' : ''}`} />
                {isConverting ? '转换中...' : '转换为 Lua'}
              </button>
              <button onClick={handleClear} className="btn btn-outline flex items-center gap-2">
                <RotateCcw className="h-4 w-4" /> 清空
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Lua 输出</span>
            <textarea
              value={outputText}
              readOnly
              placeholder="Lua 结果将显示在此..."
              className="w-full h-72 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
            <div className="flex gap-2">
              <button onClick={handleCopy} disabled={!outputText} className="btn btn-primary flex items-center gap-2">
                <Copy className="h-4 w-4" /> 复制
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">使用说明</h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc pl-5">
            <li>该转换为启发式规则，适合演示与起始迁移，复杂语义请手动调整。</li>
            <li>支持基础消息发送 [obj method:arg] 到 obj:method(arg) 的转换。</li>
            <li>支持 @[]/@{} 字面量和 @"" 字符串的基本映射。</li>
            <li>Objective-C 的内存管理、运行时特性、分类、协议等需手工迁移。</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}