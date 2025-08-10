from __future__ import annotations

import os
from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.responses import RedirectResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import select

from .database import Base, engine, get_db
from .models import Link
from .schemas import ShortenRequest, ShortenResponse, LinkMeta
from .utils import generate_code, normalize_url, is_alias_valid, get_base_url

app = FastAPI(title="URL Shortener", version="1.0.0")

# CORS (开放给本地开发; 生产请收紧域名)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount 2048 static files if present
STATIC_2048_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "static", "2048"))
if os.path.isdir(STATIC_2048_DIR):
    app.mount("/2048", StaticFiles(directory=STATIC_2048_DIR, html=True), name="2048")


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)


@app.get("/", response_class=HTMLResponse)
def index() -> str:
    return (
        """
        <html>
          <head>
            <meta charset=\"utf-8\" />
            <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
            <title>链接缩短器</title>
            <style>
              body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; padding: 32px; max-width: 720px; margin: 0 auto; }
              h1 { font-size: 24px; }
              form { display: grid; gap: 12px; }
              input, button { padding: 10px 12px; font-size: 16px; }
              .row { display: grid; gap: 8px; grid-template-columns: 1fr 1fr; }
              .note { color: #666; font-size: 14px; }
              .result { margin-top: 16px; padding: 12px; background: #f6f8fa; border-radius: 8px; }
            </style>
          </head>
          <body>
            <h1>链接缩短器</h1>
            <form id=\"f\">
              <input name=\"url\" placeholder=\"输入要缩短的链接 (支持不带 http/https)\" />
              <div class=\"row\">
                <input name=\"alias\" placeholder=\"自定义别名 (可选)\" />
                <input name=\"expire_days\" type=\"number\" min=\"1\" placeholder=\"过期天数 (可选)\" />
              </div>
              <button type=\"submit\">生成短链接</button>
              <div class=\"note\">API 文档见 <a href=\"/docs\">/docs</a></div>
            </form>
            <div style=\"margin-top:16px\"><a href=\"/2048\" target=\"_blank\">小游戏：2048</a></div>
            <div id=\"r\" class=\"result\" style=\"display:none\"></div>
            <script>
              const f = document.getElementById('f');
              const r = document.getElementById('r');
              f.addEventListener('submit', async (e) => {
                e.preventDefault();
                const fd = new FormData(f);
                const payload = {
                  url: fd.get('url'),
                  alias: fd.get('alias') || null,
                  expire_days: fd.get('expire_days') ? Number(fd.get('expire_days')) : null,
                };
                const res = await fetch('/api/shorten', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                const data = await res.json();
                if (!res.ok) { r.style.display='block'; r.textContent = data.detail || '发生错误'; return; }
                r.style.display='block';
                r.innerHTML = `<div>短链接: <a href="${data.short_url}" target="_blank">${data.short_url}</a></div><div>原始链接: ${data.original_url}</div>`;
              });
            </script>
          </body>
        </html>
        """
    )


@app.post("/api/shorten", response_model=ShortenResponse)
def create_short_link(payload: ShortenRequest, db: Session = Depends(get_db)) -> ShortenResponse:
    original_url = normalize_url(payload.url)
    if payload.alias:
        alias = payload.alias.strip()
        if not is_alias_valid(alias):
            raise HTTPException(status_code=400, detail="alias 无效，仅允许 3-64 位的字母/数字/-/_，且不得使用保留字")
        # 检查是否占用
        exists = db.scalar(select(Link).where(Link.code == alias))
        if exists:
            raise HTTPException(status_code=409, detail="该自定义别名已被占用")
        code = alias
    else:
        # 自动生成并避开冲突
        code = generate_code()
        while db.scalar(select(Link).where(Link.code == code)) is not None:
            code = generate_code()

    expires_at: Optional[datetime] = None
    if payload.expire_days and payload.expire_days > 0:
        expires_at = datetime.utcnow() + timedelta(days=payload.expire_days)

    link = Link(code=code, original_url=original_url, expires_at=expires_at)
    db.add(link)
    db.commit()
    db.refresh(link)

    base_url = get_base_url().rstrip('/')
    return ShortenResponse(code=link.code, short_url=f"{base_url}/{link.code}", original_url=link.original_url)


@app.get("/api/lookup/{code}", response_model=LinkMeta)
def lookup(code: str, db: Session = Depends(get_db)) -> LinkMeta:
    link: Optional[Link] = db.scalar(select(Link).where(Link.code == code))
    if not link:
        raise HTTPException(status_code=404, detail="未找到短链接")
    return LinkMeta(
        code=link.code,
        original_url=link.original_url,
        created_at=link.created_at,
        clicks=link.clicks,
        last_accessed=link.last_accessed,
        expires_at=link.expires_at,
    )


@app.get("/{code}")
def redirect(code: str, request: Request, db: Session = Depends(get_db)):
    link: Optional[Link] = db.scalar(select(Link).where(Link.code == code))
    if not link:
        raise HTTPException(status_code=404, detail="未找到短链接")

    if link.expires_at and datetime.utcnow() > link.expires_at:
        raise HTTPException(status_code=410, detail="短链接已过期")

    link.clicks += 1
    link.last_accessed = datetime.utcnow()
    db.add(link)
    db.commit()

    return RedirectResponse(url=link.original_url, status_code=307)