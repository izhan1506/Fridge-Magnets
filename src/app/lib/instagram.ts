const POST_PATH = /^\/(?:[^/]+\/)?(p|reel|tv)\/([^/?#]+)/;

/**
 * Instagram only allows iframing permanent posts/Reels/IGTV via their official
 * `/embed` endpoint — ephemeral Stories block framing entirely and require a
 * logged-in session, so there's no public embed URL for those.
 */
export function getInstagramEmbedUrl(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl.trim());
    if (!/(^|\.)instagram\.com$/.test(url.hostname)) return null;
    const match = url.pathname.match(POST_PATH);
    if (!match) return null;
    const [, kind, shortcode] = match;
    return `https://www.instagram.com/${kind}/${shortcode}/embed`;
  } catch {
    return null;
  }
}
