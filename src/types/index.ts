export type UserRole = 'student' | 'club_admin' | 'super_admin';

export interface User {
  id?: string;
  name: string;
  email: string;
  regNumber: string;
  branch: string;
  degree?: string;
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

export type TagVariant = 'blue' | 'violet' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'default';

export interface EventDetails {
  date: string;
  time: string;
  location: string;
  seats: number | null;
  registerLabel: string;
}

export interface Post {
  id: number;
  type: 'news' | 'clubs' | 'students';
  author: string;
  authorRole: string;
  avatar?: string;
  authorName: string;
  time: string;
  category: string;
  categoryTag: TagVariant;
  title: string;
  summary: string;
  fullContent: string[];
  image: string;
  eventDetails?: EventDetails;
  likes: number;
  comments: number;
  saved: boolean;
  liked: boolean;
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
}

export interface Connection {
  id: number;
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
  id: number;
  name: string;
  branch: string;
  degree: string;
  year: string;
  mutual: number;
  avatar?: string;
  message?: string;
  time: string;
}

export interface NetworkNote {
  id: number;
  authorId: number;
  authorName: string;
  authorBranch: string;
  avatar?: string;
  text: string;
  time: string;
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

export type PostStatus = 'pending' | 'approved' | 'rejected';

export type ApprovalStep =
  | 'club_verification'
  | 'club_admin_approval'
  | 'journalism_approval'
  | 'super_admin_approval'
  | 'published';

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
  type: 'news' | 'clubs' | 'students';
  title: string;
  summary: string;
  fullContent: string[];
  image: string;
  category: string;
  categoryTag: TagVariant;
  eventDetails?: EventDetails;
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
  hasMore: boolean;
}
