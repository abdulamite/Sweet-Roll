// User types
export interface User {
  id: number;
  name: string;
  email: string;
}

// School types
export interface School {
  id: number;
  name: string;
  phone: string;
  logo: string | null;
  website: string;
  supportEmail: string;
  onboardingStatus: 'pending' | 'completed' | 'in_progress';
}

export interface SchoolAddress {
  street: string;
  street2: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface SchoolOwner {
  name: string;
  email: string;
  phone: string;
}

export interface OnboardingFormData {
  name: string;
  phone: string;
  website: string;
  supportEmail: string;
  address: SchoolAddress;
  businessOwnerInformation: SchoolOwner;
}

export const SCHOOL_ONBOARDING_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  IN_PROGRESS: 'in_progress',
} as const;

// User-School relationship
export interface UserSchool {
  userId: number;
  schoolId: number;
  role: 'admin' | 'teacher' | 'parent';
  permissions: string[];
  isActive: boolean;
}
