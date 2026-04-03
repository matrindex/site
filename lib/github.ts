import { parse, SemVer, prerelease } from 'semver';

export interface GitHubAsset {
  name: string;
  browser_download_url: string;
  size: number;
  download_count: number;
}

export interface GitHubRelease {
  tag_name: string;
  name: string;
  body: string | null;
  published_at: string;
  prerelease: boolean;
  assets: GitHubAsset[];
}

export interface ParsedVersion {
  version: string;
  semver: SemVer | null;
  isPrerelease: boolean;
  buildNumber: number | null;
}

export interface VersionGroup {
  version: string;
  buildNumber: number | null;
  isPrerelease: boolean;
  publishedAt: string;
  releaseName: string;
  tagName: string;
  assets: GitHubAsset[];
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = 'matrindex/daemon-cli';

export async function getLatestRelease(): Promise<GitHubRelease | null> {
  try {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
    };

    if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }

    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
      { headers }
    );

    if (!response.ok) {
      console.error('Failed to fetch release:', response.statusText);
      return null;
    }

    const data = await response.json();
    return data as GitHubRelease;
  } catch (error) {
    console.error('Error fetching release:', error);
    return null;
  }
}

export async function getAllReleases(): Promise<GitHubRelease[]> {
  try {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
    };

    if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }

    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/releases?per_page=100`,
      { headers }
    );

    if (!response.ok) {
      console.error('Failed to fetch releases:', response.statusText);
      return [];
    }

    const data = await response.json();
    return data as GitHubRelease[];
  } catch (error) {
    console.error('Error fetching releases:', error);
    return [];
  }
}

export function parseVersion(tagName: string, releaseName?: string): ParsedVersion {
  // 移除可能的 'v' 前缀
  let cleanTag = tagName.replace(/^v/, '');

  // 提取 build 号（如 beta.66-build.94 或 +build.94）
  let buildNumber: number | null = null;
  const buildMatch = cleanTag.match(/[-+.]build\.(\d+)$/i) || cleanTag.match(/[-+.](\d+)$/);
  if (buildMatch) {
    buildNumber = parseInt(buildMatch[1], 10);
    // 移除 build 后缀，得到干净的 semver
    cleanTag = cleanTag.substring(0, cleanTag.length - buildMatch[0].length);
  }

  // 尝试从 release name 提取 build 号（如 "v1.2.3 (Build 123)"）
  if (buildNumber === null && releaseName) {
    const releaseBuildMatch = releaseName.match(/\(Build\s+(\d+)\)/i);
    if (releaseBuildMatch) {
      buildNumber = parseInt(releaseBuildMatch[1], 10);
    }
  }

  const semver = parse(cleanTag);
  const isPrerelease = semver ? prerelease(semver) !== null : false;

  return {
    version: semver ? `v${semver.format()}` : cleanTag,
    semver,
    isPrerelease,
    buildNumber,
  };
}

export function isStableVersion(tagName: string): boolean {
  const parsed = parseVersion(tagName);
  return !parsed.isPrerelease && parsed.semver !== null;
}

export function getBuildNumber(releaseName: string): number | null {
  const buildMatch = releaseName.match(/\(Build\s+(\d+)\)/i);
  if (buildMatch) {
    return parseInt(buildMatch[1], 10);
  }
  return null;
}

export function groupReleasesByVersion(releases: GitHubRelease[]): VersionGroup[] {
  const groups: VersionGroup[] = releases.map(release => {
    const parsed = parseVersion(release.tag_name, release.name);
    return {
      version: parsed.version,
      buildNumber: parsed.buildNumber,
      isPrerelease: release.prerelease || parsed.isPrerelease,
      publishedAt: release.published_at,
      releaseName: release.name,
      tagName: release.tag_name,
      assets: release.assets,
    };
  });

  // 排序：正式版在前，预发布版在后；同类型按版本号降序
  groups.sort((a, b) => {
    // 正式版 > 预发布版
    if (a.isPrerelease !== b.isPrerelease) {
      return a.isPrerelease ? 1 : -1;
    }

    // 使用semver解析比较版本号
    const semverA = parse(a.version.replace(/^v/, ''));
    const semverB = parse(b.version.replace(/^v/, ''));
    if (semverA && semverB) {
      return semverB.compare(semverA);
    }

    // 按发布时间排序（最新的在前）
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  return groups;
}

export function getLatestStableVersion(groups: VersionGroup[]): VersionGroup | null {
  return groups.find(g => !g.isPrerelease) || null;
}

export function getLatestVersion(groups: VersionGroup[]): VersionGroup | null {
  return groups[0] || null;
}

export function parseOS(filename: string): { os: string; arch: string; icon: string } {
  const lower = filename.toLowerCase();

  // OS detection - 优先级从高到低
  let os = 'unknown';
  let icon = '💻';

  // macOS 检测（必须在 Windows 之前，因为 darwin 包含 "win"）
  if (lower.includes('darwin') || lower.includes('macos') || lower.includes('mac')) {
    os = 'macOS';
    icon = '🍎';
  }
  // Windows 检测 - 使用更精确的匹配
  else if (lower.includes('windows') || lower.endsWith('.exe') || /\bwin\d*/.test(lower)) {
    os = 'Windows';
    icon = '🪟';
  }
  // Linux 检测
  else if (lower.includes('linux')) {
    os = 'Linux';
    icon = '🐧';
  }

  // Architecture detection
  let arch = 'unknown';
  if (lower.includes('amd64') || lower.includes('x86_64') || lower.includes('x64')) {
    arch = 'amd64';
  } else if (lower.includes('arm64') || lower.includes('aarch64')) {
    arch = 'arm64';
  } else if (lower.includes('386') || lower.includes('i386') || lower.includes('x86')) {
    arch = '386';
  } else if (lower.includes('arm')) {
    arch = 'arm';
  }

  return { os, arch, icon };
}

export function groupAssetsByOS(assets: GitHubAsset[]): Record<string, GitHubAsset[]> {
  const grouped: Record<string, GitHubAsset[]> = {
    macOS: [],
    Linux: [],
    Windows: [],
    Other: [],
  };

  assets.forEach((asset) => {
    const { os } = parseOS(asset.name);
    if (grouped[os]) {
      grouped[os].push(asset);
    } else {
      grouped.Other.push(asset);
    }
  });

  // 每个OS内部按架构排序
  Object.keys(grouped).forEach((os) => {
    grouped[os].sort((a, b) => {
      const archA = parseOS(a.name).arch;
      const archB = parseOS(b.name).arch;
      // amd64/x64 优先
      if (archA === 'amd64' && archB !== 'amd64') return -1;
      if (archB === 'amd64' && archA !== 'amd64') return 1;
      return archA.localeCompare(archB);
    });
  });

  return grouped;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getPrereleaseLabel(tagName: string): string | null {
  const parsed = parseVersion(tagName);
  if (!parsed.isPrerelease || !parsed.semver) return null;

  const pre = prerelease(parsed.semver);
  if (pre && pre.length > 0) {
    const label = pre[0];
    const num = pre[1];
    if (typeof label === 'string') {
      const capitalized = label.charAt(0).toUpperCase() + label.slice(1);
      return num ? `${capitalized} ${num}` : capitalized;
    }
  }
  return 'Pre-release';
}
