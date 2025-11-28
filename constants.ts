import { Candidate, Job } from './types';

export const MOCK_USER = {
  name: "Sarah Jenkins",
  avatar: "https://picsum.photos/seed/sarah/200/200",
  company: "TechNova Inc."
};

export const INITIAL_JOBS: Job[] = [
  {
    id: 'job-1',
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    location: 'Remote (US/EU)',
    status: 'Active',
    candidateCount: 12,
    lastUpdated: '2 hours ago',
    description: 'We are looking for a Senior Frontend Engineer with deep expertise in React and TypeScript.',
    criteria: {
      requiredSkills: ['React', 'TypeScript', 'Tailwind', 'State Management'],
      preferredSkills: ['Next.js', 'GraphQL'],
      minExperienceYears: 5,
      domain: 'SaaS',
      seniority: 'Senior'
    }
  },
  {
    id: 'job-2',
    title: 'Product Designer',
    department: 'Design',
    location: 'New York, NY',
    status: 'Active',
    candidateCount: 45,
    lastUpdated: '1 day ago',
    description: 'Seeking a creative Product Designer.',
    criteria: {
      requiredSkills: ['Figma', 'Prototyping', 'User Research'],
      preferredSkills: ['HTML/CSS', 'Motion Design'],
      minExperienceYears: 3,
      domain: 'Consumer Apps',
      seniority: 'Mid-Level'
    }
  },
  {
    id: 'job-3',
    title: 'Backend Developer (Go)',
    department: 'Engineering',
    location: 'London, UK',
    status: 'Draft',
    candidateCount: 0,
    lastUpdated: '3 days ago',
    description: '',
    criteria: {
      requiredSkills: [],
      preferredSkills: [],
      minExperienceYears: 0,
      domain: '',
      seniority: ''
    }
  }
];

export const MOCK_CANDIDATES: Candidate[] = [
  {
    id: 'c-1',
    name: "Alex Rivera",
    email: "alex.r@example.com",
    phone: "+1 555-0101",
    location: "San Francisco, CA",
    appliedDate: "2023-10-25",
    skills: ["React", "TypeScript", "Node.js", "GraphQL", "AWS", "Docker"],
    experiences: [
      {
        role: "Senior Frontend Developer",
        company: "Fintech Solutions",
        duration: "3 years",
        description: "Led the migration of legacy app to React 18. Improved performance by 40%."
      },
      {
        role: "Web Developer",
        company: "Creative Agency",
        duration: "2 years",
        description: "Built responsive websites for high-profile clients."
      }
    ],
    matchScore: 92,
    matchLevel: 'High',
    matchedSkills: ["React", "TypeScript", "Node.js", "GraphQL"],
    missingSkills: [],
    explanation: [
      "Excellent match for React and TypeScript requirements.",
      "5 years of total experience aligns with Senior seniority.",
      "Experience in Fintech is a strong domain bonus."
    ],
    status: 'New'
  },
  {
    id: 'c-2',
    name: "Jordan Lee",
    email: "j.lee@example.com",
    phone: "+1 555-0202",
    location: "Austin, TX",
    appliedDate: "2023-10-26",
    skills: ["Vue.js", "JavaScript", "Firebase", "HTML", "CSS"],
    experiences: [
      {
        role: "Frontend Developer",
        company: "StartupInc",
        duration: "2 years",
        description: "Maintained the main customer dashboard using Vue 3."
      }
    ],
    matchScore: 45,
    matchLevel: 'Low',
    matchedSkills: ["JavaScript"],
    missingSkills: ["React", "TypeScript"],
    explanation: [
      "Missing critical required skills: React, TypeScript.",
      "Experience level is lower than the Senior requirement.",
      "Stack is primarily Vue.js based."
    ],
    status: 'Rejected'
  },
  {
    id: 'c-3',
    name: "Casey Smith",
    email: "casey.s@example.com",
    phone: "+1 555-0303",
    location: "Remote",
    appliedDate: "2023-10-27",
    skills: ["React", "JavaScript", "Redux", "Webpack", "Jest"],
    experiences: [
      {
        role: "React Developer",
        company: "E-Comm Giants",
        duration: "4 years",
        description: "Specialized in checkout flow optimization and A/B testing."
      }
    ],
    matchScore: 78,
    matchLevel: 'Medium',
    matchedSkills: ["React", "Redux", "Jest"],
    missingSkills: ["TypeScript"],
    explanation: [
      "Strong React experience but missing TypeScript.",
      "Experience duration is close to target.",
      "Good domain knowledge in E-commerce."
    ],
    status: 'New'
  },
  {
    id: 'c-4',
    name: "Morgan Chen",
    email: "m.chen@example.com",
    phone: "+1 555-0404",
    location: "New York, NY",
    appliedDate: "2023-10-24",
    skills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Storybook", "Figma"],
    experiences: [
      {
        role: "Product Engineer",
        company: "DesignTool Co",
        duration: "3 years",
        description: "Bridging the gap between design and engineering using modern stack."
      },
       {
        role: "Junior Dev",
        company: "SoftHouse",
        duration: "1.5 years",
        description: "Full stack maintenance."
      }
    ],
    matchScore: 88,
    matchLevel: 'High',
    matchedSkills: ["React", "TypeScript", "Next.js", "Tailwind"],
    missingSkills: [],
    explanation: [
      "Great skill overlap including preferred skills (Next.js).",
      "Demonstrates design sensibility which is a plus.",
      "Slightly under the years of experience but quality of work is high."
    ],
    status: 'Shortlisted'
  }
];
