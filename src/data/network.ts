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

export const connections: Connection[] = [
  {
    id: 1,
    name: 'Arjun Mehta',
    branch: 'Computer Science',
    degree: 'B.Tech',
    year: '3rd Year',
    online: true,
    mutual: 12,
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=80',
    instagram: '@arjun.mehta',
    linkedin: 'linkedin.com/in/arjunmehta',
    github: 'github.com/arjunmehta',
    portfolio: 'arjunmehta.dev',
  },
  {
    id: 2,
    name: 'Priya Nair',
    branch: 'Electronics & ECE',
    degree: 'B.Tech',
    year: '2nd Year',
    online: false,
    mutual: 8,
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=80',
    instagram: '@priya.nair',
    linkedin: 'linkedin.com/in/priyanair',
    github: 'github.com/priyanair',
  },
  {
    id: 3,
    name: 'Rohan Das',
    branch: 'Mechanical Engineering',
    degree: 'M.Tech',
    year: '1st Year',
    online: true,
    mutual: 5,
    github: 'github.com/rohandas',
    linkedin: 'linkedin.com/in/rohandas',
  },
  {
    id: 4,
    name: 'Sneha Kapoor',
    branch: 'Data Science',
    degree: 'B.Tech',
    year: '4th Year',
    online: false,
    mutual: 19,
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=80',
    instagram: '@sneha.ds',
    linkedin: 'linkedin.com/in/snehakapoor',
    github: 'github.com/snehakapoor',
    portfolio: 'snehakapoor.me',
  },
  {
    id: 5,
    name: 'Vikram Iyer',
    branch: 'Civil Engineering',
    degree: 'B.Tech',
    year: '2nd Year',
    online: true,
    mutual: 3,
    linkedin: 'linkedin.com/in/vikraminyer',
  },
  {
    id: 6,
    name: 'Meera Joshi',
    branch: 'Biotechnology',
    degree: 'B.Tech',
    year: '3rd Year',
    online: false,
    mutual: 7,
    instagram: '@meera.bio',
    linkedin: 'linkedin.com/in/meerajoshi',
    portfolio: 'meerajoshi.bio',
  },
  {
    id: 7,
    name: 'Aditya Menon',
    branch: 'Computer Science',
    degree: 'B.Tech',
    year: '3rd Year',
    online: true,
    mutual: 15,
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=80',
    instagram: '@adityamenon',
    linkedin: 'linkedin.com/in/adityamenon',
    github: 'github.com/adityamenon',
  },
  {
    id: 8,
    name: 'Kavya Reddy',
    branch: 'AI & Machine Learning',
    degree: 'M.Tech',
    year: '1st Year',
    online: false,
    mutual: 11,
    github: 'github.com/kavyareddy',
    linkedin: 'linkedin.com/in/kavyareddy',
    portfolio: 'kavyareddy.ai',
  },
  {
    id: 9,
    name: 'Siddharth Roy',
    branch: 'Information Technology',
    degree: 'B.Tech',
    year: '4th Year',
    online: true,
    mutual: 6,
    instagram: '@sid.codes',
    github: 'github.com/siddharthroy',
    linkedin: 'linkedin.com/in/siddharthroy',
  },
];

export const connectionRequests: ConnectionRequest[] = [
  {
    id: 101,
    name: 'Rahul Sharma',
    branch: 'Computer Science',
    degree: 'B.Tech',
    year: '2nd Year',
    mutual: 7,
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=80',
    message: 'Hi! I saw your project on the DevSoc showcase. Would love to connect!',
    time: '2h ago',
  },
  {
    id: 102,
    name: 'Ananya Singh',
    branch: 'Data Science',
    degree: 'B.Tech',
    year: '3rd Year',
    mutual: 13,
    time: '5h ago',
  },
  {
    id: 103,
    name: 'Farhan Khan',
    branch: 'Electronics & ECE',
    degree: 'B.Tech',
    year: '1st Year',
    mutual: 2,
    time: '1d ago',
  },
];

export const networkNotes: NetworkNote[] = [
  {
    id: 1,
    authorId: 1,
    authorName: 'Arjun Mehta',
    authorBranch: 'CSE',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=80',
    text: 'Looking for hackathon teammates — HackCampus is in 2 weeks. DM me!',
    time: '1h ago',
  },
  {
    id: 2,
    authorId: 4,
    authorName: 'Sneha Kapoor',
    authorBranch: 'Data Science',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=80',
    text: 'Anyone attending the AI workshop this Saturday? Let\'s go together!',
    time: '3h ago',
  },
  {
    id: 3,
    authorId: 3,
    authorName: 'Rohan Das',
    authorBranch: 'Mech Eng',
    text: 'Need help with DSA assignment — specifically graph traversal. Please ping.',
    time: '5h ago',
  },
  {
    id: 4,
    authorId: 7,
    authorName: 'Aditya Menon',
    authorBranch: 'CSE',
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=80',
    text: 'Free laptop stickers at the DevSoc room till 6PM today. Come grab some!',
    time: '6h ago',
  },
  {
    id: 5,
    authorId: 2,
    authorName: 'Priya Nair',
    authorBranch: 'ECE',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=80',
    text: 'Selling my Arduino starter kit — bought for lab, never used. ₹600.',
    time: '1d ago',
  },
];
