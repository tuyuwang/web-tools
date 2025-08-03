'use client';

import { useEffect } from 'react';

// Cloudflare Analytics 配置
const CF_ANALYTICS_TOKEN = process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN;

// 性能监控
const trackPerformance = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    // 监控页面加载性能
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      const metrics = {
        // 页面加载时间
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        // DOM内容加载时间
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        // 首次内容绘制
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        // 首次有意义绘制
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        // 最大内容绘制
        largestContentfulPaint: 0,
        // 累积布局偏移
        cumulativeLayoutShift: 0,
      };

      // 发送性能数据到分析服务
      if (CF_ANALYTICS_TOKEN) {
        fetch('https://api.cloudflare.com/client/v4/analytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CF_ANALYTICS_TOKEN}`,
          },
          body: JSON.stringify({
            metrics,
            url: window.location.href,
            timestamp: Date.now(),
          }),
        }).catch(console.error);
      }

      // 记录到控制台（开发环境）
      if (process.env.NODE_ENV === 'development') {
        console.log('Performance Metrics:', metrics);
      }
    });
  }
};

// 错误监控
const trackErrors = () => {
  if (typeof window !== 'undefined') {
    // 监控JavaScript错误
    window.addEventListener('error', (event) => {
      const errorData = {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack,
        url: window.location.href,
        timestamp: Date.now(),
      };

      // 发送错误数据
      if (CF_ANALYTICS_TOKEN) {
        fetch('https://api.cloudflare.com/client/v4/analytics/errors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CF_ANALYTICS_TOKEN}`,
          },
          body: JSON.stringify(errorData),
        }).catch(console.error);
      }

      // 记录到控制台（开发环境）
      if (process.env.NODE_ENV === 'development') {
        console.error('Error tracked:', errorData);
      }
    });

    // 监控未处理的Promise拒绝
    window.addEventListener('unhandledrejection', (event) => {
      const errorData = {
        message: event.reason?.message || 'Unhandled Promise Rejection',
        reason: event.reason,
        url: window.location.href,
        timestamp: Date.now(),
      };

      // 发送错误数据
      if (CF_ANALYTICS_TOKEN) {
        fetch('https://api.cloudflare.com/client/v4/analytics/errors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CF_ANALYTICS_TOKEN}`,
          },
          body: JSON.stringify(errorData),
        }).catch(console.error);
      }

      // 记录到控制台（开发环境）
      if (process.env.NODE_ENV === 'development') {
        console.error('Unhandled Promise Rejection:', errorData);
      }
    });
  }
};

// 用户行为监控
const trackUserBehavior = () => {
  if (typeof window !== 'undefined') {
    // 监控页面访问
    const trackPageView = () => {
      const pageData = {
        url: window.location.href,
        title: document.title,
        referrer: document.referrer,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        language: navigator.language,
        screenSize: `${screen.width}x${screen.height}`,
      };

      // 发送页面访问数据
      if (CF_ANALYTICS_TOKEN) {
        fetch('https://api.cloudflare.com/client/v4/analytics/pageviews', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CF_ANALYTICS_TOKEN}`,
          },
          body: JSON.stringify(pageData),
        }).catch(console.error);
      }
    };

    // 初始页面访问
    trackPageView();

    // 监控路由变化（SPA）
    let currentUrl = window.location.href;
    const observer = new MutationObserver(() => {
      if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        setTimeout(trackPageView, 100); // 延迟确保页面已更新
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
};

export function Analytics() {
  useEffect(() => {
    // 初始化所有监控
    trackPerformance();
    trackErrors();
    trackUserBehavior();
  }, []);

  return null; // 这是一个无渲染组件
} 