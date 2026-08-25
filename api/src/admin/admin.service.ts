import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma, UserRole } from '../../generated/prisma/client';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(createUserDto: CreateUserDto) {
    const {
      username,
      password,
      role,
      fullName,
      phone,
      email,
      position,
      hireDate,
      departmentId,
      isActive = true,
    } = createUserDto;

    // Check if username already exists
    const existingUser = await this.prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    // Check if employee email already exists
    const existingEmployee = await this.prisma.employee.findUnique({
      where: {
        email,
      },
    });

    if (existingEmployee) {
      throw new ConflictException('An employee with this email already exists');
    }

    // Check if department exists
    const department = await this.prisma.department.findUnique({
      where: {
        id: departmentId,
      },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create employee and user in one transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Generate role-based employee ID
      const employeeId = await this.generateEmployeeId(tx, role);

      // Create employee
      const employee = await tx.employee.create({
        data: {
          employeeId,
          fullName,
          phone,
          email,
          position,
          hireDate: new Date(hireDate),
          departmentId,
          status: 'ACTIVE',
        },
      });

      // Create user account
      const user = await tx.user.create({
        data: {
          username,
          passwordHash,
          role,
          isActive,
          employeeId: employee.id,
        },
        select: {
          id: true,
          username: true,
          role: true,
          employeeId: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return {
        employee,
        user,
      };
    });

    return {
      message: 'User account created successfully',

      user: {
        id: result.user.id,
        username: result.user.username,
        role: result.user.role,
        employeeId: result.employee.employeeId,
        isActive: result.user.isActive,
        createdAt: result.user.createdAt,
        updatedAt: result.user.updatedAt,
      },

      employee: {
        id: result.employee.id,
        employeeId: result.employee.employeeId,
        fullName: result.employee.fullName,
        email: result.employee.email,
        phone: result.employee.phone,
        position: result.employee.position,
        departmentId: result.employee.departmentId,
        hireDate: result.employee.hireDate,
        status: result.employee.status,
      },
    };
  }

  async findAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        employeeId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        employee: {
          select: {
            employeeId: true,
            fullName: true,
            email: true,
            phone: true,
            position: true,
            departmentId: true,
            hireDate: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        username: true,
        role: true,
        employeeId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        employee: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    await this.findUserById(id);

    // If employeeId is provided, verify employee exists
    if (updateUserDto.employeeId) {
      const employee = await this.prisma.employee.findUnique({
        where: {
          id: updateUserDto.employeeId,
        },
      });

      if (!employee) {
        throw new NotFoundException('Employee not found');
      }
    }

    return this.prisma.user.update({
      where: {
        id,
      },
      data: updateUserDto,
      select: {
        id: true,
        username: true,
        role: true,
        employeeId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async deactivateUser(id: string) {
    await this.findUserById(id);

    return this.prisma.user.update({
      where: {
        id,
      },
      data: {
        isActive: false,
      },
      select: {
        id: true,
        username: true,
        role: true,
        employeeId: true,
        isActive: true,
      },
    });
  }

  /**
   * Generates the next employee ID for a specific role.
   *
   * Examples:
   * ADM1001
   * HR1001
   * MGR1001
   * EMP1001
   */
  private async generateEmployeeId(
    tx: Prisma.TransactionClient,
    role: UserRole,
  ): Promise<string> {
    const sequence = await tx.employeeIdSequence.update({
      where: {
        role,
      },
      data: {
        nextNumber: {
          increment: 1,
        },
      },
    });

    const number = sequence.nextNumber - 1;
    const prefix = this.getEmployeeIdPrefix(role);

    return `${prefix}${number}`;
  }

  /**
   * Returns the employee ID prefix based on the user's role.
   */
  private getEmployeeIdPrefix(role: UserRole): string {
    switch (role) {
      case UserRole.ADMIN:
        return 'ADM';

      case UserRole.HR_USER:
        return 'HR';

      case UserRole.DEPARTMENT_MANAGER:
        return 'MGR';

      case UserRole.EMPLOYEE:
      default:
        return 'EMP';
    }
  }
}
