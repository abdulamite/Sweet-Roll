export interface SchoolBase {
  id: number;
  name: string;
  phone: string;
  website: string;
  logo: string | null;
  supportEmail: string;
  onboardingStatus: 'pending' | 'completed' | 'in_progress';
}

export interface OnboardingFormDataSchool {
  id: number;
  name: string;
  phone: string;
  logo: string | null;
  website: string;
  supportEmail: string;
  onboardingStatus: 'pending' | 'completed' | 'in_progress';
  address: OnboardingFormDataSchoolAddress;
  businessOwnerInformation: OnboardingFormDataBusinessOwnerInformation;
}

export interface OnboardingFormDataBusinessOwnerInformation {
  name: string;
  email: string;
  phone: string;
}

export interface OnboardingFormDataSchoolAddress {
  street: string;
  street2: string;
  city: string;
  state: string;
  zipCode: string;
}

export const SCHOOL_ONBOARDING_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  IN_PROGRESS: 'in_progress',
} as const;
