import { createContext, useContext, useState, ReactNode } from 'react';
import { feedItems, FeedItem, TagVariant } from '../data/feed';

interface FeedContextValue {
  items: FeedItem[];
  addPost: (post: FeedItem) => void;
}

const FeedContext = createContext<FeedContextValue | null>(null);

let nextId = feedItems.length + 1;

export function FeedProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<FeedItem[]>(feedItems);

  const addPost = (post: FeedItem) => {
    setItems((prev) => [post, ...prev]);
  };

  return (
    <FeedContext.Provider value={{ items, addPost }}>
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
