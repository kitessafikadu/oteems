import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma, UserRole } from '../../generated/prisma/client';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';

import { CreateDepartmentDto } from './dto/create-department.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { AssignDepartmentManagerDto } from './dto/assign-department-manager.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // USER MANAGEMENT

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

    // Check username
    const existingUser = await this.prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    // Check employee email
    const existingEmployee = await this.prisma.employee.findUnique({
      where: {
        email,
      },
    });

    if (existingEmployee) {
      throw new ConflictException('An employee with this email already exists');
    }

    // Check department
    const department = await this.prisma.department.findUnique({
      where: {
        id: departmentId,
      },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Create employee and user atomically
    const result = await this.prisma.$transaction(async (tx) => {
      const employeeId = await this.generateEmployeeId(tx, role);

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

  // DEPARTMENT MANAGEMENT

  async createDepartment(createDepartmentDto: CreateDepartmentDto) {
    const { name, managerId } = createDepartmentDto;

    const existingDepartment = await this.prisma.department.findUnique({
      where: {
        name,
      },
    });

    if (existingDepartment) {
      throw new ConflictException('Department with this name already exists');
    }

    if (managerId) {
      const manager = await this.prisma.employee.findUnique({
        where: {
          id: managerId,
        },
      });

      if (!manager) {
        throw new NotFoundException('Manager employee not found');
      }

      if (manager.status !== 'ACTIVE') {
        throw new BadRequestException(
          'Only active employees can be assigned as department managers',
        );
      }

      const existingManagedDepartment = await this.prisma.department.findUnique(
        {
          where: {
            managerId,
          },
        },
      );

      if (existingManagedDepartment) {
        throw new ConflictException(
          'This employee is already a manager of another department',
        );
      }
    }

    return this.prisma.department.create({
      data: {
        name,
        managerId: managerId ?? null,
      },

      select: {
        id: true,
        name: true,
        managerId: true,
        createdAt: true,
        updatedAt: true,

        manager: {
          select: {
            id: true,
            employeeId: true,
            fullName: true,
            email: true,
            position: true,
          },
        },
      },
    });
  }

  async findAllDepartments() {
    return this.prisma.department.findMany({
      select: {
        id: true,
        name: true,
        managerId: true,
        createdAt: true,
        updatedAt: true,

        manager: {
          select: {
            id: true,
            employeeId: true,
            fullName: true,
            email: true,
            position: true,
          },
        },

        _count: {
          select: {
            employees: true,
          },
        },
      },

      orderBy: {
        name: 'asc',
      },
    });
  }

  async findDepartmentById(id: string) {
    const department = await this.prisma.department.findUnique({
      where: {
        id,
      },

      select: {
        id: true,
        name: true,
        managerId: true,
        createdAt: true,
        updatedAt: true,

        manager: {
          select: {
            id: true,
            employeeId: true,
            fullName: true,
            email: true,
            position: true,
          },
        },

        employees: {
          select: {
            id: true,
            employeeId: true,
            fullName: true,
            email: true,
            phone: true,
            position: true,
            hireDate: true,
            status: true,
          },

          orderBy: {
            fullName: 'asc',
          },
        },
      },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return department;
  }

  async updateDepartment(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    const department = await this.prisma.department.findUnique({
      where: {
        id,
      },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    if (updateDepartmentDto.name) {
      const existingDepartment = await this.prisma.department.findFirst({
        where: {
          name: updateDepartmentDto.name,
          NOT: {
            id,
          },
        },
      });

      if (existingDepartment) {
        throw new ConflictException('Department name already exists');
      }
    }

    return this.prisma.department.update({
      where: {
        id,
      },

      data: {
        ...(updateDepartmentDto.name && {
          name: updateDepartmentDto.name,
        }),
      },

      select: {
        id: true,
        name: true,
        managerId: true,
        createdAt: true,
        updatedAt: true,

        manager: {
          select: {
            id: true,
            employeeId: true,
            fullName: true,
            email: true,
            position: true,
          },
        },

        _count: {
          select: {
            employees: true,
          },
        },
      },
    });
  }

  async assignDepartmentManager(
    departmentId: string,
    assignDepartmentManagerDto: AssignDepartmentManagerDto,
  ) {
    const { managerId } = assignDepartmentManagerDto;

    const department = await this.prisma.department.findUnique({
      where: {
        id: departmentId,
      },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    const manager = await this.prisma.employee.findUnique({
      where: {
        id: managerId,
      },
      select: {
        id: true,
        employeeId: true,
        fullName: true,
        email: true,
        position: true,
        status: true,
        user: {
          select: {
            id: true,
            role: true,
          },
        },
      },
    });

    if (!manager) {
      throw new NotFoundException('Employee not found');
    }

    if (manager.status !== 'ACTIVE') {
      throw new BadRequestException(
        'Only active employees can be assigned as department managers',
      );
    }

    const existingManagedDepartment = await this.prisma.department.findFirst({
      where: {
        managerId,
        NOT: {
          id: departmentId,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (existingManagedDepartment) {
      throw new ConflictException(
        `This employee is already managing the ${existingManagedDepartment.name} department`,
      );
    }

    const updatedDepartment = await this.prisma.$transaction(async (tx) => {
      const department = await tx.department.update({
        where: {
          id: departmentId,
        },
        data: {
          managerId,
        },
        select: {
          id: true,
          name: true,
          managerId: true,
          createdAt: true,
          updatedAt: true,
          manager: {
            select: {
              id: true,
              employeeId: true,
              fullName: true,
              email: true,
              position: true,
              status: true,
              user: {
                select: {
                  id: true,
                  username: true,
                  role: true,
                  isActive: true,
                },
              },
            },
          },
        },
      });

      // If the employee has an account, make sure
      // their role reflects their new responsibility.
      if (manager.user) {
        await tx.user.update({
          where: {
            id: manager.user.id,
          },
          data: {
            role: UserRole.DEPARTMENT_MANAGER,
          },
        });
      }

      return department;
    });

    return {
      message: 'Department manager assigned successfully',
      department: updatedDepartment,
    };
  }

  async removeDepartmentManager(departmentId: string) {
    const department = await this.prisma.department.findUnique({
      where: {
        id: departmentId,
      },
      select: {
        id: true,
        name: true,
        managerId: true,
        manager: {
          select: {
            id: true,
            employeeId: true,
            fullName: true,
            user: {
              select: {
                id: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    if (!department.managerId) {
      throw new BadRequestException('This department does not have a manager');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedDepartment = await tx.department.update({
        where: {
          id: departmentId,
        },
        data: {
          managerId: null,
        },
        select: {
          id: true,
          name: true,
          managerId: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Do not automatically downgrade the user's role here.
      // The role should be explicitly managed by an administrator.
      return {
        message: 'Department manager removed successfully',
        department: updatedDepartment,
      };
    });
  }

  // ============================================================
  // EMPLOYEE ID GENERATION
  // ============================================================

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
