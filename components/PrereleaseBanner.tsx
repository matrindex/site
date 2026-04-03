'use client';

interface PrereleaseBannerProps {
  label?: string;
}

export function PrereleaseBanner({ label }: PrereleaseBannerProps) {
  return (
    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-8">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center mt-0.5">
          <svg className="w-3 h-3 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h4 className="text-amber-400 font-medium text-sm">
            开发版本{label ? ` (${label})` : ''}
          </h4>
          <p className="text-amber-300/80 text-sm mt-1">
            当前版本正在开发中，服务可能不稳定。建议仅在测试环境使用。
          </p>
        </div>
      </div>
    </div>
  );
}
