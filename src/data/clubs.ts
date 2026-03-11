export type TagVariant = 'blue' | 'violet' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'default';

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

export const clubs: Club[] = [
  {
    id: 1,
    name: 'Developer Society',
    tagline: 'Build. Ship. Learn.',
    description:
      'The premier technical community on campus. We run weekly hackathons, coding workshops, open-source sprints, and connect students to the tech industry through talks and mentorship programs.',
    category: 'Tech',
    categoryTag: 'blue',
    members: '1.2k',
    founded: '2015',
    type: 'Technical Club',
    color: 'from-blue-600 via-indigo-600 to-violet-700',
    heroImage:
      'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
    logoImage:
      'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=160',
    recommended: true,
    posts: [
      {
        id: 101,
        title: 'HackCampus 2025 — Registrations Open!',
        summary:
          '48-hour hackathon with ₹5L prize pool. Build products that solve real campus problems. Open to all students.',
        image:
          'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
        time: '2d ago',
        likes: 512,
        comments: 87,
      },
      {
        id: 102,
        title: 'React Workshop Series — Season 3',
        summary:
          'Six-week hands-on workshop covering React, TypeScript, and modern frontend tooling. Seats are limited.',
        image:
          'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=800',
        time: '5d ago',
        likes: 284,
        comments: 41,
      },
      {
        id: 103,
        title: 'Open Source Day — Contribute & Win',
        summary:
          'Contribute to open-source projects, earn badges, and get featured on our leaderboard. November 30th, 10AM.',
        image:
          'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=800',
        time: '1w ago',
        likes: 196,
        comments: 23,
      },
    ],
  },
  {
    id: 2,
    name: 'Robotics & AI Club',
    tagline: 'Engineering Tomorrow',
    description:
      'We design, build, and program intelligent systems — from autonomous drones to robotic arms. Our members compete in national robotics championships and publish research on machine learning.',
    category: 'Tech',
    categoryTag: 'violet',
    members: '840',
    founded: '2017',
    type: 'Technical Club',
    color: 'from-violet-600 via-purple-600 to-indigo-700',
    heroImage:
      'https://images.pexels.com/photos/2085831/pexels-photo-2085831.jpeg?auto=compress&cs=tinysrgb&w=800',
    logoImage:
      'https://images.pexels.com/photos/2085831/pexels-photo-2085831.jpeg?auto=compress&cs=tinysrgb&w=160',
    recommended: true,
    posts: [
      {
        id: 201,
        title: 'RoboWars 2025 — We Won Gold!',
        summary:
          'Our combat robot "Shockwave" took home the gold at the National Robotics Championship. Incredible teamwork!',
        image:
          'https://images.pexels.com/photos/2085831/pexels-photo-2085831.jpeg?auto=compress&cs=tinysrgb&w=800',
        time: '3d ago',
        likes: 743,
        comments: 112,
      },
      {
        id: 202,
        title: 'Drone Workshop — Fly Your First UAV',
        summary:
          'A beginner-friendly drone building and flying session. Components provided. No prior experience needed.',
        image:
          'https://images.pexels.com/photos/442587/pexels-photo-442587.jpeg?auto=compress&cs=tinysrgb&w=800',
        time: '6d ago',
        likes: 189,
        comments: 34,
      },
    ],
  },
  {
    id: 3,
    name: 'Photography Guild',
    tagline: 'Capture Every Moment',
    description:
      'A community for photographers of all skill levels. We host photo walks, portfolio reviews, editing masterclasses, and an annual exhibition to showcase student talent on campus.',
    category: 'Arts',
    categoryTag: 'amber',
    members: '530',
    founded: '2013',
    type: 'Cultural Club',
    color: 'from-amber-500 via-orange-500 to-rose-600',
    heroImage:
      'https://images.pexels.com/photos/1264210/pexels-photo-1264210.jpeg?auto=compress&cs=tinysrgb&w=800',
    logoImage:
      'https://images.pexels.com/photos/1264210/pexels-photo-1264210.jpeg?auto=compress&cs=tinysrgb&w=160',
    recommended: true,
    posts: [
      {
        id: 301,
        title: 'Annual Campus Photo Walk — This Weekend',
        summary:
          'Join us for a guided photo walk across the most scenic spots on campus. Phones welcome. Golden hour starts at 5:30 PM.',
        image:
          'https://images.pexels.com/photos/1264210/pexels-photo-1264210.jpeg?auto=compress&cs=tinysrgb&w=800',
        time: '1d ago',
        likes: 321,
        comments: 45,
      },
      {
        id: 302,
        title: 'Lightroom Masterclass with Pro Photographer',
        summary:
          'Guest session by award-winning photographer Nikhil Sharma. Learn advanced colour grading and retouching.',
        image:
          'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
        time: '4d ago',
        likes: 178,
        comments: 29,
      },
    ],
  },
  {
    id: 4,
    name: 'Debate Society',
    tagline: 'Think. Argue. Lead.',
    description:
      'We sharpen critical thinking through competitive debate, Model UN simulations, and public speaking workshops. Past members have won nationals and spoken at TEDx.',
    category: 'Culture',
    categoryTag: 'emerald',
    members: '410',
    founded: '2010',
    type: 'Literary Club',
    color: 'from-emerald-500 via-teal-500 to-cyan-600',
    heroImage:
      'https://images.pexels.com/photos/3184416/pexels-photo-3184416.jpeg?auto=compress&cs=tinysrgb&w=800',
    logoImage:
      'https://images.pexels.com/photos/3184416/pexels-photo-3184416.jpeg?auto=compress&cs=tinysrgb&w=160',
    recommended: false,
    posts: [
      {
        id: 401,
        title: 'Inter-College Debate Championship — We Qualified!',
        summary:
          'Our team qualified for the national inter-college debate tournament. Finals are on December 12th in Delhi.',
        image:
          'https://images.pexels.com/photos/3184416/pexels-photo-3184416.jpeg?auto=compress&cs=tinysrgb&w=800',
        time: '2d ago',
        likes: 267,
        comments: 38,
      },
      {
        id: 402,
        title: 'MUN 2025 — Registrations Closing Soon',
        summary:
          'Model United Nations conference hosted on campus. 400+ delegates expected. Apply before December 5th.',
        image:
          'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
        time: '5d ago',
        likes: 203,
        comments: 51,
      },
    ],
  },
  {
    id: 5,
    name: 'Finance & Invest Club',
    tagline: 'Grow Your Wealth IQ',
    description:
      'We decode markets, pitch stocks, and simulate investment portfolios. Our members have interned at top finance firms and started their own trading ventures.',
    category: 'Business',
    categoryTag: 'cyan',
    members: '670',
    founded: '2018',
    type: 'Professional Club',
    color: 'from-cyan-500 via-sky-500 to-blue-600',
    heroImage:
      'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=800',
    logoImage:
      'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=160',
    recommended: true,
    posts: [
      {
        id: 501,
        title: 'Stock Pitch Competition — December Edition',
        summary:
          'Present your best trade idea to a panel of industry mentors. Top picks win cash prizes and internship referrals.',
        image:
          'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=800',
        time: '3d ago',
        likes: 384,
        comments: 62,
      },
    ],
  },
  {
    id: 6,
    name: 'Basketball Association',
    tagline: 'Play Hard, Win Together',
    description:
      'Home to campus basketball — from intramural leagues to inter-university tournaments. We welcome all skill levels and run daily practice sessions at the main court.',
    category: 'Sports',
    categoryTag: 'rose',
    members: '380',
    founded: '2012',
    type: 'Sports Club',
    color: 'from-rose-500 via-orange-500 to-amber-500',
    heroImage:
      'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg?auto=compress&cs=tinysrgb&w=800',
    logoImage:
      'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg?auto=compress&cs=tinysrgb&w=160',
    recommended: false,
    posts: [
      {
        id: 601,
        title: 'Intramural League Season 4 — Starts Monday',
        summary:
          'Register your team by Sunday night. 5-on-5 format, double elimination bracket. Season runs for 6 weeks.',
        image:
          'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg?auto=compress&cs=tinysrgb&w=800',
        time: '1d ago',
        likes: 178,
        comments: 33,
      },
    ],
  },
  {
    id: 7,
    name: 'E-Sports League',
    tagline: 'Level Up Your Game',
    description:
      'Competitive gaming for everyone. We run VALORANT, FIFA, BGMI, and Chess tournaments with prize pools, weekly scrimmages, and a dedicated gaming lab on campus.',
    category: 'Sports',
    categoryTag: 'emerald',
    members: '950',
    founded: '2019',
    type: 'Sports Club',
    color: 'from-emerald-500 via-teal-600 to-cyan-700',
    heroImage:
      'https://images.pexels.com/photos/7915357/pexels-photo-7915357.jpeg?auto=compress&cs=tinysrgb&w=800',
    logoImage:
      'https://images.pexels.com/photos/7915357/pexels-photo-7915357.jpeg?auto=compress&cs=tinysrgb&w=160',
    recommended: true,
    posts: [
      {
        id: 701,
        title: 'VALORANT Campus Cup — Season 5',
        summary:
          '5v5 tournament, 32 teams. Qualifier rounds this weekend. Solo registrations available — we will team you up.',
        image:
          'https://images.pexels.com/photos/7915357/pexels-photo-7915357.jpeg?auto=compress&cs=tinysrgb&w=800',
        time: '1d ago',
        likes: 621,
        comments: 98,
      },
      {
        id: 702,
        title: 'New Gaming Lab Inaugurated — 40 Seats',
        summary:
          'Our brand-new air-conditioned gaming lab is open 24/7 for members. Fully equipped with high-refresh-rate monitors.',
        image:
          'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
        time: '1w ago',
        likes: 489,
        comments: 76,
      },
    ],
  },
  {
    id: 8,
    name: 'Fine Arts Society',
    tagline: 'Art Lives Here',
    description:
      'Painting, sculpture, murals, and mixed media — our society is a safe space for artists to create, collaborate, and exhibit. We host the campus annual art exhibition every March.',
    category: 'Arts',
    categoryTag: 'rose',
    members: '310',
    founded: '2011',
    type: 'Cultural Club',
    color: 'from-rose-500 via-pink-500 to-fuchsia-600',
    heroImage:
      'https://images.pexels.com/photos/1585325/pexels-photo-1585325.jpeg?auto=compress&cs=tinysrgb&w=800',
    logoImage:
      'https://images.pexels.com/photos/1585325/pexels-photo-1585325.jpeg?auto=compress&cs=tinysrgb&w=160',
    recommended: false,
    posts: [
      {
        id: 801,
        title: 'Annual Art Exhibition — "Roots & Wings"',
        summary:
          'Our theme this year explores identity, origin, and freedom. Submissions open. Show opens March 15th.',
        image:
          'https://images.pexels.com/photos/1585325/pexels-photo-1585325.jpeg?auto=compress&cs=tinysrgb&w=800',
        time: '3d ago',
        likes: 244,
        comments: 40,
      },
    ],
  },
  {
    id: 9,
    name: 'Environment Club',
    tagline: 'For a Greener Tomorrow',
    description:
      'We run sustainability drives, tree plantation events, campus clean-up campaigns, and host workshops on climate action. Affiliated with the UN Environment Programme youth chapter.',
    category: 'Science',
    categoryTag: 'emerald',
    members: '290',
    founded: '2016',
    type: 'Social Club',
    color: 'from-green-500 via-emerald-600 to-teal-700',
    heroImage:
      'https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg?auto=compress&cs=tinysrgb&w=800',
    logoImage:
      'https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg?auto=compress&cs=tinysrgb&w=160',
    recommended: false,
    posts: [
      {
        id: 901,
        title: 'Plant 500 Trees This Weekend',
        summary:
          'Join our quarterly plantation drive in the campus arboretum. Gloves and tools provided. All volunteers welcome.',
        image:
          'https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg?auto=compress&cs=tinysrgb&w=800',
        time: '2d ago',
        likes: 156,
        comments: 28,
      },
    ],
  },
  {
    id: 10,
    name: 'Music Society',
    tagline: 'Feel the Rhythm',
    description:
      'From classical to EDM, our society celebrates every genre. We organise open mics, studio recording sessions, inter-college band competitions, and the beloved annual music fest.',
    category: 'Culture',
    categoryTag: 'violet',
    members: '720',
    founded: '2014',
    type: 'Cultural Club',
    color: 'from-violet-500 via-purple-600 to-blue-600',
    heroImage:
      'https://images.pexels.com/photos/164697/pexels-photo-164697.jpeg?auto=compress&cs=tinysrgb&w=800',
    logoImage:
      'https://images.pexels.com/photos/164697/pexels-photo-164697.jpeg?auto=compress&cs=tinysrgb&w=160',
    recommended: true,
    posts: [
      {
        id: 1001,
        title: 'Unisphere Fest 2025 — Lineup Announced',
        summary:
          'Our annual music festival returns with 12 acts, two stages, and a surprise headliner. Free entry for all students.',
        image:
          'https://images.pexels.com/photos/164697/pexels-photo-164697.jpeg?auto=compress&cs=tinysrgb&w=800',
        time: '1d ago',
        likes: 934,
        comments: 143,
      },
      {
        id: 1002,
        title: 'Open Mic Night — Every Thursday',
        summary:
          'Perform originals or covers in a supportive, intimate setting. Sign up at the student centre or DM us.',
        image:
          'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
        time: '4d ago',
        likes: 412,
        comments: 67,
      },
    ],
  },
];

export const categories = ['All', 'Tech', 'Arts', 'Sports', 'Science', 'Culture', 'Business'];
