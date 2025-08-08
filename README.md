# 链接缩短器 (URL Shortener)

一个基于 FastAPI + SQLite 的轻量级链接缩短服务。

## 快速开始

1) 安装依赖
```bash
pip install -r requirements.txt
```

2) 运行开发服务器
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

3) 打开浏览器
- 访问首页表单: http://localhost:8000/
- API 文档: http://localhost:8000/docs

## API

- POST `/api/shorten`
  - 请求: `{ "url": "https://example.com", "alias": "可选自定义别名", "expire_days": 30 }`
  - 响应: `{ "code": "abc1234", "short_url": "http://localhost:8000/abc1234", "original_url": "https://example.com" }`

- GET `/{code}`
  - 跳转到原始链接 (307 重定向)

- GET `/api/lookup/{code}`
  - 获取元数据 (创建时间、点击次数、过期时间等)

## 环境变量 (可选)
- `BASE_URL` 用于生成短链接完整地址，默认 `http://localhost:8000`
- `CODE_LENGTH` 生成短码长度，默认 `7`

## 生产部署建议
- 使用反向代理 (Nginx/Caddy)
- 启用持久化数据库 (例如 PostgreSQL) 并配置连接串
- 打开 CORS 仅对需要的域名
- 配置日志与备份策略