import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Post, TagVariant, PostKind } from '../types';
import { getPosts } from '../services/feedService';

export type FeedItem = Post;

interface FeedContextValue {
  items: Post[];
  addPost: (post: Post) => void;
  setItems: (items: Post[]) => void;
  refreshFeed: (filter?: 'news' | 'clubs' | 'students') => Promise<void>;
  isLoading: boolean;
}

const FeedContext = createContext<FeedContextValue | null>(null);

let nextId = Date.now();

function getCategoryLabel(type: string, kind?: PostKind) {
  if (kind === 'announcement') return 'Announcement';
  if (kind === 'event') return 'Event';

  if (type === 'news') return 'Campus News';
  if (type === 'clubs') return 'Club Update';
  return 'Student Post';
}

function getCategoryTag(type: string, kind?: PostKind): TagVariant {
  if (kind === 'announcement') return 'amber';
  if (kind === 'event') return 'emerald';

  if (type === 'news') return 'blue';
  if (type === 'clubs') return 'violet';
  return 'emerald';
}

function getDefaultImage(type: string, kind?: PostKind) {
  if (kind === 'event') {
    return 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80';
  }

  if (kind === 'announcement') {
    return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80';
  }

  if (type === 'news') {
    return 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80';
  }

  if (type === 'clubs') {
    return 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80';
  }

  return 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80';
}

function buildSummary(post: any, content: string) {
  if (post.summary && String(post.summary).trim()) {
    return String(post.summary).trim();
  }

  if (content.length > 120) {
    return `${content.slice(0, 120)}...`;
  }

  return content || 'No description available.';
}

function normalizeEventDetails(post: any) {
  if (!post.eventDetails) return null;

  return {
    date: post.eventDetails.date || '',
    time: post.eventDetails.time || '',
    location: post.eventDetails.location || '',
    seats:
      typeof post.eventDetails.seats === 'number' || post.eventDetails.seats === null
        ? post.eventDetails.seats
        : null,
    registerLabel: post.eventDetails.registerLabel || (post.eventDetails.registerLink ? 'Register' : 'Learn More'),
    registerLink: post.eventDetails.registerLink || undefined,
  };
}

export function normalizePost(post: any): Post {
  const content = post.content || '';
  const summary = buildSummary(post, content);

  const authorType = post.authorType || (post.clubId ? 'club' : 'user');
  const avatar =
    authorType === 'club'
      ? post.clubAvatar || post.avatar || ''
      : post.userAvatar || post.avatar || '';

  const authorName =
    authorType === 'club'
      ? post.clubName || post.authorName || post.author || 'Club'
      : post.authorName || post.author || 'Unknown User';

  const author =
    authorType === 'club'
      ? post.clubName || post.author || post.authorName || 'Club'
      : post.author || post.authorName || 'Unknown User';

  return {
    ...post,
    id: typeof post.id === 'number' ? post.id : generateId(),
    kind: post.kind || 'post',
    authorType,
    image: post.image || getDefaultImage(post.type, post.kind),
    avatar,
    summary,
    fullContent:
      Array.isArray(post.fullContent) && post.fullContent.length > 0
        ? post.fullContent
        : [content || 'No additional content available.'],
    category: post.category || getCategoryLabel(post.type, post.kind),
    categoryTag: post.categoryTag || getCategoryTag(post.type, post.kind),
    eventDetails: normalizeEventDetails(post),
    author,
    authorName,
    authorRole:
      authorType === 'club'
        ? post.authorRole || 'Club'
        : post.authorRole || 'Student',
    time: post.time || 'Just now',
    likes: typeof post.likes === 'number' ? post.likes : 0,
    comments: typeof post.comments === 'number' ? post.comments : 0,
    saved: typeof post.saved === 'boolean' ? post.saved : false,
    liked: typeof post.liked === 'boolean' ? post.liked : false,
    clubName: post.clubName || undefined,
    clubAvatar: post.clubAvatar || undefined,
    userAvatar: post.userAvatar || undefined,
    content,
  };
}

export function FeedProvider({ children }: { children: ReactNode }) {
  const [items, setItemsState] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshFeed = useCallback(async (filter?: 'news' | 'clubs' | 'students') => {
    setIsLoading(true);
    try {
      const data = await getPosts(filter);
      const normalized = (data || []).map(normalizePost);
      setItemsState(normalized);
    } catch (error) {
      console.error('Failed to refresh feed:', error);
      setItemsState([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshFeed();
  }, [refreshFeed]);

  const addPost = (post: Post) => {
    const normalized = normalizePost(post);
    setItemsState((prev) => [normalized, ...prev]);
  };

  const setItems = (newItems: Post[]) => {
    setItemsState(newItems.map(normalizePost));
  };

  return (
    <FeedContext.Provider value={{ items, addPost, setItems, refreshFeed, isLoading }}>
      {children}
    </FeedContext.Provider>
  );
}

export function useFeed() {
  const ctx = useContext(FeedContext);
  if (!ctx) throw new Error('useFeed must be used within FeedProvider');
  return ctx;
}

export function generateId() {
  return nextId++;
}

export type { TagVariant };
