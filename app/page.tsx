import { getLatestRelease, parseOS, formatBytes, formatDate, type GitHubAsset } from '@/lib/github'

export const revalidate = 3600 // Revalidate every hour

function DownloadCard({ asset, index }: { asset: GitHubAsset; index: number }) {
  const { os, arch, icon } = parseOS(asset.name)

  return (
    <a
      href={asset.browser_download_url}
      className="group relative flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-primary-500/50 hover:bg-slate-800 transition-all duration-300"
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500/20 to-primary-600/20 flex items-center justify-center text-2xl">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white truncate">{asset.name}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
          <span className="px-2 py-0.5 rounded-full bg-slate-700/50">{os}</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-700/50">{arch}</span>
          <span>{formatBytes(asset.size)}</span>
        </div>
      </div>
      <div className="flex-shrink-0">
        <svg
          className="w-5 h-5 text-slate-400 group-hover:text-primary-400 transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
      </div>
    </a>
  )
}

function OSGroup({ title, assets }: { title: string; assets: GitHubAsset[] }) {
  if (assets.length === 0) return null

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">{title}</h3>
      <div className="grid gap-2">
        {assets.map((asset, index) => (
          <DownloadCard key={asset.name} asset={asset} index={index} />
        ))}
      </div>
    </div>
  )
}

export default async function Home() {
  const release = await getLatestRelease()

  // Group assets by OS
  const groupedAssets: Record<string, GitHubAsset[]> = {
    macOS: [],
    Linux: [],
    Windows: [],
    Other: [],
  }

  if (release?.assets) {
    release.assets.forEach((asset) => {
      const { os } = parseOS(asset.name)
      if (groupedAssets[os]) {
        groupedAssets[os].push(asset)
      } else {
        groupedAssets.Other.push(asset)
      }
    })
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo Banner */}
          <div className="mb-8">
            <img
              src="https://lenconda-system-data.oss-cn-hangzhou.aliyuncs.com/artworks/matrindex/matrindex_banner.png"
              alt="Matrindex"
              className="mx-auto h-24 sm:h-32 w-auto object-contain"
            />
          </div>

          {/* Description */}
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
            简单高效的内网端口穿透工具，让您轻松访问内网服务
          </p>

          {/* Feature Tags */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {['跨平台支持', '易于配置', '高性能', '安全可靠'].map((feature) => (
              <span
                key={feature}
                className="px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 text-sm text-slate-300"
              >
                {feature}
              </span>
            ))}
          </div>

          {/* GitHub Link */}
          <a
            href="https://github.com/matrindex/daemon-cli"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
            <span>查看源码</span>
          </a>
        </div>
      </section>

      {/* Downloads Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">下载</h2>
            {release ? (
              <div className="text-slate-400">
                <span className="text-primary-400 font-medium">{release.tag_name}</span>
                <span className="mx-2">·</span>
                <span>{formatDate(release.published_at)}</span>
              </div>
            ) : (
              <div className="text-slate-500">暂无可用下载</div>
            )}
          </div>

          {release?.assets && release.assets.length > 0 ? (
            <div className="grid gap-8">
              <OSGroup title="macOS" assets={groupedAssets.macOS} />
              <OSGroup title="Linux" assets={groupedAssets.Linux} />
              <OSGroup title="Windows" assets={groupedAssets.Windows} />
              <OSGroup title="其他" assets={groupedAssets.Other} />
            </div>
          ) : (
            <div className="text-center py-12 rounded-2xl bg-slate-800/50 border border-slate-700/50">
              <div className="text-slate-500 mb-2">暂无可用下载</div>
              <a
                href="https://github.com/matrindex/daemon-cli/releases"
                className="text-primary-400 hover:text-primary-300"
              >
                前往 GitHub Releases 查看
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} Matrindex. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
