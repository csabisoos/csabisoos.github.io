export interface SocialProfile {
  name: string;
  url: string;
  icon: 'github' | 'linkedin' | 'instagram' | 'scholar' | 'orcid' | 'x' | 'email' | 'link';
}

export interface Profile {
  name: string;
  title: string;
  affiliation: string;
  shortBio: string;
  location: string;
  focusAreas: string[];
  contact: {
    email: string;
    cvPath: string;
  };
  socialProfiles: SocialProfile[];
}
