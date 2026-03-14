export type PostType = "news" | "clubs" | "students";

export type PostStatus =
  | "pending_club_review"
  | "pending_admin_review"
  | "approved"
  | "rejected";

export type PostAuthorType = "user" | "club";

export type PostKind = "post" | "announcement" | "event";

export interface EventMeta {
  date?: string;
  time?: string;
  location?: string;
  registerLink?: string;
}

export interface Post {
  id: number;

  title: string;
  content: string;
  summary?: string;

  /**
   * Existing feed/category filter type.
   * Keep this so current frontend filters do not break.
   */
  type: PostType;

  /**
   * New: what kind of content this is inside the post system.
   * Useful for club page tabs like posts / announcements / events.
   */
  kind: PostKind;

  /**
   * New: who is shown as the author in the feed.
   * user  -> normal personal post
   * club  -> posted on behalf of a club
   */
  authorType: PostAuthorType;

  /**
   * Real submitting user.
   * Even for club-authored posts, this remains the actual logged-in admin.
   */
  authorId: string;
  authorName: string;
  authorRole: string;

  /**
   * Display author shown on UI.
   * For personal posts => student name
   * For club posts => club name
   */
  author: string;

  /**
   * Optional avatars for rendering.
   * userAvatar -> personal post rendering if needed later
   * avatar     -> final display avatar in feed
   */
  userAvatar?: string;
  avatar?: string;

  time: string;

  likes: number;
  comments: number;

  saved: boolean;
  liked: boolean;

  image?: string;

  /**
   * Club linkage.
   * Required when authorType = "club"
   * Optional for normal posts categorized under clubs later if needed.
   */
  clubId?: number;
  clubName?: string;
  clubAvatar?: string;

  /**
   * Optional event/announcement metadata
   */
  eventDetails?: EventMeta | null;

  /* ---------- APPROVAL SYSTEM ---------- */

  status: PostStatus;

  submittedAt: string;

  clubReviewedBy?: string;
  clubReviewedAt?: string;

  adminReviewedBy?: string;
  adminReviewedAt?: string;

  rejectionReason?: string;
}

export interface CreatePostPayload {
  title: string;
  content: string;
  summary?: string;

  /**
   * Keep existing type so feed filters remain compatible.
   */
  type: PostType;

  /**
   * New
   * personal -> normal student / admin post
   * club     -> post on behalf of selected managed club
   */
  postAs?: "personal" | "club";

  /**
   * New content subtype for club pages
   */
  kind?: PostKind;

  image?: string;

  /**
   * Required when postAs = "club"
   */
  clubId?: number;

  /**
   * Optional event/announcement metadata
   */
  eventDetails?: EventMeta | null;
}