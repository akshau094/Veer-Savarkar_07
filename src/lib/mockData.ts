export interface CompanyDrive {
  id: string;
  name: string;
  role: string;
  package: string;
  criteria: {
    minCgpa: number;
    allowedBranches: string[];
    maxBacklogs: number;
    requiredSkills: string[];
  };
}

export const mockDrives: CompanyDrive[] = [
  {
    id: '1',
    name: 'Google',
    role: 'Software Engineer',
    package: '30 LPA',
    criteria: {
      minCgpa: 8.5,
      allowedBranches: ['CSE', 'IT'],
      maxBacklogs: 0,
      requiredSkills: ['Algorithms', 'Data Structures', 'Python'],
    },
  },
  {
    id: '2',
    name: 'TCS',
    role: 'Systems Engineer',
    package: '7 LPA',
    criteria: {
      minCgpa: 7.0,
      allowedBranches: ['CSE', 'IT', 'ECE', 'MECH'],
      maxBacklogs: 2,
      requiredSkills: ['Java', 'SQL'],
    },
  },
  {
    id: '3',
    name: 'Infosys',
    role: 'Power Programmer',
    package: '9 LPA',
    criteria: {
      minCgpa: 7.5,
      allowedBranches: ['CSE', 'IT', 'ECE'],
      maxBacklogs: 1,
      requiredSkills: ['C++', 'Problem Solving'],
    },
  },
];

export interface Student {
  id: string;
  name: string;
  cgpa: number;
  branch: string;
  backlogs: number;
  skills: string[];
}

export const mockStudents: Student[] = [
  {
    id: 's1',
    name: 'Akash Kumar',
    cgpa: 8.2,
    branch: 'CSE',
    backlogs: 0,
    skills: ['React', 'Node.js', 'Python'],
  },
  {
    id: 's2',
    name: 'Priya Sharma',
    cgpa: 9.1,
    branch: 'IT',
    backlogs: 0,
    skills: ['Java', 'SQL', 'Algorithms'],
  },
  {
    id: 's3',
    name: 'Rahul Singh',
    cgpa: 7.4,
    branch: 'ECE',
    backlogs: 1,
    skills: ['C++', 'Embedded Systems'],
  },
  {
    id: 's4',
    name: 'Suresh Raina',
    cgpa: 6.5,
    branch: 'MECH',
    backlogs: 3,
    skills: ['AutoCAD', 'Thermodynamics'],
  },
];
