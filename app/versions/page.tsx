import Link from 'next/link';
import { getAllReleases, groupReleasesByVersion, formatDate, getPrereleaseLabel, groupAssetsByOS } from '@/lib/github';
import type { VersionGroup, GitHubAsset } from '@/lib/github';

export const revalidate = 3600;

function AssetList({ assets, version }: { assets: GitHubAsset[]; version: string }) {
  const grouped = groupAssetsByOS(assets);

  return (
    <div className="space-y-4 mt-4">
      {(['macOS', 'Windows', 'Linux', 'Other'] as const).map((os) => {
        const osAssets = grouped[os];
        if (!osAssets || osAssets.length === 0) return null;

        return (
          <div key={os}>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{os}</h4>
            <div className="grid gap-2">
              {osAssets.map((asset) => {
                const arch = asset.name.includes('arm64') || asset.name.includes('aarch64') ? 'arm64' : asset.name.includes('amd64') || asset.name.includes('x86_64') || asset.name.includes('x64') ? 'amd64' : 'unknown';
                return (
                  <a
                    key={asset.name}
                    href={`/api/download?version=${encodeURIComponent(version)}&asset=${encodeURIComponent(asset.name)}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/30 hover:border-slate-600/50 transition-all duration-200"
                  >
                    <span className="text-sm text-white">{arch}</span>
                    <span className="text-xs text-slate-500 flex-1 text-right">{(asset.size / 1024 / 1024).toFixed(2)} MB</span>
                  </a>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function VersionCard({ version, isExpanded = false }: { version: VersionGroup; isExpanded?: boolean }) {
  const prereleaseLabel = version.isPrerelease ? getPrereleaseLabel(version.tagName) : null;

  return (
    <div className={`rounded-2xl border transition-all duration-300 ${isExpanded ? 'bg-slate-800/50 border-slate-600/50' : 'bg-slate-800/30 border-slate-700/30 hover:border-slate-600/50'}`}>
      <div className="p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-xl font-semibold text-white">{version.version}</h3>
          {version.buildNumber && (
            <span className="text-slate-400">(Build {version.buildNumber})</span>
          )}
          {version.isPrerelease && (
            <span className="px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium">
              {prereleaseLabel || '测试版'}
            </span>
          )}
          <span className="text-slate-500 text-sm ml-auto">{formatDate(version.publishedAt)}</span>
        </div>

        {isExpanded && (
          <div className="mt-6 pt-6 border-t border-slate-700/30">
            <AssetList assets={version.assets} version={version.tagName} />
          </div>
        )}
      </div>
    </div>
  );
}

export default async function VersionsPage() {
  const releases = await getAllReleases();
  const versionGroups = groupReleasesByVersion(releases);

  const latestStable = versionGroups.find((v) => !v.isPrerelease);
  const latestVersion = versionGroups[0];

  return (
    <main className="min-h-screen">
      {/* Header */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/" className="text-slate-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">所有版本</h1>
          </div>
          <p className="text-slate-400">浏览 Matrindex 的所有发布版本，选择适合您的版本下载。</p>
        </div>
      </section>

      {/* Versions List */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {versionGroups.length === 0 ? (
            <div className="text-center py-12 rounded-2xl bg-slate-800/30 border border-slate-700/30">
              <p className="text-slate-500">暂无可用版本</p>
            </div>
          ) : (
            <>
              {/* Latest Stable */}
              {latestStable && (
                <div className="mb-8">
                  <h2 className="text-xs font-semibold text-primary-400 uppercase tracking-wider mb-4">最新正式版本</h2>
                  <VersionCard version={latestStable} isExpanded />
                </div>
              )}

              {/* Latest Prerelease (if different from stable) */}
              {latestVersion && latestVersion.isPrerelease && latestVersion !== latestStable && (
                <div className="mb-8">
                  <h2 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-4">最新开发版本</h2>
                  <VersionCard version={latestVersion} isExpanded />
                </div>
              )}

              {/* All Versions */}
              {versionGroups.length > 1 && (
                <div>
                  <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">历史版本</h2>
                  <div className="space-y-4">
                    {versionGroups
                      .filter((v) => v !== latestStable && v !== latestVersion)
                      .map((version) => (
                        <VersionCard key={version.tagName} version={version} />
                      ))}
                  </div>
                </div>
              )}
            </>
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
  );
}
