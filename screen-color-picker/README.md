# 屏幕取色器

一个现代化的网页取色工具：优先使用浏览器原生 EyeDropper API；在不支持的环境下，自动降级到屏幕捕获 + 画布取色。

## 功能
- 一键取色（EyeDropper）
- 屏幕捕获取色（降级方案）
- 支持 HEX / RGB / HSL 显示与复制
- 历史记录（本地存储）
- 与黑/白背景的对比度（WCAG）
- 放大镜辅助取色

## 使用
1. 用本地静态服务器打开 `index.html`（示例：Python）
   
   ```bash
   cd screen-color-picker
   python3 -m http.server 5173
   ```
   
   浏览器访问 `http://localhost:5173`。
2. 点击“开始取色”优先使用 EyeDropper；如浏览器不支持或失败，使用“屏幕捕获取色”。
3. 点击复制按钮即可复制相应格式。

## 支持情况
- EyeDropper：Chrome/Edge 等现代浏览器支持，Safari 16+ 支持。Firefox 当前需配置开关或尚不支持（以浏览器版本为准）。
- 屏幕捕获：需用户授权，部分环境可能受限。

## 隐私
所有数据仅在本地浏览器内处理与存储，不会上传至服务器。