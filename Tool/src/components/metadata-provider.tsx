'use client';

import { useEffect } from 'react';
import { useLanguage } from './language-provider';

export function MetadataProvider() {
  const { t, locale } = useLanguage();

  useEffect(() => {
    // 动态更新页面标题
    document.title = t.metadata.title;
    
    // 动态更新meta描述
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', t.metadata.description);
    }
    
    // 动态更新meta关键词
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', t.metadata.keywords);
    }
    
    // 动态更新Open Graph标题
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', t.metadata.title);
    }
    
    // 动态更新Open Graph描述
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', t.metadata.description);
    }
    
    // 动态更新Open Graph站点名称
    const ogSiteName = document.querySelector('meta[property="og:site_name"]');
    if (ogSiteName) {
      ogSiteName.setAttribute('content', t.metadata.siteName);
    }
    
    // 动态更新Twitter标题
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute('content', t.metadata.title);
    }
    
    // 动态更新Twitter描述
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) {
      twitterDescription.setAttribute('content', t.metadata.description);
    }
    
    // 动态更新html lang属性
    document.documentElement.lang = locale;
    
  }, [t.metadata, locale]);

  return null; // 这是一个纯逻辑组件，不渲染任何内容
} 