interface Env {
  GITHUB_TOKEN?: string;
}

interface Context {
  request: Request;
  env: Env;
}

export const onRequest = async (context: Context): Promise<Response> => {
  const { request, env } = context;
  const url = new URL(request.url);

  // Get query parameters
  const version = url.searchParams.get('version');
  const assetName = url.searchParams.get('asset');

  if (!version || !assetName) {
    return new Response(
      JSON.stringify({ error: 'Missing version or asset parameter' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  const GITHUB_TOKEN = env.GITHUB_TOKEN;
  const GITHUB_REPO = 'matrindex/daemon-cli';

  try {
    // Fetch release info to get the asset download URL
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Matrindex-Website',
    };

    if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }

    // Get the release by tag
    const releaseUrl = `https://api.github.com/repos/${GITHUB_REPO}/releases/tags/${encodeURIComponent(version)}`;
    const releaseResponse = await fetch(releaseUrl, { headers });

    if (!releaseResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'Release not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const release = await releaseResponse.json() as {
      assets: Array<{
        name: string;
        browser_download_url: string;
        content_type: string;
      }>;
    };

    // Find the matching asset
    const asset = release.assets.find((a: { name: string }) => a.name === assetName);

    if (!asset) {
      return new Response(
        JSON.stringify({ error: 'Asset not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Fetch the asset from GitHub with authentication
    const assetHeaders: Record<string, string> = {
      'Accept': 'application/octet-stream',
      'User-Agent': 'Matrindex-Website',
    };

    if (GITHUB_TOKEN) {
      assetHeaders['Authorization'] = `token ${GITHUB_TOKEN}`;
    }

    const assetResponse = await fetch(asset.browser_download_url, {
      headers: assetHeaders,
      redirect: 'follow',
    });

    if (!assetResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to download asset' }),
        {
          status: 502,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Stream the response back to the client
    const contentType = assetResponse.headers.get('content-type') || 'application/octet-stream';
    const contentLength = assetResponse.headers.get('content-length');

    const responseHeaders: Record<string, string> = {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${assetName}"`,
      'Cache-Control': 'public, max-age=3600',
    };

    if (contentLength) {
      responseHeaders['Content-Length'] = contentLength;
    }

    return new Response(assetResponse.body, {
      status: 200,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error('Download error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
