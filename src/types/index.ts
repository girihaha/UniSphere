export type UserRole = 'student' | 'club_admin' | 'super_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  regNumber: string;
  branch: string;
  degree: string;
  year: string;
  cgpa?: string;
  bio?: string;
  avatarUrl?: string;
  role: UserRole;
  connections?: number;
  posts?: number;
  notes?: number;
  clubs?: number;
}

export interface SocialLink {
  id: string;
  platform: string;
  handle: string;
  url: string;
}

export interface Achievement {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  bgFrom: string;
  bgTo: string;
}

export type TagVariant =
  | 'blue'
  | 'violet'
  | 'emerald'
  | 'amber'
  | 'rose'
  | 'cyan'
  | 'default';

export interface EventDetails {
  date?: string;
  time?: string;
  location?: string;
  seats?: number | null;
  registerLabel?: string;
  registerLink?: string;
}

export type PostType = 'news' | 'clubs' | 'students';

export type PostStatus =
  | 'pending_club_review'
  | 'pending_admin_review'
  | 'approved'
  | 'rejected';

export type PostAuthorType = 'user' | 'club';

export type PostKind = 'post' | 'announcement' | 'event';

export interface Post {
  id: number;

  type: PostType;
  kind?: PostKind;
  authorType?: PostAuthorType;

  author: string;
  authorId?: string;
  authorRole: string;
  avatar?: string;
  authorName: string;

  userAvatar?: string;
  clubName?: string;
  clubAvatar?: string;

  time: string;

  category: string;
  categoryTag: TagVariant;

  title: string;
  summary: string;
  fullContent: string[];
  content?: string;
  image: string;

  eventDetails?: EventDetails | null;

  likes: number;
  comments: number;
  saved: boolean;
  liked: boolean;

  clubId?: number;

  status?: PostStatus;
  submittedAt?: string;
  clubReviewedBy?: string;
  clubReviewedAt?: string;
  adminReviewedBy?: string;
  adminReviewedAt?: string;
  rejectionReason?: string;
}

export interface Comment {
  id: number;
  postId: number;
  authorId?: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
  time: string;
  timestampMs?: number;
}

export interface ClubPost {
  id: number;
  title: string;
  summary: string;
  image: string;
  time: string;
  likes: number;
  comments: number;
}

export interface Club {
  id: number;
  name: string;
  tagline: string;
  description: string;
  category: string;
  categoryTag: TagVariant;
  members: string;
  founded: string;
  type: string;
  color: string;
  heroImage: string;
  logoImage: string;
  recommended: boolean;
  posts: ClubPost[];

  username?: string;
  avatar?: string;
  coverImage?: string;
  followers?: number;
  verified?: boolean;
  status?: string;
  isOfficial?: boolean;
  adminUserIds?: string[];
  isFollowing?: boolean;
  tags?: string[];
}

export interface Connection {
  id: string;
  name: string;
  branch: string;
  degree: string;
  year: string;
  online: boolean;
  mutual: number;
  avatar?: string;
  instagram?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface ConnectionRequest {
  id: string;
  name: string;
  branch: string;
  degree: string;
  year: string;
  mutual: number;
  avatar?: string;
  message?: string;
  time: string;
}

export interface DiscoverUser {
  id: string;
  name: string;
  branch: string;
  degree: string;
  year: string;
  mutual: number;
  avatar?: string;
  requestSent: boolean;
}

export interface NetworkNote {
  id: string;
  authorId: string;
  authorName: string;
  authorBranch: string;
  avatar?: string;
  text: string;
  time: string;
  expiresAt?: string;
  expiresAtMs?: number;
  expiresIn?: string;
}

export type NotificationType =
  | 'connection_request'
  | 'post_approved'
  | 'post_rejected'
  | 'club_post'
  | 'network_note'
  | 'mention'
  | 'interaction';

export interface Notification {
  id: number;
  type: NotificationType;
  read: boolean;
  timestamp: string;
  timestampMs: number;
  actor: {
    name: string;
    avatarUrl?: string;
    role?: string;
  };
  title: string;
  message: string;
  meta?: {
    postTitle?: string;
    clubName?: string;
    noteContent?: string;
    connectionId?: string;
  };
  actionState?: 'pending' | 'accepted' | 'declined';
}

export type ApprovalStep =
  | 'club_review'
  | 'admin_review'
  | 'published'
  | 'rejected';

export interface WorkflowStep {
  id: ApprovalStep;
  label: string;
  completed: boolean;
  current: boolean;
}

export interface ModerationItem {
  id: number;
  post: Post;
  status: PostStatus;
  submittedAt: string;
  submittedBy: string;
  submittedByRole: string;
  rejectionReason?: string;
  workflow: WorkflowStep[];
  currentStep: ApprovalStep;
}

export interface Poster {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  createdBy?: string;
  createdAt?: string;
  qrLink?: string;
}

export interface CreatePostPayload {
  type: PostType;
  kind?: PostKind;
  postAs?: 'personal' | 'club';
  title: string;
  summary?: string;
  content: string;
  imageFile?: File | null;
  clubId?: number;
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
  registerLabel?: string;
  registerLink?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  name: string;
  regNumber: string;
  email: string;
  branch: string;
  year: string;
  password: string;
  role: UserRole;
}

export interface AuthResponse {
  user: User;
  token?: string;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
