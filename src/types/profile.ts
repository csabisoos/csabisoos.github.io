export interface SocialProfile {
  name: string;
  url: string;
  icon: 'github' | 'linkedin' | 'instagram' | 'email' | 'cv' | 'link';
}

export interface ExperienceEntry {
  role: string;
  organization: string;
  period: string;
  focus: string;
}

export interface EducationEntry {
  degree: string;
  institution: string;
  period: string;
  focus: string;
}

export interface Profile {
  name: string;
  title: string;
  shortBio: string;
  location: string;
  availability?: string;
  focusAreas: string[];
  techStack?: string[];
  contact: {
    email: string;
    cv: string;
  };
  socialProfiles: SocialProfile[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  featuredProject?: string;
}
