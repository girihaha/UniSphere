export interface StudentProfile {
  name: string;
  regNumber: string;
  branch: string;
  degree: string;
  year: string;
  email: string;
  cgpa: string;
  bio: string;
  avatarUrl: string;
  connections: number;
  posts: number;
  notes: number;
  clubs: number;
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

export const studentProfile: StudentProfile = {
  name: 'Fahad Kasim',
  regNumber: 'RA2211023010123',
  branch: 'Computer Science & Engineering',
  degree: 'B.Tech',
  year: '3rd Year',
  email: 'fa7078@srmist.edu.in',
  cgpa: '9.1',
  bio: 'Full-stack dev · Open source contributor · Hackathon enthusiast. Building things that matter.',
  avatarUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300',
  connections: 148,
  posts: 24,
  notes: 6,
  clubs: 5,
};

export const socialLinks: SocialLink[] = [
  {
    id: 'instagram',
    platform: 'Instagram',
    handle: '@fahad.kasim',
    url: 'instagram.com/fahad.kasim',
  },
  {
    id: 'linkedin',
    platform: 'LinkedIn',
    handle: 'linkedin.com/in/fahadkasim',
    url: 'linkedin.com/in/fahadkasim',
  },
  {
    id: 'github',
    platform: 'GitHub',
    handle: 'github.com/fahadkasim',
    url: 'github.com/fahadkasim',
  },
  {
    id: 'portfolio',
    platform: 'Portfolio',
    handle: 'fahadkasim.dev',
    url: 'fahadkasim.dev',
  },
];

export const recentConnections = [
  { id: 1, name: 'Arjun Mehta',  branch: 'CSE',  avatarUrl: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=80' },
  { id: 2, name: 'Priya Nair',   branch: 'ECE',  avatarUrl: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=80' },
  { id: 3, name: 'Sneha Kapoor', branch: 'DS',   avatarUrl: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=80' },
  { id: 4, name: 'Aditya Menon', branch: 'CSE',  avatarUrl: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=80' },
  { id: 5, name: 'Rohan Das',    branch: 'ME' },
];
