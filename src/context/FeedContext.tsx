import { createContext, useContext, useState, ReactNode } from 'react';
import { Post, TagVariant } from '../types';
import { feedItems } from '../data/feed';

export type FeedItem = Post;

interface FeedContextValue {
  items: Post[];
  addPost: (post: Post) => void;
  setItems: (items: Post[]) => void;
}

const FeedContext = createContext<FeedContextValue | null>(null);

let nextId = feedItems.length + 1;

export function FeedProvider({ children }: { children: ReactNode }) {
  const [items, setItemsState] = useState<Post[]>(feedItems as Post[]);

  const addPost = (post: Post) => {
    setItemsState((prev) => [post, ...prev]);
  };

  const setItems = (newItems: Post[]) => {
    setItemsState(newItems);
  };

  return (
    <FeedContext.Provider value={{ items, addPost, setItems }}>
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
