'use client';

import { useState } from 'react';
import { PlatformNav } from './PlatformNav';
import { AssetDownload } from './AssetDownload';
import { PrereleaseBanner } from './PrereleaseBanner';
import { groupAssetsByOS, getPrereleaseLabel, formatDate } from '@/lib/github';
import type { VersionGroup } from '@/lib/github';

interface DownloadSectionProps {
  versionGroup: VersionGroup | null;
}

export function DownloadSection({ versionGroup }: DownloadSectionProps) {
  const [selectedPlatform, setSelectedPlatform] = useState('macOS');

  if (!versionGroup) {
    return (
      <section id="download" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">下载</h2>
            <p className="text-slate-400">暂无可用下载</p>
          </div>
        </div>
      </section>
    );
  }

  const groupedAssets = groupAssetsByOS(versionGroup.assets);
  const availablePlatforms = Object.entries(groupedAssets)
    .filter(([_, assets]) => assets.length > 0)
    .map(([os]) => os);

  // 默认选择第一个可用平台
  const currentPlatform = availablePlatforms.includes(selectedPlatform)
    ? selectedPlatform
    : availablePlatforms[0] || 'macOS';

  const platformAssets = groupedAssets[currentPlatform] || [];
  const prereleaseLabel = versionGroup.isPrerelease
    ? getPrereleaseLabel(versionGroup.tagName) || undefined
    : undefined;

  return (
    <section id="download" className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">下载</h2>
          <div className="text-slate-400">
            <span className="text-primary-400 font-medium">
              {versionGroup.version}
              {versionGroup.buildNumber && ` (Build ${versionGroup.buildNumber})`}
            </span>
            <span className="mx-2">·</span>
            <span>{formatDate(versionGroup.publishedAt)}</span>
            {versionGroup.isPrerelease && (
              <>
                <span className="mx-2">·</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs">
                  {prereleaseLabel || '测试版'}
                </span>
              </>
            )}
          </div>
        </div>

        {versionGroup.isPrerelease && <PrereleaseBanner label={prereleaseLabel} />}

        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8">
          {/* Platform Navigation */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4">
              选择平台
            </h3>
            <PlatformNav
              selected={currentPlatform}
              onSelect={setSelectedPlatform}
              availablePlatforms={availablePlatforms}
            />
          </div>

          {/* Download Cards */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {currentPlatform} 下载
            </h3>
            {platformAssets.length > 0 ? (
              <div className="grid gap-3">
                {platformAssets.map((asset) => (
                  <AssetDownload
                    key={asset.name}
                    asset={asset}
                    version={versionGroup.tagName}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-slate-800/30 border border-slate-700/30 text-center">
                <p className="text-slate-500">该平台暂无可下载文件</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
