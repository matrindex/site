import Link from 'next/link';
import { Hero } from '@/components/Hero';
import { FeatureGrid } from '@/components/FeatureGrid';
import { DownloadSection } from '@/components/DownloadSection';
import { getAllReleases, groupReleasesByVersion, getLatestStableVersion, getLatestVersion } from '@/lib/github';

export const revalidate = 3600; // Revalidate every hour

export default async function Home() {
  const releases = await getAllReleases();
  const versionGroups = groupReleasesByVersion(releases);

  // 优先展示最新正式版本，如果没有则展示最新版本
  const latestStable = getLatestStableVersion(versionGroups);
  const latestVersion = getLatestVersion(versionGroups);
  const displayVersion = latestStable || latestVersion;

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* Feature Grid */}
      <FeatureGrid />

      {/* Download Section */}
      <DownloadSection versionGroup={displayVersion} />

      {/* All Versions Link */}
      {versionGroups.length > 1 && (
        <section className="pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Link
              href="/versions"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-primary-400 transition-colors"
            >
              查看所有版本
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} Matrindex. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
