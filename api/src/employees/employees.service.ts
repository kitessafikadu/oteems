import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma, UserRole } from '../../generated/prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import {
  AuthenticatedUser,
  EmployeeAccessService,
} from './employee-access.service';

import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { UpdateEmployeeStatusDto } from './dto/update-employee-status.dto';

@Injectable()
export class EmployeesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly employeeAccessService: EmployeeAccessService,
  ) {}

  // ============================================================
  // GET ALL EMPLOYEES
  // ============================================================

  async findAll(user: AuthenticatedUser) {
    const departmentId =
      await this.employeeAccessService.canViewEmployees(user);

    return this.prisma.employee.findMany({
      where: departmentId
        ? {
            departmentId,
          }
        : undefined,

      select: {
        id: true,
        employeeId: true,
        fullName: true,
        phone: true,
        email: true,
        position: true,
        hireDate: true,
        status: true,
        departmentId: true,
        createdAt: true,
        updatedAt: true,

        department: {
          select: {
            id: true,
            name: true,
          },
        },

        user: {
          select: {
            id: true,
            username: true,
            role: true,
            isActive: true,
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // ============================================================
  // GET EMPLOYEE BY ID
  // ============================================================

  async findOne(id: string, user: AuthenticatedUser) {
    const employee = await this.prisma.employee.findUnique({
      where: {
        id,
      },

      select: {
        id: true,
        employeeId: true,
        fullName: true,
        phone: true,
        email: true,
        position: true,
        hireDate: true,
        status: true,
        departmentId: true,
        createdAt: true,
        updatedAt: true,

        department: {
          select: {
            id: true,
            name: true,
            managerId: true,
          },
        },

        user: {
          select: {
            id: true,
            username: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    await this.employeeAccessService.canViewEmployee(user, employee.id);

    return employee;
  }

  // ============================================================
  // UPDATE EMPLOYEE
  // ADMIN + HR_USER
  // ============================================================

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    const existingEmployee = await this.prisma.employee.findUnique({
      where: {
        id,
      },
    });

    if (!existingEmployee) {
      throw new NotFoundException('Employee not found');
    }

    const { fullName, phone, email, position, hireDate, departmentId } =
      updateEmployeeDto;

    // Check email uniqueness.
    if (email) {
      const existingEmail = await this.prisma.employee.findFirst({
        where: {
          email,
          NOT: {
            id,
          },
        },
      });

      if (existingEmail) {
        throw new ConflictException(
          'An employee with this email already exists',
        );
      }
    }

    // Check department exists.
    if (departmentId) {
      const department = await this.prisma.department.findUnique({
        where: {
          id: departmentId,
        },
      });

      if (!department) {
        throw new NotFoundException('Department not found');
      }
    }

    try {
      return await this.prisma.employee.update({
        where: {
          id,
        },

        data: {
          ...(fullName !== undefined && {
            fullName,
          }),

          ...(phone !== undefined && {
            phone,
          }),

          ...(email !== undefined && {
            email,
          }),

          ...(position !== undefined && {
            position,
          }),

          ...(hireDate !== undefined && {
            hireDate: new Date(hireDate),
          }),

          ...(departmentId !== undefined && {
            departmentId,
          }),
        },

        select: {
          id: true,
          employeeId: true,
          fullName: true,
          phone: true,
          email: true,
          position: true,
          hireDate: true,
          status: true,
          departmentId: true,
          createdAt: true,
          updatedAt: true,

          department: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'An employee with this email already exists',
        );
      }

      throw error;
    }
  }

  // ============================================================
  // UPDATE EMPLOYMENT STATUS
  // ADMIN + HR_USER
  // ============================================================

  async updateStatus(
    id: string,
    updateEmployeeStatusDto: UpdateEmployeeStatusDto,
  ) {
    const employee = await this.prisma.employee.findUnique({
      where: {
        id,
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return this.prisma.employee.update({
      where: {
        id,
      },

      data: {
        status: updateEmployeeStatusDto.status,
      },

      select: {
        id: true,
        employeeId: true,
        fullName: true,
        status: true,
        updatedAt: true,
      },
    });
  }
}
