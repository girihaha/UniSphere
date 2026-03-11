import { createContext, useContext, useState, ReactNode } from 'react';
import { ModerationItem, Post } from '../types';
import { mockPendingPosts, buildWorkflow } from '../data/moderation';
import { useFeed } from './FeedContext';

export type PendingPost = ModerationItem;

function toPendingPost(p: (typeof mockPendingPosts)[0]): ModerationItem {
  return {
    id: p.id,
    post: p.feedItem as Post,
    status: p.status,
    submittedAt: p.submittedAt,
    submittedBy: p.submittedBy,
    submittedByRole: p.submittedByRole,
    rejectionReason: p.rejectionReason,
    workflow: p.workflow,
    currentStep: p.currentStep,
  };
}

interface ModerationContextValue {
  pendingPosts: ModerationItem[];
  myPosts: ModerationItem[];
  submitForReview: (item: Post, authorName: string, authorRole: string) => void;
  approvePost: (id: number) => void;
  rejectPost: (id: number, reason?: string) => void;
}

const ModerationContext = createContext<ModerationContextValue | null>(null);

let nextModerationId = 200;

export function ModerationProvider({ children }: { children: ReactNode }) {
  const { addPost } = useFeed();
  const [pendingPosts, setPendingPosts] = useState<ModerationItem[]>(
    mockPendingPosts.map(toPendingPost)
  );
  const [myPosts, setMyPosts] = useState<ModerationItem[]>([]);

  const submitForReview = (item: Post, authorName: string, authorRole: string) => {
    const firstStep =
      item.type === 'clubs'
        ? ('club_verification' as const)
        : item.type === 'news'
        ? ('journalism_approval' as const)
        : ('super_admin_approval' as const);

    const modItem: ModerationItem = {
      id: nextModerationId++,
      post: { ...item, id: nextModerationId },
      status: 'pending',
      submittedAt: 'Just now',
      submittedBy: authorName,
      submittedByRole: authorRole,
      workflow: buildWorkflow(item.type, firstStep),
      currentStep: firstStep,
    };

    setPendingPosts((prev) => [modItem, ...prev]);
    setMyPosts((prev) => [modItem, ...prev]);
  };

  const approvePost = (id: number) => {
    let approved: ModerationItem | undefined;
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
      addPost({ ...approved.post, time: 'Just now' });
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
