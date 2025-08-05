#!/usr/bin/env node

/**
 * 静态站点部署脚本
 * 支持多个平台的自动化部署：Netlify, Vercel, GitHub Pages, Cloudflare Pages
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

class StaticSiteDeployer {
  constructor() {
    this.startTime = performance.now();
    this.buildDir = path.join(process.cwd(), 'out');
    this.config = this.loadConfig();
    this.platform = process.env.DEPLOY_PLATFORM || this.config.defaultPlatform || 'netlify';
  }

  loadConfig() {
    const defaultConfig = {
      defaultPlatform: 'netlify',
      platforms: {
        netlify: {
          enabled: true,
          siteId: process.env.NETLIFY_SITE_ID,
          authToken: process.env.NETLIFY_AUTH_TOKEN,
          buildCommand: 'npm run build:static',
          publishDir: 'out',
          functionsDir: null,
        },
        vercel: {
          enabled: true,
          projectId: process.env.VERCEL_PROJECT_ID,
          orgId: process.env.VERCEL_ORG_ID,
          authToken: process.env.VERCEL_TOKEN,
          buildCommand: 'npm run build:static',
          outputDirectory: 'out',
        },
        github: {
          enabled: true,
          repository: process.env.GITHUB_REPOSITORY,
          token: process.env.GITHUB_TOKEN,
          branch: 'gh-pages',
          buildDir: 'out',
        },
        cloudflare: {
          enabled: true,
          accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
          projectName: process.env.CLOUDFLARE_PROJECT_NAME,
          apiToken: process.env.CLOUDFLARE_API_TOKEN,
          buildCommand: 'npm run build:static',
          buildOutputDir: 'out',
        },
      },
      optimization: {
        enableCompression: true,
        enableMinification: true,
        enableCaching: true,
        generateSourceMaps: false,
      },
    };

    try {
      const userConfig = require('../deploy.config.js');
      return this.mergeDeep(defaultConfig, userConfig);
    } catch {
      return defaultConfig;
    }
  }

  mergeDeep(target, source) {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.mergeDeep(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m',
    };
    
    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  async validateEnvironment() {
    this.log('🔍 验证部署环境...', 'info');
    
    const platformConfig = this.config.platforms[this.platform];
    
    if (!platformConfig || !platformConfig.enabled) {
      throw new Error(`平台 ${this.platform} 未启用或配置不正确`);
    }

    // 验证构建目录
    if (!fs.existsSync(this.buildDir)) {
      this.log('📦 构建目录不存在，开始构建...', 'warning');
      await this.buildSite();
    }

    // 验证平台特定的环境变量
    this.validatePlatformConfig(platformConfig);
  }

  validatePlatformConfig(config) {
    const requiredFields = {
      netlify: ['siteId', 'authToken'],
      vercel: ['authToken'],
      github: ['repository', 'token'],
      cloudflare: ['accountId', 'projectName', 'apiToken'],
    };

    const required = requiredFields[this.platform] || [];
    const missing = required.filter(field => !config[field]);

    if (missing.length > 0) {
      throw new Error(`${this.platform} 平台缺少必要配置: ${missing.join(', ')}`);
    }
  }

  async buildSite() {
    this.log('🏗️  构建静态站点...', 'info');
    
    try {
      const StaticSiteBuilder = require('./build-static.js');
      const builder = new StaticSiteBuilder();
      await builder.run();
    } catch (error) {
      this.log('❌ 构建失败', 'error');
      throw error;
    }
  }

  async deployToNetlify() {
    this.log('🚀 部署到 Netlify...', 'info');
    
    const config = this.config.platforms.netlify;
    
    try {
      // 安装 Netlify CLI (如果需要)
      this.ensureNetlifyCLI();
      
      // 设置环境变量
      process.env.NETLIFY_AUTH_TOKEN = config.authToken;
      process.env.NETLIFY_SITE_ID = config.siteId;
      
      // 执行部署
      const deployCmd = config.siteId 
        ? `netlify deploy --prod --dir=${config.publishDir} --site=${config.siteId}`
        : `netlify deploy --prod --dir=${config.publishDir}`;
      
      execSync(deployCmd, { stdio: 'inherit' });
      
      this.log('✅ Netlify 部署成功', 'success');
      
      // 获取部署信息
      const siteInfo = this.getNetlifySiteInfo();
      this.log(`🌐 站点URL: ${siteInfo.url}`, 'info');
      
    } catch (error) {
      this.log(`❌ Netlify 部署失败: ${error.message}`, 'error');
      throw error;
    }
  }

  async deployToVercel() {
    this.log('🚀 部署到 Vercel...', 'info');
    
    const config = this.config.platforms.vercel;
    
    try {
      // 安装 Vercel CLI (如果需要)
      this.ensureVercelCLI();
      
      // 设置环境变量
      process.env.VERCEL_TOKEN = config.authToken;
      if (config.orgId) process.env.VERCEL_ORG_ID = config.orgId;
      if (config.projectId) process.env.VERCEL_PROJECT_ID = config.projectId;
      
      // 创建 vercel.json 配置
      this.createVercelConfig();
      
      // 执行部署
      const deployCmd = 'vercel --prod --yes';
      execSync(deployCmd, { stdio: 'inherit' });
      
      this.log('✅ Vercel 部署成功', 'success');
      
    } catch (error) {
      this.log(`❌ Vercel 部署失败: ${error.message}`, 'error');
      throw error;
    }
  }

  async deployToGitHub() {
    this.log('🚀 部署到 GitHub Pages...', 'info');
    
    const config = this.config.platforms.github;
    
    try {
      // 配置 Git
      this.configureGit();
      
      // 创建 .nojekyll 文件
      fs.writeFileSync(path.join(this.buildDir, '.nojekyll'), '');
      
      // 创建 CNAME 文件 (如果有自定义域名)
      if (process.env.GITHUB_PAGES_DOMAIN) {
        fs.writeFileSync(
          path.join(this.buildDir, 'CNAME'), 
          process.env.GITHUB_PAGES_DOMAIN
        );
      }
      
      // 使用 gh-pages 包部署
      this.ensureGhPages();
      
      const ghPages = require('gh-pages');
      
      await new Promise((resolve, reject) => {
        ghPages.publish(config.buildDir, {
          branch: config.branch,
          repo: `https://${config.token}@github.com/${config.repository}.git`,
          user: {
            name: 'GitHub Actions',
            email: 'actions@github.com'
          },
          message: `Deploy: ${new Date().toISOString()}`,
        }, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      this.log('✅ GitHub Pages 部署成功', 'success');
      
      const repoUrl = `https://${config.repository.split('/')[0]}.github.io/${config.repository.split('/')[1]}`;
      this.log(`🌐 站点URL: ${repoUrl}`, 'info');
      
    } catch (error) {
      this.log(`❌ GitHub Pages 部署失败: ${error.message}`, 'error');
      throw error;
    }
  }

  async deployToCloudflare() {
    this.log('🚀 部署到 Cloudflare Pages...', 'info');
    
    const config = this.config.platforms.cloudflare;
    
    try {
      // 安装 Wrangler CLI (如果需要)
      this.ensureWranglerCLI();
      
      // 设置环境变量
      process.env.CLOUDFLARE_API_TOKEN = config.apiToken;
      process.env.CLOUDFLARE_ACCOUNT_ID = config.accountId;
      
      // 执行部署
      const deployCmd = `wrangler pages publish ${config.buildOutputDir} --project-name=${config.projectName}`;
      execSync(deployCmd, { stdio: 'inherit' });
      
      this.log('✅ Cloudflare Pages 部署成功', 'success');
      
    } catch (error) {
      this.log(`❌ Cloudflare Pages 部署失败: ${error.message}`, 'error');
      throw error;
    }
  }

  ensureNetlifyCLI() {
    try {
      execSync('netlify --version', { stdio: 'pipe' });
    } catch {
      this.log('📦 安装 Netlify CLI...', 'info');
      execSync('npm install -g netlify-cli', { stdio: 'inherit' });
    }
  }

  ensureVercelCLI() {
    try {
      execSync('vercel --version', { stdio: 'pipe' });
    } catch {
      this.log('📦 安装 Vercel CLI...', 'info');
      execSync('npm install -g vercel', { stdio: 'inherit' });
    }
  }

  ensureWranglerCLI() {
    try {
      execSync('wrangler --version', { stdio: 'pipe' });
    } catch {
      this.log('📦 安装 Wrangler CLI...', 'info');
      execSync('npm install -g wrangler', { stdio: 'inherit' });
    }
  }

  ensureGhPages() {
    try {
      require('gh-pages');
    } catch {
      this.log('📦 安装 gh-pages...', 'info');
      execSync('npm install gh-pages', { stdio: 'inherit' });
    }
  }

  configureGit() {
    try {
      execSync('git config user.name "GitHub Actions"', { stdio: 'pipe' });
      execSync('git config user.email "actions@github.com"', { stdio: 'pipe' });
    } catch {
      // Git 可能已经配置
    }
  }

  createVercelConfig() {
    const vercelConfig = {
      version: 2,
      name: 'tools-static-site',
      builds: [
        {
          src: 'out/**/*',
          use: '@vercel/static'
        }
      ],
      routes: [
        {
          src: '/(.*)',
          dest: '/out/$1'
        }
      ],
      headers: [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'X-Frame-Options',
              value: 'DENY'
            },
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff'
            },
            {
              key: 'X-XSS-Protection',
              value: '1; mode=block'
            }
          ]
        },
        {
          source: '/static/(.*)',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=31536000, immutable'
            }
          ]
        }
      ]
    };

    fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
  }

  getNetlifySiteInfo() {
    try {
      const output = execSync('netlify status --json', { encoding: 'utf8' });
      return JSON.parse(output);
    } catch {
      return { url: 'URL获取失败' };
    }
  }

  async optimizeForPlatform() {
    this.log(`🔧 为 ${this.platform} 平台优化...`, 'info');
    
    switch (this.platform) {
      case 'netlify':
        await this.optimizeForNetlify();
        break;
      case 'vercel':
        await this.optimizeForVercel();
        break;
      case 'github':
        await this.optimizeForGitHub();
        break;
      case 'cloudflare':
        await this.optimizeForCloudflare();
        break;
    }
  }

  async optimizeForNetlify() {
    // 创建 _headers 文件（如果不存在）
    const headersPath = path.join(this.buildDir, '_headers');
    if (!fs.existsSync(headersPath)) {
      const headers = `/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin

/_next/static/*
  Cache-Control: public, max-age=31536000, immutable`;
      
      fs.writeFileSync(headersPath, headers);
    }

    // 创建 _redirects 文件（如果不存在）
    const redirectsPath = path.join(this.buildDir, '_redirects');
    if (!fs.existsSync(redirectsPath)) {
      const redirects = `/*    /index.html   200`;
      fs.writeFileSync(redirectsPath, redirects);
    }
  }

  async optimizeForVercel() {
    // Vercel 配置已在 createVercelConfig 中处理
    this.log('✅ Vercel 优化完成', 'success');
  }

  async optimizeForGitHub() {
    // GitHub Pages 特定优化
    const nojekyllPath = path.join(this.buildDir, '.nojekyll');
    if (!fs.existsSync(nojekyllPath)) {
      fs.writeFileSync(nojekyllPath, '');
    }
  }

  async optimizeForCloudflare() {
    // Cloudflare Pages 特定优化
    const headersPath = path.join(this.buildDir, '_headers');
    if (!fs.existsSync(headersPath)) {
      const headers = `/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Cache-Control: public, max-age=3600`;
      
      fs.writeFileSync(headersPath, headers);
    }
  }

  async generateDeploymentReport() {
    const endTime = performance.now();
    const duration = ((endTime - this.startTime) / 1000).toFixed(2);
    
    const report = {
      platform: this.platform,
      deploymentTime: new Date().toISOString(),
      duration: `${duration}s`,
      buildDir: this.buildDir,
      success: true,
      config: this.config.platforms[this.platform],
    };

    const reportPath = path.join(this.buildDir, 'deployment-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    this.log('📊 部署报告已生成', 'success');
    return report;
  }

  async deploy() {
    try {
      await this.validateEnvironment();
      await this.optimizeForPlatform();
      
      switch (this.platform) {
        case 'netlify':
          await this.deployToNetlify();
          break;
        case 'vercel':
          await this.deployToVercel();
          break;
        case 'github':
          await this.deployToGitHub();
          break;
        case 'cloudflare':
          await this.deployToCloudflare();
          break;
        default:
          throw new Error(`不支持的部署平台: ${this.platform}`);
      }
      
      const report = await this.generateDeploymentReport();
      
      this.log(`🎉 部署到 ${this.platform} 成功! 耗时: ${report.duration}`, 'success');
      
    } catch (error) {
      this.log(`❌ 部署失败: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// 命令行参数处理
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--platform=')) {
      options.platform = arg.split('=')[1];
    } else if (arg === '--platform' && args[i + 1]) {
      options.platform = args[i + 1];
      i++;
    } else if (arg === '--build') {
      options.build = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
静态站点部署工具

用法:
  node deploy-static.js [选项]

选项:
  --platform <name>   指定部署平台 (netlify, vercel, github, cloudflare)
  --build            强制重新构建
  --help, -h         显示帮助信息

环境变量:
  DEPLOY_PLATFORM    默认部署平台
  
  Netlify:
    NETLIFY_SITE_ID
    NETLIFY_AUTH_TOKEN
  
  Vercel:
    VERCEL_TOKEN
    VERCEL_PROJECT_ID
    VERCEL_ORG_ID
  
  GitHub Pages:
    GITHUB_REPOSITORY
    GITHUB_TOKEN
    GITHUB_PAGES_DOMAIN
  
  Cloudflare Pages:
    CLOUDFLARE_ACCOUNT_ID
    CLOUDFLARE_PROJECT_NAME
    CLOUDFLARE_API_TOKEN
`);
      process.exit(0);
    }
  }
  
  return options;
}

// 运行部署
if (require.main === module) {
  const options = parseArgs();
  
  if (options.platform) {
    process.env.DEPLOY_PLATFORM = options.platform;
  }
  
  const deployer = new StaticSiteDeployer();
  
  if (options.build) {
    deployer.buildSite().then(() => deployer.deploy());
  } else {
    deployer.deploy();
  }
}

module.exports = StaticSiteDeployer;