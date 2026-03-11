import { createContext, useContext, useState, ReactNode } from 'react';
import { PendingPost, mockPendingPosts, buildWorkflow } from '../data/moderation';
import { FeedItem } from '../data/feed';
import { useFeed } from './FeedContext';

interface ModerationContextValue {
  pendingPosts: PendingPost[];
  myPosts: PendingPost[];
  submitForReview: (item: FeedItem, authorName: string, authorRole: string) => void;
  approvePost: (id: number) => void;
  rejectPost: (id: number, reason?: string) => void;
}

const ModerationContext = createContext<ModerationContextValue | null>(null);

let nextModerationId = 200;

export function ModerationProvider({ children }: { children: ReactNode }) {
  const { addPost } = useFeed();
  const [pendingPosts, setPendingPosts] = useState<PendingPost[]>(mockPendingPosts);
  const [myPosts, setMyPosts] = useState<PendingPost[]>([]);

  const submitForReview = (item: FeedItem, authorName: string, authorRole: string) => {
    const firstStep =
      item.type === 'clubs'
        ? 'club_verification' as const
        : item.type === 'news'
        ? 'journalism_approval' as const
        : 'super_admin_approval' as const;

    const post: PendingPost = {
      id: nextModerationId++,
      feedItem: { ...item, id: nextModerationId },
      status: 'pending',
      submittedAt: 'Just now',
      submittedBy: authorName,
      submittedByRole: authorRole,
      workflow: buildWorkflow(item.type, firstStep),
      currentStep: firstStep,
    };

    setPendingPosts((prev) => [post, ...prev]);
    setMyPosts((prev) => [post, ...prev]);
  };

  const approvePost = (id: number) => {
    let approved: PendingPost | undefined;
    setPendingPosts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        approved = { ...p, status: 'approved' };
        return approved;
      })
    );
    setMyPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'approved' } : p))
    );
    if (approved) {
      addPost({ ...approved.feedItem, time: 'Just now' });
    }
  };

  const rejectPost = (id: number, reason?: string) => {
    setPendingPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: 'rejected', rejectionReason: reason } : p
      )
    );
    setMyPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: 'rejected', rejectionReason: reason } : p
      )
    );
  };

  return (
    <ModerationContext.Provider value={{ pendingPosts, myPosts, submitForReview, approvePost, rejectPost }}>
      {children}
    </ModerationContext.Provider>
  );
}

export function useModeration() {
  const ctx = useContext(ModerationContext);
  if (!ctx) throw new Error('useModeration must be used within ModerationProvider');
  return ctx;
}
