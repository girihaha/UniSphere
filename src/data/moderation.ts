import { TagVariant } from '../types';

export type { PostStatus, ApprovalStep, WorkflowStep } from '../types';

interface PendingPost {
  id: number;
  feedItem: {
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
    eventDetails?: {
      date: string;
      time: string;
      location: string;
      seats: number | null;
      registerLabel: string;
    };
    likes: number;
    comments: number;
    saved: boolean;
    liked: boolean;
  };
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  submittedBy: string;
  submittedByRole: string;
  rejectionReason?: string;
  workflow: import('../types').WorkflowStep[];
  currentStep: import('../types').ApprovalStep;
}

export type { PendingPost };

function clubWorkflow(step: ApprovalStep): WorkflowStep[] {
  const steps: ApprovalStep[] = ['club_verification', 'club_admin_approval', 'super_admin_approval', 'published'];
  const labels: Record<ApprovalStep, string> = {
    club_verification: 'Club Verification',
    club_admin_approval: 'Club Admin Approval',
    journalism_approval: 'Journalism Club',
    super_admin_approval: 'Super Admin Approval',
    published: 'Published',
  };
  const idx = steps.indexOf(step);
  return steps.map((s, i) => ({
    id: s,
    label: labels[s],
    completed: i < idx,
    current: i === idx,
  }));
}

function newsWorkflow(step: ApprovalStep): WorkflowStep[] {
  const steps: ApprovalStep[] = ['journalism_approval', 'super_admin_approval', 'published'];
  const labels: Record<ApprovalStep, string> = {
    club_verification: 'Club Verification',
    club_admin_approval: 'Club Admin Approval',
    journalism_approval: 'Journalism Club Approval',
    super_admin_approval: 'Super Admin Approval',
    published: 'Published',
  };
  const idx = steps.indexOf(step);
  return steps.map((s, i) => ({
    id: s,
    label: labels[s],
    completed: i < idx,
    current: i === idx,
  }));
}

function studentWorkflow(step: ApprovalStep): WorkflowStep[] {
  const steps: ApprovalStep[] = ['super_admin_approval', 'published'];
  const labels: Record<ApprovalStep, string> = {
    club_verification: 'Club Verification',
    club_admin_approval: 'Club Admin Approval',
    journalism_approval: 'Journalism Club',
    super_admin_approval: 'Super Admin Approval',
    published: 'Published',
  };
  const idx = steps.indexOf(step);
  return steps.map((s, i) => ({
    id: s,
    label: labels[s],
    completed: i < idx,
    current: i === idx,
  }));
}

export function buildWorkflow(type: 'clubs' | 'news' | 'students', step: ApprovalStep): WorkflowStep[] {
  if (type === 'clubs') return clubWorkflow(step);
  if (type === 'news') return newsWorkflow(step);
  return studentWorkflow(step);
}

export const mockPendingPosts: PendingPost[] = [
  {
    id: 101,
    feedItem: {
      id: 101,
      type: 'clubs',
      author: 'CodeCraft Society',
      authorRole: 'Club',
      authorName: 'CodeCraft Society',
      time: '2h ago',
      category: 'Club',
      categoryTag: 'violet' as TagVariant,
      title: 'AI Workshop Series — Register Now',
      summary: 'A three-part hands-on AI workshop series covering ML fundamentals, neural nets, and deployment.',
      fullContent: [
        'CodeCraft Society is launching a 3-part AI workshop series this January. The series is designed for students who want to move from theory to practice.',
        'Week 1 covers ML fundamentals using scikit-learn. Week 2 dives into neural networks with PyTorch. Week 3 focuses on model deployment using FastAPI and Docker.',
        'All workshops are free for members. Non-members can attend for a nominal fee of ₹100 per session. Register via the link to secure your spot.',
      ],
      image: 'https://images.pexels.com/photos/2085831/pexels-photo-2085831.jpeg?auto=compress&cs=tinysrgb&w=800',
      eventDetails: {
        date: 'January 10, 17, 24 — 2026',
        time: '3:00 PM – 5:00 PM',
        location: 'Computer Lab 2, Tech Block',
        seats: 40,
        registerLabel: 'Register Now',
      },
      likes: 0,
      comments: 0,
      saved: false,
      liked: false,
    },
    status: 'pending',
    submittedAt: '2 hours ago',
    submittedBy: 'Rahul Mehta',
    submittedByRole: 'Club Lead · CSE 3rd Year',
    workflow: clubWorkflow('club_admin_approval'),
    currentStep: 'club_admin_approval',
  },
  {
    id: 102,
    feedItem: {
      id: 102,
      type: 'students',
      author: 'Meera Iyer',
      authorRole: 'Student · ECE 2nd Year',
      authorName: 'Meera Iyer',
      time: '5h ago',
      category: 'Student',
      categoryTag: 'emerald' as TagVariant,
      title: 'My Experience at the National Science Olympiad',
      summary: 'I represented our university at the National Science Olympiad and came back with a silver medal and a new perspective on competitive science.',
      fullContent: [
        'Two weeks ago I competed at the National Science Olympiad held in Delhi. It was the first time I had represented my university at a national competition, and the experience was genuinely transformative.',
        'The competition had three rounds: a written theory test, a lab practical, and a rapid-fire quiz. The theory paper covered topics from thermodynamics, quantum mechanics, and electromagnetic theory — areas where my professors here have given me a solid foundation.',
        'I came home with a silver medal and, more importantly, connections with brilliant students from across India. I also learned that our university\'s curriculum is strong but we need more hands-on lab practice.',
      ],
      image: 'https://images.pexels.com/photos/3184416/pexels-photo-3184416.jpeg?auto=compress&cs=tinysrgb&w=800',
      likes: 0,
      comments: 0,
      saved: false,
      liked: false,
    },
    status: 'pending',
    submittedAt: '5 hours ago',
    submittedBy: 'Meera Iyer',
    submittedByRole: 'Student · ECE 2nd Year',
    workflow: studentWorkflow('super_admin_approval'),
    currentStep: 'super_admin_approval',
  },
  {
    id: 103,
    feedItem: {
      id: 103,
      type: 'news',
      author: 'Campus Updates',
      authorRole: 'Official',
      authorName: 'Campus Updates',
      time: '1d ago',
      category: 'News',
      categoryTag: 'blue' as TagVariant,
      title: 'New Shuttle Service Between Hostels and Library',
      summary: 'The university is launching a free shuttle service connecting all hostels to the central library, running until 11 PM on weekdays.',
      fullContent: [
        'Starting January 6, 2026, the university will operate a free shuttle service connecting all on-campus hostels to the central library and back. The service will run every 30 minutes from 6 PM to 11 PM on weekdays.',
        'The initiative follows a student survey in which 78% of hostel residents cited difficulty reaching the library in the evening as a major academic inconvenience. The transport committee approved the proposal after a trial run in November.',
        'Shuttles will stop at North Hostel, South Hostel, Boys PG, Girls PG, the central library, and the main academic block. No booking is required — just show your student ID.',
      ],
      image: 'https://images.pexels.com/photos/267582/pexels-photo-267582.jpeg?auto=compress&cs=tinysrgb&w=800',
      likes: 0,
      comments: 0,
      saved: false,
      liked: false,
    },
    status: 'pending',
    submittedAt: '1 day ago',
    submittedBy: 'Journalism Club',
    submittedByRole: 'Official Channel',
    workflow: newsWorkflow('super_admin_approval'),
    currentStep: 'super_admin_approval',
  },
  {
    id: 104,
    feedItem: {
      id: 104,
      type: 'clubs',
      author: 'Debate Society',
      authorRole: 'Club',
      authorName: 'Debate Society',
      time: '3d ago',
      category: 'Club',
      categoryTag: 'amber' as TagVariant,
      title: 'Inter-College Debate Championship Registrations Open',
      summary: 'We are hosting an inter-college parliamentary debate. 12 colleges confirmed. Prize pool of ₹50,000.',
      fullContent: [
        'The Debate Society is proud to host the Unisphere Parliamentary Debate Championship 2026, our largest inter-college event to date. 12 colleges have already confirmed participation.',
        'Format: British Parliamentary. Teams of 2 students. 4 rounds of preliminary debates, followed by semi-finals and a grand final. All rounds judged by a panel of practicing lawyers and alumni.',
        'First prize: ₹25,000 and a trophy. Second prize: ₹15,000. Best Speaker award: ₹10,000. Registration deadline is January 8, 2026. Internal selections for our university team will be held on January 3rd.',
      ],
      image: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
      eventDetails: {
        date: 'January 15, 2026',
        time: '9:00 AM – 6:00 PM',
        location: 'Main Auditorium',
        seats: 120,
        registerLabel: 'Register Your Team',
      },
      likes: 0,
      comments: 0,
      saved: false,
      liked: false,
    },
    status: 'pending',
    submittedAt: '3 days ago',
    submittedBy: 'Ananya Singh',
    submittedByRole: 'Club Secretary · Arts 4th Year',
    workflow: clubWorkflow('club_verification'),
    currentStep: 'club_verification',
  },
];
