export type ClubStatus = "active" | "pending" | "rejected";

export type ClubPostStatus =
  | "pending_club_review"
  | "pending_admin_review"
  | "approved"
  | "rejected";

export interface ClubPost {
  id: number;
  clubId: number;
  title: string;
  content: string;
  image: string;
  time: string;
  likes: number;
  comments: number;

  status: ClubPostStatus;
  submittedAt: string;

  submittedBy?: string;
  clubReviewedBy?: string;
  clubReviewedAt?: string;
  adminReviewedBy?: string;
  adminReviewedAt?: string;
  rejectionReason?: string;
}

export interface Club {
  id: number;
  name: string;
  username: string;
  description: string;
  category: string;
  avatar: string;
  coverImage: string;
  members: number;
  followers: number;
  isFollowing?: boolean;
  tags: string[];
  posts?: ClubPost[];

  verified: boolean;
  status: ClubStatus;
  isOfficial: boolean;

  createdBy?: string;
  adminUserIds: string[];
}

export interface CreateClubPayload {
  name: string;
  username: string;
  description: string;
  category: string;
  avatar?: string;
  coverImage?: string;
  tags?: string[];
  verified?: boolean;
  isOfficial?: boolean;
}

export interface AssignClubAdminPayload {
  userId: string;
}