export interface SocialProfile {
  name: string;
  url: string;
  icon: 'github' | 'linkedin' | 'instagram' | 'scholar' | 'orcid' | 'x' | 'email' | 'link';
}

export interface Profile {
  name: string;
  title: string;
  roles: string[];
  shortBio: string;
  location: string;
  focusAreas: string[];
  statusBadge: string;
  contact: {
    email: string;
  };
  socialProfiles: SocialProfile[];
}
