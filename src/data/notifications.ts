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

export const mockNotifications: Notification[] = [
  {
    id: 1,
    type: 'connection_request',
    read: false,
    timestamp: 'Just now',
    timestampMs: Date.now() - 60000,
    actor: { name: 'Rahul Sharma', role: 'CSE · 3rd Year' },
    title: 'Connection Request',
    message: 'Rahul Sharma wants to connect with you.',
    meta: { connectionId: 'rahul-sharma' },
    actionState: 'pending',
  },
  {
    id: 2,
    type: 'post_approved',
    read: false,
    timestamp: '15 min ago',
    timestampMs: Date.now() - 15 * 60000,
    actor: { name: 'Moderation Team', role: 'Super Admin' },
    title: 'Post Approved',
    message: 'Your post was approved and is now live in the feed.',
    meta: { postTitle: 'Hackathon Team Request' },
  },
  {
    id: 3,
    type: 'club_post',
    read: false,
    timestamp: '32 min ago',
    timestampMs: Date.now() - 32 * 60000,
    actor: { name: 'AI Club', role: 'Official Club' },
    title: 'New Club Post',
    message: 'AI Club posted a new event: Machine Learning Workshop.',
    meta: { clubName: 'AI Club', postTitle: 'Machine Learning Workshop' },
  },
  {
    id: 4,
    type: 'connection_request',
    read: false,
    timestamp: '1h ago',
    timestampMs: Date.now() - 60 * 60000,
    actor: { name: 'Priya Nair', role: 'ECE · 2nd Year' },
    title: 'Connection Request',
    message: 'Priya Nair wants to connect with you.',
    meta: { connectionId: 'priya-nair' },
    actionState: 'pending',
  },
  {
    id: 5,
    type: 'network_note',
    read: false,
    timestamp: '2h ago',
    timestampMs: Date.now() - 2 * 60 * 60000,
    actor: { name: 'Arjun Mehta', role: 'CS · 4th Year' },
    title: 'Network Note',
    message: 'Arjun posted a network note: "Looking for DSA study partners for GATE prep."',
    meta: { noteContent: 'Looking for DSA study partners for GATE prep.' },
  },
  {
    id: 6,
    type: 'post_rejected',
    read: true,
    timestamp: '3h ago',
    timestampMs: Date.now() - 3 * 60 * 60000,
    actor: { name: 'Moderation Team', role: 'Super Admin' },
    title: 'Post Rejected',
    message: 'Your post was not approved. Please review the community guidelines.',
    meta: { postTitle: 'Club Event Announcement' },
  },
  {
    id: 7,
    type: 'interaction',
    read: true,
    timestamp: '4h ago',
    timestampMs: Date.now() - 4 * 60 * 60000,
    actor: { name: 'Neha Kapoor', role: 'MECH · 3rd Year' },
    title: 'Post Liked',
    message: 'Neha Kapoor liked your post "AI Workshop Series".',
    meta: { postTitle: 'AI Workshop Series' },
  },
  {
    id: 8,
    type: 'club_post',
    read: true,
    timestamp: '6h ago',
    timestampMs: Date.now() - 6 * 60 * 60000,
    actor: { name: 'Robotics Club', role: 'Official Club' },
    title: 'New Club Post',
    message: 'Robotics Club posted a new event: Annual Bot Building Challenge.',
    meta: { clubName: 'Robotics Club', postTitle: 'Annual Bot Building Challenge' },
  },
  {
    id: 9,
    type: 'mention',
    read: true,
    timestamp: '8h ago',
    timestampMs: Date.now() - 8 * 60 * 60000,
    actor: { name: 'Kiran Das', role: 'IT · 2nd Year' },
    title: 'Mentioned You',
    message: 'Kiran Das mentioned you in a comment: "You should talk to @you about this!"',
    meta: {},
  },
  {
    id: 10,
    type: 'post_approved',
    read: true,
    timestamp: '1d ago',
    timestampMs: Date.now() - 24 * 60 * 60000,
    actor: { name: 'Moderation Team', role: 'Club Admin' },
    title: 'Post Approved',
    message: 'Your post was approved and is now live in the feed.',
    meta: { postTitle: 'National Science Olympiad Recap' },
  },
  {
    id: 11,
    type: 'network_note',
    read: true,
    timestamp: '1d ago',
    timestampMs: Date.now() - 26 * 60 * 60000,
    actor: { name: 'Simran Bhatia', role: 'CSE · 1st Year' },
    title: 'Network Note',
    message: 'Simran posted a note: "Anyone up for a chess tournament this weekend?"',
    meta: { noteContent: 'Anyone up for a chess tournament this weekend?' },
  },
  {
    id: 12,
    type: 'connection_request',
    read: true,
    timestamp: '2d ago',
    timestampMs: Date.now() - 48 * 60 * 60000,
    actor: { name: 'Dev Malhotra', role: 'MBA · 1st Year' },
    title: 'Connection Request',
    message: 'Dev Malhotra wants to connect with you.',
    meta: { connectionId: 'dev-malhotra' },
    actionState: 'accepted',
  },
];
