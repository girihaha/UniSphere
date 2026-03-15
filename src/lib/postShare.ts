import type { Post } from '../types';

type ShareSuccessMode = 'native-share' | 'clipboard';

export type PostShareResult =
  | { success: true; mode: ShareSuccessMode; url: string }
  | { success: false; cancelled?: boolean; error?: string };

export function buildPostShareUrl(postId: number): string {
  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin.replace(/\/$/, '')
      : '';

  return `${origin}/post/${postId}`;
}

export async function sharePost(post: Pick<Post, 'id' | 'title' | 'author'>): Promise<PostShareResult> {
  const url = buildPostShareUrl(post.id);
  const shareData = {
    title: post.title || 'UniSphere Post',
    text: `${post.author} shared a post on UniSphere`,
    url,
  };

  try {
    if (
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function' &&
      (typeof navigator.canShare !== 'function' || navigator.canShare(shareData))
    ) {
      await navigator.share(shareData);
      return { success: true, mode: 'native-share', url };
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return { success: false, cancelled: true };
    }
  }

  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      return { success: true, mode: 'clipboard', url };
    }

    throw new Error('Clipboard is not available on this device.');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to share this post right now.';
    return { success: false, error: message };
  }
}
