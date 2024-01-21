import { SetMetadata } from '@nestjs/common';
import { USER_ROLE } from '../constants/roles.enum';

export const ROLES_KEY = 'user_roles';

export const Roles = (role: USER_ROLE) => SetMetadata(ROLES_KEY, role);
