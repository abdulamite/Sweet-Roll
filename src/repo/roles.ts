import { db } from '../db';
import { userPasswords, userSessions } from '../db/schema';
import { eq } from 'drizzle-orm';
import { safeQuery, softDelete } from '../db/queryBuilder';

const roleTypeSuperAdmin = 'superadmin';
const roleTypeAdmin = 'admin';
const roleTypeTeacher = 'teacher';
const roleTypeParent = 'parent';
