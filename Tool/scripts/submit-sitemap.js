const fs = require('fs');
const https = require('https');

// 搜索引擎的站点地图提交URL
const SEARCH_ENGINES = {
  google: 'https://www.google.com/ping?sitemap=',
  bing: 'https://www.bing.com/ping?sitemap=',
  yandex: 'https://blogs.yandex.com/pings/?status=success&url='
};

// 从环境变量获取网站URL
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com';

function submitSitemap(engine, url) {
  return new Promise((resolve, reject) => {
    const sitemapUrl = `${SITE_URL}/sitemap.xml`;
    const submitUrl = `${url}${encodeURIComponent(sitemapUrl)}`;
    
    console.log(`提交站点地图到 ${engine}: ${submitUrl}`);
    
    https.get(submitUrl, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✅ ${engine} 提交成功`);
          resolve({ engine, status: 'success', statusCode: res.statusCode });
        } else {
          console.log(`⚠️ ${engine} 提交失败: ${res.statusCode}`);
          resolve({ engine, status: 'failed', statusCode: res.statusCode });
        }
      });
    }).on('error', (err) => {
      console.error(`❌ ${engine} 提交错误:`, err.message);
      reject({ engine, status: 'error', error: err.message });
    });
  });
}

async function submitToAllEngines() {
  console.log('🚀 开始提交站点地图到搜索引擎...');
  console.log(`📝 网站URL: ${SITE_URL}`);
  console.log(`🗺️ 站点地图URL: ${SITE_URL}/sitemap.xml`);
  console.log('');
  
  const results = [];
  
  for (const [engine, url] of Object.entries(SEARCH_ENGINES)) {
    try {
      const result = await submitSitemap(engine, url);
      results.push(result);
    } catch (error) {
      results.push(error);
    }
  }
  
  console.log('');
  console.log('📊 提交结果汇总:');
  results.forEach(result => {
    const status = result.status === 'success' ? '✅' : 
                   result.status === 'failed' ? '⚠️' : '❌';
    console.log(`${status} ${result.engine}: ${result.status}`);
  });
  
  const successCount = results.filter(r => r.status === 'success').length;
  const totalCount = results.length;
  
  console.log('');
  console.log(`🎉 完成! ${successCount}/${totalCount} 个搜索引擎提交成功`);
  
  return results;
}

// 如果直接运行此脚本
if (require.main === module) {
  submitToAllEngines()
    .then(() => {
      console.log('✅ 站点地图提交完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 站点地图提交失败:', error);
      process.exit(1);
    });
}

module.exports = { submitToAllEngines }; 