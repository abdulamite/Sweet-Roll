import { db } from '../db';
import { schools, schoolAddress, schoolOwner } from '../db/schema';
import {
  OnboardingFormDataSchool as School,
  SCHOOL_ONBOARDING_STATUS,
} from '../models/school';

export const createNewSchool = async (
  schoolData: Omit<School, 'id'>
): Promise<School> => {
  const schoolInputIsValid = validateSchoolData(schoolData);
  if (schoolInputIsValid.length > 0) {
    throw new Error(`Invalid school data: ${schoolInputIsValid.join(', ')}`);
  }

  const schoolInput = {
    name: schoolData.name,
    phone: schoolData.phone,
    website: schoolData.website,
    logo: schoolData.logo,
    supportEmail: schoolData.supportEmail,
    onboardingStatus: SCHOOL_ONBOARDING_STATUS.PENDING,
  };

  const [newSchool] = await db.insert(schools).values(schoolInput).returning();
  const [newSchoolAddress] = await db
    .insert(schoolAddress)
    .values({
      street: schoolData.address.street,
      street2: schoolData.address.street2,
      city: schoolData.address.city,
      state: schoolData.address.state,
      zipCode: schoolData.address.zipCode,
      schoolId: newSchool.id,
    })
    .returning();

  // Create school owner entry
  const [newSchoolOwner] = await db
    .insert(schoolOwner)
    .values({
      schoolId: newSchool.id,
      name: schoolData.businessOwnerInformation.name,
      email: schoolData.businessOwnerInformation.email,
      phone: schoolData.businessOwnerInformation.phone,
    })
    .returning();

  if (!newSchoolAddress || !newSchool || !newSchoolOwner) {
    throw new Error('Failed to create school');
  }

  return {
    id: newSchool.id,
    name: newSchool.name ?? '',
    phone: newSchool.phone ?? '',
    logo: newSchool.logo ?? '',
    website: newSchool.website ?? '',
    supportEmail: newSchool.supportEmail ?? '',
    onboardingStatus: newSchool.onboardingStatus ?? 'pending',
    businessOwnerInformation: schoolData.businessOwnerInformation ?? {
      name: '',
      email: '',
      phone: '',
    },
    address: newSchoolAddress
      ? {
          street: newSchoolAddress.street ?? '',
          street2: newSchoolAddress.street2 ?? '',
          city: newSchoolAddress.city ?? '',
          state: newSchoolAddress.state ?? '',
          zipCode: newSchoolAddress.zipCode ?? '',
        }
      : {
          street: '',
          street2: '',
          city: '',
          state: '',
          zipCode: '',
        },
  };
};

const validateSchoolData = (schoolData: Omit<School, 'id'>) => {
  const errors: string[] = [];
  if (!schoolData.name) {
    errors.push('School name is required.');
  }
  if (!schoolData.phone) {
    errors.push('School phone is required.');
  }
  if (!schoolData.website) {
    errors.push('School website is required.');
  }
  if (!schoolData.logo) {
    errors.push('School logo is required.');
  }
  if (!schoolData.supportEmail) {
    errors.push('School support email is required.');
  }
  return errors;
};
