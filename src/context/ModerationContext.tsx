import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';
import { ModerationItem, Post, PostStatus, WorkflowStep } from '../types';
import { useFeed } from './FeedContext';
import { useAuth } from './AuthContext';
import {
  approvePostAtAdminLevel,
  approvePostAtClubLevel,
  deletePost as deletePostService,
  getAdminReviewQueue,
  getClubReviewQueue,
  rejectPostAtAdminLevel,
  rejectPostAtClubLevel,
} from '../services/feedService';

export type PendingPost = ModerationItem;

interface ModerationContextValue {
  pendingPosts: ModerationItem[];
  myPosts: ModerationItem[];
  submitForReview: (item: Post, authorName: string, authorRole: string) => void;
  approvePost: (id: number) => Promise<void>;
  rejectPost: (id: number, reason?: string) => Promise<void>;
  deleteMyPost: (id: number) => Promise<{ error?: string; message?: string }>;
  refreshModeration: () => Promise<void>;
  isLoading: boolean;
}

const ModerationContext = createContext<ModerationContextValue | null>(null);

function formatSubmittedAt(value?: string) {
  if (!value) return 'Just now';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Just now';

  return date.toLocaleString();
}

function buildWorkflow(status: PostStatus): WorkflowStep[] {
  if (status === 'pending_club_review') {
    return [
      { id: 'club_review', label: 'Club Review', completed: false, current: true },
      { id: 'admin_review', label: 'Admin Review', completed: false, current: false },
      { id: 'published', label: 'Published', completed: false, current: false },
    ];
  }

  if (status === 'pending_admin_review') {
    return [
      { id: 'club_review', label: 'Club Review', completed: true, current: false },
      { id: 'admin_review', label: 'Admin Review', completed: false, current: true },
      { id: 'published', label: 'Published', completed: false, current: false },
    ];
  }

  if (status === 'approved') {
    return [
      { id: 'club_review', label: 'Club Review', completed: true, current: false },
      { id: 'admin_review', label: 'Admin Review', completed: true, current: false },
      { id: 'published', label: 'Published', completed: true, current: true },
    ];
  }

  return [
    { id: 'club_review', label: 'Club Review', completed: false, current: false },
    { id: 'admin_review', label: 'Admin Review', completed: false, current: false },
    { id: 'rejected', label: 'Rejected', completed: true, current: true },
  ];
}

function getCurrentStep(status: PostStatus): 'club_review' | 'admin_review' | 'published' | 'rejected' {
  if (status === 'pending_club_review') return 'club_review';
  if (status === 'pending_admin_review') return 'admin_review';
  if (status === 'approved') return 'published';
  return 'rejected';
}

function toModerationItem(post: Post): ModerationItem {
  const status: PostStatus = post.status ?? 'pending_club_review';

  return {
    id: post.id,
    post,
    status,
    submittedAt: formatSubmittedAt(post.submittedAt),
    submittedBy: post.authorName || post.author || 'Unknown User',
    submittedByRole: post.authorRole || 'Student',
    rejectionReason: post.rejectionReason,
    workflow: buildWorkflow(status),
    currentStep: getCurrentStep(status),
  };
}

export function ModerationProvider({ children }: { children: ReactNode }) {
  const { refreshFeed } = useFeed();
  const { user } = useAuth();

  const [pendingPosts, setPendingPosts] = useState<ModerationItem[]>([]);
  const [myPosts, setMyPosts] = useState<ModerationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshModeration = useCallback(async () => {
    if (!user) {
      setPendingPosts([]);
      setMyPosts([]);
      return;
    }

    setIsLoading(true);

    try {
      let queue: Post[] = [];

      if (user.role === 'super_admin') {
        queue = await getAdminReviewQueue();
      } else if (user.role === 'club_admin') {
        queue = await getClubReviewQueue();
      } else {
        queue = [];
      }

      const moderationItems = queue.map(toModerationItem);

      setPendingPosts(moderationItems);
      setMyPosts((prev) => {
        const localOnly = prev.filter(
          (item) => !moderationItems.some((queueItem) => queueItem.id === item.id)
        );
        return [...moderationItems.filter((item) => item.post.authorId === user.id), ...localOnly];
      });
    } catch (error) {
      console.error('Failed to refresh moderation:', error);
      setPendingPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshModeration();
  }, [refreshModeration]);

  const submitForReview = useCallback((item: Post, authorName: string, authorRole: string) => {
    const status: PostStatus = item.status ?? 'pending_club_review';

    const moderationItem: ModerationItem = {
      id: item.id,
      post: item,
      status,
      submittedAt: formatSubmittedAt(item.submittedAt),
      submittedBy: authorName,
      submittedByRole: authorRole,
      rejectionReason: item.rejectionReason,
      workflow: buildWorkflow(status),
      currentStep: getCurrentStep(status),
    };

    setMyPosts((prev) => [moderationItem, ...prev]);
  }, []);

  const approvePost = useCallback(
    async (id: number) => {
      const target = pendingPosts.find((item) => item.id === id);
      if (!target) return;

      let result: { error?: string };

      if (target.status === 'pending_club_review') {
        result = await approvePostAtClubLevel(id);
      } else if (target.status === 'pending_admin_review') {
        result = await approvePostAtAdminLevel(id);
      } else {
        return;
      }

      if (result.error) {
        console.error('approvePost failed:', result.error);
        return;
      }

      await refreshModeration();
      await refreshFeed();
    },
    [pendingPosts, refreshFeed, refreshModeration]
  );

  const rejectPost = useCallback(
    async (id: number, reason?: string) => {
      const target = pendingPosts.find((item) => item.id === id);
      if (!target) return;

      let result: { error?: string };

      if (target.status === 'pending_club_review') {
        result = await rejectPostAtClubLevel(id, reason?.trim() || 'Rejected by club admin');
      } else if (target.status === 'pending_admin_review') {
        result = await rejectPostAtAdminLevel(id, reason?.trim() || 'Rejected by super admin');
      } else {
        return;
      }

      if (result.error) {
        console.error('rejectPost failed:', result.error);
        return;
      }

      await refreshModeration();
      await refreshFeed();
    },
    [pendingPosts, refreshFeed, refreshModeration]
  );

  const deleteMyPost = useCallback(
    async (id: number) => {
      const result = await deletePostService(id);

      if (result.error) {
        return { error: result.error };
      }

      setMyPosts((prev) => prev.filter((item) => item.id !== id));
      setPendingPosts((prev) => prev.filter((item) => item.id !== id));
      await refreshFeed();

      return { message: result.message };
    },
    [refreshFeed]
  );

  return (
    <ModerationContext.Provider
      value={{
        pendingPosts,
        myPosts,
        submitForReview,
        approvePost,
        rejectPost,
        deleteMyPost,
        refreshModeration,
        isLoading,
      }}
    >
      {children}
    </ModerationContext.Provider>
  );
}

export function useModeration() {
  const ctx = useContext(ModerationContext);
  if (!ctx) throw new Error('useModeration must be used within ModerationProvider');
  return ctx;
}
