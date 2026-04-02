interface GitHubAsset {
  name: string;
  browser_download_url: string;
  size: number;
  download_count: number;
}

interface GitHubRelease {
  tag_name: string;
  name: string;
  body: string | null;
  published_at: string;
  assets: GitHubAsset[];
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export async function getLatestRelease(): Promise<GitHubRelease | null> {
  try {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
    };

    if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }

    const response = await fetch(
      'https://api.github.com/repos/matrindex/daemon-cli/releases/latest',
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

export function parseOS(filename: string): { os: string; arch: string; icon: string } {
  const lower = filename.toLowerCase();

  // OS detection
  let os = 'unknown';
  let icon = '💻';

  if (lower.includes('windows') || lower.endsWith('.exe') || lower.includes('win')) {
    os = 'Windows';
    icon = '🪟';
  } else if (lower.includes('darwin') || lower.includes('macos') || lower.includes('mac')) {
    os = 'macOS';
    icon = '🍎';
  } else if (lower.includes('linux')) {
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
