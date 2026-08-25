import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma } from '../../generated/prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { UpdateEmployeeStatusDto } from './dto/update-employee-status.dto';

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.employee.findMany({
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

  async findOne(id: string) {
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

    return employee;
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    await this.findOne(id);

    const { fullName, phone, email, position, hireDate, departmentId } =
      updateEmployeeDto;

    // Check email uniqueness
    if (email) {
      const existingEmployee = await this.prisma.employee.findFirst({
        where: {
          email,
          NOT: {
            id,
          },
        },
      });

      if (existingEmployee) {
        throw new ConflictException(
          'An employee with this email already exists',
        );
      }
    }

    // Check department
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

  async updateStatus(
    id: string,
    updateEmployeeStatusDto: UpdateEmployeeStatusDto,
  ) {
    await this.findOne(id);

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
