export const SRM_PROGRAM_GROUPS = [
  {
    label: 'Engineering & Technology',
    options: [
      'Computer Science & Engineering',
      'Computer Science & Engineering (AI & ML)',
      'Computer Science & Engineering (Data Science)',
      'Computer Science & Engineering (Cyber Security)',
      'Computer Science & Engineering (IoT)',
      'Information Technology',
      'Software Engineering',
      'Electronics & Communication Engineering',
      'Electrical & Electronics Engineering',
      'Electronics & Instrumentation Engineering',
      'Mechanical Engineering',
      'Mechatronics Engineering',
      'Automobile Engineering',
      'Aerospace Engineering',
      'Civil Engineering',
      'Chemical Engineering',
      'Biotechnology',
      'Biomedical Engineering',
      'Genetic Engineering',
      'Food Technology',
    ],
  },
  {
    label: 'Sciences & Computer Applications',
    options: [
      'Physics',
      'Chemistry',
      'Mathematics',
      'Statistics & Data Analytics',
      'Microbiology',
      'Biochemistry',
      'Molecular Biology & Genetics',
      'Environmental Science',
      'Computer Applications (BCA / MCA)',
      'Data Science & Analytics',
    ],
  },
  {
    label: 'Management, Commerce & Economics',
    options: [
      'Business Administration (BBA)',
      'Master of Business Administration (MBA)',
      'Commerce',
      'Accounting & Finance',
      'Economics',
      'Banking & Financial Services',
    ],
  },
  {
    label: 'Medicine & Health Sciences',
    options: [
      'Medicine (MBBS)',
      'Dental Surgery (BDS)',
      'Nursing',
      'Physiotherapy',
      'Occupational Therapy',
      'Pharmacy',
      'Pharm.D',
      'Public Health',
      'Allied Health Sciences',
      'Clinical Research',
    ],
  },
  {
    label: 'Arts, Humanities & Media',
    options: [
      'English & Communicative Studies',
      'Psychology',
      'Journalism & Mass Communication',
      'Visual Communication',
      'Film & Media Studies',
      'Liberal Arts',
      'Public Policy',
    ],
  },
  {
    label: 'Law, Architecture, Design & Hospitality',
    options: [
      'Law',
      'Architecture',
      'Interior Design',
      'Fashion Design',
      'Product Design',
      'Communication Design',
      'Hotel & Hospitality Management',
      'Culinary Arts',
    ],
  },
] as const;

export const SRM_YEAR_OPTIONS = [
  { value: '1', label: 'Year 1' },
  { value: '2', label: 'Year 2' },
  { value: '3', label: 'Year 3' },
  { value: '4', label: 'Year 4' },
  { value: '5', label: 'Year 5' },
] as const;

export function normalizeAcademicYearSelection(value?: string | number | null) {
  if (value === undefined || value === null) return '';

  const parsed = Number.parseInt(String(value), 10);
  return parsed >= 1 && parsed <= 5 ? String(parsed) : '';
}
