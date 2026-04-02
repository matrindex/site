# Matrindex 官方网站

Matrindex 产品官方网站，提供二进制文件下载。

## 功能

- 自动从 GitHub Releases 获取最新版本
- 按操作系统和架构分组展示下载选项
- 简洁美观的深色主题设计

## 技术栈

- Next.js 14+ (App Router)
- React 19
- TypeScript
- Tailwind CSS

## 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build
```

## 部署

项目使用 GitHub Actions 自动部署到 Cloudflare Pages。

当代码推送到 `master` 分支时，会自动触发部署流程。

### 所需 Secrets

- `CF_Token`: Cloudflare API Token
- `CF_ACCOUNT_ID`: Cloudflare Account ID
- `GITHUB_TOKEN`: GitHub Token (用于获取 releases)

## License

MIT
