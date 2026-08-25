import { ForbiddenException, Injectable } from '@nestjs/common';

import { UserRole } from '../../generated/prisma/client';

import { PrismaService } from '../prisma/prisma.service';

export interface AuthenticatedUser {
  id: string;
  role: UserRole;
  employeeId?: string | null;
}

@Injectable()
export class EmployeeAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async canViewEmployees(user: AuthenticatedUser): Promise<string | null> {
    // Admin and HR can see all employees.
    if (user.role === UserRole.ADMIN || user.role === UserRole.HR_USER) {
      return null;
    }

    // Department manager can only see employees
    // belonging to their department.
    if (user.role === UserRole.DEPARTMENT_MANAGER) {
      if (!user.employeeId) {
        throw new ForbiddenException(
          'Department manager is not linked to an employee',
        );
      }

      const department = await this.prisma.department.findFirst({
        where: {
          managerId: user.employeeId,
        },
        select: {
          id: true,
        },
      });

      if (!department) {
        throw new ForbiddenException(
          'Department manager is not assigned to a department',
        );
      }

      return department.id;
    }

    throw new ForbiddenException(
      'You do not have permission to view employees',
    );
  }

  async canViewEmployee(
    user: AuthenticatedUser,
    employeeId: string,
  ): Promise<void> {
    // Admin and HR can view any employee.
    if (user.role === UserRole.ADMIN || user.role === UserRole.HR_USER) {
      return;
    }

    const employee = await this.prisma.employee.findUnique({
      where: {
        id: employeeId,
      },
      select: {
        id: true,
        departmentId: true,
      },
    });

    if (!employee) {
      throw new ForbiddenException(
        'You do not have permission to view this employee',
      );
    }

    // Employee can only view their own employee record.
    if (user.role === UserRole.EMPLOYEE) {
      if (!user.employeeId || user.employeeId !== employee.id) {
        throw new ForbiddenException('You can only view your own profile');
      }

      return;
    }

    // Department manager can only view employees
    // in their own department.
    if (user.role === UserRole.DEPARTMENT_MANAGER) {
      if (!user.employeeId) {
        throw new ForbiddenException(
          'Department manager is not linked to an employee',
        );
      }

      const department = await this.prisma.department.findFirst({
        where: {
          managerId: user.employeeId,
        },
        select: {
          id: true,
        },
      });

      if (!department) {
        throw new ForbiddenException(
          'Department manager is not assigned to a department',
        );
      }

      if (employee.departmentId !== department.id) {
        throw new ForbiddenException(
          'You can only view employees in your department',
        );
      }

      return;
    }

    throw new ForbiddenException(
      'You do not have permission to view this employee',
    );
  }
}
