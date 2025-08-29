import { inArray } from 'drizzle-orm';
import { db } from '../db';
import { schools, schoolAddress, schoolOwner } from '../db/schema';
import {
  SchoolBase,
  OnboardingFormDataSchool as School,
  SCHOOL_ONBOARDING_STATUS,
} from '../models/school';

export class SchoolRepo {
  static async findByIds(ids: number[]): Promise<SchoolBase[]> {
    if (!Array.isArray(ids) || ids.length === 0) return [];

    const results = await db
      .select()
      .from(schools)
      .where(inArray(schools.id, ids))
      .execute();

    // Map DB results to SchoolBase[]
    return results.map(row => ({
      id: row.id,
      name: row.name ?? '',
      phone: row.phone ?? '',
      website: row.website ?? '',
      logo: row.logo ?? null,
      supportEmail: row.supportEmail ?? '',
      onboardingStatus: (row.onboardingStatus ?? 'pending') as
        | 'pending'
        | 'completed'
        | 'in_progress',
    }));
  }
}

export const createNewSchool = async (
  schoolData: Omit<School, 'id'>
): Promise<School> => {
  const schoolInputIsValid = validateSchoolData(schoolData);
  if (schoolInputIsValid.length > 0) {
    throw new Error(`Invalid school data: ${schoolInputIsValid.join(', ')}`);
  }

  return await db.transaction(async tx => {
    const schoolInput = {
      name: schoolData.name,
      phone: schoolData.phone,
      website: schoolData.website,
      logo: null,
      supportEmail: schoolData.supportEmail,
      onboardingStatus: SCHOOL_ONBOARDING_STATUS.PENDING,
    };

    // Create school within transaction
    const [newSchool] = await tx
      .insert(schools)
      .values(schoolInput)
      .returning();

    // Create school address within same transaction
    const [newSchoolAddress] = await tx
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

    // Create school owner entry within same transaction
    const [newSchoolOwner] = await tx
      .insert(schoolOwner)
      .values({
        schoolId: newSchool.id,
        name: schoolData.businessOwnerInformation.name,
        email: schoolData.businessOwnerInformation.email,
        phone: schoolData.businessOwnerInformation.phone,
      })
      .returning();

    // Validate all operations succeeded
    if (!newSchoolAddress || !newSchool || !newSchoolOwner) {
      throw new Error(
        'Failed to create school - one or more operations failed'
      );
    }

    return {
      id: newSchool.id,
      name: newSchool.name ?? '',
      phone: newSchool.phone ?? '',
      logo: null,
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
      createdAt: newSchool.createdAt ?? new Date(),
      updatedAt: newSchool.updatedAt ?? new Date(),
      deletedAt: newSchool.deletedAt ?? new Date(),
    };
  });
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
  if (!schoolData.supportEmail) {
    errors.push('School support email is required.');
  }
  return errors;
};
