'use client';

import { formatBytes, parseOS } from '@/lib/github';
import type { GitHubAsset } from '@/lib/github';

interface AssetDownloadProps {
  asset: GitHubAsset;
  version: string;
}

export function AssetDownload({ asset, version }: AssetDownloadProps) {
  const { arch } = parseOS(asset.name);

  return (
    <a
      href={`/api/download?version=${encodeURIComponent(version)}&asset=${encodeURIComponent(asset.name)}`}
      className="group flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-primary-500/50 hover:bg-slate-800 transition-all duration-300"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500/20 to-primary-600/20 flex items-center justify-center">
        <svg
          className="w-5 h-5 text-primary-400"
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

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">{arch === 'unknown' ? '通用' : arch}</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-700/50 text-xs text-slate-400">
            {formatBytes(asset.size)}
          </span>
        </div>
        <p className="text-xs text-slate-500 truncate mt-0.5">{asset.name}</p>
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
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
    </a>
  );
}
