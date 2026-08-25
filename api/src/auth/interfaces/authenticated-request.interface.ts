import { Request } from 'express';
import { UserRole } from '../../../generated/prisma/client';

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    username: string;
    role: UserRole;
    employeeId: string | null;
    isActive: boolean;
  };
}
