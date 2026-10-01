export const ACADEMIC_STATUS_OPTIONS = [
  'Undergraduate Student',
  'Postgraduate Student',
  'PhD Scholar',
  'Research Fellow',
  'Faculty/Professor',
  'Independent Researcher',
  'Industry Researcher',
  'Other',
] as const;

export type AcademicStatus = (typeof ACADEMIC_STATUS_OPTIONS)[number];

export const RESEARCH_DOMAINS = [
  'Computer Science',
  'Engineering',
  'Medicine',
  'Life Sciences',
  'Physics',
  'Chemistry',
  'Mathematics',
  'Social Sciences',
  'Economics',
  'Business',
  'Humanities',
  'Environmental Science',
  'Education',
  'Other',
] as const;

export type ResearchDomain = (typeof RESEARCH_DOMAINS)[number];

export const DOMAIN_SPECIALIZATIONS: Record<string, string[]> = {
  'Computer Science': [
    'Artificial Intelligence',
    'Machine Learning',
    'Computer Vision',
    'Natural Language Processing',
    'Cybersecurity',
    'Data Science',
    'IoT & Embedded Systems',
    'Robotics & Automation',
    'Bioinformatics',
    'Cloud Computing',
    'Human-Computer Interaction',
    'Quantum Computing',
  ],
  'Engineering': [
    'Signal Processing',
    'VLSI Design',
    'Thermodynamics',
    'Structural Engineering',
    'Aerospace Systems',
    'Renewable Energy',
    'Nanotechnology',
    'Mechatronics',
  ],
  'Medicine': [
    'Clinical Research',
    'Medical Imaging',
    'Immunology',
    'Epidemiology',
    'Pharmacology',
    'Genomics & Precision Medicine',
    'Neuroscience',
    'Public Health',
  ],
  'Life Sciences': [
    'Molecular Biology',
    'Cellular Biology',
    'Biochemistry',
    'Genetics',
    'Ecology & Conservation',
    'Microbiology',
  ],
  'Social Sciences': [
    'Cognitive Psychology',
    'Sociology',
    'Anthropology',
    'Political Science',
    'International Relations',
  ],
  'Economics': [
    'Econometrics',
    'Behavioral Economics',
    'Development Economics',
    'Financial Markets',
    'Macroeconomic Policy',
  ],
  'Business': [
    'Organizational Behavior',
    'Supply Chain & Operations',
    'Marketing Analytics',
    'Strategic Management',
    'FinTech',
  ],
  'Humanities': [
    'Linguistics',
    'Philosophy of Science',
    'Digital Humanities',
    'History of Ideas',
    'Ethics in Technology',
  ],
  'Other': [
    'Interdisciplinary Research',
    'Applied Methodology',
    'Policy Analysis',
  ],
};

export const EXPERIENCE_LEVELS = [
  'Beginner',
  'Intermediate',
  'Experienced',
  'Advanced',
] as const;

export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

export const PROJECT_STAGES = [
  'Idea exploration',
  'Problem identification',
  'Literature review',
  'Proposal development',
  'Methodology design',
  'Data collection',
  'Experimentation',
  'Analysis',
  'Writing',
  'Publication',
  'Completed',
] as const;

export type ProjectStage = (typeof PROJECT_STAGES)[number];

export const RESEARCH_GOAL_OPTIONS = [
  'Finding research papers',
  'Understanding research papers',
  'Literature review',
  'Finding research gaps',
  'Developing a research idea',
  'Writing a research proposal',
  'Writing a thesis/dissertation',
  'Academic writing',
  'Finding datasets',
  'Data analysis',
  'Experiment planning',
  'Citation/reference management',
  'Collaborating with researchers',
  'Learning research methodology',
] as const;

export const COMMON_RESEARCH_TOOLS = [
  'Zotero',
  'Mendeley',
  'EndNote',
  'Google Scholar',
  'Semantic Scholar',
  'Scopus',
  'Web of Science',
  'PubMed',
  'arXiv',
  'ResearchGate',
  'Overleaf',
  'Notion',
] as const;

export const COMMON_TECHNICAL_SKILLS = [
  'Python',
  'R',
  'MATLAB',
  'SQL',
  'TensorFlow',
  'PyTorch',
  'SPSS',
  'Excel',
  'LaTeX',
  'Git / GitHub',
  'Jupyter Notebooks',
  'Tableau / PowerBI',
] as const;

export const CITATION_STYLES = [
  'APA',
  'MLA',
  'IEEE',
  'Chicago',
  'Harvard',
  'Vancouver',
  'Other',
] as const;

export type CitationStyle = (typeof CITATION_STYLES)[number];

export interface BasicInformationData {
  fullName: string;
  profileImage?: string;
  email: string;
  phone?: string;
  country: string;
  state?: string;
  preferredLanguage: string;
}

export interface AcademicInformationData {
  currentStatus: AcademicStatus | string;
  highestQualification: string;
  institution: string;
  department: string;
  currentCourse?: string;
  yearOfStudy?: string;
  graduationYear?: string;
  researcherId?: string;
}

export interface ResearchInformationData {
  primaryDomain: string;
  specializations: string[];
  interests: string[];
}

export interface ResearchExperienceData {
  level: ExperienceLevel | string;
  hasWorkedOnProject: boolean;
  hasPublishedPaper: boolean;
  hasParticipatedConference: boolean;
  hasWorkedWithDatasets: boolean;
  hasWorkedWithDataAnalysisTools: boolean;
  previousProjects: string[];
  publications: string[];
  conferences: string[];
  researchLabs: string[];
}

export interface ResearchGoalsData {
  primaryGoals: string[];
  customGoal: string;
}

export interface CurrentResearchProjectData {
  hasProject: 'yes' | 'no' | 'exploring';
  title?: string;
  domain?: string;
  problemStatement?: string;
  researchObjectives?: string;
  researchQuestions?: string;
  currentStage?: ProjectStage | string;
}

export interface ResearchToolsSkillsData {
  researchTools: string[];
  technicalSkills: string[];
}

export interface ResearchPreferencesData {
  citationStyle: CitationStyle | string;
  outputFormat: string;
  language: string;
  notificationPreferences: {
    emailAlerts: boolean;
    paperRecommendations: boolean;
    collaborationInvites: boolean;
  };
}

export interface ResearcherProfileData {
  _id?: string;
  userId?: string;
  fullName: string;
  profileImage?: string;
  contact?: {
    email: string;
    phone?: string;
  };
  location?: {
    country?: string;
    state?: string;
  };
  academicInfo?: {
    currentStatus?: AcademicStatus | string;
    highestQualification?: string;
    institution?: string;
    department?: string;
    currentCourse?: string;
    yearOfStudy?: string;
    graduationYear?: string;
    researcherId?: string;
  };
  researchDomains: string[];
  researchSpecializations: string[];
  researchInterests: string[];
  researchExperience?: {
    level?: ExperienceLevel | string;
    hasWorkedOnProject?: boolean;
    hasPublishedPaper?: boolean;
    hasParticipatedConference?: boolean;
    hasWorkedWithDatasets?: boolean;
    hasWorkedWithDataAnalysisTools?: boolean;
    previousProjects?: string[];
    publications?: string[];
    conferences?: string[];
    researchLabs?: string[];
  };
  researchGoals?: {
    primaryGoals: string[];
    customGoal?: string;
  };
  currentResearchProject?: {
    hasProject: 'yes' | 'no' | 'exploring';
    title?: string;
    domain?: string;
    problemStatement?: string;
    researchObjectives?: string;
    researchQuestions?: string;
    currentStage?: ProjectStage | string;
  };
  researchTools: string[];
  technicalSkills: string[];
  preferences?: {
    citationStyle?: CitationStyle | string;
    outputFormat?: string;
    language?: string;
    notificationPreferences?: {
      emailAlerts?: boolean;
      paperRecommendations?: boolean;
      collaborationInvites?: boolean;
    };
  };
  onboardingCompleted: boolean;
  onboardingStep: number;
  createdAt?: string;
  updatedAt?: string;
}
